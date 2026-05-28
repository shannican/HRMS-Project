const Answer = require('../models/AssessmentAnswers');
const User = require("../models/AssessmentUser");

exports.assessments = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userAnswers = await Answer.findOne({ userId }).populate("answers.questionId");

    if (!userAnswers || !userAnswers.answers.length) {
      return res.json({ currentIndex: 0, answeredIndices: [] });
    }

    // Get the indices of answered questions based on questionId
    const answeredIndices = userAnswers.answers
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .map((ans) => ans.questionId.order - 1); // Adjust for 0-based index

    // The current index is the next question after the last answered one
    const lastAnsweredIndex = answeredIndices[0] || 0;
    const currentIndex = lastAnsweredIndex < 21 ? lastAnsweredIndex + 1 : lastAnsweredIndex;

    res.json({ currentIndex, answeredIndices });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

exports.getAssessmentResults = async (req, res) => {
  try {
    const users = await User.find({ result: { $ne: null } });

    if (!users.length) {
      return res.json([]);
    }

    const results = await Promise.all(
      users.map(async (user) => {
        const userAnswers = await Answer.findOne({ userId: user._id }).populate("answers.questionId");
        let score = 0;
        let timeTakenFormatted = "0:00 mins";
        if (userAnswers && userAnswers.answers.length) {
          const totalQuestions = 22;
          const correctAnswers = userAnswers.answers.filter((ans) => ans.isCorrect).length;
          score = Math.round((correctAnswers / totalQuestions) * 100);
        }
        // Format timeTaken from seconds to MM:SS mins
        if (user.timeTaken > 0) {
          const minutes = Math.floor(user.timeTaken / 60);
          const seconds = user.timeTaken % 60;
          timeTakenFormatted = `${minutes}:${seconds.toString().padStart(2, '0')} mins`;
        }
        return {
          _id: user._id, // Include _id for frontend to use in API calls
          candidateName: user.fullName, // Use fullName instead of username
          fullName: user.fullName,
          phoneNumber: user.phoneNumber, // Renamed from contactNo
          email: user.email,
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '',
          score: score,
          correctMcqCount: user.correctMcqCount || 0,
          correctCodingCount: user.correctCodingCount || 0,
          timeTaken: timeTakenFormatted,
          date: user.createdAt.toISOString().split('T')[0],
          status: user.result,
          attemptedQuestions: user.attemptedQuestions
        };
      })
    );
    const filteredResults = results.filter(result => result !== null);
    res.json(filteredResults);
  } catch (err) {
    console.error("Error fetching assessment results:", err);
    res.status(500).json({ error: "Failed to fetch assessment results" });
  }
};

exports.startAssessment = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if the user exists in the AssessmentUsers collection
    const user = await User.findOne({ candidateId: userId });
    if (user && user.result) {
      return res.status(403).json({ message: "You have already completed the assessment" });
    }

    // Check if the user has already started the assessment
    const userAnswers = await Answer.findOne({ userId: user?._id });
    if (userAnswers && userAnswers.answers.length > 0) {
      return res.status(200).json({ message: "Assessment already in progress", redirectTo: "/assessment-form" });
    }

    // If all checks pass, allow the user to start the assessment
    res.status(200).json({ message: "Proceed to assessment", redirectTo: "/assessment-form" });
  } catch (err) {
    console.error("Error starting assessment:", err);
    res.status(500).json({ message: "Server error" });
  }
};