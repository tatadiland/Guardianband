import Health from "./health.model.js";

export const getHealthData = async (req, res) => {
    try {
        const { childId } = req.params;
        const healthData = await Health.findAll({ where: { childId }, order: [["createdAt", "DESC"]] });
        res.json(healthData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createHealthData = async (req, res) => {
    try {
        const { childId } = req.params;
        const { heartRate, temperature } = req.body;
        const health = await Health.create({ childId, heartRate, temperature });
        res.status(201).json(health);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
