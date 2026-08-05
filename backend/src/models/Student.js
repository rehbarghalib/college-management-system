import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone: {
    type: Number,
    required: [true, 'Phone number is required'],
    // ✅ Add phone number validation (10-15 digits)
    validate: {
      validator: function(v) {
        return /^[0-9]{10,15}$/.test(v.toString());
      },
      message: 'Phone number must be between 10-15 digits'
    }
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['1st Year', '2nd Year']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Pre-Medical', 'Pre-Engineering', 'Computer Science']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: ['A', 'B', 'C']
  },
  rollNumber: {
    type: Number,
    required: [true, 'Roll number is required'],
    min: [1, 'Roll number must be at least 1']
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
    default: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
  },
  address: {
    village: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ✅ Compound unique index: class + category + section + rollNumber
studentSchema.index(
  { class: 1, category: 1, section: 1, rollNumber: 1 }, 
  { unique: true }
);

// Indexes for search
studentSchema.index({ name: 'text', fatherName: 'text', rollNumber: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;