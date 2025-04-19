/**
 * IPCR Early Warning & Response System - cPanel Preparation Script
 * This script creates the necessary files for cPanel deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

console.log(`${colors.yellow}====================================================`);
console.log(`${colors.green}IPCR Early Warning & Response System - cPanel Preparation`);
console.log(`${colors.yellow}====================================================\n`);

// Check if dist directory exists (application already built)
if (!fs.existsSync('dist')) {
  console.log(`${colors.yellow}Build not found. Make sure you've run 'npm run build' first.${colors.reset}`);
  process.exit(1);
}

// Create deployment directory
const deployDir = 'cpanel-deploy';
console.log(`${colors.yellow}Creating deployment package...${colors.reset}`);

if (fs.existsSync(deployDir)) {
  console.log(`${colors.yellow}Removing existing deployment package...${colors.reset}`);
  fs.rmSync(deployDir, { recursive: true, force: true });
}

fs.mkdirSync(deployDir, { recursive: true });

// Create .htaccess file
console.log(`${colors.yellow}Creating .htaccess file...${colors.reset}`);
fs.writeFileSync(path.join(deployDir, '.htaccess'), `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
</IfModule>`);

// Create .env template
console.log(`${colors.yellow}Creating .env template...${colors.reset}`);
const sessionSecret = crypto.randomBytes(32).toString('base64');
fs.writeFileSync(path.join(deployDir, '.env'), `NODE_ENV=production
DATABASE_URL=postgresql://db_user:db_password@localhost:5432/db_name
SESSION_SECRET=${sessionSecret}

# Twitter/X (uncomment and set values if needed)
# TWITTER_API_KEY=your_twitter_api_key
# TWITTER_API_SECRET=your_twitter_api_secret
# TWITTER_ACCESS_TOKEN=your_twitter_access_token
# TWITTER_ACCESS_SECRET=your_twitter_access_secret

# Facebook (uncomment and set values if needed)
# FACEBOOK_APP_ID=your_facebook_app_id
# FACEBOOK_APP_SECRET=your_facebook_app_secret
# FACEBOOK_ACCESS_TOKEN=your_facebook_access_token

# Instagram (uncomment and set values if needed)
# INSTAGRAM_USERNAME=your_instagram_username
# INSTAGRAM_PASSWORD=your_instagram_password

# Twilio (uncomment and set values if needed)
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=your_twilio_phone_number`);

// Create startup script - using CommonJS since it's more compatible with cPanel
console.log(`${colors.yellow}Creating startup script...${colors.reset}`);
fs.writeFileSync(path.join(deployDir, 'start.cjs'), `#!/usr/bin/env node

/**
 * cPanel startup script for IPCR Early Warning & Response System
 * 
 * This script handles starting the application with proper environment variables
 * and is designed to work with cPanel's Node.js application manager.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Determine application directory
const appRoot = __dirname;

// Load environment variables from .env file
dotenv.config({ path: path.join(appRoot, '.env') });

// Default port (can be overridden by PORT environment variable)
const port = process.env.PORT || 5000;

// Set environment variables
process.env.PORT = port;

console.log('Starting IPCR Early Warning & Response System...');
console.log(\`Application root: \${appRoot}\`);
console.log(\`Port: \${port}\`);
console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);

// Start the application
const app = spawn('node', [path.join(appRoot, 'dist/index.js')], {
  stdio: 'inherit',
  env: process.env
});

app.on('close', (code) => {
  console.log(\`Application process exited with code \${code}\`);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Shutting down gracefully...');
  app.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  app.kill('SIGTERM');
});`);

// Create database migration helper
console.log(`${colors.yellow}Creating migration helper...${colors.reset}`);
fs.writeFileSync(path.join(deployDir, 'run-migration.cjs'), `/**
 * Database migration helper for cPanel deployment
 * 
 * Use with caution and ONLY for initial setup.
 * Remove this file after running migrations for security.
 */

const { execSync } = require('child_process');
require('dotenv').config();

// Security token (change this to a random string)
const SECURITY_TOKEN = 'change_this_to_a_random_string';

