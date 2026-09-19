import Child from "../child/child.model.js";

export async function findOwnedChild(userId, childId) {
  return Child.findOne({ where: { id: childId, userId } });
}

export async function requireOwnedChild(req, res, next) {
  try {
    const childId = req.params.childId || req.params.id;
    const child = await findOwnedChild(req.user.id, childId);
    if (!child) return res.status(404).json({ message: "Child profile not found" });
    req.child = child;
    next();
  } catch (error) {
    next(error);
  }
}
