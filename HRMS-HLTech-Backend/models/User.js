const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  employeeCode: {
    type: String,
    trim: true,
    required: function() {
      return this.employmentType !== 'Internship';
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits'],
  },
  phoneNumber: {
    type: String,
    match: [/^[0-9]{10,15}$/, 'Alternate phone number must be 10-15 digits'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    required: function() {
      return this.employmentType !== 'Internship';
    },
  },
  department: {
    type: String,
    trim: true,
    required: function() {
      return this.employmentType !== 'Internship';
    },
  },
  jobTitle: {
    type: String,
    trim: true,
    required: function() {
      return this.employmentType !== 'Internship';
    },
  },
  ctc: {
    type: Number,
    min: [0, 'CTC cannot be negative'],
    required: function() {
      return this.employmentType !== 'Internship' && this.employmentType !== 'Freelancer / Consultant';
    },
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
  },
  employmentType: {
    type: String,
    enum: [
      'Full-Time',
      'Part-Time',
      'Contractual',
      'Freelancer / Consultant',
      'Temporary',
      'Probationary',
      'Apprentice / Trainee',
      'Remote / Work-from-Home',
      'Internship',
    ],
    required: [true, 'Employment type is required'],
    default: 'Probationary',
  },
  role: {
    type: String,
    enum: ['admin', 'employee', 'hr'],
    default: 'admin',
    required: [true, 'Role is required'],
  },
  internshipType: {
    type: String,
    enum: ['Paid Internship', 'Unpaid Internship', null],
    required: function() {
      return this.employmentType === 'Internship';
    },
  },
  stipend: {
    type: Number,
    min: [0, 'Stipend cannot be negative'],
    required: function() {
      return this.employmentType === 'Internship' && this.internshipType === 'Paid Internship';
    },
  },
  probationDuration: {
    type: Number,
    min: [0, 'Probation duration cannot be negative'],
    required: function() {
      return this.employmentType !== 'Internship';
    },
  },
  internshipDuration: {
    type: Number,
    min: [0, 'Internship duration cannot be negative'],
    required: function() {
      return this.employmentType === 'Internship';
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to compare provided password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);