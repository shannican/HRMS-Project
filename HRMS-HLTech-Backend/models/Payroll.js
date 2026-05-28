const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  periodStart: {
    type: Date,
    required: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  monthlySalary: {
    type: Number,
    required: true,
  },
  perDaySalary: {
    type: Number,
    required: true,
  },
  paidDays: {
    type: Number,
    required: true,
  },
  absents: {
    type: Number,
    required: true,
  },
  paidLeaves: {
    type: Number,
    required: true,
  },
  unpaidLeaves: {
    type: Number,
    required: true,
  },
  holidayDays: {
    type: Number,
    required: true,
  },
  sundayDays: { // Renamed from 'Sunday' to 'sundayDays'
    type: Number,
    required: true,
  },
  deductions: {
    type: Number,
    required: true,
  },
  netPay: {
    type: Number,
    required: true,
  },
  creditedPay: {
    type: Number,
    required: true,
  },
  advance: {
    type: Number,
    required: true,
  },
  paymentMode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed'],
    default: 'Pending',
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  hra: {
    type: Number,
    required: true,
  },
  travelAllowance: {
    type: Number,
    required: true,
  },
  specialAllowance: {
    type: Number,
    required: true,
  },
  grossEarnings: {
    type: Number,
    required: true,
  },
  pan: {
    type: String,
    default: null,
  },
  accountNumber: {
    type: String,
    default: null,
  },
  ifscCode: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);