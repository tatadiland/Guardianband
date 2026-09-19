import express from "express";
import {
  createChild,
  getChild,
  getChildById,
  updateChild,
  deleteChild,
  getChildren,
} from "./child.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const childRouter = express.Router();

childRouter.post("/", verifyToken, createChild);
childRouter.get("/user/:userId", verifyToken, getChild);
childRouter.get("/:id", verifyToken, getChildById);
childRouter.put("/:id", verifyToken, updateChild);
childRouter.delete("/:id", verifyToken, deleteChild);
childRouter.get("/user/me/all", verifyToken, getChildren);

export default childRouter;