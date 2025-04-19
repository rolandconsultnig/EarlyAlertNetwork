// init-mysql-tables.js - For cPanel hosting with MySQL
// This script will generate essential tables for the application when first deployed

const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper to create database connection from environment variables
async function createConnection() {
  // Check if DATABASE_URL is provided in .env
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL environment variable is not set");
    console.error("Please configure the .env file with your MySQL database connection string");
    console.error("Example: DATABASE_URL=mysql://username:password@localhost:3306/database_name");
    process.exit(1);
  }

  try {
    // Parse connection string - mysql://user:password@host:port/database
    const match = process.env.DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!match) {
      throw new Error("Invalid MySQL connection string format");
    }
    
    const [_, user, password, host, port, database] = match;
    
    // Create connection
    return await mysql.createConnection({
      host,
      user,
      password,
      port: parseInt(port),
      database,
      multipleStatements: true // Allow multiple statements in one query
    });
  } catch (error) {
    console.error("Failed to connect to MySQL database:", error.message);
    console.error("Please check your DATABASE_URL and make sure the MySQL server is running");
    process.exit(1);
  }
}

// Main function to set up the database
async function initializeDatabase() {
  let connection;
  
  try {
    console.log("Connecting to MySQL database...");
    connection = await createConnection();
    console.log("Connected successfully!");
    
    console.log("Creating database tables...");
    
    // Create all tables in a single transaction
    await connection.beginTransaction();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        fullName VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        securityClearance INT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("- Created users table");
    
    // Create data_sources table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS data_sources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url VARCHAR(255),
        apiKey VARCHAR(255),
        active BOOLEAN DEFAULT TRUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("- Created data_sources table");
    
    // Create incidents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        region VARCHAR(255),
        coordinates TEXT,
        severity VARCHAR(50),
        status VARCHAR(50),
        category VARCHAR(50),
        reportedBy INT,
        verificationStatus VARCHAR(50),
        impactedPopulation INT,
        mediaUrls JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log("- Created incidents table");
    
    // Create risk_indicators table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS risk_indicators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        value FLOAT,
        threshold FLOAT,
        region VARCHAR(255),
        dataSourceId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (dataSourceId) REFERENCES data_sources(id) ON DELETE SET NULL
      );
    `);
    console.log("- Created risk_indicators table");
    
    // Create risk_analyses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS risk_analyses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        region VARCHAR(255),
        riskLevel VARCHAR(50),
        factors JSON,
        recommendations TEXT,
        analyzedBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (analyzedBy) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log("- Created risk_analyses table");
    
    // Create alerts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        level VARCHAR(50),
        status VARCHAR(50),
        sourceCategory VARCHAR(50),
        region VARCHAR(255),
        affectedAreas JSON,
        issuedBy INT,
        expiresAt DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (issuedBy) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log("- Created alerts table");
    
    // Create response_plans table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS response_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        region VARCHAR(255),
        steps JSON,
        resources JSON,
        status VARCHAR(50),
        createdBy INT,
        interAgencyPortal VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log("- Created response_plans table");
    
    // Create response_teams table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS response_teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        contactPerson VARCHAR(255),
        contactEmail VARCHAR(255),
        contactPhone VARCHAR(50),
        members JSON,
        specialization VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("- Created response_teams table");
    
    // Create response_activities table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS response_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        status VARCHAR(50),
        responsePlanId INT,
        assignedTeamId INT,
        startDate DATETIME,
        endDate DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (responsePlanId) REFERENCES response_plans(id) ON DELETE SET NULL,
        FOREIGN KEY (assignedTeamId) REFERENCES response_teams(id) ON DELETE SET NULL
      );
    `);
    console.log("- Created response_activities table");
    
    // Create sessions table for authentication
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) NOT NULL,
        expires BIGINT,
        data TEXT,
        PRIMARY KEY (session_id)
      );
    `);
    console.log("- Created sessions table");
    
    // Create API keys table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        key VARCHAR(255) NOT NULL UNIQUE,
        userId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("- Created api_keys table");
    
    // Create webhooks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        event VARCHAR(50) NOT NULL,
        userId INT,
        lastTriggered TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("- Created webhooks table");
    
    // Create default admin user
    console.log("Creating default admin user...");
    const adminPassword = '9f27ac323fd6613f8ee96f5008a751b6a02e47b83eb8ba4700dd95b4630dbddb.4dbc581e0ad25430a8e20408b150850e'; // admin123
    
    await connection.query(`
      INSERT INTO users (username, password, email, fullName, role, securityClearance)
      VALUES ('admin', ?, 'admin@example.com', 'System Administrator', 'admin', 7)
      ON DUPLICATE KEY UPDATE email = VALUES(email);
    `, [adminPassword]);
    
    // Commit the transaction
    await connection.commit();
    console.log("All tables created successfully!");
    
    console.log("\nDatabase setup completed!");
    console.log("\nYou can now log in with:");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("\nIMPORTANT: Please change the admin password after first login!");
    
  } catch (error) {
    // Rollback in case of error
    if (connection) {
      await connection.rollback();
    }
    
    console.error("Error setting up the database:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });