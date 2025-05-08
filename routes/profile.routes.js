const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const multer = require('multer');
const path = require('path');

// Upload config
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post(
    '/update-profile',
    upload.fields([
        { name: 'aadharFile', maxCount: 1 },
        { name: 'drivingLicenseFile', maxCount: 1 }
    ]),
    profileController.updateProfile
);

module.exports = router;
