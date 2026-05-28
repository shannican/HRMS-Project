const mongoose = require('mongoose');
const EmployeeKYC = require('../models/EmployeeKYC');
const User = require('../models/User');
const Notification = require('../models/Notification');
const imageKit = require('../config/imagekit');
const sendEmail = require('../utils/sendEmail');
const axios = require('axios');

// Utility function to send notifications
const sendNotification = async (io, receiverId, message, type) => {
  try {
    const notification = new Notification({
      receiverId,
      message,
      type,
      read: false,
    });
    await notification.save();
    console.log(`Notification saved for user ${receiverId}:`, notification);

    io.to(receiverId.toString()).emit('newNotification', {
      _id: notification._id,
      receiverId: notification.receiverId,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt,
    });
    console.log(`Real-time notification sent to user ${receiverId}`);
  } catch (error) {
    console.error('Error sending notification:', error, error.stack);
  }
};

// Utility function to upload files to ImageKit with retry logic
const uploadFile = async (file, retries = 3, delay = 1000) => {
  try {
    console.log('File received for upload:', file);
    if (!file) {
      throw new Error('File is undefined or null');
    }

    let fileData = file.data; // For express-fileupload
    if (!fileData) {
      throw new Error('File data is undefined');
    }

    const fileName = file.name || 'agreement.pdf';

    // Retry logic for uploading to ImageKit
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await imageKit.upload({
          file: fileData,
          fileName: fileName,
          folder: '/kyc_documents/agreements',
          timeout: 30000, // Increase timeout to 30 seconds
        });
        console.log(`File uploaded to ImageKit on attempt ${attempt}:`, response.url);
        return response.url;
      } catch (error) {
        console.error(`Attempt ${attempt} failed to upload file to ImageKit:`, error.message);
        if (attempt === retries) {
          throw error; // Throw the error on the last attempt
        }
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff: 1s, 2s, 4s
      }
    }
  } catch (error) {
    console.error('Error uploading file to ImageKit:', error, error.stack);
    throw new Error('File upload failed: ' + error.message);
  }
};

// Save KYC data with better error handling
const saveKycData = async (req, res) => {
  console.log('saveKycData called for step:', req.params.step);
  const { step } = req.params;
  const { employeeId, ...data } = req.body;
  const files = req.files;

  console.log('Files received:', files);

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || requester.role !== 'employee') {
      console.log('Unauthorized: Requester is not an employee:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only employees can save KYC data' });
    }

    if (employeeId !== req.user.id) {
      console.log('Unauthorized: Employee ID mismatch:', {
        employeeId,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ message: 'Unauthorized: Employee ID mismatch' });
    }

    let kyc = await EmployeeKYC.findOne({ employeeId });
    if (!kyc) {
      console.log('Creating new EmployeeKYC document for employee:', employeeId);
      kyc = new EmployeeKYC({ employeeId });
    }

    let updateData = {};

    switch (step) {
      case 'photo':
        console.log('Saving photo data:', {
          employeeType: data.employeeType,
          hasPhoto: !!files?.photo,
        });
        if (!data.employeeType) {
          return res.status(400).json({ message: 'Employee type is required' });
        }
        updateData.employeeType = data.employeeType;
        if (files?.photo) {
          try {
            updateData.photo = await uploadFile(files.photo);
          } catch (error) {
            console.error('Failed to upload photo:', error.message);
            updateData.photo = 'Upload Failed: ' + error.message;
          }
        }
        break;

      case 'aadhar':
        console.log('Saving Aadhar data:', {
          number: data.number,
          hasFrontImage: !!files?.frontImage,
          hasBackImage: !!files?.backImage,
        });
        if (!data.number) {
          return res.status(400).json({ message: 'Aadhar number is required' });
        }
        if (!files?.frontImage || !files?.backImage) {
          return res
            .status(400)
            .json({ message: 'Both front and back images are required' });
        }
        updateData.aadhar = {
          number: data.number,
          frontImage: 'Upload Pending',
          backImage: 'Upload Pending',
        };
        try {
          updateData.aadhar.frontImage = await uploadFile(files.frontImage);
        } catch (error) {
          console.error('Failed to upload Aadhar front image:', error.message);
          updateData.aadhar.frontImage = 'Upload Failed: ' + error.message;
        }
        try {
          updateData.aadhar.backImage = await uploadFile(files.backImage);
        } catch (error) {
          console.error('Failed to upload Aadhar back image:', error.message);
          updateData.aadhar.backImage = 'Upload Failed: ' + error.message;
        }
        break;

      case 'pan':
        console.log('Saving Pan data:', {
          number: data.number,
          hasFrontImage: !!files?.frontImage,
        });
        if (!data.number) {
          return res.status(400).json({ message: 'Pan number is required' });
        }
        if (!files?.frontImage) {
          return res.status(400).json({ message: 'Pan front image is required' });
        }
        updateData.pan = {
          number: data.number,
          frontImage: 'Upload Pending',
        };
        try {
          updateData.pan.frontImage = await uploadFile(files.frontImage);
        } catch (error) {
          console.error('Failed to upload Pan front image:', error.message);
          updateData.pan.frontImage = 'Upload Failed: ' + error.message;
        }
        break;

      case 'qualification':
        console.log('Saving Highest Qualification data:', data);
        const requiredFields = [
          'university',
          'branch',
          'enrollmentNumber',
          'cgpa',
          'educationType',
        ];
        const missingFields = requiredFields.filter(
          (field) => !data[field] || data[field].trim() === ''
        );
        if (missingFields.length > 0) {
          return res
            .status(400)
            .json({ message: `Missing required fields: ${missingFields.join(', ')}` });
        }
        if (data.educationType === 'Graduate' && !data.passoutYear) {
          return res
            .status(400)
            .json({ message: 'Passout year is required for Graduate status' });
        }
        if (data.educationType === 'Non-Graduate' && !data.batchDuration) {
          return res
            .status(400)
            .json({ message: 'Batch duration is required for Non-Graduate status' });
        }
        if (!files?.degreeCertificate) {
          return res
            .status(400)
            .json({ message: 'Degree certificate is required' });
        }
        updateData.highestQualification = {
          university: data.university,
          branch: data.branch,
          enrollmentNumber: data.enrollmentNumber,
          cgpa: data.cgpa,
          educationType: data.educationType,
          passoutYear: data.passoutYear || '',
          batchDuration: data.batchDuration || '',
          degreeCertificate: 'Upload Pending',
        };
        try {
          updateData.highestQualification.degreeCertificate = await uploadFile(files.degreeCertificate);
        } catch (error) {
          console.error('Failed to upload degree certificate:', error.message);
          updateData.highestQualification.degreeCertificate = 'Upload Failed: ' + error.message;
        }
        break;

      case 'twelfth':
        console.log('Saving 12th Standard data:', data);
        const twelfthRequiredFields = [
          'schoolName',
          'percentage',
          'passoutYear',
          'rollNo',
        ];
        const twelfthMissingFields = twelfthRequiredFields.filter(
          (field) => !data[field] || data[field].trim() === ''
        );
        if (twelfthMissingFields.length > 0) {
          return res
            .status(400)
            .json({
              message: `Missing required fields: ${twelfthMissingFields.join(', ')}`,
            });
        }
        if (!files?.twelfthMarksheet) {
          return res.status(400).json({ message: '12th Marksheet is required' });
        }
        updateData.twelfth = {
          schoolName: data.schoolName,
          percentage: data.percentage,
          passoutYear: data.passoutYear,
          rollNo: data.rollNo,
          marksheet: 'Upload Pending',
        };
        try {
          updateData.twelfth.marksheet = await uploadFile(files.twelfthMarksheet);
        } catch (error) {
          console.error('Failed to upload 12th marksheet:', error.message);
          updateData.twelfth.marksheet = 'Upload Failed: ' + error.message;
        }
        break;

      case 'tenth':
        console.log('Saving 10th Standard data:', data);
        const tenthRequiredFields = ['schoolName', 'percentage', 'passoutYear', 'rollNo'];
        const tenthMissingFields = tenthRequiredFields.filter(
          (field) => !data[field] || data[field].trim() === ''
        );
        if (tenthMissingFields.length > 0) {
          return res
            .status(400)
            .json({
              message: `Missing required fields: ${tenthMissingFields.join(', ')}`,
            });
        }
        if (!files?.tenthMarksheet) {
          return res.status(400).json({ message: '10th Marksheet is required' });
        }
        updateData.tenth = {
          schoolName: data.schoolName,
          percentage: data.percentage,
          passoutYear: data.passoutYear,
          rollNo: data.rollNo,
          marksheet: 'Upload Pending',
        };
        try {
          updateData.tenth.marksheet = await uploadFile(files.tenthMarksheet);
        } catch (error) {
          console.error('Failed to upload 10th marksheet:', error.message);
          updateData.tenth.marksheet = 'Upload Failed: ' + error.message;
        }
        break;

      case 'salarySlip':
        console.log('Saving Salary Slip data:', {
          salaryCompanyName: data.salaryCompanyName,
          hasSalarySlip: !!files?.salarySlip,
        });
        if (!data.salaryCompanyName) {
          return res
            .status(400)
            .json({ message: 'Company name is required for salary slip' });
        }
        if (!files?.salarySlip) {
          return res.status(400).json({ message: 'Salary slip is required' });
        }
        updateData.salaryCompanyName = data.salaryCompanyName;
        updateData.salarySlip = 'Upload Pending';
        try {
          updateData.salarySlip = await uploadFile(files.salarySlip);
        } catch (error) {
          console.error('Failed to upload salary slip:', error.message);
          updateData.salarySlip = 'Upload Failed: ' + error.message;
        }
        break;

      case 'experienceLetter':
        console.log('Saving Experience Letter data:', data);
        const expRequiredFields = ['companyName', 'experienceYear', 'currentCTC'];
        const expMissingFields = expRequiredFields.filter(
          (field) => !data[field] || data[field].trim() === ''
        );
        if (expMissingFields.length > 0) {
          return res
            .status(400)
            .json({
              message: `Missing required fields: ${expMissingFields.join(', ')}`,
            });
        }
        if (!files?.experienceLetter) {
          return res.status(400).json({ message: 'Experience letter is required' });
        }
        updateData.experienceLetter = {
          companyName: data.companyName,
          experienceYear: data.experienceYear,
          currentCTC: data.currentCTC,
          letterFile: 'Upload Pending',
        };
        try {
          updateData.experienceLetter.letterFile = await uploadFile(files.experienceLetter);
        } catch (error) {
          console.error('Failed to upload experience letter:', error.message);
          updateData.experienceLetter.letterFile = 'Upload Failed: ' + error.message;
        }
        break;

      case 'bankAccount':
        console.log('Saving Bank Account data:', data);
        const bankRequiredFields = [
          'accountHolderName',
          'bankBranchName',
          'ifscCode',
          'accountNumber',
          'confirmAccountNumber',
          'address',
        ];
        const bankMissingFields = bankRequiredFields.filter(
          (field) => !data[field] || data[field].trim() === ''
        );
        if (bankMissingFields.length > 0) {
          return res
            .status(400)
            .json({
              message: `Missing required fields: ${bankMissingFields.join(', ')}`,
            });
        }
        if (data.accountNumber !== data.confirmAccountNumber) {
          return res
            .status(400)
            .json({ message: 'Account number and confirm account number do not match' });
        }
        updateData.bankAccount = {
          accountHolderName: data.accountHolderName,
          ifscCode: data.ifscCode,
          accountNumber: data.accountNumber,
          address: data.address,
          bankBranchName: data.bankBranchName,
        };
        break;

      case 'employeeSignature':
        console.log('Saving Employee Signature data:', {
          hasEmployeeSignature: !!files?.employeeSignature,
        });
        if (!files?.employeeSignature) {
          return res.status(400).json({ message: 'Employee signature is required' });
        }
        updateData.employeeSignature = 'Upload Pending';
        try {
          updateData.employeeSignature = await uploadFile(files.employeeSignature);
        } catch (error) {
          console.error('Failed to upload employee signature:', error.message);
          updateData.employeeSignature = 'Upload Failed: ' + error.message;
        }
        break;

      default:
        console.log('Invalid step:', step);
        return res.status(400).json({ message: 'Invalid step' });
    }

    Object.assign(kyc, updateData);
    kyc.updatedAt = Date.now();
    console.log('KYC document before save:', kyc.toObject());
    await kyc.save();
    console.log('KYC document saved:', kyc.toObject());

    res.status(200).json({ message: `${step} data saved successfully` });
  } catch (error) {
    console.error('Error saving KYC data:', error, error.stack);
    res.status(500).json({ message: 'Failed to save KYC data: ' + error.message });
  }
};

