import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

export const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@college.edu' 
    });
    
    if (!adminExists) {
      const admin = await Admin.create({
        name: process.env.ADMIN_NAME || 'College Admin',
        email: process.env.ADMIN_EMAIL || 'admin@college.edu',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        phone: process.env.ADMIN_PHONE || '9876543210',
        role: 'super_admin',
        isActive: true
      });
      console.log('✅ Admin seeded successfully!');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
      return true;
    } else {
      console.log('✅ Admin already exists');
      return false;
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    return false;
  }
};