const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  candidateName: {
    type: String,
    required: true,
  },
  candidateEmail: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  currentLocation: {
    type: String,
  },
  linkedInProfile: {
    type: String,
  },
  gitHubProfile: {
    type: String,
  },
  portfolioWebsite: {
    type: String,
  },
  highestQualification: {
    type: String,
    required: true,
  },
  universityName: {
    type: String,
    required: true,
  },
  passingYear: {
    type: Number,
    required: true,
  },
  isFresher: {
    type: Boolean,
    required: true,
  },
  totalExperience: {
    type: Number,
  },
  previousCompanyName: {
    type: String,
  },
  previousRole: {
    type: String,
  },
  noticePeriod: {
    type: String,
    enum: ['Immediate', '15 Days', '30 Days', '60+ Days', ''],
  },
  primarySkills: {
    type: String,
    required: true,
  },
  otherSkills: {
    type: String,
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  whyHireYou: {
    type: String,
  },
  currentCTC: {
    type: Number,
  },
  expectedCTC: {
    type: Number,
  },
  hiringStage: {
   type: String,
    enum: [
      'Sourced', 'Shortlisted', 'On Hold', 'Assessment Phase',
      'Technical Interview', 'HR Round Interview', 'Selection', // Updated stages
      'Offered', 'Offer Accepted', 'Hired'
    ],
    default: 'Sourced',
  },
  offerLetter: String,
  offerStatus: {
    type: String,
    enum: ['accepted', 'rejected'],
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  customAnswers: { type: Map, of: String },
  offerFormData: {
    Employee_Designation: { type: String },
    Employee_Joining_Date: { type: String },
    Probation_Period: { type: String },
    Annual_CTC: { type: String },
  },
});

const jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
    enum: ['Full-Time', 'Part-Time', 'Freelance', 'Internship', 'Contract'],
  },
  experienceRange: {
    minExperience: {
      type: Number,
      required: false,
    },
    maxExperience: {
      type: Number,
      required: false,
    },
  },
  salaryRange: {
    currency: {
      type: String,
      required: true,
      enum: ['INR ₹', 'USD $', 'EUR €'],
      default: 'INR ₹',
    },
    minSalary: {
      type: String,
      required: false,
    },
    maxSalary: {
      type: String,
      required: false,
    },
    unit: {
      type: String,
      required: true,
      enum: ['Per Year', 'Per Month', 'Per Hour'],
      default: 'Per Year',
    },
    hideSalary: {
      type: Boolean,
      default: false,
    },
  },
  responsibilities: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  customQuestions: {
    type: [String],
    default: [],
  },
  customQuestionsTypes: [{ type: String }],
  candidates: [candidateSchema],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  visibility: { // New field for visibility
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
}, { timestamps: true });

// Add pre-save middleware to debug saving issues
jobSchema.pre('save', function(next) {
  console.log('Pre-save hook for Job document:', {
    jobId: this._id,
    candidates: this.candidates.map(c => ({
      candidateId: c.candidateId,
      offerFormData: c.offerFormData,
    })),
  });
  next();
});

module.exports = mongoose.model('Job', jobSchema);