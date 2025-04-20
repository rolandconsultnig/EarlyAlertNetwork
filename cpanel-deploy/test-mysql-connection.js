/**
 * MySQL Connection Test Script for cPanel Deployment
 * 
 * This script tests the connection to your MySQL database and verifies that
 * the tables have been created properly. Run this script after setting up
 * your database and environment variables to verify everything is working.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Get database connection configuration
function getConnectionConfig() {
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'ipcr-new',
    port: process.env.MYSQL_PORT || 3306,
  };
}

// Main function to test connection
async function testConnection() {
  let connection;
  
  console.log('\n🔎 Testing MySQL Connection for IPCR Early Warning System\n');
  
  try {
    const config = getConnectionConfig();
    
    // Display connection info (but hide password)
    console.log('Connection details:');
    console.log('   Host:', config.host);
    console.log('   User:', config.user);
    console.log('   Database:', config.database);
    console.log('   Port:', config.port);
    
    console.log('\nAttempting to connect...');
    
    // Try to connect
    connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to MySQL!');
    
    // Check tables
    console.log('\nChecking database tables...');
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    console.log(`Found ${tableNames.length} tables:`);
    tableNames.forEach(table => console.log(`   - ${table}`));
    
    // Check required tables
    const requiredTables = [
      'users', 'incidents', 'data_sources', 'alerts', 
      'response_plans', 'sessions'
    ];
    
    const missingTables = requiredTables.filter(table => 
      !tableNames.includes(table) && !tableNames.includes(table.toLowerCase())
    );
    
    if (missingTables.length > 0) {
      console.log('\n⚠️ Missing required tables:');
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log('\nPlease import the schema.sql file to create all tables.');
    } else {
      console.log('\n✅ All required tables exist!');
    }
    
    // Check for admin user
    console.log('\nChecking for admin user...');
    const [adminUsers] = await connection.query('SELECT id, username, role, securityLevel FROM users WHERE username = ?', ['admin']);
    
    if (adminUsers.length > 0) {
      console.log('✅ Admin user exists:');
      console.log('   ID:', adminUsers[0].id);
      console.log('   Username:', adminUsers[0].username);
      console.log('   Role:', adminUsers[0].role);
      console.log('   Security Level:', adminUsers[0].securityLevel);
    } else {
      console.log('⚠️ Admin user not found in database!');
      console.log('Run the following SQL query to create the admin user:');
      console.log(`
INSERT INTO users (username, password, fullName, email, role, createdAt, securityLevel) 
VALUES ('admin', '$2a$10$9XxQKzAKA2iBV2mNlQHgXOJCbw5XtpnbfpVirk9a.irFIQET9H3zK', 'System Administrator', 'admin@example.com', 'admin', NOW(), 'high');
      `);
    }
    
    // Check record counts for key tables
    console.log('\nCounting records in key tables:');
    
    const tables_to_count = [
      'users', 'incidents', 'data_sources', 'alerts', 
      'response_plans', 'risk_indicators', 'surveys'
    ];
    
    for (const table of tables_to_count) {
      try {
        const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   - ${table}: ${countResult[0].count} records`);
      } catch (err) {
        console.log(`   - ${table}: Table not found or error: ${err.message}`);
      }
    }
    
    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ MySQL Connection Error:', error.message);
    console.log('\nPlease check:');
    console.log('1. Your database credentials in the .env file');
    console.log('2. That the MySQL server is running');
    console.log('3. That the database has been created');
    console.log('4. That the user has permissions on the database');
    
    const config = getConnectionConfig();
    if (!config.user || !config.password) {
      console.log('\n⚠️ Missing database credentials in .env file!');
      console.log('Make sure you have these variables in your .env file:');
      console.log('   MYSQL_HOST=your_host (usually localhost)');
      console.log('   MYSQL_USER=your_database_username');
      console.log('   MYSQL_PASSWORD=your_database_password');
      console.log('   MYSQL_DATABASE=ipcr-new');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the test
testConnection();