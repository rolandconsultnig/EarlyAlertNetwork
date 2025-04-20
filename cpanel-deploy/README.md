# IPCR Early Warning & Response System - cPanel MySQL Deployment

This package contains all files required to deploy the IPCR Early Warning & Response System on a cPanel hosting environment with MySQL database support.

## What's Included

- **Pre-configured MySQL Adapter**: Modified database connection files to work with MySQL instead of PostgreSQL
- **Database Schema Scripts**: Ready-to-use database initialization scripts that create all necessary tables
- **Node.js Startup Scripts**: Pre-configured scripts to run the application in a cPanel environment
- **Environment Templates**: Sample configuration files for your production environment
- **Testing Utilities**: Database connection test tools to verify proper setup

## Quick Start Guide

1. **Upload the entire contents of this directory** to your cPanel hosting environment
2. **Set up a MySQL database** in cPanel and create a database user with all privileges
3. **Configure environment variables** by editing the `.env` file with your database credentials
4. **Initialize the database** by running `node mysql-schema.js`
5. **Start the application** using cPanel's Node.js Application Manager with `start.cjs` as the entry point

Detailed step-by-step instructions can be found in the `UPDATED_CPANEL_DEPLOYMENT_GUIDE.md` file.

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change these credentials immediately after your first login.

## File Overview

- `server-mysql.js` - Main server file adapted for MySQL
- `db-mysql.js` - MySQL database connection and utility functions
- `mysql-schema.js` - Database initialization script
- `simple-mysql-test.js` - Quick MySQL connection test utility
- `start.cjs` - Application entry point for cPanel
- `.env.template` - Template for environment variables configuration
- `package.json` - Dependencies and scripts for the MySQL version

## Troubleshooting

If you encounter any issues during deployment:

1. Check database connection with `node simple-mysql-test.js`
2. Review application logs in cPanel's Node.js Application Manager
3. Verify environment variables in the `.env` file
4. Consult the troubleshooting guides:
   - `MYSQL_TROUBLESHOOTING.md`
   - `CPANEL_DEPLOYMENT_CHECKLIST.md`

## Support

For additional support, please contact the system administrators at the Institute for Peace and Conflict Resolution.