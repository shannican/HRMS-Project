const express = require('express');
const router = express.Router();
const { generatePayroll, processPayroll, getPayrollRecords, getPayrollRecord, sendPaySlipEmail } = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Routes for payroll (accessible by admin/HR)
router.post('/payroll/generate', authMiddleware, roleMiddleware(['admin', 'hr']), generatePayroll);
router.post('/payroll/process', authMiddleware, roleMiddleware(['admin', 'hr']), processPayroll);
router.get('/payroll/records', authMiddleware, roleMiddleware(['admin', 'hr']), getPayrollRecords); // Updated route
router.get('/payroll/record/:id', authMiddleware, roleMiddleware(['admin', 'hr']), getPayrollRecord); // Updated route to be consistent
router.post('/payroll/slip/:id/send-email', authMiddleware, roleMiddleware(['admin', 'hr']), sendPaySlipEmail);

module.exports = router;