import express from 'express';
import {
  recordFee,
  getAllFees,
  getStudentFeeSummary,
  getFeeSummary,
  deleteFee,
  updateFee
} from '../controllers/feeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected (admin only)
router.use(protect);

// Summary routes
router.get('/summary', getFeeSummary);
router.get('/student/:studentId/summary', getStudentFeeSummary);

// CRUD routes
router.post('/', recordFee);
router.get('/', getAllFees);
router.put('/:id', updateFee);
router.delete('/:id', deleteFee);

export default router;