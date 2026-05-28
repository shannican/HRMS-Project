const mongoose = require("mongoose");

const employeeKYCSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  employeeType: {
    type: String,
    enum: ["Full-Time", "Intern"],
  },
  photo: {
    type: String,
  },
  aadhar: {
    number: String,
    frontImage: String,
    backImage: String,
  },
  pan: {
    number: String,
    frontImage: String,
  },
  highestQualification: {
    university: String,
    branch: String,
    enrollmentNumber: String,
    cgpa: String,
    educationType: {
      type: String,
      enum: ["Graduate", "Non-Graduate"],
    },
    passoutYear: String,
    batchDuration: String,
    degreeCertificate: String,
  },
  twelfth: {
    schoolName: String,
    percentage: String,
    passoutYear: String,
    rollNo: String,
    marksheet: String,
  },
  tenth: {
    schoolName: String,
    percentage: String,
    passoutYear: String,
    rollNo: String,
    marksheet: String,
  },
  salaryCompanyName: String,
  salarySlip: String,
  experienceLetter: {
    companyName: String,
    experienceYear: String,
    currentCTC: String,
    letterFile: String,
  },
  bankAccount: {
    accountHolderName: String,
    ifscCode: String,
    accountNumber: String,
    address: String,
    bankBranchName: String,
  },
  employeeSignature: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  rejectionReason: {
    type: String,
    default: "",
  },
  agreementStatus: {
    type: String,
    enum: ["Not Uploaded", "Uploaded", "Accepted"],
    default: "Not Uploaded",
  },
  agreementUrl: {
    type: String,
    default: "",
  },
  agreementAccepted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

employeeKYCSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("EmployeeKYC", employeeKYCSchema);