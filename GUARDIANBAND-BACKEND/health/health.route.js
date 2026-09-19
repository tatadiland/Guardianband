import express from "express";
import { getHealthData, createHealthData } from "./health.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireOwnedChild } from "../middleware/childOwnership.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, requireOwnedChild, getHealthData);
router.post("/child/:childId", verifyToken, requireOwnedChild, createHealthData);

export default router;
