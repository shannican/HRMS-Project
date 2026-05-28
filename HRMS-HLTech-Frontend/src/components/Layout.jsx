import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children, onTakeAttendance, onCheckOut, onRequestAttendance }) => {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const sidebarRoutes = [
    "/dashboard/employee",
    "/employee/attendance",
    "/employee/worksheet",
    "/employee/leave",
    "/employee/kyc",
    "/employee/payslips",
    "/employee/support",
    "/agreement",
    "/employee/profile",
    "/admin/dashboard",
    "/employees",
    "/attendance-sheet",
    "/leave",
    "/payroll",
    "/job-posting",
    "/kyc-verification",
    "/assessment-dashboard",
    "/profile",
    "/reports",
    "/settings",
    "/audit",
    "/notifications",
    "/backup",
    "/projects"
  ];
  const showSidebar = sidebarRoutes.includes(normalizedPath);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <div 
            className={`hidden md:block fixed top-16 left-0 h-[calc(100vh-4rem)] z-30
              transition-all duration-550 ease-in-out
              ${isSidebarHovered ? "w-64" : "w-16"}
            `}
            onMouseEnter={() => setIsSidebarHovered(true)}
            onMouseLeave={() => setIsSidebarHovered(false)}
          >
            <Sidebar
              isOpen={isSidebarOpen}
              isExpanded={isSidebarHovered}
              setIsOpen={setIsSidebarOpen}
              onTakeAttendance={onTakeAttendance}
              onCheckOut={onCheckOut}
              onRequestAttendance={onRequestAttendance}
            />
          </div>
        )}
        
        {/* Mobile Sidebar */}
        {showSidebar && (
          <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-550 ease-in-out
            ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
          `}>
            <div 
              className="absolute inset-0 bg-transparent bg-opacity-50 transition-opacity duration-550 ease-in-out"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className={`absolute top-0 left-0 h-[calc(100vh-4rem)] w-full bg-white shadow-xl z-50
              transform transition-transform duration-550 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
              <Sidebar
                isOpen={isSidebarOpen}
                isExpanded={true}
                setIsOpen={setIsSidebarOpen}
                onTakeAttendance={onTakeAttendance}
                onCheckOut={onCheckOut}
                onRequestAttendance={onRequestAttendance}
              />
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main
          className={`flex-1 pt-14 min-h-[100vh] overflow-auto
            transition-all duration-550 ease-in-out
            ${showSidebar ? "md:ml-16" : ""}
            ${showSidebar && isSidebarHovered ? "md:ml-64" : ""}
          `}
        >
          <div className="p-4 sm:p-2 md:p-2 transition-all duration-550 ease-in-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;