import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authHooks";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate, Navigate } from "react-router-dom";
import moment from "moment";
import { IoNotificationsOutline } from "react-icons/io5";

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const notificationContext = useNotifications();
  const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead, fetchNotifications } = notificationContext || {};
  const navigate = useNavigate();
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const hasFetchedOnMount = useRef(false);

  // Fetch notifications on component mount only once
  useEffect(() => {
    if (fetchNotifications && !hasFetchedOnMount.current) {
      console.log("Fetching notifications on Navbar mount");
      fetchNotificationsWithLoading();
      hasFetchedOnMount.current = true;
    }
  }, [fetchNotifications]);

  // Log notifications for debugging
  useEffect(() => {
    console.log("Sidebar rendering, isOpen:", isNotificationSidebarOpen);
    console.log("Current notifications in Navbar:", notifications);
    console.log("Unread count:", unreadCount);
  }, [notifications, unreadCount, isNotificationSidebarOpen]);

  const fetchNotificationsWithLoading = async () => {
    setIsLoadingNotifications(true);
    try {
      await fetchNotifications();
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality if needed
  };

  const toggleNotificationSidebar = () => {
    setIsNotificationSidebarOpen((prev) => {
      const newState = !prev;
      console.log("Toggling sidebar on icon click, new state:", newState);
      if (newState && fetchNotifications) {
        console.log("Refreshing notifications on sidebar open");
        fetchNotificationsWithLoading();
      }
      return newState;
    });
  };

  const handleMarkAsRead = (id) => {
    if (markAsRead) {
      console.log(`Marking notification as read: ${id}`);
      markAsRead(id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (markAllAsRead) {
      console.log("Marking all notifications as read");
      markAllAsRead();
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <nav className="bg-white shadow-md p-4 flex items-center justify-between fixed top-0 left-0 w-full z-50">
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu for Mobile */}
          <button
            className="md:hidden p-2"
            onClick={() => {
              console.log("Hamburger menu clicked");
              toggleSidebar();
            }}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <img
              src="http://storageserver.hltechindia.com/uploads/HL Tech Website/Logos/1751354137066-666021738.png"
              alt="HL Tech Logo"
              className="h-12 w-auto"
              onError={(e) => {
                console.error("Error loading logo image");
                e.target.src = "https://via.placeholder.com/32"; // Fallback image
              }}
            />
            <div className="text-blue-950 font-semibold sm:font-bold sm:text-xl text-[17px]">
              HRMS MANAGEMENT
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative hidden sm:ml-[300px] sm:block">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 sm:w-[30vw] py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              onSubmit={handleSearch}
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell Icon */}
          <div className="relative mt-3">
            <button onClick={toggleNotificationSidebar}>
              <IoNotificationsOutline className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] rounded-full px-[7px] py-[2px]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          {/* User Profile Picture */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate(user.role === "employee" ? "/employee/profile" : "/profile")}
          >
            <img
              src={user.profileImage || "https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg"}
              alt={`${user.fullName}'s Profile`}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              onError={(e) => {
                console.error("Error loading profile image:", user.profileImage);
                e.target.src = "https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg";
              }}
            />
            <div className="hidden sm:block">
              <p className="font-semibold text-sm">{user.fullName || "User"}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role || "User"}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg border-l border-gray-200 transition-transform duration-300 ease-in-out transform ${
          isNotificationSidebarOpen ? "translate-x-0" : "translate-x-full"
        } md:w-1/4 w-3/4 z-50`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={toggleNotificationSidebar}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:underline text-sm mb-4 self-end"
            >
              Mark all as read
            </button>
          )}
          <div className="flex-1 overflow-y-auto">
            {isLoadingNotifications ? (
              <div className="flex justify-center items-center mt-4">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
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
              <p className="text-gray-500 text-center mt-4">No notifications available.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg shadow-sm ${
                      notification.read ? "bg-gray-100" : "bg-white border-l-4 border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">{notification.message}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {moment(notification.createdAt).fromNow()}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;