import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentsByClass,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
  uploadStudentImage
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Image upload route
router.post('/upload-image', upload.single('profileImage'), uploadStudentImage);

// Search route
router.get('/search', searchStudents);

// Get students by class
router.get('/class/:className', getStudentsByClass);

// CRUD routes
router.post('/', createStudent);
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;