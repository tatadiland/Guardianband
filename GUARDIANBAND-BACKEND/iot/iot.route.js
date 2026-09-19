import express from "express";
import { ingestTelemetry, getLatestTelemetry } from "./iot.controller.js";
import { verifyDevice } from "../middleware/deviceAuth.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/data", verifyDevice, ingestTelemetry);
router.get("/device/:deviceId/latest", verifyToken, getLatestTelemetry);
export default router;