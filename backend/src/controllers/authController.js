import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { generateOTP, getOTPExpiry, sendOTPEmail } from '../utils/otpService.js';
import bcrypt from 'bcryptjs';

// ✅ Dynamic Configuration
const OTP_CONFIG = {
  maxAttempts: 5,
  cooldownMinutes: 60,
  otpExpiryMinutes: 10,
  minPasswordLength: 6,
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'An admin already exists. Only one admin is allowed.'
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      phone,
      role: 'super_admin'
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: { admin, token }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔵 Login Attempt:', { email, password: '***' });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // ✅ Find admin with password field
    const admin = await Admin.findOne({ email }).select('+password');

    console.log('👤 Admin found:', admin ? 'Yes' : 'No');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('🔐 Password hash in DB:', admin.password);

    // ✅ Compare password
    const isMatch = await admin.comparePassword(password);
    console.log('✅ Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { admin, token }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current admin profile
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update profile (name & email) - ✅ FIXED (single version)
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    console.log('🔵 Update Profile Request:');
    console.log('📧 Current Admin ID:', req.admin._id);
    console.log('📧 Current Email:', req.admin.email);
    console.log('📧 New Email:', email);

    // ✅ Find the admin
    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // ✅ Handle name update
    if (name && name !== admin.name) {
      admin.name = name;
      console.log('✅ Name updated to:', name);
    }

    // ✅ Handle email update
    if (email && email !== admin.email) {
      // ✅ Check if email is already used by ANOTHER admin (not this one)
      const existingAdmin = await Admin.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: req.admin._id }
      });
      
      console.log('🔍 Checking if email exists for another admin:', email);
      console.log('🔍 Found:', existingAdmin ? 'Yes - ' + existingAdmin.email : 'No');
      
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account'
        });
      }
      
      admin.email = email.toLowerCase().trim();
      console.log('✅ Email updated to:', admin.email);
    }

    await admin.save();

    // ✅ Return updated admin
    const updatedAdmin = await Admin.findById(admin._id);

    console.log('✅ Profile updated successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAdmin
    });
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change password - ✅ FIXED with hashing
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < OTP_CONFIG.minPasswordLength) {
      return res.status(400).json({
        success: false,
        message: `New password must be at least ${OTP_CONFIG.minPasswordLength} characters`
      });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // ✅ FIX: Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Logout admin
export const logoutAdmin = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check if admin exists
export const checkAdminExists = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    res.status(200).json({
      success: true,
      data: {
        exists: count > 0,
        count
      }
    });
  } catch (error) {
    console.error('Check Admin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload profile image (Local Storage)
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      { profileImage: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: { 
        profileImage: imageUrl,
        admin: admin
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ @desc    Request password reset OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    const admin = await Admin.findOne({ email }).select('+resetPasswordAttempts +resetPasswordLastAttempt');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support.'
      });
    }

    const now = Date.now();
    const lastAttempt = admin.resetPasswordLastAttempt || new Date(0);
    const timeSinceLastAttempt = now - new Date(lastAttempt).getTime();
    const cooldownMs = OTP_CONFIG.cooldownMinutes * 60 * 1000;

    if (admin.resetPasswordAttempts >= OTP_CONFIG.maxAttempts && timeSinceLastAttempt < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastAttempt) / (60 * 1000));
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again after ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
      });
    }

    if (timeSinceLastAttempt >= cooldownMs) {
      admin.resetPasswordAttempts = 0;
    }

    const otp = generateOTP();
    const otpExpires = getOTPExpiry(OTP_CONFIG.otpExpiryMinutes);

    admin.resetPasswordOTP = otp;
    admin.resetPasswordOTPExpires = otpExpires;
    admin.resetPasswordAttempts = (admin.resetPasswordAttempts || 0) + 1;
    admin.resetPasswordLastAttempt = new Date();
    await admin.save();

    const emailSent = await sendOTPEmail(email, otp, admin.name);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: {
        email: admin.email,
        expiresIn: `${OTP_CONFIG.otpExpiryMinutes} minutes`,
        attemptsRemaining: OTP_CONFIG.maxAttempts - admin.resetPasswordAttempts
      }
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ @desc    Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    const admin = await Admin.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpires');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    if (!admin.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.'
      });
    }

    if (new Date() > admin.resetPasswordOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (admin.resetPasswordOTP !== otp) {
      const attemptsLeft = OTP_CONFIG.maxAttempts - (admin.resetPasswordAttempts || 0);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. You have ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} left.`
      });
    }

    const resetToken = jwt.sign(
      { id: admin._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: `${OTP_CONFIG.otpExpiryMinutes}m` }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken,
        email: admin.email,
        expiresIn: `${OTP_CONFIG.otpExpiryMinutes} minutes`
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ @desc    Reset password - FIXED with hashing
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < OTP_CONFIG.minPasswordLength) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${OTP_CONFIG.minPasswordLength} characters`
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new OTP.'
      });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token purpose'
      });
    }

    const admin = await Admin.findById(decoded.id).select('+resetPasswordOTP +resetPasswordOTPExpires');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No account found'
      });
    }

    // ✅ FIX: Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP fields
    admin.password = hashedPassword;
    admin.resetPasswordOTP = null;
    admin.resetPasswordOTPExpires = null;
    admin.resetPasswordAttempts = 0;
    admin.resetPasswordLastAttempt = null;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};