const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function sendEmail(to, subject, text) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'BuddyRide <sharmamahima0510@gamil.com>',
      to,
      subject,
      html: `<p>${text}</p>`
    });
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw error;
  }
};
