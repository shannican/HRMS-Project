const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const kycController = require("../controllers/kycController");

console.log("Setting up KYC routes...");

router.post("/save/:step", authMiddleware, kycController.saveKycData);
router.post("/submit", authMiddleware, kycController.submitKyc);
router.get("/status/:employeeId", authMiddleware, kycController.getKycStatus);
router.put("/employees/:employeeId/approve", authMiddleware, kycController.approveKyc);
router.put("/employees/:employeeId/reject", authMiddleware, kycController.rejectKyc);
router.get("/pending", authMiddleware, kycController.getPendingKycRequests);
router.get("/employees", authMiddleware, kycController.getEmployeesWithKyc);
router.get("/details/:employeeId", authMiddleware, kycController.getKycDetails);
router.post("/agreement/accept", authMiddleware, kycController.acceptAgreement);
router.get("/current", authMiddleware, kycController.getCurrentEmployeeKyc);
router.post("/agreement/upload", authMiddleware, kycController.uploadAgreement);

console.log("KYC routes set up successfully");

module.exports = router;