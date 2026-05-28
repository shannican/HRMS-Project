import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function TakeAttendanceModal({ isOpen, onClose, fetchEmployees }) {
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPendingEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/employees/pending-attendance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending employees');
      }
      const data = await response.json();
      console.log('Pending employees:', JSON.stringify(data, null, 2));
      setPendingEmployees(data);
    } catch (err) {
      setError('Failed to fetch pending employees: ' + err.message);
      console.error('Error fetching pending employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendingEmployees();
    }
  }, [isOpen]);

  const handleScanAttendance = async (e) => {
    e.preventDefault();
    if (!barcode) {
      toast.error('Please enter a barcode');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ barcode }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark attendance');
      }
      const data = await response.json();
      toast.success(data.message);
      setBarcode('');
      fetchPendingEmployees();
      fetchEmployees(); // Update the employee list in the parent component
    } catch (err) {
      toast.error('Failed to mark attendance: ' + err.message);
      console.error('Error marking attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Take Attendance</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-6">
          <form onSubmit={handleScanAttendance} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode to mark attendance"
              className="block w-full sm:w-1/2 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Marking...
                </>
              ) : 'Mark Attendance'}
            </button>
          </form>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pending Attendance</h3>
            </div>
            
            {isLoading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingEmployees.length === 0 ? (
              <div className="p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No employees pending</h3>
                <p className="mt-1 text-gray-500">All employees have marked their attendance for today.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingEmployees.map((employee) => (
                  <div key={employee._id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-lg">
                            {(employee.name || 'N/A').split(' ').map(n => n[0] || '').join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{employee.name || 'N/A'}</h4>
                          <p className="text-sm text-gray-500">{employee.position || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Barcode: {employee.barcode || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeAttendanceModal;