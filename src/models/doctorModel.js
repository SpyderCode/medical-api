const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  specialization: {
    type: String,
    required: [true, 'Please provide a specialization'],
    trim: true,
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide a license number'],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  workingHours: {
    start: {
      type: String,
      required: [true, 'Please provide working hours start time'],
    },
    end: {
      type: String,
      required: [true, 'Please provide working hours end time'],
    },
  },
  workingDays: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: [true, 'Please provide working days'],
  },
  role: {
    type: String,
    default: 'doctor',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true,
});

// Hash password before saving to database
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create JWT token
doctorSchema.methods.createJWT = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET || 'jwt_secret',
    { expiresIn: process.env.JWT_LIFETIME || '7d' }
  );
};

// Match password
doctorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);