// Submit KYC
const submitKyc = async (req, res) => {
  console.log('submitKyc called');
  const { employeeId } = req.body;
  const io = req.app.get('socketio');

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || requester.role !== 'employee') {
      console.log('Unauthorized: Requester is not an employee:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only employees can submit KYC' });
    }

    if (employeeId !== req.user.id) {
      console.log('Unauthorized: Employee ID mismatch:', {
        employeeId,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ message: 'Unauthorized: Employee ID mismatch' });
    }

    const kyc = await EmployeeKYC.findOne({ employeeId });
    if (!kyc) {
      console.log('KYC data not found for employee:', employeeId);
      return res.status(404).json({ message: 'KYC data not found' });
    }

    if (!kyc.employeeType || !kyc.photo) {
      return res.status(400).json({ message: 'Photo step is incomplete' });
    }
    if (!kyc.aadhar?.number || !kyc.aadhar?.frontImage || !kyc.aadhar?.backImage) {
      return res.status(400).json({
        message: 'Aadhar step is incomplete: Missing fields - ' +
          JSON.stringify({
            number: !!kyc.aadhar?.number,
            frontImage: !!kyc.aadhar?.frontImage,
            backImage: !!kyc.aadhar?.backImage,
          }),
      });
    }
    if (!kyc.pan?.number || !kyc.pan?.frontImage) {
      return res.status(400).json({
        message: 'Pan step is incomplete: Missing fields - ' +
          JSON.stringify({
            number: !!kyc.pan?.number,
            frontImage: !!kyc.pan?.frontImage,
          }),
      });
    }
    if (
      !kyc.highestQualification?.university ||
      !kyc.highestQualification?.branch ||
      !kyc.highestQualification?.enrollmentNumber ||
      !kyc.highestQualification?.cgpa ||
      !kyc.highestQualification?.educationType ||
      !kyc.highestQualification?.degreeCertificate
    ) {
      return res.status(400).json({
        message: 'Highest Qualification step is incomplete: Missing fields - ' +
          JSON.stringify({
            university: !!kyc.highestQualification?.university,
            branch: !!kyc.highestQualification?.branch,
            enrollmentNumber: !!kyc.highestQualification?.enrollmentNumber,
            cgpa: !!kyc.highestQualification?.cgpa,
            educationType: !!kyc.highestQualification?.educationType,
            degreeCertificate: !!kyc.highestQualification?.degreeCertificate,
          }),
      });
    }
    if (
      !kyc.twelfth?.schoolName ||
      !kyc.twelfth?.percentage ||
      !kyc.twelfth?.passoutYear ||
      !kyc.twelfth?.rollNo ||
      !kyc.twelfth?.marksheet
    ) {
      return res.status(400).json({
        message: '12th Standard step is incomplete: Missing fields - ' +
          JSON.stringify({
            schoolName: !!kyc.twelfth?.schoolName,
            percentage: !!kyc.twelfth?.percentage,
            passoutYear: !!kyc.twelfth?.passoutYear,
            rollNo: !!kyc.twelfth?.rollNo,
            marksheet: !!kyc.twelfth?.marksheet,
          }),
      });
    }
    if (
      !kyc.tenth?.schoolName ||
      !kyc.tenth?.percentage ||
      !kyc.tenth?.passoutYear ||
      !kyc.tenth?.rollNo ||
      !kyc.tenth?.marksheet
    ) {
      return res.status(400).json({
        message: '10th Standard step is incomplete: Missing fields - ' +
          JSON.stringify({
            schoolName: !!kyc.tenth?.schoolName,
            percentage: !!kyc.tenth?.percentage,
            passoutYear: !!kyc.tenth?.passoutYear,
            rollNo: !!kyc.tenth?.rollNo,
            marksheet: !!kyc.tenth?.marksheet,
          }),
      });
    }
    if (!kyc.salarySlip) {
      return res.status(400).json({ message: 'Salary Slip step is incomplete' });
    }
    if (
      !kyc.experienceLetter?.companyName ||
      !kyc.experienceLetter?.experienceYear ||
      !kyc.experienceLetter?.currentCTC ||
      !kyc.experienceLetter?.letterFile
    ) {
      return res.status(400).json({
        message: 'Experience Letter step is incomplete: Missing fields - ' +
          JSON.stringify({
            companyName: !!kyc.experienceLetter?.companyName,
            experienceYear: !!kyc.experienceLetter?.experienceYear,
            currentCTC: !!kyc.experienceLetter?.currentCTC,
            letterFile: !!kyc.experienceLetter?.letterFile,
          }),
      });
    }
    if (
      !kyc.bankAccount?.accountHolderName ||
      !kyc.bankAccount?.ifscCode ||
      !kyc.bankAccount?.accountNumber ||
      !kyc.bankAccount?.address ||
      !kyc.bankAccount?.bankBranchName
    ) {
      return res.status(400).json({
        message: 'Bank Account step is incomplete: Missing fields - ' +
          JSON.stringify({
            accountHolderName: !!kyc.bankAccount?.accountHolderName,
            ifscCode: !!kyc.bankAccount?.ifscCode,
            accountNumber: !!kyc.bankAccount?.accountNumber,
            address: !!kyc.bankAccount?.address,
            bankBranchName: !!kyc.bankAccount?.bankBranchName,
          }),
      });
    }
    if (!kyc.employeeSignature) {
      return res.status(400).json({ message: 'Employee Signature step is incomplete' });
    }

    kyc.status = 'Pending';
    kyc.updatedAt = Date.now();
    console.log('KYC before submit:', kyc.toObject());
    await kyc.save();
    console.log('KYC submitted:', kyc.toObject());

    const adminHrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
    for (const adminHr of adminHrUsers) {
      await sendNotification(
        io,
        adminHr._id,
        `${requester.fullName} submitted their KYC for approval`,
        'kyc'
      );
    }

    await sendEmail({
      to: requester.email,
      subject: 'KYC Submission Confirmation',
      text: `Dear ${requester.fullName},\n\nYour KYC documents have been submitted for approval. You will be notified once the review is complete.\n\nBest regards,\nHRMS Team`,
    });

    res.status(200).json({ message: 'KYC submitted for approval' });
  } catch (error) {
    console.error('Error submitting KYC:', error, error.stack);
    res.status(500).json({ message: 'Failed to submit KYC: ' + error.message });
  }
};

