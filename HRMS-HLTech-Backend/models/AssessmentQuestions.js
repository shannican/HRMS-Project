const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ["mcq", "coding"], required: true },
  text: { type: String, required: true },
  options: [{ type: String }], // For MCQs
  correctAnswer: { type: String }, // For MCQs
  codingProblem: {
    description: String,
    languages: [String], // e.g., ["javascript", "java", "python", "cpp"]
    testCases: [{
      input: String,
      output: String,
      hidden: { type: Boolean, default: false }
    }]
  },
  order: { type: Number, required: true } // To maintain question order
});

module.exports = mongoose.model("AssessmentQuestions", QuestionSchema);