const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create booking
router.post('/create', bookingController.createBooking);

// Accept / Reject booking
router.put('/:bookingId', bookingController.updateBookingStatus);

router.get('/all', bookingController.getAllBookings);
router.get('/rider/:riderId', bookingController.getBookingsByRider);
router.get('/driver/:driverId', bookingController.getBookingsByDriver);
router.get('/:bookingId', bookingController.getBookingById);


module.exports = router;
