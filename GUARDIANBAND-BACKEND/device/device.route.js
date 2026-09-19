import express from "express";
import { getDeviceData, linkDevice } from "./device.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireOwnedChild } from "../middleware/childOwnership.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, requireOwnedChild, getDeviceData);
router.post("/child/:childId", verifyToken, requireOwnedChild, linkDevice);

export default router;
