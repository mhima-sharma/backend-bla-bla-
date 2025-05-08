const db = require('../config/db');

const createResetToken = (email, token, expiresAt) => {
  return db.query(
    'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
    [email, token, expiresAt]
  );
};

const findResetToken = (email, token) => {
  return db.query(
    'SELECT * FROM password_resets WHERE email = ? AND token = ?',
    [email, token]
  );
};

const deleteResetToken = (email) => {
  return db.query('DELETE FROM password_resets WHERE email = ?', [email]);
};

module.exports = {
  createResetToken,
  findResetToken,
  deleteResetToken,
};
