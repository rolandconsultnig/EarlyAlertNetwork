/**
 * MySQL Connection Test Script for cPanel Deployment
 * 
 * This script tests the connection to your MySQL database and verifies that
 * the tables have been created properly. Run this script after setting up
 * your database and environment variables to verify everything is working.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper to parse DATABASE_URL or use individual connection parameters
function getConnectionConfig() {
  // Check for DATABASE_URL format
  if (process.env.DATABASE_URL) {
    console.log("Using DATABASE_URL for connection...");
    const match = process.env.DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (match) {
      const [_, user, password, host, port, database] = match;
      return {
        host,
        user,
        password,
        port: parseInt(port),
        database,
        multipleStatements: true
      };
    } else {
      console.warn("WARNING: DATABASE_URL is present but format appears invalid.");
      console.warn("Format should be: mysql://user:password@host:port/database");
      console.warn("Falling back to individual connection parameters...");
    }
  }
  
  // Use individual parameters
  console.log("Using individual connection parameters...");
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true
  };
}

async function testConnection() {
  console.log("======================================");
  console.log("MySQL Connection Test for cPanel Deployment");
  console.log("======================================");
  console.log("\nTesting database connection...");
  
  let connection;
  
  try {
    const config = getConnectionConfig();
    
    // Display connection info (sanitized)
    console.log("\nConnection information:");
    console.log(`- Host: ${config.host}`);
    console.log(`- Port: ${config.port}`);
    console.log(`- User: ${config.user}`);
    console.log(`- Database: ${config.database}`);
    console.log(`- Password: ${'*'.repeat(config.password?.length || 8)}`);
    
    // Test connection
    console.log("\nAttempting to connect...");
    connection = await mysql.createConnection(config);
    console.log("✅ Connection successful!");
    
    // Check database tables
    console.log("\nVerifying database tables...");
    const [tables] = await connection.query("SHOW TABLES");
    
    if (tables.length === 0) {
      console.error("⚠️ WARNING: No tables found in the database!");
      console.error("Run the mysql-schema.js script to create the required tables.");
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      const tableList = [];
      const tableField = `Tables_in_${config.database}`;
      
      for (const tableRow of tables) {
        tableList.push(tableRow[tableField]);
      }
      console.log("  - " + tableList.join("\n  - "));
      
      // Check if essential tables exist
      const essentialTables = ['users', 'incidents', 'alerts', 'risk_indicators', 'sessions'];
      const missingTables = essentialTables.filter(table => !tableList.includes(table));
      
      if (missingTables.length > 0) {
        console.error("\n⚠️ WARNING: Some essential tables are missing:");
        console.error("  - " + missingTables.join("\n  - "));
        console.error("Run the mysql-schema.js script to create all required tables.");
      } else {
        console.log("\n✅ All essential tables are present.");
      }
      
      // Check if admin user exists
      console.log("\nChecking for admin user...");
      const [users] = await connection.query("SELECT id, username, role FROM users WHERE username = 'admin'");
      
      if (users.length === 0) {
        console.error("⚠️ WARNING: Admin user not found!");
        console.error("Run the mysql-schema.js script to create the default admin user.");
      } else {
        console.log("✅ Admin user found:", users[0]);
      }
    }
    
    console.log("\n======================================");
    console.log("Test completed successfully!");
    console.log("Your database connection is working properly.");
    console.log("======================================");
    
  } catch (error) {
    console.error("\n❌ ERROR: Connection failed!");
    console.error(error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("\nAccess denied error. Please check:");
      console.error("1. Your database username and password are correct");
      console.error("2. The user has permissions to access the database");
      console.error("3. The MySQL user has been added to the database in cPanel");
    } else if (error.code === 'ECONNREFUSED') {
      console.error("\nConnection refused. Please check:");
      console.error("1. MySQL server is running");
      console.error("2. Host and port are correct");
      console.error("3. No firewall is blocking the connection");
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error("\nDatabase not found. Please check:");
      console.error("1. The database name is correct");
      console.error("2. The database has been created in cPanel");
      console.error("3. For cPanel, remember the database name might need your cPanel username prefix");
    }
    
    console.error("\nFor more help, see TROUBLESHOOTING.md");
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testConnection().catch(console.error);