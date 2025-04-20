// db-mysql.js - MySQL adapter for cPanel deployment
const mysql = require('mysql2/promise');
require('dotenv').config();

// Parse connection string
const getConnectionConfig = (url) => {
  // Example: mysql://user:password@localhost:3306/dbname
  const matches = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!matches) throw new Error('Invalid MySQL connection string');
  
  return {
    host: matches[3],
    user: matches[1],
    password: matches[2],
    port: parseInt(matches[4]),
    database: matches[5],
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
};

// Create MySQL connection pool with error handling
let pool;
try {
  pool = mysql.createPool(
    process.env.DATABASE_URL ? 
    getConnectionConfig(process.env.DATABASE_URL) : 
    {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ipcr_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }
  );
  
  // Test the connection on startup
  (async () => {
    try {
      const connection = await pool.getConnection();
      console.log('Successfully connected to MySQL database');
      connection.release();
    } catch (error) {
      console.error('Failed to connect to MySQL database:', error.message);
      console.error('Please check your DATABASE_URL or individual database credentials');
      console.error('Connection details:', process.env.DATABASE_URL ? 
        'Using DATABASE_URL' : 
        {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          database: process.env.DB_NAME || 'ipcr_db',
        }
      );
    }
  })();
} catch (error) {
  console.error('Error creating MySQL connection pool:', error.message);
  console.error('Please check your DATABASE_URL environment variable');
  process.exit(1);
}

// Simple query wrapper function
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    // Log the error with query details (but sanitize sensitive data)
    console.error('Database query error:', error.message);
    console.error('Query:', sql.substring(0, 200) + (sql.length > 200 ? '...' : ''));
    console.error('Parameters:', Array.isArray(params) ? 
      `[${params.length} items]` : 
      'Object parameters');
    
    // Distinguish between connection errors and query errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Database connection error - please check your database credentials and connection settings');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist - please check your database name');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('Table does not exist - please run the database initialization script');
    }
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

// Adapter functions that mimic Drizzle ORM operations
const db = {
  // Select operation
  select: async (table, where = {}) => {
    let sql = `SELECT * FROM ${table}`;
    const params = [];
    
    if (Object.keys(where).length > 0) {
      const conditions = [];
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    return await query(sql, params);
  },
  
  // Insert operation
  insert: async (table, data) => {
    const keys = Object.keys(data);
    const placeholders = Array(keys.length).fill('?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await pool.execute(sql, values);
    
    // Get the inserted ID
    const [insertInfo] = result;
    const insertedId = insertInfo.insertId;
    
    // Return the inserted record
    const [insertedRecord] = await pool.execute(`SELECT * FROM ${table} WHERE id = ?`, [insertedId]);
    return insertedRecord[0];
  },
  
  // Update operation
  update: async (table, id, data) => {
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
    
    values.push(id); // Add ID for WHERE clause
    
    const sql = `UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`;
    await pool.execute(sql, values);
    
    // Return the updated record
    const [updatedRecord] = await pool.execute(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return updatedRecord[0];
  },
  
  // Delete operation
  delete: async (table, id) => {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  },
  
  // Transaction support
  transaction: async (callback) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Raw query execution
  execute: async (sql, params = []) => {
    return await query(sql, params);
  }
};

module.exports = { 
  pool, 
  db,
  query
};