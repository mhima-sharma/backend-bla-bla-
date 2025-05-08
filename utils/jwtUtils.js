const jwt = require('jsonwebtoken');

// Generate JWT token
exports.sendJwtToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET, // Use your secret key from .env
    { expiresIn: '1h' } // Optional: Set token expiration time
  );
};
