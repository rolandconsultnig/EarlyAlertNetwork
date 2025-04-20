// export-mysql-database.js
// Script to export MySQL database to a SQL file for cPanel deployment

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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

// Function to export the database
async function exportDatabase() {
  console.log('=== MySQL Database Export ===');
  
  const config = getConnectionConfig();
  if (!config) {
    process.exit(1);
  }
  
  console.log(`Connecting to MySQL database '${config.database}' on ${config.host}...`);
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      database: config.database
    });
    
    console.log('Connected successfully.');
    
    // Get list of tables
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.error('No tables found in the database. Please initialize the database first.');
      await connection.end();
      process.exit(1);
    }
    
    console.log(`Found ${tables.length} tables.`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'db_export');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Prepare output file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `${config.database}_${timestamp}.sql`);
    
    // Start writing SQL file
    let sqlContent = `-- IPCR Early Warning & Response System - Database Export\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
    sqlContent += `-- Database: ${config.database}\n\n`;
    
    // Add drop database and create database statements
    sqlContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;
    sqlContent += `-- Create database\n`;
    sqlContent += `DROP DATABASE IF EXISTS \`${config.database}\`;\n`;
    sqlContent += `CREATE DATABASE \`${config.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    sqlContent += `USE \`${config.database}\`;\n\n`;
    
    // Process each table
    for (const tableObj of tables) {
      const tableName = tableObj[Object.keys(tableObj)[0]];
      console.log(`Exporting table: ${tableName}`);
      
      // Get table structure
      const [tableStructure] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      const createTableSQL = tableStructure[0]['Create Table'];
      
      // Add table structure to SQL file
      sqlContent += `-- Table structure for table \`${tableName}\`\n`;
      sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlContent += `${createTableSQL};\n\n`;
      
      // Get table data
      const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        // Add table data to SQL file
        sqlContent += `-- Data for table \`${tableName}\`\n`;
        
        // Generate insert statements in batches
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          
          // Start insert statement
          sqlContent += `INSERT INTO \`${tableName}\` VALUES\n`;
          
          // Add each row
          batch.forEach((row, index) => {
            const values = Object.values(row).map(value => {
              if (value === null) return 'NULL';
              if (typeof value === 'number') return value;
              if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
              return `'${String(value).replace(/'/g, "''")}'`;
            });
            
            sqlContent += `(${values.join(', ')})`;
            sqlContent += index === batch.length - 1 ? ';\n' : ',\n';
          });
        }
        
        sqlContent += '\n';
      }
    }
    
    // Re-enable foreign key checks
    sqlContent += `SET FOREIGN_KEY_CHECKS=1;\n`;
    
    // Write the SQL file
    fs.writeFileSync(outputFile, sqlContent);
    
    console.log(`Database exported successfully to: ${outputFile}`);
    
    // Close connection
    await connection.end();
    console.log('Database connection closed.');
    console.log('=== Export Complete ===');
    
  } catch (error) {
    console.error('Export failed:', error.message);
    console.error('=== Export Failed ===');
    process.exit(1);
  }
}

// Run the database export
exportDatabase();