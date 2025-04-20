# cPanel Deployment Checklist

Use this checklist to ensure a successful deployment of the IPCR Early Warning & Response System to cPanel with MySQL.

## Pre-Deployment

- [ ] Verify cPanel hosting supports Node.js (version 16.x or newer)
- [ ] Verify MySQL database is available on your hosting account
- [ ] Check available disk space and memory limits on your cPanel account
- [ ] Have FTP/SFTP credentials ready for file upload
- [ ] Ensure you have admin access to cPanel

## Database Setup

- [ ] Create a new MySQL database in cPanel
      - Database name: __________________
- [ ] Create a new MySQL user with a strong password
      - Username: __________________
      - Password: __________________
- [ ] Assign the user to the database with ALL PRIVILEGES

## File Preparation and Upload

- [ ] Download all files from the `cpanel-deploy` directory
- [ ] Upload all files to your cPanel hosting (via File Manager or FTP)
      - Target directory: __________________

## Environment Configuration

- [ ] Create/edit `.env` file with correct values
      - [ ] Set DATABASE_URL with correct MySQL connection string
      - [ ] Set SESSION_SECRET with a secure random string
      - [ ] Set NODE_ENV=production
      - [ ] Configure any social media/SMS API keys (if using those features)

## Database Initialization

- [ ] Run the database initialization script
      - Option used: ☐ phpMyAdmin ☐ Node.js Script ☐ SSH
- [ ] Verify tables have been created successfully
- [ ] Check that default admin user has been created

## Application Setup

- [ ] Set up Node.js application in cPanel Application Manager
      - [ ] Application mode: Production
      - [ ] Application startup file: start.cjs
      - [ ] Application URL configured correctly
- [ ] Start the application
- [ ] Check application logs for any startup errors

## Post-Deployment Verification

- [ ] Visit the application URL in browser
      - URL: __________________
- [ ] Test login with default admin credentials
      - Username: admin
      - Password: admin123
- [ ] Change default admin password immediately
- [ ] Test core functionality:
      - [ ] Dashboard loads correctly
      - [ ] Incident reporting works
      - [ ] Data visualization works
      - [ ] Alert management works

## Security Measures

- [ ] Set up SSL certificate for HTTPS
- [ ] Configure automatic backups for MySQL database
- [ ] Set appropriate file permissions
- [ ] Remove or secure initialization scripts after successful setup

## Maintenance Plan

- [ ] Document update procedure
- [ ] Set up monitoring for the application
- [ ] Configure automatic restart after server reboots
- [ ] Schedule regular database backups

## Troubleshooting Resources

- Check application logs in cPanel Node.js Manager
- Review the TROUBLESHOOTING.md file in the deployment package
- Test database connection using test-mysql-connection.js
- Verify database schema using phpMyAdmin

## Notes

__________________________________________________________________
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________