import express from 'express';
import {
  submitApplication,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', submitApplication);

// Admin only routes
router.get('/', protect, getAllApplications);
router.put('/:id', protect, updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);

export default router;
