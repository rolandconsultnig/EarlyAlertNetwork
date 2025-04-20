// Import from mysql-db.ts for MySQL configuration
import { db, testConnection } from './mysql-db';

// Test the connection when the server starts
testConnection()
  .then(success => {
    if (success) {
      console.log('Connected to MySQL database: ipcr-new');
    } else {
      console.error('Failed to connect to MySQL database');
    }
  });

// Export the database connection
export { db };