const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  user: 'EXiquHJCwfBcpbR.root',
  password: 'nF62NsJHp3nYcyFq',
  database: 'buddy_ride',
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0
    ssl: {
    rejectUnauthorized: true   // Required by TiDB Cloud
  }
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
