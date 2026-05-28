const mongoose = require('mongoose');

const informationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  budgetRange: {
    type: String,
    required: true
  },
  projectBrief: {
    type: String,
    required: true
  },
  includesNDA: {
    type: Boolean,
    default: false
  },
  agreeTerms: {
    type: Boolean,
    default: false
  },
  countryCode: {
    type: String,
    default: "+91"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Information', informationSchema);
