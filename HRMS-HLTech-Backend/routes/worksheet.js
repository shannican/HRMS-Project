const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createWorksheet,
  getMonthlyWorksheets,
  updateWorksheet,
  deleteWorksheet,
} = require('../controllers/worksheetController');

console.log('worksheetRoutes: Registering routes with protect middleware');

// Protect all routes and restrict to employees
router.post('/', protect, roleMiddleware(['employee']), createWorksheet);
router.get('/month', protect, roleMiddleware(['employee']), getMonthlyWorksheets);
router.put('/:id', protect, roleMiddleware(['employee']), updateWorksheet);
router.delete('/:id', protect, roleMiddleware(['employee']), deleteWorksheet);

console.log('worksheetRoutes exports:', {
  createWorksheet,
  getMonthlyWorksheets,
  updateWorksheet,
  deleteWorksheet,
});

module.exports = router;