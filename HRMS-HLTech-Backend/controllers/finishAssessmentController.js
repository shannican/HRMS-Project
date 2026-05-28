const Answer = require('../models/AssessmentAnswers');
const User = require('../models/AssessmentUser');
const Assessment = require('../models/Assessment')

exports.finishAssessment = async (req, res) => {
    const { userId } = req.params;
  const { timeTaken } = req.body; // Get timeTaken from request body
  try {
    const userAnswers = await Answer.findOne({ userId }).populate("answers.questionId");
    const user = await User.findById(userId);
    const assessment = await Assessment.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    if (typeof timeTaken !== 'number' || timeTaken < 0) {
      return res.status(400).json({ error: "Invalid timeTaken value" });
    }

    let attemptedQuestions = 0;
    let correctMcqCount = 0;
    let correctCodingCount = 0;
    let result;

    if (!userAnswers || !userAnswers.answers.length) {
      attemptedQuestions = 0;
      correctMcqCount = 0;
      correctCodingCount = 0;
      result = "Failed";
    } else {
      attemptedQuestions = userAnswers.answers.length;

      const mcqAnswers = userAnswers.answers.filter(ans => ans.questionId.type === "mcq");
      const codingAnswers = userAnswers.answers.filter(ans => ans.questionId.type === "coding");

      correctMcqCount = mcqAnswers.filter(ans => ans.isCorrect).length;
      correctCodingCount = codingAnswers.filter(ans => ans.isCorrect).length;

      const mcqPassingThreshold = 14;
      const codingPassingThreshold = 1;

      const hasPassedMcq = correctMcqCount >= mcqPassingThreshold;
      const hasPassedCoding = correctCodingCount >= codingPassingThreshold;

      result = hasPassedMcq && hasPassedCoding ? "Pass" : "Failed";
    }

    await User.findByIdAndUpdate(
      userId,
      {
        attemptedQuestions,
        correctMcqCount,
        correctCodingCount,
        timeTaken, // Save timeTaken in the schema
        result
      },
      { new: true }
    );

    await Assessment.findOneAndUpdate(
      { userId },
      { status: "completed" },
      { new: true }
    );

    res.status(200).json({ message: "Assessment finished", user });
  } catch (err) {
    console.error("Error finishing assessment:", err);
    res.status(500).json({ error: "Failed to finish assessment" });
  }
}