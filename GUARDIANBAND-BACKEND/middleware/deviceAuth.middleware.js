import Device from "../device/device.model.js";

export async function verifyDevice(req, res, next) {
    const hardwareId = req.get("x-device-id") || req.body?.deviceId;
    const apiKey = req.get("x-device-key");

    if (!hardwareId || !apiKey) {
        return res.status(401).json({ message: "Device ID and device API key are required." });
    }

    try {
        const device = await Device.findOne({ where: { hardwareId, apiKey } });
        if (!device) return res.status(401).json({ message: "Invalid device credentials." });
        req.device = device;
        next();
    } catch (error) {
        next(error);
    }
}