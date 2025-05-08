// /routes/passwordRoutes.js
const express = require('express');
const { requestPasswordReset, resetPassword } = require('../controllers/passwordController');

const router = express.Router();

// Route to request password reset
router.post('/request-reset', requestPasswordReset);

// Route to reset password
router.post('/reset-password', resetPassword);

module.exports = router;
