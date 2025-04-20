/**
 * MySQL Schema Check for cPanel Deployment
 * 
 * This script checks the current database schema against the expected schema
 * and outputs SQL statements to bring the database up to date if needed.
 * 
 * Use this when SSH access is not available and you need to update your schema
 * through phpMyAdmin or another MySQL client.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Table definitions that should exist in the database
const EXPECTED_TABLES = [
  'users',
  'data_sources',
  'incidents',
  'incident_reactions',
  'alerts',
  'response_activities', 
  'response_teams',
  'risk_indicators',
  'risk_analyses',
  'response_plans',
  'api_keys',
  'webhooks',
  'surveys',
  'survey_responses',
  'sessions'
];

// Expected columns for key tables (not exhaustive, but checks critical tables)
const EXPECTED_COLUMNS = {
  'users': [
    'id', 'username', 'password', 'fullName', 
    'email', 'role', 'createdAt', 'securityLevel'
  ],
  'incidents': [
    'id', 'title', 'description', 'location', 'coordinates',
    'region', 'category', 'severity', 'status', 'reportedAt',
    'reporterId', 'verificationStatus', 'mediaUrls', 'sourceId',
    'state', 'localAreaName', 'translationInfo'
  ],
  'surveys': [
    'id', 'title', 'description', 'questions', 'createdBy', 
    'createdAt', 'isTemplate', 'category', 'status'
  ]
};

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

// Main function to check schema
async function checkSchema() {
  let connection;
  
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(getConnectionConfig());
    
    // Get list of tables in the database
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0].toLowerCase());
    
    console.log(`Found ${tableNames.length} tables in database.`);
    
    // Check for missing tables
    const missingTables = EXPECTED_TABLES.filter(table => !tableNames.includes(table));
    if (missingTables.length > 0) {
      console.log('\n⚠️ Missing tables detected:');
      missingTables.forEach(table => console.log(`  - ${table}`));
      console.log('\nPlease run the mysql-schema.sql file to create all required tables.');
      console.log('You can find this file in the cpanel-deploy directory.');
    } else {
      console.log('✅ All expected tables exist in the database.');
      
      // Check columns for key tables
      let missingColumns = false;
      
      for (const [tableName, expectedCols] of Object.entries(EXPECTED_COLUMNS)) {
        const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
        const columnNames = columns.map(col => col.Field.toLowerCase());
        
        const missingCols = expectedCols.filter(col => !columnNames.includes(col.toLowerCase()));
        
        if (missingCols.length > 0) {
          missingColumns = true;
          console.log(`\n⚠️ Table '${tableName}' is missing columns:`);
          missingCols.forEach(col => console.log(`  - ${col}`));
        }
      }
      
      if (!missingColumns) {
        console.log('✅ All checked tables have the expected columns.');
      } else {
        console.log('\nPlease run a database migration or update your schema manually.');
      }
    }
    
    // Generate SQL to create admin user if it doesn't exist
    const [adminExists] = await connection.query('SELECT COUNT(*) as count FROM users WHERE username = ?', ['admin']);
    if (adminExists[0].count === 0) {
      const adminPassword = '$2a$10$9XxQKzAKA2iBV2mNlQHgXOJCbw5XtpnbfpVirk9a.irFIQET9H3zK'; // hashed form of "@admin123321nimda$"
      console.log('\n⚠️ Admin user not found. SQL to create admin user:');
      console.log(`
INSERT INTO users (username, password, fullName, email, role, createdAt, securityLevel) 
VALUES ('admin', '${adminPassword}', 'System Administrator', 'admin@example.com', 'admin', NOW(), 'high');
      `);
    } else {
      console.log('✅ Admin user exists in the database.');
    }
    
  } catch (error) {
    console.error('Error connecting to database or checking schema:', error);
    console.log('\n❌ Please check your database connection settings in .env file:');
    console.log('  MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkSchema();