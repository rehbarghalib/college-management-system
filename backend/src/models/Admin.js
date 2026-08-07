import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin'],
    default: 'super_admin'
  },
  phone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordOTP: {
    type: String,
    select: false
  },
  resetPasswordOTPExpires: {
    type: Date,
    select: false
  },
  resetPasswordAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  resetPasswordLastAttempt: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// ✅ Hash password before saving - FIXED
adminSchema.pre('save', async function(next) {
  try {
    // Only hash if password is modified
    if (!this.isModified('password')) {
      return next();
    }
    
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    next(error);
  }
});

// ✅ Compare password method - FIXED
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔐 Comparing passwords...');
    console.log('🔑 Candidate password:', candidatePassword);
    console.log('🔐 Stored hash:', this.password);
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('✅ Compare result:', result);
    return result;
  } catch (error) {
    console.error('❌ Compare error:', error);
    return false;
  }
};

// ✅ Remove sensitive fields when sending response
adminSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordOTP;
  delete obj.resetPasswordOTPExpires;
  delete obj.resetPasswordAttempts;
  delete obj.resetPasswordLastAttempt;
  return obj;
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;