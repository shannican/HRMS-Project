const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true }, // Renamed from contactNo
  dateOfBirth: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  attemptedQuestions: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // Time taken in seconds
  correctMcqCount: { type: Number, default: 0 }, // Number of correct MCQs
  correctCodingCount: { type: Number, default: 0 }, // Number of correct coding questions
  result: { type: String, enum: ["Pass", "Failed"], default: null }
});

module.exports = mongoose.model("AssessmentUsers", UserSchema);