const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

module.exports = async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text
  };

  return transporter.sendMail(mailOptions);
};
