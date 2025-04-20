# IPCR Early Warning System - cPanel Deployment Guide (No SSH Access)

This guide provides step-by-step instructions for deploying the IPCR Early Warning System to a cPanel hosting environment without requiring SSH access.

## Prerequisites

Before proceeding, ensure you have:

1. A cPanel hosting account with Node.js support
2. MySQL database access through cPanel
3. FTP access to your hosting account
4. The ability to set up Node.js applications through the cPanel interface

## Step 1: Prepare the Deployment Package

To create the deployment package locally, run:

```bash
# Run the preparation script
./prepare-cpanel-no-ssh.sh
```

This script will:
1. Prepare the cPanel deployment files with MySQL support
2. Build the frontend application
3. Copy built files to the deployment directory
4. Create a ZIP archive for easy download

The final output will be a file named `cpanel-deploy-package.zip`.

## Step 2: Set Up the MySQL Database in cPanel

1. Log in to your cPanel account
2. Navigate to "MySQL Databases"
3. Create a new database named `ipcr-new`
4. Create a database user with a secure password
5. Add the user to the database with ALL PRIVILEGES
6. Make note of your database name, username, and password for use later

## Step 3: Upload Files to cPanel

1. Download the `cpanel-deploy-package.zip` file to your local machine
2. Extract the ZIP file to access the `cpanel-deploy` folder
3. Using FTP or the cPanel File Manager:
   - Create a directory for your app in your hosting account (e.g., `earlywarning`)
   - Upload all contents of the `cpanel-deploy` folder to this directory

## Step 4: Configure Node.js App in cPanel

1. In cPanel, navigate to "Setup Node.js App"
2. Click "Create Application" and configure:
   - Node.js version: 18.x or higher
   - Application mode: Production
   - Application root: The directory where you uploaded files
   - Application URL: Your domain or subdomain
   - Application startup file: `start-mysql.cjs`

## Step 5: Set Up Environment Variables

1. In cPanel's Node.js App manager, click on your application
2. Find and click on "Environment Variables"
3. Add the following variables (adjust as needed):

```
MYSQL_HOST=localhost
MYSQL_USER=your_cpanel_database_username
MYSQL_PASSWORD=your_cpanel_database_password
MYSQL_DATABASE=ipcr-new
MYSQL_PORT=3306
SESSION_SECRET=a-long-random-string-for-security
PORT=8080
NODE_ENV=production
```

4. If using translation features, also add:
```
OPENAI_API_KEY=your_openai_api_key
```

## Step 6: Initialize the Database Schema

1. In cPanel, navigate to "MySQL Databases" → "phpMyAdmin"
2. Select your `ipcr-new` database
3. Go to the "Import" tab
4. Select the `mysql-schema.sql` file you uploaded
5. Click "Go" to import the schema

## Step 7: Install Dependencies and Start the App

1. In cPanel's Node.js App manager, click on your application
2. Click "Run NPM Install" to install dependencies
3. After installation completes, click "Start Application"
4. Click "Check Process" to verify it's running

## Step 8: Test the Deployment

1. Visit your application URL in a browser
2. Log in with the default admin credentials:
   - Username: `admin`
   - Password: `@admin123321nimda$`
3. Verify that all functionality is working correctly

## Testing Database Connection

If you encounter database issues, you can run the database connection test script:

1. In cPanel's Node.js App manager, click on your application
2. Click "Enter Node.js REPL" to open a Node.js console
3. Run:
```javascript
require('./test-mysql-connection.js')
```

This will check your database connection and table setup, providing detailed diagnostics.

## Troubleshooting

### Application Won't Start

1. **Database Connection Issues**
   - Verify database credentials in environment variables
   - Check that the database and user exist with proper permissions
   - Run the connection test script (see above)

2. **Port Conflicts**
   - cPanel may assign a different port than 8080
   - Check the assigned port in the Node.js App settings and update the PORT environment variable if needed

3. **Missing Dependencies**
   - Try running NPM Install again from the Node.js App manager

### Database Schema Issues

1. **Missing Tables**
   - Import the `mysql-schema.sql` file again through phpMyAdmin
   - Check for error messages during import

2. **Admin User Not Created**
   - Run this SQL in phpMyAdmin:
   ```sql
   INSERT INTO users (username, password, fullName, email, role, createdAt, securityLevel) 
   VALUES ('admin', '$2a$10$9XxQKzAKA2iBV2mNlQHgXOJCbw5XtpnbfpVirk9a.irFIQET9H3zK', 'System Administrator', 'admin@example.com', 'admin', NOW(), 'high');
   ```

### Frontend Issues

1. **Blank Page or 404 Errors**
   - Check that all files were uploaded properly
   - Verify that `.htaccess` file is in place

2. **API Errors**
   - Check browser console for specific error messages
   - Verify the Node.js application is running
   - Check that routes are properly configured

## Upgrading the Application

To upgrade the application in the future:

1. Run the preparation and build script locally:
```bash
./prepare-cpanel-no-ssh.sh
```

2. Upload the new files to your cPanel hosting
3. In cPanel's Node.js App manager, restart your application

## Additional Resources

For detailed information about specific components:
- See `cpanel-deploy/README.md` for quick reference
- See `cpanel-deploy/TROUBLESHOOTING.md` for common issues and solutions
- Use `test-mysql-connection.js` for database diagnostics
- Use `check-mysql-schema.js` to verify database structure