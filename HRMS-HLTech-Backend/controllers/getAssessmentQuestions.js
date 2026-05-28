const Question = require("../models/AssessmentQuestions");

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Middleware to authenticate user (optional, can be added if needed)
// const authenticateUser = (req, res, next) => {
//   const userId = req.headers['user-id'];
//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized: User ID required" });
//   }
//   next();
// };

// Fetch a single question by order, excluding correctAnswer
exports.getAssessmentQuestions = async (req, res) => {
  try {
    const order = parseInt(req.params.order);
    if (isNaN(order) || order < 1) {
      return res.status(400).json({ error: "Invalid question order" });
    }

    const question = await Question.findOne({ order })
      .select('-correctAnswer'); // Exclude correctAnswer field

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.status(200).json(question);
  } catch (err) {
    console.error("Error fetching question:", {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: "Failed to fetch question" });
  }
};

// Fetch all questions, shuffled, excluding correctAnswer
exports.getAllAssessmentQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .select('-correctAnswer') // Exclude correctAnswer field
      .sort({ order: 1 }); // Sort by order

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: "No questions found" });
    }

    const shuffledQuestions = shuffleArray(questions);

    res.status(200).json(shuffledQuestions);
  } catch (err) {
    console.error("Error fetching questions:", {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};