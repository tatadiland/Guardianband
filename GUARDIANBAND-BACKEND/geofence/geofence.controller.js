import Geofence from "./geofence.model.js";

export const getGeofence = async (req, res) => {
    try {
        const { childId } = req.params;
        const geofence = await Geofence.findOne({ where: { childId } });
        if (!geofence) {
            return res.status(404).json({ message: "No geofence configured for this child" });
        }
        res.json(geofence);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const createOrUpdateGeofence = async (req, res) => {
    try {
        const { childId } = req.params;
        const { name, latitude, longitude, radius } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude and longitude are required" });
        }

        let geofence = await Geofence.findOne({ where: { childId } });

        if (geofence) {
            await geofence.update({ name, latitude, longitude, radius });
            return res.json({ message: "Geofence updated", geofence });
        } else {
            geofence = await Geofence.create({ childId, name, latitude, longitude, radius });
            return res.status(201).json({ message: "Geofence created", geofence });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteGeofence = async (req, res) => {
    try {
        const { childId } = req.params;
        const deleted = await Geofence.destroy({ where: { childId } });
        if (deleted) {
            return res.json({ message: "Geofence deleted" });
        }
        return res.status(404).json({ error: "Geofence not found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
