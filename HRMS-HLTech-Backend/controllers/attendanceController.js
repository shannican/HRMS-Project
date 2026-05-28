const mongoose = require('mongoose');
const moment = require('moment');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceRequest = require('../models/AttendanceRequest');
const Holiday = require('../models/Holiday');
const Notification = require('../models/Notification');
const cron = require('node-cron');
const sendEmail = require('../utils/sendEmail');

// Pre-configured office location
const OFFICE_LOCATION = {
  latitude: 23.251955021598498,
  longitude: 77.46472966689575,
};
const OFFICE_RADIUS = 60; // 60 meters radius

// Function to calculate distance using Haversine formula (in meters)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  console.log('Calculating distance between:', { lat1, lon1, lat2, lon2 });
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  console.log('Calculated distance:', distance, 'meters');
  return distance;
};

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

// Utility function to check if a date is covered by an approved leave
const isOnApprovedLeave = async (employeeId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const LeaveRequest = require('../models/LeaveRequest');
  const leaveRequest = await LeaveRequest.findOne({
    employeeId,
    status: 'Approved',
    from: { $lte: endOfDay },
    to: { $gte: startOfDay },
  });

  if (leaveRequest) {
    console.log('Date is covered by approved leave:', { employeeId, date, leaveRequestId: leaveRequest._id });
    return true;
  }
  return false;
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

// Check In Attendance
const checkInAttendance = async (req, res) => {
  console.log('checkInAttendance called');
  const { latitude, longitude, bypassGeolocation } = req.body;
  const employeeId = req.user.id;
  const io = req.app.get('socketio');

  console.log('Request data:', { latitude, longitude, employeeId, bypassGeolocation });

  try {
    if (!bypassGeolocation && (typeof latitude !== 'number' || typeof longitude !== 'number')) {
      console.log('Invalid coordinates:', { latitude, longitude });
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    if (!employeeId) {
      console.log('Employee ID missing');
      return res.status(401).json({ message: 'Unauthorized: Employee ID missing' });
    }

    const user = await User.findById(employeeId);
    if (!user || user.role !== 'employee') {
      console.log('Employee not found or not an employee:', user);
      return res.status(403).json({ message: 'Only employees can check in' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const holidayCheck = await isHolidayOrSunday(today);
    if (holidayCheck.isSunday) {
      console.log('Cannot check in on a Sunday');
      return res.status(403).json({ message: 'Cannot check in on a Sunday' });
    }
    if (holidayCheck.isAssignedHoliday) {
      console.log('Cannot check in on an assigned holiday:', holidayCheck.reason);
      return res.status(403).json({ message: `Cannot check in on a holiday: ${holidayCheck.reason}` });
    }

    const isOnLeave = await isOnApprovedLeave(employeeId, today);
    if (isOnLeave) {
      console.log('Cannot check in on an approved leave day');
      return res.status(403).json({ message: 'Cannot check in on an approved leave day' });
    }

    if (!bypassGeolocation) {
      const distance = calculateDistance(latitude, longitude, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude);
      console.log('Distance from office:', distance, 'meters');
      if (distance > OFFICE_RADIUS) {
        console.log('Employee outside office radius');
        return res.status(403).json({ message: 'You must be inside the office to check in.' });
      }
    } else {
      console.log('Bypassing geolocation check');
    }

    const todayISOString = today.toISOString().split('T')[0];
    console.log('Checking existing attendance for:', { employeeId, todayISOString });

    const existingAttendance = await Attendance.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(employeeId),
          $expr: {
            $eq: [
              { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'UTC' } },
              todayISOString,
            ],
          },
        },
      },
    ]);
    console.log('Existing attendance for today:', existingAttendance);

    if (existingAttendance.length > 0) {
      console.log('Attendance already checked in for today');
      return res.status(400).json({ message: 'You have already checked in today' });
    }

    console.log('Creating new attendance record for check-in');
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const attendance = new Attendance({
      employeeId,
      date: today,
      checkInTime,
      location: {
        checkIn: bypassGeolocation ? { latitude: 0, longitude: 0 } : { latitude, longitude },
      },
      status: 'present',
      absent: false,
    });
    console.log('Attendance record before save:', attendance.toObject());
    await attendance.save();
    console.log('Saved check-in attendance record:', {
      employeeId: attendance.employeeId.toString(),
      date: attendance.date.toISOString(),
      checkInTime: attendance.checkInTime,
      location: attendance.location,
      status: attendance.status,
      absent: attendance.absent,
    });

    const adminHrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
    for (const adminHr of adminHrUsers) {
      await sendNotification(
        io,
        adminHr._id,
        `${user.fullName} checked in at ${checkInTime}`,
        'attendance'
      );
    }

    res.status(201).json({ message: `Checked in successfully for ${user.fullName} at ${checkInTime}` });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ message: 'Failed to check in: ' + error.message });
  }
};

