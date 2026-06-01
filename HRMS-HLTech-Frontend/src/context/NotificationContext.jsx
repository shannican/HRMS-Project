import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './authHooks';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;


const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, activeTokenKey } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const hasFetchedNotifications = useRef(false); // Track if notifications have been fetched
  const hasInitializedSocket = useRef(false); // Track if WebSocket has been initialized

  const fetchNotifications = useCallback(async () => {
    if (!user || !user.userId || !activeTokenKey || hasFetchedNotifications.current) {
      console.log('Skipping fetchNotifications: No user, no userId, no activeTokenKey, or already fetched', {
        user: !!user,
        userId: user?.userId,
        activeTokenKey: !!activeTokenKey,
        hasFetched: hasFetchedNotifications.current,
      });
      return;
    }

    try {
      console.log('Fetching notifications for user:', user.userId);
      const token = localStorage.getItem(activeTokenKey);
      if (!token) {
        console.error('No token found for activeTokenKey:', activeTokenKey);
        throw new Error('No token found for user');
      }

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Failed to fetch notifications:', data.message);
        throw new Error(data.message || 'Failed to fetch notifications');
      }

      const data = await response.json();
      console.log('Fetched notifications:', data);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      hasFetchedNotifications.current = true; // Mark as fetched
    } catch (error) {
      console.error('Error fetching notifications:', error, error.stack);
      toast.error(error.message);
    }
  }, [user, activeTokenKey]);

  const markAsRead = useCallback(async (id) => {
    if (!user || !user.userId || !activeTokenKey) {
      console.log('No user, no userId, or no activeTokenKey, skipping markAsRead');
      return;
    }

    try {
      const token = localStorage.getItem(activeTokenKey);
      if (!token) {
        console.error('No token found for activeTokenKey:', activeTokenKey);
        throw new Error('No token found for user');
      }

      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark notification as read');
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error, error.stack);
      toast.error(error.message);
    }
  }, [user, activeTokenKey]);

  const markAllAsRead = useCallback(async () => {
    if (!user || !user.userId || !activeTokenKey) {
      console.log('No user, no userId, or no activeTokenKey, skipping markAllAsRead');
      return;
    }

    try {
      const token = localStorage.getItem(activeTokenKey);
      if (!token) {
        console.error('No token found for activeTokenKey:', activeTokenKey);
        throw new Error('No token found for user');
      }

      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark all notifications as read');
      }

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error, error.stack);
      toast.error(error.message);
    }
  }, [user, activeTokenKey]);

  // Initialize socket connection only when user changes
  useEffect(() => {
    if (!user || !user.userId || !activeTokenKey || hasInitializedSocket.current) {
      console.log('Skipping WebSocket initialization: No user, no userId, no activeTokenKey, or already initialized', {
        user: !!user,
        userId: user?.userId,
        activeTokenKey: !!activeTokenKey,
        hasInitializedSocket: hasInitializedSocket.current,
      });
      return;
    }

    console.log('Initializing WebSocket for user:', user.userId);
    const token = localStorage.getItem(activeTokenKey);
    if (!token) {
      console.error('No token found for activeTokenKey:', activeTokenKey);
      return;
    }

    const newSocket = io(`${API_URL}`, {
      auth: { token },
      query: { userId: user.userId },
      transports: ['websocket'], // Force WebSocket transport
      reconnection: false,
      forceNew: true, // Ensure a new connection
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected in NotificationProvider');
      hasInitializedSocket.current = true; // Mark as initialized
      newSocket.emit('join', user.userId);
      console.log(`Emitted join event for user: ${user.userId}`);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message, error.stack);
      hasInitializedSocket.current = false; // Allow retry on error
      setSocket(null);
    });

    newSocket.on('newNotification', (notification) => {
      console.log('New notification received:', notification);
      setNotifications((prev) => {
        const updatedNotifications = [notification, ...prev];
        console.log('Updated notifications state:', updatedNotifications);
        return updatedNotifications;
      });
      setUnreadCount((prev) => {
        const newCount = prev + 1;
        console.log('Updated unreadCount:', newCount);
        return newCount;
      });
      toast.success(notification.message, {
        position: 'top-right',
        duration: 5000,
      });

      if (notification.type === 'kyc' && notification.message.includes('approved')) {
        console.log('KYC approval notification received, dispatching kycStatusUpdated event');
        window.dispatchEvent(new Event('kycStatusUpdated'));
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected in NotificationProvider');
      hasInitializedSocket.current = false; // Allow re-initialization on reconnect
      setSocket(null);
    });

    setSocket(newSocket);

    return () => {
      console.log('Disconnecting WebSocket in NotificationProvider');
      newSocket.disconnect();
      setSocket(null);
      hasInitializedSocket.current = false; // Reset on cleanup
    };
  }, [user, activeTokenKey]); // Removed socket from dependencies

  // Fetch notifications on user login
  useEffect(() => {
    if (!user || !user.userId || !activeTokenKey || hasFetchedNotifications.current) {
      console.log('Skipping fetchNotifications: No user, no userId, no activeTokenKey, or already fetched', {
        user: !!user,
        userId: user?.userId,
        activeTokenKey: !!activeTokenKey,
        hasFetched: hasFetchedNotifications.current,
      });
      return;
    }

    // Delay fetch to ensure token is set
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 1000);

    return () => {
      clearTimeout(timer);
      hasFetchedNotifications.current = false; // Reset on user change
    };
  }, [user, activeTokenKey, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);