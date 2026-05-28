const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentQuestions", required: true },
      answer: { type: String },
      isCorrect: { type: Boolean },
      submittedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("AssessmentAnswer", AnswerSchema);