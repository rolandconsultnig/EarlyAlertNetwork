# MySQL Troubleshooting Guide for cPanel Deployment

This guide helps you solve common issues when deploying the IPCR Early Warning & Response System with MySQL on cPanel hosting.

## Connection Issues

### Unable to Connect to the Database

**Symptoms:** 
- "Error connecting to MySQL database" in logs
- Application fails to start
- Blank white screen when accessing the application

**Possible Solutions:**

1. **Check Database Credentials**
   ```bash
   # Test database connection
   node test-mysql-connection.js
   ```

2. **Verify the MySQL Connection String**
   - Ensure the connection string follows this format:
     ```
     mysql://username:password@hostname:port/database_name
     ```
   - Remember cPanel often prefixes database and user names with your cPanel username
   - Example: If your cPanel username is "john" and you created a database named "ipcr_db", the actual database name might be "john_ipcr_db"

3. **Check for Special Characters in Password**
   - If your password contains special characters, make sure they are properly URL-encoded in the connection string
   - Common replacements:
     - `@` becomes `%40`
     - `#` becomes `%23`
     - `&` becomes `%26`
     - `:` becomes `%3A`
     - `/` becomes `%2F`

4. **Verify MySQL User Privileges**
   - In phpMyAdmin, check that your user has ALL PRIVILEGES on the database
   - Re-add privileges if necessary:
     1. Go to "User accounts" in phpMyAdmin
     2. Find your user
     3. Click "Edit privileges"
     4. Ensure "Grant" is checked for all required privileges

## Database Schema Issues

### Missing Tables

**Symptoms:**
- "Table doesn't exist" errors
- "Unknown column" errors

**Solutions:**

1. **Run the MySQL Schema Script**
   ```bash
   node mysql-schema.js
   ```

2. **Check for Schema Errors**
   - Look for error messages in the console when running the schema script
   - Common issues include syntax incompatibilities with your MySQL version

3. **Manually Create Tables**
   - Use phpMyAdmin to import the schema SQL directly:
     1. Access phpMyAdmin from cPanel
     2. Select your database
     3. Click "Import" tab
     4. Browse and select the `mysql-schema.sql` file
     5. Click "Go"

### Data Type Incompatibilities

**Symptoms:**
- "Invalid JSON format" errors
- "Data truncated" errors

**Solutions:**

1. **Check MySQL Version**
   - MySQL 5.7+ is recommended for proper JSON support
   - In phpMyAdmin, look at the main page for version information

2. **Modify JSON Columns**
   - For older MySQL versions, you may need to modify the schema:
     - Change `JSON` columns to `TEXT` or `LONGTEXT`
     - In phpMyAdmin:
       1. Select your database
       2. Click on the table with JSON fields
       3. Click "Structure" tab
       4. Click "Change" for the JSON column
       5. Change type to `TEXT` or `LONGTEXT`

## Performance Issues

### Slow Queries

**Symptoms:**
- Application timeouts
- Slow page loads

**Solutions:**

1. **Add Indexes**
   - Check if the application is using optimized queries
   - Add indexes on frequently queried columns:
   ```sql
   ALTER TABLE incidents ADD INDEX idx_region (region);
   ALTER TABLE incidents ADD INDEX idx_date (createdAt);
   ```

2. **Optimize MySQL Configuration**
   - If you have access to MySQL configuration, consider these optimizations:
     - Increase `innodb_buffer_pool_size` (consult your host)
     - Enable query cache (for MySQL 5.7 or earlier)

3. **Implement Connection Pooling**
   - Ensure connection pooling is properly configured in `db-mysql.js`
   - Check the `connectionLimit` parameter is appropriate for your hosting plan

## Hosting Environment Issues

### Memory Limitations

**Symptoms:**
- Application crashes randomly
- "Out of memory" errors

**Solutions:**

1. **Check Memory Limits**
   - Review your hosting plan's memory allocation
   - Add memory limiting to your Node.js application:
   ```javascript
   // Add to start.cjs
   if (process.env.NODE_OPTIONS) {
     console.log("Using memory limit from environment");
   } else {
     // Default to 512MB or whatever is appropriate for your hosting
     process.env.NODE_OPTIONS = "--max-old-space-size=512";
   }
   ```

2. **Optimize Database Queries**
   - Limit the amount of data returned
   - Add pagination to data-heavy endpoints

### File Permissions

**Symptoms:**
- Cannot read/write to files
- "Permission denied" errors

**Solutions:**

1. **Set Correct Permissions**
   ```bash
   # Set directory permissions
   find /path/to/your/app -type d -exec chmod 755 {} \;
   
   # Set file permissions
   find /path/to/your/app -type f -exec chmod 644 {} \;
   
   # Make scripts executable
   chmod +x /path/to/your/app/start.cjs
   chmod +x /path/to/your/app/run-migration.cjs
   ```

## Advanced Troubleshooting

### Database Logging

To troubleshoot database queries, you can enable query logging:

1. **Create a logging wrapper**
   - Edit `db-mysql.js` to add logging:
   ```javascript
   // Add this to the query function
   console.log('Executing query:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
   ```

2. **Check application logs** in cPanel Node.js Application Manager

### Database Backup and Restore

If you need to reset the database:

1. **Backup current data** (if valuable):
   - In phpMyAdmin, select your database
   - Click "Export" tab
   - Choose "Quick" export method
   - Click "Go" to download the SQL file

2. **Reset database**:
   - In phpMyAdmin, select your database
   - Select all tables
   - Choose "Drop" from the dropdown
   - Run the initialization script again

### Testing Database Connection Independently

Create a simple connection test script:

```javascript
// test-connection.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect(function(err) {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  
  console.log('Connected to MySQL database successfully!');
  
  connection.query('SELECT 1 + 1 AS solution', function(err, results) {
    if (err) {
      console.error('Query error:', err);
      return;
    }
    
    console.log('Test query result:', results[0].solution);
    connection.end();
  });
});
```

Run this script to test basic connectivity without the application overhead:
```bash
node test-connection.js
```

## Getting Help

If you've tried these troubleshooting steps and still have issues:

1. Collect diagnostic information:
   - MySQL error logs (if accessible)
   - Application logs from cPanel
   - Node.js version (`node -v`)
   - MySQL version (from phpMyAdmin)

2. Document the exact steps to reproduce the issue

3. Contact your hosting provider's support if it appears to be a hosting-specific issue