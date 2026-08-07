import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@college.edu';
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('✅ Admin already exists!');
      console.log(`📧 Email: ${adminExists.email}`);
      process.exit(0);
    }

    // ✅ Create admin - password will be hashed by the model's pre-save hook
    const admin = await Admin.create({
      name: process.env.ADMIN_NAME || 'College Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      phone: process.env.ADMIN_PHONE || '9876543210',
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();