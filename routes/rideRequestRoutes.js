const express = require("express");
const router = express.Router();
const rideRequestController = require("../controllers/rideRequestController");
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, rideRequestController.createRequest); //ye request bejne ke liya user se driver pe
router.get('/:id/accept', rideRequestController.acceptRequest);//accept kre ga driver
router.get('/:id/reject', rideRequestController.rejectRequest);// reject kre ga driver
router.post("/sendmail",rideRequestController.sendmail); //test
module.exports = router;
