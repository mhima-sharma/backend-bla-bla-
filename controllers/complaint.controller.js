const ComplaintModel = require('../models/complaint.model');

exports.sendComplaint = (req, res) => {
  const { userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ message: 'Message is required' });
  }

  ComplaintModel.createComplaint(userMessage, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error saving complaint', error: err });
    return res.status(200).json({ message: 'Complaint submitted successfully' });
  });
};

exports.getComplaints = async(req, res) => {
  ComplaintModel.getAllComplaints((err, complaints) => {
    if (err) return res.status(500).json({ message: 'Error fetching complaints', error: err });
    return res.status(200).json(complaints);
  });
};
