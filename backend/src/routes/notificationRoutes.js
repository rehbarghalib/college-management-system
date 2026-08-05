import express from 'express';
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  uploadNotificationFile,
  upload
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ✅ PUBLIC ROUTES (Visitors can view notifications)
router.get('/', getAllNotifications);
router.get('/:id', getNotificationById);

// ✅ ADMIN ROUTES (Protected)
router.post('/', protect, createNotification);
router.put('/:id', protect, updateNotification);
router.delete('/:id', protect, deleteNotification);
router.post('/upload', protect, upload.single('file'), uploadNotificationFile);

export default router;