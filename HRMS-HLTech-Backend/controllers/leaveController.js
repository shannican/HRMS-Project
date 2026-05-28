const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const Holiday = require('../models/Holiday');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const mongoose = require('mongoose');

// Utility function to determine the financial year based on a date
const getFinancialYear = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  if (month >= 4) {
    return `${year}-${year + 1}`; // e.g., April 2025 to March 2026 -> "2025-2026"
  } else {
    return `${year - 1}-${year}`; // e.g., January 2025 to March 2025 -> "2024-2025"
  }
};

// Utility function to get the financial year month (April=1, March=12)
const getFinancialYearMonth = (date) => {
  const month = date.getMonth() + 1; // 1-12
  return month >= 4 ? month - 3 : month + 9; // April=1, May=2, ..., March=12
};

// Utility function to check if a date is a Sunday or a holiday
const isHolidayOrSunday = async (date) => {
  const day = date.getDay();
  if (day === 0) {
    console.log('Date is a Sunday:', date);
    return { isHoliday: true, reason: 'Sunday' };
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
    console.log('Date is a holiday:', { date, reason: holiday.reason });
    return { isHoliday: true, reason: holiday.reason };
  }

  return { isHoliday: false };
};

// Utility function to calculate working days (excluding Sundays and holidays)
const calculateWorkingDays = async (fromDate, toDate) => {
  let workingDays = 0;
  let currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    const holidayCheck = await isHolidayOrSunday(currentDate);
    if (!holidayCheck.isHoliday) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return workingDays;
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
    console.log(`Real-time notification sent to user ${receiverId}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Utility function to adjust EL based on joining date (for yearly credited leaves)
const adjustELBasedOnJoiningDate = (employee, financialYear, creditedEL) => {
  const joiningDate = new Date(employee.joiningDate);
  const joiningFinancialYear = getFinancialYear(joiningDate);
  const joiningFinancialMonth = getFinancialYearMonth(joiningDate);

  if (financialYear !== joiningFinancialYear) {
    return creditedEL; // No adjustment for subsequent financial years
  }

  const missedMonths = joiningFinancialMonth - 1; // Months missed from April (April=1)
  const fullYearEL = 12; // Default full-year EL (1 per month)
  const monthlyELRate = fullYearEL / 12; // 1 EL per month
  const reduction = missedMonths * monthlyELRate; // Proportional reduction
  const adjustedEL = Math.max(0, creditedEL - reduction); // Ensure EL doesn't go negative
  console.log(`Adjusted EL for employee ${employee._id} in financial year ${financialYear}: ${adjustedEL} (missed ${missedMonths} months, original ${creditedEL})`);
  return adjustedEL;
};

const getOrInitializeLeaveBalance = async (employeeId, financialYear) => {
  let leaveBalance = await LeaveBalance.findOne({ employeeId });
  if (!leaveBalance) {
    leaveBalance = new LeaveBalance({
      employeeId,
      yearlyBalances: [],
      monthlyEnApplications: [],
    });
  }

  const employee = await User.findById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  const joiningDate = new Date(employee.joiningDate);
  const joiningFinancialYear = getFinancialYear(joiningDate);
  const joiningFinancialMonth = getFinancialYearMonth(joiningDate);

  let migrated = false;
  for (let i = 0; i < leaveBalance.yearlyBalances.length; i++) {
    const yb = leaveBalance.yearlyBalances[i];
    if (!yb.financialYear) {
      let yearToUse;
      if (yb.year) {
        yearToUse = yb.year;
      } else {
        console.warn(`yearlyBalances[${i}] missing both year and financialYear for employee ${employeeId}, defaulting to creation year`);
        yearToUse = new Date(leaveBalance.createdAt).getFullYear();
      }
      yb.financialYear = yearToUse >= 2024 ? `${yearToUse}-${yearToUse + 1}` : `${yearToUse - 1}-${yearToUse}`;
      yb.startMonth = yb.financialYear === joiningFinancialYear ? joiningFinancialMonth : 1;
      if (yb.year) {
        delete yb.year;
      }
      migrated = true;
    }
  }

  for (let i = 0; i < leaveBalance.monthlyEnApplications.length; i++) {
    const app = leaveBalance.monthlyEnApplications[i];
    if (!app.financialYear) {
      let yearToUse;
      if (app.year) {
        yearToUse = app.year;
      } else {
        console.warn(`monthlyEnApplications[${i}] missing both year and financialYear for employee ${employeeId}, defaulting to creation year`);
        yearToUse = new Date(leaveBalance.createdAt).getFullYear();
      }
      app.financialYear = yearToUse >= 2024 ? `${yearToUse}-${yearToUse + 1}` : `${yearToUse - 1}-${yearToUse}`;
      if (app.year) {
        delete app.year;
      }
      migrated = true;
    }
    // Ensure pending field exists
    if (typeof app.pending === 'undefined') {
      app.pending = 0;
      migrated = true;
    }
  }

  if (migrated) {
    console.log(`Migrating LeaveBalance for employee ${employeeId}...`);
    try {
      await leaveBalance.save();
      console.log(`Migration successful for employee ${employeeId}`);
    } catch (error) {
      console.error(`Migration failed for employee ${employeeId}:`, error);
      throw new Error('Failed to migrate LeaveBalance document: ' + error.message);
    }
  }

  let yearlyBalance = leaveBalance.yearlyBalances.find((yb) => yb.financialYear === financialYear);
  if (!yearlyBalance) {
    const defaultEL = 12;
    const adjustedEL = adjustELBasedOnJoiningDate(employee, financialYear, defaultEL);
    yearlyBalance = {
      financialYear: financialYear,
      startMonth: financialYear === joiningFinancialYear ? joiningFinancialMonth : 1,
      en: {
        credited: adjustedEL,
        used: 0,
        carriedForward: 0,
      },
      cl: {
        firstHalf: { credited: 4, used: 0 },
        secondHalf: { credited: 4, used: 0 },
      },
      fl: {
        firstHalf: { credited: 1, used: 0 },
        secondHalf: { credited: 1, used: 0 },
      },
      unpaid: 0,
      unpaidHalf: 0,
    };
    leaveBalance.yearlyBalances.push(yearlyBalance);

    const startMonth = financialYear === joiningFinancialYear ? joiningFinancialMonth : 1;
    for (let month = startMonth; month <= 12; month++) {
      const existingApp = leaveBalance.monthlyEnApplications.find(
        (app) => app.financialYear === financialYear && app.month === month
      );
      if (!existingApp) {
        leaveBalance.monthlyEnApplications.push({
          financialYear,
          month,
          hasApplied: false,
          credited: 1,
          used: 0,
          pending: 0, // Initialize pending
          carriedForward: 0,
        });
      }
    }
  }

  const [startYear] = financialYear.split('-').map(Number);
  const prevFinancialYear = `${startYear - 1}-${startYear}`;
  const prevYearBalance = leaveBalance.yearlyBalances.find((yb) => yb.financialYear === prevFinancialYear);
  if (prevYearBalance) {
    const unusedEnLeaves = prevYearBalance.en.credited - prevYearBalance.en.used;
    yearlyBalance.en.carriedForward = unusedEnLeaves > 0 ? unusedEnLeaves : 0;
  }

  const currentDate = new Date();
  const currentFinancialMonth = getFinancialYearMonth(currentDate);
  const sortedMonthlyApps = leaveBalance.monthlyEnApplications
    .filter((app) => app.financialYear === financialYear)
    .sort((a, b) => a.month - b.month);

  for (let i = 0; i < sortedMonthlyApps.length; i++) {
    const app = sortedMonthlyApps[i];
    if (app.month > currentFinancialMonth) break;

    let availableThisMonth = app.credited + app.carriedForward - app.used - app.pending;

    if (!app.hasApplied && i + 1 < sortedMonthlyApps.length) {
      const nextApp = sortedMonthlyApps[i + 1];
      const unusedLeaves = Math.min(availableThisMonth, 1);
      nextApp.carriedForward = Math.min(nextApp.carriedForward + unusedLeaves, 1);
    }
  }

  console.log(`Saving LeaveBalance for employee ${employeeId}...`);
  try {
    await leaveBalance.save();
    console.log(`LeaveBalance saved successfully for employee ${employeeId}`);
  } catch (error) {
    console.error(`Failed to save LeaveBalance for employee ${employeeId}:`, error);
    throw new Error('Failed to save LeaveBalance: ' + error.message);
  }

  return leaveBalance;
};

const submitLeaveRequest = async (req, res) => {
  const { leaveType, from, to, isHalfDay, reason } = req.body;
  const employeeId = req.user.id;
  const io = req.app.get('socketio');

  console.log('Submit leave request:', { employeeId, leaveType, from, to, isHalfDay, reason });

  try {
    if (!leaveType || !from || !to || !reason) {
      console.log('Missing fields:', { leaveType, from, to, reason });
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!employeeId) {
      console.log('Employee ID missing in request');
      return res.status(401).json({ message: 'Unauthorized: Employee ID missing' });
    }

    const user = await User.findById(employeeId);
    if (!user || user.role !== 'employee') {
      console.log('Employee not found or not an employee:', user);
      return res.status(403).json({ message: 'Only employees can submit leave requests' });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ message: 'Invalid date format for From or To date' });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ message: 'From date must be before To date' });
    }

    const totalDays = calculateDays(fromDate, toDate);
    const workingDays = await calculateWorkingDays(fromDate, toDate);
    const leaveDeduction = isHalfDay ? workingDays * 0.5 : workingDays;

    const financialYear = getFinancialYear(fromDate);
    const financialMonth = getFinancialYearMonth(fromDate);
    const isFirstHalf = financialMonth <= 6;

    let normalizedLeaveType = leaveType.toUpperCase();
    let halfDayType = null;
    if (isHalfDay) {
      if (!['EN_HALF', 'CL_HALF', 'FL_HALF', 'UNPAID_HALF'].includes(normalizedLeaveType)) {
        return res.status(400).json({ message: 'Invalid half-day leave type. Must be one of: EN_HALF, CL_HALF, FL_HALF, UNPAID_HALF' });
      }
      halfDayType = normalizedLeaveType;
      normalizedLeaveType = normalizedLeaveType.replace('_HALF', '');
    } else {
      if (!['EN', 'CL', 'FL', 'UNPAID'].includes(normalizedLeaveType)) {
        return res.status(400).json({ message: 'Invalid leave type. Must be one of: EN, CL, FL, UNPAID' });
      }
    }

    const leaveBalance = await getOrInitializeLeaveBalance(employeeId, financialYear);
    const yearlyBalance = leaveBalance.yearlyBalances.find((yb) => yb.financialYear === financialYear);

    let enApplication = null;
    if (normalizedLeaveType === 'EN') {
      enApplication = leaveBalance.monthlyEnApplications.find(
        (app) => app.financialYear === financialYear && app.month === financialMonth
      );
      if (!enApplication) {
        return res.status(500).json({ message: 'No monthly EN application found for this financial year and month' });
      }
      if (enApplication.hasApplied) {
        return res.status(400).json({ message: 'Only one Earn Leave application is allowed per month' });
      }

      const currentDate = new Date();
      const currentFinancialMonth = getFinancialYearMonth(currentDate);
      let simulatedAvailable = enApplication.credited + enApplication.carriedForward - enApplication.used - enApplication.pending;

      if (financialMonth > currentFinancialMonth) {
        const sortedMonthlyApps = leaveBalance.monthlyEnApplications
          .filter((app) => app.financialYear === financialYear)
          .sort((a, b) => a.month - b.month);

        let carryForward = 0;
        for (let i = 0; i < sortedMonthlyApps.length; i++) {
          const app = sortedMonthlyApps[i];
          if (app.month > financialMonth) break;

          let availableThisMonth = app.credited + carryForward - app.used - app.pending;
          simulatedAvailable = availableThisMonth;

          if (!app.hasApplied && app.month < financialMonth) {
            carryForward = Math.min(availableThisMonth, 1);
          } else {
            carryForward = 0;
          }
        }
      }

      if (simulatedAvailable < leaveDeduction) {
        return res.status(400).json({ message: `Insufficient Earn Leave balance for this month. Available: ${simulatedAvailable}, Requested: ${leaveDeduction}` });
      }
    } else if (normalizedLeaveType === 'CL') {
      const clPeriod = isFirstHalf ? yearlyBalance.cl.firstHalf : yearlyBalance.cl.secondHalf;
      const availableClLeaves = clPeriod.credited - clPeriod.used;
      if (availableClLeaves < leaveDeduction) {
        return res.status(400).json({ message: `Insufficient Casual Leave balance for this period. Available: ${availableClLeaves}, Requested: ${leaveDeduction}` });
      }
    } else if (normalizedLeaveType === 'FL') {
      const flPeriod = isFirstHalf ? yearlyBalance.fl.firstHalf : yearlyBalance.fl.secondHalf;
      const availableFlLeaves = flPeriod.credited - flPeriod.used;
      if (availableFlLeaves < leaveDeduction) {
        return res.status(400).json({ message: `Insufficient Flexi Leave balance for this period. Available: ${availableFlLeaves}, Requested: ${leaveDeduction}` });
      }
    }

    const leaveRequest = new LeaveRequest({
      employeeId,
      leaveType: normalizedLeaveType,
      fromDate,
      toDate,
      isHalfDay,
      halfDayType,
      reason,
      status: 'Pending',
      approvedBy: null,
      approvedAt: null,
      totalDays,
      workingDays,
    });

    console.log('Leave request before save:', leaveRequest.toObject());
    await leaveRequest.save();
    console.log('Leave request saved:', leaveRequest.toObject());

    if (normalizedLeaveType === 'EN') {
      if (enApplication) {
        enApplication.hasApplied = true;
        enApplication.pending += leaveDeduction; // Reserve the leave as pending
        await leaveBalance.save();
      } else {
        console.error('enApplication not found for marking as applied');
        return res.status(500).json({ message: 'Failed to mark EN application as applied' });
      }
    }

    const adminHrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
    for (const adminHr of adminHrUsers) {
      await sendNotification(
        io,
        adminHr._id,
        `${user.fullName} submitted a leave request from ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`,
        'leave'
      );
    }

    res.status(201).json({ message: 'Leave request submitted successfully' });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ message: 'Failed to submit leave request: ' + error.message });
  }
};

// Get All Leave Requests - With Filtering for Admin
const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, leaveType, startDate, endDate } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = {};

    if (userRole === 'employee') {
      query.employeeId = userId;
    }

    // Apply filters for admin
    if (userRole === 'admin' || userRole === 'hr') {
      if (status) {
        query.status = status;
      }
      if (leaveType) {
        query.leaveType = leaveType.toUpperCase();
      }
      if (startDate && endDate) {
        query.fromDate = { $gte: new Date(startDate) };
        query.toDate = { $lte: new Date(endDate) };
      } else if (startDate) {
        query.fromDate = { $gte: new Date(startDate) };
      } else if (endDate) {
        query.toDate = { $lte: new Date(endDate) };
      }
    }

    console.log('Fetching leave requests with filter:', query);

    const leaveRequests = await LeaveRequest.find(query)
      .populate({
        path: 'employeeId',
        select: 'fullName',
        match: { _id: { $exists: true } },
      })
      .sort({ createdAt: -1 });

    const leaveRequestsWithBalances = await Promise.all(
      leaveRequests.map(async (request) => {
        if (!request.employeeId) return null; // Skip if employeeId is null
        const leaveBalance = await LeaveBalance.findOne({ employeeId: request.employeeId._id });
        const financialYear = getFinancialYear(new Date(request.fromDate));
        const yearlyBalance = leaveBalance?.yearlyBalances.find((yb) => yb.financialYear === financialYear) || {
          en: { credited: 0, used: 0, carriedForward: 0 },
          cl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
          fl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
          unpaid: 0,
          unpaidHalf: 0,
        };
        return {
          ...request._doc,
          leaveBalance: {
            financialYear: financialYear,
            en: {
              credited: yearlyBalance.en.credited,
              used: yearlyBalance.en.used,
              carriedForward: yearlyBalance.en.carriedForward,
              available: yearlyBalance.en.credited + yearlyBalance.en.carriedForward - yearlyBalance.en.used,
            },
            cl: {
              firstHalf: yearlyBalance.cl.firstHalf,
              secondHalf: yearlyBalance.cl.secondHalf,
            },
            fl: {
              firstHalf: yearlyBalance.fl.firstHalf,
              secondHalf: yearlyBalance.fl.secondHalf,
            },
            unpaid: yearlyBalance.unpaid,
            unpaidHalf: yearlyBalance.unpaidHalf,
            monthlyEnLeaves: leaveBalance.monthlyEnApplications
              .filter((app) => app.financialYear === financialYear)
              .map((app) => ({
                month: app.month,
                credited: app.credited,
                used: app.used,
                carriedForward: app.carriedForward,
                available: app.credited + app.carriedForward - app.used,
              })),
          },
        };
      })
    );

    const filteredLeaveRequests = leaveRequestsWithBalances.filter((request) => request !== null);

    console.log('Leave requests returned:', filteredLeaveRequests);

    if (filteredLeaveRequests.length === 0) {
      console.log('No valid leave requests found after filtering');
      return res.status(200).json([]);
    }

    res.json(filteredLeaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const hrId = req.user.id;
  const io = req.app.get('socketio');

  console.log('Update leave request:', { id, status, hrId });

  try {
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      console.log('Invalid status:', status);
      return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected' });
    }

    const hr = await User.findById(hrId);
    if (!hr || (hr.role !== 'admin' && hr.role !== 'hr')) {
      console.log('User not authorized:', hr ? hr.role : 'User not found');
      return res.status(403).json({ message: 'Only admin or HR can update leave requests' });
    }

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      console.log('Leave request not found:', id);
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      console.log('Leave request has already been processed:', leaveRequest.status);
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    leaveRequest.status = status;
    leaveRequest.approvedBy = hr.fullName;
    leaveRequest.approvedAt = Date.now();
    leaveRequest.updatedAt = Date.now();

    const financialYear = getFinancialYear(leaveRequest.fromDate);
    const financialMonth = getFinancialYearMonth(leaveRequest.fromDate);
    const isFirstHalf = financialMonth <= 6;

    const leaveBalance = await getOrInitializeLeaveBalance(leaveRequest.employeeId, financialYear);
    const yearlyBalance = leaveBalance.yearlyBalances.find((yb) => yb.financialYear === financialYear);

    const workingDays = leaveRequest.workingDays;
    const leaveDeduction = leaveRequest.isHalfDay ? workingDays * 0.5 : workingDays;

    console.log('Leave request details:', {
      leaveType: leaveRequest.leaveType,
      from: leaveRequest.fromDate,
      to: leaveRequest.toDate,
      totalDays: leaveRequest.totalDays,
      workingDays,
      leaveDeduction,
      employeeId: leaveRequest.employeeId.toString(),
    });
    console.log('Employee leave balance before approval:', {
      en: yearlyBalance.en,
      cl: yearlyBalance.cl,
      fl: yearlyBalance.fl,
      unpaid: yearlyBalance.unpaid,
      unpaidHalf: yearlyBalance.unpaidHalf,
    });

    if (leaveRequest.leaveType === 'EN') {
      const enApplication = leaveBalance.monthlyEnApplications.find(
        (app) => app.financialYear === financialYear && app.month === financialMonth
      );
      if (!enApplication) {
        return res.status(500).json({ message: 'No monthly EN application found for this financial year and month' });
      }

      if (status === 'Approved') {
        // Move from pending to used
        enApplication.pending -= leaveDeduction;
        enApplication.used += leaveDeduction;
        yearlyBalance.en.used += leaveDeduction;
      } else if (status === 'Rejected') {
        // Remove from pending
        enApplication.pending -= leaveDeduction;
        enApplication.hasApplied = false; // Allow a new EN application for the month
      }
    } else if (leaveRequest.leaveType === 'CL') {
      if (status === 'Approved') {
        const clPeriod = isFirstHalf ? yearlyBalance.cl.firstHalf : yearlyBalance.cl.secondHalf;
        const availableClLeaves = clPeriod.credited - clPeriod.used;
        if (availableClLeaves < leaveDeduction) {
          return res.status(400).json({ message: `Insufficient Casual Leave balance for this period. Available: ${availableClLeaves}, Requested: ${leaveDeduction}` });
        }
        clPeriod.used += leaveDeduction;
      }
    } else if (leaveRequest.leaveType === 'FL') {
      if (status === 'Approved') {
        const flPeriod = isFirstHalf ? yearlyBalance.fl.firstHalf : yearlyBalance.fl.secondHalf;
        const availableFlLeaves = flPeriod.credited - flPeriod.used;
        if (availableFlLeaves < leaveDeduction) {
          return res.status(400).json({ message: `Insufficient Flexi Leave balance for this period. Available: ${availableFlLeaves}, Requested: ${leaveDeduction}` });
        }
        flPeriod.used += leaveDeduction;
      }
    } else if (leaveRequest.leaveType === 'UNPAID') {
      if (status === 'Approved') {
        if (leaveRequest.isHalfDay) {
          yearlyBalance.unpaidHalf += workingDays;
        } else {
          yearlyBalance.unpaid += workingDays;
        }
      }
    }

    await leaveBalance.save();
    console.log('Leave balance updated after approval:', {
      en: yearlyBalance.en,
      cl: yearlyBalance.cl,
      fl: yearlyBalance.fl,
      unpaid: yearlyBalance.unpaid,
      unpaidHalf: yearlyBalance.unpaidHalf,
    });

    console.log('Leave request before update:', leaveRequest.toObject());
    await leaveRequest.save();
    console.log('Leave request updated:', leaveRequest.toObject());

    const user = await User.findById(leaveRequest.employeeId);
    if (user) {
      try {
        await sendEmail({
          to: user.email,
          subject: `Leave Request ${status}`,
          text: `Dear ${user.fullName},\n\nYour leave request from ${leaveRequest.fromDate
            .toISOString()
            .split('T')[0]} to ${leaveRequest.toDate.toISOString().split('T')[0]} has been ${status.toLowerCase()} by ${
            hr.fullName
          }.\n\nReason: ${leaveRequest.reason}\n\nBest regards,\nHRMS Team`,
        });
        console.log(`Leave status email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send leave status email:', emailError);
      }

      await sendNotification(
        io,
        user._id,
        `Your leave request from ${leaveRequest.fromDate.toLocaleDateString()} to ${leaveRequest.toDate.toLocaleDateString()} has been ${status.toLowerCase()}`,
        'leave'
      );
    } else {
      console.warn(`User not found for leave request ${id}, employeeId: ${leaveRequest.employeeId}`);
    }

    const updatedLeaveRequest = await LeaveRequest.findById(id).populate('employeeId', 'fullName');
    res.json({ message: `Leave request ${status.toLowerCase()} successfully`, leaveRequest: updatedLeaveRequest });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ message: 'Failed to update leave request: ' + error.message });
  }
};
const deleteLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const employeeId = req.user.id;

  console.log('Delete leave request:', { id, employeeId });

  try {
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      console.log('Leave request not found:', id);
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.employeeId.toString() !== employeeId.toString()) {
      console.log('Unauthorized: Employee ID does not match:', {
        requestEmployeeId: leaveRequest.employeeId,
        userEmployeeId: employeeId,
      });
      return res.status(403).json({ message: 'You can only delete your own leave requests' });
    }

    if (leaveRequest.status !== 'Pending') {
      console.log('Cannot delete non-pending leave request:', leaveRequest.status);
      return res.status(400).json({ message: 'Only pending leave requests can be deleted' });
    }

    if (leaveRequest.leaveType === 'EN') {
      const financialYear = getFinancialYear(new Date(leaveRequest.fromDate));
      const financialMonth = getFinancialYearMonth(new Date(leaveRequest.fromDate));
      const leaveBalance = await LeaveBalance.findOne({ employeeId });
      if (leaveBalance) {
        const enApplication = leaveBalance.monthlyEnApplications.find(
          (app) => app.financialYear === financialYear && app.month === financialMonth
        );
        if (enApplication) {
          const leaveDeduction = leaveRequest.isHalfDay ? leaveRequest.workingDays * 0.5 : leaveRequest.workingDays;
          enApplication.pending -= leaveDeduction;
          enApplication.hasApplied = false;
          await leaveBalance.save();
        }
      }
    }

    await leaveRequest.deleteOne();
    console.log('Leave request deleted:', id);

    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ message: 'Failed to delete leave request: ' + error.message });
  }
};
// Assign Leave Balance (Admin/HR only)
const assignLeaveBalance = async (req, res) => {
  const { employeeId } = req.params;
  const { leaveType, days, year } = req.body;
  const io = req.app.get('socketio');

  console.log('Assigning leave balance:', { employeeId, leaveType, days, year });

  try {
    // Validate employeeId
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid Employee ID format' });
    }

    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can assign leave balances' });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!leaveType || days === undefined || !year) {
      return res.status(400).json({ message: 'Leave type, days, and year are required' });
    }

    const validLeaveTypes = ['EN', 'CL_FIRST_HALF', 'CL_SECOND_HALF', 'FL_FIRST_HALF', 'FL_SECOND_HALF', 'UNPAID', 'UNPAID_HALF'];
    if (!validLeaveTypes.includes(leaveType.toUpperCase())) {
      return res.status(400).json({ message: `Invalid leave type. Must be one of: ${validLeaveTypes.join(', ')}` });
    }

    const daysNumber = parseInt(days);
    if (isNaN(daysNumber) || daysNumber < 0) {
      return res.status(400).json({ message: 'Days must be a non-negative number' });
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return res.status(400).json({ message: 'Year must be a valid number' });
    }

    // Since `year` represents the start of the financial year (e.g., 2025 for "2025-2026")
    const financialYear = `${yearNum}-${yearNum + 1}`;

    const leaveBalance = await getOrInitializeLeaveBalance(employeeId, financialYear);
    const yearlyBalance = leaveBalance.yearlyBalances.find((yb) => yb.financialYear === financialYear);

    if (!yearlyBalance) {
      return res.status(500).json({ message: 'Failed to initialize leave balance for the specified financial year' });
    }

    // Adjust the assigned EL based on joining date
    let finalDaysNumber = daysNumber;
    if (leaveType.toUpperCase() === 'EN') {
      finalDaysNumber = adjustELBasedOnJoiningDate(employee, financialYear, daysNumber);
      // Distribute the yearly credited EN leaves across months
      const startMonth = yearlyBalance.startMonth;
      const monthlyEnLeaves = leaveBalance.monthlyEnApplications.filter(
        (app) => app.financialYear === financialYear && app.month >= startMonth
      );
      const monthsRemaining = 12 - startMonth + 1;
      const monthlyCredit = finalDaysNumber / monthsRemaining;
      monthlyEnLeaves.forEach((app) => {
        app.credited = monthlyCredit;
      });
    }

    switch (leaveType.toUpperCase()) {
      case 'EN':
        yearlyBalance.en.credited = finalDaysNumber;
        break;
      case 'CL_FIRST_HALF':
        yearlyBalance.cl.firstHalf.credited = daysNumber;
        break;
      case 'CL_SECOND_HALF':
        yearlyBalance.cl.secondHalf.credited = daysNumber;
        break;
      case 'FL_FIRST_HALF':
        yearlyBalance.fl.firstHalf.credited = daysNumber;
        break;
      case 'FL_SECOND_HALF':
        yearlyBalance.fl.secondHalf.credited = daysNumber;
        break;
      case 'UNPAID':
        yearlyBalance.unpaid = daysNumber;
        break;
      case 'UNPAID_HALF':
        yearlyBalance.unpaidHalf = daysNumber;
        break;
    }

    console.log('Leave balance before save:', leaveBalance.toObject());
    await leaveBalance.save();
    console.log('Leave balance saved:', leaveBalance.toObject());

    // Send notification to the employee
    await sendNotification(
      io,
      employeeId,
      `You have been assigned ${finalDaysNumber} ${leaveType} leave day(s) for financial year ${financialYear}`,
      'leave'
    );

    // Send email to the employee
    try {
      await sendEmail({
        to: employee.email,
        subject: `Leave Balance Updated - ${leaveType}`,
        text: `Dear ${employee.fullName},\n\nYour leave balance has been updated. You now have ${finalDaysNumber} ${leaveType} leave day(s) available for financial year ${financialYear}.\n\nBest regards,\nHRMS Team`,
      });
      console.log(`Leave balance email sent to ${employee.email}`);
    } catch (emailError) {
      console.error('Failed to send leave balance email:', emailError);
    }

    res.status(200).json({ message: `Successfully assigned ${finalDaysNumber} ${leaveType} leave day(s) to ${employee.fullName} for financial year ${financialYear}` });
  } catch (error) {
    console.error('Error assigning leave balance:', error);
    res.status(500).json({ message: 'Failed to assign leave balance: ' + error.message });
  }
};

