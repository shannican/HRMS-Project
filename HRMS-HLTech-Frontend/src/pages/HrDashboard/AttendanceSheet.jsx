import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Tooltip } from 'react-tooltip';
import '../../styles/calendar.css';

const localizer = momentLocalizer(moment);

// Pre-configured office location
const OFFICE_LOCATION = {
  latitude: 23.251955021598498,
  longitude: 77.46472966689575,
};
const OFFICE_RADIUS = 60;
const OFFICE_NAME = 'HL Tech';

// Updated default profile image URL
const DEFAULT_PROFILE_IMAGE = 'https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg';

// Function to calculate distance using Haversine formula (in meters)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Function to determine location area
const getLocationArea = (location, type = 'checkIn') => {
  if (!location || !location[type] || !location[type].latitude || !location[type].longitude) {
    return 'N/A';
  }

  const distance = calculateDistance(
    location[type].latitude,
    location[type].longitude,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude
  );

  return distance <= OFFICE_RADIUS ? OFFICE_NAME : 'Outside Office';
};

// Function to format time from 24-hour format (HH:mm) to 12-hour format (h:mm AM/PM)
const formatTime = (time) => {
  if (!time || time === 'N/A') return 'N/A';
  return moment(time, 'HH:mm').format('h:mm A');
};

// Utility function to check if a date is a Sunday
const isSunday = (date) => {
  return date.getDay() === 0;
};

