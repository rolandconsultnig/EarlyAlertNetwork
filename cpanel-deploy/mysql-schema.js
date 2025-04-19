// mysql-schema.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL connection string from .env
const connectionString = process.env.DATABASE_URL;

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
    multipleStatements: true
  };
};

async function setupDatabase() {
  let connection;
  
  try {
    const config = getConnectionConfig(connectionString);
    connection = await mysql.createConnection(config);
    
    console.log('Connected to MySQL database');
    
    // Create tables
    await connection.execute(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        fullName VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        securityClearance INT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
      
      -- Data sources table
      CREATE TABLE IF NOT EXISTS data_sources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url VARCHAR(255),
        apiKey VARCHAR(255),
        active BOOLEAN DEFAULT true,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
      
      -- Incidents table
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE SET NULL
      );
      
      -- Alerts table
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (issuedBy) REFERENCES users(id) ON DELETE SET NULL
      );
      
      -- Risk indicators table
      CREATE TABLE IF NOT EXISTS risk_indicators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        value FLOAT,
        threshold FLOAT,
        region VARCHAR(255),
        dataSourceId INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (dataSourceId) REFERENCES data_sources(id) ON DELETE SET NULL
      );
      
      -- Risk analyses table
      CREATE TABLE IF NOT EXISTS risk_analyses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        region VARCHAR(255),
        riskLevel VARCHAR(50),
        factors JSON,
        recommendations TEXT,
        analyzedBy INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (analyzedBy) REFERENCES users(id) ON DELETE SET NULL
      );
      
      -- Response plans table
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      );
      
      -- Response activities table
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (responsePlanId) REFERENCES response_plans(id) ON DELETE SET NULL
      );
      
      -- Response teams table
      CREATE TABLE IF NOT EXISTS response_teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        contactPerson VARCHAR(255),
        contactEmail VARCHAR(255),
        contactPhone VARCHAR(50),
        members JSON,
        specialization VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
      
      -- Add basic admin user
      INSERT INTO users (username, password, email, fullName, role, securityClearance)
      VALUES (
        'admin', 
        '9f27ac323fd6613f8ee96f5008a751b6a02e47b83eb8ba4700dd95b4630dbddb.4dbc581e0ad25430a8e20408b150850e', 
        'admin@example.com', 
        'System Administrator', 
        'admin', 
        7
      ) ON DUPLICATE KEY UPDATE id=id;
    `);
    
    console.log('Database schema created successfully');
    console.log('Default admin user created:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('Database setup completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to set up database:', err);
    process.exit(1);
  });