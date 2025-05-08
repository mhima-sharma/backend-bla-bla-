const db = require('../config/db');

exports.saveStop = async (instruction, user_id, lat, lng) => {
  try {
    const [result] = await db.query(
      'INSERT INTO stop_points (instruction, user_id, lat, lng) VALUES (?, ?, ?, ?)',
      [instruction, user_id, lat, lng]
    );
    return result;
  } catch (err) {
    throw err;
  }
};
