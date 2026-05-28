const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const appliedJobSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
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

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: {
    country: { type: String },
    city: { type: String },
    postalCode: { type: String },
  },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  password: { type: String, required: true },
  role: { type: String, default: "candidate" },
  appliedJobs: [appliedJobSchema],
});

candidateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log("Pre-save hook - Raw password:", this.password);
  this.password = await bcrypt.hash(this.password, 10);
  console.log("Pre-save hook - Hashed password:", this.password);
  next();
});

candidateSchema.methods.matchPassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  console.log("matchPassword result:", { password, isMatch });
  return isMatch;
};

module.exports = mongoose.model("Candidate", candidateSchema);