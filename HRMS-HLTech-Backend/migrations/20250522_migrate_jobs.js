const mongoose = require('mongoose');
const Job = require('../models/Job');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Hrms-HlTech');

const migrateJobs = async () => {
  try {
    const jobs = await Job.find();
    console.log(`Found ${jobs.length} jobs to migrate.`);

    for (const job of jobs) {
      // Migrate experienceLevel to experienceRange
      let minExperience = 0;
      let maxExperience = 0;

      if (job.experienceLevel) {
        try {
          const [minExp, maxExp] = job.experienceLevel.replace(' years', '').split('-').map(val => Number(val.trim()));
          minExperience = isNaN(minExp) ? 0 : minExp;
          maxExperience = isNaN(maxExp) ? minExperience : maxExp;
          // Ensure maxExperience is at least minExperience
          if (maxExperience < minExperience) {
            maxExperience = minExperience;
          }
        } catch (error) {
          console.log(`Error parsing experienceLevel for job ID ${job._id}: ${job.experienceLevel}. Using defaults.`, error);
          minExperience = 0;
          maxExperience = 0;
        }
      } else {
        console.log(`No experienceLevel for job ID ${job._id}. Using defaults.`);
        minExperience = 0;
        maxExperience = 0;
      }

      // Ensure maxExperience is at least 1 to satisfy validation (if minExperience is 0)
      if (minExperience === 0 && maxExperience === 0) {
        maxExperience = 1; // Set a minimal valid range (0-1 years)
      }

      job.experienceRange = {
        minExperience: minExperience,
        maxExperience: maxExperience,
      };

      // Migrate salary to salaryRange
      if (job.salary && job.salary !== 'NA') {
        try {
          const [currency, range, unit] = job.salary.split(' ');
          const [minSalary, maxSalary] = range.split('-').map(val => val.trim());
          job.salaryRange = {
            currency: currency || 'INR ₹',
            minSalary: minSalary || '',
            maxSalary: maxSalary || '',
            unit: unit || 'Per Year',
            hideSalary: false,
          };
        } catch (error) {
          console.log(`Error parsing salary for job ID ${job._id}: ${job.salary}. Using defaults.`, error);
          job.salaryRange = {
            currency: 'INR ₹',
            minSalary: '',
            maxSalary: '',
            unit: 'Per Year',
            hideSalary: false,
          };
        }
      } else {
        job.salaryRange = {
          currency: 'INR ₹',
          minSalary: '',
          maxSalary: '',
          unit: 'Per Year',
          hideSalary: false,
        };
      }

      // Remove deprecated fields
      job.description = undefined;
      job.experienceLevel = undefined;
      job.salary = undefined;

      // Save the job with validation disabled to bypass constraints temporarily
      await job.save({ validateBeforeSave: false });
      console.log(`Migrated job ID: ${job._id}`);

      // Re-validate the document to ensure it meets schema requirements
      job.experienceRange = {
        minExperience: job.experienceRange.minExperience || 0,
        maxExperience: job.experienceRange.maxExperience || 1,
      };
      if (job.experienceRange.maxExperience < job.experienceRange.minExperience) {
        job.experienceRange.maxExperience = job.experienceRange.minExperience;
      }
      await job.save(); // Save again with validation enabled
      console.log(`Re-validated and saved job ID: ${job._id}`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run the migration
migrateJobs();