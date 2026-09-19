import Device from "./device.model.js";
import crypto from "node:crypto";

export const getDeviceData = async (req, res) => {
    try {
        const { childId } = req.params;
        const device = await Device.findOne({
            where: { childId },
            attributes: { exclude: ["apiKey"] },
        });
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }
        res.json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const linkDevice = async (req, res) => {
    try {
        const { childId } = req.params;
        const { name, hardwareId } = req.body;
        const device = await Device.create({
            childId,
            name,
            hardwareId,
            apiKey: crypto.randomBytes(32).toString("hex"),
        });
        res.status(201).json({
            message: "Device linked successfully. Store the API key securely on the device.",
            device,
            apiKey: device.apiKey,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
