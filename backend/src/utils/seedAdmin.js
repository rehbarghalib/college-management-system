import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@college.edu';
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('✅ Admin already exists!');
      console.log(`📧 Email: ${adminExists.email}`);
      
      // ✅ Check if password is hashed
      if (adminExists.password && adminExists.password.startsWith('$2a$')) {
        console.log('🔐 Password is hashed ✅');
      } else {
        console.log('⚠️ Password is NOT hashed! Fixing...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);
        adminExists.password = hashedPassword;
        await adminExists.save();
        console.log('✅ Password fixed! Login with: Admin@123');
      }
      process.exit(0);
    }

    // ✅ Create admin with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@123',
      salt
    );

    const admin = await Admin.create({
      name: process.env.ADMIN_NAME || 'College Admin',
      email: adminEmail,
      password: hashedPassword,  // ✅ Already hashed
      phone: process.env.ADMIN_PHONE || '9876543210',
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();