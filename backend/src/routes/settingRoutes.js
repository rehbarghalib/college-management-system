import express from 'express';
import { protect } from '../middleware/auth.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ✅ @desc    Update footer settings
// ✅ @route   PUT /api/settings/footer
// ✅ @access  Private (Admin only)
router.put('/footer', protect, async (req, res) => {
  try {
    const { footerSettings } = req.body;
    
    console.log('📥 Received footer settings:', footerSettings); // Debug log
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    settings.footerSettings = footerSettings;
    await settings.save();
    
    console.log('✅ Footer settings saved:', settings.footerSettings); // Debug log
    
    res.status(200).json({
      success: true,
      message: 'Footer settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update Footer Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update visitor settings
// @route   PUT /api/settings/visitor
// @access  Private (Admin only)
router.put('/visitor', protect, async (req, res) => {
  try {
    const { visitorSettings } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    settings.visitorSettings = visitorSettings;
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Visitor settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update Visitor Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update general settings
// @route   PUT /api/settings
// @access  Private (Admin only)
router.put('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    const updated = await Settings.findByIdAndUpdate(
      settings._id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;