const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  yearlyBalances: [{
    financialYear: {
      type: String, // e.g., "2025-2026"
      required: true,
    },
    startMonth: {
      type: Number, // 1-12, the month the employee joined (April=1, March=12)
      required: true,
      min: 1,
      max: 12,
    },
    en: {
      credited: { type: Number, default: 0 }, // Total yearly credited EN leaves
      used: { type: Number, default: 0 }, // Total yearly used EN leaves
      carriedForward: { type: Number, default: 0 }, // Carried forward from previous financial year
    },
    cl: {
      firstHalf: { credited: { type: Number, default: 4 }, used: { type: Number, default: 0 } }, // April to September
      secondHalf: { credited: { type: Number, default: 4 }, used: { type: Number, default: 0 } }, // October to March
    },
    fl: {
      firstHalf: { credited: { type: Number, default: 1 }, used: { type: Number, default: 0 } }, // April to September
      secondHalf: { credited: { type: Number, default: 1 }, used: { type: Number, default: 0 } }, // October to March
    },
    unpaid: { type: Number, default: 0 },
    unpaidHalf: { type: Number, default: 0 },
  }],
  monthlyEnApplications: [{
    financialYear: { type: String, required: true }, // e.g., "2025-2026"
    month: { type: Number, required: true, min: 1, max: 12 }, // 1-12, relative to financial year (April=1, March=12)
    hasApplied: { type: Boolean, default: false }, // Whether an EN leave was applied for this month
    credited: { type: Number, default: 1 }, // Monthly EN leave credited (default 1 per month)
    used: { type: Number, default: 0 }, // Monthly EN leave used (approved leaves)
    pending: { type: Number, default: 0 }, // Monthly EN leave pending approval
    carriedForward: { type: Number, default: 0 }, // Carried forward from the previous month (max 1)
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

leaveBalanceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);