// Get KYC status
const getKycStatus = async (req, res) => {
  console.log('getKycStatus called for employee:', req.params.employeeId);
  const { employeeId } = req.params;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(employeeId)) {
    console.log('Invalid employeeId:', employeeId);
    return res.status(400).json({ message: 'Invalid employee ID format' });
  }

  try {
    const requester = await User.findById(req.user.id);
    if (!requester) {
      console.log('Unauthorized: Requester not found:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Requester not found' });
    }

    // Restrict access to employees for their own KYC, or admins/HR
    if (requester.role === 'employee' && employeeId !== req.user.id) {
      console.log('Unauthorized: Employee ID mismatch:', {
        employeeId,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ message: 'Unauthorized: Employees can only check their own KYC status' });
    }

    const kyc = await EmployeeKYC.findOne({ employeeId });
    if (!kyc) {
      console.log('KYC data not found for employee:', employeeId);
      return res.status(200).json({
        status: 'Not Started',
        rejectionReason: '',
      });
    }

    console.log('KYC status fetched:', {
      status: kyc.status,
      rejectionReason: kyc.rejectionReason || '',
    });
    res.status(200).json({
      status: kyc.status,
      rejectionReason: kyc.status === 'Rejected' ? kyc.rejectionReason : '',
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error, error.stack);
    res
      .status(500)
      .json({ message: 'Failed to fetch KYC status: ' + error.message });
  }
};

