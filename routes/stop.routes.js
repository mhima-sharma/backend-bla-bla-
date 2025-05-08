const express = require('express');
const router = express.Router();
const stopController = require('../controllers/stop.controller');

// Route: POST /api/stop
router.post('/stop', stopController.saveStopPoint);
// router.post("/sendmail",stopController.sendmail);
module.exports = router;
