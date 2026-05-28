const Holiday = require('../models/Holiday');
const User = require('../models/User');
const Notification = require('../models/Notification');
const moment = require('moment');

// Utility function to check if a date is a Sunday or a holiday
const isHolidayOrSunday = async (date) => {
  const day = date.getDay();
  const isSunday = day === 0;
  if (isSunday) {
    console.log('Date is a Sunday:', date);
    return { isSunday: true, isAssignedHoliday: false, reason: 'Sunday' };
  }

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const holiday = await Holiday.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (holiday) {
    console.log('Date is a holiday:', { date, reason: holiday.reason, type: holiday.type });
    if (holiday.type === 'Sunday') {
      return { isSunday: true, isAssignedHoliday: false, reason: 'Sunday' };
    }
    return { isSunday: false, isAssignedHoliday: true, reason: holiday.reason };
  }

  return { isSunday: false, isAssignedHoliday: false };
};

// Utility function to send notifications
const sendNotification = async (io, receiverId, message, type) => {
  try {
    const notification = new Notification({
      receiverId,
      message,
      type,
      read: false,
    });
    await notification.save();
    console.log(`Notification saved for user ${receiverId}:`, notification);

    io.to(receiverId.toString()).emit('newNotification', {
      _id: notification._id,
      receiverId: notification.receiverId,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt,
    });
    console.log(`Real-time notification sent to user ${receiverId}: ${message}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Get All Holidays
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    console.log('Holidays fetched:', holidays);
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Create Holiday
const createHoliday = async (req, res) => {
  const { date, reason, type } = req.body;
  const io = req.app.get('socketio');

  console.log('Creating holiday:', { date, reason, type });

  try {
    if (!date || !reason) {
      console.log('Missing fields:', { date, reason });
      return res.status(400).json({ message: 'Date and reason are required' });
    }

    const validTypes = ['Assigned', 'Sunday'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const holidayDate = new Date(date);
    holidayDate.setUTCHours(0, 0, 0, 0);

    const holidayCheck = await isHolidayOrSunday(holidayDate);
    if (holidayCheck.isSunday && type === 'Assigned') {
      console.log('Cannot create an Assigned holiday on a Sunday:', holidayDate);
      return res.status(400).json({ message: 'Cannot create an Assigned holiday on a Sunday' });
    }

    const existingHoliday = await Holiday.findOne({
      date: {
        $gte: holidayDate,
        $lt: new Date(holidayDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingHoliday) {
      console.log('Holiday already exists on this date:', existingHoliday);
      return res.status(400).json({ message: 'A holiday already exists on this date' });
    }

    const holiday = new Holiday({
      date: holidayDate,
      reason,
      type,
    });

    console.log('Holiday before save:', holiday.toObject());
    await holiday.save();
    console.log('Holiday saved:', holiday.toObject());

    if (type === 'Assigned') {
      const employees = await User.find({ role: 'employee' });
      for (const employee of employees) {
        await sendNotification(
          io,
          employee._id,
          `A new holiday has been declared on ${holidayDate.toLocaleDateString()}: ${reason}`,
          'holiday'
        );
      }
    }

    res.status(201).json({ message: 'Holiday created successfully', holiday });
  } catch (error) {
    console.error('Error creating holiday:', error);
    res.status(500).json({ message: 'Failed to create holiday: ' + error.message });
  }
};

// Delete Holiday
const deleteHoliday = async (req, res) => {
  const { id } = req.params;

  console.log('Deleting holiday with ID:', id);

  try {
    const holiday = await Holiday.findById(id);
    if (!holiday) {
      console.log('Holiday not found:', id);
      return res.status(404).json({ message: 'Holiday not found' });
    }

    await holiday.deleteOne();
    console.log('Holiday deleted:', id);

    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ message: 'Failed to delete holiday: ' + error.message });
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  deleteHoliday,
};
