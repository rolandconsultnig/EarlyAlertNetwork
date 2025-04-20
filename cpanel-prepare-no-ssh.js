/**
 * IPCR Early Warning & Response System - cPanel Preparation Script (No SSH Access)
 * 
 * This script prepares the project for deployment to cPanel without requiring SSH access.
 * It creates and updates files in the cpanel-deploy directory ready for FTP upload.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing IPCR Early Warning System for cPanel deployment (no SSH)...\n');

// Paths
const sourceDir = __dirname;
const deployDir = path.join(sourceDir, 'cpanel-deploy');
const serverDir = path.join(sourceDir, 'server');

// Create the deployment directory if it doesn't exist
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Create MySQL specific server file
const serverMysqlPath = path.join(deployDir, 'server-mysql.js');
if (!fs.existsSync(serverMysqlPath)) {
  console.log('Creating MySQL server file...');
  
  // Get server file content
  let serverContent = fs.readFileSync(path.join(serverDir, 'index.ts'), 'utf8');
  
  // Replace imports for TypeScript to CommonJS
  serverContent = serverContent.replace(
    /import\s+{([^}]+)}\s+from\s+["']([^"']+)["']/g, 
    (match, imports, module) => {
      if (module.startsWith('@shared')) {
        // Handle shared imports by changing to require
        return `const { ${imports} } = require('./schema')`;
      } else if (module.startsWith('./db')) {
        return `// MySQL connection will be set up directly`;
      } else {
        return `const { ${imports} } = require('${module}')`;
      }
    }
  );
  
  // Replace ESM imports with CommonJS requires
  serverContent = serverContent.replace(
    /import\s+(\w+)\s+from\s+["']([^"']+)["']/g,
    (match, name, module) => {
      if (module.startsWith('@shared')) {
        return `const ${name} = require('./schema')`;
      } else {
        return `const ${name} = require('${module}')`;
      }
    }
  );
  
  // Add MySQL specific code
  const mysqlSetup = `
// MySQL Database Connection
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('connect-mysql')(session);

// MySQL connection options
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'ipcr-new',
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL database!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    return false;
  }
}

// Session store configuration
const sessionStore = new MySQLStore({
  pool,
  config: dbConfig,
  table: 'sessions'
});

// Database helper function
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}`;

  // Add to the server file
  serverContent = serverContent.replace(
    '// Import dependencies',
    '// Import dependencies\nrequire("dotenv").config();\n' + mysqlSetup
  );
  
  // Replace TypeScript-specific code
  serverContent = serverContent.replace(/export\s+async\s+function/g, 'async function');
  serverContent = serverContent.replace(/export\s+function/g, 'function');
  
  // Add module.exports for CommonJS
  serverContent += `
// Export for use in start script
module.exports = { app, server };`;

  // Convert types to simple JavaScript
  serverContent = serverContent.replace(/:\s*Express/g, '');
  serverContent = serverContent.replace(/:\s*Request/g, '');
  serverContent = serverContent.replace(/:\s*Response/g, '');
  serverContent = serverContent.replace(/:\s*NextFunction/g, '');
  serverContent = serverContent.replace(/<.*?>/g, '');
  
  // Write the converted file
  fs.writeFileSync(serverMysqlPath, serverContent);
}

// Create MySQL schema file
const schemaPath = path.join(deployDir, 'mysql-schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.log('Creating MySQL schema file...');
  
  // Extract schema from shared/schema.ts
  const schemaTs = fs.readFileSync(path.join(sourceDir, 'shared', 'schema.ts'), 'utf8');
  
  // Convert to SQL (simplified version - production should use a proper migration tool)
  let sql = `-- IPCR Early Warning System MySQL Schema
-- Generated for cPanel deployment

SET FOREIGN_KEY_CHECKS=0;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  securityLevel VARCHAR(50) DEFAULT 'medium'
);

-- Data sources table
CREATE TABLE IF NOT EXISTS data_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(255),
  apiKey VARCHAR(255),
  enabled BOOLEAN DEFAULT TRUE,
  lastSyncedAt TIMESTAMP,
  refreshInterval INT,
  description TEXT
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  coordinates JSON,
  region VARCHAR(255),
  category VARCHAR(50),
  severity VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'active',
  reportedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reporterId INT,
  verificationStatus VARCHAR(50) DEFAULT 'unverified',
  mediaUrls JSON,
  sourceId INT,
  state VARCHAR(255),
  localAreaName VARCHAR(255),
  translationInfo JSON,
  FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (sourceId) REFERENCES data_sources(id) ON DELETE SET NULL
);

-- Incident reactions table
CREATE TABLE IF NOT EXISTS incident_reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incidentId INT NOT NULL,
  userId INT NOT NULL,
  emoji VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incidentId) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reaction (incidentId, userId, emoji)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP,
  region VARCHAR(255),
  affectedPopulation INT,
  responseRequired BOOLEAN DEFAULT FALSE,
  sourceCategory VARCHAR(50) DEFAULT 'manual'
);

-- Response activities table
CREATE TABLE IF NOT EXISTS response_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'planned',
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  assignedTeamId INT,
  incidentId INT,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  priority VARCHAR(50) DEFAULT 'medium',
  FOREIGN KEY (assignedTeamId) REFERENCES response_teams(id) ON DELETE SET NULL,
  FOREIGN KEY (incidentId) REFERENCES incidents(id) ON DELETE SET NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Response teams table
CREATE TABLE IF NOT EXISTS response_teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  memberIds JSON,
  contactInfo JSON,
  expertise VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk indicators table
CREATE TABLE IF NOT EXISTS risk_indicators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  value FLOAT NOT NULL,
  trend VARCHAR(50) DEFAULT 'stable',
  category VARCHAR(50),
  region VARCHAR(255),
  source VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  predictedChange FLOAT DEFAULT 0
);

-- Risk analyses table
CREATE TABLE IF NOT EXISTS risk_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  region VARCHAR(255),
  riskLevel VARCHAR(50) DEFAULT 'medium',
  factors JSON,
  recommendations TEXT,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  validUntil TIMESTAMP,
  confidence FLOAT DEFAULT 0.7,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Response plans table
CREATE TABLE IF NOT EXISTS response_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSON,
  resources JSON,
  triggerConditions TEXT,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastUpdated TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft',
  targetRegion VARCHAR(255),
  interAgencyPortal BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  permissions JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NULL,
  lastUsed TIMESTAMP NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  events JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastTriggered TIMESTAMP NULL,
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  questions JSON NOT NULL,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isTemplate BOOLEAN DEFAULT FALSE,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'active',
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  surveyId INT NOT NULL,
  answers JSON NOT NULL,
  respondentInfo JSON,
  submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255),
  ipAddress VARCHAR(50),
  FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE
);

-- Sessions table for persistent sessions
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires INT UNSIGNED NOT NULL,
  data TEXT
);

-- Default admin user
INSERT INTO users (username, password, fullName, email, role, securityLevel) 
VALUES ('admin', '$2a$10$9XxQKzAKA2iBV2mNlQHgXOJCbw5XtpnbfpVirk9a.irFIQET9H3zK', 'System Administrator', 'admin@example.com', 'admin', 'high')
ON DUPLICATE KEY UPDATE id = id;

SET FOREIGN_KEY_CHECKS=1;
`;
  
  fs.writeFileSync(schemaPath, sql);
}

// Create and populate package.json
const packageJsonPath = path.join(deployDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('Creating package.json for deployment...');
  
  const packageJson = {
    "name": "ipcr-early-warning-system",
    "version": "1.0.0",
    "description": "IPCR Early Warning & Response System",
    "main": "start-mysql.cjs",
    "scripts": {
      "start": "node start-mysql.cjs",
      "check-schema": "node check-mysql-schema.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "express-session": "^1.17.3",
      "cors": "^2.8.5",
      "dotenv": "^16.3.1",
      "mysql2": "^3.6.5",
      "connect-mysql": "^4.0.0",
      "passport": "^0.7.0",
      "passport-local": "^1.0.0",
      "bcryptjs": "^2.4.3"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Create starter script
const startScriptPath = path.join(deployDir, 'start-mysql.cjs');
if (!fs.existsSync(startScriptPath)) {
  console.log('Creating start script...');
  
  const startScript = `#!/usr/bin/env node

// IPCR Early Warning System cPanel Starter
// This script starts the server for cPanel environments

// Load environment variables
require('dotenv').config();

// Import the server module
const { app, server } = require('./server-mysql');

// Start the server on the port specified by environment or default to 8080
const PORT = process.env.PORT || 8080;

// This will be used if the server is not already started in the module
if (!server.listening) {
  server.listen(PORT, () => {
    console.log(\`🚀 IPCR Early Warning System server running on port \${PORT}\`);
    console.log(\`🔒 Environment: \${process.env.NODE_ENV || 'development'}\`);
    console.log(\`📅 Server started at: \${new Date().toISOString()}\`);
  });
}

// Handle termination signals properly
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shutdown complete.');
    process.exit(0);
  });
});
`;
  
  fs.writeFileSync(startScriptPath, startScript);
  fs.chmodSync(startScriptPath, '755'); // Make executable
}

// Create environment variables template
const envTemplatePath = path.join(deployDir, '.env.template');
if (!fs.existsSync(envTemplatePath)) {
  console.log('Creating environment variables template...');
  
  const envTemplate = `# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=username_from_cpanel
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=ipcr-new
MYSQL_PORT=3306

# Application settings
PORT=8080
NODE_ENV=production
SESSION_SECRET=replace_with_long_random_string

# API Keys (add as needed)
OPENAI_API_KEY=your_openai_api_key_if_using_translation
`;
  
  fs.writeFileSync(envTemplatePath, envTemplate);
}

// Create .htaccess
const htaccessPath = path.join(deployDir, '.htaccess');
if (!fs.existsSync(htaccessPath)) {
  console.log('Creating .htaccess file...');
  
  const htaccess = `# Handle frontend routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
  
  fs.writeFileSync(htaccessPath, htaccess);
}

// Create a README with deployment instructions
const readmePath = path.join(deployDir, 'README.md');
if (!fs.existsSync(readmePath) || true) { // Always update README
  console.log('Creating README with deployment instructions...');
  
  const readme = `# IPCR Early Warning System - cPanel Deployment (No SSH)

## Overview
This directory contains files prepared for deployment to a cPanel hosting environment without SSH access. Follow these instructions to set up your application.

## Prerequisites
- A cPanel hosting account with Node.js support
- FTP access to your hosting account
- MySQL database access through cPanel
- The ability to set up Node.js applications through the cPanel interface

## Deployment Steps

### 1. Prepare Your cPanel Account
- Log in to your cPanel account
- Navigate to "Setup Node.js App" in cPanel
- Create a new Node.js application:
  - Node.js version: 18.x or higher
  - Application mode: Production
  - Application root: Your desired directory (e.g., 'earlywarning')
  - Application URL: Your domain or subdomain
  - Application startup file: start-mysql.cjs

### 2. Create a MySQL Database
- In cPanel, navigate to "MySQL Databases"
- Create a new database named "ipcr-new"
- Create a user with all privileges on this database
- Note the database name, username, and password for later

### 3. Upload Files
- Using FTP or the cPanel File Manager, upload all files from this directory to your configured application root directory
- Make sure to include:
  - server-mysql.js
  - start-mysql.cjs
  - mysql-schema.sql
  - package.json
  - .htaccess
  - dist/ directory (containing the frontend assets)

### 4. Create .env File
- In your cPanel file manager, create a new file named .env in your application root directory
- Use the .env.template as a guide, adding your actual MySQL credentials and secret keys

### 5. Set Up the Database Schema
- In cPanel, navigate to "MySQL Databases" > "phpMyAdmin"
- Select your database 
- Go to the "Import" tab
- Upload and execute the mysql-schema.sql file
- This will create all required tables and a default admin user

### 6. Install Dependencies and Start the Application
- In cPanel, navigate to "Setup Node.js App"
- Click on your application, then:
  1. Click "Run NPM Install" to install dependencies
  2. Click "Start Application" to start the server
  3. Click "Check Process" to verify it's running

### 7. Access Your Application
- Visit your application URL to access the IPCR Early Warning System
- Log in with the default admin credentials:
  - Username: admin 
  - Password: @admin123321nimda$

## Troubleshooting

If your application doesn't start correctly:

1. **Check your environment variables**
   - Make sure your .env file has the correct database credentials

2. **Verify database connection**
   - Try running phpMyAdmin to ensure your database is accessible 
   - Verify tables were created by checking the schema

3. **Check application logs**
   - In cPanel's Node.js App manager, check the application logs for errors

4. **Check database schema**
   - If you already had a database, run the following in Node.js app console:
   \`\`\`
   node check-mysql-schema.js
   \`\`\`
`;
  
  fs.writeFileSync(readmePath, readme);
}

// Create a troubleshooting guide
const troubleshootingPath = path.join(deployDir, 'TROUBLESHOOTING.md');
if (!fs.existsSync(troubleshootingPath)) {
  console.log('Creating troubleshooting guide...');
  
  const troubleshooting = `# Troubleshooting Guide - cPanel Deployment

## Common Issues and Solutions

### Application Won't Start

1. **Database Connection Problems**
   - Check your .env file for correct MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE values
   - Try connecting with these credentials through phpMyAdmin
   - Make sure the MySQL user has full privileges on the database

2. **Port Already in Use**
   - cPanel may have assigned a different port than what's in your .env file
   - Check the assigned port in the cPanel Node.js App manager
   - Update the PORT value in your .env file

3. **Node.js Version Mismatch**
   - The application requires Node.js 18.x or higher
   - Verify your selected Node.js version in cPanel
   - If necessary, ask your hosting provider to update Node.js

### Database Schema Issues

1. **Missing Tables**
   - Import the mysql-schema.sql file again through phpMyAdmin
   - Check for error messages during the import

2. **Missing Columns**
   - Run the schema check script to identify missing columns:
     \`\`\`
     node check-mysql-schema.js
     \`\`\`
   - Follow the instructions it provides to update your schema

### Authentication Problems

1. **Can't Log In as Admin**
   - Verify the admin user exists in the database:
     - Check the 'users' table in phpMyAdmin
     - If missing, run this SQL:
     \`\`\`
     INSERT INTO users (username, password, fullName, email, role, securityLevel) 
     VALUES ('admin', '$2a$10$9XxQKzAKA2iBV2mNlQHgXOJCbw5XtpnbfpVirk9a.irFIQET9H3zK', 'System Administrator', 'admin@example.com', 'admin', 'high');
     \`\`\`
   - The default password is: @admin123321nimda$

2. **Session Not Persisting**
   - Check if the 'sessions' table exists in your database
   - Verify the SESSION_SECRET in your .env file is set
   - Make sure your hosting supports persistent sessions

### Frontend Issues

1. **Blank Page / 404 Errors**
   - Make sure .htaccess file is in place for proper routing
   - Verify all files in the 'dist' directory were uploaded
   - Try clearing your browser cache

2. **API Requests Failing**
   - Check browser console for error messages
   - Verify your server is running (check Node.js App status)
   - Make sure URLs don't include a port number if using a proxy

### Specific Feature Troubleshooting

1. **Translation Features Not Working**
   - Make sure OPENAI_API_KEY is set in your .env file
   - Verify the API key is valid and has sufficient credits

2. **Maps Not Displaying**
   - Ensure your browser allows geolocation if applicable
   - Check console for JavaScript errors related to Leaflet

## Contact Support

If you continue to experience issues after trying these solutions, please contact your cPanel administrator or hosting provider for further assistance.
`;
  
  fs.writeFileSync(troubleshootingPath, troubleshooting);
}

// Create migrations directory if it doesn't exist
const migrationsDir = path.join(deployDir, 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Copy run-migration script
const runMigrationPath = path.join(deployDir, 'run-migration.cjs');
if (!fs.existsSync(runMigrationPath)) {
  console.log('Creating database migration script...');
  
  const runMigration = `#!/usr/bin/env node

/**
 * Simple database migration runner for cPanel
 * When SSH access is not available, you can run this script through the cPanel Node.js console
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection config
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'ipcr-new',
  port: process.env.MYSQL_PORT || 3306,
};

async function runMigration(migrationFile) {
  console.log(\`Running migration: \${migrationFile}\`);
  
  // Read migration file
  const migrationPath = path.join(__dirname, 'migrations', migrationFile);
  if (!fs.existsSync(migrationPath)) {
    console.error(\`Migration file not found: \${migrationPath}\`);
    return false;
  }
  
  try {
    // Read and evaluate the migration file
    const migration = require(migrationPath);
    
    // Connect to database
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');
    
    // Run the migration
    if (typeof migration.up === 'function') {
      await migration.up(connection);
      console.log(\`Migration \${migrationFile} completed successfully!\`);
    } else {
      console.error('Migration file does not export an up() function');
    }
    
    await connection.end();
    return true;
  } catch (error) {
    console.error(\`Error running migration \${migrationFile}:\`, error);
    return false;
  }
}

// Execute the script with migration filename argument
async function main() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error('Please provide a migration filename.');
    console.log('Usage: node run-migration.cjs migration-filename.js');
    return;
  }
  
  const success = await runMigration(migrationFile);
  if (success) {
    console.log('Migration completed successfully.');
  } else {
    console.error('Migration failed.');
  }
}

main();
`;
  
  fs.writeFileSync(runMigrationPath, runMigration);
  fs.chmodSync(runMigrationPath, '755'); // Make executable
}

// Create dist directory if it doesn't exist
const distDir = path.join(deployDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  
  // Create a placeholder note
  fs.writeFileSync(
    path.join(distDir, 'README.txt'),
    'Copy the contents of the main dist/ directory here after running "npm run build"'
  );
}

console.log('\n✅ cPanel preparation completed!');
console.log('\nNext steps:');
console.log('1. Build the frontend application with "npm run build"');
console.log('2. Copy the contents of dist/ to cpanel-deploy/dist/');
console.log('3. Upload the contents of cpanel-deploy/ to your cPanel hosting via FTP');
console.log('4. Follow the instructions in cpanel-deploy/README.md to complete setup');
console.log('\nFor hosting without SSH access, use the cPanel Node.js App interface to run:');
console.log('  - npm install');
console.log('  - node start-mysql.cjs');