// Approve KYC
const approveKyc = async (req, res) => {
  console.log('approveKyc called for employee:', req.params.employeeId);
  const { employeeId } = req.params;
  const io = req.app.get('socketio');

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      console.log('Unauthorized: Requester is not an admin or HR:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only admins or HR can approve KYC' });
    }

    const kyc = await EmployeeKYC.findOne({ employeeId });
    if (!kyc) {
      console.log('KYC data not found for employee:', employeeId);
      return res.status(404).json({ message: 'KYC data not found' });
    }

    if (kyc.status !== 'Pending') {
      console.log('KYC has already been processed:', kyc.status);
      return res.status(400).json({ message: 'KYC has already been processed' });
    }

    kyc.status = 'Approved';
    kyc.rejectionReason = '';
    kyc.updatedAt = Date.now();
    console.log('KYC before approval:', kyc.toObject());
    await kyc.save();
    console.log('KYC approved:', kyc.toObject());

    const employee = await User.findById(employeeId);
    if (employee) {
      await sendEmail({
        to: employee.email,
        subject: 'KYC Approval Confirmation',
        text: `Dear ${employee.fullName},\n\nYour KYC documents have been approved by ${requester.fullName}. You can now proceed to the agreement page.\n\nBest regards,\nHRMS Team`,
      });

      console.log(`Attempting to send WebSocket notification to employee ${employee._id}`);
      await sendNotification(
        io,
        employee._id,
        `Your KYC has been approved by ${requester.fullName}`,
        'kyc'
      );
      console.log(`WebSocket notification sent to employee ${employee._id}`);
    } else {
      console.warn(`Employee not found for KYC approval, employeeId: ${employeeId}`);
    }

    res.status(200).json({ message: 'KYC approved successfully' });
  } catch (error) {
    console.error('Error approving KYC:', error, error.stack);
    res.status(500).json({ message: 'Failed to approve KYC: ' + error.message });
  }
};

