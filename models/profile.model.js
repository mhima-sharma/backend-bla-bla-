const db = require('../config/db');

exports.updateOrInsertProfile = async (
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
) => {
  try {
    const [result] = await db.query(
      `
      INSERT INTO user_profiles 
        (user_id, email, phone, address, dob, role, gender, vehicles, aadhar_file, driving_license_file)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        phone = VALUES(phone),
        address = VALUES(address),
        dob = VALUES(dob),
        role = VALUES(role),
        gender = VALUES(gender),
        vehicles = VALUES(vehicles),
        aadhar_file = VALUES(aadhar_file),
        driving_license_file = VALUES(driving_license_file)
      `,
      [
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
      ]
    );
    return result;
  } catch (err) {
    throw err;
  }
};
