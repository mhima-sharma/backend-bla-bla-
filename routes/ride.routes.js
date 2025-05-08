const express = require('express');
const router = express.Router();
const { publishRide ,getPublishedRides} = require('../controllers/ride.controller'); 
const authenticateToken = require('../middlewares/authMiddleware');
const rideController = require('../controllers/ride.controller');

router.post('/publish',authenticateToken, publishRide);
router.get('/published', getPublishedRides);
router.get('/search', rideController.searchRides);


module.exports = router;




