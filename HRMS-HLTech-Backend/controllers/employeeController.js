const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Job = require('../models/Job');
const Candidate = require('../models/Candidatess');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const moment = require('moment');

// Generate the next employee code
const generateEmployeeCode = async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can generate employee codes' });
    }

    const latestEmployee = await User.findOne({ employeeCode: { $regex: '^HLTI' } })
      .sort({ employeeCode: -1 })
      .select('employeeCode');

    let nextCode = 'HLTI001';
    if (latestEmployee && latestEmployee.employeeCode) {
      const number = parseInt(latestEmployee.employeeCode.replace('HLTI', ''), 10);
      nextCode = `HLTI${(number + 1).toString().padStart(3, '0')}`;
    }

    res.status(200).json({ employeeCode: nextCode });
  } catch (error) {
    console.error('Error generating employee code:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Add a new employee (including interns)
const addEmployee = async (req, res) => {
  console.log('Raw request body:', req.body);
  console.log('All fields in req.body:', Object.keys(req.body));

  const {
    fullName,
    employeeCode,
    email,
    password,
    phone,
    phoneNumber,
    dateOfBirth,
    gender,
    department,
    jobTitle,
    ctc,
    joiningDate,
    employmentType,
    role,
    internshipType,
    stipend,
    probationDuration,
    internshipDuration,
  } = req.body;

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can add employees' });
    }

    // Validate required fields based on employmentType
    const requiredFields = [
      'fullName',
      'email',
      'password',
      'phone',
      'joiningDate',
      'employmentType',
    ];
    if (employmentType === 'Internship') {
      requiredFields.push('internshipType', 'internshipDuration');
      if (internshipType === 'Paid Internship') {
        requiredFields.push('stipend');
      }
    } else {
      requiredFields.push('employeeCode', 'gender', 'department', 'jobTitle', 'probationDuration');
      if (employmentType !== 'Freelancer / Consultant') {
        requiredFields.push('ctc');
      }
    }

    const missingFields = requiredFields.filter(
      (field) => !req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')
    );
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate employeeCode uniqueness for non-internship
    let finalEmployeeCode = employeeCode;
    if (employmentType !== 'Internship') {
      if (!employeeCode) {
        const latestEmployee = await User.findOne({ employeeCode: { $regex: '^HLTI' } })
          .sort({ employeeCode: -1 })
          .select('employeeCode');
        finalEmployeeCode = 'HLTI001';
        if (latestEmployee && latestEmployee.employeeCode) {
          const number = parseInt(latestEmployee.employeeCode.replace('HLTI', ''), 10);
          finalEmployeeCode = `HLTI${(number + 1).toString().padStart(3, '0')}`;
        }
      }
      const existingUser = await User.findOne({ employeeCode: finalEmployeeCode });
      if (existingUser) {
        return res.status(400).json({ message: 'Employee code already exists' });
      }
    } else {
      finalEmployeeCode = employeeCode || null;
    }

    // Validate email uniqueness
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee already exists with this email' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Validate employment type
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
    if (!validEmploymentTypes.includes(employmentType)) {
      return res.status(400).json({ message: `Invalid employmentType. Must be one of: ${validEmploymentTypes.join(', ')}` });
    }

    // Validate internshipType for Internship
    if (employmentType === 'Internship' && !['Paid Internship', 'Unpaid Internship'].includes(internshipType)) {
      return res.status(400).json({ message: 'Invalid internshipType. Must be "Paid Internship" or "Unpaid Internship"' });
    }

    // Validate role
    const validRoles = ['employee', 'hr'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }
    if (requester.role === 'hr' && role !== 'employee') {
      return res.status(403).json({ message: 'Unauthorized: HR can only add employees' });
    }

    // Validate phone numbers
    if (!/^[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10-15 digits' });
    }
    if (phoneNumber && !/^[0-9]{10,15}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Alternate phone number must be 10-15 digits or empty' });
    }

    // Validate ctc and stipend
    if (employmentType !== 'Freelancer / Consultant' && employmentType !== 'Internship') {
      if (ctc === undefined || ctc === null || isNaN(ctc) || ctc <= 0) {
        return res.status(400).json({ message: 'CTC must be a positive number for non-freelancers and non-interns' });
      }
    } else if (employmentType === 'Freelancer / Consultant' && ctc !== undefined && (isNaN(ctc) || ctc < 0)) {
      return res.status(400).json({ message: 'CTC must be a non-negative number for freelancers' });
    }
    if (employmentType === 'Internship' && internshipType === 'Paid Internship' && (stipend === undefined || isNaN(stipend) || stipend <= 0)) {
      return res.status(400).json({ message: 'Stipend must be a positive number for Paid Internship' });
    }

    // Validate durations
    if (employmentType !== 'Internship' && (probationDuration === undefined || isNaN(probationDuration) || probationDuration < 0)) {
      return res.status(400).json({ message: 'Probation duration must be a non-negative number for non-internship' });
    }
    if (employmentType === 'Internship' && (internshipDuration === undefined || isNaN(internshipDuration) || internshipDuration < 0)) {
      return res.status(400).json({ message: 'Internship duration must be a non-negative number for Internship' });
    }

    // Validate and format joiningDate
    const joiningMoment = moment(joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true);
    if (!joiningMoment.isValid()) {
      return res.status(400).json({ message: 'Invalid joiningDate format. Use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY' });
    }

    // Validate and format dateOfBirth (if provided)
    let formattedDateOfBirth = null;
    if (dateOfBirth) {
      const dobMoment = moment(dateOfBirth, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true);
      if (!dobMoment.isValid()) {
        return res.status(400).json({ message: 'Invalid dateOfBirth format. Use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY' });
      }
      formattedDateOfBirth = dobMoment.format('YYYY-MM-DD');
    }

    const employeeData = {
      fullName,
      employeeCode: finalEmployeeCode,
      email,
      password,
      phone,
      phoneNumber: phoneNumber || null,
      dateOfBirth: formattedDateOfBirth,
      gender: employmentType === 'Internship' ? gender || null : gender,
      department: employmentType === 'Internship' ? department || null : department,
      jobTitle: employmentType === 'Internship' ? jobTitle || null : jobTitle,
      ctc: employmentType === 'Internship' ? null : ctc !== undefined ? parseFloat(ctc) : null,
      joiningDate: joiningMoment.format('YYYY-MM-DD'),
      employmentType,
      role,
      internshipType: employmentType === 'Internship' ? internshipType : null,
      stipend: employmentType === 'Internship' && internshipType === 'Paid Internship' ? parseFloat(stipend) : null,
      probationDuration: employmentType !== 'Internship' ? parseFloat(probationDuration) : null,
      internshipDuration: employmentType === 'Internship' ? parseFloat(internshipDuration) : null,
    };

    console.log('Employee before save:', employeeData);
    const user = new User(employeeData);
    await user.save();
    console.log('Employee saved:', user.toObject());

    const loginLink = `http://localhost:5173/login?newUser=true`;
    try {
      await sendEmail({
        to: email,
        subject: 'Your HRMS Account Created',
        text: `Welcome to HRMS, ${fullName}! Your account has been created with the following details:\n\nEmail: ${email}\nPassword: ${password}\nEmployee Code: ${finalEmployeeCode || 'N/A'}\n\nPlease log in here: ${loginLink}\nPlease change your password after logging in if needed.\n\nBest regards,\nHRMS Team`,
      });
      console.log('Account creation email sent successfully to:', email);
    } catch (emailError) {
      console.error('Failed to send account creation email:', emailError);
    }

    res.status(201).json({
      message: 'Employee added successfully. An email with login details has been sent if email sending was successful.',
      employee: {
        _id: user._id,
        fullName: user.fullName,
        employeeCode: user.employeeCode,
        email: user.email,
        phone: user.phone,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        department: user.department,
        jobTitle: user.jobTitle,
        ctc: user.ctc,
        joiningDate: user.joiningDate,
        employmentType: user.employmentType,
        role: user.role,
        internshipType: user.internshipType,
        stipend: user.stipend,
        probationDuration: user.probationDuration,
        internshipDuration: user.internshipDuration,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Failed to add employee: ' + error.message });
  }
};

// Get Employees with Pagination and Search
const getEmployees = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can view employees' });
    }

    const rolesToFetch = requester.role === 'admin' ? ['employee', 'hr'] : ['employee'];

    const query = {
      role: { $in: rolesToFetch },
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ],
    };

    const employees = await User.find(query)
      .select('fullName employeeCode email phone phoneNumber gender department jobTitle ctc joiningDate employmentType role internshipType stipend probationDuration internshipDuration dateOfBirth createdAt updatedAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalEmployees: total,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get Upcoming Birthdays and Anniversaries
const getUpcomingEvents = async (req, res) => {
  console.log('getUpcomingEvents called for user:', req.user.id);
  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can view upcoming events' });
    }

    const today = moment().startOf('day');
    const thirtyDaysFromNow = moment(today).add(30, 'days');

    const employees = await User.find({ role: 'employee' })
      .select('fullName department dateOfBirth joiningDate');

    console.log('Fetched employees:', employees.map(emp => ({
      _id: emp._id,
      fullName: emp.fullName,
      dateOfBirth: emp.dateOfBirth,
      joiningDate: emp.joiningDate,
    })));

    const upcomingBirthdays = employees
      .filter(emp => {
        if (!emp.dateOfBirth) {
          console.warn(`Missing dateOfBirth for employee ${emp._id}: ${emp.fullName}`);
          return false;
        }
        const dob = moment(emp.dateOfBirth, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true);
        if (!dob.isValid()) {
          console.warn(`Invalid dateOfBirth for employee ${emp._id}: ${emp.dateOfBirth}`);
          return false;
        }
        const birthdayThisYear = moment(dob).year(today.year());
        const birthdayNextYear = moment(dob).year(today.year() + 1);
        const isUpcoming = (
          birthdayThisYear.isBetween(today, thirtyDaysFromNow, null, '[]') ||
          birthdayNextYear.isBetween(today, thirtyDaysFromNow, null, '[]')
        );
        console.log(`Birthday check for ${emp.fullName}:`, {
          dateOfBirth: emp.dateOfBirth,
          birthdayThisYear: birthdayThisYear.format('YYYY-MM-DD'),
          birthdayNextYear: birthdayNextYear.format('YYYY-MM-DD'),
          isUpcoming,
        });
        return isUpcoming;
      })
      .map(emp => ({
        name: emp.fullName,
        dateOfBirth: emp.dateOfBirth ? moment(emp.dateOfBirth, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).format('YYYY-MM-DD') : 'N/A',
        department: emp.department || 'N/A',
      }));

    const upcomingAnniversaries = employees
      .filter(emp => {
        if (!emp.joiningDate) {
          console.warn(`Missing joiningDate for employee ${emp._id}: ${emp.fullName}`);
          return false;
        }
        const joining = moment(emp.joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true);
        if (!joining.isValid()) {
          console.warn(`Invalid joiningDate for employee ${emp._id}: ${emp.joiningDate}`);
          return false;
        }
        const anniversaryThisYear = moment(joining).year(today.year());
        const anniversaryNextYear = moment(joining).year(today.year() + 1);
        const isUpcoming = (
          anniversaryThisYear.isBetween(today, thirtyDaysFromNow, null, '[]') ||
          anniversaryNextYear.isBetween(today, thirtyDaysFromNow, null, '[]')
        );
        console.log(`Anniversary check for ${emp.fullName}:`, {
          joiningDate: emp.joiningDate,
          anniversaryThisYear: anniversaryThisYear.format('YYYY-MM-DD'),
          anniversaryNextYear: anniversaryNextYear.format('YYYY-MM-DD'),
          isUpcoming,
        });
        return isUpcoming;
      })
      .map(emp => ({
        name: emp.fullName,
        years: today.year() - moment(emp.joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).year(),
        joiningDate: emp.joiningDate ? moment(emp.joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).format('YYYY-MM-DD') : 'N/A',
        department: emp.department || 'N/A',
      }));

    if (upcomingBirthdays.length === 0 && upcomingAnniversaries.length === 0) {
      const allBirthdays = employees
        .filter(emp => emp.dateOfBirth && moment(emp.dateOfBirth, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).isValid())
        .map(emp => ({
          name: emp.fullName,
          dateOfBirth: moment(emp.dateOfBirth, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).format('YYYY-MM-DD'),
          department: emp.department || 'N/A',
        }));
      const allAnniversaries = employees
        .filter(emp => emp.joiningDate && moment(emp.joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).isValid())
        .map(emp => ({
          name: emp.fullName,
          years: today.year() - moment(emp.joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).year(),
          joiningDate: moment(emp.joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).format('YYYY-MM-DD'),
          department: emp.department || 'N/A',
        }));
      console.log('No upcoming events, returning all valid dates:', { allBirthdays, allAnniversaries });
      res.json({
        upcomingBirthdays: allBirthdays,
        upcomingAnniversaries: allAnniversaries,
      });
    } else {
      res.json({
        upcomingBirthdays,
        upcomingAnniversaries,
      });
    }
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    console.log('Updating employee with ID:', req.params.id);
    console.log('Request body:', req.body);

    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can update employees' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (requester.role === 'hr' && user.role !== 'employee') {
      return res.status(403).json({ message: 'Unauthorized: HR can only update employees' });
    }

    const {
      fullName,
      employeeCode,
      email,
      phone,
      phoneNumber,
      dateOfBirth,
      gender,
      department,
      jobTitle,
      ctc,
      joiningDate,
      employmentType,
      role,
      internshipType,
      stipend,
      probationDuration,
      internshipDuration,
      password,
    } = req.body;

    const requiredFields = employmentType === 'Internship'
      ? ['fullName', 'email', 'phone', 'joiningDate', 'employmentType', 'internshipType', 'internshipDuration']
      : ['fullName', 'employeeCode', 'email', 'phone', 'gender', 'department', 'jobTitle', 'joiningDate', 'employmentType', 'role', 'probationDuration'];

    if (employmentType === 'Internship' && internshipType === 'Paid Internship') {
      requiredFields.push('stipend');
    } else if (employmentType !== 'Internship' && employmentType !== 'Freelancer / Consultant') {
      requiredFields.push('ctc');
    }

    const missingFields = requiredFields.filter(field => {
      if (field in req.body) {
        const value = req.body[field];
        return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
      }
      return false;
    });

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate email uniqueness
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Another user with this email already exists' });
      }
      user.email = email;
    }

    // Validate employeeCode uniqueness for non-internship
    if (employmentType !== 'Internship' && employeeCode) {
      const existingCode = await User.findOne({
        employeeCode,
        _id: { $ne: req.params.id },
      });
      if (existingCode) {
        return res.status(400).json({ message: 'Another user with this employee code already exists' });
      }
      user.employeeCode = employeeCode;
    }

    // Validate employmentType
    if (employmentType) {
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
      if (!validEmploymentTypes.includes(employmentType)) {
        return res.status(400).json({ message: `Invalid employmentType. Must be one of: ${validEmploymentTypes.join(', ')}` });
      }
      user.employmentType = employmentType;
    }

    // Validate internshipType
    if (employmentType === 'Internship' && !['Paid Internship', 'Unpaid Internship'].includes(internshipType)) {
      return res.status(400).json({ message: 'Invalid internshipType. Must be "Paid Internship" or "Unpaid Internship"' });
    }

    // Validate role
    if (role) {
      const validRoles = ['employee', 'hr'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      }
      if (requester.role === 'hr' && role !== 'employee') {
        return res.status(403).json({ message: 'Unauthorized: HR can only set role to employee' });
      }
      user.role = role;
    }

    // Validate ctc and stipend
    if (employmentType && employmentType !== 'Internship' && employmentType !== 'Freelancer / Consultant') {
      if (ctc === undefined || ctc === null || isNaN(ctc) || ctc <= 0) {
        return res.status(400).json({ message: 'CTC must be a positive number for non-freelancers and non-interns' });
      }
    } else if (employmentType === 'Freelancer / Consultant' && ctc !== undefined && (isNaN(ctc) || ctc < 0)) {
      return res.status(400).json({ message: 'CTC must be a non-negative number for Freelancer / Consultant' });
    }
    if (employmentType === 'Internship' && internshipType === 'Paid Internship' && (stipend === undefined || isNaN(stipend) || stipend <= 0)) {
      return res.status(400).json({ message: 'Stipend must be a positive number for Paid Internship' });
    }

    // Validate durations
    if (employmentType !== 'Internship' && (probationDuration === undefined || isNaN(probationDuration) || probationDuration < 0)) {
      return res.status(400).json({ message: 'Probation duration must be a non-negative number for non-internship' });
    }
    if (employmentType === 'Internship' && (internshipDuration === undefined || isNaN(internshipDuration) || internshipDuration < 0)) {
      return res.status(400).json({ message: 'Internship duration must be a non-negative number for Internship' });
    }

    // Validate phone numbers
    if (phone && !/^[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10-15 digits' });
    }
    if (phoneNumber && !/^[0-9]{10,15}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Alternate phone number must be 10-15 digits or empty' });
    }

    // Validate and format joiningDate
    if (joiningDate) {
      const joiningMoment = moment(joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true);
      if (!joiningMoment.isValid()) {
        return res.status(400).json({ message: 'Invalid joiningDate format. Use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY' });
      }
      user.joiningDate = joiningMoment.format('YYYY-MM-DD');
    }

    // Validate and format dateOfBirth
    if (dateOfBirth !== undefined) {
      if (dateOfBirth) {
        const dobMoment = moment(dateOfBirth, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true);
        if (!dobMoment.isValid()) {
          return res.status(400).json({ message: 'Invalid dateOfBirth format. Use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY' });
        }
        user.dateOfBirth = dobMoment.format('YYYY-MM-DD');
      } else {
        user.dateOfBirth = null;
      }
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber || null;
    if (gender !== undefined) user.gender = employmentType === 'Internship' ? (gender || null) : gender;
    if (department !== undefined) user.department = employmentType === 'Internship' ? (department || null) : department;
    if (jobTitle !== undefined) user.jobTitle = employmentType === 'Internship' ? (jobTitle || null) : jobTitle;
    if (ctc !== undefined) user.ctc = employmentType === 'Internship' ? null : parseFloat(ctc) || null;
    if (stipend !== undefined) user.stipend = employmentType === 'Internship' && internshipType === 'Paid Internship' ? parseFloat(stipend) : null;
    if (probationDuration !== undefined) user.probationDuration = employmentType !== 'Internship' ? parseFloat(probationDuration) : null;
    if (internshipDuration !== undefined) user.internshipDuration = employmentType === 'Internship' ? parseFloat(internshipDuration) : null;
    if (internshipType !== undefined) user.internshipType = employmentType === 'Internship' ? internshipType : null;
    if (password) user.password = password;

    user.updatedAt = Date.now();

    console.log('Employee before update:', user.toObject());
    await user.save();
    console.log('Employee after update:', user.toObject());

    res.json({
      _id: user._id,
      fullName: user.fullName,
      employeeCode: user.employeeCode,
      email: user.email,
      phone: user.phone,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      department: user.department,
      jobTitle: user.jobTitle,
      ctc: user.ctc,
      joiningDate: user.joiningDate,
      employmentType: user.employmentType,
      role: user.role,
      internshipType: user.internshipType,
      stipend: user.stipend,
      probationDuration: user.probationDuration,
      internshipDuration: user.internshipDuration,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    console.log('Deleting employee with ID:', req.params.id);

    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can delete employees' });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await user.deleteOne();
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Convert a candidate to an employee (Admin/HR only)
const hireCandidate = async (req, res) => {
  const { jobId, candidateId } = req.params;
  const {
    employeeCode,
    department,
    jobTitle,
    ctc,
    joiningDate,
    employmentType,
    role,
    internshipType,
    stipend,
    probationDuration,
    internshipDuration,
    password,
  } = req.body;

  console.log('Hiring candidate:', { jobId, candidateId, employeeCode });

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and HR can hire candidates' });
    }

    const requiredFields = employmentType === 'Internship'
      ? ['password', 'joiningDate', 'employmentType', 'internshipType', 'internshipDuration']
      : ['employeeCode', 'password', 'joiningDate', 'employmentType', 'gender', 'department', 'jobTitle', 'probationDuration'];

    if (employmentType === 'Internship' && internshipType === 'Paid Internship') {
      requiredFields.push('stipend');
    } else if (employmentType !== 'Internship' && employmentType !== 'Freelancer / Consultant') {
      requiredFields.push('ctc');
    }

    const missingFields = requiredFields.filter(
      (field) => !req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')
    );
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      console.log('Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }

    const candidateApplication = job.candidates.find(
      (c) => c.candidateId.toString() === candidateId
    );
    if (!candidateApplication) {
      console.log('Candidate application not found:', { jobId, candidateId });
      return res.status(404).json({ message: 'Candidate application not found' });
    }

    const candidateDoc = await Candidate.findById(candidateId);
    if (!candidateDoc) {
      console.log('Candidate not found:', candidateId);
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const appliedJob = candidateDoc.appliedJobs.find(
      (app) => app.jobId.toString() === jobId
    );
    if (!appliedJob) {
      console.log('Applied job not found in candidate document:', { jobId, candidateId });
      return res.status(404).json({ message: 'Applied job not found in candidate document' });
    }

    // Validate employeeCode uniqueness for non-internship
    let finalEmployeeCode = employeeCode;
    if (employmentType !== 'Internship') {
      if (!employeeCode) {
        const latestEmployee = await User.findOne({ employeeCode: { $regex: '^HLTI' } })
          .sort({ employeeCode: -1 })
          .select('employeeCode');
        finalEmployeeCode = 'HLTI001';
        if (latestEmployee && latestEmployee.employeeCode) {
          const number = parseInt(latestEmployee.employeeCode.replace('HLTI', ''), 10);
          finalEmployeeCode = `HLTI${(number + 1).toString().padStart(3, '0')}`;
        }
      }
      const existingUser = await User.findOne({ employeeCode: finalEmployeeCode });
      if (existingUser) {
        return res.status(400).json({ message: 'Employee code already exists' });
      }
    } else {
      finalEmployeeCode = employeeCode || null;
    }

    // Validate email uniqueness
    const user = await User.findOne({ email: candidateApplication.candidateEmail });
    if (user) {
      return res.status(400).json({ message: 'An employee with this email already exists' });
    }

    // Validate employmentType
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
    if (!validEmploymentTypes.includes(employmentType)) {
      return res.status(400).json({ message: `Invalid employmentType. Must be one of: ${validEmploymentTypes.join(', ')}` });
    }

    // Validate internshipType
    if (employmentType === 'Internship' && !['Paid Internship', 'Unpaid Internship'].includes(internshipType)) {
      return res.status(400).json({ message: 'Invalid internshipType. Must be "Paid Internship" or "Unpaid Internship"' });
    }

    // Validate ctc and stipend
    if (employmentType !== 'Internship' && employmentType !== 'Freelancer / Consultant') {
      if (ctc === undefined || isNaN(ctc) || ctc <= 0) {
        return res.status(400).json({ message: 'CTC must be a positive number for non-freelancers and non-interns' });
      }
    } else if (employmentType === 'Freelancer / Consultant' && ctc !== undefined && (isNaN(ctc) || ctc < 0)) {
      return res.status(400).json({ message: 'CTC must be a non-negative number for Freelancer / Consultant' });
    }
    if (employmentType === 'Internship' && internshipType === 'Paid Internship' && (stipend === undefined || isNaN(stipend) || stipend <= 0)) {
      return res.status(400).json({ message: 'Stipend must be a positive number for Paid Internship' });
    }

    // Validate durations
    if (employmentType !== 'Internship' && (probationDuration === undefined || isNaN(probationDuration) || probationDuration < 0)) {
      return res.status(400).json({ message: 'Probation duration must be a non-negative number for non-internship' });
    }
    if (employmentType === 'Internship' && (internshipDuration === undefined || isNaN(internshipDuration) || internshipDuration < 0)) {
      return res.status(400).json({ message: 'Internship duration must be a non-negative number for Internship' });
    }

    // Validate role
    const validRoles = ['employee', 'hr'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Validate joiningDate
    const joiningMoment = moment(joiningDate, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true);
    if (!joiningMoment.isValid()) {
      return res.status(400).json({ message: 'Invalid joiningDate format' });
    }

    // Validate dateOfBirth
    let formattedDateOfBirth = null;
    if (candidateDoc.dateOfBirth) {
      const dobMoment = moment(candidateDoc.dateOfBirth, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true);
      if (dobMoment.isValid()) {
        formattedDateOfBirth = dobMoment.format('YYYY-MM-DD');
      } else {
        console.warn('Invalid dateOfBirth:', candidateDoc.dateOfBirth);
      }
    }

    const employeeData = {
      fullName: candidateApplication.candidateName,
      employeeCode: finalEmployeeCode,
      email: candidateApplication.candidateEmail,
      password,
      phone: candidateApplication.phoneNumber,
      phoneNumber: candidateApplication.phoneNumber || null,
      dateOfBirth: formattedDateOfBirth,
      gender: employmentType === 'Internship' ? candidateDoc.gender || null : candidateDoc.gender,
      department: employmentType === 'Internship' ? department || null : department,
      jobTitle: employmentType === 'Internship' ? jobTitle || null : jobTitle,
      ctc: employmentType === 'Internship' ? null : parseFloat(ctc) || null,
      joiningDate: joiningMoment.format('YYYY-MM-DD'),
      employmentType,
      role,
      internshipType: employmentType === 'Internship' ? internshipType : null,
      stipend: employmentType === 'Internship' && internshipType === 'Paid Internship' ? parseFloat(stipend) : null,
      probationDuration: employmentType !== 'Internship' ? parseFloat(probationDuration) : null,
      internshipDuration: employmentType === 'Internship' ? parseFloat(internshipDuration) : null,
    };

    console.log('Employee before save:', employeeData);
    const newUser = new User(employeeData);
    await newUser.save();
    console.log('Employee saved:', newUser.toObject());

    const loginLink = `http://localhost:5173/login?newUser=true`;
    try {
      await sendEmail({
        to: newUser.email,
        subject: 'Welcome to HRMS - Your Account Details',
        text: `Welcome to HRMS, ${newUser.fullName}!\n\nYou have been hired as an employee with the following details:\n\nEmployee Code: ${finalEmployeeCode || 'N/A'}\nEmail: ${newUser.email}\nPassword: ${password}\n\nPlease log in here: ${loginLink}\nWe recommend changing your password after your first login.\n\nBest regards,\nHRMS Team`,
      });
      console.log('Account creation email sent successfully to:', newUser.email);
    } catch (emailError) {
      console.error('Failed to send account creation email:', emailError);
    }

    candidateApplication.hiringStage = 'Hired';
    appliedJob.hiringStage = 'Hired';

    await Promise.all([job.save(), candidateDoc.save()]);
    console.log('Hiring stage updated to Hired:', { jobId, candidateId });

    res.status(201).json({
      message: 'Candidate hired successfully. An email with login details has been sent if email sending was successful.',
      employee: {
        _id: newUser._id,
        fullName: newUser.fullName,
        employeeCode: newUser.employeeCode,
        email: newUser.email,
        phone: newUser.phone,
        phoneNumber: newUser.phoneNumber,
        dateOfBirth: newUser.dateOfBirth,
        gender: newUser.gender,
        department: newUser.department,
        jobTitle: newUser.jobTitle,
        ctc: newUser.ctc,
        joiningDate: newUser.joiningDate,
        employmentType: newUser.employmentType,
        role: newUser.role,
        internshipType: newUser.internshipType,
        stipend: newUser.stipend,
        probationDuration: newUser.probationDuration,
        internshipDuration: newUser.internshipDuration,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error hiring candidate:', error);
    res.status(500).json({ message: 'Failed to hire candidate: ' + error.message });
  }
};

// Get Notifications
const getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Mark Notification as Read
const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only mark your own notifications as read' });
    }

    notification.read = true;
    await notification.save();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Mark All Notifications as Read
const markAllNotificationsAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await Notification.updateMany(
      { receiverId: userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  addEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getUpcomingEvents,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  hireCandidate,
  generateEmployeeCode,
};