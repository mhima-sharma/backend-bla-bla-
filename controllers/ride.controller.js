// const db = require('../config/db');

exports.publishRide = async (req, res) => {console.log(req.user,"reqqqqqqqqqqqqqqqq")
  try {
    const userId = req.user.id;
    const { from, to, passengers } = req.body;

    if (!from || !to || !passengers) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await db.execute(
      'INSERT INTO rides (user_id, from_location, to_location, passengers) VALUES (?, ?, ?, ?)',
      [userId, from, to, passengers]
    );

    res.status(201).json({ message: 'Ride published successfully' });
  } catch (err) {
    console.error('Publish ride error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Add this missing function
exports.getPublishedRides = async (req, res) => {
  console.log(res,"kya h ab ")
  try {
    const [rides] = await db.execute('SELECT * FROM ride_publish_details ORDER BY date DESC');
    res.json(rides);
  } catch (err) {
    console.error('Get published rides error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// yha se hum ride ko search kre ge! yaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

const db = require('../config/db');

exports.searchRides = async (req, res) => {
  const { from, to } = req.query;

  let query = 'SELECT * FROM ride_publish_details WHERE 1=1';
  const params = [];

  if (from) {
    query += ' AND from_location LIKE ?';
    params.push(`%${from}%`);
  }

  if (to) {
    query += ' AND to_location LIKE ?';
    params.push(`%${to}%`);
  }

  try {
    const [rides] = await db.execute(query, params);
    res.json(rides);
  } catch (error) {
    console.error('Search rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
