const nodemailer = require("nodemailer");
const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const getUserEmail = require('../utils/getUserEmail');
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,  // Email from environment variable
    pass: process.env.MAIL_PASS,  // App password from environment variable
  },
});

// Define the sendmail function
exports.sendmail = async (req, res) => {
  let user= process.env.MAIL_USER // Email from environment variable
  let pass= process.env.MAIL_PASS
  console.log(user,pass,"mailiuser"  )
  try {
    console.log("i was here", req.body);
    console.log(user,pass,"mailiuser"  )
    // Extracting data from the request body
    const { to, subject, text } = req.body;

    // Define mailOptions for sending the email
    const mailOptions = {
      from: 'mahimasharma052002@gmail.com',  // Your email address
      to: to,  // Recipient's email
      subject: subject,  // Subject of the email
      text: text,  // Body of the email
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond with a success message
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);  // Log the error for debugging
    res.status(500).json({ message: 'Failed to send email', error });  // Send failure response
  }
};




exports.createRequest = async (req, res) => {
  const { rideId } = req.body;
  console.log(" bhai chl ja code!",req.body)
  const userId = req.user.id; // rider

  // Get driver_id from rides table
  const [[ride]] = await db.query('SELECT user_id FROM ride_publish_details WHERE id = ?', [rideId]);
  console.log(ride,"<<<>>>>>>>>",req.user.id,"ride")
  const driverId =req.body.driverId;
console.log(driverId,"driverId")

  // Insert into ride_requests
  const [result] = await db.query(
    'INSERT INTO ride_requests (ride_id, user_id, status) VALUES (?, ?, ?)',   [rideId, userId, 'pending']
  );
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", rideId,userId,driverId )
  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<result>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",result)

  const requestId = result.insertId;
  console.log("requested id>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", requestId)
  const driverEmail = await getUserEmail(driverId);

  const acceptLink = ` https://mhima-sharma.github.io/Weather-App/api/ride-requests/${requestId}/accept`;
  const rejectLink = ` https://mhima-sharma.github.io/Weather-App/api/ride-requests/${requestId}/reject`;


  // await sendEmail({
  //   to: driverEmail,
  //   subject: 'New Ride Request',
  //   html: `<p>You have a new ride request.</p><a href="${acceptLink}">Accept</a> | <a href="${rejectLink}">Reject</a>`
  // });
  
  const mailOptions = {
    from: 'mahimasharma052002@gmail.com',
    to: driverEmail,
    subject: 'New Ride Request',
    html: `<p>You have a new ride request.</p><a href="${acceptLink}">Accept</a> | <a href="${rejectLink}">Reject</a>`
  };

  // Send the email
  await transporter.sendMail(mailOptions);
  res.json({ message: 'Ride request sent to driver.' });
};

exports.acceptRequest = async (req, res) => {
  const requestId = req.params.id;
  console.log("accept issue", requestId)
  await db.query('UPDATE ride_requests SET status = ? WHERE id = ?', ['accepted', requestId]);

  const [[request]] = await db.query('SELECT user_id FROM ride_requests WHERE id = ?', [requestId]);
  const riderEmail = await getUserEmail(request.user_id);

  await sendEmail({
    to: riderEmail,
    subject: 'Your ride request was accepted',
    html: '<p>Good news! Your ride request was accepted by the driver.</p>'
  });

  res.send('Request accepted and rider notified.');
};

exports.rejectRequest = async (req, res) => {
  const requestId = req.params.id;

  await db.query('UPDATE ride_requests SET status = ? WHERE id = ?', ['rejected', requestId]);

  const [[request]] = await db.query('SELECT user_id FROM ride_requests WHERE id = ?', [requestId]);
  const riderEmail = await getUserEmail(request.user_id);

  await sendEmail({
    to: riderEmail,
    subject: 'Your ride request was rejected',
    html: '<p>Unfortunately, the driver rejected your ride request.</p>'
  });

  res.send('Request rejected and rider notified.');
};