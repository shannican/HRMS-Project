const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const LeaveRequest = require('../models/LeaveRequest');
const Holiday = require('../models/Holiday');
const EmployeeKYC = require('../models/EmployeeKYC');
const sendEmail = require('../utils/sendEmail');
const mongoose = require('mongoose');

// Utility function to normalize date to UTC midnight
const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

// Utility function to check if a date is a Sunday or an assigned holiday
const isHolidayOrSunday = async (date) => {
  const day = date.getUTCDay();
  const isSunday = day === 0;
  if (isSunday) {
    console.log('Date is a Sunday:', date.toISOString());
    return { isSunday: true, isAssignedHoliday: false, reason: 'Sunday' };
  }

  const startOfDay = normalizeDate(date);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const holiday = await Holiday.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (holiday) {
    console.log('Date is a holiday:', { date: date.toISOString(), reason: holiday.reason, type: holiday.type });
    if (holiday.type === 'Sunday') {
      return { isSunday: true, isAssignedHoliday: false, reason: 'Sunday' };
    }
    return { isSunday: false, isAssignedHoliday: true, reason: holiday.reason };
  }

  return { isSunday: false, isAssignedHoliday: false };
};

// Utility function to check if a date is covered by an approved leave
const isOnApprovedLeave = async (employeeId, date) => {
  const startOfDay = normalizeDate(date);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const leaveRequest = await LeaveRequest.findOne({
    employeeId,
    status: 'Approved',
    from: { $lte: endOfDay },
    to: { $gte: startOfDay },
  });

  if (leaveRequest) {
    console.log('Date is covered by approved leave:', { employeeId: employeeId.toString(), date: date.toISOString(), leaveRequestId: leaveRequest._id });
    return { onLeave: true, leaveType: leaveRequest.leaveType, isHalfDay: leaveRequest.isHalfDay };
  }
  return { onLeave: false };
};

