import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PaySlipModal from './PaySlipModal';

function Payroll() {
  const [payrollData, setPayrollData] = useState(null);
  const [period, setPeriod] = useState({
    start: new Date(2025, 4, 1).toISOString().split('T')[0], // 01 May 2025
    end: new Date(2025, 4, 29).toISOString().split('T')[0], // 29 May 2025
  });
  const [paymentDate, setPaymentDate] = useState(new Date(2025, 4, 29).toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileDatePicker, setShowMobileDatePicker] = useState(false);
  const [isPaySlipModalOpen, setIsPaySlipModalOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState(null);

  const fetchPayrollData = useCallback(async () => {
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    if (startDate >= endDate) {
      toast.error('Period end date must be after the start date');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/payroll/records?periodStart=${period.start}&periodEnd=${period.end}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payroll data');
      }

      const data = await response.json();
      console.log('Fetched Payroll Data in Payroll.jsx:', data);
      setPayrollData(data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  const handleGeneratePayroll = async () => {
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    if (startDate >= endDate) {
      toast.error('Period end date must be after the start date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/payroll/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          periodStart: period.start,
          periodEnd: period.end,
          paymentDate,
          paymentMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate payroll');
      }

      await response.json();
      toast.success('Payroll generated successfully');
      await fetchPayrollData();
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    if (startDate >= endDate) {
      toast.error('Period end date must be after the start date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/payroll/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          periodStart: period.start,
          periodEnd: period.end,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payroll');
      }

      toast.success('Payroll processed successfully');
      await fetchPayrollData();
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSlip = async (recordId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payroll/record/${recordId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pay slip');
      }

      const data = await response.json();
      console.log('Fetched Payroll Record for View Slip in Payroll.jsx:', data);
      console.log('KYC Fields in Fetched Payroll Record:', {
        pan: data.pan,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
      });
      setSelectedPayrollRecord(data);
      setIsPaySlipModalOpen(true);
    } catch (error) {
      console.error('Error fetching pay slip:', error);
      toast.error(error.message);
    }
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  const formatMobileDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const endDate = new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="p-2 sm:p-6 bg-gray-50 sm:min-w-full min-w-[100vw] min-h-screen">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Payroll Management</h1>
          
          <div className="hidden sm:flex space-x-3">
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm px-2 sm:p-2">
              <label className="text-sm font-medium text-gray-600">Start Date:</label>
              <input
                type="date"
                value={period.start}
                onChange={(e) => setPeriod({ ...period, start: e.target.value })}
                className="p-2 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2">
              <label className="text-sm font-medium text-gray-600">End Date:</label>
              <input
                type="date"
                value={period.end}
                onChange={(e) => setPeriod({ ...period, end: e.target.value })}
                className="p-2 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="sm:hidden">
            <button 
              onClick={() => setShowMobileDatePicker(!showMobileDatePicker)}
              className="flex items-center justify-between w-full p-3 bg-white rounded-lg shadow-sm"
            >
              <span className="text-sm font-medium text-gray-600">
                {formatMobileDateRange(period.start, period.end)}
              </span>
              <svg 
                className={`w-5 h-5 text-gray-500 transform transition-transform ${showMobileDatePicker ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMobileDatePicker && (
              <div className="bg-white p-3 rounded-lg shadow-sm space-y-3 mt-2">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-600 w-20">Start:</label>
                  <input
                    type="date"
                    value={period.start}
                    onChange={(e) => setPeriod({ ...period, start: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-600 w-20">End:</label>
                  <input
                    type="date"
                    value={period.end}
                    onChange={(e) => setPeriod({ ...period, end: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : !payrollData || payrollData.payrollRecords.length === 0 ? (
          <div className="p-4 sm:p-6 text-center bg-white rounded-lg shadow-md">
            <h3 className="text-lg sm:text-lg font-medium text-gray-900">No Payroll Data Found</h3>
            <p className="mt-2 text-sm sm:text-gray-600">Generate payroll for the selected period to view records.</p>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-gray-50 rounded-lg shadow-sm p-2 sm:p-2">
                <label className="text-sm font-medium text-gray-600">Payment Date:</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="p-2 border border-gray-300 sm:border-none rounded-lg focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-gray-50 rounded-lg shadow-sm p-2 sm:p-2">
                <label className="text-sm font-medium text-gray-600">Payment Mode:</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="p-2 border border-gray-300 sm:border-none rounded-lg focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <button
                onClick={handleGeneratePayroll}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Generate Payroll</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <p className="text-sm font-medium text-gray-500">Period</p>
                <p className="mt-2 text-xl font-semibold text-gray-800">
                  {formatDateRange(payrollData.summary.periodStart, payrollData.summary.periodEnd)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <p className="text-sm font-medium text-gray-500">Total Net Pay</p>
                <p className="mt-2 text-xl font-semibold text-green-600">₹{(payrollData.summary.totalNetPay || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <p className="text-sm font-medium text-gray-500">Total Gross Pay</p>
                <p className="mt-2 text-xl font-semibold text-blue-600">₹{(payrollData.summary.totalGrossPay || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <p className="text-sm font-medium text-gray-500">Total Deductions</p>
                <p className="mt-2 text-xl font-semibold text-red-600">₹{(payrollData.summary.totalDeductions || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="mt-2 text-xl font-semibold text-gray-800">{payrollData.summary.totalEmployees || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <p className="text-sm font-medium text-gray-500">Payment Date</p>
                <p className="mt-2 text-xl font-semibold text-gray-800">
                  {payrollData.summary.paymentDate
                    ? new Date(payrollData.summary.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <button
                  onClick={handleProcessPayroll}
                  className={`w-full py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                    payrollData.payrollRecords.some(record => record.status === 'Processed')
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={isLoading || payrollData.payrollRecords.some(record => record.status === 'Processed')}
                >
                  {isLoading ? 'Processing...' : 'Process Payroll'}
                </button>
              </div>
            </div>

            <div className="sm:hidden grid grid-cols-1 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <p className="text-sm font-medium text-gray-500">Period</p>
                <p className="mt-1 text-lg font-semibold text-gray-800">
                  {formatMobileDateRange(payrollData.summary.periodStart, payrollData.summary.periodEnd)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <p className="text-sm font-medium text-gray-500">Net Pay</p>
                  <p className="mt-1 text-lg font-semibold text-green-600">₹{(payrollData.summary.totalNetPay || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <p className="text-sm font-medium text-gray-500">Gross Pay</p>
                  <p className="mt-1 text-lg font-semibold text-blue-600">₹{(payrollData.summary.totalGrossPay || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <p className="text-sm font-medium text-gray-500">Deductions</p>
                  <p className="mt-1 text-lg font-semibold text-red-600">₹{(payrollData.summary.totalDeductions || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <p className="text-sm font-medium text-gray-500">Employees</p>
                  <p className="mt-1 text-lg font-semibold text-gray-800">{payrollData.summary.totalEmployees || 0}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-md">
                <button
                  onClick={handleProcessPayroll}
                  className={`w-full py-3 rounded-lg text-white font-medium transition-colors duration-200 ${
                    payrollData.payrollRecords.some(record => record.status === 'Processed')
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={isLoading || payrollData.payrollRecords.some(record => record.status === 'Processed')}
                >
                  {isLoading ? 'Processing...' : 'Process Payroll'}
                </button>
              </div>
            </div>

            <div className="hidden sm:block bg-white shadow-lg rounded-xl overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Employee Payroll Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Net Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Advance</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Credited Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Paid Days</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Sundays</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Pay Slip</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Payment Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payrollData.payrollRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-indigo-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-gray-800 font-medium">{record.employeeId?.fullName || 'N/A'}</p>
                            <p className="text-gray-500 text-sm">{record.employeeId?.employeeCode || 'N/A'}</p>
                            <p className="text-gray-500 text-sm">{record.employeeId?.email || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">₹{(record.netPay || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">₹{(record.advance || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">₹{(record.creditedPay || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">{record.paidDays || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">{record.sundayDays || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewSlip(record._id)}
                            className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            View Slip
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">{record.paymentMode || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                              record.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {record.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sm:hidden space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 px-2">Employee Payroll</h3>
              
              {payrollData.payrollRecords.map((record) => (
                <div key={record._id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{record.employeeId?.fullName || 'N/A'}</h4>
                      <p className="text-gray-500 text-sm">{record.employeeId?.employeeCode || 'N/A'}</p>
                      <p className="text-gray-500 text-sm">{record.employeeId?.email || 'N/A'}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          record.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.status || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">{record.paymentMode || 'N/A'}</span>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-indigo-600">₹{(record.netPay || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500">Advance</p>
                      <p className="font-medium">₹{(record.advance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Credited</p>
                      <p className="font-medium">₹{(record.creditedPay || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Days</p>
                      <p className="font-medium">{record.paidDays || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sundays</p>
                      <p className="font-medium">{record.sundayDays || 0}</p>
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        onClick={() => handleViewSlip(record._id)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        View Slip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaySlipModal
              isOpen={isPaySlipModalOpen}
              onClose={() => {
                setIsPaySlipModalOpen(false);
                setSelectedPayrollRecord(null);
              }}
              payrollRecord={selectedPayrollRecord}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Payroll;