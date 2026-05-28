const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Assigned', 'Sunday'], // Differentiate between Assigned holidays and Sunday Holidays
    required: true,
    default: 'Assigned',
  },
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);