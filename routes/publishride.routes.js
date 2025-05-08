const express = require('express');
const router = express.Router();
const controller = require('../controllers/publishride.controller');



router.post('/create', controller.createRide);
// router.get('/user/:userId', controller.getRidesByUser);
// GET /api/rides/user/:userId
router.get('/user/:userId', controller.getUserRides);







module.exports = router;
