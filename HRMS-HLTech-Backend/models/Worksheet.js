// models/Worksheet.js
const mongoose = require('mongoose');

const worksheetSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkIn: {
    type: String,
    required: true,
  },
  checkOut: {
    type: String,
    required: true,
  },
  tasks: {
    type: [String], // Array of tasks
    required: true,
  },
  timeSpent: {
    type: [String], // Array of times corresponding to tasks
    required: true,
  },
  taskStatuses: {
    type: [String], // Array of statuses corresponding to tasks
    enum: ['In Progress', 'Done', 'Hold', 'Pending'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Worksheet', worksheetSchema);