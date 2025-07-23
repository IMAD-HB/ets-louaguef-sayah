import express from 'express';
import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Get all brands (public for clients too)
router.get('/', protect, getBrands);

// 🔒 Admin-only routes
router.post('/', protect, adminOnly, createBrand);
router.put('/:id', protect, adminOnly, updateBrand);
router.delete('/:id', protect, adminOnly, deleteBrand);

export default router;
