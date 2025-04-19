# IPCR Early Warning & Response System - cPanel Deployment

This package contains the IPCR Early Warning & Response System prepared for cPanel deployment.

## Deployment Steps

1. Upload all these files to your cPanel hosting
2. Edit the `.env` file with your specific database credentials and other settings
3. Set up the Node.js application in cPanel's Application Manager
   - Application root: The directory containing these files
   - Application URL: Your domain or subdomain
   - Application startup file: `start.cjs`
   - Node.js version: 16.x or newer
4. Run database migrations:
   - First, edit `run-migration.cjs` and change the SECURITY_TOKEN
   - Then run: `node run-migration.cjs`
   - Access: `http://yourdomain.com:8080/?token=your_security_token`
   - After migrations complete, DELETE `run-migration.cjs` for security

## Important Security Notes

- Change the database password in `.env` to a strong, unique password
- Generate a unique session secret in `.env`
- Remove `run-migration.cjs` after database setup
- Set proper file permissions (755 for directories, 644 for files)

For detailed deployment instructions, refer to the CPANEL_DEPLOYMENT.md file in the original repository.