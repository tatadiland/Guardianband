import Location from "./location.model.js";

export const getLocationData = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const location = await Location.findOne({ where: { deviceId }, order: [["createdAt", "DESC"]] });
        if (!location) {
            return res.status(404).json({ error: "Location not found" });
        }
        res.json(location);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { latitude, longitude } = req.body;
        const location = await Location.create({ deviceId, latitude, longitude });
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
