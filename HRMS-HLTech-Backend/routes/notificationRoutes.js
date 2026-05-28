const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// Get all notifications for the user
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.user.id);
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    console.log('Notifications fetched:', notifications);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark a notification as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    console.log('Marking notification as read:', req.params.id);
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notification) {
      console.log('Notification not found or not authorized:', req.params.id);
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    console.log('Marking all notifications as read for user:', req.user.id);
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;