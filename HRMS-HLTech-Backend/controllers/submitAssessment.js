const Question = require("../models/AssessmentQuestions");
const Answer = require("../models/AssessmentAnswers");

exports.submitAssessment = async (req, res) => {
  const { userId, questionId, answer } = req.body;
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    let isCorrect = false;
    if (question.type === "mcq") {
      isCorrect = answer === question.correctAnswer;
    } else if (question.type === "coding") {
      if (question.order === 22) {
        const testCases = question.codingProblem.testCases.filter(tc => tc.hidden);
        isCorrect = testCases.every(tc => {
          try {
            const func = new Function(`return ${answer}`)();
            const result = func(tc.input);
            return result === tc.output;
          } catch (err) {
            return false;
          }
        });
      }
    }

    const newAnswer = { questionId, answer, isCorrect, submittedAt: new Date() };

    // Find the user's answer document
    let userAnswers = await Answer.findOne({ userId });
    if (!userAnswers) {
      // Create a new document if the user doesn't have one
      userAnswers = new Answer({ userId, answers: [newAnswer] });
    } else {
      // Check if the question has already been answered
      const existingAnswerIndex = userAnswers.answers.findIndex(
        ans => ans.questionId.toString() === questionId.toString()
      );
      if (existingAnswerIndex !== -1) {
        // Update the existing answer
        userAnswers.answers[existingAnswerIndex] = newAnswer;
      } else {
        // Append the new answer
        userAnswers.answers.push(newAnswer);
      }
    }

    await userAnswers.save();
    res.status(201).json({ message: "Answer submitted" });
  } catch (err) {
    console.error("Error submitting answer:", err);
    res.status(500).json({ error: "Failed to submit answer" });
  }
}