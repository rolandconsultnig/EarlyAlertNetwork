import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// MySQL connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASSWORD || '$admin123321nimda@',
  database: process.env.MYSQL_DATABASE || 'ipcr-new',
};

// Create a connection pool
const poolPromise = mysql.createPool(dbConfig);

// Export the database connection with drizzle ORM
export const db = drizzle(poolPromise, { schema, mode: 'default' });

// Verify connection
export async function testConnection() {
  try {
    const connection = await poolPromise.getConnection();
    console.log('MySQL database connection successful!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    return false;
  }
}