const Ride = require('../models/publishride.model');
const db = require('../config/db');

exports.createRide = async (req, res) => {
  try {
    const { time, date, location, userId } = req.body;

    if (!time || !date || !location || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    const result = await Ride.createRide( time, date, location, userId);

    console.log(result,' Sending response now'); // <- Make sure this prints

    res.status(201).json({ message: 'Ride published successfully', data: result });
   
  } catch (err) {
 
    res.status(500).json({ message: 'Failed to publish ride' });
  }
};

// exports.getMyRides = async (req, res) => {
//   const userId = req.user.id; // assuming JWT middleware adds `user` to request
//   try {
//     const [rides] = await db.query('SELECT * FROM publishride WHERE user_id = ?', [userId]);
//     res.status(200).json(rides);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching your rides', error });
//   }
// };
// exports.getUserRides = (req, res) => {
//   const userId = req.params.userId;
//   console.log(userId,"userId")
//   const query = `
//     SELECT * FROM ride_publish_details
//     WHERE user_id = ?
//     ORDER BY date DESC, time DESC
//   `;
//   db.query(query, [userId], (err, results) => {
//     if (err) {
//       console.error("Error fetching rides:", err);
//       return res.status(500).json({ error: 'Server error' });
//     }
//     res.json(results);
//   });
// };


exports.getUserRides = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [rows] = await db.query(
      'SELECT * FROM ride_publish_details WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching rides:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


  