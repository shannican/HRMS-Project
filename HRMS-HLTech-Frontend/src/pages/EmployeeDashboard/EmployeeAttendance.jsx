import React from "react";
import toast from "react-hot-toast";

const EmployeeAttendance = ({ onCheckIn, onCheckOut, onRequestAttendance }) => {
  const handleCardClick = (action) => {
    if (action === "checkIn") {
      onCheckIn();
    } else if (action === "checkOut") {
      onCheckOut();
    } else if (action === "requestAttendance") {
      onRequestAttendance();
    }
  };
  const AttendanceIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
  </svg>
);

  const attendanceCards = [
    {
      title: "Check In",
      count: "10:00 AM",
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: "bg-green-100",
      action: () => handleCardClick("checkIn"),
    },
    {
      title: "Check Out",
      count: "07:00 PM",
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      ),
      color: "bg-red-100",
      action: () => handleCardClick("checkOut"),
    },
    {
      title: "Request Attendance",
      count: "Click And Send Request",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
        </svg>
      ),
      color: "bg-blue-100",
      action: () => handleCardClick("requestAttendance"),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Attendance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {attendanceCards.map((card, index) => (
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
              <div className="p-3 rounded-lg bg-white bg-opacity-50">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeAttendance;