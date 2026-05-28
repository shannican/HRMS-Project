import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import moment from 'moment';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    employees: { count: 0 },
    attendance: { present: 0, absent: 0, percentage: '0%' },
    projects: [],
    leaveRequests: { count: 0 },
    payroll: { total: '$0' },
    jobPostings: { count: 0 },
    kycVerifications: { count: 0 },
    assessments: { count: 0 },
    notifications: [],
    upcomingBirthdays: [],
    upcomingAnniversaries: [],
    announcements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(null); // null, 'notifications', 'announcements', 'birthdays', 'anniversaries'
  const [modalData, setModalData] = useState([]); // Data to display in the modal
  const [modalError, setModalError] = useState(null); // Error message for modal

  const API_BASE_URL = 'http://localhost:5000/api';
  const getAuthToken = () => localStorage.getItem('token');

  // Retry function for API calls
  const retryFetch = async (url, options, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios(url, options);
        return response;
      } catch (err) {
        console.error(`Retry attempt ${attempt} for ${url} failed:`, {
          message: err.message,
          response: err.response ? {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers,
          } : null,
        });
        if (attempt === retries) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) throw new Error('No authentication token found');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Employees
        let employeesResponse;
        try {
          employeesResponse = await retryFetch(`${API_BASE_URL}/users`, { headers });
        } catch (err) {
          console.warn('Employees fetch failed, using defaults:', err);
          employeesResponse = { data: { totalEmployees: 0, employees: [] } };
        }
        const employeesCount = employeesResponse.data.totalEmployees || 0;

        // Fetch Upcoming Events (Birthdays and Anniversaries)
        let upcomingEventsResponse;
        try {
          upcomingEventsResponse = await retryFetch(`${API_BASE_URL}/upcoming-events`, { headers });
          console.log('Upcoming Events Response:', upcomingEventsResponse.data);
        } catch (err) {
          console.error('Failed to fetch upcoming events after retries:', {
            message: err.message,
            response: err.response ? {
              status: err.response.status,
              data: err.response.data,
              headers: err.response.headers,
            } : null,
          });
          setModalError('Failed to load upcoming events. Please check if the server is running and the /api/upcoming-events endpoint is configured correctly.');
          upcomingEventsResponse = { data: { upcomingBirthdays: [], upcomingAnniversaries: [] } };
        }
        const { upcomingBirthdays, upcomingAnniversaries } = upcomingEventsResponse.data;

        // Fetch Attendance Stats
        const currentMonth = moment().month() + 1;
        const currentYear = moment().year();
        let attendanceResponse;
        try {
          attendanceResponse = await retryFetch(
            `${API_BASE_URL}/attendance/stats/${employeesResponse.data.employees[0]?._id || 'default'}`,
            { headers, params: { month: currentMonth, year: currentYear } }
          );
        } catch (err) {
          console.warn('Attendance stats fetch failed, using defaults:', err);
          attendanceResponse = { data: { presentCount: 0, absentCount: 0, workingDays: 0 } };
        }
        const { presentCount, absentCount, workingDays } = attendanceResponse.data;
        const attendancePercentage = workingDays > 0 ? ((presentCount / workingDays) * 100).toFixed(0) + '%' : '0%';

        // Fetch Leave Requests
        let leaveResponse;
        try {
          leaveResponse = await retryFetch(`${API_BASE_URL}/leave`, {
            headers,
            params: { status: 'Pending' },
          });
        } catch (err) {
          console.warn('Leave requests fetch failed, using default:', err);
          leaveResponse = { data: [] };
        }
        const leaveRequestsCount = leaveResponse.data.length;

        // Fetch Payroll Records
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();
        let payrollResponse;
        try {
          payrollResponse = await retryFetch(`${API_BASE_URL}/payroll/records`, {
            headers,
            params: { periodStart: startOfMonth, periodEnd: endOfMonth },
          });
        } catch (err) {
          console.warn('Payroll fetch failed, using default:', err);
          payrollResponse = { data: { summary: { totalNetPay: 0 } } };
        }
        const totalPayroll = payrollResponse.data.summary.totalNetPay.toLocaleString();

        // Fetch Job Postings
        let jobsResponse;
        try {
          jobsResponse = await retryFetch(`${API_BASE_URL}/jobs`, { headers });
        } catch (err) {
          console.warn('Jobs fetch failed, using default:', err);
          jobsResponse = { data: [] };
        }
        const jobPostingsCount = jobsResponse.data.filter(job => job.visibility === 'public').length;

        // Fetch KYC Verifications
        let kycResponse;
        try {
          kycResponse = await retryFetch(`${API_BASE_URL}/kyc/pending`, { headers });
        } catch (err) {
          console.warn('KYC fetch failed, using default:', err);
          kycResponse = { data: [] };
        }
        const kycPendingCount = kycResponse.data.length;

        // Fetch Assessments
        let assessmentsResponse;
        try {
          assessmentsResponse = await retryFetch(`${API_BASE_URL}/assessments/results`, { headers });
        } catch (err) {
          console.warn('Assessments fetch failed, using default:', err);
          assessmentsResponse = { data: [] };
        }
        const assessmentsCount = assessmentsResponse.data.length;

        // Fetch Notifications
        let notificationsResponse;
        try {
          notificationsResponse = await retryFetch(`${API_BASE_URL}/notifications`, { headers });
        } catch (err) {
          console.warn('Notifications fetch failed, using default:', err);
          notificationsResponse = { data: [] };
        }
        const notifications = notificationsResponse.data;

        setDashboardData({
          employees: { count: employeesCount },
          attendance: { present: presentCount, absent: absentCount, percentage: attendancePercentage },
          projects: [
            { name: 'School', progress: 70 },
            { name: 'Furniture', progress: 40 },
            { name: 'Company Website', progress: 60 },
            { name: 'Travel', progress: 80 },
            { name: 'Others', progress: 20 },
          ],
          leaveRequests: { count: leaveRequestsCount },
          payroll: { total: `$${totalPayroll}` },
          jobPostings: { count: jobPostingsCount },
          kycVerifications: { count: kycPendingCount },
          assessments: { count: assessmentsCount },
          notifications: notifications.map(n => ({
            message: n.message,
            time: moment(n.updatedAt || n.createdAt).fromNow(),
            read: n.read,
            type: n.type,
          })),
          upcomingBirthdays: upcomingBirthdays.map(b => ({
            name: b.name,
            dateOfBirth: b.dateOfBirth || 'N/A',
            department: b.department || 'N/A',
          })),
          upcomingAnniversaries: upcomingAnniversaries.map(a => ({
            name: a.name,
            years: a.years || 0,
            joiningDate: a.joiningDate || 'N/A',
            department: a.department || 'N/A',
          })),
          announcements: [
            {
              title: 'HR Policy Update',
              date: '2025-06-20',
              content: 'New remote work policy effective from July 1st, 2025. Please review the updated guidelines.',
            },
            {
              title: 'Quarterly Meeting',
              date: '2025-06-25',
              content: 'All-hands meeting scheduled for Wednesday, June 25th at 3:00 PM in the main conference room.',
            },
          ],
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Modal Handlers
  const openModal = (type, data) => {
    setModalOpen(type);
    setModalData(data);
    setModalError(null); // Reset modal error when opening
  };

  const closeModal = () => {
    setModalOpen(null);
    setModalData([]);
    setModalError(null);
  };

  // Attendance Chart Data
  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [dashboardData.attendance.present || 0, dashboardData.attendance.absent || 0],
        backgroundColor: ['#34D399', '#EF4444'],
        hoverOffset: 4,
      },
    ],
  };

  // Dashboard Cards
  const dashboardCards = [
    {
      title: 'Employees',
      count: dashboardData.employees.count,
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
        </svg>
      ),
      color: 'bg-teal-100',
      route: '/employees',
    },
    {
      title: 'Projects',
      count: dashboardData.projects.length,
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      ),
      color: 'bg-blue-100',
      route: '/projects',
    },
    {
      title: 'Attendance',
      count: dashboardData.attendance.percentage,
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
        </svg>
      ),
      color: 'bg-green-100',
      route: '/attendance-sheet',
    },
    {
      title: 'Leave Requests',
      count: dashboardData.leaveRequests.count,
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
        </svg>
      ),
      color: 'bg-yellow-100',
      route: '/leave',
    },
    {
      title: 'Payroll',
      count: dashboardData.payroll.total,
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07-.34-.433-.582a2.305 2.305 0 01-.567.267z" />
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
        </svg>
      ),
      color: 'bg-purple-100',
      route: '/payroll',
    },
    {
      title: 'Job Postings',
      count: dashboardData.jobPostings.count,
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'bg-indigo-100',
      route: '/job-posting',
    },
    {
      title: 'KYC Verifications',
      count: `${dashboardData.kycVerifications.count} Pending`,
      icon: (
        <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
        </svg>
      ),
      color: 'bg-pink-100',
      route: '/kyc-verification',
    },
    {
      title: 'Assessments',
      count: `${dashboardData.assessments.count} Active`,
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
        </svg>
      ),
      color: 'bg-orange-100',
      route: '/assessment-dashboard',
    },
  ];

  // Additional Cards with Modal Triggers
  const additionalCards = [
    {
      title: 'Notifications',
      count: dashboardData.notifications.length,
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'bg-red-100',
      action: () => openModal('notifications', dashboardData.notifications),
    },
    {
      title: 'Upcoming Birthdays',
      count: dashboardData.upcomingBirthdays.length,
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-amber-100',
      action: () => openModal('birthdays', dashboardData.upcomingBirthdays),
    },
    {
      title: 'Work Anniversaries',
      count: dashboardData.upcomingAnniversaries.length,
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-purple-100',
      action: () => openModal('anniversaries', dashboardData.upcomingAnniversaries),
    },
  ];

  if (loading) {
    return <div className="p-6 bg-gray-50 min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 bg-gray-50 min-h-screen text-red-600">{error}</div>;
  }

  return (
    <div className="md:p-6 p-2 bg-gray-50 min-h-full max-w-full sm:min-w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {dashboardCards.slice(0, 4).map((card, index) => (
          <div
            key={index}
            className={`${card.color} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => navigate(card.route)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.count}</p>
              </div>
              <div className="p-3 rounded-lg bg-white bg-opacity-50">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardCards.slice(4).map((card, index) => (
              <div
                key={index}
                className={`${card.color} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => navigate(card.route)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white bg-opacity-50">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Cards - Notifications, Birthdays, Anniversaries */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalCards.map((card, index) => (
              <div
                key={index}
                className={`${card.color} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                onClick={card.action}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white bg-opacity-50">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Announcements Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Announcements</h3>
              <span
                className="text-sm text-blue-600 cursor-pointer"
                onClick={() => openModal('announcements', dashboardData.announcements)}
              >
                View All
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData.announcements.slice(0, 2).map((announcement, index) => (
                <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-gray-600">{announcement.date}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{announcement.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {dashboardData.notifications.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{item.message}</p>
                    <p className="text-sm text-gray-600">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Notifications, Birthdays, Anniversaries */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <span
                className="text-sm text-blue-600 cursor-pointer"
                onClick={() => openModal('notifications', dashboardData.notifications)}
              >
                View All
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData.notifications.slice(0, 4).map((notification, index) => (
                <div
                  key={index}
                  className={`pb-4 border-b border-gray-100 last:border-0 last:pb-0 ${
                    !notification.read ? 'bg-blue-50 -mx-6 px-6 py-3' : ''
                  }`}
                >
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-600">{notification.time}</p>
                  {!notification.read && (
                    <span className="inline-block mt-1 text-xs text-blue-600">New</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Birthdays Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upcoming Birthdays</h3>
              <span
                className="text-sm text-blue-600 cursor-pointer"
                onClick={() => openModal('birthdays', dashboardData.upcomingBirthdays)}
              >
                View All
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData.upcomingBirthdays.slice(0, 3).map((birthday, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">{birthday.name}</p>
                    <p className="text-sm text-gray-600">
                      DOB: {birthday.dateOfBirth || 'Not Available'} · {birthday.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Anniversaries Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Work Anniversaries</h3>
              <span
                className="text-sm text-blue-600 cursor-pointer"
                onClick={() => openModal('anniversaries', dashboardData.upcomingAnniversaries)}
              >
                View All
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData.upcomingAnniversaries.slice(0, 3).map((anniversary, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">{anniversary.name}</p>
                    <p className="text-sm text-gray-600">
                      {anniversary.years} year{anniversary.years !== 1 ? 's' : ''} · Joined: {anniversary.joiningDate || 'Not Available'} · {anniversary.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <Transition appear show={!!modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl h-[60vh] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all relative">
                  <button
                    type="button"
                    className="absolute top-4 right-4 rounded-md border border-transparent bg-blue-600 p-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="p-6">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      {modalOpen === 'notifications' && 'Notifications'}
                      {modalOpen === 'announcements' && 'Announcements'}
                      {modalOpen === 'birthdays' && 'Upcoming Birthdays'}
                      {modalOpen === 'anniversaries' && 'Work Anniversaries'}
                    </Dialog.Title>
                    <div className="space-y-4 overflow-y-auto h-[calc(60vh-100px)]">
                      {modalError && (
                        <p className="text-sm text-red-600">{modalError}</p>
                      )}
                      {!modalError && modalOpen === 'notifications' &&
                        modalData.map((notification, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg ${
                              !notification.read ? 'bg-blue-50' : 'bg-gray-50'
                            }`}
                          >
                            <p className="font-medium">{notification.message}</p>
                            <p className="text-sm text-gray-600">
                              {notification.time} · Type: {notification.type || 'N/A'}
                            </p>
                            {!notification.read && (
                              <span className="inline-block mt-1 text-xs text-blue-600">New</span>
                            )}
                          </div>
                        ))}
                      {!modalError && modalOpen === 'announcements' &&
                        modalData.map((announcement, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <p className="font-medium">{announcement.title}</p>
                            <p className="text-sm text-gray-600">{announcement.date}</p>
                            <p className="mt-2 text-sm text-gray-600">{announcement.content}</p>
                          </div>
                        ))}
                      {!modalError && modalOpen === 'birthdays' &&
                        modalData.map((birthday, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <p className="font-semibold">{birthday.name}</p>
                            <p className="text-sm text-gray-600">
                              Date of Birth: {birthday.dateOfBirth || 'Not Available'} · Department: {birthday.department}
                            </p>
                          </div>
                        ))}
                      {!modalError && modalOpen === 'anniversaries' &&
                        modalData.map((anniversary, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <p className="font-semibold">{anniversary.name}</p>
                            <p className="text-sm text-gray-600">
                              {anniversary.years} year{anniversary.years !== 1 ? 's' : ''} · Joining Date: {anniversary.joiningDate || 'Not Available'} · Department: {anniversary.department}
                            </p>
                          </div>
                        ))}
                      {!modalError && modalData.length === 0 && (
                        <p className="text-sm text-gray-600">No data available</p>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default AdminDashboard;