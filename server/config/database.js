import mysql from 'mysql2/promise';

// Create connection pool for better performance
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export default pool;
