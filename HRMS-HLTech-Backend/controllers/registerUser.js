const User = require('../models/AssessmentUser')
const Assessment = require('../models/Assessment');
const Answer = require('../models/AssessmentAnswers')

exports.registerUser = async (req, res) => {
  const { email, username, fullName, contactNo, dateOfBirth } = req.body;
  try {
    // Check if user already exists by email and username
    let user = await User.findOne({ email, username });
    if (user) {
      // Check if the user has already completed the assessment
      if (user.result !== null) {
        return res.status(403).json({ error: "You have already completed the assessment with this email and username." });
      }
      return res.status(200).json({ userId: user._id });
    }

    // Create a new user with all fields
    user = new User({
      email,
      username,
      fullName,
      contactNo,
      dateOfBirth: new Date(dateOfBirth),
    });
    await user.save();

    // Start a new assessment for the user
    const assessment = new Assessment({ userId: user._id });
    await assessment.save();

    res.status(201).json({ userId: user._id });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
}

exports.getUsersAllAnswers = async (req, res) => {
  const { userId } = req.params;
  try{
    const userid = await User.findOne({email: userId});
    const userAnswers = await Answer.findOne({ userId: userid._id }).populate("answers.questionId");

    if (!userAnswers) {
      return res.status(404).json({ error: "No answers found for this user" });
    }

    // Structure the response to include question text, type, and submitted answer
    const formattedAnswers = userAnswers.answers.map(answer => ({
      questionId: answer.questionId._id,
      questionText: answer.questionId.text,
      questionType: answer.questionId.type,
      submittedAnswer: answer.answer,
      isCorrect: answer.isCorrect
    }));

    // Separate MCQ and coding answers for clarity
    const mcqAnswers = formattedAnswers.filter(answer => answer.questionType === "mcq");
    const codingAnswers = formattedAnswers.filter(answer => answer.questionType === "coding");

    res.status(200).json({
      userId,
      answers: {
        mcq: mcqAnswers,
        coding: codingAnswers
      }
    });
  } catch (err) {
    console.error("Error fetching user answers:", {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: "Failed to fetch user answers" });
  }
}
