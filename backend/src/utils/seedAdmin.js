import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      console.log('✅ Admin already exists!');
      console.log(`📧 Email: ${adminExists.email}`);
      console.log('🔑 Use the password you set earlier');
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create({
      name: process.env.ADMIN_NAME || 'College Admin',
      email: process.env.ADMIN_EMAIL || 'admin@college.edu',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      phone: process.env.ADMIN_PHONE || '9876543210',
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log('📋 Admin Details:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Phone: ${admin.phone}`);
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
};

seedAdmin();