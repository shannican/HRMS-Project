const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  employeeCode: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'employee',
    // immutable: true,
  },
  phone: {
    type: String,
    required: true,
  },
   phoneNumber: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  ctc: {
    type: Number,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: String,
    required: true,
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Intern'],
    required: true,
  },
   gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false,
  },
  dateOfBirth: {
    type: String,
    required: false,
  },
  address: {
    country: { type: String, required: false },
    city: { type: String, required: false },
    postalCode: { type: String, required: false },
  },
  profileImage: {
    type: String,
    required: false,
    default: 'https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg', // Default image URL
  },
}, { timestamps: true });

// Pre-save hook to hash password
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);