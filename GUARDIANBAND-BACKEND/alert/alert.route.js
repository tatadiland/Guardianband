import express from "express";
import { getAlerts, createAlert, markAlertRead } from "./alert.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, getAlerts);
router.post("/child/:childId", verifyToken, createAlert);
router.put("/:id/read", verifyToken, markAlertRead);

export default router;
