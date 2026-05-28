const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  applyForJob,
  getAppliedJobs,
  getPendingJobs,
  updateCandidateStatus,
  generateOfferLetter,
  updateOfferStatus,
  getJobCandidates,
  toggleJobVisibility,
} = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { protectCandidate } = require('../middleware/candidateMiddleware');
const Job = require('../models/Job');

// Custom middleware to optionally authenticate
const optionalAuthMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('No token provided, proceeding as unauthenticated');
    req.user = undefined;
    return next();
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Decoded token:', decoded);
    req.user = { id: decoded.userId, role: decoded.role, fullName: decoded.fullName };
    console.log('req.user set:', req.user);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    req.user = undefined;
    next();
  }
};

console.log('jobRoutes imports:', {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  applyForJob,
  getAppliedJobs,
  getPendingJobs,
  updateCandidateStatus,
  generateOfferLetter,
  updateOfferStatus,
  getJobCandidates,
  toggleJobVisibility,
  protectCandidate,
});

// Public route with optional authentication
router.get('/jobs', optionalAuthMiddleware, getAllJobs);

// Admin/HR routes
router.post('/jobs', authMiddleware, roleMiddleware(['admin', 'hr']), createJob);
router.put('/jobs/:id', authMiddleware, roleMiddleware(['admin', 'hr']), updateJob);
router.delete('/jobs/:id', authMiddleware, roleMiddleware(['admin', 'hr']), deleteJob);
router.put(
  '/jobs/:jobId/candidates/:candidateId/status',
  authMiddleware,
  roleMiddleware(['admin', 'hr']),
  updateCandidateStatus
);
router.post(
  '/jobs/:jobId/candidates/:candidateId/offer-letter',
  authMiddleware,
  roleMiddleware(['admin', 'hr']),
  generateOfferLetter
);
router.get(
  '/jobs/:id/candidates',
  authMiddleware,
  roleMiddleware(['admin', 'hr']),
  getJobCandidates
);
router.put(
  '/jobs/:id/visibility',
  authMiddleware,
  roleMiddleware(['admin', 'hr']),
  toggleJobVisibility
);

// Candidate routes
router.post('/jobs/:id/apply', protectCandidate, applyForJob);
router.get('/jobs/applied', protectCandidate, getAppliedJobs);
router.get('/jobs/pending', protectCandidate, getPendingJobs);
router.put(
  '/jobs/:jobId/candidates/:candidateId/offer-status',
  protectCandidate,
  updateOfferStatus
);



router.get("/job/:id", async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ status: false, message: "not found" });
  }
  const details = await Job.findById(id);
  console.log(details.candidates, "qwe");
  res.json({ status: true, data: details.candidates });
});

module.exports = router;