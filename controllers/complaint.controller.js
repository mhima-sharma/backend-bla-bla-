const db = require('../config/db'); // mysql2 promise pool

// ======================
// SEND COMPLAINT (USER)
// ======================
exports.sendComplaint = async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const sql = `
      INSERT INTO complaints (user_message, status)
      VALUES (?, 'pending')
    `;

    await db.query(sql, [userMessage]);

    res.status(200).json({ message: 'Complaint submitted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving complaint' });
  }
};

// ======================
// GET ALL COMPLAINTS (ADMIN)
// ======================
exports.getComplaints = async (req, res) => {
  try {
    const sql = `
      SELECT id, user_message, status, timestamp
      FROM complaints
      ORDER BY timestamp DESC
    `;

    const [results] = await db.query(sql);

    res.status(200).json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// ======================
// UPDATE COMPLAINT STATUS (ADMIN)
// ======================
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const sql = `
      UPDATE complaints
      SET status = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ message: 'Complaint status updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating complaint' });
  }
};
