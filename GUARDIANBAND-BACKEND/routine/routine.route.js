import express from "express";
import { getRoutines, createRoutine, updateRoutine, deleteRoutine } from "./routine.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireOwnedChild } from "../middleware/childOwnership.js";

const router = express.Router();

router.get("/child/:childId", verifyToken, requireOwnedChild, getRoutines);
router.post("/child/:childId", verifyToken, requireOwnedChild, createRoutine);
router.put("/:id", verifyToken, updateRoutine);
router.delete("/:id", verifyToken, deleteRoutine);

export default router;
