import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
  logoutAdmin,
  checkAdminExists,
  uploadProfileImage,
  forgotPassword,
  verifyOTP,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/admin-exists', checkAdminExists);

// ✅ Forgot Password routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logoutAdmin);
router.post('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);

export default router;