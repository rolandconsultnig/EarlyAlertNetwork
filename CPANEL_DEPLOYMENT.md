# cPanel Deployment Guide for IPCR Early Warning & Response System

This guide provides step-by-step instructions for deploying the IPCR Early Warning & Response System on a cPanel hosting environment.

## Prerequisites

- cPanel hosting account with:
  - Node.js support (Node.js 16.x+)
  - PostgreSQL database support
  - SSH access (recommended but not required)
  - Support for persistent applications (Node.js applications)

## Step 1: Prepare the Application

Before uploading to cPanel, build the application locally:

1. Clone or download the repository to your local machine
2. Install dependencies and build the application:
   ```bash
   npm ci
   npm run build
   ```
3. Create a deployment package:
   ```bash
   mkdir deploy
   cp -r dist deploy/
   cp -r node_modules deploy/
   cp package.json package-lock.json deploy/
   cp .env.example deploy/.env
   ```

## Step 2: Create a Database in cPanel

1. Log in to your cPanel account
2. Navigate to "MySQL Databases" or "PostgreSQL Databases" (depending on what your host offers)
3. Create a new database:
   - Database Name: `ipcr_db` (or your preferred name)
4. Create a new database user:
   - Username: `ipcr_user` (or your preferred name)
   - Password: Use a strong password
5. Add the user to the database with all privileges

## Step 3: Upload Files to cPanel

### Using File Manager

1. Log in to cPanel
2. Open "File Manager"
3. Navigate to the directory where you want to deploy the application (e.g., `public_html/ipcr-app`)
4. Click "Upload" and select all files from your local `deploy` directory

### Using FTP (Recommended for Larger Files)

1. Use an FTP client (e.g., FileZilla, Cyberduck)
2. Connect to your cPanel server using FTP credentials
3. Upload all files from your local `deploy` directory to your chosen directory on the server (e.g., `public_html/ipcr-app`)

## Step 4: Configure Environment Variables

1. Navigate to your application directory in cPanel File Manager
2. Edit the `.env` file:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://ipcr_user:your_password@localhost:5432/ipcr_db
   SESSION_SECRET=your_random_session_secret
   ```

   For social media and SMS integrations (if used), add:
   ```
   # Twitter/X
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   TWITTER_ACCESS_TOKEN=your_twitter_access_token
   TWITTER_ACCESS_SECRET=your_twitter_access_secret

   # Facebook
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_ACCESS_TOKEN=your_facebook_access_token

   # Instagram
   INSTAGRAM_USERNAME=your_instagram_username
   INSTAGRAM_PASSWORD=your_instagram_password

   # Twilio
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

## Step 5: Run Database Migrations

### Option 1: Using SSH (If Available)

If your cPanel hosting provides SSH access:

1. Connect to your server via SSH
2. Navigate to your application directory
3. Run the database migration command:
   ```bash
   cd path/to/your/app
   npm run db:push
   ```

### Option 2: Without SSH Access

If SSH access is not available, you'll need to set up a temporary endpoint to run migrations:

1. Create a new file `migration.js` in your application directory:
   ```javascript
   // migration.js
   const { execSync } = require('child_process');
   const { createPool } = require('@neondatabase/serverless');
   const { drizzle } = require('drizzle-orm/neon-serverless');
   const { migrate } = require('drizzle-orm/neon-serverless/migrator');
   const path = require('path');
   
   // Load environment variables from .env file
   require('dotenv').config();
   
   async function runMigration() {
     try {
       console.log('Running database migrations...');
       const poolConfig = { connectionString: process.env.DATABASE_URL };
       const pool = createPool(poolConfig);
       
       const db = drizzle(pool);
       
       await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
       
       console.log('Migrations completed successfully');
       process.exit(0);
     } catch (error) {
       console.error('Migration error:', error);
       process.exit(1);
     }
   }
   
   runMigration();
   ```

2. Create a new file `run-migration.js` that you can access via the browser:
   ```javascript
   // run-migration.js
   const { exec } = require('child_process');
   
   // Simple security key check
   const allowedKey = 'your_secret_migration_key';
   
   exports.handler = async (event) => {
     const queryParams = event.queryStringParameters || {};
     const providedKey = queryParams.key;
     
     if (providedKey !== allowedKey) {
       return {
         statusCode: 403,
         body: JSON.stringify({ error: 'Unauthorized' })
       };
     }
     
     try {
       exec('node migration.js', (error, stdout, stderr) => {
         if (error) {
           console.error(`exec error: ${error}`);
           return;
         }
         console.log(`stdout: ${stdout}`);
         console.error(`stderr: ${stderr}`);
       });
       
       return {
         statusCode: 200,
         body: JSON.stringify({ message: 'Migration initiated' })
       };
     } catch (error) {
       return {
         statusCode: 500,
         body: JSON.stringify({ error: error.message })
       };
     }
   };
   ```

