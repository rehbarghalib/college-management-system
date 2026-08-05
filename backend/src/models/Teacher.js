import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  subjects: [{
    type: String,
    trim: true
  }],
  classes: [{
    type: String,
    trim: true
  }],
  salary: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ['Teacher', 'Principal', 'Vice Principal'],
    default: 'Teacher'
  },
  profileImage: {
    type: String,
    default: ''
  },
  address: {
    city: {
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

// Index for search
teacherSchema.index({ name: 'text', email: 'text', subjects: 'text' });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;