const getLeaveBalance = async (req, res) => {
  const { employeeId } = req.params;
  const { year } = req.query;
  const requestingUserId = req.user.id;
  const requestingUserRole = req.user.role;

  try {
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid Employee ID format' });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (requestingUserRole === 'employee' && requestingUserId !== employeeId) {
      return res.status(403).json({ message: 'Unauthorized: You can only view your own leave balance' });
    }

    const currentFinancialYear = getFinancialYear(new Date());
    const financialYear = year ? `${parseInt(year)}-${parseInt(year) + 1}` : currentFinancialYear;
    const leaveBalance = await getOrInitializeLeaveBalance(employeeId, financialYear);

    const yearlyBalances = leaveBalance.yearlyBalances.filter((yb) => year ? yb.financialYear === financialYear : true);

    const balanceSummary = yearlyBalances.map((yb) => ({
      financialYear: yb.financialYear,
      startMonth: yb.startMonth,
      en: {
        credited: yb.en.credited,
        used: yb.en.used,
        carriedForward: yb.en.carriedForward,
        available: yb.en.credited + yb.en.carriedForward - yb.en.used,
      },
      cl: {
        firstHalf: yb.cl.firstHalf,
        secondHalf: yb.cl.secondHalf,
      },
      fl: {
        firstHalf: yb.fl.firstHalf,
        secondHalf: yb.fl.secondHalf,
      },
      unpaid: yb.unpaid,
      unpaidHalf: yb.unpaidHalf,
      monthlyEnLeaves: leaveBalance.monthlyEnApplications
        .filter((app) => app.financialYear === financialYear)
        .map((app) => ({
          month: app.month,
          credited: app.credited,
          used: app.used,
          pending: app.pending,
          carriedForward: app.carriedForward,
          available: app.credited + app.carriedForward - app.used - app.pending,
        })),
    }));

    res.json(balanceSummary);
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Helper function to calculate days between dates
const calculateDays = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffTime = Math.abs(toDate - fromDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

module.exports = {
  submitLeaveRequest,
  getAllLeaveRequests,
  updateLeaveRequest,
  deleteLeaveRequest,
  assignLeaveBalance,
  getLeaveBalance,
};