function AttendanceSheet() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [uniqueEmployees, setUniqueEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [holidayReason, setHolidayReason] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [employeeAttendanceWithArea, setEmployeeAttendanceWithArea] = useState([]);
  const [totalAttendanceThisMonth, setTotalAttendanceThisMonth] = useState(0);
  const [totalAbsentThisMonth, setTotalAbsentThisMonth] = useState(0);
  const [totalWorkingDaysThisMonth, setTotalWorkingDaysThisMonth] = useState(0);
  const [totalHolidaysThisMonth, setTotalHolidaysThisMonth] = useState(0);
  const [totalLeavesThisMonth, setTotalLeavesThisMonth] = useState(0);
  const [totalSundaysThisMonth, setTotalSundaysThisMonth] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [location, setLocation] = useState(null);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isProcessing, setIsProcessing] = useState({});
  const [lastFetchDate, setLastFetchDate] = useState(moment().format('YYYY-MM-DD')); // Track last fetch date

  // State for month filter in employee modal
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM')); // Default to current month

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to fetch location. Please enable location services.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  }, []);

  // Effect to check for a new day and refresh attendance data
  useEffect(() => {
    const checkNewDay = () => {
      const currentDateStr = moment().format('YYYY-MM-DD');
      if (currentDateStr !== lastFetchDate && isEmployeeModalOpen && selectedEmployee) {
        console.log('New day detected, refreshing attendance for:', selectedEmployee._id);
        fetchEmployeeAttendance(selectedEmployee._id, selectedMonth);
        setLastFetchDate(currentDateStr);
      }
    };

    // Check every minute for a new day
    const interval = setInterval(checkNewDay, 60 * 1000);
    return () => clearInterval(interval);
  }, [lastFetchDate, isEmployeeModalOpen, selectedEmployee, selectedMonth]);

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/attendance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch attendance records');
      }

      const data = await response.json();
      console.log('Fetched attendance records:', data);
      setAttendanceRecords(data);

      // Create a list of unique employees based on employeeId._id
      const uniqueEmployeesMap = new Map();
      data.forEach(record => {
        if (record.employeeId && record.employeeId._id) {
          uniqueEmployeesMap.set(record.employeeId._id, {
            ...record,
            employeeId: {
              ...record.employeeId,
            },
          });
        }
      });
      const uniqueEmployeesList = Array.from(uniqueEmployeesMap.values());
      console.log('Unique employees:', uniqueEmployeesList);
      setUniqueEmployees(uniqueEmployeesList);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/holidays', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch holidays');
      }

      const data = await response.json();
      console.log('Fetched holidays:', data);
      setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error(error.message);
    }
  };

  // Function to save Sundays as Sunday Holidays in the database
  const saveSundayHolidays = async (startDate, endDate) => {
    try {
      let currentDate = new Date(startDate);
      const sundayHolidays = [];

      // Collect all Sundays within the date range
      while (currentDate <= endDate) {
        if (isSunday(currentDate)) {
          const dateStr = moment(currentDate).format('YYYY-MM-DD');
          const existingHoliday = holidays.find(holiday => moment(holiday.date).isSame(currentDate, 'day'));
          if (!existingHoliday) {
            sundayHolidays.push({
              date: dateStr,
              reason: 'Sunday Holiday',
              type: 'Sunday',
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('Sundays to save:', sundayHolidays);

      // Save each Sunday as a holiday with type 'Sunday'
      for (const sunday of sundayHolidays) {
        const response = await fetch('http://localhost:5000/api/holidays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            date: sunday.date,
            reason: sunday.reason,
            type: sunday.type,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error('Failed to save Sunday Holiday:', data.message);
          // Skip to the next Sunday if this one already exists
          continue;
        }

        const data = await response.json();
        console.log('Saved Sunday Holiday:', data);
      }

      // Refresh holidays after saving
      await fetchHolidays();
    } catch (error) {
      console.error('Error saving Sunday Holidays:', error);
      toast.error('Failed to save Sunday Holidays: ' + error.message);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance/requests/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch pending attendance requests');
      }

      const data = await response.json();
      console.log('Fetched pending attendance requests:', data);
      setPendingRequests(data);
    } catch (error) {
      console.error('Error fetching pending attendance requests:', error);
      toast.error(error.message);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    setIsProcessing(prev => ({ ...prev, [requestId]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/attendance/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${action} attendance request`);
      }

      const data = await response.json();
      toast.success(data.message);

      // Refresh the pending requests and attendance records
      await Promise.all([fetchPendingRequests(), fetchAttendanceRecords()]);

      // If an employee modal is open, refresh the employee's attendance
      if (isEmployeeModalOpen && selectedEmployee) {
        await fetchEmployeeAttendance(selectedEmployee._id);
      }
    } catch (error) {
      console.error(`Error ${action}ing attendance request:`, error);
      toast.error(error.message);
    } finally {
      setIsProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const fetchEmployeeAttendance = async (employeeId, monthFilter = selectedMonth) => {
    try {
      // Parse the monthFilter (YYYY-MM) to extract year and month
      const [year, month] = monthFilter.split('-').map(Number);
      // Define the exact date range for the selected month using moment
      const startOfSelectedMonth = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('day').toDate();
      // Use the current date and time for the end date
      const currentDate = new Date();
      // For the current month, set the end date to today; otherwise, use the end of the month
      let effectiveEndDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').endOf('day').toDate();
      const isCurrentMonth = year === moment().year() && month === moment().month() + 1;
      if (isCurrentMonth) {
        effectiveEndDate = moment(currentDate).endOf('day').toDate();
      }

      console.log('Date range for selected month:', {
        startOfSelectedMonth: startOfSelectedMonth.toISOString(),
        effectiveEndDate: effectiveEndDate.toISOString(),
      });

      // Send the month and year as query parameters to the backend
      const response = await fetch(
        `http://localhost:5000/api/attendance/employee/${employeeId}?month=${month}&year=${year}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch employee attendance');
      }

      const data = await response.json();
      console.log(`Raw attendance data for employee ${employeeId}:`, data);

      // Filter records to ensure they are within the selected month and up to the effective end date
      const filteredData = data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startOfSelectedMonth && recordDate <= effectiveEndDate;
      });

      setEmployeeAttendance(filteredData);

      // Process records to add area names for locations
      const updatedRecords = await Promise.all(
        filteredData.map(async (record) => {
          console.log(`Processing record:`, record);
          let checkInArea = getLocationArea(record.location, 'checkIn');
          let checkOutArea = getLocationArea(record.location, 'checkOut');

          if (checkInArea !== OFFICE_NAME && checkInArea !== 'N/A') {
            try {
              if (record.location && record.location.checkIn.latitude && record.location.checkIn.longitude) {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${record.location.checkIn.latitude}&lon=${record.location.checkIn.longitude}&zoom=18&addressdetails=1`
                );
                const data = await response.json();
                if (data && data.address) {
                  const address = data.address;
                  const locality = address.neighbourhood || address.suburb || address.locality || address.residential || '';
                  const city = address.city || address.town || address.village || 'Unknown City';
                  checkInArea = locality ? `${locality}, ${city}` : city;
                } else {
                  checkInArea = 'Unknown Area';
                }
              }
            } catch (error) {
              console.error(`Error fetching check-in area for record ${record._id}:`, error);
              checkInArea = 'Error fetching location';
            }
          }

          if (checkOutArea !== OFFICE_NAME && checkOutArea !== 'N/A') {
            try {
              if (record.location && record.location.checkOut && record.location.checkOut.latitude && record.location.checkOut.longitude) {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${record.location.checkOut.latitude}&lon=${record.location.checkOut.longitude}&zoom=18&addressdetails=1`
                );
                const data = await response.json();
                if (data && data.address) {
                  const address = data.address;
                  const locality = address.neighbourhood || address.suburb || address.locality || address.residential || '';
                  const city = address.city || address.town || address.village || 'Unknown City';
                  checkOutArea = locality ? `${locality}, ${city}` : city;
                } else {
                  checkOutArea = 'Unknown Area';
                }
              }
            } catch (error) {
              console.error(`Error fetching check-out area for record ${record._id}:`, error);
              checkOutArea = 'Error fetching location';
            }
          }

          return {
            ...record,
            checkInAreaName: checkInArea,
            checkOutAreaName: checkOutArea,
          };
        })
      );

      // Generate records for all days in the selected month up to the effective end date
      let allRecords = [];
      let presentCount = 0;
      let absentCount = 0;
      let workingDays = 0;
      let holidayCount = 0;
      let leaveCount = 0;
      let sundayCount = 0;

      let currentDateIterator = new Date(startOfSelectedMonth);
      while (currentDateIterator <= effectiveEndDate) {
        const dateStr = moment(currentDateIterator).format('YYYY-MM-DD');
        const existingRecord = updatedRecords.find(record =>
          moment(record.date).format('YYYY-MM-DD') === dateStr
        );

        const isSundayDate = isSunday(currentDateIterator);
        const holiday = holidays.find(holiday =>
          moment(holiday.date).isSame(currentDateIterator, 'day')
        );
        const isAssignedHoliday = holiday && holiday.type === 'Assigned';
        const isSundayHoliday = holiday && holiday.type === 'Sunday';

        if (isSundayDate || isSundayHoliday) {
          sundayCount++;
          allRecords.push({
            employeeId: selectedEmployee,
            date: new Date(currentDateIterator),
            checkInTime: 'N/A',
            checkOutTime: 'N/A',
            location: { checkIn: { latitude: 0, longitude: 0 } },
            status: 'Sunday Holidays',
            holidayReason: 'Sunday',
            absent: false,
            checkInAreaName: 'N/A',
            checkOutAreaName: 'N/A',
          });
        } else if (existingRecord) {
          allRecords.push(existingRecord);
          if (existingRecord.status === 'present') {
            presentCount++;
            workingDays++;
          } else if (existingRecord.status === 'absent') {
            absentCount++;
            workingDays++;
          } else if (existingRecord.status === 'Holiday') {
            holidayCount++;
          } else if (existingRecord.status === 'On Leave') {
            leaveCount++;
          }
        } else if (isAssignedHoliday) {
          holidayCount++;
          allRecords.push({
            employeeId: selectedEmployee,
            date: new Date(currentDateIterator),
            checkInTime: 'N/A',
            checkOutTime: 'N/A',
            location: { checkIn: { latitude: 0, longitude: 0 } },
            status: 'Holiday',
            holidayReason: holiday.reason,
            absent: false,
            checkInAreaName: 'N/A',
            checkOutAreaName: 'N/A',
          });
        } else {
          workingDays++;
          absentCount++;
          allRecords.push({
            employeeId: selectedEmployee,
            date: new Date(currentDateIterator),
            checkInTime: 'N/A',
            checkOutTime: 'N/A',
            location: { checkIn: { latitude: 0, longitude: 0 } },
            status: 'absent',
            holidayReason: 'N/A',
            absent: true,
            checkInAreaName: 'N/A',
            checkOutAreaName: 'N/A',
          });
        }

        // Move to the next day
        currentDateIterator = moment(currentDateIterator).add(1, 'days').toDate();
      }

      // Sort records by date in descending order (newest first)
      allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log('All records (sorted):', allRecords);
      setEmployeeAttendanceWithArea(allRecords);

      setTotalAttendanceThisMonth(presentCount);
      setTotalAbsentThisMonth(absentCount);
      setTotalWorkingDaysThisMonth(workingDays);
      setTotalHolidaysThisMonth(holidayCount);
      setTotalLeavesThisMonth(leaveCount);
      setTotalSundaysThisMonth(sundayCount);

      console.log('Summary for selected month:', {
        presentCount,
        absentCount,
        holidayCount,
        leaveCount,
        sundayCount,
        workingDays,
        startOfMonth: startOfSelectedMonth.toISOString(),
        effectiveEndDate: effectiveEndDate.toISOString(),
      });
    } catch (error) {
      console.error('Error fetching employee attendance:', error);
      toast.error(error.message);
    }
  };

  const handleEmployeeRowClick = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeeAttendance(employee._id);
    setIsEmployeeModalOpen(true);
  };

  const handleDownloadAttendance = () => {
    if (!employeeAttendanceWithArea.length) {
      toast.error('No attendance records to download.');
      return;
    }

    const headers = [
      'Date',
      'Employee Name',
      'Email',
      'Check-In Time',
      'Check-Out Time',
      'Check-In Location',
      'Check-Out Location',
      'Status',
      'Holiday Reason',
    ];

    const csvRows = [
      headers.join(','),
      ...employeeAttendanceWithArea.map(record => {
        const date = new Date(record.date).toISOString().split('T')[0];
        const employeeName = record.employeeId?.fullName || 'N/A';
        const email = record.employeeId?.email || 'N/A';
        const status = record.status.charAt(0).toUpperCase() + record.status.slice(1);
        const row = [
          `"${date}"`,
          `"${employeeName}"`,
          `"${email}"`,
          `"${formatTime(record.checkInTime)}"`,
          `"${formatTime(record.checkOutTime)}"`,
          `"${record.checkInAreaName}"`,
          `"${record.checkOutAreaName}"`,
          `"${status}"`,
          `"${record.holidayReason || 'N/A'}"`,
        ];
        return row.join(',');
      }),
    ];

    console.log('CSV content before download:', csvRows);

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEmployee.fullName}_attendance_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const initializeSundayHolidays = async () => {
      // Define the range for the entire year (or desired range)
      const startOfYear = moment().startOf('year').toDate();
      const endOfYear = moment().endOf('year').toDate();
      await saveSundayHolidays(startOfYear, endOfYear);
    };

    fetchAttendanceRecords();
    fetchHolidays();
    fetchPendingRequests();
    initializeSundayHolidays();
  }, []);

  // Handle month filter change
  const handleMonthFilterChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    if (selectedEmployee) {
      fetchEmployeeAttendance(selectedEmployee._id, newMonth);
    }
  };

  const handleSelectSlot = ({ start }) => {
    const selectedDate = moment(start).startOf('day').toDate();
    const existingHoliday = holidays.find(holiday => moment(holiday.date).isSame(selectedDate, 'day'));

    if (existingHoliday) {
      toast.error('A holiday already exists on this date.');
      return;
    }

    // Check if the selected date is a Sunday
    if (selectedDate.getDay() === 0) {
      toast.error('Cannot create a holiday on a Sunday.');
      return;
    }

    if (selectedDates.some(date => moment(date).isSame(selectedDate, 'day'))) {
      setSelectedDates(selectedDates.filter(date => !moment(date).isSame(selectedDate, 'day')));
    } else {
      setSelectedDates([...selectedDates, selectedDate]);
    }
  };

  const handleCreateHolidays = async () => {
    if (!holidayReason) {
      toast.error('Please provide a reason for the holiday.');
      return;
    }

    try {
      for (const date of selectedDates) {
        const response = await fetch('http://localhost:5000/api/holidays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            date: moment(date).format('YYYY-MM-DD'),
            reason: holidayReason,
            type: 'Assigned', // Explicitly set type as Assigned for user-created holidays
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to create holiday');
        }
      }

      toast.success('Holidays created successfully!');
      setIsHolidayModalOpen(false);
      setSelectedDates([]);
      setHolidayReason('');
      fetchHolidays();
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error creating holidays:', error.message);
      toast.error(error.message);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/holidays/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete holiday');
      }

      toast.success('Holiday deleted successfully!');
      fetchHolidays();
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error deleting holiday:', error.message);
      toast.error(error.message);
    }
  };

  const calendarEvents = [
    ...holidays.map(holiday => ({
      id: holiday._id,
      title: holiday.type === 'Sunday' ? 'Sunday' : `Holiday: ${holiday.reason}`,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      allDay: true,
      type: holiday.type === 'Sunday' ? 'sunday' : 'holiday',
      fullDetails: `${holiday.type === 'Sunday' ? 'Sunday' : `Holiday: ${holiday.reason}`} (${moment(holiday.date).format('MMM DD, YYYY')})`,
    })),
    ...selectedDates.map(date => ({
      title: `Selected: ${holidayReason || 'Holiday'}`,
      start: date,
      end: date,
      allDay: true,
      type: 'selected',
      fullDetails: `Selected: ${holidayReason || 'Holiday'} (${moment(date).format('MMM DD, YYYY')})`,
    })),
  ];

  const handleDateClick = (date) => {
    const selectedDate = moment(date).startOf('day').toDate();
    const eventsOnDate = calendarEvents.filter(event => moment(event.start).isSame(selectedDate, 'day'));
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

    if (event.type === 'holiday') {
      backgroundColor = '#17a2b8';
      borderColor = backgroundColor;
      className += ' w-4 h-4 rounded-full';
    } else if (event.type === 'sunday') {
      backgroundColor = '#d1d5db'; // Gray for Sundays
      borderColor = backgroundColor;
      className += ' w-4 h-4 rounded-full';
    } else if (event.type === 'selected') {
      backgroundColor = '#28a745';
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
    // Save Sundays for the visible month
    const startOfMonth = moment(newDate).startOf('month').toDate();
    const endOfMonth = moment(newDate).endOf('month').toDate();
    saveSundayHolidays(startOfMonth, endOfMonth);
  };

  // Mobile-friendly table row component
  const MobileTableRow = ({ record }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const employeeCode = record.employeeId?.employeeCode || 'N/A';

    return (
      <div
        className={`border-b border-gray-200 py-3 px-2 ${
          record.status === 'absent' ? 'bg-red-50' :
          record.status === 'Holiday' ? 'bg-blue-50' :
          record.status === 'On Leave' ? 'bg-yellow-50' :
          record.status === 'Sunday Holidays' ? 'bg-gray-100' :
          'bg-white'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src={record.employeeId?.profileImage || DEFAULT_PROFILE_IMAGE}
              alt={record.employeeId?.fullName || 'Employee'}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => (e.target.src = DEFAULT_PROFILE_IMAGE)}
            />
            <div>
              <h4 className="font-medium text-gray-900">{record.employeeId?.fullName || 'N/A'}</h4>
              <p className="text-sm text-gray-500">{employeeCode}</p>
            </div>
          </div>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            record.status === 'present' ? 'bg-green-100 text-green-800' :
            record.status === 'absent' ? 'bg-red-100 text-red-800' :
            record.status === 'Holiday' ? 'bg-blue-100 text-blue-800' :
            record.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
            record.status === 'Sunday Holidays' ? 'bg-gray-200 text-gray-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </span>
        </div>

        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Employee Code</p>
                <p>{employeeCode}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="truncate">{record.employeeId?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Contact Number</p>
                <p>{record.employeeId?.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Position</p>
                <p>{record.employeeId?.position || 'N/A'}</p>
              </div>
            </div>
            <button
              className="mt-2 w-full text-sm text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                handleEmployeeRowClick(record.employeeId);
              }}
            >
              View Full Details
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 pt-6 bg-gray-50 min-w-[100vw] sm:min-w-full min-h-screen">
      <div className="max-w-8xl  mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance Sheet</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsRequestsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center text-sm sm:text-base relative"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Attendance Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="bg-teal-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Give Holiday
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : uniqueEmployees.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
          </div>
        ) : isMobileView ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Employee List</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {uniqueEmployees.map((record) => (
                <MobileTableRow key={record.employeeId._id} record={record} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Employee List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Code</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No.</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uniqueEmployees.map((record) => {
                    const employeeCode = record.employeeId?.employeeCode || 'N/A';

                    return (
                      <tr
                        key={record.employeeId._id}
                        onClick={() => handleEmployeeRowClick(record.employeeId)}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                          record.status === 'absent' ? 'bg-red-50' :
                          record.status === 'Holiday' ? 'bg-blue-50' :
                          record.status === 'On Leave' ? 'bg-yellow-50' :
                          record.status === 'Sunday Holidays' ? 'bg-gray-100' : ''
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <img
                            src={record.employeeId?.profileImage || DEFAULT_PROFILE_IMAGE}
                            alt={record.employeeId?.fullName || 'Employee'}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => (e.target.src = DEFAULT_PROFILE_IMAGE)}
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{employeeCode}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.employeeId?.fullName || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.employeeId?.email || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.employeeId?.phoneNumber || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.employeeId?.position || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employee Attendance Modal */}
        {isEmployeeModalOpen && selectedEmployee && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full mt-14 max-w-7xl hide-scrollbar max-h-[90vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-blue-600 rounded-t-lg px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  Attendance for {selectedEmployee.fullName}
                </h3>
                <button
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {/* Employee Details Section */}
                <div className="mb-6 bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Employee Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Employee Code:</p>
                      <p>{selectedEmployee.employeeCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Name:</p>
                      <p>{selectedEmployee.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Email:</p>
                      <p>{selectedEmployee.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Position:</p>
                      <p>{selectedEmployee.position || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Month Filter Dropdown */}
                <div className="mb-4 flex items-center gap-2">
                  <label htmlFor="monthFilter" className="text-sm font-medium text-gray-700">
                    Filter by Month:
                  </label>
                  <input
                    type="month"
                    id="monthFilter"
                    value={selectedMonth}
                    onChange={handleMonthFilterChange}
                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-700 font-semibold">
                    Attendance for {moment(selectedMonth).format('MMMM YYYY')}: <br />
                    <span className="text-blue-600">{totalWorkingDaysThisMonth}</span> Working Days / 
                    <span className="text-green-600">{totalAttendanceThisMonth}</span> Present / 
                    <span className="text-red-600">{totalAbsentThisMonth}</span> Absent / 
                    <span className="text-blue-600">{totalHolidaysThisMonth}</span> Holidays / 
                    <span className="text-yellow-600">{totalLeavesThisMonth}</span> Leaves / 
                    <span className="text-gray-600">{totalSundaysThisMonth}</span> Sundays
                  </p>
                </div>

                {/* Display all records */}
                {(() => {
                  if (employeeAttendanceWithArea.length === 0) {
                    return <p className="text-gray-700">No attendance records found for this employee in {moment(selectedMonth).format('MMMM YYYY')}.</p>;
                  }

                  return isMobileView ? (
                    <div className="space-y-3">
                      {employeeAttendanceWithArea.map((record) => (
                        <div key={`${record.date}-${record.status}`} className={`border rounded-lg p-3 shadow-sm ${
                          record.status === 'present' ? 'bg-green-50' :
                          record.status === 'absent' ? 'bg-red-50' :
                          record.status === 'Holiday' ? 'bg-blue-50' :
                          record.status === 'On Leave' ? 'bg-yellow-50' :
                          record.status === 'Sunday Holidays' ? 'bg-gray-100' :
                          'bg-white'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">Employee: {record.employeeId?.fullName || 'N/A'}</p>
                              <p className="text-sm text-gray-500">Email: {record.employeeId?.email || 'N/A'}</p>
                              <p className="text-sm text-gray-500">Check-In: {formatTime(record.checkInTime)}</p>
                              <p className="text-sm text-gray-500">Check-Out: {formatTime(record.checkOutTime)}</p>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              record.status === 'Holiday' ? 'bg-blue-100 text-blue-800' :
                              record.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                              record.status === 'Sunday Holidays' ? 'bg-gray-200 text-gray-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Check-In Location</p>
                              <p className="truncate">{record.checkInAreaName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Check-Out Location</p>
                              <p className="truncate">{record.checkOutAreaName}</p>
                            </div>
                            {record.status === 'Holiday' && (
                              <div className="col-span-2">
                                <p className="text-gray-500">Holiday Reason</p>
                                <p>{record.holidayReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In Time</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out Time</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In Location</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out Location</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holiday Reason</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {employeeAttendanceWithArea.map((record) => (
                            <tr key={`${record.date}-${record.status}`} className={
                              record.status === 'present' ? 'bg-green-50' :
                              record.status === 'absent' ? 'bg-red-50' :
                              record.status === 'Holiday' ? 'bg-blue-50' :
                              record.status === 'On Leave' ? 'bg-yellow-50' :
                              record.status === 'Sunday Holidays' ? 'bg-gray-100' :
                              ''
                            }>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.employeeId?.fullName || 'N/A'}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.employeeId?.email || 'N/A'}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{formatTime(record.checkInTime)}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{formatTime(record.checkOutTime)}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.checkInAreaName}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.checkOutAreaName}</td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                                  record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                  record.status === 'Holiday' ? 'bg-blue-100 text-blue-800' :
                                  record.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                                  record.status === 'Sunday Holidays' ? 'bg-gray-200 text-gray-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{record.holidayReason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
              <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end space-x-2 sm:space-x-3 bg-gray-50 rounded-b-lg z-10">
                <button
                  onClick={handleDownloadAttendance}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors duration-200 text-sm sm:text-base"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-3 sm:px-6 py-1.5 sm:py-2 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Requests Modal */}
        {isRequestsModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-blue-600 rounded-t-lg px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Pending Attendance Requests</h3>
                <button
                  onClick={() => setIsRequestsModalOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-700">No pending attendance requests found.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(request => (
                      <div key={request._id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">Employee Name:</p>
                            <p>{request.employeeId?.fullName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Employee Code:</p>
                            <p>{request.employeeId?.employeeCode || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Date:</p>
                            <p>{new Date(request.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Check-In Time:</p>
                            <p>{formatTime(request.checkInTime)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Check-Out Time:</p>
                            <p>{formatTime(request.checkOutTime)}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-gray-600 font-medium">Reason:</p>
                            <p>{request.reason}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            onClick={() => handleRequestAction(request._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                            disabled={isProcessing[request._id]}
                          >
                            {isProcessing[request._id] ? (
                              <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : null}
                            Approve
                          </button>
                          <button
                            onClick={() => handleRequestAction(request._id, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                            disabled={isProcessing[request._id]}
                          >
                            {isProcessing[request._id] ? (
                              <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : null}
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg z-10">
                <button
                  onClick={() => setIsRequestsModalOpen(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Give Holiday Modal with Calendar */}
        {isHolidayModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-green-600 rounded-t-lg px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Assign Holidays</h3>
                <button
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="h-[300px] sm:h-[400px]">
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    defaultView="month"
                    views={['month']}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={({ start }) => handleDateClick(start)}
                    date={currentDate}
                    onNavigate={handleNavigate}
                    dayPropGetter={customDayPropGetter}
                    eventPropGetter={customEventPropGetter}
                    components={{
                      event: ({ event }) => (
                        <div
                          data-tooltip-id="calendar-tooltip"
                          data-tooltip-content={event.fullDetails}
                          className="cursor-pointer"
                        >
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"></div>
                        </div>
                      ),
                    }}
                    className="text-xs sm:text-sm"
                  />
                </div>
                <Tooltip id="calendar-tooltip" place="top" effect="solid" />
                <div className="mt-4">
                  <label className="block text-gray-700 mb-2 text-sm sm:text-base">Reason for Holiday</label>
                  <input
                    type="text"
                    value={holidayReason}
                    onChange={(e) => setHolidayReason(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="e.g., Diwali, Independence Day"
                  />
                </div>
                {calendarEvents.filter(event => event.id).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Existing Holidays</h4>
                    <ul className="space-y-2">
                      {calendarEvents
                        .filter(event => event.id)
                        .map(event => (
                          <li key={event.id} className="flex justify-between items-center text-sm sm:text-base">
                            <span>{event.title} - {moment(event.start).format('YYYY-MM-DD')}</span>
                            <button
                              onClick={() => handleDeleteHoliday(event.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm"
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end space-x-2 sm:space-x-3 bg-gray-50 rounded-b-lg z-10">
                <button
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateHolidays}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-green-600 hover:bg-green-700"
                  disabled={selectedDates.length === 0 || !holidayReason}
                >
                  Save Holidays
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {isEventModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 rounded-t-lg px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  Events on {moment(selectedDateEvents[0]?.start).format('MMM DD, YYYY')}
                </h3>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-gray-700">No events on this date.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedDateEvents.map((event, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                          event.type === 'selected' ? 'bg-green-500' :
                          event.type === 'holiday' ? 'bg-blue-500' :
                          event.type === 'sunday' ? 'bg-gray-500' :
                          'bg-gray-500'
                        }`}></span>
                        <span className="text-sm sm:text-base text-gray-900">{event.fullDetails}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg z-10">
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-100"
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

export default AttendanceSheet;