# Step-by-Step cPanel Deployment Guide with MySQL

This guide provides detailed instructions for deploying the IPCR Early Warning & Response System on a cPanel hosting environment with MySQL.

## Prerequisites

- cPanel hosting account with:
  - Node.js support (Node.js 16.x or newer)
  - MySQL database support
  - PHP support (for phpMyAdmin)
  - SSH access (optional but recommended)

## Step 1: Prepare the Deployment Package

1. **Get the deployment files**
   - All required files are already prepared in the `cpanel-deploy` directory
   - This includes modified database connectors for MySQL compatibility

2. **Download the deployment package**
   - Download the entire `cpanel-deploy` folder to your local machine
   - You can use the File Manager in Replit or download individual files

## Step 2: Set Up MySQL Database in cPanel

1. **Log in to cPanel** and access the MySQL Databases section

2. **Create a new MySQL database**
   - Choose a database name (e.g., `ipcr_db`)
   - Note: cPanel may prefix your database name with your username (e.g., `username_ipcr_db`)

3. **Create a new MySQL user**
   - Username: Choose a username (e.g., `ipcr_user`)
   - Password: Use a strong password
   - Note: cPanel may prefix your username with your cPanel username (e.g., `username_ipcr_user`)

4. **Assign the user to the database**
   - Find the "Add User To Database" section
   - Select your user and database
   - Grant "ALL PRIVILEGES" to the user

5. **Note your database credentials**
   - Database name (including prefix if any)
   - Username (including prefix if any)
   - Password
   - Hostname (usually `localhost`)
   - Port (usually `3306`)

## Step 3: Upload Files to cPanel

### Option 1: Using File Manager

1. **Log in to cPanel** and access File Manager
2. **Navigate** to your website's root directory (usually `public_html` or a subdirectory)
3. **Upload files**:
   - Click "Upload" and select all files from the `cpanel-deploy` directory
   - Alternatively, you can upload a ZIP file and extract it in cPanel

### Option 2: Using FTP (Recommended for Large Files)

1. **Use an FTP client** (FileZilla, Cyberduck, etc.)
2. **Connect to your cPanel server** using your FTP credentials
3. **Upload all files** from the `cpanel-deploy` directory to your chosen directory

## Step 4: Configure Environment Variables

1. **Create or edit the `.env` file** in your uploaded directory
   ```
   # Database Configuration
   DATABASE_URL=mysql://username_ipcr_user:your_password@localhost:3306/username_ipcr_db
   
   # Alternative database configuration (used if DATABASE_URL is not provided)
   DB_HOST=localhost
   DB_USER=username_ipcr_user
   DB_PASSWORD=your_password
   DB_NAME=username_ipcr_db
   DB_PORT=3306
   
   # Session Secret (change this to a random secure string)
   SESSION_SECRET=change_this_to_a_secure_random_string
   
   # Node Environment
   NODE_ENV=production
   
   # Port (usually provided by cPanel, but can be set as fallback)
   PORT=5000
   ```

2. **Important**: Replace placeholders with your actual values:
   - Replace `username_ipcr_user` with your actual MySQL username
   - Replace `your_password` with your actual MySQL password
   - Replace `username_ipcr_db` with your actual MySQL database name
   - Generate a secure random string for SESSION_SECRET

## Step 5: Initialize MySQL Database

### Option 1: Using phpMyAdmin

1. **Access phpMyAdmin** from cPanel
2. **Select your database** from the left sidebar
3. **Import MySQL schema**:
   - Click the "Import" tab
   - Upload the `mysql-schema.sql` file from the deployment package
   - Click "Go" to execute the SQL statements

### Option 2: Using Initialization Script

1. **Access Node.js App Manager** in cPanel
2. **Set up a temporary application** to run the initialization script:
   - Application mode: Development
   - Application root: Your uploaded directory
   - Application URL: Your domain
   - Application startup file: `init-mysql-tables.js`
3. **Run the script once** to create all tables
4. **Delete the temporary application** after initialization is complete

### Option 3: Using SSH (If Available)

1. **Connect to your server via SSH**
2. **Navigate to your application directory**
3. **Run the initialization script**:
   ```bash
   cd path/to/your/app
   node init-mysql-tables.js
   ```

## Step 6: Set Up Node.js Application in cPanel

1. **Access Node.js App Manager** in cPanel
2. **Create a new application**:
   - Application mode: Production
   - Application root: Your uploaded directory
   - Application URL: Your domain or subdomain
   - Application startup file: `start.cjs`
   - Environment variables: Leave empty (we're using the .env file)

3. **Start the application**

## Step 7: Test Your Deployment

1. **Visit your website** at your domain/subdomain
2. **Check for any errors** in the Node.js app logs (available in cPanel)
3. **Verify database connection** by attempting to log in:
   - Default admin credentials: 
     - Username: `admin`
     - Password: `admin123`

## Step 8: Set Up SSL Certificate (Recommended)

1. **In cPanel**, go to "SSL/TLS" or "Let's Encrypt"
2. **Generate and install** a free SSL certificate for your domain
3. **Enable HTTPS** for secure connections

## Troubleshooting Common Issues

### Application Not Starting

1. **Check application logs** in cPanel's Node.js manager
2. **Verify that your Node.js version** is compatible (16.x or newer)
3. **Make sure all dependencies** are installed (the start script will install them automatically)

### Database Connection Issues

1. **Verify database credentials** in the `.env` file
2. **Check database and user existence** in phpMyAdmin
3. **Test connection using** the test script:
   ```bash
   node test-mysql-connection.js
   ```

### Missing Tables

1. **Run the initialization script again** to create any missing tables
2. **Check for SQL errors** in the output

### Permission Issues

1. **Set appropriate permissions** for your application files:
   - Directories: 755
   - Files: 644
   - Executable scripts: 755

## Keeping the Application Running

1. **Use cPanel's Application Manager** to keep the Node.js application running
2. **Set up application monitoring** if provided by your host
3. **Configure cPanel to automatically restart** the application after server reboots

## Updating Your Application

1. **Make and test changes** locally
2. **Build the updated application**
3. **Upload the new files** to your cPanel hosting
4. **Restart the Node.js application** through cPanel

## Security Recommendations

1. **Change the default admin password** immediately after first login
2. **Regularly update** all packages and dependencies
3. **Set up automated backups** for your MySQL database
4. **Implement a Web Application Firewall** if available through your host
5. **Use environment variables** for all sensitive information

## Default Credentials

- **Admin User**:
  - Username: `admin`
  - Password: `admin123`
  
**IMPORTANT**: Change these credentials immediately after successful deployment!