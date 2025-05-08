const db = require('../config/db');

module.exports = async function getUserEmail(userId) {
  const [[user]] = await db.query('SELECT email FROM signup_users WHERE id = ?', [userId]);
  return user.email;
};
