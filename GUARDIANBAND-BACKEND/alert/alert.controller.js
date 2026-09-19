import Alert from "./alert.model.js";
import { sendPushToUser } from "../notification/notification.service.js";
import Child from "../child/child.model.js";

const notificationDetails = {
    Emergency: { title: "GuardianBand Emergency", url: "/alerts" },
    Location: { title: "Geofence Alert", url: "/geofencing" },
    Health: { title: "Health Alert", url: "/health" },
    Device: { title: "Device Alert", url: "/device" },
    Activity: { title: "Activity Alert", url: "/alerts" },
};

export const getAlerts = async (req, res) => {
    try {
        const { childId } = req.params;
        const alerts = await Alert.findAll({ where: { childId } });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createAlert = async (req, res) => {
    try {
        const { childId } = req.params;
        const { category, severity, title, description, time } = req.body;
        const alert = await Alert.create({
            childId,
            category,
            severity,
            title,
            description,
            time,
            unread: true,
        });

        const notification = notificationDetails[category] || notificationDetails.Activity;
        await sendPushToUser(req.user.id, {
            title: notification.title,
            body: description || title,
            url: notification.url,
            tag: `guardianband-alert-${alert.id}`,
        });

        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markAlertRead = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await Alert.findOne({
            where: { id },
            include: { model: Child, where: { userId: req.user.id }, attributes: [] },
        });
        if (alert) {
            await alert.update({ unread: false });
            return res.json({ success: true });
        }
        return res.status(404).json({ error: "Alert not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
