import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./context/authHooks";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import CheckInModal from "./pages/EmployeeDashboard/CheckInModal";
import CheckOutModal from "./pages/EmployeeDashboard/CheckOutModal";
import RequestAttendanceModal from "./pages/EmployeeDashboard/RequestAttendanceModal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardEmployee from "./pages/EmployeeDashboard/DashboardEmployee";
import Projects from "./pages/HrDashboard/ProjectsHr";
import Employees from "./pages/HrDashboard/AddEmployees";
import AdminProfile from "./pages/HrDashboard/AdminProfile";
import EmployeeProfile from "./pages/EmployeeDashboard/EmployeeProfile";
import Attendance from "./pages/HrDashboard/Attendance";
import Leave from "./pages/HrDashboard/Leave";
import LeaveRequest from "./pages/EmployeeDashboard/LeaveRequest";
import Payroll from "./pages/HrDashboard/Payroll";
import Reports from "./pages/HrDashboard/Reports";
import ScanAttendance from "./pages/HrDashboard/ScanAttendance";
import AttendanceSheet from "./pages/HrDashboard/AttendanceSheet";
import JobPosting from "./pages/HrDashboard/JobPosting";
import KycDocument from "./pages/EmployeeDashboard/KycDocument";
import KycVerification from "./pages/HrDashboard/KycVerification";
import Agreement from "./pages/EmployeeDashboard/Aggrement";
import AssessmentDashboard from "./pages/HrDashboard/AssessmentDashboard";
import WorkSheets from "./pages/EmployeeDashboard/WorkSheet";
import EmployeeAttendance from "./pages/EmployeeDashboard/EmployeeAttendance";
import NotificationAll from "./pages/EmployeeDashboard/NotificationAll";
import NotificationAlert from "./pages/HrDashboard/Notification&Alert";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import axios from "axios";

