const db = require('../config/db');

exports.publishRide = async (rideData) => {
  const { from, to, passengers, userId } = rideData;

  const [result] = await db.execute(
    'INSERT INTO rides (user_id, from_location, to_location, passengers) VALUES (?, ?, ?, ?)',
    [userId, from, to, passengers]
  );

  return result;
};