3. Access the migration endpoint via browser:
   `https://yourdomain.com/path/to/run-migration.js?key=your_secret_migration_key`

4. After migrations are complete, **remove these files** for security.

## Step 6: Set Up the Application in cPanel

### Using Application Manager (If Available)

Many cPanel hosts offer a Node.js Application Manager:

1. In cPanel, navigate to "Setup Node.js App"
2. Click "Create Application"
3. Enter the following details:
   - Node.js version: 16.x
   - Application mode: Production
   - Application root: Your application directory (e.g., `/public_html/ipcr-app`)
   - Application URL: Your domain or subdomain
   - Application startup file: `dist/index.js`
   - Environment variables: Leave empty (we already have a .env file)
4. Click "Create"

### Using Custom Setup (With SSH Access)

If your host allows SSH access but doesn't have an application manager:

1. Connect to your server via SSH
2. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
3. Navigate to your application directory
4. Start the application with PM2:
   ```bash
   cd path/to/your/app
   pm2 start dist/index.js --name "ipcr-app"
   ```
5. Save the PM2 process list:
   ```bash
   pm2 save
   ```
6. Set up PM2 to start on server reboot (if allowed by your host):
   ```bash
   pm2 startup
   ```

### Using Forever (Alternative to PM2)

If PM2 is not available:

1. Install Forever globally:
   ```bash
   npm install -g forever
   ```
2. Start the application:
   ```bash
   cd path/to/your/app
   forever start dist/index.js
   ```

## Step 7: Create .htaccess for Proxy (If Needed)

If you need to serve the application from a specific path or subdomain, create an `.htaccess` file in the appropriate directory:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
</IfModule>
```

Adjust the port number (`5000`) if your application runs on a different port.

## Step 8: Access Your Application

After completing the setup, your application should be accessible at:

- `https://yourdomain.com` (if deployed to main domain)
- `https://yourdomain.com/ipcr-app` (if deployed to a subdirectory)
- `https://subdomain.yourdomain.com` (if deployed to a subdomain)

## Troubleshooting

### Application Not Starting

1. Check application logs in cPanel (look for error logs in the "Logs" section)
2. Verify that the database connection string in `.env` is correct
3. Check if Node.js version is compatible (16.x+)
4. Ensure all required npm packages are installed

### Database Connection Issues

1. Verify that the PostgreSQL database is created correctly
2. Check that the database user has the correct permissions
3. Make sure the connection string in `.env` is formatted correctly
4. Some hosts require specific IP addresses for database connections

### File Permissions

If you encounter permission errors:

1. Set appropriate permissions for application files:
   ```bash
   find /path/to/your/app -type d -exec chmod 755 {} \;
   find /path/to/your/app -type f -exec chmod 644 {} \;
   ```

### Persistent App Not Staying Running

If your application keeps stopping:

1. Contact your hosting provider to ensure they support persistent Node.js applications
2. Some cPanel hosts require specific configurations for keeping Node.js apps running
3. Consider adding a monitoring endpoint that you can ping regularly to keep the app active

## Additional Tips for cPanel Deployment

1. **Use a Subdomain**: For cleaner management, consider deploying to a subdomain (e.g., `app.yourdomain.com`)
2. **Regular Backups**: Use cPanel's backup tools to make regular backups of your application and database
3. **SSL Certificate**: Enable HTTPS using cPanel's SSL/TLS section (Let's Encrypt is often available for free)
4. **Memory Limitations**: Be aware of memory limits on shared hosting; you may need to optimize your app
5. **Process Monitoring**: If available, set up alerts for when your Node.js process goes down

## Updating the Application

To update your application:

1. Make and test changes locally
2. Build the updated application:
   ```bash
   npm ci
   npm run build
   ```
3. Upload the updated files to your cPanel hosting
4. Restart the Node.js application through the cPanel interface or via SSH
5. Run migrations if database schema has changed