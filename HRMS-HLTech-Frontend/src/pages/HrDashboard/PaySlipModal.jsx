import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import html2pdf from "html2pdf.js";
import PropTypes from "prop-types";
import moment from "moment";
import { X, Download, Printer, Send, User, Building2, Receipt, CreditCard } from "lucide-react";

// HL Tech logo path (accessible from the public directory)
const HLTechLogo = "/hltechlogo.png";

const PaySlipModal = ({ isOpen, onClose, payrollRecord }) => {
  const payslipRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [totalWorkingDays, setTotalWorkingDays] = useState(0);

  // Normalize date to UTC midnight
  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  };

  // Fetch holidays for the payroll period
  const fetchHolidays = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/holidays", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch holidays");
      }

      const data = await response.json();
      console.log("Fetched holidays:", data);
      setHolidays(data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error(error.message);
    }
  };

  // Calculate total working days for the payroll period (excluding Sundays and assigned holidays)
  const calculateTotalWorkingDays = () => {
    if (!payrollRecord?.periodStart || !payrollRecord?.periodEnd) {
      console.log("Invalid periodStart or periodEnd:", {
        periodStart: payrollRecord?.periodStart,
        periodEnd: payrollRecord?.periodEnd,
      });
      setTotalWorkingDays(0);
      return;
    }

    const startDate = normalizeDate(new Date(payrollRecord.periodStart));
    const endDate = normalizeDate(new Date(payrollRecord.periodEnd));

    if (startDate > endDate) {
      console.log("Invalid date range: startDate > endDate", {
        startDate,
        endDate,
      });
      setTotalWorkingDays(0);
      return;
    }

    let workingDays = 0;
    let currentDateIterator = new Date(startDate);
    while (currentDateIterator <= endDate) {
      const currentDate = normalizeDate(new Date(currentDateIterator));
      const isSunday = currentDate.getUTCDay() === 0;

      // Check if the date is an assigned holiday (exclude Sundays)
      const isAssignedHoliday = holidays.some((holiday) => {
        const holidayDate = normalizeDate(new Date(holiday.date));
        return (
          holidayDate.getTime() === currentDate.getTime() &&
          holiday.type === "Assigned"
        );
      });

      if (!isSunday && !isAssignedHoliday) {
        workingDays++;
      }
      currentDateIterator.setUTCDate(currentDateIterator.getUTCDate() + 1);
    }

    console.log(
      "Calculated Total Working Days (excluding Sundays and assigned holidays):",
      workingDays
    );
    setTotalWorkingDays(workingDays);
  };

  useEffect(() => {
    if (isOpen && payrollRecord) {
      fetchHolidays();
    }
  }, [isOpen, payrollRecord]);

  useEffect(() => {
    if (holidays.length > 0) {
      calculateTotalWorkingDays();
    }
  }, [holidays, payrollRecord]);

  if (!isOpen || !payrollRecord || !payrollRecord.employeeId) {
    return null;
  }

  console.log("Payroll Record in PaySlipModal:", payrollRecord);

  console.log("KYC Fields in PaySlipModal:", {
    pan: payrollRecord.pan,
    accountNumber: payrollRecord.accountNumber,
    ifscCode: payrollRecord.ifscCode,
  });

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("-");
  };

  const formatMonthFromDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return parsedDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  const numberToWords = (num) => {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const thousands = ["", "Thousand", "Million", "Billion"];

    if (num === 0) return "Zero";

    const convert = (n) => {
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
      if (n < 1000)
        return (
          units[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + convert(n % 100) : "")
        );
      return "";
    };

    let words = "";
    let i = 0;
    num = Math.floor(num);

    while (num > 0) {
      const chunk = num % 1000;
      if (chunk) {
        words =
          convert(chunk) +
          (thousands[i] ? " " + thousands[i] : "") +
          (words ? " " + words : "");
      }
      num = Math.floor(num / 1000);
      i++;
    }

    return words + " Rupees Only";
  };

  const payableDays = Number(payrollRecord.paidDays) || 0;
  const presentDays =
    (payrollRecord.paidDays || 0) -
    (payrollRecord.paidLeaves || 0) -
    (payrollRecord.holidayDays || 0);
  const lopDays =
    (Number(payrollRecord.sundayDays) || 0) +
    (Number(payrollRecord.unpaidLeaves) || 0);
  const basicSalary = Number(payrollRecord.basicSalary) || 0;
  const hra = Number(payrollRecord.hra) || 0;
  const travelAllowance = Number(payrollRecord.travelAllowance) || 0;
  const specialAllowance = Number(payrollRecord.specialAllowance) || 0;
  const grossEarnings = Number(payrollRecord.grossEarnings) || 0;
  const totalDeductions = Number(payrollRecord.deductions) || 0;
  const netPay = Number(payrollRecord.netPay) || 0;
  const totalReimbursements = Number(payrollRecord.reimbursements) || 0;
  const totalNetPayable = netPay;
  const totalNetPayableWords = numberToWords(Math.floor(totalNetPayable));
  const grossEarningsBeforeDeductions = grossEarnings;

  const panNumber = payrollRecord.pan || "N/A";
  const accountNumber = payrollRecord.accountNumber || "N/A";
  const ifscCode = payrollRecord.ifscCode || "N/A";

  console.log("Calculated values for PaySlipModal:", {
    payableDays,
    presentDays,
    lopDays,
    basicSalary,
    hra,
    travelAllowance,
    specialAllowance,
    grossEarnings,
    totalDeductions,
    netPay,
    totalReimbursements,
    totalNetPayable,
    panNumber,
    accountNumber,
    ifscCode,
  });

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/payroll/slip/${payrollRecord._id}/send-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send pay slip email");
      }

      toast.success("Pay slip sent to employee successfully", {
        style: { background: "#10B981", color: "#fff", fontWeight: "500" },
      });
      onClose();
    } catch (error) {
      console.error("Error sending pay slip email:", error);
      toast.error(error.message, {
        style: { background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = payslipRef.current;
    if (!element) {
      alert("Error: Unable to generate PDF. Element not found.");
      return;
    }

    const employeeName = payrollRecord.employeeId?.fullName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const monthYear = formatMonthFromDate(payrollRecord.periodStart).replace(
      /\s+/g,
      "_"
    );
    const fileName = `Payslip_${monthYear}_${employeeName}.pdf`;

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .catch((error) => {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
      });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 w-full h-full"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-[210mm] max-h-[297mm] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#1E90FF] via-[#1E90FF] to-[#28A745] p-6 text-white flex-shrink-0">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <motion.img
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      src={
                        payrollRecord.employeeId?.profileImage ||
                        "https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg"
                      }
                      alt={payrollRecord.employeeId?.fullName || "Employee"}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://i.pinimg.com/736x/38/6c/52/386c5283f14bdca0fa14e28dd18fb574.jpg")
                      }
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {payrollRecord.employeeId?.fullName || "Employee Name"}
                    </h2>
                    <p className="text-blue-100 flex items-center gap-2 text-sm">
                      <Receipt className="w-4 h-4" />
                      Pay Slip - {formatMonthFromDate(payrollRecord.periodStart)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              className="flex-grow overflow-y-auto"
              style={{
                maxHeight: "208mm", // 70% of A4 height (297mm * 0.7 = 207.9mm, rounded to 208mm)
              }}
            >
              <div
                id="payslip-content"
                ref={payslipRef}
                className="payslip-container p-6 bg-gray-50"
                style={{
                  width: "210mm",
                  height: "297mm",
                  backgroundColor: "#F9FAFB",
                  fontFamily: "Arial, sans-serif",
                  color: "#000000",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Company Header */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-lg font-bold text-[#1E90FF] mb-1">
                        HL Tech India Private Limited
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2 text-xs">
                        <Building2 className="w-3 h-3" />
                        78, Indrapuri Sector-C, Bhopal (M.P) 462022
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <img
                        src={HLTechLogo}
                        alt="HL Tech Logo"
                        className="w-16 h-16 object-contain" // Increased size from w-12 h-12 to w-16 h-16
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/40x40.png?text=HL")
                        }
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-base font-semibold text-gray-800 bg-blue-50 py-2 px-4 rounded-lg">
                      Payslip for the Month of{" "}
                      {formatMonthFromDate(payrollRecord.periodStart)}
                    </h3>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
                  {/* Left Column - Employee Details */}
                  <div className="lg:col-span-2 space-y-4 overflow-y-auto">
                    {/* Employee Summary Card */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#1E90FF]" />
                        Employee Pay Summary
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10pt]">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Employee Name:</span>
                            <span className="font-medium">
                              {payrollRecord.employeeId?.fullName || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Designation:</span>
                            <span className="font-medium">
                              {payrollRecord.employeeId?.position || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Date of Joining:
                            </span>
                            <span className="font-medium">
                              {payrollRecord.employeeId?.joiningDate
                                ? formatDate(payrollRecord.employeeId.joiningDate)
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pay Period:</span>
                            <span className="font-medium">
                              {formatMonthFromDate(payrollRecord.periodStart)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pay Date:</span>
                            <span className="font-medium">
                              {payrollRecord.paymentDate
                                ? formatDate(payrollRecord.paymentDate)
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payable Days:</span>
                            <span className="font-medium text-[#28A745]">
                              {payableDays}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">LOP Days:</span>
                            <span className="font-medium text-red-600">
                              {lopDays}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">PAN:</span>
                            <span className="font-medium">{panNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account No.:</span>
                            <span className="font-medium">{accountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">IFSC Code:</span>
                            <span className="font-medium">{ifscCode}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Earnings and Deductions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Earnings Card */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <h5 className="text-base font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Earnings
                        </h5>
                        <div className="space-y-2 text-[10pt]">
                          <div className="flex justify-between">
                            <span className="text-green-700">Basic Salary</span>
                            <span className="font-medium text-green-800">
                              ₹{basicSalary.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">HRA</span>
                            <span className="font-medium text-green-800">
                              ₹{hra.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">
                              Travel Allowance
                            </span>
                            <span className="font-medium text-green-800">
                              ₹{travelAllowance.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">
                              Special Allowance
                            </span>
                            <span className="font-medium text-green-800">
                              ₹{specialAllowance.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="border-t border-green-300 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-green-800">
                                Gross Earnings
                              </span>
                              <span className="font-bold text-green-800 text-base">
                                ₹{grossEarnings.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deductions Card */}
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                        <h5 className="text-base font-semibold text-red-800 mb-3">
                          Deductions
                        </h5>
                        <div className="space-y-2 text-[10pt]">
                          <div className="flex justify-between">
                            <span className="font-semibold text-red-800">
                              Total Deductions
                            </span>
                            <span className="font-bold text-red-800 text-base">
                              ₹{totalDeductions.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reimbursements Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <h5 className="text-base font-semibold text-blue-800 mb-3">
                        Reimbursements
                      </h5>
                      <div className="flex justify-between text-[10pt]">
                        <span className="font-semibold text-blue-800">
                          Total Reimbursements
                        </span>
                        <span className="font-bold text-blue-800 text-base">
                          ₹{totalReimbursements.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Formula Note */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <p className="text-xs text-yellow-800">
                        <strong>Calculation:</strong> Total Net Payable = Gross
                        Earnings - Total Deductions + Total Reimbursements
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Net Pay Highlight */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-[#1E90FF] to-[#28A745] rounded-xl p-6 text-white shadow-xl">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                          <Receipt className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-semibold mb-2">
                          Employee Net Pay
                        </h4>
                        <div className="text-2xl font-bold mb-3">
                          ₹{totalNetPayable.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs opacity-90 bg-white/10 rounded-lg p-2">
                          {totalNetPayableWords}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="opacity-90">Gross Earnings:</span>
                            <span className="font-medium">
                              ₹{grossEarningsBeforeDeductions.toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-90">
                              Total Deductions:
                            </span>
                            <span className="font-medium">
                              ₹{totalDeductions.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-90">Reimbursements:</span>
                            <span className="font-medium">
                              ₹{totalReimbursements.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </motion.button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendEmail}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#1E90FF] to-[#28A745] hover:from-[#1E90FF]/90 hover:to-[#28A745]/90 disabled:opacity-50 text-white px-4 py-1 rounded-lg transition-all text-sm"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isLoading ? "Sending..." : "Send to Employee"}
                  </motion.button>

                  <button
                    onClick={onClose}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded-lg transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

PaySlipModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  payrollRecord: PropTypes.shape({
    _id: PropTypes.string,
    employeeId: PropTypes.shape({
      fullName: PropTypes.string,
      email: PropTypes.string,
      employeeCode: PropTypes.string,
      profileImage: PropTypes.string,
      position: PropTypes.string,
      joiningDate: PropTypes.string,
      ctc: PropTypes.number,
    }),
    periodStart: PropTypes.string,
    periodEnd: PropTypes.string,
    paymentDate: PropTypes.string,
    paidDays: PropTypes.number,
    absents: PropTypes.number,
    paidLeaves: PropTypes.number,
    unpaidLeaves: PropTypes.number,
    holidayDays: PropTypes.number,
    sundayDays: PropTypes.number,
    monthlySalary: PropTypes.number,
    perDaySalary: PropTypes.number,
    deductions: PropTypes.number,
    netPay: PropTypes.number,
    creditedPay: PropTypes.number,
    advance: PropTypes.number,
    paymentMode: PropTypes.string,
    basicSalary: PropTypes.number,
    hra: PropTypes.number,
    travelAllowance: PropTypes.number,
    specialAllowance: PropTypes.number,
    grossEarnings: PropTypes.number,
    reimbursements: PropTypes.number,
    pan: PropTypes.string,
    accountNumber: PropTypes.string,
    ifscCode: PropTypes.string,
  }),
};

PaySlipModal.defaultProps = {
  payrollRecord: null,
};

export default PaySlipModal;