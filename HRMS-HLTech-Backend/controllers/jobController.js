const Job = require('../models/Job');
const Candidate = require('../models/Candidatess');
const User = require('../models/User');
const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: "public_syA5d0JC/l/EB96LYVu6uKjXQL4=",
  privateKey: "private_DxBzzP+M8oit8lCgT6RoNCnPGTo=",
  urlEndpoint: "https://ik.imagekit.io/shanni280104/",
});

// Create a new job posting
const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      location,
      jobType,
      experienceRange,
      salaryRange,
      responsibilities,
      skills,
      customQuestions,
      customQuestionsTypes,
    } = req.body;

    console.log('Create job attempt:', { jobTitle, user: req.user });
    console.log('Incoming custom questions:', { customQuestions, customQuestionsTypes });

    const requiredFields = [
      'jobTitle',
      'location',
      'jobType',
      'salaryRange.currency',
      'salaryRange.unit',
      'responsibilities',
      'skills',
    ];
    const missingFields = requiredFields.filter(field => {
      const keys = field.split('.');
      let value = req.body;
      for (const key of keys) {
        value = value[key];
        if (value === undefined || value === null || value === '') return true;
      }
      return false;
    });
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ message: `Please fill in all required fields: ${missingFields.join(', ')}` });
    }

    if (!req.user || !req.user.id) {
      console.log('No authenticated user found:', { user: req.user });
      return res.status(401).json({ message: 'Unauthorized: No user authenticated' });
    }

    if (experienceRange) {
      const { minExperience, maxExperience } = experienceRange;
      if ((minExperience !== undefined && isNaN(minExperience)) || (minExperience < 0)) {
        console.log('Invalid minExperience:', minExperience);
        return res.status(400).json({ message: 'minExperience must be a non-negative number' });
      }
      if ((maxExperience !== undefined && isNaN(maxExperience)) || (maxExperience < 0)) {
        console.log('Invalid maxExperience:', maxExperience);
        return res.status(400).json({ message: 'maxExperience must be a non-negative number' });
      }
      if (minExperience !== undefined && maxExperience !== undefined && maxExperience < minExperience) {
        console.log('maxExperience less than minExperience:', { minExperience, maxExperience });
        return res.status(400).json({ message: 'maxExperience must be greater than or equal to minExperience' });
      }
    }

    const { currency, minSalary, maxSalary, unit, hideSalary } = salaryRange;
    const validCurrencies = ['INR ₹', 'USD $', 'EUR €'];
    const validUnits = ['Per Year', 'Per Month', 'Per Hour'];
    if (!validCurrencies.includes(currency)) {
      console.log('Invalid currency:', currency);
      return res.status(400).json({ message: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}` });
    }
    if (!validUnits.includes(unit)) {
      console.log('Invalid unit:', unit);
      return res.status(400).json({ message: `Invalid unit. Must be one of: ${validUnits.join(', ')}` });
    }
    if (minSalary && (isNaN(minSalary) || Number(minSalary) < 0)) {
      console.log('Invalid minSalary:', minSalary);
      return res.status(400).json({ message: 'minSalary must be a non-negative number' });
    }
    if (maxSalary && (isNaN(maxSalary) || Number(maxSalary) < 0)) {
      console.log('Invalid maxSalary:', maxSalary);
      return res.status(400).json({ message: 'maxSalary must be a non-negative number' });
    }
    if (minSalary && maxSalary && Number(maxSalary) < Number(minSalary)) {
      console.log('maxSalary less than minSalary:', { minSalary, maxSalary });
      return res.status(400).json({ message: 'maxSalary must be greater than or equal to minSalary' });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : skills.split(',').map(skill => skill.trim()).filter(skill => skill);

    if (!Array.isArray(customQuestions)) {
      console.log('customQuestions is not an array:', customQuestions);
      return res.status(400).json({ message: 'customQuestions must be an array' });
    }
    if (!Array.isArray(customQuestionsTypes)) {
      console.log('customQuestionsTypes is not an array:', customQuestionsTypes);
      return res.status(400).json({ message: 'customQuestionsTypes must be an array' });
    }

    const questionsArray = customQuestions || [];
    const questionTypesArray = customQuestionsTypes || [];

    if (questionsArray.length !== questionTypesArray.length) {
      console.log('Mismatch between customQuestions and customQuestionsTypes:', {
        questions: questionsArray.length,
        types: questionTypesArray.length,
      });
      return res.status(400).json({ message: 'Mismatch between custom questions and their types' });
    }

    const job = new Job({
      jobTitle,
      location,
      jobType,
      experienceRange: experienceRange
        ? {
            minExperience: experienceRange.minExperience ? Number(experienceRange.minExperience) : undefined,
            maxExperience: experienceRange.maxExperience ? Number(experienceRange.maxExperience) : undefined,
          }
        : undefined,
      salaryRange: {
        currency,
        minSalary: minSalary || '',
        maxSalary: maxSalary || '',
        unit,
        hideSalary: hideSalary === 'true' || hideSalary === true,
      },
      responsibilities,
      skills: skillsArray,
      customQuestions: questionsArray,
      customQuestionsTypes: questionTypesArray,
      postedBy: req.user.id,
      visibility: 'public', // Ensure new jobs are public by default
    });

    await job.save();
    console.log('Job created successfully:', { jobId: job._id, postedBy: req.user.id });
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Error during job creation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Fetch all job postings (public, with visibility filtering)
const getAllJobs = async (req, res) => {
  try {
    console.log('Fetching all jobs for user:', { user: req.user });
    let query = {};

    // If user is not authenticated or not an admin/HR, only show public jobs
    if (!req.user) {
      console.log('User is not authenticated, applying visibility filter');
      query.visibility = 'public';
    } else if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      console.log('User is not admin/HR, applying visibility filter:', { userRole: req.user.role });
      query.visibility = 'public';
    } else {
      console.log('User is admin/HR, returning all jobs:', { userRole: req.user.role });
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    const formattedJobs = jobs.map(job => ({
      ...job._doc,
      experienceLevel: job.experienceRange?.minExperience !== undefined && job.experienceRange?.maxExperience !== undefined
        ? `${job.experienceRange.minExperience}-${job.experienceRange.maxExperience} years`
        : 'Not specified',
      salary: job.salaryRange.minSalary && job.salaryRange.maxSalary
        ? `${job.salaryRange.currency} ${job.salaryRange.minSalary}-${job.salaryRange.maxSalary} ${job.salaryRange.unit}`
        : 'NA',
    }));

    console.log('Jobs fetched:', { count: formattedJobs.length, userRole: req.user?.role });
    res.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a job posting
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      jobTitle,
      location,
      jobType,
      experienceRange,
      salaryRange,
      responsibilities,
      skills,
      customQuestions,
      customQuestionsTypes,
    } = req.body;

    console.log('Update job attempt:', { jobId: id, user: req.user });
    console.log('Incoming custom questions:', { customQuestions, customQuestionsTypes });

    const requiredFields = [
      'jobTitle',
      'location',
      'jobType',
      'salaryRange.currency',
      'salaryRange.unit',
      'responsibilities',
      'skills',
    ];
    const missingFields = requiredFields.filter(field => {
      const keys = field.split('.');
      let value = req.body;
      for (const key of keys) {
        value = value[key];
        if (value === undefined || value === null || value === '') return true;
      }
      return false;
    });
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ message: `Please fill in all required fields: ${missingFields.join(', ')}` });
    }

    if (!req.user || !req.user.id) {
      console.log('No authenticated user found:', { user: req.user });
      return res.status(401).json({ message: 'Unauthorized: No user authenticated' });
    }

    if (experienceRange) {
      const { minExperience, maxExperience } = experienceRange;
      if ((minExperience !== undefined && isNaN(minExperience)) || (minExperience < 0)) {
        console.log('Invalid minExperience:', minExperience);
        return res.status(400).json({ message: 'minExperience must be a non-negative number' });
      }
      if ((maxExperience !== undefined && isNaN(maxExperience)) || (maxExperience < 0)) {
        console.log('Invalid maxExperience:', maxExperience);
        return res.status(400).json({ message: 'maxExperience must be a non-negative number' });
      }
      if (minExperience !== undefined && maxExperience !== undefined && maxExperience < minExperience) {
        console.log('maxExperience less than minExperience:', { minExperience, maxExperience });
        return res.status(400).json({ message: 'maxExperience must be greater than or equal to minExperience' });
      }
    }

    const { currency, minSalary, maxSalary, unit, hideSalary } = salaryRange;
    const validCurrencies = ['INR ₹', 'USD $', 'EUR €'];
    const validUnits = ['Per Year', 'Per Month', 'Per Hour'];
    if (!validCurrencies.includes(currency)) {
      console.log('Invalid currency:', currency);
      return res.status(400).json({ message: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}` });
    }
    if (!validUnits.includes(unit)) {
      console.log('Invalid unit:', unit);
      return res.status(400).json({ message: `Invalid unit. Must be one of: ${validUnits.join(', ')}` });
    }
    if (minSalary && (isNaN(minSalary) || Number(minSalary) < 0)) {
      console.log('Invalid minSalary:', minSalary);
      return res.status(400).json({ message: 'minSalary must be a non-negative number' });
    }
    if (maxSalary && (isNaN(maxSalary) || Number(maxSalary) < 0)) {
      console.log('Invalid maxSalary:', maxSalary);
      return res.status(400).json({ message: 'maxSalary must be a non-negative number' });
    }
    if (minSalary && maxSalary && Number(maxSalary) < Number(minSalary)) {
      console.log('maxSalary less than minSalary:', { minSalary, maxSalary });
      return res.status(400).json({ message: 'maxSalary must be greater than or equal to minSalary' });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : skills.split(',').map(skill => skill.trim()).filter(skill => skill);

    if (!Array.isArray(customQuestions)) {
      console.log('customQuestions is not an array:', customQuestions);
      return res.status(400).json({ message: 'customQuestions must be an array' });
    }
    if (!Array.isArray(customQuestionsTypes)) {
      console.log('customQuestionsTypes is not an array:', customQuestionsTypes);
      return res.status(400).json({ message: 'customQuestionsTypes must be an array' });
    }

    const questionsArray = customQuestions || [];
    const questionTypesArray = customQuestionsTypes || [];

    if (questionsArray.length !== questionTypesArray.length) {
      console.log('Mismatch between customQuestions and customQuestionsTypes:', {
        questions: questionsArray.length,
        types: questionTypesArray.length,
      });
      return res.status(400).json({ message: 'Mismatch between custom questions and their types' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        jobTitle,
        location,
        jobType,
        experienceRange: experienceRange
          ? {
              minExperience: experienceRange.minExperience ? Number(experienceRange.minExperience) : undefined,
              maxExperience: experienceRange.maxExperience ? Number(experienceRange.maxExperience) : undefined,
            }
          : undefined,
        salaryRange: {
          currency,
          minSalary: minSalary || '',
          maxSalary: maxSalary || '',
          unit,
          hideSalary: hideSalary === 'true' || hideSalary === true,
        },
        responsibilities,
        skills: skillsArray,
        customQuestions: questionsArray,
        customQuestionsTypes: questionTypesArray,
      },
      { new: true }
    );

    if (!updatedJob) {
      console.log('Job not found:', id);
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Job updated successfully:', { jobId: id });
    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    console.error('Error during job update:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a job posting
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete job attempt:', { jobId: id, user: req.user });

    if (!req.user || !req.user.id) {
      console.log('No authenticated user found:', { user: req.user });
      return res.status(401).json({ message: 'Unauthorized: No user authenticated' });
    }

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      console.log('Job not found:', id);
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Job deleted successfully:', { jobId: id });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error during job deletion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = req.user;
    const {
      fullName,
      emailAddress,
      phoneNumber,
      currentLocation,
      linkedInProfile,
      gitHubProfile,
      portfolioWebsite,
      highestQualification,
      universityName,
      passingYear,
      isFresher,
      totalExperience,
      previousCompanyName,
      previousRole,
      noticePeriod,
      primarySkills,
      otherSkills,
      whyHireYou,
      currentCTC,
      expectedCTC,
      customAnswers,
    } = req.body;
    const resume = req.files?.resume;

    console.log('Job application attempt:', { jobId: id, candidateEmail: candidate.email });

    const requiredFields = [
      'fullName',
      'emailAddress',
      'phoneNumber',
      'highestQualification',
      'universityName',
      'passingYear',
      'primarySkills',
    ];
    if (isFresher === 'false' || isFresher === false) {
      requiredFields.push('totalExperience');
    }
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    if (!resume) {
      console.log('Resume not provided');
      return res.status(400).json({ message: 'Resume is required' });
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resume.mimetype)) {
      console.log('Invalid resume file type:', resume.mimetype);
      return res.status(400).json({ message: 'Resume must be a PDF or Word document' });
    }
    if (resume.size > 5 * 1024 * 1024) {
      console.log('Resume file too large:', resume.size);
      return res.status(400).json({ message: 'Resume file size must be less than 5MB' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      console.log('Invalid email address:', emailAddress);
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.log('Invalid phone number:', phoneNumber);
      return res.status(400).json({ message: 'Invalid phone number (10-15 digits)' });
    }

    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
    if (linkedInProfile && !urlRegex.test(linkedInProfile)) {
      console.log('Invalid LinkedIn URL:', linkedInProfile);
      return res.status(400).json({ message: 'Invalid LinkedIn URL' });
    }
    if (gitHubProfile && !urlRegex.test(gitHubProfile)) {
      console.log('Invalid GitHub URL:', gitHubProfile);
      return res.status(400).json({ message: 'Invalid GitHub URL' });
    }
    if (portfolioWebsite && !urlRegex.test(portfolioWebsite)) {
      console.log('Invalid Portfolio URL:', portfolioWebsite);
      return res.status(400).json({ message: 'Invalid Portfolio URL' });
    }

    const currentYear = new Date().getFullYear();
    if (isNaN(passingYear) || passingYear < 1900 || passingYear > currentYear) {
      console.log('Invalid passing year:', passingYear);
      return res.status(400).json({ message: `Passing year must be between 1900 and ${currentYear}` });
    }

    if ((isFresher === 'false' || isFresher === false) && (isNaN(totalExperience) || totalExperience < 0)) {
      console.log('Invalid total experience:', totalExperience);
      return res.status(400).json({ message: 'Total experience must be a non-negative number' });
    }

    if (currentCTC && (isNaN(currentCTC) || currentCTC < 0)) {
      console.log('Invalid current CTC:', currentCTC);
      return res.status(400).json({ message: 'Current CTC must be a non-negative number' });
    }
    if (expectedCTC && (isNaN(expectedCTC) || expectedCTC < 0)) {
      console.log('Invalid expected CTC:', expectedCTC);
      return res.status(400).json({ message: 'Expected CTC must be a non-negative number' });
    }

    const validNoticePeriods = ['Immediate', '15 Days', '30 Days', '60+ Days', ''];
    if (noticePeriod && !validNoticePeriods.includes(noticePeriod)) {
      console.log('Invalid notice period:', noticePeriod);
      return res.status(400).json({ message: 'Invalid notice period' });
    }

    let parsedCustomAnswers = {};
    if (customAnswers) {
      try {
        parsedCustomAnswers = JSON.parse(customAnswers);
      } catch (error) {
        console.log('Invalid custom answers format:', customAnswers);
        return res.status(400).json({ message: 'Invalid custom answers format' });
      }
    }

    const job = await Job.findById(id);
    if (!job) {
      console.log('Job not found:', id);
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.visibility === 'private') {
      console.log('Job is private and not visible to candidates:', { jobId: id });
      return res.status(403).json({ message: 'This job is not available for applications' });
    }

    if (job.customQuestions && job.customQuestions.length > 0) {
      const unansweredQuestions = job.customQuestions.filter(q => !parsedCustomAnswers[q]);
      if (unansweredQuestions.length > 0) {
        console.log('Unanswered custom questions:', unansweredQuestions);
        return res.status(400).json({ message: `Please answer all custom questions: ${unansweredQuestions.join(', ')}` });
      }
    }

    console.log('Uploading resume to ImageKit:', { fileName: resume.name });
    const uploadResponse = await imagekit.upload({
      file: resume.data,
      fileName: `resume_${candidate._id}_${Date.now()}.${resume.mimetype.split('/')[1]}`,
      folder: '/job_applications',
    });
    console.log('Resume uploaded:', { url: uploadResponse.url });

    console.log('Job details:', {
      jobId: job._id,
      postedBy: job.postedBy ? job.postedBy.toString() : 'missing',
      candidateCount: job.candidates.length,
    });

    if (!job.postedBy) {
      console.log('Job missing postedBy:', { jobId: id });
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        console.log('No admin user found for fallback');
        return res.status(500).json({ message: 'Server error: No admin user available. Please contact support.' });
      }
      job.postedBy = adminUser._id;
      console.log('Assigned default postedBy:', { jobId: id, postedBy: adminUser._id });
    }

    const alreadyApplied = job.candidates.some(
      (c) => c.candidateId.toString() === candidate._id.toString()
    );
    if (alreadyApplied) {
      console.log('Candidate already applied:', { candidateId: candidate._id, jobId: id });
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const applicationData = {
      candidateId: candidate._id,
      candidateName: fullName,
      candidateEmail: emailAddress,
      phoneNumber,
      currentLocation: currentLocation || undefined,
      linkedInProfile: linkedInProfile || undefined,
      gitHubProfile: gitHubProfile || undefined,
      portfolioWebsite: portfolioWebsite || undefined,
      highestQualification,
      universityName,
      passingYear: Number(passingYear),
      isFresher: isFresher === 'true' || isFresher === true,
      totalExperience: totalExperience ? Number(totalExperience) : undefined,
      previousCompanyName: previousCompanyName || undefined,
      previousRole: previousRole || undefined,
      noticePeriod: noticePeriod || undefined,
      primarySkills,
      otherSkills: otherSkills || undefined,
      resumeUrl: uploadResponse.url,
      whyHireYou: whyHireYou || undefined,
      currentCTC: currentCTC ? Number(currentCTC) : undefined,
      expectedCTC: expectedCTC ? Number(expectedCTC) : undefined,
      customAnswers: parsedCustomAnswers,
      hiringStage: 'Sourced',
      appliedAt: new Date(),
    };

    job.candidates.push(applicationData);
    console.log('Added candidate to job:', { jobId: id, candidateId: candidate._id });

    const candidateDoc = await Candidate.findById(candidate._id);
    candidateDoc.appliedJobs.push({
      jobId: job._id,
      ...applicationData,
    });
    console.log('Added job to candidate appliedJobs:', { candidateId: candidate._id, jobId: id });

    await Promise.all([job.save(), candidateDoc.save()]);
    console.log('Application saved successfully:', { jobId: id, candidateId: candidate._id });

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error during job application:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch applied jobs for the authenticated candidate (all hiring stages)
const getAppliedJobs = async (req, res) => {
  try {
    const candidate = req.user;
    console.log('Fetching applied jobs for candidate:', { candidateId: candidate._id });

    const candidateDoc = await Candidate.findById(candidate._id).populate({
      path: 'appliedJobs.jobId',
      select: 'jobTitle location jobType experienceRange salaryRange customQuestions customQuestionsTypes visibility',
    });

    const appliedJobs = candidateDoc.appliedJobs
      .filter((app) => app.jobId)
      .map((app) => ({
        _id: app.jobId._id,
        jobTitle: app.jobId.jobTitle,
        companyName: app.jobId.companyName || 'N/A',
        location: app.jobId.location,
        jobType: app.jobId.jobType,
        experienceLevel: app.jobId.experienceRange?.minExperience !== undefined && app.jobId.experienceRange?.maxExperience !== undefined
          ? `${app.jobId.experienceRange.minExperience}-${app.jobId.experienceRange.maxExperience} years`
          : 'Not specified',
        salary: app.jobId.salaryRange,
        hiringStage: app.hiringStage,
        customQuestions: app.jobId.customQuestions,
        customQuestionsTypes: app.jobId.customQuestionsTypes,
        createdAt: app.jobId.createdAt,
        visibility: app.jobId.visibility,
        applicationDetails: {
          candidateName: app.candidateName,
          candidateEmail: app.candidateEmail,
          phoneNumber: app.phoneNumber,
          currentLocation: app.currentLocation,
          linkedInProfile: app.linkedInProfile,
          gitHubProfile: app.gitHubProfile,
          portfolioWebsite: app.portfolioWebsite,
          highestQualification: app.highestQualification,
          universityName: app.universityName,
          passingYear: app.passingYear,
          isFresher: app.isFresher,
          totalExperience: app.totalExperience,
          previousCompanyName: app.previousCompanyName,
          previousRole: app.previousRole,
          noticePeriod: app.noticePeriod,
          primarySkills: app.primarySkills,
          otherSkills: app.otherSkills,
          resumeUrl: app.resumeUrl,
          whyHireYou: app.whyHireYou,
          currentCTC: app.currentCTC,
          expectedCTC: app.expectedCTC,
          customAnswers: app.customAnswers,
          appliedAt: app.appliedAt,
          offerLetter: app.offerLetter,
          offerStatus: app.offerStatus,
          offerFormData: app.offerFormData,
        },
      }));

    console.log('Applied jobs fetched:', { count: appliedJobs.length });
    res.json(appliedJobs);
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch pending jobs (jobs not yet applied for)
const getPendingJobs = async (req, res) => {
  try {
    const candidate = req.user;
    console.log('Fetching pending jobs for candidate:', { candidateId: candidate._id });

    const candidateDoc = await Candidate.findById(candidate._id);
    const appliedJobIds = candidateDoc.appliedJobs.map((app) => app.jobId.toString());

    const jobs = await Job.find({
      _id: { $nin: appliedJobIds },
      visibility: 'public', // Only show public jobs to candidates
    }).sort({ createdAt: -1 });

    const formattedJobs = jobs.map(job => ({
      ...job._doc,
      experienceLevel: job.experienceRange?.minExperience !== undefined && job.experienceRange?.maxExperience !== undefined
        ? `${job.experienceRange.minExperience}-${job.experienceRange.maxExperience} years`
        : 'Not specified',
      salary: job.salaryRange.minSalary && job.salaryRange.maxSalary
        ? `${job.salaryRange.currency} ${job.salaryRange.minSalary}-${job.salaryRange.maxSalary} ${job.salaryRange.unit}`
        : 'NA',
    }));

    console.log('Pending jobs fetched:', { count: formattedJobs.length });
    res.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching pending jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update candidate hiring stage (admin only)
// Update candidate hiring stage (admin only)
const updateCandidateStatus = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    const { status } = req.body;

    console.log('Updating candidate hiring stage:', { jobId, candidateId, status });

    const validHiringStages = [
      'Sourced', 'Shortlisted', 'On Hold', 'Assessment Phase',
      'Technical Interview', 'HR Round Interview', 'Selection', // Updated stages
      'Offered', 'Offer Accepted', 'Hired'
    ];
    if (!validHiringStages.includes(status)) {
      console.log('Invalid hiring stage:', status);
      return res.status(400).json({ message: `Invalid hiring stage. Must be one of: ${validHiringStages.join(', ')}` });
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

    candidateApplication.hiringStage = status;
    appliedJob.hiringStage = status;

    await Promise.all([job.save(), candidateDoc.save()]);
    console.log('Updated hiring stage:', { jobId, candidateId, hiringStage: status });

    res.json({ message: `Candidate application stage updated to ${status} successfully` });
  } catch (error) {
    console.error('Error updating candidate hiring stage:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Store offer letter and update hiring stage to Offered
const generateOfferLetter = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    const { offerLetter, hiringStage, formData } = req.body;

    console.log('Storing offer letter:', { jobId, candidateId, hiringStage, formData });

    // Validate required fields
    if (!offerLetter || !hiringStage) {
      console.log('Missing offerLetter or hiringStage');
      return res.status(400).json({ message: 'Offer letter and hiring stage are required' });
    }

    if (!formData || !formData.Employee_Designation || !formData.Employee_Joining_Date || 
        !formData.Probation_Period || !formData.Annual_CTC) {
      console.log('Missing formData fields');
      return res.status(400).json({ 
        message: 'Form data (Employee_Designation, Employee_Joining_Date, Probation_Period, Annual_CTC) is required' 
      });
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

    // Store the offer letter and formData in the candidate's application data
    candidateApplication.offerLetter = offerLetter;
    candidateApplication.hiringStage = hiringStage;
    candidateApplication.offerFormData = formData;

    // Log the candidateApplication before saving
    console.log('Candidate application before saving job:', {
      candidateId,
      offerFormData: candidateApplication.offerFormData,
    });

    // Save the job document with error handling
    const savedJob = await job.save().catch(error => {
      console.error('Error saving job document:', error);
      throw new Error('Failed to save offer letter to job document: ' + error.message);
    });

    // Log after saving job document
    console.log('After saving job document:', {
      jobId,
      candidateId,
      offerLetter: candidateApplication.offerLetter,
      offerFormData: candidateApplication.offerFormData,
      hiringStage: candidateApplication.hiringStage,
    });

    // Verify the data was saved to the job document
    const updatedJob = await Job.findById(jobId);
    const updatedCandidateApplication = updatedJob.candidates.find(
      (c) => c.candidateId.toString() === candidateId
    );
    if (!updatedCandidateApplication.offerFormData) {
      console.error('offerFormData not saved to job document:', updatedCandidateApplication);
      throw new Error('offerFormData failed to save to job document');
    }
    console.log('Verified job document after save:', {
      jobId,
      candidateId,
      offerFormData: updatedCandidateApplication.offerFormData,
    });

    const appliedJob = candidateDoc.appliedJobs.find(
      (app) => app.jobId.toString() === jobId
    );
    if (!appliedJob) {
      console.log('Applied job not found in candidate document:', { jobId, candidateId });
      return res.status(404).json({ message: 'Applied job not found in candidate document' });
    }

    appliedJob.hiringStage = hiringStage;
    appliedJob.offerLetter = offerLetter;
    appliedJob.offerFormData = formData;

    // Save the candidate document with error handling
    await candidateDoc.save().catch(error => {
      console.error('Error saving candidate document:', error);
      throw new Error('Failed to save offer letter to candidate document: ' + error.message);
    });

    console.log('After saving candidate document:', {
      jobId,
      candidateId,
      offerLetter: appliedJob.offerLetter,
      offerFormData: appliedJob.offerFormData,
      hiringStage: appliedJob.hiringStage,
    });

    res.json({ 
      message: 'Offer letter stored successfully', 
      offerLetter,
      jobId,
      candidateId,
      candidateDetails: {
        candidateName: candidateApplication.candidateName,
        phoneNumber: candidateApplication.phoneNumber,
        currentLocation: candidateApplication.currentLocation || 'N/A',
        candidateEmail: candidateApplication.candidateEmail,
        expectedCTC: candidateApplication.expectedCTC || 'N/A',
        noticePeriod: candidateApplication.noticePeriod || 'N/A',
      },
      formData,
    });
  } catch (error) {
    console.error('Error storing offer letter:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Update offer status (accept/reject) and hiring stage
const updateOfferStatus = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    const { offerStatus, hiringStage } = req.body;

    console.log('Updating offer status:', { jobId, candidateId, offerStatus, hiringStage });

    const validOfferStatuses = ['accepted', 'rejected'];
    if (!validOfferStatuses.includes(offerStatus)) {
      console.log('Invalid offer status:', offerStatus);
      return res.status(400).json({ message: `Invalid offer status. Must be one of: ${validOfferStatuses.join(', ')}` });
    }

    const validHiringStages = ['Offered', 'Offer Accepted'];
    if (!validHiringStages.includes(hiringStage)) {
      console.log('Invalid hiring stage:', hiringStage);
      return res.status(400).json({ message: `Invalid hiring stage. Must be one of: ${validHiringStages.join(', ')}` });
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

    candidateApplication.hiringStage = hiringStage;
    candidateApplication.offerStatus = offerStatus;
    await job.save();
    console.log('Offer status and hiring stage updated in job document:', { jobId, candidateId, offerStatus, hiringStage });

    const appliedJob = candidateDoc.appliedJobs.find(
      (app) => app.jobId.toString() === jobId
    );
    if (!appliedJob) {
      console.log('Applied job not found in candidate document:', { jobId, candidateId });
      return res.status(404).json({ message: 'Applied job not found in candidate document' });
    }

    appliedJob.hiringStage = hiringStage;
    appliedJob.offerStatus = offerStatus;
    await candidateDoc.save();
    console.log('Offer status and hiring stage updated in candidate document:', { jobId, candidateId, offerStatus, hiringStage });

    res.json({ message: `Offer ${offerStatus} successfully` });
  } catch (error) {
    console.error('Error updating offer status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch candidates for a specific job (admin only)
const getJobCandidates = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching candidates for job:', { jobId: id });

    // Explicitly project all necessary fields from the candidates subdocument
    const job = await Job.findById(id, {
      'candidates.candidateId': 1,
      'candidates.candidateName': 1,
      'candidates.candidateEmail': 1,
      'candidates.phoneNumber': 1,
      'candidates.currentLocation': 1,
      'candidates.linkedInProfile': 1,
      'candidates.gitHubProfile': 1,
      'candidates.portfolioWebsite': 1,
      'candidates.highestQualification': 1,
      'candidates.universityName': 1,
      'candidates.passingYear': 1,
      'candidates.isFresher': 1,
      'candidates.totalExperience': 1,
      'candidates.previousCompanyName': 1,
      'candidates.previousRole': 1,
      'candidates.noticePeriod': 1,
      'candidates.primarySkills': 1,
      'candidates.otherSkills': 1,
      'candidates.resumeUrl': 1,
      'candidates.whyHireYou': 1,
      'candidates.currentCTC': 1,
      'candidates.expectedCTC': 1,
      'candidates.customAnswers': 1,
      'candidates.hiringStage': 1,
      'candidates.appliedAt': 1,
      'candidates.offerLetter': 1,
      'candidates.offerStatus': 1,
      'candidates.offerFormData': 1,
    });

    if (!job) {
      console.log('Job not found:', id);
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Raw job data from database:', {
      jobId: job._id,
      candidates: job.candidates.map(c => ({
        candidateId: c.candidateId,
        offerFormData: c.offerFormData,
        offerLetter: c.offerLetter,
        hiringStage: c.hiringStage,
        offerStatus: c.offerStatus,
      }))
    });

    const formattedCandidates = job.candidates.map(candidate => {
      const candidateData = {
        id: candidate.candidateId.toString(),
        name: candidate.candidateName,
        email: candidate.candidateEmail,
        phoneNumber: candidate.phoneNumber,
        currentLocation: candidate.currentLocation || 'N/A',
        skills: candidate.primarySkills ? (Array.isArray(candidate.primarySkills) ? candidate.primarySkills : candidate.primarySkills.split(',').map(skill => skill.trim())) : [],
        date: new Date(candidate.appliedAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        hiringStage: candidate.hiringStage || 'Sourced',
        offerLetter: candidate.offerLetter || 'Offer letter content not available',
        offerStatus: candidate.offerStatus,
        offerFormData: candidate.offerFormData,
        isNew: (new Date() - new Date(candidate.appliedAt)) / (1000 * 60 * 60 * 24) < 7,
        candidateEmail: candidate.candidateEmail,
        expectedCTC: candidate.expectedCTC || 'N/A',
        noticePeriod: candidate.noticePeriod || 'N/A',
        currentCTC: candidate.currentCTC,
        linkedInProfile: candidate.linkedInProfile,
        gitHubProfile: candidate.gitHubProfile,
        portfolioWebsite: candidate.portfolioWebsite,
        highestQualification: candidate.highestQualification,
        universityName: candidate.universityName,
        passingYear: candidate.passingYear,
        isFresher: candidate.isFresher,
        totalExperience: candidate.totalExperience,
        previousCompanyName: candidate.previousCompanyName,
        previousRole: candidate.previousRole,
        primarySkills: candidate.primarySkills,
        otherSkills: candidate.otherSkills,
        resumeUrl: candidate.resumeUrl,
        whyHireYou: candidate.whyHireYou,
      };

      console.log(`Final candidate data for ${candidateData.id}:`, candidateData);
      return candidateData;
    });

    console.log('Candidates fetched:', { count: formattedCandidates.length, candidates: formattedCandidates });
    res.json(formattedCandidates);
  } catch (error) {
    console.error('Error fetching job candidates:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle job visibility (admin/HR only)
const toggleJobVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Toggle job visibility attempt:', { jobId: id, user: req.user });

    if (!req.user || !req.user.id) {
      console.log('No authenticated user found:', { user: req.user });
      return res.status(401).json({ message: 'Unauthorized: No user authenticated' });
    }

    const job = await Job.findById(id);
    if (!job) {
      console.log('Job not found:', id);
      return res.status(404).json({ message: 'Job not found' });
    }

    // Toggle visibility: 'public' <-> 'private'
    job.visibility = job.visibility === 'public' ? 'private' : 'public';
    await job.save();

    console.log('Job visibility toggled successfully:', { jobId: id, visibility: job.visibility });
    res.json({ message: `Job visibility set to ${job.visibility} successfully`, visibility: job.visibility });
  } catch (error) {
    console.error('Error toggling job visibility:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  applyForJob,
  getAppliedJobs,
  getPendingJobs,
  updateCandidateStatus,
  generateOfferLetter,
  updateOfferStatus,
  getJobCandidates,
  toggleJobVisibility,
};