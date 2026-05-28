import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KycVerification = () => {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const employeesPerPage = 5;

  // Fetch employee data based on filter
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/kyc/employees', {
          params: { page: currentPage, limit: employeesPerPage, status: statusFilter },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setEmployees(response.data.employees || []);
        setTotalPages(Math.ceil((response.data.total || 0) / employeesPerPage));
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, statusFilter]);

  // Open document modal
  const handleViewDocuments = (employee) => {
    setSelectedEmployee(employee);
    setIsDocModalOpen(true);
  };

  // Open file viewer modal (for images or PDFs)
  const handleViewFile = (fileUrl) => {
    setSelectedFile(fileUrl);
    setIsFileModalOpen(true);
  };

  // Download the file (image or PDF) instantly to local disk
  const handleDownloadFile = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileUrl.split('/').pop() || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try viewing it first or check the URL.');
    }
  };

  // Approve KYC
  const handleApproveKyc = async () => {
    if (!selectedEmployee) return;

    try {
      await axios.put(
        `http://localhost:5000/api/kyc/employees/${selectedEmployee._id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // Refresh the employee list
      const response = await axios.get('http://localhost:5000/api/kyc/employees', {
        params: { page: currentPage, limit: employeesPerPage, status: statusFilter },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployees(response.data.employees || []);
      setTotalPages(Math.ceil((response.data.total || 0) / employeesPerPage));

      alert('KYC approved successfully!');
      setIsDocModalOpen(false);
    } catch (error) {
      console.error('Error approving KYC:', error);
      alert('Failed to approve KYC: ' + (error.response?.data?.message || error.message));
    }
  };

  // Open reject reason popup
  const handleRejectKyc = () => {
    setIsRejectModalOpen(true);
  };

  // Submit rejection reason and reject KYC
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/kyc/employees/${selectedEmployee._id}/reject`,
        { reason: rejectionReason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // Refresh the employee list
      const response = await axios.get('http://localhost:5000/api/kyc/employees', {
        params: { page: currentPage, limit: employeesPerPage, status: statusFilter },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployees(response.data.employees || []);
      setTotalPages(Math.ceil((response.data.total || 0) / employeesPerPage));

      alert('KYC rejected successfully! Rejection reason sent to the employee.');
      setIsRejectModalOpen(false);
      setIsDocModalOpen(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      alert('Failed to reject KYC: ' + (error.response?.data?.message || error.message));
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when status filter changes
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Determine if the file is an image or a PDF based on the extension
  const isImageFile = (fileUrl) => {
    if (!fileUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    return imageExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext));
  };

  const isPdfFile = (fileUrl) => {
    if (!fileUrl) return false;
    return fileUrl.toLowerCase().endsWith('.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 min-w-[99vw] overflow-hidden sm:min-w-full p-2 sm:p-6 md:p-6">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-2">All Employees</h1>

        {/* Status Filter Dropdown */}
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Employee List */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref. No</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agreement</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr key={employee._id || index}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * employeesPerPage + index + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.fullName || 'N/A'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{employee.phone || 'N/A'}</div>
                        <div>{employee.email || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {(employee.address?.city || 'N/A')}, {(employee.address?.country || 'N/A')}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.kycStatus === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : employee.kycStatus === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {employee.kycStatus || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDocuments(employee)}
                          className="text-blue-600 hover:underline"
                        >
                          View Documents
                        </button>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {employee.agreementStatus === 'Not Uploaded' ? (
                          <span className="text-gray-500">{employee.agreementStatus}</span>
                        ) : employee.agreementStatus === 'Accepted' ? ( // Corrected 'Approved' to 'Accepted'
                          <span className="text-green-600">{employee.agreementStatus}</span>
                        ) : (
                          <a
                            href={employee.agreementUrl}
                            download
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : employees.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No employees found.</div>
            ) : (
              employees.map((employee, index) => (
                <div key={employee._id || index} className="border-b border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      Ref. No: {(currentPage - 1) * employeesPerPage + index + 1}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.kycStatus === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : employee.kycStatus === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {employee.kycStatus || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 font-medium">{employee.fullName || 'N/A'}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    <div>{employee.phone || 'N/A'}</div>
                    <div>{employee.email || 'N/A'}</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {(employee.address?.city || 'N/A')}, {(employee.address?.country || 'N/A')}
                  </div>
                  <div className="mt-2 flex flex-col space-y-2">
                    <button
                      onClick={() => handleViewDocuments(employee)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Documents
                    </button>
                    <div className="text-sm">
                      {employee.agreementStatus === 'Not Uploaded' ? (
                        <span className="text-gray-500">{employee.agreementStatus}</span>
                      ) : employee.agreementStatus === 'Accepted' ? ( // Corrected 'Approved' to 'Accepted'
                        <span className="text-green-600">{employee.agreementStatus}</span>
                      ) : (
                        <a
                          href={employee.agreementUrl}
                          download
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Download Agreement
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>

      {/* Document Modal */}
      {isDocModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                KYC Documents - {selectedEmployee.fullName || 'N/A'}
              </h2>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Employee Type Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">Employee Type</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {selectedEmployee.employeeType || 'N/A'}
                </p>
              </div>

              {/* Photo Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">Photo</h3>
                <div className="space-y-2">
                  {selectedEmployee.photo ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFile(selectedEmployee.photo)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Photo
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedEmployee.photo)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Photo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">N/A</p>
                  )}
                </div>
              </div>

              {/* Aadhaar Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">Aadhaar</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Aadhaar Number:</span>{' '}
                    {selectedEmployee.aadhaar?.number || 'N/A'}
                  </p>
                  <div className="flex flex-col space-y-2">
                    {selectedEmployee.aadhaar?.frontImage && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewFile(selectedEmployee.aadhaar.frontImage)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View Front Image
                        </button>
                        <button
                          onClick={() => handleDownloadFile(selectedEmployee.aadhaar.frontImage)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download Front Image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {selectedEmployee.aadhaar?.backImage && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewFile(selectedEmployee.aadhaar.backImage)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View Back Image
                        </button>
                        <button
                          onClick={() => handleDownloadFile(selectedEmployee.aadhaar.backImage)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download Back Image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PAN Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">PAN</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span cooperative="font-medium">PAN Number:</span>{' '}
                    {selectedEmployee.pan?.number || 'N/A'}
                  </p>
                  {selectedEmployee.pan?.frontImage && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFile(selectedEmployee.pan.frontImage)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Image
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedEmployee.pan.frontImage)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Highest Qualification Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">Highest Qualification</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">University:</span>{' '}
                    {selectedEmployee.highestQualification?.university || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Branch:</span>{' '}
                    {selectedEmployee.highestQualification?.branch || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Enrollment Number:</span>{' '}
                    {selectedEmployee.highestQualification?.enrollmentNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">CGPA:</span>{' '}
                    {selectedEmployee.highestQualification?.cgpa || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Education Type:</span>{' '}
                    {selectedEmployee.highestQualification?.educationType || 'N/A'}
                  </p>
                  {selectedEmployee.highestQualification?.educationType === 'Graduate' && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Passout Year:</span>{' '}
                      {selectedEmployee.highestQualification?.passoutYear || 'N/A'}
                    </p>
                  )}
                  {selectedEmployee.highestQualification?.educationType === 'Non-Graduate' && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Batch Duration:</span>{' '}
                      {selectedEmployee.highestQualification?.batchDuration || 'N/A'}
                    </p>
                  )}
                  {selectedEmployee.highestQualification?.degreeCertificate && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFile(selectedEmployee.highestQualification.degreeCertificate)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Degree Certificate
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedEmployee.highestQualification.degreeCertificate)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Degree Certificate"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 12th Standard Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">12th Standard</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">School Name:</span>{' '}
                    {selectedEmployee.twelfth?.schoolName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Percentage:</span>{' '}
                    {selectedEmployee.twelfth?.percentage || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Passout Year:</span>{' '}
                    {selectedEmployee.twelfth?.passoutYear || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Roll Number:</span>{' '}
                    {selectedEmployee.twelfth?.rollNo || 'N/A'}
                  </p>
                  {selectedEmployee.twelfth?.marksheet && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFile(selectedEmployee.twelfth.marksheet)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Marksheet
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedEmployee.twelfth.marksheet)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Marksheet"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 10th Standard Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">10th Standard</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">School Name:</span>{' '}
                    {selectedEmployee.tenth?.schoolName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Percentage:</span>{' '}
                    {selectedEmployee.tenth?.percentage || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Passout Year:</span>{' '}
                    {selectedEmployee.tenth?.passoutYear || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Roll Number:</span>{' '}
                    {selectedEmployee.tenth?.rollNo || 'N/A'}
                  </p>
                  {selectedEmployee.tenth?.marksheet && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFile(selectedEmployee.tenth.marksheet)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Marksheet
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedEmployee.tenth.marksheet)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Marksheet"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Salary Slip Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">Salary Slip</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Company Name:</span>{' '}
                    {selectedEmployee.salaryCompanyName || 'N/A'}
                  </p>
                  {selectedEmployee.salarySlip && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFile(selectedEmployee.salarySlip)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Salary Slip
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedEmployee.salarySlip)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Salary Slip"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Letter Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">Experience Letter</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Company Name:</span>{' '}
                    {selectedEmployee.experienceLetter?.companyName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Experience Year:</span>{' '}
                    {selectedEmployee.experienceLetter?.experienceYear || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Current CTC:</span>{' '}
                    {selectedEmployee.experienceLetter?.currentCTC || 'N/A'}
                  </p>
                  {selectedEmployee.experienceLetter?.letterFile && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFile(selectedEmployee.experienceLetter.letterFile)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Experience Letter
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedEmployee.experienceLetter.letterFile)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Experience Letter"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Signature Card */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="text-base font-medium text-gray-700 mb-2">Employee Signature</h3>
                <div className="space-y-2">
                  {selectedEmployee.employeeSignature ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFile(selectedEmployee.employeeSignature)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Signature
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedEmployee.employeeSignature)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Signature"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">N/A</p>
                  )}
                </div>
              </div>
            </div>

            {/* Approve and Reject Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleApproveKyc}
                className="w-full sm:w-auto px-5 py-3 bg-green-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Approve
              </button>
              <button
                onClick={handleRejectKyc}
                className="w-full sm:w-auto px-5 py-3 bg-red-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Popup */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-700">Reason for Rejection</h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="4"
                  placeholder="Enter the reason for rejecting the KYC..."
                  required
                ></textarea>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-3 bg-red-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Viewer Modal (for Images and PDFs) */}
      {isFileModalOpen && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative bg-white rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-700">Document Viewer</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Download File"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsFileModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center">
              {isImageFile(selectedFile) ? (
                <img
                  src={selectedFile}
                  alt="Document"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              ) : isPdfFile(selectedFile) ? (
                <>
                  <iframe
                    src={selectedFile}
                    title="PDF Document"
                    className="w-full h-[60vh] sm:h-[70vh] border border-gray-300 rounded-lg"
                  />
                  <a
                    href={selectedFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-blue-600 hover:underline text-sm font-medium"
                  >
                    Open PDF in New Tab
                  </a>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600">Unsupported file type</p>
                  <a
                    href={selectedFile}
                    download
                    className="mt-2 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycVerification;