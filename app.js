const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');

// Import routes
const rideRoutes = require('./routes/ride.routes');
const authRoutes = require('./routes/auth.routes');
const complaintRoutes = require('./routes/complaint.routes');
const stopRoutes = require('./routes/stop.routes');
const publishRideRoutes = require('./routes/publishride.routes');
const profileRoutes = require('./routes/profile.routes');
const rideRequest = require('./routes/rideRoutes');
// ride request ke liye 
const rideRequestRoutes = require("./routes/rideRequestRoutes");

const bookingRoutes = require('./routes/bookingRoutes');



// const rideRoutes = require('./routes/publishride.routes');



// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({extended: true}));

// Use routes
app.use('/api/publishride', publishRideRoutes);
app.use('/api/auth', authRoutes);
// this is publihed ride show 
app.use('/api/ride', rideRoutes); 
app.use('/api/complaints', complaintRoutes);
app.use('/api/user', stopRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/rides', publishRideRoutes);
app.use('/api', rideRequest);
// app.use("/api/rides", rideRequestRoutes); //ride request ke liye testing 
app.use('/api/ride-requests', rideRequestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bookings/update-status', bookingRoutes);
app.use('/api/rides', bookingRoutes);

app.use('/rider/:riderId', bookingRoutes);
app.use('/driver/:driverId', bookingRoutes);
app.use('/:bookingId', bookingRoutes);

// Optional: basic health check endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
