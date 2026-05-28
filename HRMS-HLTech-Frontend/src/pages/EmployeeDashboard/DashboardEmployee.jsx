import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../../context/authHooks';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardEmployee() {
  const { user } = useAuth();
  const { notifications, unreadCount, fetchNotifications } = useNotifications();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for other sections
  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [85, 15],
        backgroundColor: ['#34D399', '#E5E7EB'],
        hoverOffset: 4,
      },
    ],
  };

  const leaveBalance = {
    total: 20,
    used: 5,
    remaining: 15,
  };

  const projectProgress = [
    { name: 'Company Website', progress: 60 },
    { name: 'Travel App', progress: 45 },
    { name: 'Internal Tool', progress: 30 },
  ];

  const announcements = [
    { title: 'Office Closed', date: 'June 25', content: 'Office will be closed for maintenance' },
    { title: 'Team Lunch', date: 'June 28', content: 'Monthly team lunch at 1 PM' },
  ];

  const recentActivities = [
    { action: 'Task completed', time: '2 hours ago', user: 'Company Website' },
    { action: 'Worksheet submitted', time: '5 hours ago', user: 'Travel App' },
    { action: 'Leave request approved', time: '1 day ago', user: 'HR Team' },
  ];

  const upcomingBirthdays = [
    { name: 'John Smith', date: 'Tomorrow', department: 'Marketing' },
    { name: 'Sarah Johnson', date: 'June 25', department: 'Development' },
  ];

  const upcomingAnniversaries = [
    { name: 'Michael Chen', years: 5, date: 'July 3', department: 'Design' },
    { name: 'Emma Wilson', years: 3, date: 'July 10', department: 'Sales' },
  ];

  // Dashboard cards data matching sidebar items
  const dashboardCards = [
    {
      title: 'Check In',
      count: '08:30 AM',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'bg-green-100',
      route: '/check-in',
      action: () => console.log('Check In clicked'),
    },
    {
      title: 'Check Out',
      count: '05:45 PM',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      ),
      color: 'bg-red-100',
      route: '/check-out',
      action: () => console.log('Check Out clicked'),
    },
    {
      title: 'Request Attendance',
      count: '2 Pending',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
        </svg>
      ),
      color: 'bg-blue-100',
      route: '/request-attendance',
      action: () => console.log('Request Attendance clicked'),
    },
    {
      title: 'Tasks',
      count: 8,
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
        </svg>
      ),
      color: 'bg-purple-100',
      route: '/tasks',
    },
    {
      title: 'Work Sheets',
      count: 5,
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
        </svg>
      ),
      color: 'bg-yellow-100',
      route: '/employee/worksheet',
    },
    {
      title: 'Leave',
      count: `${leaveBalance.remaining} Days`,
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
        </svg>
      ),
      color: 'bg-indigo-100',
      route: '/employee/leave',
    },
  ];

  // Additional cards
  const additionalCards = [
    {
      title: 'Announcements',
      count: announcements.length,
      icon: (
        <svg className="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'bg-cyan-100',
      route: '/announcements',
    },
    {
      title: 'Documents',
      count: 12,
      icon: (
        <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      ),
      color: 'bg-pink-100',
      route: '/documents',
    },
    {
      title: 'KYC Document',
      count: 'Pending',
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
        </svg>
      ),
      color: 'bg-amber-100',
      route: '/employee/kyc',
    },
    {
      title: 'Profile',
      count: 'Update',
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-teal-100',
      route: '/employee/profile',
    },
  ];

  // Mark a single notification as read
  const markNotificationAsRead = async (notificationId) => {
    if (!user || !user.userId || !user.tokenKey) {
      console.error('Missing user, userId, or tokenKey in markNotificationAsRead:', user);
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

      const response = await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Notification marked as read');
        fetchNotifications(); // Refresh notifications
      } else {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error(error.response?.data?.message || 'Failed to mark notification as read');
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user || !user.userId || !user.tokenKey) {
      console.error('Missing user, userId, or tokenKey in markAllNotificationsAsRead:', user);
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

      const response = await axios.put(
        `http://localhost:5000/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('All notifications marked as read');
        fetchNotifications(); // Refresh notifications
      } else {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error(error.response?.data?.message || 'Failed to mark all notifications as read');
      if (error.message.includes('No authentication token found') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    if (user && user.userId && user.tokenKey) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen min-w-[99vw] sm:min-w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Employee Dashboard</h2>
        <p className="text-gray-600">Welcome back, {user?.name || 'Employee'}! Here's your overview.</p>
      </div>

      {/* Quick Stats Cards - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {dashboardCards.slice(0, 3).map((card, index) => (
          <div 
            key={index} 
            className={`${card.color} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
            onClick={card.action || (() => navigate(card.route))}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.count}</p>
              </div>
              <div className="p-3 rounded-lg bg-white bg-opacity-50">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {dashboardCards.slice(3).map((card, index) => (
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
              <div className="p-3 rounded-lg bg-white bg-opacity-50">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {additionalCards.map((card, index) => (
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
              <div className="p-3 rounded-lg bg-white bg-opacity-50">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcement Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Announcements</h3>
              <span className="text-sm text-blue-600 cursor-pointer" onClick={() => navigate('/announcements')}>
                View All
              </span>
            </div>
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-gray-500">{announcement.date}</p>
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

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((item, index) => (
                <div key={index} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-gray-500">For {item.user} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Notifications, Birthdays and Anniversaries */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notifications ({unreadCount} Unread)</h3>
              <div className="flex space-x-2">
                <span 
                  className="text-sm text-blue-600 cursor-pointer" 
                  onClick={() => navigate('/notifications')}
                >
                  View All
                </span>
                {unreadCount > 0 && (
                  <span 
                    className="text-sm text-green-600 cursor-pointer" 
                    onClick={markAllNotificationsAsRead}
                  >
                    Mark All as Read
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center">
                  <svg
                    className="animate-spin h-6 w-6 text-blue-600 mx-auto"
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
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No notifications available</p>
              ) : (
                notifications.slice(0, 5).map((notification, index) => (
                  <div 
                    key={notification._id} 
                    className={`pb-4 border-b border-gray-100 last:border-0 last:pb-0 ${!notification.read ? 'bg-blue-50 -mx-6 px-6 py-3' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationAsRead(notification._id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Birthdays Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upcoming Birthdays</h3>
              <span className="text-sm text-blue-600 cursor-pointer" onClick={() => navigate('/birthdays')}>
                View All
              </span>
            </div>
            <div className="space-y-4">
              {upcomingBirthdays.map((birthday, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{birthday.name}</p>
                    <p className="text-sm text-gray-500">{birthday.date} · {birthday.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Work Anniversaries Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Work Anniversaries</h3>
              <span className="text-sm text-blue-600 cursor-pointer" onClick={() => navigate('/anniversaries')}>
                View All
              </span>
            </div>
            <div className="space-y-4">
              {upcomingAnniversaries.map((anniversary, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{anniversary.name}</p>
                    <p className="text-sm text-gray-500">
                      {anniversary.years} year{anniversary.years !== 1 ? 's' : ''} · {anniversary.date} · {anniversary.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardEmployee;