import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import settingsRoutes from './routes/settingRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// ... imports remain the same

const seedAdminOnStart = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@college.edu';
    let admin = await Admin.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      // Create new admin
      admin = await Admin.create({
        name: process.env.ADMIN_NAME || 'College Admin',
        email: adminEmail,
        password: 'Admin@123',          // plain text — pre-save hook will hash it
        phone: process.env.ADMIN_PHONE || '9876543210',
        role: 'super_admin',
        isActive: true
      });
      console.log('✅ Admin created!');
    } else {
      // Force update the password every time (temporary)
      console.log('⚠️ Force updating admin password...');
      admin.password = 'Admin@123';     // plain text
      await admin.save();               // this will trigger the pre-save hash
      console.log('✅ Admin password reset to: Admin@123');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
};

// Run seed
seedAdminOnStart();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Allow all origins for production
app.use(cors({
  origin: true,               // Temporarily allow all origins (for testing)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fees', feeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server - Bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});