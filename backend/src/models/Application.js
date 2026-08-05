import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: false,  // ✅ Email is optional
    lowercase: true,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    enum: ['Pre-Medical', 'Pre-Engineering', 'Computer Science']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
    enum: ['Matric (10th)', '1st Year']
  },
  obtainedMarks: {
    type: Number,
    required: [true, 'Obtained marks is required'],
    min: 0
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: 1
  },
  message: {
    type: String,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'approved', 'rejected'],
    default: 'pending'
  },
  adminRemarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters'],
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;