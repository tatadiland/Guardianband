import express from "express";
import { getLocationData, updateLocation } from "./location.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireOwnedDevice } from "../middleware/deviceOwnership.js";

const router = express.Router();

router.get("/device/:deviceId", verifyToken, requireOwnedDevice, getLocationData);
router.post("/device/:deviceId", verifyToken, requireOwnedDevice, updateLocation);

export default router;
