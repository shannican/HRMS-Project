const express = require('express');
const router = express.Router();
const { 
  addEmployee,
  getEmployees, 
  updateEmployee, 
  deleteEmployee, 
  hireCandidate,
  getUpcomingEvents,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  generateEmployeeCode
} = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Employee management routes
router.post('/add-employee', authMiddleware, roleMiddleware(['admin', 'hr']), addEmployee);
router.get('/users', authMiddleware, roleMiddleware(['admin', 'hr', 'employee']), getEmployees);
router.put('/users/:id', authMiddleware, roleMiddleware(['admin', 'hr']), updateEmployee);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin', 'hr']), deleteEmployee);
router.post('/jobs/:jobId/candidates/:candidateId/hire', authMiddleware, roleMiddleware(['admin', 'hr']), hireCandidate);
router.get('/upcoming-events', authMiddleware, roleMiddleware(['admin', 'hr']), getUpcomingEvents);
router.get('/generate-employee-code', authMiddleware, roleMiddleware(['admin', 'hr']), generateEmployeeCode);

// Notification routes
router.get('/notifications', authMiddleware, roleMiddleware(['admin', 'hr', 'employee']), getNotifications);
router.put('/notifications/:id/read', authMiddleware, roleMiddleware(['admin', 'hr', 'employee']), markNotificationAsRead);
router.put('/notifications/read-all', authMiddleware, roleMiddleware(['admin', 'hr', 'employee']), markAllNotificationsAsRead);

module.exports = router;