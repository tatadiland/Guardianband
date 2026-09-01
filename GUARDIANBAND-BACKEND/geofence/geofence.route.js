import express from "express";
import { getGeofence, createOrUpdateGeofence, deleteGeofence } from "./geofence.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, getGeofence);
router.post("/child/:childId", verifyToken, createOrUpdateGeofence);
router.put("/child/:childId", verifyToken, createOrUpdateGeofence);
router.delete("/child/:childId", verifyToken, deleteGeofence);

export default router;
