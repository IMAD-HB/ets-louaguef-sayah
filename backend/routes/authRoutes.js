import express from "express";
import {
  getMe,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  logout, 
  updateProfile,
  settleDebt,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/logout", logout); 

// Protected user actions
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

// Admin routes
router.post("/users", protect, adminOnly, createUser);
router.get("/users", protect, adminOnly, getUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

// ✅ New route to settle a user's debt
router.put("/users/:id/settle-debt", protect, adminOnly, settleDebt);

export default router;
