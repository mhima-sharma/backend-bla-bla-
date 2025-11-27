// models/passwordResetModel.js
const db = require('../config/db');

exports.saveToken = async (email, token) => {
  const expires_at = new Date(Date.now() + 3600000); // 1 hour
  await db.query('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', [email, token, expires_at]);
};

exports.findResetToken = async (email, token) => {
  return db.query('SELECT * FROM password_resets WHERE email = ? AND token = ?', [email, token]);
};

exports.deleteResetToken = async (email) => {
  return db.query('DELETE FROM password_resets WHERE email = ?', [email]);
};
