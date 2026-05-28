const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const imagekit = require('../config/imagekit');

const getAllUsers = async (req, res) => {
  try {
    // Only admins and HR can view all users
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can view all users' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    console.log('Fetching user profile for userId:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found for userId:', req.user.id);

      // Check if the userId belongs to an employee
      const employee = await Employee.findById(req.user.id).select('-password -loginToken -loginTokenExpiry');
      if (!employee) {
        console.log('Employee not found for userId:', req.user.id);
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(employee);
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;

  try {
    console.log('Updating role for userId:', userId, 'to role:', role);

    // Only admins can update roles
    const requester = await User.findById(req.user.id);
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Only admins can update user roles' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'employee') {
      return res.status(400).json({ message: 'Cannot update role for employees' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated' });
  } catch (error) {
    console.error('Error updating user role:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    console.log('Deleting user with ID:', req.params.id);

    // Only admins can delete users
    const requester = await User.findById(req.user.id);
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Only admins can delete users' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'employee') {
      return res.status(400).json({ message: 'Cannot delete employees through this endpoint' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const {
      fullName,
      email,
      phoneNumber, // Changed to phoneNumber to match schema
      dateOfBirth,
      department,
      jobTitle,
      position,
      joiningDate,
      employmentType,
    } = req.body;

    console.log('Updating profile for userId:', userId);
    console.log('Received data:', req.body);

    // Validate required fields (only fullName and email are required)
    if (!fullName || !email) {
      console.log('Validation failed: fullName and email are required');
      return res.status(400).json({ message: 'fullName and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate employmentType if provided
    if (employmentType && !['Full-Time', 'Intern'].includes(employmentType)) {
      console.log('Validation failed: Invalid employment type');
      return res.status(400).json({ message: 'Invalid employment type' });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      console.log('Email already in use:', email);
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Prepare update object with only provided fields
    const updateData = { fullName, email };
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (department) updateData.department = department;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (position) updateData.position = position;
    if (joiningDate) updateData.joiningDate = new Date(joiningDate);
    if (employmentType) updateData.employmentType = employmentType;

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', updatedUser);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile: ' + error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { country, city, postalCode } = req.body;

    console.log('Updating address for userId:', userId);
    console.log('Received address data:', req.body);

    // Validate at least one field is provided
    if (!country && !city && !postalCode) {
      console.log('Validation failed: At least one address field is required');
      return res.status(400).json({ message: 'At least one address field is required' });
    }

    // Prepare address update object with only provided fields
    const addressUpdate = {};
    if (country) addressUpdate.country = country;
    if (city) addressUpdate.city = city;
    if (postalCode) addressUpdate.postalCode = postalCode;

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        address: addressUpdate,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Address updated successfully:', updatedUser);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Failed to update address: ' + error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    console.log('Changing password for userId:', req.user.id);
    console.log('Request body:', req.body);

    // Check if the userId belongs to a User (admin/HR) or Employee
    let user = await User.findById(req.user.id);
    let employee = null;
    if (!user) {
      employee = await Employee.findById(req.user.id);
      if (!employee) {
        console.log('User/Employee not found for userId:', req.user.id);
        return res.status(404).json({ message: 'User not found' });
      }
    }

    const { oldPassword, newPassword } = req.body;

    if (user) {
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        console.log('Old password incorrect for userId:', req.user.id);
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      console.log('Password changed for userId:', req.user.id);
      res.json({ message: 'Password changed successfully' });
    } else {
      const isMatch = await employee.matchPassword(oldPassword);
      if (!isMatch) {
        console.log('Old password incorrect for employeeId:', req.user.id);
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      employee.password = newPassword;
      await employee.save();

      console.log('Password changed for employeeId:', req.user.id);
      res.json({ message: 'Password changed successfully' });
    }
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    // Check if a file is provided
    console.log('Files received:', req.files);
    if (!req.files || !req.files.profileImage) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.files.profileImage.mimetype)) {
      return res.status(400).json({ message: 'Only images (jpeg, jpg, png, gif) are allowed!' });
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.files.profileImage.size > maxSize) {
      console.log('File too large:', req.files.profileImage.size);
      return res.status(400).json({ message: 'File size exceeds 5MB limit!' });
    }

    // Upload the image to ImageKit
    const uploadResponse = await imagekit.upload({
      file: req.files.profileImage.data, // The file buffer
      fileName: `${Date.now()}-${req.files.profileImage.name}`, // Unique filename
      folder: '/profile_images', // Optional: Store in a specific folder in ImageKit
    });

    console.log('ImageKit upload response:', uploadResponse);

    // Get the URL of the uploaded image
    const imageUrl = uploadResponse.url;
    console.log('Profile image uploaded to ImageKit:', imageUrl);

    // Update the user's profile with the image URL
    let user = await User.findById(req.user.id);
    let employee = null;
    if (!user) {
      employee = await Employee.findById(req.user.id);
      if (!employee) {
        console.log('User/Employee not found for userId:', req.user.id);
        return res.status(404).json({ message: 'User not found' });
      }
    }

    if (user) {
      user.profileImage = imageUrl;
      await user.save();
      console.log('Profile image updated for userId:', req.user.id);
      res.json({
        message: 'Profile image updated successfully',
        user: user.toObject({
          getters: true,
          transform: (doc, ret) => {
            delete ret.password;
            return ret;
          },
        }),
      });
    } else {
      employee.profileImage = imageUrl;
      await employee.save();
      console.log('Profile image updated for employeeId:', req.user.id);
      res.json({
        message: 'Profile image updated successfully',
        user: employee.toObject({
          getters: true,
          transform: (doc, ret) => {
            delete ret.password;
            delete ret.loginToken;
            delete ret.loginTokenExpiry;
            return ret;
          },
        }),
      });
    }
  } catch (error) {
    console.error('Error uploading profile image to ImageKit:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers, getUserProfile, updateUserRole, deleteUser, updateProfile, updateAddress, changePassword, uploadProfileImage };