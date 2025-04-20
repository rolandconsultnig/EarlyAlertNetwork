# cPanel Deployment Checklist

Use this checklist to ensure you've completed all necessary steps for successfully deploying the IPCR Early Warning & Response System to a cPanel hosting environment with MySQL.

## Pre-Deployment Preparation

- [ ] Verify you have a cPanel hosting account with:
  - [ ] MySQL database access
  - [ ] Node.js support (version 16.x or higher)
  - [ ] SSH access (optional but recommended)

- [ ] Prepare your local deployment package:
  - [ ] Run the prepare-for-cpanel script: `node prepare-for-cpanel.mjs`
  - [ ] Verify the `cpanel-deploy` directory contains all necessary files

## Database Setup

- [ ] Create MySQL database in cPanel:
  - [ ] Go to MySQL Databases in cPanel
  - [ ] Create a new database (note: may require prefix like `username_database`)
  - [ ] Create a new MySQL user with a strong password
  - [ ] Add the user to the database with ALL PRIVILEGES

- [ ] Note your database credentials:
  - [ ] Database hostname (usually `localhost`)
  - [ ] Database name (including any prefix)
  - [ ] Database username
  - [ ] Database password
  - [ ] Database port (usually `3306`)

## File Upload

- [ ] Upload files to cPanel:
  - [ ] Log in to cPanel File Manager or use FTP
  - [ ] Navigate to your desired deployment directory (e.g., `public_html`)
  - [ ] Upload all files from the `cpanel-deploy` directory

## Environment Configuration

- [ ] Configure environment variables:
  - [ ] Rename `.env.template` to `.env`
  - [ ] Update database credentials in `.env`
  - [ ] Set a secure, random SESSION_SECRET
  - [ ] Add any social media integration API keys
  - [ ] Add any SMS integration API keys

## Database Initialization

- [ ] Initialize the database schema:
  - [ ] Via SSH or cPanel Terminal: `node mysql-schema.js`
  - [ ] Verify the script completes successfully
  - [ ] Note the default admin login credentials

## Application Setup

- [ ] Set up Node.js application in cPanel:
  - [ ] Go to "Setup Node.js App" in cPanel
  - [ ] Create a new application
  - [ ] Set Application mode to "Production"
  - [ ] Choose Node.js version 16.x or higher
  - [ ] Set Application root to your deployment directory
  - [ ] Set Application URL to your domain or subdomain
  - [ ] Set Application startup file to `start-mysql.cjs`
  - [ ] Click "Create" to set up the application

- [ ] Alternative setup (if Node.js App manager is unavailable):
  - [ ] Install required packages: `npm install mysql2 express-mysql-session`
  - [ ] Install production dependencies: `npm ci --omit=dev`
  - [ ] Set up a custom startup script or daemon

## Post-Deployment Verification

- [ ] Verify the application is running:
  - [ ] Check the application logs for errors
  - [ ] Visit your domain or application URL in a web browser
  - [ ] Log in with the default admin credentials
  - [ ] Change the default admin password immediately

- [ ] Security checks:
  - [ ] Verify SSL is enabled for your domain
  - [ ] Remove or secure sensitive scripts (e.g., `mysql-schema.js`)
  - [ ] Set proper file permissions (755 for directories, 644 for files)
  - [ ] Set up database backups in cPanel

## Troubleshooting Common Issues

If you encounter problems during deployment, check:

- [ ] Database connection string format is correct
- [ ] Database user has sufficient privileges
- [ ] Application port is not blocked by the hosting provider
- [ ] Node.js version is compatible
- [ ] Required Node.js packages are installed
- [ ] File permissions are set correctly

For further assistance, refer to the comprehensive deployment guide in `README.md`
or contact support@afrinict.com.