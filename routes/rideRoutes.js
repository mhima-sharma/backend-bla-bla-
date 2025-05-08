const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const auth = require('../middlewares/authMiddleware');

// Request ride
router.post('/rides/:rideId/request', auth, rideController.requestRide);

// Approve/reject request
router.post('/ride-requests/:requestId/update', auth, rideController.updateRideRequest);

module.exports = router;
