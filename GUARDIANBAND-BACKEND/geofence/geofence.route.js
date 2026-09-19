import express from "express";
import { getGeofence, createOrUpdateGeofence, deleteGeofence } from "./geofence.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireOwnedChild } from "../middleware/childOwnership.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, requireOwnedChild, getGeofence);
router.post("/child/:childId", verifyToken, requireOwnedChild, createOrUpdateGeofence);
router.put("/child/:childId", verifyToken, requireOwnedChild, createOrUpdateGeofence);
router.delete("/child/:childId", verifyToken, requireOwnedChild, deleteGeofence);

export default router;
