const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkInTime: {
    type: String,
    required: true,
  },
  checkOutTime: {
    type: String,
  },
  location: {
    checkIn: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    checkOut: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'Holiday', 'On Leave'],
    required: true,
    default: 'absent', // Ensure a default value
  },
  holidayReason: {
    type: String,
  },
  absent: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);