// Simple HTTP server to handle migration
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const providedToken = parsedUrl.query.token;
  
  res.setHeader('Content-Type', 'application/json');
  
  if (!providedToken || providedToken !== SECURITY_TOKEN) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: 'Access denied. Invalid token.' }));
    return;
  }
  
  // Verify database connection
  if (!process.env.DATABASE_URL) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'DATABASE_URL not set in environment variables.' }));
    return;
  }
  
  try {
    // Run migrations
    console.log('Running database migrations...');
    execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
    
    res.statusCode = 200;
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Database migrations completed successfully. REMOVE THIS FILE NOW for security purposes.' 
    }));
  } catch (error) {
    console.error('Migration error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Start server on port 8080 or the port specified in environment
const PORT = process.env.MIGRATION_PORT || 8080;
server.listen(PORT, () => {
  console.log(\`Migration server running at http://localhost:\${PORT}\`);
  console.log(\`Access with token: http://localhost:\${PORT}/?token=\${SECURITY_TOKEN}\`);
  console.log('WARNING: Delete this file after running migrations!');
});`);

// Create README
console.log(`${colors.yellow}Creating README...${colors.reset}`);
fs.writeFileSync(path.join(deployDir, 'README.md'), `# IPCR Early Warning & Response System - cPanel Deployment

This package contains the IPCR Early Warning & Response System prepared for cPanel deployment.

## Deployment Steps

1. Upload all these files to your cPanel hosting
2. Edit the \`.env\` file with your specific database credentials and other settings
3. Set up the Node.js application in cPanel's Application Manager
   - Application root: The directory containing these files
   - Application URL: Your domain or subdomain
   - Application startup file: \`start.cjs\`
   - Node.js version: 16.x or newer
4. Run database migrations:
   - First, edit \`run-migration.cjs\` and change the SECURITY_TOKEN
   - Then run: \`node run-migration.cjs\`
   - Access: \`http://yourdomain.com:8080/?token=your_security_token\`
   - After migrations complete, DELETE \`run-migration.cjs\` for security

## Important Security Notes

- Change the database password in \`.env\` to a strong, unique password
- Generate a unique session secret in \`.env\`
- Remove \`run-migration.cjs\` after database setup
- Set proper file permissions (755 for directories, 644 for files)

For detailed deployment instructions, refer to the CPANEL_DEPLOYMENT.md file in the original repository.`);

// Create package.json for cPanel
console.log(`${colors.yellow}Creating modified package.json...${colors.reset}`);
const originalPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Modify package.json for cPanel compatibility
const cpanelPackageJson = {
  ...originalPackageJson,
  scripts: {
    ...originalPackageJson.scripts,
    start: 'node dist/index.js'
  },
  // Remove type: "module" since we're using CommonJS for cPanel compatibility
  type: undefined
};

fs.writeFileSync(
  path.join(deployDir, 'package.json'), 
  JSON.stringify(cpanelPackageJson, null, 2)
);

// Copy required files
console.log(`${colors.yellow}Copying application files...${colors.reset}`);

// Function to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy directories
copyDir('dist', path.join(deployDir, 'dist'));
if (fs.existsSync('migrations')) {
  copyDir('migrations', path.join(deployDir, 'migrations'));
}

// Copy package-lock.json if it exists
if (fs.existsSync('package-lock.json')) {
  fs.copyFileSync('package-lock.json', path.join(deployDir, 'package-lock.json'));
}

// Make scripts executable
try {
  fs.chmodSync(path.join(deployDir, 'start.cjs'), 0o755);
  fs.chmodSync(path.join(deployDir, 'run-migration.cjs'), 0o755);
} catch (err) {
  console.log(`${colors.yellow}Warning: Could not set executable permissions on scripts${colors.reset}`);
}

// Create a zip file
console.log(`${colors.yellow}Creating deployment zip archive...${colors.reset}`);
try {
  execSync(`cd ${deployDir} && zip -r ../ipcr-cpanel-deploy.zip .`, { stdio: 'inherit' });
} catch (error) {
  console.log(`${colors.red}Failed to create zip file. You can zip the ${deployDir} directory manually.${colors.reset}`);
}

console.log(`\n${colors.green}====================================================${colors.reset}`);
console.log(`${colors.green}cPanel deployment package created successfully!${colors.reset}`);
console.log(`${colors.green}====================================================${colors.reset}`);
console.log(`\n${colors.yellow}Deployment package: ${colors.reset}ipcr-cpanel-deploy.zip`);
console.log(`${colors.yellow}Deployment directory: ${colors.reset}${deployDir}/`);
console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
console.log(`1. Upload the generated ipcr-cpanel-deploy.zip to your cPanel hosting`);
console.log(`2. Extract the files in your desired directory`);
console.log(`3. Install dependencies with: npm ci --omit=dev`);
console.log(`4. Configure your database settings in the .env file`);
console.log(`5. Follow the instructions in the README.md file to complete the setup`);
console.log(`\n${colors.green}Preparation completed successfully!${colors.reset}`);