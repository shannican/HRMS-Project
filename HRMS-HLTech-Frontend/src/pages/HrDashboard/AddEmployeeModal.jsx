import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const AddEmployeeModal = ({ isAddModalOpen, setIsAddModalOpen, newEmployee, setNewEmployee, handleAddEmployee, isLoading, user }) => {
  // Fetch the next employee code when the modal opens
  useEffect(() => {
    const fetchEmployeeCode = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/generate-employee-code', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch employee code');
        }

        const data = await response.json();
        setNewEmployee(prev => ({
          ...prev,
          employeeCode: data.employeeCode,
        }));
      } catch (error) {
        console.error('Error fetching employee code:', error);
        setNewEmployee(prev => ({
          ...prev,
          employeeCode: 'HLTI001', // Fallback
        }));
      }
    };

    if (isAddModalOpen && newEmployee.employmentType !== 'Internship') {
      fetchEmployeeCode();
    } else if (isAddModalOpen && newEmployee.employmentType === 'Internship') {
      setNewEmployee(prev => ({
        ...prev,
        employeeCode: '', // Clear for Internship
      }));
    }
  }, [isAddModalOpen, newEmployee.employmentType, setNewEmployee]);

  return (
    <>
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl max-h-[80vh] mt-6 shadow-2xl w-full max-w-2xl flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-semibold text-white">Add New Employee</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form id="addEmployeeForm" onSubmit={handleAddEmployee} className="px-6 py-6 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={newEmployee.fullName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Code {newEmployee.employmentType === 'Internship' ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="text"
                    id="employeeCode"
                    name="employeeCode"
                    value={newEmployee.employeeCode}
                    onChange={(e) => setNewEmployee({ ...newEmployee, employeeCode: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required={newEmployee.employmentType !== 'Internship'}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
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
                    value={newEmployee.phoneNumber}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })}
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
                    value={newEmployee.dateOfBirth}
                    onChange={(e) => setNewEmployee({ ...newEmployee, dateOfBirth: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender {newEmployee.employmentType === 'Internship' ? '(Optional)' : '*'}
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={newEmployee.gender}
                    onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required={newEmployee.employmentType !== 'Internship'}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department {newEmployee.employmentType === 'Internship' ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required={newEmployee.employmentType !== 'Internship'}
                  />
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title {newEmployee.employmentType === 'Internship' ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={newEmployee.jobTitle}
                    onChange={(e) => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required={newEmployee.employmentType !== 'Internship'}
                  />
                </div>

                <div>
                  <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={newEmployee.employmentType}
                    onChange={(e) => setNewEmployee({
                      ...newEmployee,
                      employmentType: e.target.value,
                      internshipType: e.target.value === 'Internship' ? 'Paid Internship' : '',
                      stipend: '',
                      ctc: '',
                      probationDuration: e.target.value !== 'Internship' ? '3' : '',
                      internshipDuration: '',
                      employeeCode: e.target.value === 'Internship' ? '' : newEmployee.employeeCode,
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

                {newEmployee.employmentType !== 'Internship' && (
                  <div>
                    <label htmlFor="ctc" className="block text-sm font-medium text-gray-700 mb-2">
                      CTC (₹/year) {newEmployee.employmentType === 'Freelancer / Consultant' ? '(Optional)' : '*'}
                    </label>
                    <input
                      type="number"
                      id="ctc"
                      name="ctc"
                      value={newEmployee.ctc}
                      onChange={(e) => setNewEmployee({ ...newEmployee, ctc: e.target.value })}
                      className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required={newEmployee.employmentType !== 'Freelancer / Consultant'}
                    />
                  </div>
                )}

                {newEmployee.employmentType !== 'Internship' && (
                  <div>
                    <label htmlFor="probationDuration" className="block text-sm font-medium text-gray-700 mb-2">Probation Duration (Months) *</label>
                    <input
                      type="number"
                      id="probationDuration"
                      name="probationDuration"
                      value={newEmployee.probationDuration}
                      onChange={(e) => setNewEmployee({ ...newEmployee, probationDuration: e.target.value })}
                      className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                      min="0"
                    />
                  </div>
                )}

                {newEmployee.employmentType === 'Internship' && (
                  <>
                    <div>
                      <label htmlFor="internshipType" className="block text-sm font-medium text-gray-700 mb-2">Internship Type *</label>
                      <select
                        id="internshipType"
                        name="internshipType"
                        value={newEmployee.internshipType}
                        onChange={(e) => setNewEmployee({ ...newEmployee, internshipType: e.target.value, stipend: '' })}
                        className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      >
                        <option value="Paid Internship">Paid Internship</option>
                        <option value="Unpaid Internship">Unpaid Internship</option>
                      </select>
                    </div>

                    {newEmployee.internshipType === 'Paid Internship' && (
                      <div>
                        <label htmlFor="stipend" className="block text-sm font-medium text-gray-700 mb-2">Stipend (₹/year) *</label>
                        <input
                          type="number"
                          id="stipend"
                          name="stipend"
                          value={newEmployee.stipend}
                          onChange={(e) => setNewEmployee({ ...newEmployee, stipend: e.target.value })}
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
                        value={newEmployee.internshipDuration}
                        onChange={(e) => setNewEmployee({ ...newEmployee, internshipDuration: e.target.value })}
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
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
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
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
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
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="addEmployeeForm"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center"
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
                ) : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AddEmployeeModal.propTypes = {
  isAddModalOpen: PropTypes.bool.isRequired,
  setIsAddModalOpen: PropTypes.func.isRequired,
  newEmployee: PropTypes.object.isRequired,
  setNewEmployee: PropTypes.func.isRequired,
  handleAddEmployee: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

export default AddEmployeeModal;