function App() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isRequestAttendanceModalOpen, setIsRequestAttendanceModalOpen] = useState(false);
  const [locationData, setLocationData] = useState(null);

  // Check for newUser query parameter
  const queryParams = new URLSearchParams(location.search);
  const isNewUser = queryParams.get('newUser') === 'true';

  // Debug route navigation
  useEffect(() => {
    console.log('App: Current route:', location.pathname);
    console.log('App: User state:', { userId: user?.userId, role: user?.role, tokenKey: user?.tokenKey });
  }, [location, user]);

  const handleCheckIn = () => {
    console.log("handleCheckIn triggered from App.jsx");
    if (navigator.geolocation) {
      console.log("Requesting geolocation for Check In...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation success:", position);
          const { latitude, longitude } = position.coords;
          setLocationData({ latitude, longitude });
          setIsCheckInModalOpen(true);
          console.log("Check In modal should open, isCheckInModalOpen:", true);
        },
        (err) => {
          console.error("Geolocation error:", err);
          if (err.code === 1) {
            toast.error(
              "Geolocation permission denied. Please enable location access to check in.",
              {
                duration: 5000,
                action: {
                  text: "Retry",
                  onClick: () => handleCheckIn(),
                },
              }
            );
          } else {
            toast.error("Failed to get location: " + err.message);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      console.error("Geolocation not supported by browser");
    }
  };

  const handleCheckOut = async () => {
    console.log("handleCheckOut triggered from App.jsx");
    if (!user || !user.userId || !user.tokenKey) {
      console.log("User, userId, or tokenKey missing, cannot fetch check-in location:", user);
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    try {
      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error("No token found for tokenKey:", user.tokenKey);
        toast.error("No token found for user");
        return;
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const response = await axios.get(
        `http://localhost:5000/api/attendance/employee/${user.userId}?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const attendanceRecords = response.data;
      console.log("Attendance records for user:", attendanceRecords);

      const todayRecord = attendanceRecords.find(
        (record) => new Date(record.date).toISOString().split('T')[0] === today.toISOString().split('T')[0]
      );

      if (!todayRecord) {
        console.log("No check-in record found for today");
        toast.error("You must check in before checking out.");
        return;
      }

      if (!todayRecord.checkInTime || !todayRecord.location || !todayRecord.location.checkIn) {
        console.log("Invalid check-in record:", todayRecord);
        toast.error("Invalid check-in record. Please check in again.");
        return;
      }

      const { latitude, longitude } = todayRecord.location.checkIn;
      console.log("Using check-in location for check-out:", { latitude, longitude });
      setLocationData({ latitude, longitude });
      setIsCheckOutModalOpen(true);
      console.log("Check Out modal should open, isCheckOutModalOpen:", true);
    } catch (error) {
      console.error("Error fetching check-in location:", error);
      toast.error("Failed to fetch check-in location: " + (error.response?.data?.message || error.message));
    }
  };

  const handleRequestAttendance = () => {
    console.log("handleRequestAttendance triggered from App.jsx");
    setIsRequestAttendanceModalOpen(true);
  };

  const handleAttendanceConfirmed = () => {
    navigate(location.pathname, { replace: true });
  };

  // Prevent logged-in users from accessing login/register pages, except for new users
  useEffect(() => {
    if (isLoading || isNewUser) return; // Skip redirect for new users or during loading
    if (user && (location.pathname === "/login" || location.pathname === "/register")) {
      if (user.role === "employee") {
        console.log("Logged-in employee attempted to access login/register, redirecting to employee dashboard");
        navigate("/dashboard/employee", { replace: true });
      } else if (user.role === "admin" || user.role === "hr") {
        console.log("Logged-in admin/HR attempted to access login/register, redirecting to admin dashboard");
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [user, location, navigate, isLoading, isNewUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const noLayoutRoutes = ["/login", "/register"];

  const isNoLayoutRoute = noLayoutRoutes.some((route) => location.pathname === route);

  return (
    <div className="min-h-screen">
      {isNoLayoutRoute ? (
        <Routes>
          <Route
            path="/login"
            element={
              user && !isNewUser ? (
                user.role === "employee" ? (
                  <Navigate to="/dashboard/employee" replace />
                ) : (
                  <Navigate to="/admin/dashboard" replace />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              user && !isNewUser ? (
                user.role === "employee" ? (
                  <Navigate to="/dashboard/employee" replace />
                ) : (
                  <Navigate to="/admin/dashboard" replace />
                )
              ) : (
                <Register />
              )
            }
          />
        </Routes>
      ) : (
        <Layout onTakeAttendance={handleCheckIn} onCheckOut={handleCheckOut} onRequestAttendance={handleRequestAttendance}>
          <Routes>
            <Route
              path="/admin/dashboard"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <AdminDashboard />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboard/employee"
              element={
                user ? (
                  user.role === "employee" ? (
                    <DashboardEmployee />
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/employee/attendance"
              element={
                user ? (
                  user.role === "employee" ? (
                    <EmployeeAttendance
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                      onRequestAttendance={handleRequestAttendance}
                    />
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/employee/leave"
              element={
                user ? (
                  user.role === "employee" ? (
                    <LeaveRequest />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/employee/kyc"
              element={
                user ? (
                  user.role === "employee" ? (
                    <KycDocument />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/employee/payslips"
              element={
                user ? (
                  user.role === "employee" ? (
                    <div>Payslips & Salary Page (Placeholder)</div>
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/employee/support"
              element={
                user ? (
                  user.role === "employee" ? (
                    <div>Support / Helpdesk Page (Placeholder)</div>
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/agreement"
              element={
                user ? (
                  user.role === "employee" ? (
                    <Agreement />
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/employees"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <ErrorBoundary>
                      <Employees />
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/attendance-sheet"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <AttendanceSheet />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/leave"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <Leave />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/payroll"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <Payroll />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/reports"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <Reports />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/settings"
              element={
                user ? (
                  user.role === "admin" ? (
                    <div>Company Settings Page (Placeholder)</div>
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/audit"
              element={
                user ? (
                  user.role === "admin" ? (
                    <div>Audit & Logs Page (Placeholder)</div>
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/notifications"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <NotificationAlert />
                  ) : (
                    <NotificationAll />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/backup"
              element={
                user ? (
                  user.role === "admin" ? (
                    <div>Data Backup & Export Page (Placeholder)</div>
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/job-posting"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <JobPosting />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/kyc-verification"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <KycVerification />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/assessment-dashboard"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <AssessmentDashboard />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <AdminProfile />
                  ) : (
                    <Navigate to="/employee/profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/employee/profile"
              element={
                user ? (
                  user.role === "employee" ? (
                    <EmployeeProfile />
                  ) : (
                    <Navigate to="/profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/projects"
              element={
                user ? (
                  user.role === "admin" || user.role === "hr" ? (
                    <Projects />
                  ) : (
                    <Navigate to="/dashboard/employee" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/employee/worksheet"
              element={
                user ? (
                  user.role === "employee" ? (
                    (console.log("App: Rendering WorkSheet for user:", user.userId), <WorkSheets />)
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/"
              element={
                user ? (
                  user.role === "employee" ? (
                    <Navigate to="/dashboard/employee" replace />
                  ) : (
                    <Navigate to="/admin/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Layout>
      )}

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        location={locationData}
        onConfirm={handleAttendanceConfirmed}
      />
      <CheckOutModal
        isOpen={isCheckOutModalOpen}
        onClose={() => setIsCheckOutModalOpen(false)}
        location={locationData}
        onConfirm={handleAttendanceConfirmed}
      />
      <RequestAttendanceModal
        isOpen={isRequestAttendanceModalOpen}
        onClose={() => setIsRequestAttendanceModalOpen(false)}
        onConfirm={handleAttendanceConfirmed}
      />

      <Toaster position="top-right" />
    </div>
  );
}

export default App;