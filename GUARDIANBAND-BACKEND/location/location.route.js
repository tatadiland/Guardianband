import express from "express";
import { getLocationData, updateLocation } from "./location.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/device/:deviceId", verifyToken, getLocationData);
router.post("/device/:deviceId", verifyToken, updateLocation);

export default router;
