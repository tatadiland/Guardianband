import Device from "./device.model.js";

export const getDeviceData = async (req, res) => {
    try {
        const { childId } = req.params;
        const device = await Device.findOne({ where: { childId } });
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
        const device = await Device.create({ childId, name, hardwareId });
        res.status(201).json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
