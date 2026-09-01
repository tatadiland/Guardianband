import Alert from "./alert.model.js";

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
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markAlertRead = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Alert.update({ unread: false }, { where: { id } });
        if (updated) {
            return res.json({ success: true });
        }
        return res.status(404).json({ error: "Alert not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
