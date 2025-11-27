require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const db = require('../config/db')
const passwordResetModel = require('../models/passwordreset.model');
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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    // 1️⃣ Check if user exists
    const [user] = await db.query('SELECT * FROM signup_users WHERE email = ?', [email]);
    if (!user.length) return res.status(404).json({ message: 'Email not found' });

    // 2️⃣ Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3️⃣ Save token + expiry in DB
    const expiry = Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRY_MS || 3600000); // default 1 hour
    await db.query(
      'UPDATE signup_users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?',
      [resetToken, expiry, email]
    );

    // 4️⃣ Send reset email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetURL}">here</a> to reset your password</p>`
    });

    res.json({ message: 'Reset link sent to your email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};