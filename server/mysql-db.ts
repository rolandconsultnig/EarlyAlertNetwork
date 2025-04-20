import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '@shared/mysql-schema';

// MySQL Configuration
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: 3306,
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASSWORD || '$admin123321nimda@',
  database: process.env.MYSQL_DATABASE || 'ipcr-new',
};

// Create a connection pool with the configuration
export const poolPromise = mysql.createPool(MYSQL_CONFIG);

// Create a Drizzle ORM instance with the connection pool
export const db = drizzle(poolPromise, { schema, mode: 'default' });

/**
 * Test the connection to the MySQL database
 * @returns true if connected successfully, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await poolPromise.getConnection();
    console.log('Connected to MySQL database: ' + MYSQL_CONFIG.database);
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    return false;
  }
}

// Adapter for express-mysql-session
export { poolPromise as pool };