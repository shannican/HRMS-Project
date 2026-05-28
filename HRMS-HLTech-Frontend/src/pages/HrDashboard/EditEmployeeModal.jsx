import React from 'react';
import PropTypes from 'prop-types';

const EditEmployeeModal = ({ isEditModalOpen, setIsEditModalOpen, editEmployee, setEditEmployee, handleEditEmployee, isLoading, user }) => {
  return (
    <>
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl max-h-[80vh] mt-6 shadow-2xl w-full max-w-2xl flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-semibold text-white">Edit Employee</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form id="editEmployeeForm" onSubmit={handleEditEmployee} className="px-6 py-6 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={editEmployee.fullName}
                    onChange={(e) => setEditEmployee({ ...editEmployee, fullName: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Code {editEmployee.employmentType === 'Internship' ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="text"
                    id="employeeCode"
                    name="employeeCode"
                    value={editEmployee.employeeCode}
                    onChange={(e) => setEditEmployee({ ...editEmployee, employeeCode: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required={editEmployee.employmentType !== 'Internship'}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editEmployee.email}
                    onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password (Optional)</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={editEmployee.password || ''}
                    onChange={(e) => setEditEmployee({ ...editEmployee, password: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editEmployee.phone}
                    onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                    value={editEmployee.phoneNumber}
                    onChange={(e) => setEditEmployee({ ...editEmployee, phoneNumber: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={editEmployee.dateOfBirth}
                    onChange={(e) => setEditEmployee({ ...editEmployee, dateOfBirth: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender {editEmployee.employmentType === 'Internship' ? '(Optional)' : '*'}
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={editEmployee.gender}
                    onChange={(e) => setEditEmployee({ ...editEmployee, gender: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required={editEmployee.employmentType !== 'Internship'}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department {editEmployee.employmentType === 'Internship' ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={editEmployee.department}
                    onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required={editEmployee.employmentType !== 'Internship'}
                  />
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title {editEmployee.employmentType === 'Internship' ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={editEmployee.jobTitle}
                    onChange={(e) => setEditEmployee({ ...editEmployee, jobTitle: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required={editEmployee.employmentType !== 'Internship'}
                  />
                </div>

                <div>
                  <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={editEmployee.employmentType}
                    onChange={(e) => setEditEmployee({
                      ...editEmployee,
                      employmentType: e.target.value,
                      internshipType: e.target.value === 'Internship' ? 'Paid Internship' : '',
                      stipend: '',
                      ctc: '',
                      probationDuration: e.target.value !== 'Internship' ? '3' : '',
                      internshipDuration: '',
                      employeeCode: e.target.value === 'Internship' ? '' : editEmployee.employeeCode,
                    })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contractual">Contractual</option>
                    <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Apprentice / Trainee">Apprentice / Trainee</option>
                    <option value="Remote / Work-from-Home">Remote / Work-from-Home</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                {editEmployee.employmentType !== 'Internship' && (
                  <div>
                    <label htmlFor="ctc" className="block text-sm font-medium text-gray-700 mb-2">
                      CTC (₹/year) {editEmployee.employmentType === 'Freelancer / Consultant' ? '(Optional)' : '*'}
                    </label>
                    <input
                      type="number"
                      id="ctc"
                      name="ctc"
                      value={editEmployee.ctc}
                      onChange={(e) => setEditEmployee({ ...editEmployee, ctc: e.target.value })}
                      className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required={editEmployee.employmentType !== 'Freelancer / Consultant'}
                    />
                  </div>
                )}

                {editEmployee.employmentType !== 'Internship' && (
                  <div>
                    <label htmlFor="probationDuration" className="block text-sm font-medium text-gray-700 mb-2">Probation Duration (Months) *</label>
                    <input
                      type="number"
                      id="probationDuration"
                      name="probationDuration"
                      value={editEmployee.probationDuration}
                      onChange={(e) => setEditEmployee({ ...editEmployee, probationDuration: e.target.value })}
                      className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                      min="0"
                    />
                  </div>
                )}

                {editEmployee.employmentType === 'Internship' && (
                  <>
                    <div>
                      <label htmlFor="internshipType" className="block text-sm font-medium text-gray-700 mb-2">Internship Type *</label>
                      <select
                        id="internshipType"
                        name="internshipType"
                        value={editEmployee.internshipType}
                        onChange={(e) => setEditEmployee({ ...editEmployee, internshipType: e.target.value, stipend: '' })}
                        className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      >
                        <option value="Paid Internship">Paid Internship</option>
                        <option value="Unpaid Internship">Unpaid Internship</option>
                      </select>
                    </div>

                    {editEmployee.internshipType === 'Paid Internship' && (
                      <div>
                        <label htmlFor="stipend" className="block text-sm font-medium text-gray-700 mb-2">Stipend (₹/year) *</label>
                        <input
                          type="number"
                          id="stipend"
                          name="stipend"
                          value={editEmployee.stipend}
                          onChange={(e) => setEditEmployee({ ...editEmployee, stipend: e.target.value })}
                          className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="internshipDuration" className="block text-sm font-medium text-gray-700 mb-2">Internship Duration (Months) *</label>
                      <input
                        type="number"
                        id="internshipDuration"
                        name="internshipDuration"
                        value={editEmployee.internshipDuration}
                        onChange={(e) => setEditEmployee({ ...editEmployee, internshipDuration: e.target.value })}
                        className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                        min="0"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                  <input
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    value={editEmployee.joiningDate}
                    onChange={(e) => setEditEmployee({ ...editEmployee, joiningDate: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                </div>

                {(user?.role === 'admin' || user?.role === 'hr') && (
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      id="role"
                      name="role"
                      value={editEmployee.role}
                      onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}
                      className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                    </select>
                  </div>
                )}
              </div>
            </form>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl sticky bottom-0 z-10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editEmployeeForm"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

EditEmployeeModal.propTypes = {
  isEditModalOpen: PropTypes.bool.isRequired,
  setIsEditModalOpen: PropTypes.func.isRequired,
  editEmployee: PropTypes.object,
  setEditEmployee: PropTypes.func.isRequired,
  handleEditEmployee: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

export default EditEmployeeModal;
