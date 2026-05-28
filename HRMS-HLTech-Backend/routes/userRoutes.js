// routes/users.js
const express = require('express');
const router = express.Router();
const { getAllUsers, getUserProfile, updateUserRole, deleteUser, updateProfile, updateAddress, changePassword, uploadProfileImage } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Routes for user management (Admin and HR can view/delete)
router.get('/', authMiddleware, roleMiddleware(['admin', 'hr']), getAllUsers);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'hr']), deleteUser);

// Only admins can update roles
router.put('/role/:id', authMiddleware, roleMiddleware(['admin']), updateUserRole);

// Routes for profile management (all authenticated users)
router.get('/profile', authMiddleware, getUserProfile);
router.put('/update-profile', authMiddleware, updateProfile);
router.put('/update-address', authMiddleware, updateAddress);
router.post('/change-password', authMiddleware, changePassword);
router.post('/upload-profile-image', authMiddleware, uploadProfileImage);

module.exports = router;