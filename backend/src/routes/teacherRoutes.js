import express from 'express';
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  searchTeachers,
  uploadTeacherImage
} from '../controllers/teacherController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Image upload route
router.post('/upload-image', upload.single('profileImage'), uploadTeacherImage);

// Search route
router.get('/search', searchTeachers);

// CRUD routes
router.post('/', createTeacher);
router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

export default router;