// Reject KYC
const rejectKyc = async (req, res) => {
  console.log('rejectKyc called for employee:', req.params.employeeId);
  const { employeeId } = req.params;
  const { reason } = req.body;
  const io = req.app.get('socketio');

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      console.log('Unauthorized: Requester is not an admin or HR:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only admins or HR can reject KYC' });
    }

    if (!reason || reason.trim() === '') {
      console.log('Rejection reason is required');
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const kyc = await EmployeeKYC.findOne({ employeeId });
    if (!kyc) {
      console.log('KYC data not found for employee:', employeeId);
      return res.status(404).json({ message: 'KYC data not found' });
    }

    if (kyc.status !== 'Pending') {
      console.log('KYC has already been processed:', kyc.status);
      return res.status(400).json({ message: 'KYC has already been processed' });
    }

    kyc.status = 'Rejected';
    kyc.rejectionReason = reason;
    kyc.updatedAt = Date.now();
    console.log('KYC before rejection:', kyc.toObject());
    await kyc.save();
    console.log('KYC rejected:', kyc.toObject());

    const employee = await User.findById(employeeId);
    if (employee) {
      await sendEmail({
        to: employee.email,
        subject: 'KYC Rejection Notice',
        text: `Dear ${employee.fullName},\n\nYour KYC documents have been rejected by ${requester.fullName} for the following reason:\n\n${reason}\n\nPlease review and resubmit your documents.\n\nBest regards,\nHRMS Team`,
      });

      await sendNotification(
        io,
        employee._id,
        `Your KYC has been rejected by ${requester.fullName}. Reason: ${reason}. Please review and resubmit your documents.`,
        'kyc'
      );
    } else {
      console.warn(`Employee not found for KYC rejection, employeeId: ${employeeId}`);
    }

    res.status(200).json({ message: 'KYC rejected successfully, notification sent to employee' });
  } catch (error) {
    console.error('Error rejecting KYC:', error, error.stack);
    res.status(500).json({ message: 'Failed to reject KYC: ' + error.message });
  }
};

// Get pending KYC requests
const getPendingKycRequests = async (req, res) => {
  console.log('getPendingKycRequests called');
  console.log('User making request:', req.user);

  try {
    const requester = await User.findById(req.user.id);
    console.log('Requester details:', requester);

    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      console.log('Unauthorized: Requester is not an admin or HR:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only admins or HR can view pending KYC requests' });
    }

    const pendingKycs = await EmployeeKYC.find({ status: 'Pending' })
      .populate('employeeId', 'fullName email')
      .select('employeeId status createdAt updatedAt');

    console.log('Pending KYC requests fetched:', pendingKycs);
    if (pendingKycs.length === 0) {
      console.log('No pending KYC requests found in the database.');
    }

    res.status(200).json(pendingKycs);
  } catch (error) {
    console.error('Error fetching pending KYC requests:', error, error.stack);
    res
      .status(500)
      .json({ message: 'Failed to fetch pending KYC requests: ' + error.message });
  }
};

// Get employees with KYC
const getEmployeesWithKyc = async (req, res) => {
  console.log('getEmployeesWithKyc called');
  console.log('User making request:', req.user);

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      console.log('Unauthorized: Requester is not an admin or HR:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only admins or HR can view KYC data' });
    }

    const { page = 1, limit = 5, status } = req.query;
    const skip = (page - 1) * limit;

    let query = EmployeeKYC.find()
      .populate({
        path: 'employeeId',
        select: 'fullName email phoneNumber address role',
        match: { role: 'employee' },
      });

    if (status && status !== 'All') {
      query = query.where('status').equals(status);
    }

    query = query.skip(skip).limit(parseInt(limit));

    const kycRecords = await query.exec();
    const validKycRecords = kycRecords.filter((kyc) => kyc.employeeId !== null);

    let totalQuery = EmployeeKYC.find()
      .populate({
        path: 'employeeId',
        match: { role: 'employee' },
      });

    if (status && status !== 'All') {
      totalQuery = totalQuery.where('status').equals(status);
    }

    const totalRecords = await totalQuery.exec();
    const total = totalRecords.filter((kyc) => kyc.employeeId !== null).length;

    const formattedEmployees = validKycRecords.map((kyc) => ({
      _id: kyc.employeeId._id,
      fullName: kyc.employeeId.fullName || 'N/A',
      phone: kyc.employeeId.phoneNumber || 'N/A',
      email: kyc.employeeId.email || 'N/A',
      address: kyc.employeeId.address || {},
      kycStatus: kyc.status || 'Unknown',
      rejectionReason: kyc.rejectionReason || '',
      photo: kyc.photo || '',
      employeeType: kyc.employeeType || 'N/A',
      aadhaar: kyc.aadhar || { number: '', frontImage: '', backImage: '' },
      pan: kyc.pan || { number: '', frontImage: '' },
      highestQualification: kyc.highestQualification || {
        university: '',
        branch: '',
        enrollmentNumber: '',
        cgpa: '',
        educationType: '',
        passoutYear: '',
        batchDuration: '',
        degreeCertificate: '',
      },
      twelfth: kyc.twelfth || {
        schoolName: '',
        percentage: '',
        passoutYear: '',
        rollNo: '',
        marksheet: '',
      },
      tenth: kyc.tenth || {
        schoolName: '',
        percentage: '',
        passoutYear: '',
        rollNo: '',
        marksheet: '',
      },
      salaryCompanyName: kyc.salaryCompanyName || '',
      salarySlip: kyc.salarySlip || '',
      experienceLetter: kyc.experienceLetter || {
        companyName: '',
        experienceYear: '',
        currentCTC: '',
        letterFile: '',
      },
      bankAccount: kyc.bankAccount || {
        accountHolderName: '',
        ifscCode: '',
        accountNumber: '',
        address: '',
        bankBranchName: '',
      },
      employeeSignature: kyc.employeeSignature || '',
      agreementStatus: kyc.agreementStatus || 'Not Uploaded',
      agreementUrl: kyc.agreementUrl || '',
    }));

    console.log('Employees with KYC fetched:', formattedEmployees);
    res.status(200).json({
      employees: formattedEmployees,
      total,
    });
  } catch (error) {
    console.error('Error fetching employees with KYC:', error, error.stack);
    res
      .status(500)
      .json({ message: 'Failed to fetch employees with KYC: ' + error.message });
  }
};

