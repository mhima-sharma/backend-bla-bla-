const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaint.controller');

// POST - submit a complaint
router.post('/send-message', ComplaintController.sendComplaint);

// GET - fetch all complaints (for admin)
router.get('/get-complaints', ComplaintController.getComplaints);

module.exports = router;
