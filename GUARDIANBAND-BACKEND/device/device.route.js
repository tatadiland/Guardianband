import express from "express";
import { getDeviceData, linkDevice } from "./device.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, getDeviceData);
router.post("/child/:childId", verifyToken, linkDevice);

export default router;