// Get KYC details
const getKycDetails = async (req, res) => {
  console.log('getKycDetails called for employee:', req.params.employeeId);
  const { employeeId } = req.params;

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
      console.log('Unauthorized: Requester is not an admin or HR:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only admins or HR can view KYC details' });
    }

    const kyc = await EmployeeKYC.findOne({ employeeId }).populate(
      'employeeId',
      'fullName email'
    );
    if (!kyc) {
      console.log('KYC data not found for employee:', employeeId);
      return res.status(404).json({ message: 'KYC data not found' });
    }

    console.log('KYC details fetched:', kyc.toObject());
    res.status(200).json(kyc);
  } catch (error) {
    console.error('Error fetching KYC details:', error, error.stack);
    res
      .status(500)
      .json({ message: 'Failed to fetch KYC details: ' + error.message });
  }
};

// Get current employee's KYC
const getCurrentEmployeeKyc = async (req, res) => {
  console.log('getCurrentEmployeeKyc called for employee:', req.user.id);

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || requester.role !== 'employee') {
      console.log('Unauthorized: Requester is not an employee:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only employees can access their own KYC data' });
    }

    const kyc = await EmployeeKYC.findOne({ employeeId: req.user.id }).populate(
      'employeeId',
      'fullName email phone address position jobTitle'
    );
    if (!kyc) {
      console.log('KYC data not found for employee:', req.user.id);
      return res.status(404).json({ message: 'KYC data not found' });
    }

    const formattedKyc = {
      _id: kyc.employeeId._id,
      fullName: kyc.employeeId.fullName,
      phone: kyc.employeeId.phone,
      email: kyc.employeeId.email,
      address: kyc.employeeId.address,
      position: kyc.employeeId.position || 'N/A',
      jobTitle: kyc.employeeId.jobTitle || 'N/A',
      kycStatus: kyc.status,
      rejectionReason: kyc.rejectionReason || '',
      photo: kyc.photo || '',
      employeeType: kyc.employeeType || 'N/A',
      aadhaar: kyc.aadhar || { number: '', frontImage: '', backImage: '' },
      pan: kyc.pan || { number: '', frontImage: '' },
      highestQualification: kyc.highestQualification || {
        university: '',
        branch: '',
        enrollmentNumber: '',
        cgpa: '',
        educationType: '',
        passoutYear: '',
        batchDuration: '',
        degreeCertificate: '',
      },
      twelfth: kyc.twelfth || {
        schoolName: '',
        percentage: '',
        passoutYear: '',
        rollNo: '',
        marksheet: '',
      },
      tenth: kyc.tenth || {
        schoolName: '',
        percentage: '',
        passoutYear: '',
        rollNo: '',
        marksheet: '',
      },
      salaryCompanyName: kyc.salaryCompanyName || '',
      salarySlip: kyc.salarySlip || '',
      experienceLetter: kyc.experienceLetter || {
        companyName: '',
        experienceYear: '',
        currentCTC: '',
        letterFile: '',
      },
      bankAccount: kyc.bankAccount || {
        accountHolderName: '',
        ifscCode: '',
        accountNumber: '',
        address: '',
        bankBranchName: '',
      },
      employeeSignature: kyc.employeeSignature || '',
      agreementStatus: kyc.agreementStatus || 'Not Uploaded',
      agreementUrl: kyc.agreementUrl || '',
    };

    console.log('Current employee KYC fetched:', formattedKyc);
    res.status(200).json(formattedKyc);
  } catch (error) {
    console.error('Error fetching current employee\'s KYC:', error, error.stack);
    res.status(500).json({ message: 'Failed to fetch KYC data: ' + error.message });
  }
};

