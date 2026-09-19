import crypto from "node:crypto";
import Device from "../device/device.model.js";
import Child from "../child/child.model.js";
import Health from "../health/health.model.js";
import Location from "../location/location.model.js";
import Alert from "../alert/alert.model.js";
import Telemetry from "../telemetry/telemetry.model.js";
import { sendPushToUser } from "../notification/notification.service.js";

const LOW_BATTERY_THRESHOLD = Number(process.env.LOW_BATTERY_THRESHOLD || 20);

function invalidNumber(value, min, max) {
    return value !== undefined && (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max);
}

function eventIdFor(deviceId, payload, recordedAt) {
    if (payload.eventId) return String(payload.eventId);
    return crypto.createHash("sha256").update(JSON.stringify({
        deviceId, recordedAt, sos: payload.sos === true, tampered: payload.tampered === true,
    })).digest("hex");
}

async function createDeviceAlert({ device, child, eventId, category, severity, title, description, timestamp, latitude, longitude }) {
    const existing = await Alert.findOne({ where: { eventId } });
    if (existing) return existing;

    const alert = await Alert.create({
        childId: child.id,
        deviceId: device.id,
        eventId,
        category,
        severity,
        title,
        description,
        time: timestamp.toISOString(),
        latitude,
        longitude,
        unread: true,
    });

    await sendPushToUser(child.userId, {
        title,
        body: description,
        url: category === "Location" ? "/location" : "/alerts",
        tag: `guardianband-${eventId}`,
    });
    return alert;
}

export async function ingestTelemetry(req, res, next) {
    const payload = req.body || {};
    const device = req.device;

    if (payload.deviceId && payload.deviceId !== device.hardwareId) {
        return res.status(400).json({ message: "Payload deviceId does not match authenticated device." });
    }
    if (invalidNumber(payload.latitude, -90, 90) || invalidNumber(payload.longitude, -180, 180)) {
        return res.status(400).json({ message: "Invalid latitude or longitude." });
    }
    if (invalidNumber(payload.heartRate, 0, 300) || invalidNumber(payload.bodyTemperature, 20, 50)) {
        return res.status(400).json({ message: "Invalid health sensor value." });
    }
    if (invalidNumber(payload.battery, 0, 100)) {
        return res.status(400).json({ message: "Battery must be between 0 and 100." });
    }

    const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
    if (Number.isNaN(timestamp.getTime())) return res.status(400).json({ message: "Invalid timestamp." });

    try {
        const child = await Child.findByPk(device.childId);
        if (!child) return res.status(404).json({ message: "Device child association not found." });

        const eventId = eventIdFor(device.hardwareId, payload, timestamp.toISOString());
        const existingTelemetry = await Telemetry.findOne({ where: { eventId } });
        if (existingTelemetry) {
            return res.status(200).json({ message: "Telemetry already processed.", telemetry: existingTelemetry, duplicate: true });
        }

        const previous = { ...device.toJSON() };
        const telemetry = await Telemetry.create({
            deviceId: device.id,
            eventId,
            latitude: payload.latitude,
            longitude: payload.longitude,
            heartRate: payload.heartRate,
            bodyTemperature: payload.bodyTemperature,
            activity: payload.activity,
            acceleration: payload.acceleration,
            battery: payload.battery,
            connectivity: payload.connectivity,
            signal: payload.signal,
            tampered: payload.tampered,
            sos: payload.sos,
            recordedAt: timestamp,
        });

        const deviceUpdate = { lastSeen: timestamp, connectivity: payload.connectivity || "connected" };
        if (payload.activity !== undefined) deviceUpdate.activity = payload.activity;
        if (payload.signal !== undefined) deviceUpdate.signal = String(payload.signal);
        if (payload.battery !== undefined) deviceUpdate.battery = payload.battery;
        if (payload.tampered !== undefined) deviceUpdate.tampered = payload.tampered;
        if (payload.sos !== undefined) deviceUpdate.sos = payload.sos;
        await device.update(deviceUpdate);

        if (payload.heartRate !== undefined || payload.bodyTemperature !== undefined) {
            await Health.create({ childId: child.id, heartRate: payload.heartRate, temperature: payload.bodyTemperature, createdAt: timestamp, updatedAt: timestamp });
        }
        if (payload.latitude !== undefined && payload.longitude !== undefined) {
            await Location.create({ deviceId: device.id, latitude: payload.latitude, longitude: payload.longitude, createdAt: timestamp, updatedAt: timestamp });
        }

        const alertArgs = { device, child, timestamp, latitude: payload.latitude, longitude: payload.longitude };
        if (payload.sos === true && previous.sos !== true) {
            await createDeviceAlert({ ...alertArgs, eventId: `${eventId}:sos`, category: "Emergency", severity: "Critical", title: "SOS Alert", description: "Emergency SOS activated from GuardianBand." });
        }
        if (payload.tampered === true && previous.tampered !== true) {
            await createDeviceAlert({ ...alertArgs, eventId: `${eventId}:tamper`, category: "Safety", severity: "Critical", title: "Bracelet Tamper Alert", description: "The GuardianBand bracelet may have been removed or tampered with." });
        }
        if (payload.battery !== undefined && payload.battery <= LOW_BATTERY_THRESHOLD && (previous.battery === null || previous.battery === undefined || previous.battery > LOW_BATTERY_THRESHOLD)) {
            await createDeviceAlert({ ...alertArgs, eventId: `${eventId}:battery`, category: "Device", severity: "Warning", title: "Low Battery", description: `GuardianBand battery is at ${payload.battery}%.` });
        }

        return res.status(201).json({ message: "Telemetry accepted", telemetry, device: { id: device.id, hardwareId: device.hardwareId, childId: device.childId, lastSeen: timestamp } });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") return res.status(200).json({ message: "Telemetry already processed.", duplicate: true });
        return next(error);
    }
}

export async function getLatestTelemetry(req, res, next) {
    try {
        const device = await Device.findByPk(req.params.deviceId);
        if (!device) return res.status(404).json({ message: "Device not found." });
        const child = await Child.findByPk(device.childId);
        if (!child || child.userId !== req.user.id) return res.status(403).json({ message: "Access denied." });
        const telemetry = await Telemetry.findOne({ where: { deviceId: device.id }, order: [["recordedAt", "DESC"]] });
        if (!telemetry) return res.status(404).json({ message: "Telemetry not found." });
        return res.json(telemetry);
    } catch (error) { return next(error); }
}