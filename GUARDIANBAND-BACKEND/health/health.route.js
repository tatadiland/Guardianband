import express from "express";
import { getHealthData, createHealthData } from "./health.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, getHealthData);
router.post("/child/:childId", verifyToken, createHealthData);

export default router;
