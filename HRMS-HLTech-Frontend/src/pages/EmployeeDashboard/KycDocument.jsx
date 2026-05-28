import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../context/authHooks";
import toast from "react-hot-toast";
import { FiCheck, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/axiosInstance";
function KycDocument() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [kycStatus, setKycStatus] = useState("Not Started");
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [showCompletedPopup, setShowCompletedPopup] = useState(false);
  const [employmentType, setEmploymentType] = useState("");
  const [photo, setPhoto] = useState(null);
  const [aadharNumber, setAadharNumber] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [frontImageName, setFrontImageName] = useState("");
  const [backImage, setBackImage] = useState(null);
  const [backImageName, setBackImageName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [panFrontImage, setPanFrontImage] = useState(null);
  const [panFrontImageName, setPanFrontImageName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [qualificationStatus, setQualificationStatus] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [batchDuration, setBatchDuration] = useState("");
  const [degreeCertificate, setDegreeCertificate] = useState(null);
  const [degreeCertificateName, setDegreeCertificateName] = useState("");
  const [twelfthSchoolName, setTwelfthSchoolName] = useState("");
  const [twelfthPercentage, setTwelfthPercentage] = useState("");
  const [twelfthPassoutYear, setTwelfthPassoutYear] = useState("");
  const [twelfthRollNumber, setTwelfthRollNumber] = useState("");
  const [twelfthMarksheet, setTwelfthMarksheet] = useState(null);
  const [twelfthMarksheetName, setTwelfthMarksheetName] = useState("");
  const [tenthSchoolName, setTenthSchoolName] = useState("");
  const [tenthPercentage, setTenthPercentage] = useState("");
  const [tenthPassoutYear, setTenthPassoutYear] = useState("");
  const [tenthRollNumber, setTenthRollNumber] = useState("");
  const [tenthMarksheet, setTenthMarksheet] = useState(null);
  const [tenthMarksheetName, setTenthMarksheetName] = useState("");
  const [salaryCompanyName, setSalaryCompanyName] = useState("");
  const [salarySlip, setSalarySlip] = useState(null);
  const [salarySlipName, setSalarySlipName] = useState("");
  const [expCompanyName, setExpCompanyName] = useState("");
  const [expYear, setExpYear] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [experienceLetter, setExperienceLetter] = useState(null);
  const [experienceLetterName, setExperienceLetterName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [employeeSignature, setEmployeeSignature] = useState(null);
  const [employeeSignatureName, setEmployeeSignatureName] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const hasFetchedKycStatus = useRef(false); // Track initial KYC status fetch
  const refreshKycStatus = useCallback(async () => {
    if (!user || !user.userId || hasFetchedKycStatus.current) {
      console.error("Skipping refreshKycStatus: No user, userId, or already fetched", {
        user: !!user,
        userId: user?.userId,
        hasFetched: hasFetchedKycStatus.current,
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.get(
        `http://localhost:5000/api/kyc/status/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const status = response.data.status;
      console.log("Refreshed KYC status:", status);
      setKycStatus(status);
      hasFetchedKycStatus.current = true; // Mark as fetched
      if (status === "Approved") {
        setShowCompletedPopup(true);
      } else if (status === "Rejected") {
        toast.error("Your KYC has been rejected. Please resubmit your documents.");
        setStep(1);
        setCompletedSteps([]);
      }
    } catch (error) {
      console.error("Error refreshing KYC status:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to check KYC status");
    }
  }, [user]);
  useEffect(() => {
    if (!user || !user.userId) {
      console.error("User or userId is undefined:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    if (!user.fullName) {
      console.warn("User object does not contain fullName:", user);
      toast.error("User profile incomplete. Please update your profile with your full name.");
    }
    refreshKycStatus();
    const handleKycStatusUpdated = () => {
      console.log("kycStatusUpdated event received in KycDocument, re-fetching status...");
      hasFetchedKycStatus.current = false; // Allow re-fetch on event
      refreshKycStatus();
    };
    window.addEventListener("kycStatusUpdated", handleKycStatusUpdated);
    return () => {
      window.removeEventListener("kycStatusUpdated", handleKycStatusUpdated);
    };
  }, [user, navigate, refreshKycStatus]);
  const handleEmploymentTypeSelect = (type) => {
    setEmploymentType(type);
  };
  const handleStep1Submit = async () => {
    if (!employmentType) {
      toast.error("Please select your employment type");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleStep1Submit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("employeeType", employmentType);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      setCompletedSteps((prev) => {
        const newCompletedSteps = [...new Set([...prev, 1])]; // Use Set to avoid duplicates
        console.log("Step 1 completed. New completedSteps:", newCompletedSteps);
        return newCompletedSteps;
      });
      setStep(2);
      console.log("Moving to Step 2");
      hasFetchedKycStatus.current = false; // Allow re-fetch
      await refreshKycStatus();
    } catch (error) {
      console.error("Error saving employment type:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to save employment type");
    }
  };
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      toast.error("Failed to access webcam. Please allow camera permissions.");
    }
  };
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  useEffect(() => {
    if (step === 2) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL("image/jpeg");
    setPhoto(photoDataUrl);
    stopCamera();
  };
  const handleStep2Next = async () => {
    if (!photo) {
      toast.error("Please capture a photo before proceeding");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleStep2Next:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("employeeType", employmentType);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const blob = await fetch(photo).then((res) => res.blob());
      const photoFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
      formData.append("photo", photoFile);
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      setCompletedSteps((prev) => {
        const newCompletedSteps = [...new Set([...prev, 2])];
        console.log("Step 2 completed. New completedSteps:", newCompletedSteps);
        return newCompletedSteps;
      });
      setStep(3);
      console.log("Moving to Step 3");
      hasFetchedKycStatus.current = false; // Allow re-fetch
      await refreshKycStatus();
    } catch (error) {
      console.error("Error saving photo:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to save photo");
    }
  };
  const updateCompletedStepsAfterDocumentSave = async () => {
    if (!completedSteps.includes(3)) {
      setCompletedSteps((prev) => {
        const newCompletedSteps = [...new Set([...prev, 3])];
        console.log("Step 3 section saved. New completedSteps:", newCompletedSteps);
        return newCompletedSteps;
      });
    }
    hasFetchedKycStatus.current = false; // Allow re-fetch
    await refreshKycStatus();
  };
  const handleAadharSubmit = async (e) => {
    e.preventDefault();
    if (!aadharNumber) {
      toast.error("Please enter your Aadhar number");
      return;
    }
    if (!frontImage) {
      toast.error("Please upload the front image of your Aadhar");
      return;
    }
    if (!backImage) {
      toast.error("Please upload the back image of your Aadhar");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(frontImage.type) || !allowedTypes.includes(backImage.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (frontImage.size > maxSize || backImage.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleAadharSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("number", aadharNumber);
      formData.append("frontImage", frontImage);
      formData.append("backImage", backImage);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/aadhar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading Aadhar details:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload Aadhar details");
      setFrontImage(null);
      setBackImage(null);
      setFrontImageName("");
      setBackImageName("");
    }
  };
  const handlePanSubmit = async (e) => {
    e.preventDefault();
    if (!panNumber) {
      toast.error("Please enter your Pan number");
      return;
    }
    if (!panFrontImage) {
      toast.error("Please upload the front image of your Pan");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(panFrontImage.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (panFrontImage.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handlePanSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("number", panNumber);
      formData.append("frontImage", panFrontImage);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/pan",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading Pan details:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload Pan details");
      setPanFrontImage(null);
      setPanFrontImageName("");
    }
  };
  const handleQualificationSubmit = async (e) => {
    e.preventDefault();
    if (!universityName) {
      toast.error("Please enter your University name");
      return;
    }
    if (!branchName) {
      toast.error("Please enter your Branch name");
      return;
    }
    if (!enrollmentNo) {
      toast.error("Please enter your Enrollment No.");
      return;
    }
    if (!cgpa) {
      toast.error("Please enter your CGPA");
      return;
    }
    if (!qualificationStatus) {
      toast.error("Please select your qualification status");
      return;
    }
    if (qualificationStatus === "Graduate" && !passoutYear) {
      toast.error("Please enter your Passout Year");
      return;
    }
    if (qualificationStatus === "Non-Graduate" && !batchDuration) {
      toast.error("Please enter your Batch Duration");
      return;
    }
    if (!degreeCertificate) {
      toast.error("Please upload your Degree certificate");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(degreeCertificate.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (degreeCertificate.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleQualificationSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("university", universityName);
      formData.append("branch", branchName);
      formData.append("enrollmentNumber", enrollmentNo);
      formData.append("cgpa", cgpa);
      formData.append("educationType", qualificationStatus);
      if (qualificationStatus === "Graduate") {
        formData.append("passoutYear", passoutYear);
      } else {
        formData.append("batchDuration", batchDuration);
      }
      formData.append("degreeCertificate", degreeCertificate);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/qualification",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading Highest Qualification details:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload Highest Qualification details");
      setDegreeCertificate(null);
      setDegreeCertificateName("");
    }
  };
  const handleTwelfthSubmit = async (e) => {
    e.preventDefault();
    if (!twelfthSchoolName) {
      toast.error("Please enter your 12th School name");
      return;
    }
    if (!twelfthPercentage) {
      toast.error("Please enter your 12th Total Percentage");
      return;
    }
    if (!twelfthPassoutYear) {
      toast.error("Please enter your 12th Passout Year");
      return;
    }
    if (!twelfthRollNumber) {
      toast.error("Please enter your 12th Roll Number");
      return;
    }
    if (!twelfthMarksheet) {
      toast.error("Please upload your 12th Marksheet");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(twelfthMarksheet.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (twelfthMarksheet.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleTwelfthSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("schoolName", twelfthSchoolName);
      formData.append("percentage", twelfthPercentage);
      formData.append("passoutYear", twelfthPassoutYear);
      formData.append("rollNo", twelfthRollNumber);
      formData.append("twelfthMarksheet", twelfthMarksheet);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/twelfth",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading 12th Standard details:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload 12th Standard details");
      setTwelfthMarksheet(null);
      setTwelfthMarksheetName("");
    }
  };
  const handleTenthSubmit = async (e) => {
    e.preventDefault();
    if (!tenthSchoolName) {
      toast.error("Please enter your 10th School name");
      return;
    }
    if (!tenthPercentage) {
      toast.error("Please enter your 10th Total Percentage");
      return;
    }
    if (!tenthPassoutYear) {
      toast.error("Please enter your 10th Passout Year");
      return;
    }
    if (!tenthRollNumber) {
      toast.error("Please enter your 10th Roll Number");
      return;
    }
    if (!tenthMarksheet) {
      toast.error("Please upload your 10th Marksheet");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(tenthMarksheet.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (tenthMarksheet.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleTenthSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("schoolName", tenthSchoolName);
      formData.append("percentage", tenthPercentage);
      formData.append("passoutYear", tenthPassoutYear);
      formData.append("rollNo", tenthRollNumber);
      formData.append("tenthMarksheet", tenthMarksheet);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/tenth",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading 10th Standard details:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload 10th Standard details");
      setTenthMarksheet(null);
      setTenthMarksheetName("");
    }
  };
  const handleSalarySlipSubmit = async (e) => {
    e.preventDefault();
    if (!salaryCompanyName) {
      toast.error("Please enter the Company name");
      return;
    }
    if (!salarySlip) {
      toast.error("Please upload your Salary Slip");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(salarySlip.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (salarySlip.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleSalarySlipSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("salaryCompanyName", salaryCompanyName);
      formData.append("salarySlip", salarySlip);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/salarySlip",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading Salary Slip details:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload Salary Slip details");
      setSalarySlip(null);
      setSalarySlipName("");
    }
  };
  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!accountHolderName) {
      toast.error("Please enter the Account Holder Name");
      return;
    }
    if (!ifscCode) {
      toast.error("Please enter the IFSC Code");
      return;
    }
    if (!accountNumber) {
      toast.error("Please enter the Account Number");
      return;
    }
    if (!confirmAccountNumber) {
      toast.error("Please confirm the Account Number");
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      toast.error("Account Number and Confirm Account Number do not match");
      return;
    }
    if (!bankAddress) {
      toast.error("Please enter the Bank Address");
      return;
    }
    if (!bankBranchName) {
      toast.error("Please enter the Bank Branch Name");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleBankDetailsSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("accountHolderName", accountHolderName);
      formData.append("ifscCode", ifscCode);
      formData.append("accountNumber", accountNumber);
      formData.append("confirmAccountNumber", confirmAccountNumber);
      formData.append("address", bankAddress);
      formData.append("bankBranchName", bankBranchName);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/bankAccount",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      setAccountHolderName("");
      setIfscCode("");
      setAccountNumber("");
      setConfirmAccountNumber("");
      setBankAddress("");
      setBankBranchName("");
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading Bank Account details:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload Bank Account details");
      setAccountHolderName("");
      setIfscCode("");
      setAccountNumber("");
      setConfirmAccountNumber("");
      setBankAddress("");
      setBankBranchName("");
    }
  };
  const handleExperienceLetterSubmit = async (e) => {
    e.preventDefault();
    if (!expCompanyName) {
      toast.error("Please enter the Company name");
      return;
    }
    if (!expYear) {
      toast.error("Please enter your Experience Year");
      return;
    }
    if (!currentCtc) {
      toast.error("Please enter your Current CTC");
      return;
    }
    if (!experienceLetter) {
      toast.error("Please upload your Experience Letter");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(experienceLetter.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (experienceLetter.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleExperienceLetterSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("companyName", expCompanyName);
      formData.append("experienceYear", expYear);
      formData.append("currentCTC", currentCtc);
      formData.append("experienceLetter", experienceLetter);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/experienceLetter",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading Experience Letter details:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload Experience Letter details");
      setExperienceLetter(null);
      setExperienceLetterName("");
    }
  };
  const handleEmployeeSignatureSubmit = async (e) => {
    e.preventDefault();
    if (!employeeSignature) {
      toast.error("Please upload your Employee Signature");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(employeeSignature.type)) {
      toast.error("Only JPG and PNG files are allowed for the signature");
      return;
    }
    const maxSize = 2 * 1024 * 1024;
    if (employeeSignature.size > maxSize) {
      toast.error("File size exceeds 2MB limit");
      return;
    }
    if (!user || !user.userId) {
      console.error("User or userId is undefined in handleEmployeeSignatureSubmit:", user);
      toast.error("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeId", user.userId);
      formData.append("employeeSignature", employeeSignature);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        toast.error("No token found for user");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/kyc/save/employeeSignature",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      const submitResponse = await axios.post(
        "http://localhost:5000/api/kyc/submit",
        { employeeId: user.userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(submitResponse.data.message);
      setShowPendingPopup(true);
      setKycStatus("Pending");
      await updateCompletedStepsAfterDocumentSave();
    } catch (error) {
      console.error("Error uploading Employee Signature or submitting KYC:", error, error.stack);
      toast.error(error.response?.data?.message || "Failed to upload Employee Signature or submit KYC");
      setEmployeeSignature(null);
      setEmployeeSignatureName("");
    }
  };
  const handleFrontImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImage(file);
      setFrontImageName(file.name);
    }
  };
  const handleBackImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackImage(file);
      setBackImageName(file.name);
    }
  };
  const handlePanFrontImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPanFrontImage(file);
      setPanFrontImageName(file.name);
    }
  };
  const handleDegreeCertificateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDegreeCertificate(file);
      setDegreeCertificateName(file.name);
    }
  };
  const handleTwelfthMarksheetUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTwelfthMarksheet(file);
      setTwelfthMarksheetName(file.name);
    }
  };
  const handleTenthMarksheetUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTenthMarksheet(file);
      setTenthMarksheetName(file.name);
    }
  };
  const handleSalarySlipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSalarySlip(file);
      setSalarySlipName(file.name);
    }
  };
  const handleExperienceLetterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExperienceLetter(file);
      setExperienceLetterName(file.name);
    }
  };
  const handleEmployeeSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEmployeeSignature(file);
      setEmployeeSignatureName(file.name);
    }
  };
  return (
    <div className="min-h-screen min-w-[99vw] sm:min-w-full bg-gray-50 p-4 sm:p-8">
      <div className="max-w-full sm:max-w-4xl mx-auto">
        {/* Step Progress Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center mb-8 sm:mb-12 space-y-4 sm:space-y-0 sm:space-x-0 w-full">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center w-full sm:w-1/3 justify-center sm:justify-start">
              <div className="flex items-center w-full sm:w-auto">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 transition-all duration-300">
                  {completedSteps.includes(stepNum) ? (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center border-2 border-green-600">
                      <FiCheck className="text-white text-sm" />
                    </div>
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step === stepNum ? "bg-indigo-600 border-indigo-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          step === stepNum ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {stepNum}
                      </span>
                    </div>
                  )}
                </div>
                <p
                  className={`ml-2 text-sm font-medium sm:text-center flex-1 ${
                    completedSteps.includes(stepNum)
                      ? "text-green-600"
                      : step === stepNum
                      ? "text-indigo-600"
                      : "text-gray-500"
                  }`}
                >
                  {stepNum === 1
                    ? "Employment Type"
                    : stepNum === 2
                    ? "Photo ID"
                    : "Document Verification"}
                </p>
              </div>
              {stepNum < 3 && (
                <div
                  className={`w-full sm:w-24 h-1 mt-2 sm:mt-1 sm:ml-4 ${
                    completedSteps.includes(stepNum + 1)
                      ? "bg-green-600"
                      : step > stepNum
                      ? "bg-indigo-600"
                      : "bg-gray-200"
                  } rounded-full transition-all duration-300 sm:flex-1`}
                ></div>
              )}
            </div>
          ))}
        </div>
        {/* Step 1: Employment Type */}
        {step === 1 && (
          <div className="bg-white rounded-xl w-full sm:max-w-[40vw] mx-auto shadow-md p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Domestic KYC</h1>
              <button
                onClick={() => navigate("/employee/kyc-details")}
                className="text-indigo-600 hover:underline text-sm font-medium mt-2 sm:mt-0"
              >
                View Current KYC Details
              </button>
            </div>
            <hr className="border-gray-200 mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-[20px] font-bold text-gray-800 mb-1">
              Please confirm your employment type
            </h3>
            <p className="text-gray-500 text-sm mb-6 sm:mb-8">
              Select the structure under which you are employed
            </p>
            <div className="space-y-4 mb-6 sm:mb-8">
              <label className="flex items-center p-4 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="employmentType"
                  value="Full-Time"
                  checked={employmentType === "Full-Time"}
                  onChange={() => handleEmploymentTypeSelect("Full-Time")}
                  className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    Full-Time
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Permanent employee with full benefits
                  </p>
                </div>
              </label>
              <label className="flex items-center p-4 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="employmentType"
                  value="Intern"
                  checked={employmentType === "Intern"}
                  onChange={() => handleEmploymentTypeSelect("Intern")}
                  className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    Intern
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Temporary role for learning and experience
                  </p>
                </div>
              </label>
            </div>
            <button
              onClick={handleStep1Submit}
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all text-sm sm:text-base"
            >
              Submit
            </button>
          </div>
        )}
        {/* Step 2: Photo ID */}
        {step === 2 && (
          <div className="bg-white rounded-xl w-full sm:max-w-[30vw] mx-auto shadow-md p-6 sm:p-10">
            <h3 className="text-lg sm:text-[20px] font-bold text-gray-800 mb-1">
              Photo Identification
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">
              Please capture your photo for identity verification
            </p>
            <hr className="border-gray-200 mb-4 sm:mb-6" />
            <div className="mb-6 sm:mb-8">
              {photo ? (
                <div className="flex flex-col items-center">
                  <img
                    src={photo}
                    alt="Captured Photo"
                    className="w-32 sm:w-48 h-32 sm:h-48 object-cover rounded-lg mb-4 border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      setPhoto(null);
                      startCamera();
                    }}
                    className="text-indigo-600 hover:underline text-xs sm:text-sm font-medium"
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-full sm:w-[80vw] h-48 sm:h-[40vh] rounded-lg mb-4 border border-gray-200"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <button
                    onClick={capturePhoto}
                    className="py-2 px-4 sm:px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all text-xs sm:text-sm"
                  >
                    Click Photo
                  </button>
                </div>
              )}
            </div>
            {photo && (
              <button
                onClick={handleStep2Next}
                className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all text-sm sm:text-base"
              >
                Next
              </button>
            )}
          </div>
        )}
        {/* Step 3: Document Verification */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                KYC Verification
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                Please upload clear copies of the required documents to complete your KYC process.
              </p>
            </div>
            {/* Aadhar Section */}
            <div className="bg-white rounded-xl w-full shadow-md p-6 sm:p-8 border-2 border-purple-600">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">Aadhar</h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    Document Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Aadhar number"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 bg-gray-50">
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={handleFrontImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <FiUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
                      <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                        {frontImageName || "Upload Front Image"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Supports: JPG, PNG, PDF</p>
                      <p className="text-gray-400 text-xs">Max size: 5MB</p>
                    </div>
                  </div>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 bg-gray-50">
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={handleBackImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <FiUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
                      <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                        {backImageName || "Upload Back Image"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Supports: JPG, PNG, PDF</p>
                      <p className="text-gray-400 text-xs">Max size: 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAadharSubmit}
                  className="py-2 px-4 sm:px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-xs sm:text-sm"
                >
                  Save Aadhar
                </button>
              </div>
            </div>
            {/* Pan Section */}
            <div className="bg-white rounded-xl w-full shadow-md p-6 sm:p-8 border-2 border-purple-600">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">Pan</h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    Document Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Pan number"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 bg-gray-50">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handlePanFrontImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
                    <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                      {panFrontImageName || "Front Image"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Supports: JPG, PNG, PDF</p>
                    <p className="text-gray-400 text-xs">Max size: 5MB</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handlePanSubmit}
                  className="py-2 px-4 sm:px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-xs sm:text-sm"
                >
                  Save Pan
                </button>
              </div>
            </div>
            {/* Highest Qualification Section */}
            <div className="bg-white rounded-xl w-full shadow-md p-6 sm:p-8 border-2 border-purple-600">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    Highest Qualification
                  </h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      University Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter University name"
                      value={universityName}
                      onChange={(e) => setUniversityName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Branch name"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Enrollment No.
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Enrollment No."
                      value={enrollmentNo}
                      onChange={(e) => setEnrollmentNo(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      CGPA
                    </label>
                    <input
                      type="text"
                      placeholder="Enter CGPA"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Qualification Status
                    </label>
                    <select
                      value={qualificationStatus}
                      onChange={(e) => setQualificationStatus(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    >
                      <option value="">Select Status</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Non-Graduate">Non-Graduate</option>
                    </select>
                  </div>
                  {qualificationStatus === "Graduate" && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                        Passout Year
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Passout Year"
                        value={passoutYear}
                        onChange={(e) => setPassoutYear(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                      />
                    </div>
                  )}
                  {qualificationStatus === "Non-Graduate" && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                        Batch Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 2022–26"
                        value={batchDuration}
                        onChange={(e) => setBatchDuration(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                      />
                    </div>
                  )}
                </div>
                <div className="relative border-2 border-dashed border-purple-600 rounded-lg p-4 sm:p-6 bg-gray-50 hover:bg-purple-50 transition-all duration-300">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleDegreeCertificateUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
                    <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                      {degreeCertificateName || "Upload Degree Certificate"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Supports: JPG, PNG, PDF</p>
                    <p className="text-gray-400 text-xs">Max size: 5MB</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleQualificationSubmit}
                  className="py-2 px-4 sm:px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-xs sm:text-sm"
                >
                  Save Degree
                </button>
              </div>
            </div>
            {/* 12th Standard Section */}
            <div className="bg-white rounded-xl w-full shadow-md p-6 sm:p-8 border-2 border-purple-600">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    12th Standard
                  </h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      School Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 12th School name"
                      value={twelfthSchoolName}
                      onChange={(e) => setTwelfthSchoolName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Total Percentage
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Total Percentage"
                      value={twelfthPercentage}
                      onChange={(e) => setTwelfthPercentage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Passout Year
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Passout Year"
                      value={twelfthPassoutYear}
                      onChange={(e) => setTwelfthPassoutYear(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Roll Number"
                      value={twelfthRollNumber}
                      onChange={(e) => setTwelfthRollNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                </div>
                <div className="relative border-2 border-dashed border-purple-600 rounded-lg p-4 sm:p-6 bg-gray-50 hover:bg-purple-50 transition-all duration-300">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleTwelfthMarksheetUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
                    <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                      {twelfthMarksheetName || "Upload 12th Marksheet"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Supports: JPG, PNG, PDF</p>
                    <p className="text-gray-400 text-xs">Max size: 5MB</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleTwelfthSubmit}
                  className="py-2 px-4 sm:px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-xs sm:text-sm"
                >
                  Save 12th Standard
                </button>
              </div>
            </div>
            {/* 10th Standard Section */}
            <div className="bg-white rounded-xl w-full shadow-md p-6 sm:p-8 border-2 border-purple-600">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    10th Standard
                  </h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      School Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 10th School name"
                      value={tenthSchoolName}
                      onChange={(e) => setTenthSchoolName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Total Percentage
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Total Percentage"
                      value={tenthPercentage}
                      onChange={(e) => setTenthPercentage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Passout Year
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Passout Year"
                      value={tenthPassoutYear}
                      onChange={(e) => setTenthPassoutYear(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Roll Number"
                      value={tenthRollNumber}
                      onChange={(e) => setTenthRollNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                </div>
                <div className="relative border-2 border-dashed border-purple-600 rounded-lg p-4 sm:p-6 bg-gray-50 hover:bg-purple-50 transition-all duration-300">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleTenthMarksheetUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
                    <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                      {tenthMarksheetName || "Upload 10th Marksheet"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Supports: JPG, PNG, PDF</p>
                    <p className="text-gray-400 text-xs">Max size: 5MB</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleTenthSubmit}
                  className="py-2 px-4 sm:px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-xs sm:text-sm"
                >
                  Save 10th Standard
                </button>
              </div>
            </div>
            {/* Salary Slip Section */}
            <div className="bg-white rounded-xl w-full shadow-md p-6 sm:p-8 border-2 border-purple-600">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    Salary Slip
                  </h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Company name"
                    value={salaryCompanyName}
                    onChange={(e) => setSalaryCompanyName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>
                <div className="relative border-2 border-dashed border-purple-600 rounded-lg p-4 sm:p-6 bg-gray-50 hover:bg-purple-50 transition-all duration-300">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleSalarySlipUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
                    <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                      {salarySlipName || "Upload Salary Slip"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Supports: JPG, PNG, PDF</p>
                    <p className="text-gray-400 text-xs">Max size: 5MB</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSalarySlipSubmit}
                  className="py-2 px-4 sm:px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-xs sm:text-sm"
                >
                  Save Salary Slip
                </button>
              </div>
            </div>
            {/* Bank Account Details Section */}
            <div className="bg-white rounded-xl w-full shadow-md p-6 sm:p-8 border-2 border-purple-600">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    Bank Account Details
                  </h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Account Holder Name"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter IFSC Code"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Confirm Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="Confirm Account Number"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Bank Branch Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Bank Branch Name"
                      value={bankBranchName}
                      onChange={(e) => setBankBranchName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Bank Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Bank Address"
                      value={bankAddress}
                      onChange={(e) => setBankAddress(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleBankDetailsSubmit}
                  className="py-2 px-4 sm:px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-xs sm:text-sm"
                >
                  Save Bank Details
                </button>
              </div>
            </div>
            {/* Experience Letter Section */}
            <div className="bg-white rounded-xl w-full shadow-md p-6 sm:p-8 border-2 border-purple-600">
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    Experience Letter
                  </h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Company name"
                      value={expCompanyName}
                      onChange={(e) => setExpCompanyName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Experience Year
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Experience Year"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Current CTC
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Current CTC"
                      value={currentCtc}
                      onChange={(e) => setCurrentCtc(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                </div>
                <div className="relative border-2 border-dashed border-purple-600 rounded-lg p-4 sm:p-6 bg-gray-50 hover:bg-purple-50 transition-all duration-300">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleExperienceLetterUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
                    <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                      {experienceLetterName || "Upload Experience Letter"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Supports: JPG, PNG, PDF
                    </p>
                    <p className="text-gray-400 text-xs">Max size: 5MB</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleExperienceLetterSubmit}
                  className="py-2 px-4 sm:px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-xs sm:text-sm"
                >
                  Save Experience Letter
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl max-w-4xl mx-auto shadow-md p-8 border-2 border-purple-600 mb-8">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Employee Signature
                  </h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="relative border-2 border-dashed border-purple-600 rounded-lg p-6 bg-gray-50 hover:bg-purple-50 transition-all duration-300">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleEmployeeSignatureUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 text-2xl mb-2" />
                    <p className="text-gray-700 text-sm font-medium">
                      {employeeSignatureName || "Upload Employee Signature"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Supports: JPG, PNG
                    </p>
                    <p className="text-gray-400 text-xs">Max size: 2MB</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleEmployeeSignatureSubmit}
                  className="py-2 px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all text-sm"
                >
                  Save and Submit KYC
                </button>
              </div>
            </div>
            {showPendingPopup && kycStatus === "Pending" && (
              <div className="mt-6">
                <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-yellow-600 text-2xl mr-4">⚠️</div>
                  <div>
                    <h4 className="text-yellow-800 font-bold">
                      KYC Verification Pending
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Your documents are under review. Our team will verify your
                      details within 2-3 business days. You'll receive a
                      notification once your KYC is approved.
                    </p>
                  </div>
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
                  >
                    <span className="mr-2">←</span>
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {showPendingPopup && kycStatus === "Pending" && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg sm:ml-[18%] max-w-[80vw] mt-20 p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-green-600 text-2xl mr-2">✅</span>
              <h3 className="text-lg font-semibold text-gray-800">
                Pending, Please Wait
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Your KYC documents have been submitted and are under review. Our
              team will verify your details within 2-3 business days.
            </p>
          </div>
        </div>
      )}
      {showCompletedPopup && kycStatus === "Approved" && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg sm:ml-[18%] max-w-[80vw] mt-20 p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-green-600 text-2xl mr-2">🎉</span>
              <h3 className="text-lg font-semibold text-gray-800">
                KYC Approved!
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Congratulations! Your KYC has been successfully approved. You can
              now access additional features, including the Agreement section.
            </p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  setShowCompletedPopup(false);
                  navigate("/dashboard/employee", { replace: true }); // Navigate to dashboard
                }}
                className="py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default KycDocument;