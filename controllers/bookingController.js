const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');

exports.createBooking = async (req, res) => {
  const {
    ride_id,
    driver_id,
    rider_id,
    from_location,
    to_location,
    date,
    time,
    price,
    driver_email,
    rider_email,
    rider_name
  } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO bookings
      (ride_id, driver_id, rider_id, from_location, to_location, date, time, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ride_id, driver_id, rider_id, from_location, to_location, date, time, price]
    );

    // Send email to driver
    await sendEmail(driver_email, "New Ride Booking", `
      You have a new ride booking from ${from_location} to ${to_location} on ${date} at ${time}.
      Rider: ${rider_name} (${rider_email})
    `);

    // Send email to rider
    await sendEmail(rider_email, "Ride Booking Created", `
      Your booking from ${from_location} to ${to_location} on ${date} at ${time} is pending.
      Driver will accept/reject soon.
    `);

    res.status(201).json({ message: 'Booking created and emails sent', bookingId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating booking', error });
  }
};
exports.updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body; // status = 'accepted' or 'rejected'

  try {
    const [booking] = await db.execute(
      `SELECT * FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (!booking.length) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedBooking = booking[0];

    await db.execute(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, bookingId]
    );

    // Notify rider
    await sendEmail(updatedBooking.rider_email, `Your booking has been ${status}`, `
      Your booking from ${updatedBooking.from_location} to ${updatedBooking.to_location} on ${updatedBooking.date} at ${updatedBooking.time} has been ${status} by the driver.
    `);

    res.json({ message: `Booking ${status} and rider notified.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating booking status', error });
  }
};
