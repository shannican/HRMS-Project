import React from 'react';
import PropTypes from 'prop-types';

const EmployeeDetailsModal = ({ isViewModalOpen, selectedEmployee, handleCloseViewModal }) => {
  return (
    <>
      {isViewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl max-h-[80vh] mt-6 shadow-2xl w-full max-w-2xl flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-semibold text-white">Employee Details</h3>
              <button
                onClick={handleCloseViewModal}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-sm capitalize text-gray-600">{selectedEmployee.fullName || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                  <p className="text-sm text-gray-600">{selectedEmployee.employeeCode || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-600">{selectedEmployee.email || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-sm text-gray-600">{selectedEmployee.phone || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone Number</label>
                  <p className="text-sm text-gray-600">{selectedEmployee.phoneNumber || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <p className="text-sm text-gray-600">
                    {selectedEmployee.dateOfBirth && !isNaN(new Date(selectedEmployee.dateOfBirth))
                      ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <p className="text-sm capitalize text-gray-600">{selectedEmployee.gender || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <p className="text-sm capitalize text-gray-600">{selectedEmployee.department || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desgination</label>
                  <p className="text-sm capitalize text-gray-600">{selectedEmployee.jobTitle || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <p className="text-sm capitalize  text-gray-600">{selectedEmployee.employmentType || 'N/A'}</p>
                </div>

                {selectedEmployee.employmentType === 'Internship' && selectedEmployee.internshipType === 'Paid Internship' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stipend (₹/year)</label>
                    <p className="text-sm text-gray-600">{selectedEmployee.stipend ? `₹${selectedEmployee.stipend}` : 'N/A'}</p>
                  </div>
                )}

                {selectedEmployee.employmentType !== 'Internship' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CTC (₹/year)</label>
                    <p className="text-sm text-gray-600">{selectedEmployee.ctc ? `₹${selectedEmployee.ctc}` : 'N/A'}</p>
                  </div>
                )}

                {selectedEmployee.employmentType !== 'Internship' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Probation Duration (Months)</label>
                    <p className="text-sm text-gray-600">{selectedEmployee.probationDuration || 'N/A'}</p>
                  </div>
                )}

                {selectedEmployee.employmentType === 'Internship' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Internship Type</label>
                      <p className="text-sm text-gray-600">{selectedEmployee.internshipType || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Internship Duration (Months)</label>
                      <p className="text-sm text-gray-600">{selectedEmployee.internshipDuration || 'N/A'}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <p className="text-sm text-gray-600">
                    {selectedEmployee.joiningDate && !isNaN(new Date(selectedEmployee.joiningDate))
                      ? new Date(selectedEmployee.joiningDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-sm capitalize text-gray-600">{selectedEmployee.role || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-sm text-gray-600">
                    {selectedEmployee.createdAt && !isNaN(new Date(selectedEmployee.createdAt))
                      ? new Date(selectedEmployee.createdAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="text-sm text-gray-600">
                    {selectedEmployee.updatedAt && !isNaN(new Date(selectedEmployee.updatedAt))
                      ? new Date(selectedEmployee.updatedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl sticky bottom-0 z-10">
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

EmployeeDetailsModal.propTypes = {
  isViewModalOpen: PropTypes.bool.isRequired,
  selectedEmployee: PropTypes.object,
  handleCloseViewModal: PropTypes.func.isRequired,
};

export default EmployeeDetailsModal;