const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bla_bla',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: Run a test query to verify connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ MySQL pool connected');
    await connection.release();
  } catch (err) {
    console.error('❌ MySQL pool connection failed:', err.message);
  }
})();

module.exports = db;