// Accept agreement
const acceptAgreement = async (req, res) => {
  console.log('acceptAgreement called');
  const { employeeId } = req.body;

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || requester.role !== 'employee') {
      console.log('Unauthorized: Requester is not an employee:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only employees can accept agreements' });
    }

    if (employeeId !== req.user.id) {
      console.log('Unauthorized: Employee ID mismatch:', {
        employeeId,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ message: 'Unauthorized: Employee ID mismatch' });
    }

    const kyc = await EmployeeKYC.findOne({ employeeId });
    if (!kyc) {
      console.log('KYC data not found for employee:', employeeId);
      return res.status(404).json({ message: 'KYC data not found' });
    }

    if (kyc.status !== 'Approved') {
      console.log('KYC not approved yet:', kyc.status);
      return res
        .status(403)
        .json({ message: 'KYC must be approved before accepting the agreement' });
    }

    if (!kyc.agreementUrl || kyc.agreementStatus !== 'Uploaded') {
      console.log('Agreement not uploaded:', kyc.agreementStatus);
      return res
        .status(403)
        .json({ message: 'Agreement must be uploaded before accepting' });
    }

    kyc.agreementAccepted = true;
    kyc.agreementStatus = 'Accepted';
    kyc.updatedAt = Date.now();
    console.log('KYC before agreement acceptance:', kyc.toObject());
    await kyc.save();
    console.log('Agreement accepted, KYC updated:', kyc.toObject());

    const io = req.app.get('socketio');
    const adminHrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
    for (const adminHr of adminHrUsers) {
      await sendNotification(
        io,
        adminHr._id,
        `${requester.fullName} accepted their employment agreement`,
        'agreement'
      );
    }

    await sendEmail({
      to: requester.email,
      subject: 'Agreement Acceptance Confirmation',
      text: `Dear ${requester.fullName},\n\nYou have successfully accepted the employment agreement.\n\nBest regards,\nHRMS Team`,
    });

    res.status(200).json({ message: 'Agreement accepted successfully' });
  } catch (error) {
    console.error('Error accepting agreement:', error, error.stack);
    res
      .status(500)
      .json({ message: 'Failed to accept agreement: ' + error.message });
  }
};

// Upload agreement
const uploadAgreement = async (req, res) => {
  console.log('uploadAgreement called for employee:', req.user.id);
  const io = req.app.get('socketio');

  try {
    const requester = await User.findById(req.user.id);
    if (!requester || requester.role !== 'employee') {
      console.log('Unauthorized: Requester is not an employee:', req.user);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only employees can upload agreements' });
    }

    const kyc = await EmployeeKYC.findOne({ employeeId: req.user.id });
    if (!kyc) {
      console.log('KYC data not found for employee:', req.user.id);
      return res.status(404).json({ message: 'KYC data not found' });
    }

    if (kyc.status !== 'Approved') {
      console.log('KYC not approved yet:', kyc.status);
      return res
        .status(403)
        .json({ message: 'KYC must be approved before uploading the agreement' });
    }

    if (!req.files || !req.files.agreement) {
      console.log('No agreement file provided');
      return res.status(400).json({ message: 'Agreement file is required' });
    }

    const agreementUrl = await uploadFile(req.files.agreement);
    console.log('Agreement uploaded to ImageKit:', agreementUrl);

    kyc.agreementUrl = agreementUrl;
    kyc.agreementStatus = 'Uploaded';
    kyc.updatedAt = Date.now();
    console.log('KYC before agreement upload:', kyc.toObject());
    await kyc.save();
    console.log('Agreement uploaded, KYC updated:', kyc.toObject());

    const adminHrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
    for (const adminHr of adminHrUsers) {
      await sendNotification(
        io,
        adminHr._id,
        `${requester.fullName} uploaded their employment agreement`,
        'agreement'
      );
    }

    await sendEmail({
      to: requester.email,
      subject: 'Agreement Upload Confirmation',
      text: `Dear ${requester.fullName},\n\nYour employment agreement has been successfully uploaded. You can now proceed to accept the agreement.\n\nBest regards,\nHRMS Team`,
    });

    res.status(200).json({ message: 'Agreement uploaded successfully', agreementUrl });
  } catch (error) {
    console.error('Error uploading agreement:', error, error.stack);
    res.status(500).json({ message: 'Failed to upload agreement: ' + error.message });
  }
};

module.exports = {
  saveKycData,
  submitKyc,
  getKycStatus,
  approveKyc,
  rejectKyc,
  getPendingKycRequests,
  getEmployeesWithKyc,
  getKycDetails,
  getCurrentEmployeeKyc,
  acceptAgreement,
  uploadAgreement,
};