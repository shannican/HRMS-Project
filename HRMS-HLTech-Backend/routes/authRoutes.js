// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Registration route (no middleware; role logic handled in controller)
router.post('/register', register);

// Unified login route for all roles
router.post('/login', login);

module.exports = router;