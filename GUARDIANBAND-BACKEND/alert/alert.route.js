import express from "express";
import { getAlerts, createAlert, markAlertRead } from "./alert.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireOwnedChild } from "../middleware/childOwnership.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, requireOwnedChild, getAlerts);
router.post("/child/:childId", verifyToken, requireOwnedChild, createAlert);
router.put("/:id/read", verifyToken, markAlertRead);

export default router;
