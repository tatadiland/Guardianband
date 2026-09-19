import Device from "../device/device.model.js";
import Child from "../child/child.model.js";

export async function requireOwnedDevice(req, res, next) {
  try {
    const device = await Device.findByPk(req.params.deviceId);
    if (!device) return res.status(404).json({ message: "Device not found" });
    const child = await Child.findOne({ where: { id: device.childId, userId: req.user.id } });
    if (!child) return res.status(403).json({ message: "Access denied" });
    req.device = device;
    req.child = child;
    next();
  } catch (error) {
    next(error);
  }
}
