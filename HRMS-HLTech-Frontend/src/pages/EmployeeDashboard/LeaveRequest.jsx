import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/authHooks';
import toast from 'react-hot-toast';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Tooltip } from 'react-tooltip';
import '../../styles/calendar.css';

const localizer = momentLocalizer(moment);

function LeaveRequest() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [groupedLeaveRequests, setGroupedLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({
    financialYear: '',
    startMonth: 1,
    cl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
    fl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
    unpaid: 0,
    unpaidHalf: 0,
    monthlyEnLeaves: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveMode, setLeaveMode] = useState('');
  const [singleLeaveData, setSingleLeaveData] = useState({
    date: '',
    selectedLeaveTypes: [],
    isHalfDay: false,
    reason: '',
  });
  const [multipleLeaveData, setMultipleLeaveData] = useState({
    fromDate: '',
    toDate: '',
    selectedLeaveTypes: [],
    isHalfDay: false,
    reason: '',
    workingDays: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const leaveTypes = {
    oneDay: [
      { type: 'EN', display: 'Earning Leave (EN)' },
      { type: 'CL', display: 'Casual Leave (CL)' },
      { type: 'FL', display: 'Flexi Leave (FL)' },
      { type: 'UNPAID', display: 'Unpaid Leave (UNPAID)' },
    ],
    halfDay: [
      { type: 'EN_HALF', display: 'Earning Half-Day Leave (EN_HALF)' },
      { type: 'CL_HALF', display: 'Casual Half-Day Leave (CL_HALF)' },
      { type: 'FL_HALF', display: 'Flexi Half-Day Leave (FL_HALF)' },
      { type: 'UNPAID_HALF', display: 'Unpaid Half-Day Leave (UNPAID_HALF)' },
    ],
    multipleDay: [
      { type: 'EN', display: 'Earning Leave (EN)' },
      { type: 'CL', display: 'Casual Leave (CL)' },
      { type: 'FL', display: 'Flexi Leave (FL)' },
      { type: 'UNPAID', display: 'Unpaid Leave (UNPAID)' },
    ],
  };

  const fetchLeaveRequests = useCallback(async () => {
    if (!user || !user.userId || !user.tokenKey) {
      console.error('Skipping fetchLeaveRequests: Missing user, userId, or tokenKey', {
        user: !!user,
        userId: user?.userId,
        tokenKey: user?.tokenKey,
      });
      toast.error('User not authenticated. Redirecting to login.');
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error('No token found for tokenKey:', user.tokenKey);
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('http://localhost:5000/api/leave', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to fetch leave requests (Status: ${response.status})`);
      }

      const data = await response.json();
      setLeaveRequests(data);

      const groupedByEmployeeAndReason = {};

      data.forEach((request) => {
        const key = `${request.employeeId || user.userId}-${request.reason}-${request.isHalfDay}`;
        if (!groupedByEmployeeAndReason[key]) {
          groupedByEmployeeAndReason[key] = [];
        }
        groupedByEmployeeAndReason[key].push(request);
      });

      const grouped = [];

      for (const key in groupedByEmployeeAndReason) {
        const requests = groupedByEmployeeAndReason[key];
        requests.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));

        let currentGroup = [];
        let lastToDate = null;

        requests.forEach((request, index) => {
          const currentFromDate = new Date(request.fromDate);
          if (lastToDate) {
            const nextDayAfterLastToDate = new Date(lastToDate);
            nextDayAfterLastToDate.setDate(nextDayAfterLastToDate.getDate() + 1);

            if (currentFromDate.getTime() <= nextDayAfterLastToDate.getTime()) {
              currentGroup.push(request);
            } else {
              if (currentGroup.length > 0) {
                processGroup(currentGroup, grouped);
              }
              currentGroup = [request];
            }
          } else {
            currentGroup = [request];
          }
          lastToDate = new Date(request.toDate);
          if (index === requests.length - 1 && currentGroup.length > 0) {
            processGroup(currentGroup, grouped);
          }
        });
      }

      setGroupedLeaveRequests(grouped);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      const errorMessage = error.message.includes('401') ? 'Unauthorized: Please log in again.' : error.message;
      toast.error(errorMessage);
      if (error.message.includes('No authentication token found') || error.message.includes('Unauthorized')) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const processGroup = (group, grouped) => {
    const sortedByFrom = [...group].sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));
    const sortedByTo = [...group].sort((a, b) => new Date(a.toDate) - new Date(b.toDate));
    const fromDate = sortedByFrom[0].fromDate;
    const toDate = sortedByTo[sortedByTo.length - 1].toDate;

    const reason = group[0].reason;
    const isHalfDay = group[0].isHalfDay;
    const status = group.every(req => req.status === 'Pending') ? 'Pending' : group.some(req => req.status === 'Approved') ? 'Approved' : 'Rejected';
    const approvedBy = group.some(req => req.approvedBy) ? group.find(req => req.approvedBy)?.approvedBy : null;

    const leaveTypes = group.map(req => ({
      leaveType: req.leaveType,
      isHalfDay: req.isHalfDay,
      halfDayType: req.halfDayType,
    }));
    const ids = group.map(req => req._id);

    const workingDays = group[0].workingDays || calculateTotalDays(fromDate, toDate);

    grouped.push({
      _id: ids.join(','),
      fromDate,
      toDate,
      leaveType: leaveTypes.map(lt => `${lt.leaveType}${lt.isHalfDay ? ` (${lt.halfDayType})` : ''}`).join(', '),
      isHalfDay,
      reason,
      approvedBy,
      status,
      totalDays: calculateTotalDays(fromDate, toDate),
      workingDays,
    });
  };

  const fetchHolidays = useCallback(async () => {
    if (!user || !user.userId || !user.tokenKey) {
      console.error('Skipping fetchHolidays: Missing user, userId, or tokenKey', {
        user: !!user,
        userId: user?.userId,
        tokenKey: user?.tokenKey,
      });
      toast.error('User not authenticated. Redirecting to login.');
      window.location.href = '/login';
      return;
    }

    try {
      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error('No token found for tokenKey:', user.tokenKey);
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('http://localhost:5000/api/holidays', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to fetch holidays (Status: ${response.status})`);
      }

      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error(error.message);
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    }
  }, [user]);

  const fetchLeaveBalances = useCallback(async () => {
    if (!user || !user.userId || !user.tokenKey) {
      console.error('Skipping fetchLeaveBalances: Missing user, userId, or tokenKey', {
        user: !!user,
        userId: user?.userId,
        tokenKey: user?.tokenKey,
      });
      toast.error('User not authenticated. Redirecting to login.');
      window.location.href = '/login';
      return;
    }

    try {
      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error('No token found for tokenKey:', user.tokenKey);
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Fetching leave balance for userId:', user.userId);
      const currentYear = new Date().getFullYear();
      const response = await fetch(`http://localhost:5000/api/leave/balance/${user.userId}?year=${currentYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to fetch leave balances (Status: ${response.status})`);
      }

      const data = await response.json();
      const currentBalance = data.find((balance) => balance.financialYear === `${currentYear}-${currentYear + 1}`) || {
        financialYear: `${currentYear}-${currentYear + 1}`,
        startMonth: 1,
        cl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
        fl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
        unpaid: 0,
        unpaidHalf: 0,
        monthlyEnLeaves: [],
      };
      setLeaveBalances(currentBalance);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      toast.error(error.message);
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && user.userId && user.tokenKey) {
      fetchLeaveRequests();
      fetchHolidays();
      fetchLeaveBalances();
    }
  }, [user, fetchLeaveRequests, fetchHolidays, fetchLeaveBalances]);

  const getAvailableBalance = (leaveType, date) => {
    const financialMonth = moment(date).month() + 1 >= 4 ? moment(date).month() + 1 - 3 : moment(date).month() + 1 + 9;
    const isFirstHalf = financialMonth <= 6;

    switch (leaveType) {
      case 'EN':
      case 'EN_HALF':
        const enMonthBalance = leaveBalances.monthlyEnLeaves.find((m) => m.month === financialMonth);
        return enMonthBalance ? enMonthBalance.available : 0;
      case 'CL':
      case 'CL_HALF':
        return isFirstHalf
          ? leaveBalances.cl.firstHalf.credited - leaveBalances.cl.firstHalf.used
          : leaveBalances.cl.secondHalf.credited - leaveBalances.cl.secondHalf.used;
      case 'FL':
      case 'FL_HALF':
        return isFirstHalf
          ? leaveBalances.fl.firstHalf.credited - leaveBalances.fl.firstHalf.used
          : leaveBalances.fl.secondHalf.credited - leaveBalances.fl.secondHalf.used;
      case 'UNPAID':
      case 'UNPAID_HALF':
        return Infinity;
      default:
        return 0;
    }
  };

  const calculateTotalDays = (from, to) => {
    if (!from || !to) return 0;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate - fromDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateWorkingDays = (from, to) => {
    if (!from || !to) return 0;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    let workingDays = 0;
    let currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      const day = currentDate.getDay();
      const isSunday = day === 0;
      const isHoliday = holidays.some(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.toDateString() === currentDate.toDateString();
      });

      if (!isSunday && !isHoliday) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  };

  const getAvailableBalanceForRange = (leaveType, from, to) => {
    if (!from || !to) return 0;
    let availableDays = Infinity;
    const startDate = new Date(from);
    const endDate = new Date(to);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const balance = getAvailableBalance(leaveType, currentDate);
      availableDays = Math.min(availableDays, balance);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableDays;
  };

  const getDateRangeForWorkingDays = (startDate, workingDaysNeeded, totalWorkingDays, overallFrom, overallTo) => {
    let currentDate = new Date(startDate);
    let workingDaysCounted = 0;
    let endDate = new Date(currentDate);

    while (workingDaysCounted < workingDaysNeeded && currentDate <= new Date(overallTo)) {
      const day = currentDate.getDay();
      const isSunday = day === 0;
      const isHoliday = holidays.some(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.toDateString() === currentDate.toDateString();
      });

      if (!isSunday && !isHoliday) {
        workingDaysCounted++;
      }
      if (workingDaysCounted < workingDaysNeeded) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      endDate = new Date(currentDate);
    }

    return { from: startDate, to: endDate };
  };

  // Check if there is an approved leave that overlaps with the new leave request's date range
  const hasOverlappingApprovedLeave = (from, to) => {
    const newStart = new Date(from);
    const newEnd = new Date(to);

    return leaveRequests.some(request => {
      if (request.status !== 'Approved') return false;
      const existingStart = new Date(request.fromDate);
      const existingEnd = new Date(request.toDate);
      // Check for overlap: newStart <= existingEnd AND newEnd >= existingStart
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  };

  const handleLeaveModeChange = (mode) => {
    if (leaveMode === mode) return;
    setLeaveMode(mode);
    setSingleLeaveData({
      date: '',
      selectedLeaveTypes: [],
      isHalfDay: false,
      reason: '',
    });
    setMultipleLeaveData({
      fromDate: '',
      toDate: '',
      selectedLeaveTypes: [],
      isHalfDay: false,
      reason: '',
      workingDays: 0,
    });
  };

  const handleLeaveTypeClick = (leaveType, mode) => {
    if (mode === 'oneDay' || mode === 'halfDay') {
      const { date, selectedLeaveTypes } = singleLeaveData;
      if (!date) {
        toast.error('Please select a date first.');
        return;
      }

      const selectedDate = new Date(date);
      const day = selectedDate.getDay();
      const isSunday = day === 0;
      const isHoliday = holidays.some(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.toDateString() === selectedDate.toDateString();
      });

      if (isSunday || isHoliday) {
        toast.error('Cannot apply leave on a Sunday or holiday for One Day or Half Day leave.');
        return;
      }

      const availableBalance = getAvailableBalance(leaveType, selectedDate);
      const canSelect = availableBalance > 0 || leaveType === 'UNPAID' || leaveType === 'UNPAID_HALF';

      if (!canSelect) {
        const displayName = leaveTypes[mode].find((lt) => lt.type === leaveType).display;
        toast.error(`No available balance for ${displayName}`);
        return;
      }

      const isAlreadySelected = selectedLeaveTypes.some((lt) => lt.leaveType === leaveType);
      if (isAlreadySelected) {
        setSingleLeaveData({
          ...singleLeaveData,
          selectedLeaveTypes: selectedLeaveTypes.filter((lt) => lt.leaveType !== leaveType),
        });
      } else {
        setSingleLeaveData({
          ...singleLeaveData,
          selectedLeaveTypes: [
            ...selectedLeaveTypes,
            { leaveType, isHalfDay: mode === 'halfDay' },
          ],
        });
      }
    } else if (mode === 'multipleDay') {
      const { fromDate, toDate, selectedLeaveTypes, workingDays } = multipleLeaveData;
      if (!fromDate || !toDate) {
        toast.error('Please select From Date and To Date first.');
        return;
      }

      const coveredDays = selectedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0);
      const remainingDays = workingDays - coveredDays;

      if (remainingDays <= 0 && leaveType !== 'UNPAID') {
        toast.error('All working days are already covered. Select Unpaid Leave for additional days.');
        return;
      }

      const availableBalance = getAvailableBalanceForRange(leaveType, fromDate, toDate);
      const isAlreadySelected = selectedLeaveTypes.some((lt) => lt.leaveType === leaveType);

      if (isAlreadySelected) {
        const updatedLeaveTypes = selectedLeaveTypes.filter((lt) => lt.leaveType !== leaveType);
        const newCoveredDays = updatedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0);
        const newRemainingDays = workingDays - newCoveredDays;

        const unpaidEntryIndex = updatedLeaveTypes.findIndex(lt => lt.leaveType === 'UNPAID');
        if (newRemainingDays > 0) {
          if (unpaidEntryIndex >= 0) {
            updatedLeaveTypes[unpaidEntryIndex].days = newRemainingDays;
          } else if (leaveType !== 'UNPAID') {
            updatedLeaveTypes.push({ leaveType: 'UNPAID', days: newRemainingDays });
          }
        } else if (unpaidEntryIndex >= 0) {
          updatedLeaveTypes.splice(unpaidEntryIndex, 1);
        }

        setMultipleLeaveData({
          ...multipleLeaveData,
          selectedLeaveTypes: updatedLeaveTypes,
        });
        return;
      }

      let daysToAssign = 0;
      if (leaveType === 'UNPAID') {
        daysToAssign = remainingDays;
      } else if (leaveType === 'CL' || leaveType === 'FL') {
        if (availableBalance < 1) {
          const displayName = leaveTypes[mode].find((lt) => lt.type === leaveType).display;
          toast.error(`No available balance for ${displayName}`);
          return;
        }
        daysToAssign = 1;
      } else if (leaveType === 'EN') {
        if (availableBalance < 1) {
          const displayName = leaveTypes[mode].find((lt) => lt.type === leaveType).display;
          toast.error(`No available balance for ${displayName}`);
          return;
        }
        daysToAssign = Math.min(1, availableBalance, remainingDays);
      }

      if (daysToAssign > 0) {
        const updatedLeaveTypes = [
          ...selectedLeaveTypes,
          { leaveType, days: daysToAssign },
        ];

        if (leaveType !== 'UNPAID') {
          const newCoveredDays = updatedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0);
          const newRemainingDays = workingDays - newCoveredDays;

          const unpaidEntryIndex = updatedLeaveTypes.findIndex(lt => lt.leaveType === 'UNPAID');
          if (newRemainingDays > 0) {
            if (unpaidEntryIndex >= 0) {
              updatedLeaveTypes[unpaidEntryIndex].days = newRemainingDays;
            } else {
              updatedLeaveTypes.push({ leaveType: 'UNPAID', days: newRemainingDays });
            }
          } else if (unpaidEntryIndex >= 0) {
            updatedLeaveTypes.splice(unpaidEntryIndex, 1);
          }
        }

        setMultipleLeaveData({
          ...multipleLeaveData,
          selectedLeaveTypes: updatedLeaveTypes,
        });
      }
    }
  };

  const handleIncrementEarningLeave = (index) => {
    const { fromDate, toDate, selectedLeaveTypes, workingDays } = multipleLeaveData;
    const coveredDays = selectedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0);
    const remainingDays = workingDays - coveredDays;

    if (remainingDays <= 0) {
      toast.error('All working days are already covered. Select Unpaid Leave for additional days.');
      return;
    }

    const leaveEntry = selectedLeaveTypes[index];
    if (leaveEntry.leaveType !== 'EN') return;

    const availableBalance = getAvailableBalanceForRange(leaveEntry.leaveType, fromDate, toDate);
    const daysUsedByThisType = selectedLeaveTypes
      .filter((lt) => lt.leaveType === 'EN')
      .reduce((sum, lt) => sum + lt.days, 0);
    const remainingBalance = availableBalance - daysUsedByThisType;

    if (remainingBalance <= 0) {
      toast.error('No available balance for Earning Leave (EN).');
      return;
    }

    const newDays = Math.min(leaveEntry.days + 1, leaveEntry.days + remainingBalance, leaveEntry.days + remainingDays);
    const updatedLeaveTypes = [...selectedLeaveTypes];
    updatedLeaveTypes[index] = { ...leaveEntry, days: newDays };

    const newCoveredDays = updatedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0);
    const newRemainingDays = workingDays - newCoveredDays;
    const unpaidEntryIndex = updatedLeaveTypes.findIndex(lt => lt.leaveType === 'UNPAID');

    if (newRemainingDays > 0) {
      if (unpaidEntryIndex >= 0) {
        updatedLeaveTypes[unpaidEntryIndex].days = newRemainingDays;
      } else {
        updatedLeaveTypes.push({ leaveType: 'UNPAID', days: newRemainingDays });
      }
    } else if (unpaidEntryIndex >= 0) {
      updatedLeaveTypes.splice(unpaidEntryIndex, 1);
    }

    setMultipleLeaveData({
      ...multipleLeaveData,
      selectedLeaveTypes: updatedLeaveTypes,
    });
  };

  const removeLeaveType = (leaveTypeToRemove, mode) => {
    if (mode === 'oneDay' || mode === 'halfDay') {
      setSingleLeaveData((prev) => ({
        ...prev,
        selectedLeaveTypes: prev.selectedLeaveTypes.filter((lt) => lt.leaveType !== leaveTypeToRemove),
      }));
    } else if (mode === 'multipleDay') {
      const { selectedLeaveTypes, workingDays } = multipleLeaveData;
      const updatedLeaveTypes = selectedLeaveTypes.filter((lt) => lt.leaveType !== leaveTypeToRemove);

      const coveredDays = updatedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0);
      const remainingDays = workingDays - coveredDays;

      const unpaidEntryIndex = updatedLeaveTypes.findIndex(lt => lt.leaveType === 'UNPAID');
      if (remainingDays > 0) {
        if (unpaidEntryIndex >= 0) {
          updatedLeaveTypes[unpaidEntryIndex].days = remainingDays;
        } else {
          updatedLeaveTypes.push({ leaveType: 'UNPAID', days: remainingDays });
        }
      } else if (unpaidEntryIndex >= 0) {
        updatedLeaveTypes.splice(unpaidEntryIndex, 1);
      }

      setMultipleLeaveData({
        ...multipleLeaveData,
        selectedLeaveTypes: updatedLeaveTypes,
      });
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user || !user.userId || !user.tokenKey) {
        console.error('Missing user, userId, or tokenKey in handleApplyLeave:', user);
        throw new Error('User not authenticated. Please log in again.');
      }

      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error('No token found for tokenKey:', user.tokenKey);
        throw new Error('No authentication token found. Please log in again.');
      }

      if (leaveMode === 'oneDay' || leaveMode === 'halfDay') {
        const { date, selectedLeaveTypes, reason } = singleLeaveData;

        if (!date || !reason || selectedLeaveTypes.length === 0) {
          throw new Error('Please fill all fields and select at least one leave type.');
        }

        // Check for overlapping approved leaves
        if (hasOverlappingApprovedLeave(date, date)) {
          throw new Error('You are already on leave for the selected date(s).');
        }

        const balanceDate = new Date(date);
        const financialMonth = moment(balanceDate).month() + 1 >= 4 ? moment(balanceDate).month() + 1 - 3 : moment(balanceDate).month() + 1 + 9;
        const isFirstHalf = financialMonth <= 6;

        for (const leave of selectedLeaveTypes) {
          const { leaveType, isHalfDay } = leave;

          let availableBalance = 0;
          const normalizedLeaveType = leaveType.toUpperCase();
          switch (normalizedLeaveType) {
            case 'EN':
            case 'EN_HALF':
              const enMonthBalance = leaveBalances.monthlyEnLeaves.find((m) => m.month === financialMonth);
              availableBalance = enMonthBalance ? enMonthBalance.available : 0;
              if (availableBalance <= 0) {
                throw new Error(`Earn Leave balance is zero for this month. Cannot submit ${leaveType} request.`);
              }
              break;
            case 'CL':
            case 'CL_HALF':
              availableBalance = isFirstHalf
                ? leaveBalances.cl.firstHalf.credited - leaveBalances.cl.firstHalf.used
                : leaveBalances.cl.secondHalf.credited - leaveBalances.cl.secondHalf.used;
              if (availableBalance <= 0) {
                throw new Error(`Casual Leave balance for ${isFirstHalf ? 'first half' : 'second half'} is zero. Cannot submit ${leaveType} request.`);
              }
              break;
            case 'FL':
            case 'FL_HALF':
              availableBalance = isFirstHalf
                ? leaveBalances.fl.firstHalf.credited - leaveBalances.fl.firstHalf.used
                : leaveBalances.fl.secondHalf.credited - leaveBalances.fl.secondHalf.used;
              if (availableBalance <= 0) {
                throw new Error(`Flexi Leave balance for ${isFirstHalf ? 'first half' : 'second half'} is zero. Cannot submit ${leaveType} request.`);
              }
              break;
            case 'UNPAID':
            case 'UNPAID_HALF':
              availableBalance = Infinity;
              break;
            default:
              throw new Error('Invalid leave type selected.');
          }

          const leaveData = {
            leaveType,
            from: date,
            to: date,
            isHalfDay: leaveMode === 'halfDay' ? true : isHalfDay,
            reason,
          };

          const response = await fetch('http://localhost:5000/api/leave', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(leaveData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || `Failed to submit ${leaveType} request (Status: ${response.status})`);
          }
        }

        toast.success('Leave requests submitted successfully!');
      } else if (leaveMode === 'multipleDay') {
        const { fromDate, toDate, selectedLeaveTypes, isHalfDay, reason, workingDays } = multipleLeaveData;

        if (!fromDate || !toDate || !reason) {
          throw new Error('Please fill all fields.');
        }

        if (selectedLeaveTypes.length === 0) {
          throw new Error('Please select at least one leave type.');
        }

        // Check for overlapping approved leaves
        if (hasOverlappingApprovedLeave(fromDate, toDate)) {
          throw new Error('You are already on leave for the selected date(s).');
        }

        const coveredDays = selectedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0);
        if (coveredDays !== workingDays) {
          throw new Error('Selected leave types do not cover the exact number of working days. Please adjust your selection.');
        }

        let currentStartDate = new Date(fromDate);
        const overallToDate = new Date(toDate);

        for (const leave of selectedLeaveTypes) {
          const { leaveType, days } = leave;

          const { from, to } = getDateRangeForWorkingDays(currentStartDate, days, workingDays, fromDate, toDate);

          const leaveData = {
            leaveType,
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0],
            isHalfDay,
            reason,
          };

          const response = await fetch('http://localhost:5000/api/leave', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(leaveData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || `Failed to submit ${leaveType} request (Status: ${response.status})`);
          }

          currentStartDate = new Date(to);
          currentStartDate.setDate(currentStartDate.getDate() + 1);
        }

        toast.success('Leave requests submitted successfully!');
      }

      setIsModalOpen(false);
      setLeaveMode('');
      setSingleLeaveData({
        date: '',
        selectedLeaveTypes: [],
        isHalfDay: false,
        reason: '',
      });
      setMultipleLeaveData({
        fromDate: '',
        toDate: '',
        selectedLeaveTypes: [],
        isHalfDay: false,
        reason: '',
        workingDays: 0,
      });
      setTimeout(() => {
        fetchLeaveRequests();
        fetchLeaveBalances();
      }, 500);
    } catch (error) {
      console.error('Error submitting leave request:', error.message);
      toast.error(error.message);
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = async (ids) => {
    if (!user || !user.userId || !user.tokenKey) {
      console.error('Skipping handleDeleteRequest: Missing user, userId, or tokenKey', {
        user: !!user,
        userId: user?.userId,
        tokenKey: user?.tokenKey,
      });
      toast.error('User not authenticated. Redirecting to login.');
      window.location.href = '/login';
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error('No token found for tokenKey:', user.tokenKey);
        throw new Error('No authentication token found. Please log in again.');
      }

      const idArray = ids.split(',');
      for (const id of idArray) {
        const response = await fetch(`http://localhost:5000/api/leave/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `Failed to delete leave request (Status: ${response.status})`);
        }
      }

      toast.success('Leave request(s) deleted successfully!');
      fetchLeaveRequests();
      fetchLeaveBalances();
    } catch (error) {
      console.error('Error deleting leave request:', error.message);
      toast.error(error.message);
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const calendarEvents = [
    ...leaveRequests.map((request) => {
      const startDate = new Date(request.fromDate);
      const endDate = new Date(request.toDate);
      const dates = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push({
          title: `${request.leaveType}${request.isHalfDay ? ` (${request.halfDayType})` : ''} (${request.status})`,
          start: new Date(currentDate),
          end: new Date(currentDate),
          allDay: true,
          type: 'leave',
          status: request.status,
          fullDetails: `Leave: ${request.leaveType}${request.isHalfDay ? ` (${request.halfDayType})` : ''} (${request.status}) - ${request.reason} (${moment(request.fromDate).format('MMM DD')} to ${moment(request.toDate).format('MMM DD')})`,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    }).flat(),
    ...holidays.map((holiday) => ({
      title: `Holiday: ${holiday.reason}`,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      allDay: true,
      type: 'holiday',
      fullDetails: `Holiday: ${holiday.reason} (${moment(holiday.date).format('MMM DD, YYYY')})`,
    })),
  ];

  const startOfYear = moment().startOf('year').toDate();
  const endOfYear = moment().endOf('year').toDate();
  let currentDateIterator = new Date(startOfYear);
  while (currentDateIterator <= endOfYear) {
    if (currentDateIterator.getDay() === 0) {
      calendarEvents.push({
        title: 'Sunday Holiday',
        start: new Date(currentDateIterator),
        end: new Date(currentDateIterator),
        allDay: true,
        type: 'sunday',
        fullDetails: `Sunday Holiday (${moment(currentDateIterator).format('MMM DD, YYYY')})`,
      });
    }
    currentDateIterator.setDate(currentDateIterator.getDate() + 1);
  }

  const handleDateClick = (date) => {
    const selectedDate = moment(date).startOf('day').toDate();
    const eventsOnDate = calendarEvents.filter((event) => moment(event.start).isSame(selectedDate, 'day'));
    setSelectedDateEvents(eventsOnDate);
    setIsEventModalOpen(true);
  };

  const customDayPropGetter = (date) => {
    if (date.getDay() === 0) {
      return {
        className: 'bg-gray-100',
      };
    }
    return {};
  };

  const customEventPropGetter = (event) => {
    let backgroundColor = '#fff';
    let borderColor = '#fff';
    let className = 'flex items-center justify-center';

    if (event.type === 'leave') {
      backgroundColor =
        event.status === 'Pending' ? '#f7c948' : event.status === 'Approved' ? '#34c759' : '#ff3b30';
      borderColor = backgroundColor;
      className += ' w-4 h-4 rounded-full';
    } else if (event.type === 'holiday' || event.type === 'sunday') {
      backgroundColor = '#17a2b8';
      borderColor = backgroundColor;
      className += ' w-4 h-4 rounded-full';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        border: 'none',
        padding: 0,
        margin: '0 auto',
      },
      className,
    };
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const currentFinancialMonth = moment().month() + 1 >= 4 ? moment().month() + 1 - 3 : moment().month() + 1 + 9;
  const currentMonthEnBalance = leaveBalances.monthlyEnLeaves.find((m) => m.month === currentFinancialMonth);
  const currentMonthEnAvailable = currentMonthEnBalance ? currentMonthEnBalance.available : 0;
  const monthNames = [
    'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December', 'January', 'February', 'March'
  ];
  const currentMonthName = monthNames[currentFinancialMonth - 1];

  const totalCl = leaveBalances.cl.firstHalf.credited + leaveBalances.cl.secondHalf.credited;
  const usedCl = leaveBalances.cl.firstHalf.used + leaveBalances.cl.secondHalf.used;
  const clDisplay = `${usedCl}/${totalCl}`;

  const totalFl = leaveBalances.fl.firstHalf.credited + leaveBalances.fl.secondHalf.credited;
  const remainingFl = (leaveBalances.fl.firstHalf.credited - leaveBalances.fl.firstHalf.used) +
                      (leaveBalances.fl.secondHalf.credited - leaveBalances.fl.secondHalf.used);
  const flDisplay = `${remainingFl}/${totalFl}`;

  const halfDayPaidLeaves = leaveRequests
    .filter((request) => request.isHalfDay && ['EN', 'CL', 'FL'].includes(request.leaveType))
    .reduce((total, request) => {
      const days = calculateDays(request.fromDate, request.toDate);
      return total + days;
    }, 0);
  return (
    <div className="p-2 md:p-6 bg-gray-50 min-w-[99vw] sm:min-w-full min-h-screen">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6 sm:mt-2 mt-4 md:mb-6">
          <div className="flex flex-row md:flex-row justify-between md:justify-between md:items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-0 md:mb-0">
              Leave Requests
            </h1>
            <div className="flex space-x-2 md:space-x-3">
              <button
                onClick={() => setIsHolidayModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline">Holidays</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Leave</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Leave Balances (Financial Year: {leaveBalances.financialYear})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Earn Leave (EN) - {currentMonthName}</p>
              <p className="text-lg font-medium">{currentMonthEnAvailable}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Casual Leave (CL)</p>
              <p className="text-lg font-medium">{clDisplay}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Flexi Leave (FL)</p>
              <p className="text-lg font-medium">{flDisplay}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Half-Day Paid Leave Taken</p>
              <p className="text-lg font-medium">{halfDayPaidLeaves}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Half-Day Unpaid Leave Taken</p>
              <p className="text-lg font-medium">{leaveBalances.unpaidHalf}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Unpaid Leave Taken</p>
              <p className="text-lg font-medium">{leaveBalances.unpaid}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 md:p-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:h-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : groupedLeaveRequests.length === 0 ? (
          <div className="p-4 md:p-6 text-center">
            <h3 className="text-base md:text-lg font-medium text-gray-900">No leave requests found</h3>
            <p className="mt-1 text-sm md:text-base text-gray-500">Click "Add Leave" to submit a new request.</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {groupedLeaveRequests.map((request) => {
                const leaveDeduction = request.isHalfDay ? request.workingDays * 0.5 : request.workingDays;
                const leaveTypesArray = request.leaveType ? request.leaveType.split(', ').map(type => type.trim()) : [];
                const isMultipleDayLeave = leaveTypesArray.length > 1;

                return (
                  <div key={request._id} className="border rounded-lg shadow-sm mb-4 overflow-hidden bg-white">
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {isMultipleDayLeave ? 'Multiple Day Leave' : request.leaveType}
                        </h4>
                        <div className="flex items-center mt-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              request.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {request.status}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {leaveDeduction} day(s) {request.isHalfDay ? '(Half-Day)' : ''} (Total: {request.totalDays} days)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 p-3">
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Leave Type</p>
                          {isMultipleDayLeave ? (
                            <select className="border rounded p-1 text-sm mt-1">
                              {leaveTypesArray.map((type, index) => (
                                <option key={index} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p>{request.leaveType} {request.isHalfDay ? `(${request.halfDayType})` : ''}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500">From</p>
                          <p>{new Date(request.fromDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">To</p>
                          <p>{new Date(request.toDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Approved By</p>
                          <p>{request.approvedBy || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Reason</p>
                          <p className="mt-1">{request.reason}</p>
                        </div>
                      </div>
                      {request.status === 'Pending' && (
                        <button
                          onClick={() => handleDeleteRequest(request._id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center justify-center"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Deleting...
                            </>
                          ) : (
                            'Delete Request'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedLeaveRequests.map((request) => {
                      const leaveDeduction = request.isHalfDay ? request.workingDays * 0.5 : request.workingDays;
                      const leaveTypesArray = request.leaveType ? request.leaveType.split(', ').map(type => type.trim()) : [];
                      const isMultipleDayLeave = leaveTypesArray.length > 1;

                      return (
                        <tr key={request._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isMultipleDayLeave ? (
                              <select className="border rounded p-1 text-sm focus:ring-2 focus:ring-teal-500">
                                {leaveTypesArray.map((type, index) => (
                                  <option key={index} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              request.leaveType
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(request.fromDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(request.toDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{leaveDeduction} (Total: {request.totalDays})</td>
                          <td className="px-6 py-4">{request.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{request.approvedBy || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                request.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'Approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {request.status === 'Pending' ? (
                              <button
                                onClick={() => handleDeleteRequest(request._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
                                )}
                              </button>
                            ) : (
                              <span className="text-gray-500">No action available</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 overflow-hidden">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md md:max-w-lg max-h-[80vh] flex flex-col">
              <div className="bg-teal-600 rounded-t-lg px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-semibold text-white">Apply for Leave</h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setLeaveMode('');
                    setSingleLeaveData({
                      date: '',
                      selectedLeaveTypes: [],
                      isHalfDay: false,
                      reason: '',
                    });
                    setMultipleLeaveData({
                      fromDate: '',
                      toDate: '',
                      selectedLeaveTypes: [],
                      isHalfDay: false,
                      reason: '',
                      workingDays: 0,
                    });
                  }}
                  className="text-white hover:text-gray-200 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className='overflow-y-auto sm:min-h-[40vh]'>
                <form onSubmit={handleApplyLeave} className="flex-1 flex flex-col">
                  <div className="p-4 md:p-6 flex-1">
                    <div className="flex space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={() => handleLeaveModeChange('oneDay')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          leaveMode === 'oneDay'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        One Day Leave
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLeaveModeChange('halfDay')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          leaveMode === 'halfDay'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Half Day Leave
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLeaveModeChange('multipleDay')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          leaveMode === 'multipleDay'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Multiple Day Leave
                      </button>
                    </div>

                    {(leaveMode === 'oneDay' || leaveMode === 'halfDay') && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm md:text-base text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={singleLeaveData.date}
                            onChange={(e) => {
                              setSingleLeaveData({
                                ...singleLeaveData,
                                date: e.target.value,
                                selectedLeaveTypes: [],
                              });
                            }}
                            className="w-full p-2 text-sm md:text-base border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        {singleLeaveData.date && (
                          <div className="mb-4">
                            <label className="block text-sm md:text-base text-gray-700 mb-2">Select Leave Types</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {leaveTypes[leaveMode].map((leaveType) => {
                                const isSelected = singleLeaveData.selectedLeaveTypes.some((lt) => lt.leaveType === leaveType.type);
                                const availableBalance = getAvailableBalance(leaveType.type, new Date(singleLeaveData.date));
                                const canSelect = availableBalance > 0 || leaveType.type === 'UNPAID' || leaveType.type === 'UNPAID_HALF';

                                return (
                                  <div
                                    key={leaveType.type}
                                    onClick={() => handleLeaveTypeClick(leaveType.type, leaveMode)}
                                    className={`p-3 rounded-lg cursor-pointer text-center border-2 transition-colors duration-200 ${
                                      isSelected
                                        ? 'border-green-500 bg-green-50'
                                        : canSelect
                                        ? 'border-gray-300 hover:bg-gray-100'
                                        : 'border-red-500 bg-red-50 cursor-not-allowed'
                                    }`}
                                  >
                                    <p className="text-sm font-medium text-gray-700">{leaveType.display}</p>
                                    <p className="text-xs text-gray-500">
                                      Available: {leaveType.type === 'UNPAID' || leaveType.type === 'UNPAID_HALF' ? '∞' : availableBalance}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {singleLeaveData.selectedLeaveTypes.length > 0 && (
                          <div className="mb-4">
                            <label className="block text-sm md:text-base text-gray-700 mb-2">Selected Leave Types</label>
                            <div className="space-y-2">
                              {singleLeaveData.selectedLeaveTypes.map((leave, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    {leaveTypes[leaveMode].find((lt) => lt.type === leave.leaveType).display}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => removeLeaveType(leave.leaveType, leaveMode)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                    disabled={isSubmitting}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {leaveMode === 'oneDay' && (
                          <div>
                            <label className="block text-sm md:text-base text-gray-700 mb-1">
                              <input
                                type="checkbox"
                                checked={singleLeaveData.isHalfDay}
                                onChange={(e) => {
                                  const isHalfDay = e.target.checked;
                                  setSingleLeaveData({
                                    ...singleLeaveData,
                                    isHalfDay,
                                    selectedLeaveTypes: singleLeaveData.selectedLeaveTypes.map((lt) => ({
                                      ...lt,
                                      isHalfDay,
                                    })),
                                  });
                                }}
                                className="mr-2"
                                disabled={isSubmitting}
                              />
                              Half-Day Leave
                            </label>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm md:text-base text-gray-700 mb-1">Reason</label>
                          <textarea
                            value={singleLeaveData.reason}
                            onChange={(e) => setSingleLeaveData({ ...singleLeaveData, reason: e.target.value })}
                            className="w-full p-2 text-sm md:text-base border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            rows="3"
                            placeholder="Enter reason for leave"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )}

                    {leaveMode === 'multipleDay' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm md:text-base text-gray-700 mb-1">From Date</label>
                            <input
                              type="date"
                              value={multipleLeaveData.fromDate}
                              onChange={(e) => {
                                const newFromDate = e.target.value;
                                const workingDays = multipleLeaveData.toDate
                                  ? calculateWorkingDays(newFromDate, multipleLeaveData.toDate)
                                  : 0;
                                setMultipleLeaveData({
                                  ...multipleLeaveData,
                                  fromDate: newFromDate,
                                  selectedLeaveTypes: [],
                                  workingDays,
                                });
                              }}
                              className="w-full p-2 text-sm md:text-base border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <label className="block text-sm md:text-base text-gray-700 mb-1">To Date</label>
                            <input
                              type="date"
                              value={multipleLeaveData.toDate}
                              onChange={(e) => {
                                const newToDate = e.target.value;
                                const workingDays = multipleLeaveData.fromDate
                                  ? calculateWorkingDays(multipleLeaveData.fromDate, newToDate)
                                  : 0;
                                setMultipleLeaveData({
                                  ...multipleLeaveData,
                                  toDate: newToDate,
                                  selectedLeaveTypes: [],
                                  workingDays,
                                });
                              }}
                              className="w-full p-2 text-sm md:text-base border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        {multipleLeaveData.fromDate && multipleLeaveData.toDate && (
                          <div className="mb-4">
                            <label className="block text-sm md:text-base text-gray-700 mb-2">
                              Select Leave Types (Working Days: {multipleLeaveData.workingDays}, Total Days: {calculateTotalDays(multipleLeaveData.fromDate, multipleLeaveData.toDate)})
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {leaveTypes.multipleDay.map((leaveType) => {
                                const isSelected = multipleLeaveData.selectedLeaveTypes.some((lt) => lt.leaveType === leaveType.type);
                                const availableBalance = getAvailableBalanceForRange(
                                  leaveType.type,
                                  multipleLeaveData.fromDate,
                                  multipleLeaveData.toDate
                                );
                                const canSelect = availableBalance > 0 || leaveType.type === 'UNPAID';
                                const coveredDays = multipleLeaveData.selectedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0);
                                const remainingDays = multipleLeaveData.workingDays - coveredDays;

                                return (
                                  <div
                                    key={leaveType.type}
                                    onClick={() => handleLeaveTypeClick(leaveType.type, leaveMode)}
                                    className={`p-3 rounded-lg cursor-pointer text-center border-2 transition-colors duration-200 ${
                                      isSelected
                                        ? 'border-green-500 bg-green-50'
                                        : remainingDays <= 0 && leaveType.type !== 'UNPAID'
                                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                        : canSelect
                                        ? 'border-gray-300 hover:bg-gray-100'
                                        : 'border-red-500 bg-red-50 cursor-not-allowed'
                                    }`}
                                  >
                                    <p className="text-sm font-medium text-gray-700">{leaveType.display}</p>
                                    <p className="text-xs text-gray-500">
                                      Available: {leaveType.type === 'UNPAID' ? '∞' : availableBalance}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {multipleLeaveData.fromDate && multipleLeaveData.toDate && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700">
                              Total Days: {calculateTotalDays(multipleLeaveData.fromDate, multipleLeaveData.toDate)} | 
                              Working Days: {multipleLeaveData.workingDays} | 
                              Covered Days: {multipleLeaveData.selectedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0)} | 
                              Remaining Working Days: {Math.max(0, multipleLeaveData.workingDays - multipleLeaveData.selectedLeaveTypes.reduce((sum, lt) => sum + lt.days, 0))}
                            </p>
                          </div>
                        )}

                        {multipleLeaveData.selectedLeaveTypes.length > 0 && (
                          <div className="mb-4">
                            <label className="block text-sm md:text-base text-gray-700 mb-2">Selected Leave Types</label>
                            <div className="space-y-2">
                              {multipleLeaveData.selectedLeaveTypes.map((leave, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    {leaveTypes.multipleDay.find((lt) => lt.type === leave.leaveType).display}: {leave.days} day(s)
                                  </p>
                                  <div className="flex space-x-2">
                                    {leave.leaveType === 'EN' && (
                                      <button
                                        type="button"
                                        onClick={() => handleIncrementEarningLeave(index)}
                                        className="text-teal-600 hover:text-teal-800 text-sm font-bold"
                                        disabled={isSubmitting}
                                      >
                                        +
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeLeaveType(leave.leaveType, leaveMode)}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                      disabled={isSubmitting}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm md:text-base text-gray-700 mb-1">
                            <input
                              type="checkbox"
                              checked={multipleLeaveData.isHalfDay}
                              onChange={(e) => setMultipleLeaveData({ ...multipleLeaveData, isHalfDay: e.target.checked })}
                              className="mr-2"
                              disabled={isSubmitting}
                            />
                            Half-Day Leave
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm md:text-base text-gray-700 mb-1">Reason</label>
                          <textarea
                            value={multipleLeaveData.reason}
                            onChange={(e) => setMultipleLeaveData({ ...multipleLeaveData, reason: e.target.value })}
                            className="w-full p-2 text-sm md:text-base border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            rows="3"
                            placeholder="Enter reason for leave"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 flex justify-end space-x-2 md:space-x-3 bg-gray-50 rounded-b-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setLeaveMode('');
                        setSingleLeaveData({
                          date: '',
                          selectedLeaveTypes: [],
                          isHalfDay: false,
                          reason: '',
                        });
                        setMultipleLeaveData({
                          fromDate: '',
                          toDate: '',
                          selectedLeaveTypes: [],
                          isHalfDay: false,
                          reason: '',
                          workingDays: 0,
                        });
                      }}
                      className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg shadow-sm text-sm md:text-base font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 md:px-4 md:py-2 border border-transparent rounded-lg shadow-sm text-sm md:text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 flex items-center justify-center"
                      disabled={
                        isSubmitting ||
                        (leaveMode === '' ? true : leaveMode === 'multipleDay' ? multipleLeaveData.selectedLeaveTypes.length === 0 : singleLeaveData.selectedLeaveTypes.length === 0)
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {isHolidayModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 mt-10 md:p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-full md:max-w-4xl min-h-[75vh] md:max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-blue-600 rounded-t-lg px-4 py-3 md:px-6 md:py-4 flex justify-between items-center z-10">
                <h3 className="text-lg md:text-xl font-semibold text-white">Holidays Calendar</h3>
                <button
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-3 md:p-6">
                <div className="h-[400px] md:h-[400px]">
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="month"
                    views={['month']}
                    onSelectSlot={({ start }) => handleDateClick(start)}
                    date={currentDate}
                    onNavigate={handleNavigate}
                    selectable
                    dayPropGetter={customDayPropGetter}
                    eventPropGetter={customEventPropGetter}
                    components={{
                      event: ({ event }) => (
                        <div
                          data-tooltip-id="holiday-tooltip"
                          data-tooltip-content={event.fullDetails}
                          className="cursor-pointer"
                        >
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full"></div>
                        </div>
                      ),
                    }}
                    className="text-xs md:text-sm"
                  />
                </div>
                <Tooltip id="holiday-tooltip" className="z-50" place="top" effect="solid" />
              </div>
              <div className="sticky bottom-0 px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg shadow-sm text-sm md:text-base font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {isEventModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md md:max-w-lg">
              <div className="bg-teal-600 rounded-t-lg px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-semibold text-white">Events on {moment(currentDate).format('MMM DD, YYYY')}</h3>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 md:p-6">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-sm md:text-base text-gray-500">No events on this date.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedDateEvents.map((event, index) => (
                      <li key={index} className="text-sm md:text-base text-gray-700">{event.fullDetails}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg shadow-sm text-sm md:text-base font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveRequest;