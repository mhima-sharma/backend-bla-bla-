const db = require('../config/db'); // or wherever you configured the DB connection/


exports.createRide = async (time, date, location, userId) => {
  try {
    const [result] = await db.query(
      'INSERT INTO published_rides (time, date, location, user_id) VALUES (?, ?, ?, ?)',
      [time, date, location, userId]
    );
    return result;
  } catch (err) {
    throw err;
  }
};

// const getRidesByUserId = (userId) => {
//   return new Promise((resolve, reject) => {
//     const query = `SELECT * FROM ride_publish_details WHERE user_id = ?`;
//     db.query(query, [userId], (err, results) => {
//       if (err) {
//         console.error('Error fetching rides from DB:', err);
//         return reject(err);
//       }
//       resolve(results);
//     });
//   });
// };

// module.exports = {
//   createRide,
//   getRidesByUserId
// };





