const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');

// ================= CREATE BOOKING =================
exports.createBooking = async (req, res) => {
  const {
    ride_id,
    driver_id,
    rider_id,
    from_location,
    to_location,
    date,
    time,
    price_per_seat,
    seats_booked,
    driver_email,
    rider_email,
    rider_name
  } = req.body;

  console.log('CREATE BOOKING HIT');
  console.log(req.body);

  try {
    // 🔒 SECURITY: calculate total on backend
    const finalSeats = seats_booked || 1;
    const finalPricePerSeat = price_per_seat || 0;
    const totalAmount = finalSeats * finalPricePerSeat;

    const [result] = await db.execute(
      `INSERT INTO bookings
      (
        ride_id,
        driver_id,
        rider_id,
        from_location,
        to_location,
        date,
        time,
        price_per_seat,
        seats_booked,
        total_amount,
        status,
        rider_email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ride_id,
        driver_id,
        rider_id,
        from_location,
        to_location,
        date,
        time,
        finalPricePerSeat,
        finalSeats,
        totalAmount,
        'pending',
        rider_email
      ]
    );

    // 📧 Email to driver
    await sendEmail(
      driver_email,
      'New Ride Booking Request',
      `
New booking request received:

Route: ${from_location} → ${to_location}
Date: ${date}
Time: ${time}

Rider: ${rider_name} (${rider_email})
Seats Booked: ${finalSeats}
Price per Seat: ₹${finalPricePerSeat}
Total Amount: ₹${totalAmount}

Please accept or reject the booking.
      `
    );

    // 📧 Email to rider
    await sendEmail(
      rider_email,
      'Ride Booking Created',
      `
Your booking request has been sent successfully.

Route: ${from_location} → ${to_location}
Date: ${date}
Time: ${time}

Seats: ${finalSeats}
Total Amount: ₹${totalAmount}

Status: Pending (waiting for driver response)
      `
    );

    res.status(201).json({
      message: 'Booking created and emails sent',
      bookingId: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error creating booking',
      error
    });
  }
};

// ================= UPDATE BOOKING STATUS =================
exports.updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params; // get bookingId from URL
  const { status } = req.body;      // accepted | rejected

  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Fetch the booking
    const [rows] = await db.execute(
      `SELECT * FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    // Update booking status
    await db.execute(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, bookingId]
    );

    // Notify rider via email
    await sendEmail(
      booking.rider_email,
      `Booking ${status}`,
      `
Your booking has been ${status} by the driver.

Route: ${booking.from_location} → ${booking.to_location}
Date: ${booking.date}
Time: ${booking.time}

Seats: ${booking.seats_booked}
Total Amount: ₹${booking.total_amount}
      `
    );

    // Return success
    res.json({
      message: `Booking ${status} successfully`,
      bookingId,
      status
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      message: 'Error updating booking status',
      error
    });
  }
};

// ================= GET ALL BOOKINGS =================
exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM bookings ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};
// ================= GET BOOKINGS BY RIDER =================
exports.getBookingsByRider = async (req, res) => {
  const { riderId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT *
       FROM bookings
       WHERE rider_id = ?
       ORDER BY created_at DESC`,
      [riderId]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rider bookings'
    });
  }
};
// ================= GET BOOKINGS BY DRIVER =================
exports.getBookingsByDriver = async (req, res) => {
  const { driverId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT *
       FROM bookings
       WHERE driver_id = ?
       ORDER BY created_at DESC`,
      [driverId]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver bookings'
    });
  }
};
// ================= GET BOOKING BY ID =================
exports.getBookingById = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
};



