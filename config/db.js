const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com' ,
  user: process.env.DB_USER || 'EXiquHJCwfBcpbR.root',
  password: process.env.DB_PASS || 'nF62NsJHp3nYcyFq',
  database: process.env.DB_NAME || 'buddy_ride',
    port: 4000, 
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 10000,
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
