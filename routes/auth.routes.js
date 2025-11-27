const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { getUserProfile } = require('../controllers/auth.controller');
const userController = require('../controllers/auth.controller'); // ✅ Import user controller
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login); 
// router.post('/login', authController.login); // later
router.post('/change-password', authenticateToken, authController.changePassword);
// porfile show and update 
router.get('/user/profile', authenticateToken, authController.getUserProfile);
router.get('/user/updated/profile', authenticateToken, authController.getUserUpdatedProfile); 
router.put('/profile', authenticateToken, authController.updateProfile);
// router.post('/reset-password', authController.resetPassword);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
