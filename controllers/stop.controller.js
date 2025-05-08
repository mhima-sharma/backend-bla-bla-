const Stop = require('../models/stop.model');

exports.saveStopPoint = async (req, res) => {
  try {
    const { instruction, user_id, lat, lng } = req.body;

    if (!instruction || !user_id || !lat || !lng) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await Stop.saveStop(instruction, user_id, lat, lng);
    res.status(201).json({ message: 'Stop point saved successfully', data: result });
  } catch (err) {
    console.error('Error saving stop point:', err);
    res.status(500).json({ message: 'Failed to save stop point' });
  }
};


