require('dotenv').config();
const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("🪪 Auth Header Received:", authHeader);
  const token = authHeader?.split(' ')[1];
  console.log("🔐 Token Extracted:", token);
  if (!token) return res.sendStatus(401);

  try {
    // const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // // req.user = user;
    // req.user = decoded; 
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err, "error");
    return res.sendStatus(403);
  }
}

module.exports = authenticateToken;
