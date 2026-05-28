const express = require('express');
const router = express.Router();
const { submitAssessment } = require('../controllers/submitAssessment')
const { getAssessmentQuestions, getAllAssessmentQuestions } = require('../controllers/getAssessmentQuestions');
const { registerUser, getUsersAllAnswers } = require('../controllers/registerUser');
// const { registerUser, } = require('../controllers/registerUser');
const { assessments, getAssessmentResults } = require('../controllers/assessmentsController');
const { finishAssessment } = require('../controllers/finishAssessmentController');

router.post('/users/register', registerUser);
router.get('/users/:userId/answers', getUsersAllAnswers);
router.get('/questions/:order', getAllAssessmentQuestions);
router.get('/questions/all', getAllAssessmentQuestions);
router.post('/answers/submit', submitAssessment);
router.get("/assessments/:userId/progress", assessments);
router.get("/assessments/results", getAssessmentResults);
router.post("/assessments/:userId/finish", finishAssessment);


module.exports = router;