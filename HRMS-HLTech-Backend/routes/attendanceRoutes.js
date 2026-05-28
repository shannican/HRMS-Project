const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const holidaysController = require('../controllers/holidaysController');
const attendanceController = require('../controllers/attendanceController');
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Attendance Routes
router.post('/attendance/check-in', authMiddleware, roleMiddleware(['employee']), attendanceController.checkInAttendance);
router.post('/attendance/check-out', authMiddleware, roleMiddleware(['employee']), attendanceController.checkOutAttendance);
router.get('/attendance/me', authMiddleware, roleMiddleware(['employee']), attendanceController.getMyAttendance);
router.get('/attendance/employee/:id', authMiddleware, attendanceController.getAttendanceByEmployee);
router.get('/attendance', authMiddleware, roleMiddleware(['admin', 'hr']), attendanceController.getAllAttendance);
router.get('/attendance/stats/:employeeId', authMiddleware, attendanceController.getMonthlyAttendanceStats);
router.get('/attendance/absent/:employeeId/:month/:year', authMiddleware, attendanceController.getAbsentDays);
router.get('/attendance/present/:employeeId/:month/:year', authMiddleware, attendanceController.getPresentDays);
router.post('/attendance/request', authMiddleware, roleMiddleware(['employee']), attendanceController.requestAttendance);
router.get('/attendance/requests/pending', authMiddleware, roleMiddleware(['admin', 'hr']), attendanceController.getPendingAttendanceRequests);
router.put('/attendance/requests/:requestId', authMiddleware, roleMiddleware(['admin', 'hr']), attendanceController.handleAttendanceRequest);

// Holiday Routes
router.get('/holidays', authMiddleware, holidaysController.getHolidays);
router.post('/holidays', authMiddleware, roleMiddleware(['admin', 'hr']), holidaysController.createHoliday);
router.delete('/holidays/:id', authMiddleware, roleMiddleware(['admin', 'hr']), holidaysController.deleteHoliday);

// Leave Routes
router.post('/leave', authMiddleware, roleMiddleware(['employee']), leaveController.submitLeaveRequest);
router.get('/leave', authMiddleware, leaveController.getAllLeaveRequests);
router.put('/leave/:id', authMiddleware, roleMiddleware(['admin', 'hr']), leaveController.updateLeaveRequest);
router.delete('/leave/:id', authMiddleware, roleMiddleware(['employee']), leaveController.deleteLeaveRequest);
router.post('/leave/assign/:employeeId', authMiddleware, roleMiddleware(['admin', 'hr']), leaveController.assignLeaveBalance);
router.get('/leave/balance/:employeeId', authMiddleware, leaveController.getLeaveBalance);

// Notification Routes
router.get('/notifications', authMiddleware, employeeController.getNotifications);
router.put('/notifications/:id/read', authMiddleware, employeeController.markNotificationAsRead);
router.put('/notifications/read-all', authMiddleware, employeeController.markAllNotificationsAsRead);

module.exports = router;