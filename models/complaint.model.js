const db = require('../config/db');

const createComplaint = (message, callback) => {
  const query = 'INSERT INTO complaints (user_message) VALUES (?)';
  db.query(query, [message], callback);
};

const getAllComplaints = (callback) => {
  const query = 'SELECT * FROM complaints ORDER BY timestamp DESC';
  db.query(query, callback);
};

module.exports = {
  createComplaint,
  getAllComplaints
};
