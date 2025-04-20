# Troubleshooting Guide for cPanel Deployment

This guide addresses common issues encountered when deploying the IPCR Early Warning & Response System on cPanel hosting with MySQL.

## Database Connection Issues

### Error: "Access denied for user..."

**Problem:** MySQL is rejecting the connection credentials.

**Solutions:**
1. Double-check username and password in your `.env` file
2. Ensure the MySQL user has proper privileges on the database
3. Check for special characters in passwords that might need escaping
4. In cPanel, verify that the user has been properly added to the database

### Error: "Unknown database..."

**Problem:** The specified database doesn't exist or isn't accessible.

**Solutions:**
1. Check the database name in your `.env` file
2. Remember cPanel often requires prefixing database names with your cPanel username
   - Example: If your cPanel username is `ipcradmin` and you created a database named `ipcr_db`
   - The actual database name might be `ipcradmin_ipcr_db`
3. Verify the database exists in cPanel's MySQL Databases section

### Error: "ECONNREFUSED" or "Can't connect to MySQL server"

**Problem:** The MySQL server is not accessible.

**Solutions:**
1. Verify MySQL server is running on the specified host
2. Check for firewalls or network restrictions
3. Ensure the hostname is correct (usually `localhost` for cPanel)
4. Confirm MySQL is listening on the specified port (usually `3306`)

## Application Startup Issues

### Error: "Error: listen EADDRINUSE"

**Problem:** The specified port is already in use.

**Solutions:**
1. Change the PORT in your `.env` file to an available port
2. Check if another Node.js app is running on the same port
3. Use cPanel's application manager to ensure proper port assignment

### Error: "Command not found: node"

**Problem:** Node.js is not installed or not in the PATH.

**Solutions:**
1. Use cPanel's Node.js selector to set the Node.js version
2. Add the Node.js path to your environment if using SSH
3. Make sure your startup command uses the full path to Node.js

### Error: "Error: Cannot find module..."

**Problem:** A required Node.js module is missing.

**Solutions:**
1. Run `npm ci --omit=dev` to install dependencies properly
2. Check if the module is listed in `package.json`
3. Make sure you're running the command from the correct directory

## Session-Related Issues

### Error: "Error: connect ECONNREFUSED" in session storage

**Problem:** The session store cannot connect to the database.

**Solutions:**
1. Check database configuration in session store settings
2. Ensure MySQL server is running and accessible
3. Try falling back to memory-based session storage for testing:
   - Edit `server-mysql.js`
   - Comment out the MySQL session store section
   - Use the MemoryStore instead (temporary solution only)

### Users being logged out frequently

**Problem:** Sessions are not persisting properly.

**Solutions:**
1. Verify the sessions table exists in the database
2. Check for proper permissions on the sessions table
3. Make sure `SESSION_SECRET` is set and consistent
4. Check if session cookie settings match your environment
5. If using HTTPS, ensure secure cookie setting is appropriate

## Static Files Not Loading

### Problem: CSS, JS, or images not loading on the frontend

**Solutions:**
1. Check browser console for path-related errors
2. Verify that static files are in the correct directory (`dist/public`)
3. Make sure file permissions allow web server to read the files
4. Check for path issues in your frontend code

## Authentication Problems

### Unable to log in with default admin credentials

**Solutions:**
1. Verify the MySQL schema script ran successfully
2. Manually check if the admin user exists in the database
3. Reset the admin password if needed (use the script in `mysql-schema.js` as reference)
4. Check session configuration for proper storage

## Deployment Process Issues

### MySQL schema script fails

**Solutions:**
1. Run the script with more verbose logging:
   ```
   node mysql-schema.js --debug
   ```
2. Check for database permissions - user needs CREATE TABLE privilege
3. Examine MySQL error logs for detailed error messages

### Node.js application fails to start

**Solutions:**
1. Check application logs in cPanel logs section
2. Look for syntax errors in your code
3. Verify all required environment variables are set
4. Try running with explicit debugging:
   ```
   NODE_DEBUG=* node start-mysql.cjs
   ```

## Getting Additional Help

If you've tried the troubleshooting steps above and still encounter issues:

1. Check cPanel logs for detailed error messages
2. Contact your hosting provider's support for cPanel-specific issues
3. Provide detailed information about your problem when seeking help:
   - Exact error messages
   - Steps you've already taken
   - Your cPanel hosting version and restrictions
   - Node.js version you're using

For urgent assistance, contact support@afrinict.com with the subject "IPCR cPanel Deployment Issue".