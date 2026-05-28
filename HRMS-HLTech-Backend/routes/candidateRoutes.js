const express = require("express");
const router = express.Router();
const {
  candidateRegister,
  candidateLogin,
  candidateLogout,
  candidateUpdate,
  getCandidateProfile,
} = require("../controllers/candidateController");
const { protectCandidate } = require("../middleware/candidateMiddleware");

console.log("candidateRoutes imports:", {
  candidateRegister,
  candidateLogin,
  candidateLogout,
  candidateUpdate,
  getCandidateProfile,
  protectCandidate,
});

// Public routes
router.post("/register", candidateRegister); // /api/candidate/register
router.post("/login", candidateLogin);      // /api/candidate/login
router.get("/logout", candidateLogout);     // /api/candidate/logout

// Protected routes
router.patch("/update", protectCandidate, candidateUpdate); // /api/candidate/update
router.get("/me", protectCandidate, getCandidateProfile);   // /api/candidate/me

module.exports = router;