// Helper function to format date range
const formatDateRange = (start, end) => {
  const startDate = new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const endDate = new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${startDate} - ${endDate}`;
};

// Generate payroll for a specific period
const generatePayroll = async (req, res) => {
  const { periodStart, periodEnd, paymentDate, paymentMode } = req.body;

  try {
    if (!periodStart || !periodEnd || !paymentDate) {
      return res.status(400).json({ message: 'Period start, end, and payment date are required' });
    }

    const startDate = normalizeDate(new Date(periodStart));
    const endDate = normalizeDate(new Date(periodEnd));
    const paymentDateObj = new Date(paymentDate);

    // Validate dates
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Period end must be after period start' });
    }

    // Fetch all employees
    const employees = await User.find({ role: 'employee' });

    // Debug: Log all employees fetched
    console.log('All employees fetched:', employees.map(emp => ({
      _id: emp._id,
      fullName: emp.fullName,
      role: emp.role,
      ctc: emp.ctc,
      joiningDate: emp.joiningDate,
    })));

    // Fetch existing payroll records for the period
    const existingPayrollRecords = await Payroll.find({
      periodStart: startDate,
      periodEnd: endDate,
    });

    // Debug: Log existing payroll records
    console.log('Existing payroll records:', existingPayrollRecords.map(record => ({
      _id: record._id,
      employeeId: record.employeeId,
    })));

    // Identify employees who already have payroll records
    const existingEmployeeIds = existingPayrollRecords.map(record => record.employeeId.toString());

    // Debug: Log existing employee IDs
    console.log('Existing employee IDs:', existingEmployeeIds);

    // Filter out employees who already have payroll records
    const employeesToProcess = employees.filter(employee => !existingEmployeeIds.includes(employee._id.toString()));

    // Debug: Log employees to process
    console.log('Employees to process:', employeesToProcess.map(emp => ({
      _id: emp._id,
      fullName: emp.fullName,
      ctc: emp.ctc,
      joiningDate: emp.joiningDate,
    })));

    if (employeesToProcess.length === 0 && existingPayrollRecords.length > 0) {
      return res.status(400).json({ message: 'Payroll for all employees in this period has already been generated' });
    }

    // Fetch attendance for the period
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    });

    // Debug: Log attendance records
    console.log('Attendance Records:', attendanceRecords.map(record => ({
      employeeId: record.employeeId,
      date: record.date,
      status: record.status,
    })));

    // Fetch all holidays for the period
    const holidays = await Holiday.find({
      date: { $gte: startDate, $lte: endDate },
    });

    // Debug: Log all holidays
    console.log('Holidays fetched:', holidays.map(holiday => ({
      date: holiday.date,
      reason: holiday.reason,
      type: holiday.type,
    })));

    // Separate assigned holidays and Sundays
    const assignedHolidays = holidays.filter(holiday => holiday.type === 'Assigned');
    const sundayHolidays = holidays.filter(holiday => holiday.type === 'Sunday');

    // Debug: Log assigned holidays and Sundays
    console.log('Assigned Holidays:', assignedHolidays.map(holiday => ({
      date: holiday.date,
      reason: holiday.reason,
    })));
    console.log('Sunday Holidays:', sundayHolidays.map(holiday => ({
      date: holiday.date,
      reason: holiday.reason,
    })));

    // Fetch leave requests for the period
    const leaveRequests = await LeaveRequest.find({
      from: { $lte: endDate },
      to: { $gte: startDate },
      status: 'Approved',
    });

    // Debug: Log leave requests
    console.log('Leave Requests:', leaveRequests.map(request => ({
      employeeId: request.employeeId,
      from: request.from,
      to: request.to,
      leaveType: request.leaveType,
      isHalfDay: request.isHalfDay,
    })));

    const payrollRecords = [];
    let totalNetPay = 0;
    let totalGrossPay = 0;
    let totalDeductions = 0;

    // Generate list of all dates in the period
    const periodDates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      periodDates.push(new Date(currentDate));
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Debug: Log period dates
    console.log('Period Dates:', periodDates.map(date => date.toISOString().split('T')[0]));

    // Calculate total days in the period
    const totalDaysInPeriod = periodDates.length;

    // Calculate total working days in the period (excluding Sundays)
    let totalWorkingDays = 0;
    let totalSundays = 0;
    for (const date of periodDates) {
      const normalizedDate = normalizeDate(date);
      const dateCheck = await isHolidayOrSunday(normalizedDate);
      if (dateCheck.isSunday) {
        totalSundays++;
      } else {
        totalWorkingDays++;
      }
    }

    // Debug: Log total working days and Sundays
    console.log('Total Working Days in Period (excluding Sundays):', totalWorkingDays);
    console.log('Total Sundays in Period:', totalSundays);

    for (const employee of employeesToProcess) {
      // Debug: Log processing for each employee
      console.log(`Processing payroll for employee: ${employee.fullName} (${employee._id})`);

      // Check if employee was active during the period
      const joiningDate = normalizeDate(new Date(employee.joiningDate));
      if (joiningDate > endDate) {
        console.log(`Employee ${employee.fullName} joined after the period end (${joiningDate.toISOString()}). Skipping payroll generation.`);
        continue;
      }

      // Step 1: Calculate monthly salary from CTC
      const ctc = employee.ctc || 300000; // Fallback to ₹300,000 if ctc is null
      const monthlySalary = ctc / 12;

      // Step 2: Calculate total working days excluding Sundays and assigned holidays for per day salary
      let effectiveWorkingDays = totalWorkingDays;
      for (const holiday of assignedHolidays) {
        const holidayDate = normalizeDate(new Date(holiday.date));
        const dateCheck = await isHolidayOrSunday(holidayDate);
        if (!dateCheck.isSunday) {
          effectiveWorkingDays--;
        }
      }

      // Debug: Log effective working days
      console.log(`Effective Working Days for ${employee.fullName} (excluding Sundays and assigned holidays):`, effectiveWorkingDays);

      // Step 3: Calculate per day salary
      const perDaySalary = monthlySalary / effectiveWorkingDays;

      // Debug: Log salary calculations
      console.log(`Salary calculations for ${employee.fullName}:`, {
        ctc,
        monthlySalary,
        perDaySalary,
        effectiveWorkingDays,
      });

      // Calculate attendance for the employee in the period
      const employeeAttendance = attendanceRecords.filter(
        (record) => record.employeeId.toString() === employee._id.toString()
      );

      // Debug: Log employee attendance
      console.log(`Employee Attendance for ${employee.fullName}:`, employeeAttendance.map(record => ({
        date: record.date,
        status: record.status,
      })));

      // Calculate leaves for the employee in the period
      const employeeLeaves = leaveRequests.filter(
        (request) => request.employeeId.toString() === employee._id.toString()
      );

      // Create a set of leave dates, excluding Sundays
      const leaveDates = new Set();
      for (const leave of employeeLeaves) {
        const leaveStart = normalizeDate(new Date(Math.max(leave.from, startDate)));
        const leaveEnd = normalizeDate(new Date(Math.min(leave.to, endDate)));
        let currentDate = new Date(leaveStart);
        while (currentDate <= leaveEnd) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const dateCheck = await isHolidayOrSunday(currentDate);
          if (!dateCheck.isSunday) { // Only count leave days that are not Sundays
            leaveDates.add(dateStr);
          }
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
      }

      // Debug: Log leave days
      console.log(`Leave Days for ${employee.fullName}: ${leaveDates.size}, Leave Dates:`, Array.from(leaveDates));

      // Calculate paid and unpaid leaves, considering half-day leaves
      const allowedPaidLeaves = 1;
      let paidLeaves = 0;
      let unpaidLeaves = 0;

      for (const dateStr of Array.from(leaveDates)) {
        const date = new Date(dateStr);
        const leaveInfo = await isOnApprovedLeave(employee._id, date);
        if (leaveInfo.onLeave) {
          const isHalfDay = leaveInfo.isHalfDay;
          const leaveType = leaveInfo.leaveType;
          const leaveIncrement = isHalfDay ? 0.5 : 1;

          if (leaveType === 'UNPAID') {
            unpaidLeaves += leaveIncrement;
          } else if (paidLeaves < allowedPaidLeaves) {
            const remainingPaidLeaves = allowedPaidLeaves - paidLeaves;
            const paidLeaveToAdd = Math.min(leaveIncrement, remainingPaidLeaves);
            paidLeaves += paidLeaveToAdd;
            if (leaveIncrement > remainingPaidLeaves) {
              unpaidLeaves += leaveIncrement - paidLeaveToAdd;
            }
          } else {
            unpaidLeaves += leaveIncrement;
          }
        }
      }

      // Debug: Log paid and unpaid leaves
      console.log(`Paid Leaves for ${employee.fullName}: ${paidLeaves}, Unpaid Leaves: ${unpaidLeaves}`);

      // Calculate present, absent, assigned holiday (excluding Sundays), and Sunday days
      let presentDays = 0;
      let absentDays = 0;
      let assignedHolidayDays = 0; // Assigned holidays only
      let sundayDays = 0;

      for (const date of periodDates) {
        const normalizedDate = normalizeDate(date);
        const dateStr = normalizedDate.toISOString().split('T')[0];

        // Check if the date is a Sunday or an assigned holiday
        const dateCheck = await isHolidayOrSunday(normalizedDate);
        if (dateCheck.isSunday) {
          sundayDays++;
          continue; // Sundays are not payable and go to LOP
        }
        if (dateCheck.isAssignedHoliday) {
          assignedHolidayDays++;
          continue; // Assigned holidays are payable
        }

        // Check if the employee was on approved leave
        const leaveInfo = await isOnApprovedLeave(employee._id, normalizedDate);
        if (leaveInfo.onLeave) {
          continue; // Leave days are counted separately via paidLeaves/unpaidLeaves
        }

        // Check attendance record
        const attendanceRecord = employeeAttendance.find(record => {
          const recordDate = normalizeDate(new Date(record.date));
          return recordDate.toISOString().split('T')[0] === dateStr;
        });

        if (attendanceRecord) {
          if (attendanceRecord.status === 'present') {
            presentDays++;
          } else if (attendanceRecord.status === 'absent') {
            absentDays++;
          }
        } else {
          // If no attendance record exists for a non-Sunday, non-holiday day, count as absent
          absentDays++;
        }
      }

      // Debug: Log calculated days
      console.log(`Present Days for ${employee.fullName}: ${presentDays}, Absent Days: ${absentDays}, Assigned Holiday Days: ${assignedHolidayDays}, Sunday Days: ${sundayDays}`);

      // Step 4: Calculate paid days (present days + paid leaves + assigned holidays)
      const paidDays = presentDays + paidLeaves + assignedHolidayDays;

      // Step 5: Calculate LOP days (Sundays + unpaid leaves)
      const lopDays = sundayDays + unpaidLeaves; // Absents are not included in LOP days for payslip display

      // Debug: Log paid days and LOP days
      console.log(`Paid Days for ${employee.fullName}: ${paidDays}, LOP Days: ${lopDays}`);

      // Step 6: Calculate payable salary
      const payableSalary = perDaySalary * paidDays;

      // Step 7: Calculate deduction (absents + Sundays + unpaid leaves)
      const totalNonPayableDays = absentDays + sundayDays + unpaidLeaves;
      const deduction = perDaySalary * totalNonPayableDays;

      // Debug: Log payable salary and deduction
      console.log(`Payable Salary for ${employee.fullName}: ₹${payableSalary}, Deduction: ₹${deduction}`);

      // Step 8: Calculate gross salary (same as payable salary in this case)
      let grossSalary = payableSalary;

      // Ensure grossSalary is finite
      grossSalary = Number.isFinite(grossSalary) ? grossSalary : 0;

      // Debug: Log gross salary
      console.log(`Gross Salary for ${employee.fullName}: ₹${grossSalary}`);

      // Step 9: Break gross salary into components
      const basicSalary = grossSalary * 0.5; // 50% of Gross Salary
      const hra = basicSalary * 0.5; // 50% of Basic Salary
      const travelAllowance = grossSalary * 0.1; // 10% of Gross Salary
      const specialAllowance = grossSalary - (basicSalary + hra + travelAllowance); // Remaining amount

      // Step 10: Calculate final gross salary
      const finalGrossSalary = basicSalary + hra + travelAllowance + specialAllowance;

      // Ensure all components are finite numbers
      const earnings = {
        basicSalary: Number.isFinite(basicSalary) ? basicSalary : 0,
        hra: Number.isFinite(hra) ? hra : 0,
        travelAllowance: Number.isFinite(travelAllowance) ? travelAllowance : 0,
        specialAllowance: Number.isFinite(specialAllowance) ? specialAllowance : 0,
        grossEarnings: Number.isFinite(finalGrossSalary) ? finalGrossSalary : 0,
      };

      // Debug: Log earnings breakdown
      console.log(`Earnings for ${employee.fullName}:`, earnings);

      // Calculate net pay (gross earnings minus deductions)
      let netPay = earnings.grossEarnings;
      netPay = Number.isFinite(netPay) ? netPay : 0;

      // Debug: Log net pay
      console.log(`Net Pay for ${employee.fullName}: ₹${netPay}`);

      // For now, set advance to 0 (you can extend this logic to fetch from a separate model)
      const advance = 0;
      let creditedPay = netPay - advance;
      creditedPay = Number.isFinite(creditedPay) ? creditedPay : 0;

      // Fetch KYC data for the employee
      const employeeKYC = await EmployeeKYC.findOne({ employeeId: employee._id });
      const kycData = employeeKYC || {};

      totalNetPay += netPay;
      totalGrossPay += earnings.grossEarnings;
      totalDeductions += deduction;

      const payrollRecord = new Payroll({
        employeeId: employee._id,
        periodStart: startDate,
        periodEnd: endDate,
        monthlySalary,
        perDaySalary,
        paidDays,
        absents: absentDays,
        paidLeaves,
        unpaidLeaves,
        holidayDays: assignedHolidayDays, // Only assigned holidays
        sundayDays, // Sundays
        deductions: deduction,
        netPay,
        creditedPay,
        advance,
        paymentMode: paymentMode || 'Bank Transfer',
        status: 'Pending',
        paymentDate: paymentDateObj,
        basicSalary: earnings.basicSalary,
        hra: earnings.hra,
        travelAllowance: earnings.travelAllowance,
        specialAllowance: earnings.specialAllowance,
        grossEarnings: earnings.grossEarnings,
        pan: kycData.pan?.number || null,
        accountNumber: kycData.bankAccount?.accountNumber || null,
        ifscCode: kycData.bankAccount?.ifscCode || null,
      });

      await payrollRecord.save();
      payrollRecords.push(payrollRecord);

      // Debug: Log payroll record after saving
      console.log(`Payroll Record Saved for ${employee.fullName}:`, {
        _id: payrollRecord._id,
        employeeId: payrollRecord.employeeId,
        periodStart: payrollRecord.periodStart,
        paidDays: payrollRecord.paidDays,
        absents: payrollRecord.absents,
        paidLeaves: payrollRecord.paidLeaves,
        unpaidLeaves: payrollRecord.unpaidLeaves,
        holidayDays: payrollRecord.holidayDays,
        sundayDays: payrollRecord.sundayDays,
        netPay: payrollRecord.netPay,
        basicSalary: payrollRecord.basicSalary,
        hra: payrollRecord.hra,
        travelAllowance: payrollRecord.travelAllowance,
        specialAllowance: payrollRecord.specialAllowance,
        grossEarnings: payrollRecord.grossEarnings,
        pan: payrollRecord.pan,
        accountNumber: payrollRecord.accountNumber,
        ifscCode: payrollRecord.ifscCode,
      });

      // Send email notification to the employee
      try {
        await sendEmail({
          to: employee.email,
          subject: `Payroll Generated for ${formatDateRange(startDate, endDate)}`,
          text: `Dear ${employee.fullName},\n\nYour payroll for the period ${formatDateRange(startDate, endDate)} has been generated.\nNet Pay: ₹${netPay.toLocaleString()}\nCredited Pay: ₹${creditedPay.toLocaleString()}\n\nBest regards,\nHRMS Team`,
        });
        console.log(`Payroll notification email sent to ${employee.email}`);
      } catch (emailError) {
        console.error('Failed to send payroll notification email:', emailError);
        // Continue even if email fails
      }
    }

    // Combine new records with existing ones for the response
    const allPayrollRecords = [...existingPayrollRecords, ...payrollRecords];

    // Recalculate totals including existing records
    totalNetPay = 0;
    totalGrossPay = 0;
    totalDeductions = 0;
    allPayrollRecords.forEach(record => {
      totalNetPay += record.netPay || 0;
      totalGrossPay += record.grossEarnings || 0;
      totalDeductions += record.deductions || 0;
    });

    res.json({
      message: 'Payroll generated successfully for new employees',
      payrollRecords: allPayrollRecords,
      summary: {
        totalNetPay,
        totalGrossPay,
        totalDeductions,
        totalEmployees: allPayrollRecords.length,
        periodStart,
        periodEnd,
        paymentDate: paymentDateObj,
      },
    });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Process payroll (mark as paid)
const processPayroll = async (req, res) => {
  const { periodStart, periodEnd } = req.body;

  try {
    if (!periodStart || !periodEnd) {
      return res.status(400).json({ message: 'Period start and end are required' });
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    const payrollRecords = await Payroll.find({
      periodStart: startDate,
      periodEnd: endDate,
      status: 'Pending',
    });

    if (payrollRecords.length === 0) {
      return res.status(404).json({ message: 'No pending payroll records found for this period' });
    }

    await Payroll.updateMany(
      {
        periodStart: startDate,
        periodEnd: endDate,
        status: 'Pending',
      },
      { $set: { status: 'Processed' } }
    );

    // Send email notification to employees about payroll processing
    for (const record of payrollRecords) {
      const employee = await User.findById(record.employeeId);
      if (employee) {
        try {
          await sendEmail({
            to: employee.email,
            subject: `Payroll Processed for ${formatDateRange(startDate, endDate)}`,
            text: `Dear ${employee.fullName},\n\nYour payroll for the period ${formatDateRange(startDate, endDate)} has been processed.\nCredited Pay: ₹${(record.creditedPay || 0).toLocaleString()}\nPayment Mode: ${record.paymentMode || 'N/A'}\nPayment Date: ${record.paymentDate ? new Date(record.paymentDate).toLocaleDateString('en-GB') : 'N/A'}\n\nBest regards,\nHRMS Team`,
          });
          console.log(`Payroll processed email sent to ${employee.email}`);
        } catch (emailError) {
          console.error('Failed to send payroll processed email:', emailError);
          // Continue even if email fails
        }
      } else {
        console.error(`Employee not found for payroll record ${record._id}, employeeId: ${record.employeeId}`);
      }
    }

    res.json({ message: 'Payroll processed successfully' });
  } catch (error) {
    console.error('Error processing payroll:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get payroll records for a specific period
const getPayrollRecords = async (req, res) => {
  const { periodStart, periodEnd } = req.query;

  try {
    if (!periodStart || !periodEnd) {
      return res.status(400).json({ message: 'Period start and end are required' });
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    // Fetch payroll records with populated employeeId
    let populatedRecords = await Payroll.find({
      periodStart: startDate,
      periodEnd: endDate,
    }).populate('employeeId', 'fullName email employeeCode profileImage position joiningDate ctc');

    // Fetch KYC data for each employee and merge it into the payroll records
    populatedRecords = await Promise.all(populatedRecords.map(async (record) => {
      const employeeId = record.employeeId?._id;
      if (employeeId) {
        const employeeKYC = await EmployeeKYC.findOne({ employeeId });
        if (employeeKYC) {
          record.pan = employeeKYC.pan?.number || record.pan || null;
          record.accountNumber = employeeKYC.bankAccount?.accountNumber || record.accountNumber || null;
          record.ifscCode = employeeKYC.bankAccount?.ifscCode || record.ifscCode || null;
        }
      }
      return record;
    }));

    // Log populated records
    console.log('Populated payroll records:', populatedRecords.map(record => ({
      _id: record._id,
      employeeId: record.employeeId ? {
        _id: record.employeeId._id,
        fullName: record.employeeId.fullName,
        email: record.employeeId.email,
        employeeCode: record.employeeId.employeeCode,
        profileImage: record.employeeId.profileImage,
        position: record.employeeId.position,
        joiningDate: record.employeeId.joiningDate,
        ctc: record.employeeId.ctc,
      } : null,
      periodStart: record.periodStart,
      periodEnd: record.periodEnd,
      paidDays: record.paidDays,
      absents: record.absents,
      paidLeaves: record.paidLeaves,
      unpaidLeaves: record.unpaidLeaves,
      holidayDays: record.holidayDays,
      sundayDays: record.sundayDays,
      basicSalary: record.basicSalary,
      hra: record.hra,
      travelAllowance: record.travelAllowance,
      specialAllowance: record.specialAllowance,
      grossEarnings: record.grossEarnings,
      pan: record.pan,
      accountNumber: record.accountNumber,
      ifscCode: record.ifscCode,
    })));

    if (populatedRecords.length === 0) {
      return res.status(200).json({
        payrollRecords: [],
        summary: {
          totalNetPay: 0,
          totalGrossPay: 0,
          totalDeductions: 0,
          totalEmployees: 0,
          periodStart,
          periodEnd,
          paymentDate: null,
        },
      });
    }

    let totalNetPay = 0;
    let totalGrossPay = 0;
    let totalDeductions = 0;

    populatedRecords.forEach(record => {
      console.log(`Payroll record ID: ${record._id}, Employee: ${record.employeeId?.fullName || 'N/A'}, Email: ${record.employeeId?.email || 'N/A'}, EmployeeCode: ${record.employeeId?.employeeCode || 'N/A'}`);
      totalNetPay += record.netPay || 0;
      totalGrossPay += record.grossEarnings || 0;
      totalDeductions += record.deductions || 0;
    });

    res.json({
      payrollRecords: populatedRecords,
      summary: {
        totalNetPay,
        totalGrossPay,
        totalDeductions,
        totalEmployees: populatedRecords.length,
        periodStart,
        periodEnd,
        paymentDate: populatedRecords[0]?.paymentDate || null,
      },
    });
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get a single payroll record by ID (for pay slip)
const getPayrollRecord = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the payroll record with populated employeeId
    let populatedRecord = await Payroll.findById(id).populate('employeeId', 'fullName email employeeCode profileImage position joiningDate ctc');

    if (!populatedRecord) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Fetch KYC data for the employee
    const employeeId = populatedRecord.employeeId?._id;
    if (employeeId) {
      const employeeKYC = await EmployeeKYC.findOne({ employeeId });
      if (employeeKYC) {
        populatedRecord.pan = employeeKYC.pan?.number || populatedRecord.pan || null;
        populatedRecord.accountNumber = employeeKYC.bankAccount?.accountNumber || populatedRecord.accountNumber || null;
        populatedRecord.ifscCode = employeeKYC.bankAccount?.ifscCode || populatedRecord.ifscCode || null;
      }
    }

    // Log populated record
    console.log('Populated payroll record:', {
      _id: populatedRecord._id,
      employeeId: populatedRecord.employeeId ? {
        _id: populatedRecord.employeeId._id,
        fullName: populatedRecord.employeeId.fullName,
        email: populatedRecord.employeeId.email,
        employeeCode: populatedRecord.employeeId.employeeCode,
        profileImage: populatedRecord.employeeId.profileImage,
        position: populatedRecord.employeeId.position,
        joiningDate: populatedRecord.employeeId.joiningDate,
        ctc: populatedRecord.employeeId.ctc,
      } : null,
      periodStart: populatedRecord.periodStart,
      periodEnd: populatedRecord.periodEnd,
      paidDays: populatedRecord.paidDays,
      absents: populatedRecord.absents,
      paidLeaves: populatedRecord.paidLeaves,
      unpaidLeaves: populatedRecord.unpaidLeaves,
      holidayDays: populatedRecord.holidayDays,
      sundayDays: populatedRecord.sundayDays,
      basicSalary: populatedRecord.basicSalary,
      hra: populatedRecord.hra,
      travelAllowance: populatedRecord.travelAllowance,
      specialAllowance: populatedRecord.specialAllowance,
      grossEarnings: populatedRecord.grossEarnings,
      pan: populatedRecord.pan,
      accountNumber: populatedRecord.accountNumber,
      ifscCode: populatedRecord.ifscCode,
    });

    res.json(populatedRecord);
  } catch (error) {
    console.error('Error fetching payroll record:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Send pay slip email to employee
const sendPaySlipEmail = async (req, res) => {
  const { id } = req.params;

  try {
    const payrollRecord = await Payroll.findById(id).populate('employeeId', 'fullName email employeeCode position joiningDate');
    if (!payrollRecord) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const employee = payrollRecord.employeeId;
    if (!employee || !employee.email) {
      return res.status(400).json({ message: 'Employee email not found' });
    }

    // Fetch KYC data for the employee
    const employeeKYC = await EmployeeKYC.findOne({ employeeId: employee._id });
    const kycData = employeeKYC || {};

    // Calculate the breakdown of payable days
    const presentDays = (payrollRecord.paidDays || 0) - (payrollRecord.paidLeaves || 0) - (payrollRecord.holidayDays || 0);

    // Format the pay slip details with fallbacks
    const paySlipDetails = `
Dear ${employee.fullName},

Your pay slip for the period ${formatDateRange(payrollRecord.periodStart, payrollRecord.periodEnd)} is as follows:

- Employee Code: ${employee.employeeCode || 'N/A'}
- Position: ${employee.position || 'N/A'}
- Joining Date: ${employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : 'N/A'}
- Monthly Salary: ₹${(payrollRecord.monthlySalary || 0).toLocaleString()}
- Per Day Salary: ₹${(payrollRecord.perDaySalary || 0).toLocaleString()}
- Payable Days: ${payrollRecord.paidDays || 0} (Present: ${presentDays}, Paid Leaves: ${payrollRecord.paidLeaves || 0}, Assigned Holidays: ${payrollRecord.holidayDays || 0})
- Absent Days: ${payrollRecord.absents || 0}
- Sundays: ${payrollRecord.sundayDays || 0}
- Unpaid Leaves: ${payrollRecord.unpaidLeaves || 0}
- Basic Salary: ₹${(payrollRecord.basicSalary || 0).toLocaleString()}
- HRA: ₹${(payrollRecord.hra || 0).toLocaleString()}
- Travel Allowance: ₹${(payrollRecord.travelAllowance || 0).toLocaleString()}
- Special Allowance: ₹${(payrollRecord.specialAllowance || 0).toLocaleString()}
- Gross Earnings: ₹${(payrollRecord.grossEarnings || 0).toLocaleString()}
- Deductions: ₹${(payrollRecord.deductions || 0).toLocaleString()}
- Net Pay: ₹${(payrollRecord.netPay || 0).toLocaleString()}
- Advance: ₹${(payrollRecord.advance || 0).toLocaleString()}
- Credited Pay: ₹${(payrollRecord.creditedPay || 0).toLocaleString()}
- Payment Mode: ${payrollRecord.paymentMode || 'N/A'}
- Payment Date: ${payrollRecord.paymentDate ? new Date(payrollRecord.paymentDate).toLocaleDateString('en-GB') : 'N/A'}
- PAN: ${kycData.pan?.number || 'N/A'}
- Account Number: ${kycData.bankAccount?.accountNumber || 'N/A'}
- IFSC Code: ${kycData.bankAccount?.ifscCode || 'N/A'}

Best regards,
HRMS Team
    `;

    await sendEmail({
      to: employee.email,
      subject: `Pay Slip for ${formatDateRange(payrollRecord.periodStart, payrollRecord.periodEnd)}`,
      text: paySlipDetails,
    });

    res.json({ message: 'Pay slip email sent successfully' });
  } catch (error) {
    console.error('Error sending pay slip email:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  generatePayroll,
  processPayroll,
  getPayrollRecords,
  getPayrollRecord,
  sendPaySlipEmail,
};