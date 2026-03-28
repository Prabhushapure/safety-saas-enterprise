import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import process from 'node:process';

// Load environment variables from .env file in development
dotenv.config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'safety_saas',
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
