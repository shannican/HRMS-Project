import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authHooks';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import EmployeeDetailsModal from './EmployeeDetailsModal';
const API_URL = import.meta.env.VITE_API_URL;

function AddEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    employeeCode: '',
    email: '',
    password: '',
    phone: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    department: '',
    jobTitle: '',
    ctc: '',
    joiningDate: '',
    employmentType: 'Probationary',
    role: 'employee',
    internshipType: '',
    stipend: '',
    probationDuration: '3',
    internshipDuration: '',
  });
  const [editEmployee, setEditEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [menuOpen, setMenuOpen] = useState(null);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Date validation function
  const isValidDateFormat = (dateStr) => {
    if (!dateStr) return true; // Allow empty date for optional fields
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ];
    return formats.some(regex => regex.test(dateStr)) && !isNaN(new Date(dateStr).getTime());
  };

  // Convert date to YYYY-MM-DD format
  const formatDateToYYYYMMDD = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const fetchEmployees = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log(`Starting fetch: page=${page}, search=${searchQuery}`);
      console.log('Token:', token);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Request timeout triggered after 60 seconds');
        controller.abort();
      }, 60000);

      const url = `${API_URL}/users?page=${page}&limit=10&search=${searchQuery}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Fetch completed, response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        throw new Error(errorData.message || `Failed to fetch employees: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched employees:', data);
      setEmployees(data.employees || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
      setTotalEmployees(data.totalEmployees || 0);
    } catch (err) {
      console.error('Error fetching employees:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out after 60 seconds. Please check your network or server status.');
      } else if (err.message.includes('No authentication token found')) {
        setError(err.message);
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError('Failed to fetch employees: ' + err.message);
      }
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(currentPage);
  }, [currentPage, searchQuery]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAddError('');

    const requiredFields = [
      'fullName',
      'email',
      'password',
      'phone',
      'joiningDate',
      'employmentType',
    ];
    if (newEmployee.employmentType === 'Internship') {
      requiredFields.push('internshipType', 'internshipDuration');
      if (newEmployee.internshipType === 'Paid Internship') {
        requiredFields.push('stipend');
      }
    } else {
      requiredFields.push('employeeCode', 'gender', 'department', 'jobTitle', 'ctc', 'probationDuration');
    }

    const missingFields = requiredFields.filter(field => {
      const value = newEmployee[field];
      return value === undefined || value === null || value.toString().trim() === '';
    });
    if (missingFields.length > 0) {
      setAddError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      setAddError('Please enter a valid email address');
      return;
    }

    if (!/^[0-9]{10,15}$/.test(newEmployee.phone)) {
      setAddError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    if (newEmployee.phoneNumber && !/^[0-9]{10,15}$/.test(newEmployee.phoneNumber)) {
      setAddError('Please enter a valid alternate phone number (10-15 digits) or leave it empty');
      return;
    }

    const validEmploymentTypes = [
      'Full-Time',
      'Part-Time',
      'Contractual',
      'Freelancer / Consultant',
      'Temporary',
      'Probationary',
      'Apprentice / Trainee',
      'Remote / Work-from-Home',
      'Internship',
    ];
    if (!validEmploymentTypes.includes(newEmployee.employmentType)) {
      setAddError('Invalid employment type. Please select a valid option.');
      return;
    }

    const validRoles = ['employee', 'hr'];
    if (!validRoles.includes(newEmployee.role)) {
      setAddError('Invalid role. Please select either "employee" or "hr".');
      return;
    }

    if (newEmployee.password.length < 8) {
      setAddError('Password must be at least 8 characters long');
      return;
    }

    if (newEmployee.employmentType !== 'Freelancer / Consultant' && newEmployee.employmentType !== 'Internship' && (isNaN(newEmployee.ctc) || newEmployee.ctc <= 0)) {
      setAddError('Please enter a valid CTC (greater than 0) for non-freelancers and non-interns');
      return;
    }
    if (newEmployee.employmentType === 'Freelancer / Consultant' && newEmployee.ctc && (isNaN(newEmployee.ctc) || newEmployee.ctc < 0)) {
      setAddError('Please enter a valid CTC (non-negative) for freelancers');
      return;
    }
    if (newEmployee.employmentType === 'Internship' && newEmployee.internshipType === 'Paid Internship' && (isNaN(newEmployee.stipend) || newEmployee.stipend <= 0)) {
      setAddError('Please enter a valid stipend (greater than 0) for Paid Internship');
      return;
    }
    if (newEmployee.employmentType === 'Internship' && !['Paid Internship', 'Unpaid Internship'].includes(newEmployee.internshipType)) {
      setAddError('Invalid internship type. Please select either "Paid Internship" or "Unpaid Internship".');
      return;
    }
    if ((isNaN(newEmployee.probationDuration) || newEmployee.probationDuration < 0) && newEmployee.employmentType !== 'Internship') {
      setAddError('Please enter a valid probation duration (non-negative number)');
      return;
    }
    if ((isNaN(newEmployee.internshipDuration) || newEmployee.internshipDuration < 0) && newEmployee.employmentType === 'Internship') {
      setAddError('Please enter a valid internship duration (non-negative number)');
      return;
    }

    if (!isValidDateFormat(newEmployee.joiningDate)) {
      setAddError('Invalid joiningDate format. Use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY');
      return;
    }

    if (newEmployee.dateOfBirth && !isValidDateFormat(newEmployee.dateOfBirth)) {
      setAddError('Invalid dateOfBirth format. Use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY');
      return;
    }

    const formattedEmployee = {
      ...newEmployee,
      joiningDate: formatDateToYYYYMMDD(newEmployee.joiningDate),
      dateOfBirth: newEmployee.dateOfBirth ? formatDateToYYYYMMDD(newEmployee.dateOfBirth) : '',
      ctc: newEmployee.ctc ? parseFloat(newEmployee.ctc) : null,
      stipend: newEmployee.internshipType === 'Paid Internship' ? parseFloat(newEmployee.stipend) : null,
      probationDuration: newEmployee.employmentType !== 'Internship' ? parseFloat(newEmployee.probationDuration) : null,
      internshipDuration: newEmployee.employmentType === 'Internship' ? parseFloat(newEmployee.internshipDuration) : null,
      internshipType: newEmployee.employmentType === 'Internship' ? newEmployee.internshipType : null,
    };

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Add employee request timeout triggered after 60 seconds');
        controller.abort();
      }, 60000);

      const url = `${API_URL}/api/add-employee`;
      console.log('Adding employee with URL:', url);
      console.log('Add payload:', JSON.stringify(formattedEmployee, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedEmployee),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Add employee response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || 'Failed to add employee');
      }

      const data = await response.json();
      console.log('Add response:', JSON.stringify(data, null, 2));

      setIsAddModalOpen(false);
      setNewEmployee({
        fullName: '',
        employeeCode: '',
        email: '',
        password: '',
        phone: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        department: '',
        jobTitle: '',
        ctc: '',
        joiningDate: '',
        employmentType: 'Probationary',
        role: 'employee',
        internshipType: '',
        stipend: '',
        probationDuration: '3',
        internshipDuration: '',
      });
      toast.success('Employee added successfully');
      fetchEmployees(currentPage);
    } catch (err) {
      console.error('Error adding employee:', err);
      if (err.name === 'AbortError') {
        setAddError('Request timed out. Please check your network or server status.');
      } else if (err.message.includes('No authentication token found')) {
        setAddError(err.message);
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setAddError('Failed to add employee: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    if (!editEmployee) {
      toast.error('No employee selected for editing');
      return;
    }

    const requiredFields = editEmployee.employmentType === 'Internship'
      ? ['fullName', 'email', 'phone', 'joiningDate', 'employmentType', 'internshipType', 'internshipDuration']
      : ['fullName', 'employeeCode', 'email', 'phone', 'gender', 'department', 'jobTitle', 'joiningDate', 'employmentType', 'role', 'probationDuration'];

    if (editEmployee.employmentType === 'Internship' && editEmployee.internshipType === 'Paid Internship') {
      requiredFields.push('stipend');
    } else if (editEmployee.employmentType !== 'Internship' && editEmployee.employmentType !== 'Freelancer / Consultant') {
      requiredFields.push('ctc');
    }

    const missingFields = requiredFields.filter(field => {
      const value = editEmployee[field];
      return value === undefined || value === null || value.toString().trim() === '';
    });
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmployee.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!/^[0-9]{10,15}$/.test(editEmployee.phone)) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }

    if (editEmployee.phoneNumber && !/^[0-9]{10,15}$/.test(editEmployee.phoneNumber)) {
      toast.error('Please enter a valid alternate phone number (10-15 digits) or leave it empty');
      return;
    }

    const validEmploymentTypes = [
      'Full-Time',
      'Part-Time',
      'Contractual',
      'Freelancer / Consultant',
      'Temporary',
      'Probationary',
      'Apprentice / Trainee',
      'Remote / Work-from-Home',
      'Internship',
    ];
    if (!validEmploymentTypes.includes(editEmployee.employmentType)) {
      toast.error('Invalid employment type. Please select a valid option.');
      return;
    }

    const validRoles = ['employee', 'hr'];
    if (!validRoles.includes(editEmployee.role)) {
      toast.error('Invalid role. Please select either "employee" or "hr".');
      return;
    }

    if (editEmployee.employmentType === 'Internship' && !['Paid Internship', 'Unpaid Internship'].includes(editEmployee.internshipType)) {
      toast.error('Invalid internship type. Please select either "Paid Internship" or "Unpaid Internship".');
      return;
    }

    if (editEmployee.employmentType === 'Internship' && editEmployee.internshipType === 'Paid Internship' && (isNaN(editEmployee.stipend) || editEmployee.stipend <= 0)) {
      toast.error('Please enter a valid stipend (greater than 0) for Paid Internship');
      return;
    }

    if (editEmployee.employmentType !== 'Freelancer / Consultant' && editEmployee.employmentType !== 'Internship' && (isNaN(editEmployee.ctc) || editEmployee.ctc <= 0)) {
      toast.error('Please enter a valid CTC (greater than 0) for non-freelancers and non-interns');
      return;
    }
    if (editEmployee.employmentType === 'Freelancer / Consultant' && editEmployee.ctc && (isNaN(editEmployee.ctc) || editEmployee.ctc < 0)) {
      toast.error('Please enter a valid CTC (non-negative) for Freelancer');
      return;
    }

    if ((isNaN(editEmployee.probationDuration) || editEmployee.probationDuration < 0) && editEmployee.employmentType !== 'Internship') {
      toast.error('Please enter a valid probation duration (non-negative number)');
      return;
    }
    if ((isNaN(editEmployee.internshipDuration) || editEmployee.internshipDuration < 0) && editEmployee.employmentType === 'Internship') {
      toast.error('Please enter a valid internship duration (non-negative number)');
      return;
    }

    if (!isValidDateFormat(editEmployee.joiningDate)) {
      toast.error('Invalid joiningDate format. Use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY');
      return;
    }

    if (editEmployee.dateOfBirth && !isValidDateFormat(editEmployee.dateOfBirth)) {
      toast.error('Invalid dateOfBirth format. Use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY');
      return;
    }

    const formattedEmployee = {
      ...editEmployee,
      joiningDate: formatDateToYYYYMMDD(editEmployee.joiningDate),
      dateOfBirth: editEmployee.dateOfBirth ? formatDateToYYYYMMDD(editEmployee.dateOfBirth) : '',
      ctc: editEmployee.ctc ? parseFloat(editEmployee.ctc) : null,
      stipend: editEmployee.internshipType === 'Paid Internship' ? parseFloat(editEmployee.stipend) : null,
      probationDuration: editEmployee.employmentType !== 'Internship' ? parseFloat(editEmployee.probationDuration) : null,
      internshipDuration: editEmployee.employmentType === 'Internship' ? parseFloat(editEmployee.internshipDuration) : null,
      internshipType: editEmployee.employmentType === 'Internship' ? editEmployee.internshipType : null,
    };

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Edit employee request timeout triggered after 60 seconds');
        controller.abort();
      }, 60000);

      const url = `http://localhost:5000/api/users/${editEmployee._id}`;
      console.log('Editing employee with URL:', url);
      console.log('Edit payload:', JSON.stringify(formattedEmployee, null, 2));

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedEmployee),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Edit employee response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || 'Failed to update employee');
      }

      const data = await response.json();
      console.log('Update response:', JSON.stringify(data, null, 2));

      setEditEmployee(null);
      setIsEditModalOpen(false);
      toast.success('Employee updated successfully');
      fetchEmployees(currentPage);
    } catch (err) {
      console.error('Error updating employee:', err);
      if (err.name === 'AbortError') {
        toast.error('Request timed out. Please check your network or server status.');
      } else if (err.message.includes('No authentication token found')) {
        toast.error(err.message);
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to update employee: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Delete employee request timeout triggered after 60 seconds');
        controller.abort();
      }, 60000);

      const url = `http://localhost:5000/api/users/${id}`;
      console.log('Deleting employee with URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Delete employee response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || 'Failed to delete employee');
      }

      setEmployees(employees.filter(emp => emp._id !== id));
      toast.success('Employee deleted successfully');
      fetchEmployees(currentPage);
    } catch (err) {
      console.error('Error deleting employee:', err);
      if (err.name === 'AbortError') {
        toast.error('Request timed out. Please check your network or server status.');
      } else if (err.message.includes('No authentication token found')) {
        toast.error(err.message);
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to delete employee: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4 bg-gray-50 min-w-[100vw] sm:min-w-full min-h-screen">
      <div className="sm:max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="sm:text-3xl text-2xl mt-4 sm:mt-1 font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-2">Manage your team members and their details</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center whitespace-nowrap"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => fetchEmployees(currentPage)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{totalEmployees}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Full-Time</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {employees.filter(e => e.employmentType === 'Full-Time').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Interns</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {employees.filter(e => e.employmentType === 'Internship').length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Employee Directory</h3>
          </div>

          {isLoading ? (
            <div className="p-4 sm:p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-4 sm:p-6 text-center">
              <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Get started by adding a new employee'}
              </p>
              <div className="mt-4 sm:mt-6">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Employee
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <div 
                    key={employee._id} 
                    className="relative px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => handleViewEmployee(employee)}
                  >
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-2">
                      <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                        employee.employmentType === 'Full-Time' || employee.employmentType === 'Part-Time' || employee.employmentType === 'Probationary'
                          ? 'bg-green-100 text-green-800'
                          : employee.employmentType === 'Internship'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.employmentType || 'N/A'}
                      </span>
                      <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                        employee.role === 'employee' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {employee.role || 'N/A'}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === employee._id ? null : employee._id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {menuOpen === employee._id && (
                          <div
                            className="absolute bottom-3 right-3 sm:bottom-auto sm:top-8 sm:right-0 mt-2 w-24 sm:w-30 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[999999]"
                            onMouseLeave={() => setMenuOpen(null)}
                          >
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditEmployee({
                                    ...employee,
                                    employmentType: employee.employmentType || 'Probationary',
                                    internshipType: employee.internshipType || (employee.employmentType === 'Internship' ? 'Paid Internship' : ''),
                                    stipend: employee.stipend || '',
                                    probationDuration: employee.probationDuration || (employee.employmentType !== 'Internship' ? '3' : ''),
                                    internshipDuration: employee.internshipDuration || '',
                                    joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
                                    dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
                                  });
                                  setIsEditModalOpen(true);
                                  setMenuOpen(null);
                                }}
                                className="block px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEmployee(employee._id);
                                  setMenuOpen(null);
                                }}
                                className="block px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pr-20 sm:pr-24">
                      <div className="flex items-start sm:items-center space-x-0 sm:space-x-4">
                        <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium capitalize text-base sm:text-lg">
                            {(employee.fullName || 'N/A').split(' ').map(n => n[0] || '').join('')}
                          </span>
                        </div>
                        <div className="flex-1 mt-0 ml-2 sm:ml-0 sm:mt-0">
                          <h4 className="text-base sm:text-lg font-medium capitalize text-gray-900">{employee.fullName || 'N/A'}</h4>
                          <p className="text-xs sm:text-sm capitalize text-gray-500">{employee.jobTitle || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12h2m-6 0h2m-6 0H6m6-6h2m-6 0H6m6 6h2m-6 0H6m6 6h2m-6 0H6" />
                        </svg>
                        <span className="text-gray-600">{employee.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h2a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-600">{employee.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6" />
                        </svg>
                        <span className="text-gray-600">
                          {employee.employmentType === 'Internship' && employee.internshipType === 'Paid Internship'
                            ? `Stipend: ₹${employee.stipend || 'N/A'}/year`
                            : `CTC: ₹${employee.ctc || 'N/A'}/year`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600">
                          Joined on {employee.joiningDate && !isNaN(new Date(employee.joiningDate)) ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing {employees.length} of {totalEmployees} employees
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 sm:px-3 sm:py-1 border rounded-lg text-xs sm:text-sm text-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 sm:px-3 sm:py-1 border rounded-lg text-xs sm:text-sm text-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <AddEmployeeModal
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          newEmployee={newEmployee}
          setNewEmployee={setNewEmployee}
          handleAddEmployee={handleAddEmployee}
          isLoading={isLoading}
          addError={addError}
          user={user}
        />

        <EditEmployeeModal
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          editEmployee={editEmployee}
          setEditEmployee={setEditEmployee}
          handleEditEmployee={handleEditEmployee}
          isLoading={isLoading}
          user={user}
        />

        <EmployeeDetailsModal
          isViewModalOpen={isViewModalOpen}
          selectedEmployee={selectedEmployee}
          handleCloseViewModal={handleCloseViewModal}
        />
      </div>
    </div>
  );
}

export default AddEmployees;