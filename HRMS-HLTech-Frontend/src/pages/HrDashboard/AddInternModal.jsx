import React from 'react';
import PropTypes from 'prop-types';

const AddInternModal = ({ isAddInternModalOpen, setIsAddInternModalOpen, newIntern, setNewIntern, handleAddIntern, isLoading, addError }) => {
  return (
    <>
      {isAddInternModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl max-h-[80vh] mt-6 shadow-2xl w-full max-w-2xl flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-purple-400 rounded-t-2xl px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-semibold text-white">Add Intern</h3>
              <button
                onClick={() => setIsAddInternModalOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {addError && (
              <div className="px-6 py-4 bg-red-50 border-l-4 border-red-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{addError}</p>
                  </div>
                </div>
              </div>
            )}

            <form id="addInternForm" onSubmit={handleAddIntern} className="px-6 py-6 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={newIntern.fullName}
                    onChange={(e) => setNewIntern({ ...newIntern, fullName: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-2">Employee Code (Optional)</label>
                  <input
                    type="text"
                    id="employeeCode"
                    name="employeeCode"
                    value={newIntern.employeeCode}
                    onChange={(e) => setNewIntern({ ...newIntern, employeeCode: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newIntern.email}
                    onChange={(e) => setNewIntern({ ...newIntern, email: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newIntern.password}
                    onChange={(e) => setNewIntern({ ...newIntern, password: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    required
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newIntern.phone}
                    onChange={(e) => setNewIntern({ ...newIntern, phone: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    required
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={newIntern.phoneNumber}
                    onChange={(e) => setNewIntern({ ...newIntern, phoneNumber: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={newIntern.dateOfBirth}
                    onChange={(e) => setNewIntern({ ...newIntern, dateOfBirth: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">Gender (Optional)</label>
                  <select
                    id="gender"
                    name="gender"
                    value={newIntern.gender}
                    onChange={(e) => setNewIntern({ ...newIntern, gender: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Department (Optional)</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={newIntern.department}
                    onChange={(e) => setNewIntern({ ...newIntern, department: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">Job Title (Optional)</label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={newIntern.jobTitle}
                    onChange={(e) => setNewIntern({ ...newIntern, jobTitle: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="ctc" className="block text-sm font-medium text-gray-700 mb-2">CTC (₹/year) {newIntern.employmentType === 'Unpaid Internship' ? '(Optional)' : '*'}</label>
                  <input
                    type="number"
                    id="ctc"
                    name="ctc"
                    value={newIntern.ctc}
                    onChange={(e) => setNewIntern({ ...newIntern, ctc: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    required={newIntern.employmentType === 'Paid Internship'}
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">Position (Optional)</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={newIntern.position}
                    onChange={(e) => setNewIntern({ ...newIntern, position: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                  <input
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    value={newIntern.joiningDate}
                    onChange={(e) => setNewIntern({ ...newIntern, joiningDate: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={newIntern.employmentType}
                    onChange={(e) => setNewIntern({ ...newIntern, employmentType: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  >
                    <option value="Paid Internship">Paid Internship</option>
                    <option value="Unpaid Internship">Unpaid Internship</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-2">Contract Type (Optional)</label>
                  <select
                    id="contractType"
                    name="contractType"
                    value={newIntern.contractType}
                    onChange={(e) => setNewIntern({ ...newIntern, contractType: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  >
                    <option value="">Select Contract Type</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Apprentice / Trainee">Apprentice / Trainee</option>
                    <option value="Remote / Work-from-Home">Remote / Work-from-Home</option>
                  </select>
                </div>

                {newIntern.contractType && (
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">Duration (Months) *</label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={newIntern.duration}
                      onChange={(e) => setNewIntern({ ...newIntern, duration: e.target.value })}
                      className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                      placeholder="e.g., 3"
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl sticky bottom-0 z-10">
              <button
                type="button"
                onClick={() => setIsAddInternModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="addInternForm"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : 'Add Intern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AddInternModal.propTypes = {
  isAddInternModalOpen: PropTypes.bool.isRequired,
  setIsAddInternModalOpen: PropTypes.func.isRequired,
  newIntern: PropTypes.object.isRequired,
  setNewIntern: PropTypes.func.isRequired,
  handleAddIntern: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  addError: PropTypes.string.isRequired,
};

export default AddInternModal;