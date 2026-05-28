import React, { useState } from "react";
import { useAuth } from "../../context/authHooks";
import axios from "axios";
import toast from "react-hot-toast";
import moment from 'moment'; // Import moment for time formatting

const RequestAttendanceModal = ({ isOpen, onClose, onConfirm }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: "",
    checkInTime: "",
    checkOutTime: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user || !user.userId || !user.tokenKey) {
        console.error('Missing user, userId, or tokenKey in handleSubmit:', user);
        throw new Error("User not authenticated. Please log in again.");
      }

      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error("No token found for tokenKey:", user.tokenKey);
        throw new Error("No authentication token found. Please log in again.");
      }

      // Convert times from 12-hour format (e.g., "9:00 AM") to 24-hour format (e.g., "09:00")
      const checkInTime24 = moment(formData.checkInTime, "h:mm A").format("HH:mm");
      const checkOutTime24 = moment(formData.checkOutTime, "h:mm A").format("HH:mm");

      const response = await axios.post(
        "http://localhost:5000/api/attendance/request",
        {
          date: formData.date,
          checkInTime: checkInTime24,
          checkOutTime: checkOutTime24,
          reason: formData.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Attendance request submitted successfully!");
      onConfirm();
      onClose();
    } catch (error) {
      console.error("Error submitting attendance request:", error);
      toast.error(error.response?.data?.message || "Failed to submit attendance request");
      if (error.message.includes("No authentication token found") || error.message.includes("401")) {
        window.location.href = "/login";
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Request Attendance</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Time</label>
            <input
              type="time"
              name="checkInTime"
              value={formData.checkInTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="300" // Allow 5-minute intervals
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Time</label>
            <input
              type="time"
              name="checkOutTime"
              value={formData.checkOutTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="300" // Allow 5-minute intervals
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Explain why you are requesting this attendance adjustment"
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestAttendanceModal;