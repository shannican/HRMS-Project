const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, dateOfBirth, gender, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'Missing required fields: fullName, email, phoneNumber, password' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Validate phone number
    if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be 10-15 digits' });
    }

    // Validate date of birth (optional)
    if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      phone: phoneNumber,
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || '',
      password,
      role: 'admin', // Default to admin
      employmentType: 'Internship',
      internshipType: 'Unpaid Internship',
      internshipDuration: 0,
      joiningDate: new Date(),
    });

    await user.save();

    // Generate JWT
    const payload = {
      userId: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    };
    console.log('Generated JWT payload:', payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email });

  try {
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { email: user.email, role: user.role });

    // Compare the provided password with the hashed password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user._id.toString(), role: user.role, fullName: user.fullName, email: user.email };
    console.log('Token payload (login):', payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1d' });

    console.log('Login successful, token generated:', { email, role: user.role });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

module.exports = { register, login };