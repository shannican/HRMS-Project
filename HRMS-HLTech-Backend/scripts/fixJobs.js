const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' }); // Adjusted path for scripts/ folder

const fixJobs = async () => {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not set in .env file');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check for admin user
    console.log('Searching for admin user');
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating default admin user.');
      adminUser = new User({
        fullName: 'Default Admin',
        email: 'admin@default.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      });
      await adminUser.save();
      console.log('Default admin user created:', { userId: adminUser._id, email: adminUser.email });
    } else {
      console.log('Admin user found:', { userId: adminUser._id, email: adminUser.email });
    }

    // Find jobs missing postedBy
    console.log('Querying jobs missing postedBy');
    const jobs = await Job.find({ $or: [{ postedBy: { $exists: false } }, { postedBy: null }] });
    console.log('Jobs missing postedBy:', { count: jobs.length });

    if (jobs.length === 0) {
      console.log('No jobs need updating');
      return;
    }

    // Update jobs
    let updatedCount = 0;
    for (const job of jobs) {
      try {
        job.postedBy = adminUser._id;
        await job.save();
        console.log('Updated job:', { jobId: job._id, postedBy: adminUser._id });
        updatedCount++;
      } catch (error) {
        console.error('Error updating job:', { jobId: job._id, error: error.message });
      }
    }

    // Specifically check the problematic job
    const problematicJobId = '6821c3b1f9a4d2c13d41419b';
    const jobCheck = await Job.findById(problematicJobId);
    if (jobCheck && jobCheck.postedBy) {
      console.log('Problematic job verified:', { jobId: problematicJobId, postedBy: jobCheck.postedBy });
    } else {
      console.error('Problematic job still missing postedBy:', { jobId: problematicJobId });
    }

    console.log('Job update complete:', { updated: updatedCount, total: jobs.length });
  } catch (error) {
    console.error('Error in fixJobs:', error.message);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Execute the script
fixJobs();