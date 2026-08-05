import Application from '../models/Application.js';

// @desc    Submit new application (Public)
// @route   POST /api/applications
// @access  Public
export const submitApplication = async (req, res) => {
  try {
    const { fullName, email, phone, course, qualification, obtainedMarks, totalMarks, message } = req.body;

    // Validate required fields (email is NOT required)
    if (!fullName || !phone || !course || !qualification || !obtainedMarks || !totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    const application = await Application.create({
      fullName,
      email: email || '',  // ✅ Email is optional
      phone,
      course,
      qualification,
      obtainedMarks: parseInt(obtainedMarks),
      totalMarks: parseInt(totalMarks),
      message: message || '',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Submit Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications
// @access  Private (Admin only)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update application status (Admin)
// @route   PUT /api/applications/:id
// @access  Private (Admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status || application.status;
    application.adminRemarks = adminRemarks || application.adminRemarks;
    application.reviewedBy = req.admin._id;
    application.reviewedAt = new Date();

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete application (Admin)
// @route   DELETE /api/applications/:id
// @access  Private (Admin only)
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};