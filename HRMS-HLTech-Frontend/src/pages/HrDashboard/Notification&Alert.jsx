import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authHooks';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function NotificationAlert() {
  const { user } = useAuth();
  const { notifications, unreadCount, fetchNotifications } = useNotifications();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Fetching notifications for user:', user.userId, user.tokenKey);
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen min-w-[99vw] sm:min-w-full">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Notifications & Alerts</h2>
          <p className="text-gray-600">View and manage all notifications for {user?.role === 'admin' ? 'Admin' : 'HR'}.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Notifications ({unreadCount} Unread)</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                Mark All as Read
              </button>
            )}
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
              <p className="text-sm text-gray-500 text-center">No notifications available</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`pb-4 border-b border-gray-100 last:border-0 last:pb-0 ${
                    !notification.read ? 'bg-blue-50 -mx-6 px-6 py-3' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{notification.message}</p>
                      <p className="text-sm text-gray-600">
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} ·{' '}
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification._id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
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
      </div>
    </div>
  );
}

export default NotificationAlert;