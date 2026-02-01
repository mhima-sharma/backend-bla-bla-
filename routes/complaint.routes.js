const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaint.controller');

// USER
router.post('/send-message', ComplaintController.sendComplaint);

// ADMIN
router.get('/get-complaints', ComplaintController.getComplaints);
router.put('/update-status/:id', ComplaintController.updateComplaintStatus);


module.exports = router;
