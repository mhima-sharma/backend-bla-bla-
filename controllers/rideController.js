const db = require('../config/db');
const { getIO, getConnectedUsers } = require('../socket');
// const sendEmail = require('../utils/sendEmail'); // Optional

// 🚗 1. User requests a ride
exports.requestRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id; // From auth middleware

    // 1. Save ride request
    await db.query(
      "INSERT INTO ride_requests (ride_id, user_id, status) VALUES (?, ?, 'pending')",
      [rideId, userId]
    );

    // 2. Find ride to get driver_id
    const [ride] = await db.query("SELECT user_id FROM ride_publish_details WHERE id = ?", [rideId]);
    if (!ride.length) return res.status(404).json({ message: 'Ride not found' });
    console.log(ride[0], "ride");
    const driverId = ride[0].user_id;
    console.log(driverId, "driverId");

    
    // 3. Send real-time notification to driver
    const io = getIO();
    console.log(io,"io")
    const connectedUsers = getConnectedUsers();
    const driverSocketId = connectedUsers.get(driverId.toString());
    console.log(driverSocketId,driverId.toString(), "driverSocketId");

    if (driverSocketId) {
      const payload = {
        rideId,
        userId,
        message: "You have a new ride request"
      };

      io.to(driverSocketId).emit("ride-request", payload, (acknowledgment) => {
        console.log("✅ Driver acknowledged ride request:", acknowledgment);
      });
    } else {
      console.log("Driver is not connected");
      // Optionally, you could send an email here if needed
    }
    return res.status(200).json({ message: "Ride requested successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ 2. Driver approves/rejects a request
exports.updateRideRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // 1. Update request status
    await db.query(
      "UPDATE ride_requests SET status = ? WHERE id = ?",
      [status, requestId]
    );

    // 2. Get user ID of requester
    const [request] = await db.query("SELECT user_id FROM ride_requests WHERE id = ?", [requestId]);
    if (!request.length) return res.status(404).json({ message: 'Request not found' });

    const userId = request[0].user_id;

    // 3. Notify user via Socket.io
    const io = getIO();
    const connectedUsers = getConnectedUsers();
    const userSocketId = connectedUsers.get(userId.toString());

    if (userSocketId) {
      io.to(userSocketId).emit("ride-request-update", {
        requestId,
        status,
        message: `Your ride request was ${status}`
      });
    } else {
      console.log("User is not connected");
      // Optionally, you could send an email here if needed
    }

    return res.status(200).json({ message: `Request ${status} successfully` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