// Check Out Attendance
const checkOutAttendance = async (req, res) => {
  console.log('checkOutAttendance called');
  const { latitude, longitude, bypassGeolocation } = req.body;
  const employeeId = req.user.id;
  const io = req.app.get('socketio');

  console.log('Request scrutinizing data:', { latitude, longitude, employeeId, bypassGeolocation });

  try {
    if (!bypassGeolocation && (typeof latitude !== 'number' || typeof longitude !== 'number')) {
      console.log('Invalid coordinates:', { latitude, longitude });
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    if (!employeeId) {
      console.log('Employee ID missing');
      return res.status(401).json({ message: 'Unauthorized: Employee ID missing' });
    }

    const user = await User.findById(employeeId);
    if (!user || user.role !== 'employee') {
      console.log('Employee not found or not an employee:', user);
      return res.status(403).json({ message: 'Only employees can check out' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const holidayCheck = await isHolidayOrSunday(today);
    if (holidayCheck.isSunday) {
      console.log('Cannot check out on a Sunday');
      return res.status(403).json({ message: 'Cannot check out on a Sunday' });
    }
    if (holidayCheck.isAssignedHoliday) {
      console.log('Cannot check out on an assigned holiday:', holidayCheck.reason);
      return res.status(403).json({ message: `Cannot check out on a holiday: ${holidayCheck.reason}` });
    }

    const isOnLeave = await isOnApprovedLeave(employeeId, today);
    if (isOnLeave) {
      console.log('Cannot check out on an approved leave day');
      return res.status(403).json({ message: 'Cannot check out on an approved leave day' });
    }

    if (!bypassGeolocation) {
      const distance = calculateDistance(latitude, longitude, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude);
      console.log('Distance from office:', distance, 'meters');
      if (distance > OFFICE_RADIUS) {
        console.log('Employee outside office radius');
        return res.status(403).json({ message: 'You must be inside the office to check out.' });
      }
    } else {
      console.log('Bypassing geolocation check');
    }

    const todayISOString = today.toISOString().split('T')[0];
    console.log('Checking existing attendance for:', { employeeId, todayISOString });

    const existingAttendance = await Attendance.findOne({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    console.log('Existing attendance for today:', existingAttendance);

    if (!existingAttendance) {
      console.log('No check-in record found for today');
      return res.status(400).json({ message: 'You must check in before checking out' });
    }

    if (!existingAttendance.checkInTime) {
      console.log('Check-in time is missing in the attendance record');
      return res.status(400).json({ message: 'Invalid attendance record: Check-in time is missing. Please check in again.' });
    }
    if (!existingAttendance.location || !existingAttendance.location.checkIn || 
        typeof existingAttendance.location.checkIn.latitude !== 'number' || 
        typeof existingAttendance.location.checkIn.longitude !== 'number') {
      console.log('Check-in location is missing or invalid in the attendance record');
      return res.status(400).json({ message: 'Invalid attendance record: Check-in location is missing or invalid. Please check in again.' });
    }

    if (existingAttendance.checkOutTime) {
      console.log('Already checked out for today');
      return res.status(400).json({ message: 'You have already checked out today' });
    }

    console.log('Updating attendance record for check-out');
    const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    existingAttendance.checkOutTime = checkOutTime;
    existingAttendance.location.checkOut = bypassGeolocation
      ? { latitude: 0, longitude: 0 }
      : { latitude, longitude };
    console.log('Attendance record before update:', existingAttendance.toObject());
    await existingAttendance.save();
    console.log('Updated attendance record with check-out:', {
      employeeId: existingAttendance.employeeId.toString(),
      date: existingAttendance.date.toISOString(),
      checkInTime: existingAttendance.checkInTime,
      checkOutTime: existingAttendance.checkOutTime,
      location: existingAttendance.location,
      status: existingAttendance.status,
      absent: existingAttendance.absent,
    });

    const adminHrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
    for (const adminHr of adminHrUsers) {
      await sendNotification(
        io,
        adminHr._id,
        `${user.fullName} checked out at ${checkOutTime}`,
        'attendance'
      );
    }

    res.status(200).json({ message: `Checked out successfully for ${user.fullName} at ${checkOutTime}` });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Failed to check out: ' + error.message });
  }
};

// Get My Attendance (for Employee)
const getMyAttendance = async (req, res) => {
  const employeeId = req.user.id;

  try {
    const user = await User.findById(employeeId);
    if (!user || user.role !== 'employee') {
      return res.status(403).json({ message: 'Only employees can view their own attendance' });
    }

    const attendanceRecords = await Attendance.find({ employeeId })
      .populate('employeeId', 'fullName email phoneNumber position profileImage')
      .sort({ date: -1 });

    const holidays = await Holiday.find();

    const now = new Date();
    const startOfPeriod = new Date(user.joiningDate || now);
    startOfPeriod.setUTCHours(0, 0, 0, 0);
    const endOfPeriod = new Date(now);
    endOfPeriod.setUTCHours(23, 59, 59, 999);

    const enrichedRecords = [];
    const currentDate = new Date(startOfPeriod);

    while (currentDate <= endOfPeriod) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingRecord = attendanceRecords.find(record =>
        new Date(record.date).toISOString().split('T')[0] === dateStr
      );

      if (existingRecord) {
        const holidayCheck = await isHolidayOrSunday(currentDate);
        if (holidayCheck.isAssignedHoliday) {
          enrichedRecords.push({
            ...existingRecord._doc,
            status: 'Holiday',
            holidayReason: holidayCheck.reason,
            absent: false,
          });
        } else if (holidayCheck.isSunday) {
          enrichedRecords.push({
            ...existingRecord._doc,
            status: existingRecord.status,
            holidayReason: 'N/A',
            absent: existingRecord.absent,
          });
        } else {
          enrichedRecords.push(existingRecord);
        }
      } else {
        const holidayCheck = await isHolidayOrSunday(currentDate);
        if (holidayCheck.isAssignedHoliday) {
          enrichedRecords.push({
            employeeId: user._id,
            date: new Date(currentDate),
            checkInTime: 'N/A',
            checkOutTime: 'N/A',
            location: { checkIn: { latitude: 0, longitude: 0 } },
            status: 'Holiday',
            holidayReason: holidayCheck.reason,
            absent: false,
          });
        } else if (holidayCheck.isSunday) {
          const isOnLeave = await isOnApprovedLeave(employeeId, currentDate);
          if (isOnLeave) {
            enrichedRecords.push({
              employeeId: user._id,
              date: new Date(currentDate),
              checkInTime: 'N/A',
              checkOutTime: 'N/A',
              location: { checkIn: { latitude: 0, longitude: 0 } },
              status: 'On Leave',
              holidayReason: 'N/A',
              absent: false,
            });
          } else {
            enrichedRecords.push({
              employeeId: user._id,
              date: new Date(currentDate),
              checkInTime: 'N/A',
              checkOutTime: 'N/A',
              location: { checkIn: { latitude: 0, longitude: 0 } },
              status: 'absent',
              holidayReason: 'N/A',
              absent: true,
            });
          }
        } else {
          const isOnLeave = await isOnApprovedLeave(employeeId, currentDate);
          if (isOnLeave) {
            enrichedRecords.push({
              employeeId: user._id,
              date: new Date(currentDate),
              checkInTime: 'N/A',
              checkOutTime: 'N/A',
              location: { checkIn: { latitude: 0, longitude: 0 } },
              status: 'On Leave',
              holidayReason: 'N/A',
              absent: false,
            });
          } else {
            enrichedRecords.push({
              employeeId: user._id,
              date: new Date(currentDate),
              checkInTime: 'N/A',
              checkOutTime: 'N/A',
              location: { checkIn: { latitude: 0, longitude: 0 } },
              status: 'absent',
              holidayReason: 'N/A',
              absent: true,
            });
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json(enrichedRecords);
  } catch (error) {
    console.error('Error fetching my attendance:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get Attendance by Employee
const getAttendanceByEmployee = async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.id;
  const requestingUserRole = req.user.role;
  const { month, year } = req.query;

  try {
    const user = await User.findById(id);
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (requestingUserRole === 'employee' && id !== requestingUserId) {
      return res.status(403).json({ message: 'Unauthorized: Employees can only view their own attendance' });
    }

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year query parameters are required' });
    }

    const selectedMonth = parseInt(month);
    const selectedYear = parseInt(year);

    if (isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
      return res.status(400).json({ message: 'Invalid month value. Must be between 1 and 12' });
    }

    if (isNaN(selectedYear)) {
      return res.status(400).json({ message: 'Invalid year value' });
    }

    const startOfMonth = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(selectedYear, selectedMonth, 0, 23, 59, 59, 999));

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    const endOfPeriod = endOfMonth > now ? now : endOfMonth;

    const joiningDate = user.joiningDate ? new Date(user.joiningDate) : new Date();
    joiningDate.setUTCHours(0, 0, 0, 0);
    let startOfPeriod = startOfMonth < joiningDate ? joiningDate : startOfMonth;

    if (startOfPeriod < startOfMonth) {
      startOfPeriod = new Date(startOfMonth);
    }

    console.log('Date range:', {
      startOfPeriod: startOfPeriod.toISOString(),
      endOfPeriod: endOfPeriod.toISOString(),
    });

    const attendanceRecords = await Attendance.find({
      employeeId: id,
      date: {
        $gte: startOfPeriod,
        $lte: endOfPeriod,
      },
    })
      .populate('employeeId', 'fullName email phoneNumber position profileImage employeeCode')
      .sort({ date: -1 });
    console.log(`Fetched attendance records for employee ${id}:`, attendanceRecords);

    const holidays = await Holiday.find({
      date: {
        $gte: startOfPeriod,
        $lte: endOfPeriod,
      },
    });
    console.log('Assigned Holidays:', holidays);

    const enrichedRecords = [];
    const currentDate = new Date(startOfPeriod);

    while (currentDate <= endOfPeriod) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingRecord = attendanceRecords.find(record =>
        new Date(record.date).toISOString().split('T')[0] === dateStr
      );

      console.log(`Checking date ${dateStr}:`, { existingRecord: existingRecord ? existingRecord._id : 'None' });

      if (existingRecord) {
        const holidayCheck = await isHolidayOrSunday(currentDate);
        if (holidayCheck.isAssignedHoliday) {
          enrichedRecords.push({
            ...existingRecord._doc,
            status: 'Holiday',
            holidayReason: holidayCheck.reason,
            absent: false,
          });
        } else if (holidayCheck.isSunday) {
          enrichedRecords.push({
            ...existingRecord._doc,
            status: existingRecord.status,
            holidayReason: 'N/A',
            absent: existingRecord.absent,
          });
        } else {
          enrichedRecords.push({
            ...existingRecord._doc,
            status: existingRecord.status || 'absent',
          });
        }
      } else {
        const holidayCheck = await isHolidayOrSunday(currentDate);
        if (holidayCheck.isAssignedHoliday) {
          enrichedRecords.push({
            employeeId: user,
            date: new Date(currentDate),
            checkInTime: 'N/A',
            checkOutTime: 'N/A',
            location: { checkIn: { latitude: 0, longitude: 0 } },
            status: 'Holiday',
            holidayReason: holidayCheck.reason,
            absent: false,
          });
        } else if (holidayCheck.isSunday) {
          const isOnLeave = await isOnApprovedLeave(id, currentDate);
          if (isOnLeave) {
            enrichedRecords.push({
              employeeId: user,
              date: new Date(currentDate),
              checkInTime: 'N/A',
              checkOutTime: 'N/A',
              location: { checkIn: { latitude: 0, longitude: 0 } },
              status: 'On Leave',
              holidayReason: 'N/A',
              absent: false,
            });
          } else {
            enrichedRecords.push({
              employeeId: user,
              date: new Date(currentDate),
              checkInTime: 'N/A',
              checkOutTime: 'N/A',
              location: { checkIn: { latitude: 0, longitude: 0 } },
              status: 'absent',
              holidayReason: 'N/A',
              absent: true,
            });
          }
        } else {
          const isOnLeave = await isOnApprovedLeave(id, currentDate);
          if (isOnLeave) {
            enrichedRecords.push({
              employeeId: user,
              date: new Date(currentDate),
              checkInTime: 'N/A',
              checkOutTime: 'N/A',
              location: { checkIn: { latitude: 0, longitude: 0 } },
              status: 'On Leave',
              holidayReason: 'N/A',
              absent: false,
            });
          } else {
            enrichedRecords.push({
              employeeId: user,
              date: new Date(currentDate),
              checkInTime: 'N/A',
              checkOutTime: 'N/A',
              location: { checkIn: { latitude: 0, longitude: 0 } },
              status: 'absent',
              holidayReason: 'N/A',
              absent: true,
            });
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Enriched records for employee ${id}:`, enrichedRecords);
    res.json(enrichedRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get All Attendance
const getAllAttendance = async (req, res) => {
  try {
    const requestingUserRole = req.user.role;
    if (requestingUserRole !== 'admin' && requestingUserRole !== 'hr') {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can view all attendance records' });
    }

    const attendanceRecords = await Attendance.find()
      .populate('employeeId', 'fullName email phoneNumber position profileImage employeeCode')
      .sort({ date: -1 });

    const holidays = await Holiday.find();

    const enrichedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        const holidayCheck = await isHolidayOrSunday(record.date);
        if (holidayCheck.isAssignedHoliday) {
          return {
            ...record._doc,
            status: 'Holiday',
            holidayReason: holidayCheck.reason,
            absent: false,
          };
        } else if (holidayCheck.isSunday) {
          return {
            ...record._doc,
            status: record.status,
            holidayReason: 'N/A',
            absent: record.absent,
          };
        }
        return {
          ...record._doc,
          status: record.status || 'absent',
        };
      })
    );

    res.json(enrichedRecords);
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get Monthly Attendance Stats
const getMonthlyAttendanceStats = async (req, res) => {
  const { employeeId } = req.params;
  const requestingUserId = req.user.id;
  const requestingUserRole = req.user.role;

  try {
    const user = await User.findById(employeeId);
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (requestingUserRole === 'employee' && employeeId !== requestingUserId) {
      return res.status(403).json({ message: 'Unauthorized: Employees can only view their own attendance stats' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      employeeId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const holidays = await Holiday.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    let workingDays = 0;
    let holidayCount = 0;
    const currentDate = new Date(startOfMonth);
    while (currentDate <= endOfMonth) {
      const holidayCheck = await isHolidayOrSunday(currentDate);
      const isOnLeave = await isOnApprovedLeave(employeeId, currentDate);
      if (holidayCheck.isSunday) {
        // Skip Sundays
      } else if (holidayCheck.isAssignedHoliday) {
        holidayCount++;
      } else if (!isOnLeave) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const presentCount = attendanceRecords.filter((record) => record.status === 'present').length;
    const absentCount = attendanceRecords.filter((record) => record.status === 'absent').length;

    res.json({ presentCount, absentCount, workingDays, holidayCount });
  } catch (error) {
    console.error('Error fetching monthly attendance stats:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get Absent Days for a Specific Month
const getAbsentDays = async (req, res) => {
  const { employeeId, month, year } = req.params;
  const requestingUserId = req.user.id;
  const requestingUserRole = req.user.role;

  try {
    const user = await User.findById(employeeId);
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (requestingUserRole === 'employee' && employeeId !== requestingUserId) {
      return res.status(403).json({ message: 'Unauthorized: Employees can only view their own absent days' });
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      employeeId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const absentDays = attendanceRecords
      .filter(record => record.status === 'absent')
      .map(record => new Date(record.date).toISOString().split('T')[0]);

    res.json({ absentDays });
  } catch (error) {
    console.error('Error fetching absent days:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get Present Days for a Specific Month
const getPresentDays = async (req, res) => {
  const { employeeId, month, year } = req.params;
  const requestingUserId = req.user.id;
  const requestingUserRole = req.user.role;

  try {
    const user = await User.findById(employeeId);
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (requestingUserRole === 'employee' && employeeId !== requestingUserId) {
      return res.status(403).json({ message: 'Unauthorized: Employees can only view their own present days' });
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      employeeId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const presentDays = attendanceRecords
      .filter(record => record.status === 'present')
      .map(record => new Date(record.date).toISOString().split('T')[0]);

    res.json({ presentDays });
  } catch (error) {
    console.error('Error fetching present days:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Request Attendance
const requestAttendance = async (req, res) => {
  const { date, checkInTime, checkOutTime, reason } = req.body;
  const employeeId = req.user.id;

  try {
    const user = await User.findById(employeeId);
    if (!user || user.role !== 'employee') {
      return res.status(403).json({ message: 'Only employees can request attendance' });
    }

    if (!date || !checkInTime || !checkOutTime || !reason) {
      return res.status(400).json({ message: 'All fields (date, checkInTime, checkOutTime, reason) are required' });
    }

    const requestDate = new Date(date);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (requestDate > today) {
      return res.status(400).json({ message: 'Cannot request attendance for future dates' });
    }

    const holidayCheck = await isHolidayOrSunday(requestDate);
    if (holidayCheck.isSunday) {
      return res.status(400).json({ message: 'Cannot request attendance for a Sunday' });
    }
    if (holidayCheck.isAssignedHoliday) {
      return res.status(400).json({ message: `Cannot request attendance on an assigned holiday: ${holidayCheck.reason}` });
    }

    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: requestDate,
        $lt: new Date(requestDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'An attendance record already exists for this date' });
    }

    const existingRequest = await AttendanceRequest.findOne({
      employeeId,
      date: {
        $gte: requestDate,
        $lt: new Date(requestDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending attendance request already exists for this date' });
    }

    const attendanceRequest = new AttendanceRequest({
      employeeId,
      date: requestDate,
      checkInTime,
      checkOutTime,
      reason,
      status: 'pending',
    });

    await attendanceRequest.save();

    const io = req.app.get('socketio');
    const adminHrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
    for (const adminHr of adminHrUsers) {
      await sendNotification(
        io,
        adminHr._id,
        `${user.fullName} submitted an attendance request for ${moment(requestDate).format('MMM DD, YYYY')} (Check-In: ${checkInTime}, Check-Out: ${checkOutTime}). Reason: ${reason}`,
        'attendance_request'
      );
    }

    res.status(201).json({ message: 'Attendance request submitted successfully' });
  } catch (error) {
    console.error('Error submitting attendance request:', error);
    res.status(500).json({ message: 'Failed to submit attendance request: ' + error.message });
  }
};

// Get All Pending Attendance Requests
const getPendingAttendanceRequests = async (req, res) => {
  try {
    const requestingUserRole = req.user.role;
    if (requestingUserRole !== 'admin' && requestingUserRole !== 'hr') {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can view attendance requests' });
    }

    const pendingRequests = await AttendanceRequest.find({ status: 'pending' })
      .populate('employeeId', 'fullName email employeeCode')
      .sort({ createdAt: -1 });

    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending attendance requests:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Approve or Reject Attendance Request
const handleAttendanceRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  const io = req.app.get('socketio');
  const requesterId = req.user.id;

  try {
    const requestingUserRole = req.user.role;
    if (requestingUserRole !== 'admin' && requestingUserRole !== 'hr') {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can handle attendance requests' });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject"' });
    }

    const attendanceRequest = await AttendanceRequest.findById(requestId)
      .populate('employeeId', 'fullName email');
    if (!attendanceRequest) {
      return res.status(404).json({ message: 'Attendance request not found' });
    }

    if (attendanceRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    attendanceRequest.status = action === 'approve' ? 'approved' : 'rejected';
    await attendanceRequest.save();

    if (action === 'approve') {
      // Create or update the attendance record
      const startOfDay = new Date(attendanceRequest.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(attendanceRequest.date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      let attendanceRecord = await Attendance.findOne({
        employeeId: attendanceRequest.employeeId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (attendanceRecord) {
        // Update existing record
        attendanceRecord.checkInTime = attendanceRequest.checkInTime;
        attendanceRecord.checkOutTime = attendanceRequest.checkOutTime;
        attendanceRecord.status = 'present';
        attendanceRecord.absent = false;
        attendanceRecord.location = {
          checkIn: { latitude: 0, longitude: 0 },
          checkOut: { latitude: 0, longitude: 0 },
        };
      } else {
        // Create new record
        attendanceRecord = new Attendance({
          employeeId: attendanceRequest.employeeId,
          date: attendanceRequest.date,
          checkInTime: attendanceRequest.checkInTime,
          checkOutTime: attendanceRequest.checkOutTime,
          location: {
            checkIn: { latitude: 0, longitude: 0 },
            checkOut: { latitude: 0, longitude: 0 },
          },
          status: 'present',
          absent: false,
        });
      }

      await attendanceRecord.save();
    }

    // Notify the employee
    await sendNotification(
      io,
      attendanceRequest.employeeId._id,
      `Your attendance request for ${moment(attendanceRequest.date).format('MMM DD, YYYY')} has been ${attendanceRequest.status.toUpperCase()} by ${req.user.fullName}.`,
      'attendance_request'
    );

    // Notify other HR/admin users (excluding the requester) with the reason
    const adminHrUsers = await User.find({
      role: { $in: ['admin', 'hr'] },
      _id: { $ne: requesterId },
    });
    for (const adminHr of adminHrUsers) {
      await sendNotification(
        io,
        adminHr._id,
        `${attendanceRequest.employeeId.fullName}'s attendance request for ${moment(attendanceRequest.date).format('MMM DD, YYYY')} (Check-In: ${attendanceRequest.checkInTime}, Check-Out: ${attendanceRequest.checkOutTime}) has been ${attendanceRequest.status.toUpperCase()} by ${req.user.fullName}. Reason: ${attendanceRequest.reason}`,
        'attendance_request'
      );
    }

    // Optionally, send email to the employee
    try {
      await sendEmail({
        to: attendanceRequest.employeeId.email,
        subject: `Attendance Request ${attendanceRequest.status.charAt(0).toUpperCase() + attendanceRequest.status.slice(1)}`,
        text: `Dear ${attendanceRequest.employeeId.fullName},\n\nYour attendance request for ${moment(attendanceRequest.date).format('MMM DD, YYYY')} has been ${attendanceRequest.status.toUpperCase()} by ${req.user.fullName}.\n\nBest regards,\nHRMS Team`,
      });
      console.log(`Email sent to ${attendanceRequest.employeeId.email}`);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.json({ message: `Attendance request ${attendanceRequest.status} successfully` });
  } catch (error) {
    console.error('Error handling attendance request:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Cron Job for Daily Attendance Check
cron.schedule(
  '0 0 * * *',
  async () => {
    try {
      console.log('Running daily attendance check at 12 AM UTC');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      const holidayCheck = await isHolidayOrSunday(yesterday);
      if (holidayCheck.isSunday) {
        console.log('Skipping attendance check for Sunday:', yesterday.toLocaleDateString());
        return;
      }
      if (holidayCheck.isAssignedHoliday) {
        console.log('Skipping attendance check for assigned holiday:', holidayCheck.reason);
        return;
      }

      const users = await User.find({ role: 'employee' });

      const yesterdayAttendance = await Attendance.find({
        date: {
          $gte: yesterday,
          $lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      const presentUserIds = yesterdayAttendance.map((record) => record.employeeId.toString());
      const absentUsers = users.filter(
        (user) => !presentUserIds.includes(user._id.toString())
      );

      const io = require('../server').io;
      for (const user of absentUsers) {
        const isOnLeave = await isOnApprovedLeave(user._id, yesterday);
        if (isOnLeave) {
          console.log(`Employee ${user.fullName} is on approved leave for ${yesterday.toLocaleDateString()}`);
          const attendance = new Attendance({
            employeeId: user._id,
            date: yesterday,
            checkInTime: 'N/A',
            location: {
              checkIn: { latitude: 0, longitude: 0 },
            },
            status: 'On Leave',
            absent: false,
          });
          await attendance.save();
          continue;
        }

        const attendance = new Attendance({
          employeeId: user._id,
          date: yesterday,
          checkInTime: 'N/A',
          location: {
            checkIn: { latitude: 0, longitude: 0 },
          },
          status: 'absent',
          absent: true,
        });
        await attendance.save();

        try {
          await sendEmail({
            to: user.email,
            subject: 'You are marked absent today',
            text: `Dear ${user.fullName},\n\nYou did not check in on ${yesterday.toLocaleDateString()}. You have been marked absent for this day.\n\nBest regards,\nHRMS Team`,
          });
          console.log(`Absent email sent to ${user.email}`);
        } catch (emailError) {
          console.error('Failed to send absent email:', emailError);
        }

        const adminHrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
        for (const adminHr of adminHrUsers) {
          await sendNotification(
            io,
            adminHr._id,
            `${user.fullName} was marked absent for ${yesterday.toLocaleDateString()}`,
            'attendance'
          );
        }

        console.log(
          `Marked ${user.fullName} as absent for ${yesterday.toLocaleDateString()} and sent email/notifications`
        );
      }
    } catch (error) {
      console.error('Error in daily attendance check:', error);
    }
  },
  {
    scheduled: true,
    timezone: 'UTC',
  }
);

module.exports = {
  checkInAttendance,
  checkOutAttendance,
  getMyAttendance,
  getAttendanceByEmployee,
  getAllAttendance,
  getMonthlyAttendanceStats,
  getAbsentDays,
  getPresentDays,
  requestAttendance,
  getPendingAttendanceRequests,
  handleAttendanceRequest,
};
