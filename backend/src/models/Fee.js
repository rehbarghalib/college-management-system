import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  // ✅ Payment Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    default: new Date().getFullYear()
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Cheque'],
    required: [true, 'Payment method is required']
  },
  receiptNumber: {
    type: String,
    unique: true,
    trim: true
  },
  paymentFor: {
    type: String,
    enum: ['Monthly', 'Tuition', 'Exam', 'Library', 'Lab', 'Sports', 'Annual', 'Registration', 'Other'],
    default: 'Monthly'
  },
  // ✅ Notes about this payment
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Generate receipt number before saving
feeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Fee').countDocuments();
    const year = new Date().getFullYear();
    this.receiptNumber = `REC-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
feeSchema.index({ studentId: 1, month: 1, year: 1 });
feeSchema.index({ studentId: 1, paymentDate: -1 });

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;