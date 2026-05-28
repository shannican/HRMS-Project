// controllers/worksheetController.js
const Worksheet = require('../models/Worksheet');
const moment = require('moment');

// Create a new worksheet entry
const createWorksheet = async (req, res) => {
  console.log('createWorksheet: Processing request for user:', req.user.id);
  const { date, checkIn, checkOut, tasks, timeSpent, taskStatuses } = req.body;

  try {
    // Validate required fields
    if (!date || !checkIn || !checkOut || !tasks || !Array.isArray(tasks) || !timeSpent || !Array.isArray(timeSpent) || !taskStatuses || !Array.isArray(taskStatuses)) {
      console.log('createWorksheet: Missing or invalid fields:', { date, checkIn, checkOut, tasks, timeSpent, taskStatuses });
      return res.status(400).json({ message: 'All fields are required and tasks/timeSpent/taskStatuses must be arrays' });
    }

    if (tasks.length !== timeSpent.length || tasks.length !== taskStatuses.length) {
      console.log('createWorksheet: Arrays length mismatch:', { tasksLength: tasks.length, timeSpentLength: timeSpent.length, taskStatusesLength: taskStatuses.length });
      return res.status(400).json({ message: 'Tasks, timeSpent, and taskStatuses arrays must have the same length' });
    }

    // Check if a worksheet already exists for the given date and employee
    const existingWorksheet = await Worksheet.findOne({
      employeeId: req.user.id,
      date: {
        $gte: moment(date).startOf('day').toDate(),
        $lte: moment(date).endOf('day').toDate(),
      },
    });

    if (existingWorksheet) {
      console.log('createWorksheet: Worksheet already exists for date:', date);
      return res.status(400).json({ message: 'You have already submitted a task for this date' });
    }

    const worksheet = new Worksheet({
      employeeId: req.user.id,
      date,
      checkIn,
      checkOut,
      tasks,
      timeSpent,
      taskStatuses,
    });
    await worksheet.save();
    console.log('createWorksheet: Worksheet saved:', worksheet._id);
    res.status(201).json(worksheet);
  } catch (error) {
    console.error('createWorksheet: Error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Update a worksheet entry
const updateWorksheet = async (req, res) => {
  console.log('updateWorksheet: Processing request for user:', req.user.id, 'worksheet ID:', req.params.id);
  const { date, checkIn, checkOut, tasks, timeSpent, taskStatuses } = req.body;

  try {
    // Validate required fields
    if (!date || !checkIn || !checkOut || !tasks || !Array.isArray(tasks) || !timeSpent || !Array.isArray(timeSpent) || !taskStatuses || !Array.isArray(taskStatuses)) {
      console.log('updateWorksheet: Missing or invalid fields:', { date, checkIn, checkOut, tasks, timeSpent, taskStatuses });
      return res.status(400).json({ message: 'All fields are required and tasks/timeSpent/taskStatuses must be arrays' });
    }

    if (tasks.length !== timeSpent.length || tasks.length !== taskStatuses.length) {
      console.log('updateWorksheet: Arrays length mismatch:', { tasksLength: tasks.length, timeSpentLength: timeSpent.length, taskStatusesLength: taskStatuses.length });
      return res.status(400).json({ message: 'Tasks, timeSpent, and taskStatuses arrays must have the same length' });
    }

    const worksheet = await Worksheet.findById(req.params.id);
    if (!worksheet || worksheet.employeeId.toString() !== req.user.id) {
      console.log('updateWorksheet: Worksheet not found or unauthorized for ID:', req.params.id);
      return res.status(404).json({ message: 'Worksheet not found' });
    }

    worksheet.date = date;
    worksheet.checkIn = checkIn;
    worksheet.checkOut = checkOut;
    worksheet.tasks = tasks;
    worksheet.timeSpent = timeSpent;
    worksheet.taskStatuses = taskStatuses;
    await worksheet.save();
    console.log('updateWorksheet: Worksheet updated:', worksheet._id);
    res.json(worksheet);
  } catch (error) {
    console.error('updateWorksheet: Error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Existing functions (getMonthlyWorksheets, deleteWorksheet) remain unchanged
const getMonthlyWorksheets = async (req, res) => {
  console.log('getMonthlyWorksheets: Processing request for user:', req.user.id);
  const { year, month } = req.query;

  try {
    if (!year || !month) {
      console.log('getMonthlyWorksheets: Missing year or month:', { year, month });
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    console.log('getMonthlyWorksheets: Querying worksheets from', start, 'to', end);

    const worksheets = await Worksheet.find({
      employeeId: req.user.id,
      date: { $gte: start, $lte: end },
    });
    console.log('getMonthlyWorksheets: Found', worksheets.length, 'worksheets');
    res.json(worksheets);
  } catch (error) {
    console.error('getMonthlyWorksheets: Error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

const deleteWorksheet = async (req, res) => {
  console.log('deleteWorksheet: Processing request for user:', req.user.id, 'worksheet ID:', req.params.id);

  try {
    const worksheet = await Worksheet.findById(req.params.id);
    if (!worksheet || worksheet.employeeId.toString() !== req.user.id) {
      console.log('deleteWorksheet: Worksheet not found or unauthorized for ID:', req.params.id);
      return res.status(404).json({ message: 'Worksheet not found' });
    }

    await worksheet.deleteOne();
    console.log('deleteWorksheet: Worksheet deleted:', req.params.id);
    res.json({ message: 'Worksheet deleted' });
  } catch (error) {
    console.error('deleteWorksheet: Error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

console.log('worksheetController exports:', {
  createWorksheet,
  getMonthlyWorksheets,
  updateWorksheet,
  deleteWorksheet,
});

module.exports = {
  createWorksheet,
  getMonthlyWorksheets,
  updateWorksheet,
  deleteWorksheet,
};