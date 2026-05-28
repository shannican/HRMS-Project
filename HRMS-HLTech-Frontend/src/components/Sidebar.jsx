import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authHooks";
import { useNotifications } from "../context/NotificationContext";
import axios from "axios";
import toast from "react-hot-toast";

// Custom Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>
);

const EmployeesIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const AttendanceIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
  </svg>
);

const LeaveIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a8 8 0 00-8 8c0 2.21.89 4.21 2.34 5.66l1.41-1.41A6 6 0 014 10a6 6 0 016-6v4l4-4-4-4v4a8 8 0 00-6 7.66l-1.41 1.41A10 10 0 0110 2z" clipRule="evenodd" />
  </svg>
);

const PayrollIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07-.34-.433-.582a2.305 2.305 0 01-.567.267z" />
    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
  </svg>
);

const JobPostingIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
  </svg>
);

const KycIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
  </svg>
);

const AssessmentIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const AuditIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5l-1-2H6a2 2 0 00-2 2zm7 5a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-3 3a1 1 0 011-1h5a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const NotificationsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

const BackupIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const SupportIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-1.56-1.557A5.994 5.994 0 004 10c0 .94.24 1.829.67 2.607l1.562-1.562zM10 4a5.976 5.976 0 012.516.553L10.954 6.11a4.002 4.002 0 01-1.903-.027L7.49 7.645A5.98 5.98 0 0110 4z" clipRule="evenodd" />
  </svg>
);

const WorkSheetsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const Sidebar = ({ 
  isOpen = false, 
  isExpanded = false,
  setIsOpen = () => {}, 
  onTakeAttendance, 
  onCheckOut, 
  onRequestAttendance 
}) => {
  const { logout, user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [kycStatus, setKycStatus] = useState(null);
  const [kycNotFound, setKycNotFound] = useState(false);

  const fetchKycStatus = useCallback(async () => {
    if (!user?.userId || !user?.tokenKey) {
      console.log('Skipping fetchKycStatus: No userId or tokenKey', {
        userId: user?.userId,
        tokenKey: !!user?.tokenKey,
      });
      return;
    }

    try {
      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error('No token found for tokenKey:', user.tokenKey);
        toast.error('No token found for user');
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/kyc/status/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setKycStatus(response.data?.status || 'Not Started');
      setKycNotFound(response.data?.status === 'Not Started');
      console.log('KYC status fetched:', response.data?.status);
    } catch (error) {
      console.error('Error fetching KYC status in Sidebar:', error, error.stack);
      if (error.response?.data?.message === 'KYC data not found') {
        setKycStatus('Not Started');
        setKycNotFound(true);
      } else {
        toast.error('Failed to fetch KYC status');
        setKycStatus(null);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'employee' && user?.userId && user?.tokenKey) {
      fetchKycStatus();
      const handleKycStatusUpdated = () => {
        console.log('kycStatusUpdated event received in Sidebar, re-fetching status...');
        fetchKycStatus();
      };
      window.addEventListener('kycStatusUpdated', handleKycStatusUpdated);
      return () => window.removeEventListener('kycStatusUpdated', handleKycStatusUpdated);
    }
  }, [user, fetchKycStatus]);

  // Sidebar items for admin
  const adminItems = [
    {
      path: '/admin/dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
    },
    {
      path: '/employees',
      icon: <EmployeesIcon />,
      label: 'Employees Management',
    },
    {
      path: '/attendance-sheet',
      icon: <AttendanceIcon />,
      label: 'Attendance Management',
    },
    {
      path: '/leave',
      icon: <LeaveIcon />,
      label: 'Leave Management',
    },
    {
      path: '/job-posting',
      icon: <JobPostingIcon />,
      label: 'Recruitment',
    },
    {
      path: '/payroll',
      icon: <PayrollIcon />,
      label: 'Payroll & Compensation',
    },
    {
      path: '/kyc-verification',
      icon: <KycIcon />,
      label: 'Documents',
    },
    {
      path: '/reports',
      icon: <ReportsIcon />,
      label: 'Reports & Analytics',
    },
    {
      path: '/settings',
      icon: <SettingsIcon />,
      label: 'Company Settings',
    },
    {
      path: '/audit',
      icon: <AuditIcon />,
      label: 'Audit & Logs',
    },
    {
      path: '/notifications',
      icon: (
        <div className="relative">
          <NotificationsIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      ),
      label: 'Notifications & Alerts',
    },
    {
      path: '/backup',
      icon: <BackupIcon />,
      label: 'Data Backup & Export',
    },
    {
      path: '/assessment-dashboard',
      icon: <AssessmentIcon />,
      label: 'Assessment Dashboard',
    },
    {
      action: () => {
        logout();
        setIsOpen(false);
      },
      icon: <LogoutIcon />,
      label: 'Logout',
      color: 'text-red-600',
    },
  ];

  // Sidebar items for hr
  const hrItems = [
    {
      path: '/admin/dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
    },
    {
      path: '/employees',
      icon: <EmployeesIcon />,
      label: 'Employees Management',
    },
    {
      path: '/attendance-sheet',
      icon: <AttendanceIcon />,
      label: 'Attendance Management',
    },
    {
      path: '/leave',
      icon: <LeaveIcon />,
      label: 'Leave Management',
    },
    {
      path: '/job-posting',
      icon: <JobPostingIcon />,
      label: 'Recruitment',
    },
    {
      path: '/payroll',
      icon: <PayrollIcon />,
      label: 'Payroll & Compensation',
    },
    {
      path: '/kyc-verification',
      icon: <KycIcon />,
      label: 'Documents',
    },
    {
      path: '/reports',
      icon: <ReportsIcon />,
      label: 'Reports & Analytics',
    },
    {
      path: '/assessment-dashboard',
      icon: <AssessmentIcon />,
      label: 'Assessment Dashboard',
    },
    {
      path: '/notifications',
      icon: (
        <div className="relative">
          <NotificationsIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      ),
      label: 'Notifications & Alerts',
    },
    {
      action: () => {
        logout();
        setIsOpen(false);
      },
      icon: <LogoutIcon />,
      label: 'Logout',
      color: 'text-red-600',
    },
  ];

  // Sidebar items for employee
  const employeeItems = [
    {
      path: '/dashboard/employee',
      icon: <DashboardIcon />,
      label: 'Employee Dashboard',
    },
    {
      path: '/employee/profile',
      icon: <ProfileIcon />,
      label: 'My Profile',
    },
    {
      path: '/employee/attendance',
      icon: <AttendanceIcon />,
      label: 'Attendance',
    },
    {
      path: '/employee/leave',
      icon: <LeaveIcon />,
      label: 'Leave Balance',
    },
    {
      path: '/employee/payslips',
      icon: <PayrollIcon />,
      label: 'Payslips & Salary',
    },
    {
      path: '/employee/worksheet',
      icon: <WorkSheetsIcon />,
      label: 'Work Sheets',
    },
    {
      path: '/employee/support',
      icon: <SupportIcon />,
      label: 'Support / Helpdesk',
    },
    {
      path: '/employee/kyc',
      icon: <KycIcon />,
      label: 'KYC Document',
    },
    {
      path: '/notifications',
      icon: (
        <div className="relative">
          <NotificationsIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      ),
      label: 'Notifications',
    },
    ...(kycStatus === 'Approved' ? [
      {
        path: '/agreement',
        icon: <AssessmentIcon />,
        label: 'Agreement',
      },
    ] : []),
    {
      action: () => {
        logout();
        setIsOpen(false);
      },
      icon: <LogoutIcon />,
      label: 'Logout',
      color: 'text-red-600',
    },
  ];

  const sidebarItems = user?.role === 'admin' ? adminItems : user?.role === 'hr' ? hrItems : employeeItems;

  return (
    <aside
      className={`bg-white h-full flex flex-col border-r border-gray-200 fixed top-16 left-0 z-40
        ${isOpen || isExpanded ? 'w-full md:w-64' : 'w-full md:w-16'}
        transition-all duration-550 ease-in-out
      `}
    >
      {/* Navigation Items */}
      <nav className="flex-1 hide-scrollbar overflow-y-auto py-4">
        {sidebarItems.map((item, index) => (
          <div key={index} className="relative">
            <button
              onClick={() => {
                if (item.action) item.action();
                else navigate(item.path);
                setIsOpen(false);
              }}
              className={`flex items-center max-w-full cursor-pointer hover:text-blue-500 px-4 py-3 transition-colors duration-550 group
                ${location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}
                ${isOpen || isExpanded ? 'justify-start' : 'justify-center md:justify-center'}
                ${item.color || ''}
                relative
              `}
            >
              <span className="flex-shrink-0">
                {item.icon}
              </span>
              <span
                className={`ml-3 transition-all duration-550 whitespace-nowrap overflow-hidden
                  ${isOpen || isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                  absolute left-12
                `}
              >
                {item.label}
              </span>
            </button>
            {!isOpen && !isExpanded && (
              <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-550 pointer-events-none">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;