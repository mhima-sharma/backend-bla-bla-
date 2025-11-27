require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const db = require('../config/db')
const passwordResetModel = require('../models/passwordreset.model');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
//  mail transporter for forgot password 
async function sendResetEmail(toEmail, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const mailOptions = {
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Password reset request',
    html: `
      <p>You (or someone else) requested a password reset.</p>
      <p>Click the link below to reset your password. The link is valid for 1 hour.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `
  };
  await transporter.sendMail(mailOptions);
}







// ===== SIGNUP =====
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  try {
    const existingUsers = await User.findByEmail(email);
    if (existingUsers.length > 0)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.createUser(name, email, hashedPassword);

    const user = {
      id: result.insertId,
      name,
      email,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ===== LOGIN =====
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("req.body", req.body);

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  try {
    const users = await User.findByEmail(email);

    if (users.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    // Optional: add JWT here
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// change password

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    // Get user
    const [rows] = await db.query('SELECT password FROM signup_users WHERE id = ?', [userId]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE signup_users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }

};

// get signup user profile 
exports.getUserProfile = async (req, res) => {
  const userId = req.user.id; 
  // console.log("is it working?",req, res)
  const [user] = await db.query('SELECT * FROM signup_users WHERE id = ?', [userId]);
  console.log(user,"user")
  if (!user.length) return res.status(404).json({ message: 'User not found' });
  res.json(user[0]);
  // res.json({ message: "User profile fetched successfully" });
};

// get user's updated profile
exports.getUserUpdatedProfile = async (req, res) => {
  const userId = req.user.id; 
   console.log("is it working?",req.user, )
  const [user] = await db.query('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
  if (!user.length) return res.status(404).json({ message: 'User not found' });
  res.json(user[0]);
  
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.updateUserProfile(req.user.id, name, email);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// ======= forgot password reovery 
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Find user
    const [rows] = await db.query('SELECT id, email FROM signup_users WHERE email = ?', [email]);
    const user = rows[0];

    // Always return OK to avoid email enumeration
    if (!user) {
      // optionally log that an unknown email requested a reset
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate token and hashed token to store
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expires = Date.now() + (parseInt(process.env.RESET_TOKEN_EXPIRY_MS || '3600000', 10)); // 1 hour

    // Save tokenHash and expiry to DB (using signup_users columns)
    await db.query(
      'UPDATE signup_users SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [tokenHash, expires, user.id]
    );

    // Send reset email containing the raw token (not the hash)
    await sendResetEmail(user.email, token);

    return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
























// POST /auth/reset-password
// expects { token, newPassword }
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    // Hash provided token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by tokenHash and expiry
    const [rows] = await db.query(
      'SELECT id, reset_expires FROM signup_users WHERE reset_token = ? LIMIT 1',
      [tokenHash]
    );
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    if (user.reset_expires === null || +user.reset_expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Hash new password and update user
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE signup_users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hashedNewPassword, user.id]
    );

    return res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};