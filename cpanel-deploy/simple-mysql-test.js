// simple-mysql-test.js - Quick test script for MySQL connection
const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper to get connection config from DATABASE_URL or individual parameters
function getConnectionConfig() {
  // First try to use DATABASE_URL
  if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL for connection');
    const match = process.env.DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!match) {
      console.error('Error: Invalid MySQL connection string format');
      console.error('Expected format: mysql://username:password@hostname:port/database');
      return null;
    }
    
    const [_, user, password, host, port, database] = match;
    return {
      host,
      user,
      password,
      port: parseInt(port),
      database
    };
  }
  
  // Fall back to individual parameters
  console.log('Using individual DB parameters for connection');
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT || 3306;
  
  if (!user || !password || !database) {
    console.error('Error: Database connection information missing');
    console.error('Please provide either DATABASE_URL or individual connection parameters');
    console.error('  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    return null;
  }
  
  return { host, user, password, port, database };
}

// Run test
async function testConnection() {
  console.log('=== MySQL Connection Test ===');
  console.log('Testing database connection...');
  
  const config = getConnectionConfig();
  if (!config) {
    process.exit(1);
  }
  
  // Show connection info (without password)
  console.log('Connection details:');
  console.log(`  Host: ${config.host}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  Port: ${config.port}`);
  
  try {
    // Test connection
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      database: config.database
    });
    
    console.log('✓ Successfully connected to MySQL database!');
    
    // Test simple query
    console.log('Testing basic query...');
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log(`✓ Query successful! Result: ${rows[0].result}`);
    
    // Show database info
    console.log('Checking MySQL version...');
    const [versionRows] = await connection.execute('SELECT VERSION() AS version');
    console.log(`✓ MySQL Version: ${versionRows[0].version}`);
    
    // Check tables
    console.log('Checking for application tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠ No tables found in the database.');
      console.log('Run the database initialization script:');
      console.log('  node mysql-schema.js');
    } else {
      console.log(`✓ Found ${tables.length} tables in the database:`);
      tables.forEach(table => {
        const tableName = table[Object.keys(table)[0]];
        console.log(`  - ${tableName}`);
      });
    }
    
    // Test admin user
    console.log('Checking for admin user...');
    try {
      const [users] = await connection.execute('SELECT id, username, role FROM users WHERE username = "admin"');
      if (users.length > 0) {
        console.log(`✓ Admin user found (ID: ${users[0].id}, Role: ${users[0].role})`);
      } else {
        console.log('⚠ Admin user not found. Database may not be properly initialized.');
      }
    } catch (error) {
      console.log('⚠ Could not check for admin user. "users" table may not exist.');
    }
    
    // Close connection
    await connection.end();
    console.log('Connection closed.');
    console.log('=== Test Complete ===');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to MySQL server. Check if:');
      console.error('1. MySQL server is running');
      console.error('2. Hostname and port are correct');
      console.error('3. Firewall is not blocking the connection');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check if:');
      console.error('1. Username is correct');
      console.error('2. Password is correct');
      console.error('3. User has permissions to access the server');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Check if:');
      console.error('1. Database name is correct');
      console.error('2. Database has been created');
      console.error('3. User has permissions to access this database');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Hostname not found. Check if:');
      console.error('1. Hostname is correct');
      console.error('2. DNS is resolving the hostname correctly');
    }
    
    console.error('=== Test Failed ===');
    process.exit(1);
  }
}

testConnection();