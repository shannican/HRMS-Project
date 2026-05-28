const express = require("express");
const router = express.Router();
const {sendEmails, getAllEmails} = require('../controllers/infoController');
router.post('/sendMails', sendEmails)
router.get('/getAllEmails', getAllEmails)

module.exports = router;