// /controllers/passwordController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const sendEmail = require('../config/mailer');
const dotenv = require('dotenv');
dotenv.config();

// Request password reset
const requestPasswordReset = (req, res) => {
  const { email } = req.body;

  // Query the database for the user by email
  pool.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(400).send('User not found');
    }

    // Create a password reset token (expires in 1 hour)
    const resetToken = jwt.sign({ userId: results[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Generate password reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send the password reset email
    const subject = 'Password Reset Request';
    const text = `Click the link to reset your password: ${resetUrl}`;
    sendEmail(email, subject, text)
      .then(() => {
        res.status(200).send('Password reset email sent');
      })
      .catch(() => {
        res.status(500).send('Error sending reset email');
      });
  });
};

// Handle password reset
const resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  // Verify the reset token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the new password
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      // Update the password in the database
      pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, decoded.userId],
        (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
          }

          if (results.affectedRows === 0) {
            return res.status(400).send('User not found');
          }

          res.status(200).send('Password updated successfully');
        }
      );
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(400).send('Invalid or expired token');
  }
};

module.exports = { requestPasswordReset, resetPassword };
