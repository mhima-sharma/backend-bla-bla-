const { updateOrInsertProfile } = require('../models/profile.model');

exports.updateProfile = async (req, res) => {
    try {
        const user_id = req.body.userId;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID not found' });
        }

        const {
            email,
            phone,
            address,
            dob,
            role,
            gender,
            vehicles
        } = req.body;
console.log( req.body," req.body")
        const aadharFile = req.files?.['aadharFile']?.[0]?.filename || null;
        const drivingLicenseFile = req.files?.['drivingLicenseFile']?.[0]?.filename || null;

        await updateOrInsertProfile(
            user_id,
            email,
            phone,
            address,
            dob,
            role,
            gender,
            vehicles,
            aadharFile,
            drivingLicenseFile
        );

        res.status(200).json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Profile update failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
