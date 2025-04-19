# IPCR Early Warning & Response System - cPanel Deployment (MySQL Version)

This package contains the IPCR Early Warning & Response System prepared for cPanel deployment with MySQL database support.

## Important Note

This deployment package has been modified to work with MySQL instead of PostgreSQL since most cPanel installations use MySQL as the default database system.

## Deployment Steps

1. Upload all these files to your cPanel hosting
2. Edit the `.env` file with your MySQL database credentials:
   ```
   DATABASE_URL=mysql://your_db_user:your_password@localhost:3306/your_db_name
   SESSION_SECRET=your_secure_random_string
   ```

3. In cPanel, navigate to "MySQL Databases" and:
   - Create a new database (e.g., `your_cpanel_username_ipcr`)
   - Create a new MySQL user with a strong password
   - Add the user to the database with ALL PRIVILEGES

4. Install dependencies via SSH or cPanel Terminal:
   ```bash
   npm install mysql2 express-mysql-session
   npm ci --omit=dev
   ```

5. Initialize the MySQL database schema:
   ```bash
   node mysql-schema.js
   ```

6. Set up the Node.js application in cPanel's Application Manager:
   - Application root: The directory containing these files
   - Application URL: Your domain or subdomain
   - Application startup file: `start-mysql.cjs`
   - Node.js version: 16.x or newer

## Default Admin Login

After initializing the database, you can log in with:
- Username: `admin`
- Password: `admin123`

**IMPORTANT:** Change this password immediately after your first login!

## File Structure Explanation

- `server-mysql.js` - Modified server implementation to use MySQL
- `db-mysql.js` - MySQL database adapter
- `mysql-schema.js` - Database schema initialization script
- `start-mysql.cjs` - cPanel startup script for MySQL version
- `.env` - Environment configuration (edit with your settings)
- `dist/` - Built application files

## Troubleshooting

### Database Connection Issues
- Check that your MySQL connection string is correct
- Verify the MySQL user has the right permissions
- Make sure your database name includes your cPanel username prefix (often required by hosts)

### Application Not Starting
- Check the Node.js error logs in your cPanel account
- Verify that all required dependencies are installed
- Make sure file permissions are set properly (755 for directories, 644 for files)

### Login Problems
- If you can't log in as admin, rerun the MySQL schema script which creates the default admin user

## Security Notes

- Change the default admin password immediately after deployment
- Generate a strong, unique SESSION_SECRET in your .env file
- Set proper file permissions on your server
- Remove the `mysql-schema.js` script after successful initial deployment

For detailed deployment instructions, refer to the CPANEL_MYSQL_INSTRUCTIONS.txt file that was provided separately.