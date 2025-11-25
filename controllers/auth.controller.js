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


exports.getUserProfile = async (req, res) => {
  const userId = req.user.id; 
  // console.log("is it working?",req, res)
  const [user] = await db.query('SELECT * FROM signup_users WHERE id = ?', [userId]);
  console.log(user,"user")
  if (!user.length) return res.status(404).json({ message: 'User not found' });
  res.json(user[0]);
  // res.json({ message: "User profile fetched successfully" });
};
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

// ======= for got password reovery 


// exports.resetPassword = async (req, res) => {
//   const body = req.body || {}; // Fallback to empty object if undefined
//   const { token, newPassword } = body;

//   if (!token || !newPassword) {
//     return res.status(400).json({ message: 'Token and new password are required' });
//   }

//   try {
//     const { email } = jwt.verify(token, process.env.JWT_SECRET);

//     const [record] = await passwordResetModel.findResetToken(email, token);

//     if (!record.length || new Date(record[0].expires_at) < new Date()) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     const hashed = await bcrypt.hash(newPassword, 10);

//     await db.query('UPDATE users SET password = ? WHERE email = ?', [hashed, email]);

//     await passwordResetModel.deleteResetToken(email);

//     res.json({ message: 'Password reset successful' });

//   } catch (err) {
//     console.error("Token verification error:", err.message);
//     res.status(400).json({ message: 'Token verification failed', error: err.message });
//   }
// };
