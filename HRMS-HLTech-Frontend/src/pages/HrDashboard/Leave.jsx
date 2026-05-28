import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function Leave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [rawLeaveRequests, setRawLeaveRequests] = useState([]);
  const [groupedLeaveRequests, setGroupedLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingStates, setUpdatingStates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Updated endpoint from /api/employees to /api/users
      const response = await fetch('http://localhost:5000/api/users?page=1&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to fetch employees (Status: ${response.status})`);
      }

      const data = await response.json();
      const employeeList = data.employees;

      const currentYear = new Date().getFullYear();
      const employeesWithBalances = await Promise.all(
        employeeList.map(async (employee) => {
          try {
            const balanceResponse = await fetch(
              `http://localhost:5000/api/leave/balance/${employee._id}?year=${currentYear}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );

            if (!balanceResponse.ok) {
              throw new Error('Failed to fetch leave balance');
            }

            const balanceData = await balanceResponse.json();
            const leaveBalance = balanceData[0] || {
              en: { available: 0, used: 0 },
              cl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
              fl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
              unpaid: 0,
              unpaidHalf: 0,
            };

            return {
              ...employee,
              leaveBalance: {
                en: {
                  available: leaveBalance.en.available || 0,
                  used: leaveBalance.en.used || 0,
                },
                cl: {
                  firstHalf: {
                    available: (leaveBalance.cl.firstHalf.credited - leaveBalance.cl.firstHalf.used) || 0,
                    used: leaveBalance.cl.firstHalf.used || 0,
                  },
                  secondHalf: {
                    available: (leaveBalance.cl.secondHalf.credited - leaveBalance.cl.secondHalf.used) || 0,
                    used: leaveBalance.cl.secondHalf.used || 0,
                  },
                },
                fl: {
                  firstHalf: {
                    available: (leaveBalance.fl.firstHalf.credited - leaveBalance.fl.firstHalf.used) || 0,
                    used: leaveBalance.fl.firstHalf.used || 0,
                  },
                  secondHalf: {
                    available: (leaveBalance.fl.secondHalf.credited - leaveBalance.fl.secondHalf.used) || 0,
                    used: leaveBalance.fl.secondHalf.used || 0,
                  },
                },
                unpaid: {
                  used: leaveBalance.unpaid || 0,
                },
                unpaidHalf: {
                  used: leaveBalance.unpaidHalf || 0,
                },
              },
            };
          } catch (error) {
            console.warn(`Failed to fetch leave balance for employee ${employee._id}:`, error);
            return {
              ...employee,
              leaveBalance: {
                en: { available: 0, used: 0 },
                cl: { firstHalf: { available: 0, used: 0 }, secondHalf: { available: 0, used: 0 } },
                fl: { firstHalf: { available: 0, used: 0 }, secondHalf: { available: 0, used: 0 } },
                unpaid: { used: 0 },
                unpaidHalf: { used: 0 },
              },
            };
          }
        })
      );

      console.log('Employees with leave balances:', employeesWithBalances);
      setEmployees(employeesWithBalances);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(error.message);
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    }
  };

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const queryParams = new URLSearchParams();
      if (filterStatus) queryParams.append('status', filterStatus);
      if (filterLeaveType) queryParams.append('leaveType', filterLeaveType);
      if (filterStartDate) queryParams.append('startDate', filterStartDate);
      if (filterEndDate) queryParams.append('endDate', filterEndDate);

      const response = await fetch(
        `http://localhost:5000/api/leave${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to fetch leave requests (Status: ${response.status})`);
      }

      const leaveRequestsData = await response.json();
      console.log('Fetched leave requests:', leaveRequestsData);
      setRawLeaveRequests(leaveRequestsData);

      const groupedByEmployeeAndReason = {};

      leaveRequestsData.forEach((request) => {
        const key = `${request.employeeId?._id || 'unknown'}-${request.reason}-${request.isHalfDay}`;
        if (!groupedByEmployeeAndReason[key]) {
          groupedByEmployeeAndReason[key] = [];
        }
        groupedByEmployeeAndReason[key].push(request);
      });

      const grouped = [];

      const groupPromises = Object.values(groupedByEmployeeAndReason).map(async (requests) => {
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
                processGroupSync(currentGroup, grouped, token);
              }
              currentGroup = [request];
            }
          } else {
            currentGroup = [request];
          }
          lastToDate = new Date(request.toDate);
          if (index === requests.length - 1 && currentGroup.length > 0) {
            processGroupSync(currentGroup, grouped, token);
          }
        });
      });

      await Promise.all(groupPromises);

      console.log('Grouped leave requests:', grouped);

      const finalGroupedRequests = grouped.map((group) => ({
        _id: group.ids.join(','),
        employeeId: group.employeeId,
        fromDate: group.fromDate,
        toDate: group.toDate,
        leaveType: group.leaveTypes.map(lt => `${lt.leaveType}${lt.isHalfDay ? ` (${lt.halfDayType})` : ''}`).join(', '),
        isHalfDay: group.isHalfDay,
        reason: group.reason,
        approvedBy: group.approvedBy,
        status: group.status,
        leaveBalance: group.leaveBalance,
      }));

      console.log('Final grouped leave requests:', finalGroupedRequests);
      setGroupedLeaveRequests(finalGroupedRequests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error(error.message);
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const processGroupSync = (group, grouped, token) => {
    const sortedByFrom = [...group].sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));
    const sortedByTo = [...group].sort((a, b) => new Date(a.toDate) - new Date(b.toDate));
    const fromDate = sortedByFrom[0].fromDate;
    const toDate = sortedByTo[sortedByTo.length - 1].toDate;

    const employeeId = group[0].employeeId;
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

    let leaveBalance = null;
    if (employeeId && employeeId._id) {
      try {
        const year = new Date(fromDate).getFullYear();
        const response = fetch(
          `http://localhost:5000/api/leave/balance/${employeeId._id}?year=${year}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        ).then(res => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Failed to fetch leave balance');
        }).then(balanceData => {
          leaveBalance = balanceData[0] || null;
        }).catch(error => {
          console.warn(`Error fetching leave balance for employee ${employeeId._id}:`, error);
          leaveBalance = null;
        });
      } catch (error) {
        console.error(`Error fetching leave balance for employee ${employeeId._id}:`, error);
        leaveBalance = null;
      }
    }

    grouped.push({
      ids,
      employeeId,
      fromDate,
      toDate,
      leaveTypes,
      reason,
      approvedBy,
      status,
      isHalfDay,
      leaveBalance,
    });
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, [filterStatus, filterLeaveType, filterStartDate, filterEndDate]);

  const handleStatusUpdate = async (ids, status) => {
    const requestId = ids;

    setUpdatingStates(prev => ({
      ...prev,
      [requestId]: true,
    }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const idArray = ids.split(',');
      const updatePromises = idArray.map(id =>
        fetch(`http://localhost:5000/api/leave/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }).then(async response => {
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `Failed to update leave request (Status: ${response.status})`);
          }
          const data = await response.json();
          console.log('Leave request update response:', data);
          return data;
        })
      );

      await Promise.all(updatePromises);

      toast.success(`Leave request(s) ${status.toLowerCase()} successfully!`);
      setTimeout(() => {
        fetchLeaveRequests();
        fetchEmployees();
      }, 500);
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error(error.message);
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    } finally {
      setUpdatingStates(prev => ({
        ...prev,
        [requestId]: false,
      }));
    }
  };

  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    setSelectedEmployee(employeeId);
    if (employeeId) {
      setIsModalOpen(true);
    }
  };

  const refreshEmployeeBalance = async () => {
    if (!selectedEmployee) return;

    setIsModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const currentYear = new Date().getFullYear();
      const balanceResponse = await fetch(
        `http://localhost:5000/api/leave/balance/${selectedEmployee}?year=${currentYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!balanceResponse.ok) {
        throw new Error('Failed to fetch leave balance');
      }

      const balanceData = await balanceResponse.json();
      const leaveBalance = balanceData[0] || {
        en: { available: 0, used: 0 },
        cl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
        fl: { firstHalf: { credited: 0, used: 0 }, secondHalf: { credited: 0, used: 0 } },
        unpaid: 0,
        unpaidHalf: 0,
      };

      const updatedEmployees = employees.map(employee => {
        if (employee._id === selectedEmployee) {
          return {
            ...employee,
            leaveBalance: {
              en: {
                available: leaveBalance.en.available || 0,
                used: leaveBalance.en.used || 0,
              },
              cl: {
                firstHalf: {
                  available: (leaveBalance.cl.firstHalf.credited - leaveBalance.cl.firstHalf.used) || 0,
                  used: leaveBalance.cl.firstHalf.used || 0,
                },
                secondHalf: {
                  available: (leaveBalance.cl.secondHalf.credited - leaveBalance.cl.secondHalf.used) || 0,
                  used: leaveBalance.cl.secondHalf.used || 0,
                },
              },
              fl: {
                firstHalf: {
                  available: (leaveBalance.fl.firstHalf.credited - leaveBalance.fl.firstHalf.used) || 0,
                  used: leaveBalance.fl.firstHalf.used || 0,
                },
                secondHalf: {
                  available: (leaveBalance.fl.secondHalf.credited - leaveBalance.fl.secondHalf.used) || 0,
                  used: leaveBalance.fl.secondHalf.used || 0,
                },
              },
              unpaid: {
                used: leaveBalance.unpaid || 0,
              },
              unpaidHalf: {
                used: leaveBalance.unpaidHalf || 0,
              },
            },
          };
        }
        return employee;
      });

      setEmployees(updatedEmployees);
      toast.success('Leave balance refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing leave balance:', error);
      toast.error(error.message);
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    } finally {
      setIsModalLoading(false);
    }
  };

  const calculateDays = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const LeaveRequestCard = ({ request }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalDays = calculateDays(request.fromDate, request.toDate);
    const leaveDeduction = request.isHalfDay ? totalDays * 0.5 : totalDays;
    const leaveTypesArray = request.leaveType ? request.leaveType.split(', ').map(type => type.trim()) : [];
    const isUpdating = updatingStates[request._id] || false;

    return (
      <div className="border rounded-lg shadow-sm mb-4 overflow-hidden bg-white">
        <div
          className="p-3 flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <h4 className="font-medium text-gray-900">
              {request.employeeId?.fullName || <span className="text-red-500">Employee Not Found</span>}
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
                {leaveDeduction} day(s) {request.isHalfDay ? '(Half-Day)' : ''}
              </span>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-100 p-3">
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-gray-500">Leave Type</p>
                {leaveTypesArray.length > 1 ? (
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
              <div className="col-span-2">
                <p className="text-gray-500">Leave Balances (Financial Year: {request.leaveBalance?.financialYear || 'N/A'})</p>
                {request.leaveBalance ? (
                  <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                    <div>
                      <p className="text-gray-600">Earn Leave (EN): {request.leaveBalance.en.available}</p>
                      <p className="text-gray-600">Casual Leave (First Half): {request.leaveBalance.cl.firstHalf.credited - request.leaveBalance.cl.firstHalf.used}</p>
                      <p className="text-gray-600">Casual Leave (Second Half): {request.leaveBalance.cl.secondHalf.credited - request.leaveBalance.cl.secondHalf.used}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Flexi Leave (First Half): {request.leaveBalance.fl.firstHalf.credited - request.leaveBalance.fl.firstHalf.used}</p>
                      <p className="text-gray-600">Flexi Leave (Second Half): {request.leaveBalance.fl.secondHalf.credited - request.leaveBalance.fl.secondHalf.used}</p>
                      <p className="text-gray-600">Unpaid Leave Taken: {request.leaveBalance.unpaid}</p>
                      <p className="text-gray-600">Unpaid Half-Day Taken: {request.leaveBalance.unpaidHalf}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500">Unable to fetch leave balances</p>
                )}
              </div>
            </div>

            {request.status === 'Pending' && (
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(request._id, 'Approved');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
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
                      Approving...
                    </>
                  ) : (
                    'Approve'
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(request._id, 'Rejected');
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
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
                      Rejecting...
                    </>
                  ) : (
                    'Reject'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 pt-6 bg-gray-50 min-w-[100vw] sm:min-w-full min-h-screen">
      <div className="max-w-8xl mx-auto">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Leave Requests</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={selectedEmployee}
                onChange={handleEmployeeSelect}
                className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Select Employee to View Leave Balance</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.fullName} ({employee.employeeCode})
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
                className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">All Leave Types</option>
                <option value="EN">Earn Leave (EN)</option>
                <option value="CL">Casual Leave (CL)</option>
                <option value="FL">Flexi Leave (FL)</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
              
              <button
                onClick={fetchLeaveRequests}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? (
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
                    Loading...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal for Viewing Leave Balance */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full hide-scrollbar max-w-5xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Leave Balance for {employees.find(emp => emp._id === selectedEmployee)?.fullName}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedEmployee('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedEmployee && (
                (() => {
                  const employee = employees.find(emp => emp._id === selectedEmployee);
                  const balance = employee?.leaveBalance || {
                    en: { available: 0, used: 0 },
                    cl: { firstHalf: { available: 0, used: 0 }, secondHalf: { available: 0, used: 0 } },
                    fl: { firstHalf: { available: 0, used: 0 }, secondHalf: { available: 0, used: 0 } },
                    unpaid: { used: 0 },
                    unpaidHalf: { used: 0 },
                  };

                  const totalAvailableLeaves =
                    balance.en.available +
                    balance.cl.firstHalf.available +
                    balance.cl.secondHalf.available +
                    balance.fl.firstHalf.available +
                    balance.fl.secondHalf.available;

                  return (
                    <div className="space-y-6">
                      {/* Summary Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-blue-800">Total Available Leaves</h3>
                          <p className="text-2xl font-bold text-blue-600">{totalAvailableLeaves}</p>
                        </div>
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>

                      {/* Leave Balance Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Earn Leave (EN) */}
                        <div className={`p-4 rounded-lg shadow-sm ${balance.en.available <= 1 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <h4 className="text-md font-semibold text-gray-800">Earn Leave (EN)</h4>
                            </div>
                            {balance.en.available <= 1 && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">Low Balance</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Available: <span className="font-medium text-gray-800">{balance.en.available}</span></p>
                            <p className="text-sm text-gray-600">Used: <span className="font-medium text-gray-800">{balance.en.used}</span></p>
                          </div>
                        </div>

                        {/* Casual Leave (First Half) */}
                        <div className={`p-4 rounded-lg shadow-sm ${balance.cl.firstHalf.available <= 1 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h4 className="text-md font-semibold text-gray-800">Casual Leave (First Half)</h4>
                            </div>
                            {balance.cl.firstHalf.available <= 1 && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">Low Balance</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Available: <span className="font-medium text-gray-800">{balance.cl.firstHalf.available}</span></p>
                            <p className="text-sm text-gray-600">Used: <span className="font-medium text-gray-800">{balance.cl.firstHalf.used}</span></p>
                          </div>
                        </div>

                        {/* Casual Leave (Second Half) */}
                        <div className={`p-4 rounded-lg shadow-sm ${balance.cl.secondHalf.available <= 1 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h4 className="text-md font-semibold text-gray-800">Casual Leave (Second Half)</h4>
                            </div>
                            {balance.cl.secondHalf.available <= 1 && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">Low Balance</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Available: <span className="font-medium text-gray-800">{balance.cl.secondHalf.available}</span></p>
                            <p className="text-sm text-gray-600">Used: <span className="font-medium text-gray-800">{balance.cl.secondHalf.used}</span></p>
                          </div>
                        </div>

                        {/* Flexi Leave (First Half) */}
                        <div className={`p-4 rounded-lg shadow-sm ${balance.fl.firstHalf.available <= 1 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h4 className="text-md font-semibold text-gray-800">Flexi Leave (First Half)</h4>
                            </div>
                            {balance.fl.firstHalf.available <= 1 && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">Low Balance</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Available: <span className="font-medium text-gray-800">{balance.fl.firstHalf.available}</span></p>
                            <p className="text-sm text-gray-600">Used: <span className="font-medium text-gray-800">{balance.fl.firstHalf.used}</span></p>
                          </div>
                        </div>

                        {/* Flexi Leave (Second Half) */}
                        <div className={`p-4 rounded-lg shadow-sm ${balance.fl.secondHalf.available <= 1 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h4 className="text-md font-semibold text-gray-800">Flexi Leave (Second Half)</h4>
                            </div>
                            {balance.fl.secondHalf.available <= 1 && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">Low Balance</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Available: <span className="font-medium text-gray-800">{balance.fl.secondHalf.available}</span></p>
                            <p className="text-sm text-gray-600">Used: <span className="font-medium text-gray-800">{balance.fl.secondHalf.used}</span></p>
                          </div>
                        </div>

                        {/* Unpaid Leave */}
                        <div className="p-4 rounded-lg shadow-sm bg-gray-50 border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                            <h4 className="text-md font-semibold text-gray-800">Unpaid Leave</h4>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Used: <span className="font-medium text-gray-800">{balance.unpaid.used}</span></p>
                          </div>
                        </div>

                        {/* Unpaid Half-Day Leave */}
                        <div className="p-4 rounded-lg shadow-sm bg-gray-50 border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="text-md font-semibold text-gray-800">Unpaid Half-Day Leave</h4>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Used: <span className="font-medium text-gray-800">{balance.unpaidHalf.used}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={refreshEmployeeBalance}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
                          disabled={isModalLoading}
                        >
                          {isModalLoading ? (
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
                              Refreshing...
                            </>
                          ) : (
                            'Refresh Balance'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsModalOpen(false);
                            setSelectedEmployee('');
                          }}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : groupedLeaveRequests.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">No leave requests found (Grouped)</h3>
            {rawLeaveRequests.length > 0 ? (
              <div>
                <p className="mt-1 text-gray-500">Raw leave requests available but grouping failed:</p>
                <ul className="mt-2 text-gray-600">
                  {rawLeaveRequests.map((req) => (
                    <li key={req._id}>
                      {req.employeeId?.fullName || 'Unknown Employee'} - {req.leaveType} - {new Date(req.fromDate).toLocaleDateString()} to {new Date(req.toDate).toLocaleDateString()} - {req.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-1 text-gray-500">Try adjusting the filter or wait for new requests.</p>
            )}
          </div>
        ) : isMobileView ? (
          <div className="space-y-3">
            {groupedLeaveRequests.map((request) => (
              <LeaveRequestCard key={request._id} request={request} />
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedLeaveRequests.map((request) => {
                    const totalDays = calculateDays(request.fromDate, request.toDate);
                    const leaveDeduction = request.isHalfDay ? totalDays * 0.5 : totalDays;
                    const leaveTypesArray = request.leaveType ? request.leaveType.split(', ').map(type => type.trim()) : [];
                    const isMultipleDayLeave = leaveTypesArray.length > 1;
                    const isUpdating = updatingStates[request._id] || false;

                    return (
                      <tr key={request._id}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {request.employeeId?.fullName || (
                            <span className="text-red-500">Employee Not Found</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {isMultipleDayLeave ? (
                            <select className="border rounded p-1 text-sm focus:ring-2 focus:ring-blue-500">
                              {leaveTypesArray.map((type, index) => (
                                <option key={index} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            `${request.leaveType} ${request.isHalfDay ? `(${request.halfDayType})` : ''}`
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{new Date(request.fromDate).toLocaleDateString()}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{new Date(request.toDate).toLocaleDateString()}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{leaveDeduction}</td>
                        <td className="px-4 sm:px-6 py-4 max-w-xs truncate">{request.reason}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {request.status === 'Pending' ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(request._id, 'Approved')}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
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
                                    Approving...
                                  </>
                                ) : (
                                  'Approve'
                                )}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
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
                                    Rejecting...
                                  </>
                                ) : (
                                  'Reject'
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">No action</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leave;