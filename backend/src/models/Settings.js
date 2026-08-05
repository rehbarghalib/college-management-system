import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // College Information
  collegeName: {
    type: String,
    default: 'The Quantum Group of School and College'
  },
  collegeLogo: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    default: 'info@quantumgroup.edu'
  },
  contactPhone: {
    type: String,
    default: '+92 123 4567890'
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'Pakistan' }
  },
  
  // ✅ Footer Settings
  footerSettings: {
    address: {
      type: String,
      default: '123 Education Street, City, Country'
    },
    phone: {
      type: String,
      default: '+92 123 4567890'
    },
    email: {
      type: String,
      default: 'info@quantumgroup.edu'
    },
    facebook: {
      type: String,
      default: 'https://facebook.com/quantumgroup'
    },
    whatsapp: {
      type: String,
      default: 'https://wa.me/923001234567'
    },
    twitter: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    }
  },
  
  // Visitor Settings
  visitorSettings: {
    applyOnlineEnabled: {
      type: Boolean,
      default: true
    },
    visitorMessage: {
      type: String,
      default: ''
    },
    visitorMessageType: {
      type: String,
      enum: ['info', 'warning', 'success', 'danger'],
      default: 'info'
    }
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;