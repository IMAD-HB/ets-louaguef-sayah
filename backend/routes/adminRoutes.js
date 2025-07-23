import express from "express";
import {
  getAdminSummary,
  createOrderForClient,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin dashboard summary
router.get("/summary", protect, adminOnly, getAdminSummary);

// Admin creates order for client
router.post("/orders", protect, adminOnly, createOrderForClient);

export default router;
