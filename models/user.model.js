const db = require('../config/db');
exports.findByEmail = async (email) => {
  try {
    const [rows] = await db.query('SELECT * FROM signup_users WHERE email = ?', [email]);
    return rows;
  } catch (err) {
    throw err;
  }};
exports.createUser = async (name, email, hashedPassword) => {
  try {
    const [result] = await db.query(
      'INSERT INTO signup_users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return result;
  } catch (err) {
    throw err;
  }
};
exports.getUserById = async (userId) => {
  const [rows] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
  console.log('hiiiii kha h api chl kyu nhi rhi?',userId)
  return rows[0];
};
exports.updateUserProfile = async (userId, name, email) => {
  await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
};
