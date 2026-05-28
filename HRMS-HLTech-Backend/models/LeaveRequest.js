const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['EN', 'CL', 'FL', 'UNPAID'],
    required: true,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  isHalfDay: {
    type: Boolean,
    default: false,
  },
  halfDayType: {
    type: String,
    enum: ['EN_HALF', 'CL_HALF', 'FL_HALF', 'UNPAID_HALF', null],
    default: null,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  approvedBy: {
    type: String,
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  totalDays: {
    type: Number, // Add totalDays field
    required: true,
  },
  workingDays: {
    type: Number, // Add workingDays field
    required: true,
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

leaveRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);