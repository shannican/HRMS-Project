import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/authHooks';
import toast from 'react-hot-toast';
import { FiUser, FiMapPin, FiLock, FiEdit2, FiSave, FiX, FiCamera, FiChevronDown, FiChevronUp } from 'react-icons/fi';

function EmployeeProfile() {
  const { user, setUser } = useAuth();

  // State for personal information (prefilled with akash's updated data)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.fullName || 'akash',
    email: user?.email || 'akemployee12@gmail.com',
    phone: user?.phone || '9876543210',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '2002-01-01',
    department: user?.department || 'Engineering',
    jobTitle: user?.jobTitle || 'Software Engineer',
    position: user?.position || 'Junior Developer',
    joiningDate: user?.joiningDate ? user.joiningDate.split('T')[0] : '2024-01-15',
    employmentType: user?.employmentType || 'Full-Time',
  });

  // State for address (prefilled with akash's updated address)
  const [address, setAddress] = useState({
    country: user?.address?.country || 'India',
    city: user?.address?.city || 'Mumbai',
    postalCode: user?.address?.postalCode || '400001',
  });

  // State for changing password
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State for profile image
  const [profileImage, setProfileImage] = useState(
    user?.profileImage || 'https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg'
  );
  const [isUploading, setIsUploading] = useState(false);

  // State for mobile responsive sections
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    address: false,
    password: false,
  });

  // Ref for file input
  const fileInputRef = useRef(null);

  // State to track which field is being edited
  const [editingField, setEditingField] = useState(null);

  // Update personalInfo, address, and profile image when user data changes
  useEffect(() => {
    setPersonalInfo({
      fullName: user?.fullName || 'akash',
      email: user?.email || 'akemployee12@gmail.com',
      phone: user?.phone || '9876543210',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '2002-01-01',
      department: user?.department || 'Engineering',
      jobTitle: user?.jobTitle || 'Software Engineer',
      position: user?.position || 'Junior Developer',
      joiningDate: user?.joiningDate ? user.joiningDate.split('T')[0] : '2024-01-15',
      employmentType: user?.employmentType || 'Full-Time',
    });
    setAddress({
      country: user?.address?.country || 'India',
      city: user?.address?.city || 'Mumbai',
      postalCode: user?.address?.postalCode || '400001',
    });
    setProfileImage(
      user?.profileImage || 'https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg'
    );
  }, [user]);

  // Handle personal info change
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Save personal info field
  const savePersonalInfoField = async (fieldName) => {
    try {
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(personalInfo),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update personal information');
      }

      const updatedUser = await response.json();
      // Update the user context with the new data
      setUser({
        ...user,
        ...updatedUser,
      });

      toast.success(`${fieldName} updated successfully!`);
      setEditingField(null);
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast.error(error.message);
    }
  };

  // Save address field
  const saveAddressField = async (fieldName) => {
    try {
      const response = await fetch('http://localhost:5000/api/update-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(address),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update address');
      }

      const updatedUser = await response.json();
      // Update the user context with the new address
      setUser({
        ...user,
        address: updatedUser.address,
      });

      toast.success(`${fieldName} updated successfully!`);
      setEditingField(null);
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error(error.message);
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file);

    if (!file) {
      toast.error('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);
    console.log('FormData prepared:', formData);

    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:5000/api/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload profile image');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      toast.success('Profile image uploaded successfully!');

      // Update the local state with the new image URL
      setProfileImage(data.user.profileImage);

      // Update the user context with the new user data
      setUser({
        ...user,
        profileImage: data.user.profileImage,
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
      // Clear the file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click when image is clicked
  const handleImageClick = () => {
    console.log('Image clicked, triggering file input');
    fileInputRef.current.click();
  };

  // Toggle section expansion on mobile
  const toggleSection = (section) => (e) => {
    e.preventDefault(); // Prevent any default navigation behavior
    e.stopPropagation(); // Stop event propagation to parent elements
    console.log(`Toggling section: ${section}`); // Debug log
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 min-w-[99vw] sm:min-w-full p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">View and edit your personal details and account settings</p>
          </div>
        </div>

        {/* Section 1: User Card */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="relative">
            <img
              src={profileImage}
              alt="Profile"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-indigo-100 cursor-pointer"
              onClick={handleImageClick}
              onError={(e) => {
                console.error('Error loading image:', profileImage);
                e.target.src = 'https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg';
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/jpg,image/png,image/gif"
              className="hidden"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            <div className="absolute bottom-0 right-0 md:bottom-1 md:right-1 bg-indigo-600 text-white p-1 md:p-2 rounded-full shadow-md hover:bg-indigo-700 transition-all">
              <FiCamera className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{personalInfo.fullName}</h2>
            <p className="text-indigo-600 capitalize font-medium text-sm md:text-base mt-1">Employee</p>
            <div className="flex flex-col md:flex-row gap-1 md:gap-4 mt-2 text-gray-600 text-sm md:text-base">
              <p>{personalInfo.email}</p>
              <p className="hidden md:block">|</p>
              <p>{address.city}, {address.country}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 md:p-6 cursor-pointer"
            onClick={toggleSection('personalInfo')}
          >
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Personal Information</h3>
            </div>
            {expandedSections.personalInfo ? (
              <FiChevronUp className="w-5 h-5 text-gray-500 md:hidden" />
            ) : (
              <FiChevronDown className="w-5 h-5 text-gray-500 md:hidden" />
            )}
          </div>
          
          {expandedSections.personalInfo && (
            <div className="p-4 md:p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Full Name</label>
                {editingField === 'fullName' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="fullName"
                      value={personalInfo.fullName}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => savePersonalInfoField('Full Name')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.fullName || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('fullName')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Email Address</label>
                {editingField === 'email' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      name="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => savePersonalInfoField('Email Address')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.email || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('email')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Phone Number</label>
                {editingField === 'phone' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="phone"
                      value={personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => savePersonalInfoField('Phone Number')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.phone || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('phone')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Date of Birth */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Date of Birth</label>
                {editingField === 'dateOfBirth' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={personalInfo.dateOfBirth}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => savePersonalInfoField('Date of Birth')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.dateOfBirth || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('dateOfBirth')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Department */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Department</label>
                {editingField === 'department' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="department"
                      value={personalInfo.department}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => savePersonalInfoField('Department')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.department || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('department')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Job Title */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Job Title</label>
                {editingField === 'jobTitle' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="jobTitle"
                      value={personalInfo.jobTitle}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => savePersonalInfoField('Job Title')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.jobTitle || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('jobTitle')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Position */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Position</label>
                {editingField === 'position' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="position"
                      value={personalInfo.position}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => savePersonalInfoField('Position')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.position || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('position')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Joining Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Joining Date</label>
                {editingField === 'joiningDate' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      name="joiningDate"
                      value={personalInfo.joiningDate}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => savePersonalInfoField('Joining Date')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.joiningDate || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('joiningDate')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Employment Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Employment Type</label>
                {editingField === 'employmentType' ? (
                  <div className="flex items-center gap-2">
                    <select
                      name="employmentType"
                      value={personalInfo.employmentType}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    >
                      <option value="">Select Employment Type</option>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Intern">Intern</option>
                    </select>
                    <button
                      onClick={() => savePersonalInfoField('Employment Type')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{personalInfo.employmentType || 'Not provided'}</p>
                    <button
                      onClick={() => setEditingField('employmentType')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Address */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 md:p-6 cursor-pointer"
            onClick={toggleSection('address')}
          >
            <div className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Address</h3>
            </div>
            {expandedSections.address ? (
              <FiChevronUp className="w-5 h-5 text-gray-500 md:hidden" />
            ) : (
              <FiChevronDown className="w-5 h-5 text-gray-500 md:hidden" />
            )}
          </div>
          
          {expandedSections.address && (
            <div className="p-4 md:p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Country */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Country</label>
                {editingField === 'country' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="country"
                      value={address.country}
                      onChange={handleAddressChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => saveAddressField('Country')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{address.country || 'Not provided'}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from bubbling up
                        setEditingField('country');
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* City */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">City</label>
                {editingField === 'city' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => saveAddressField('City')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{address.city || 'Not provided'}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from bubbling up
                        setEditingField('city');
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Postal Code */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Postal Code</label>
                {editingField === 'postalCode' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="postalCode"
                      value={address.postalCode}
                      onChange={handleAddressChange}
                      className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                    />
                    <button
                      onClick={() => saveAddressField('Postal Code')}
                      className="p-1 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FiSave className=" Iphone 14 Pro Max w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-1 md:p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full p-2 md:p-3 bg-gray-50 rounded-lg text-gray-600 text-sm md:text-base">
                    <p>{address.postalCode || 'Not provided'}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from bubbling up
                        setEditingField('postalCode');
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Change Password */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 md:p-6 cursor-pointer"
            onClick={toggleSection('password')}
          >
            <div className="flex items-center gap-2">
              <FiLock className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Change Password</h3>
            </div>
            {expandedSections.password ? (
              <FiChevronUp className="w-5 h-5 text-gray-500 md:hidden" />
            ) : (
              <FiChevronDown className="w-5 h-5 text-gray-500 md:hidden" />
            )}
          </div>
          
          {expandedSections.password && (
            <form onSubmit={handleChangePassword} className="p-4 md:p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-3">
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 md:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 text-sm md:text-base"
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-3 flex justify-end mt-2 md:mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 md:px-6 md:py-2 bg-indigo-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeProfile;