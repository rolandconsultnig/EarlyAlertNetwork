const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * IPCR Early Warning & Response System - cPanel Build Script
 * 
 * This script builds the application for cPanel deployment when SSH access is not available.
 * It performs the following steps:
 * 1. Builds the frontend (React) application for production
 * 2. Copies the server files with MySQL adaptations
 * 3. Creates a bundled version ready for upload via FTP
 * 4. Generates deployment instructions
 */

console.log('\n🚀 Building IPCR Early Warning System for cPanel Deployment\n');

try {
  // Step 1: Build the React application
  console.log('📦 Building the frontend application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Create deployment directory
  const deployDir = path.join(__dirname, 'cpanel-deploy');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  // Step 3: Copy build files to deployment directory
  console.log('📋 Copying production build to deployment directory...');
  
  // Ensure dist directory exists in deploy dir
  const distDir = path.join(deployDir, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Copy client build to dist directory
  copyDirectory(path.join(__dirname, 'dist'), distDir);
  
  // Step 4: Setup MySQL server files
  console.log('🔄 Setting up server files with MySQL support...');
  
  // Copy necessary MySQL server files
  if (!fs.existsSync(path.join(deployDir, 'server-mysql.js'))) {
    fs.copyFileSync(
      path.join(__dirname, 'server', 'server-mysql.js'), 
      path.join(deployDir, 'server-mysql.js')
    );
  }
  
  // Create starter script if it doesn't exist
  if (!fs.existsSync(path.join(deployDir, 'start-mysql.cjs'))) {
    const startScript = `
#!/usr/bin/env node
require('./server-mysql.js');
`;
    fs.writeFileSync(path.join(deployDir, 'start-mysql.cjs'), startScript);
    fs.chmodSync(path.join(deployDir, 'start-mysql.cjs'), '755'); // Make executable
  }
  
  // Step 5: Prepare package.json for cPanel
  console.log('📝 Preparing package.json for cPanel Node.js app...');
  const templatePkgPath = path.join(deployDir, 'package.json.template');
  if (fs.existsSync(templatePkgPath)) {
    // Use existing template if available
    const templateContent = fs.readFileSync(templatePkgPath, 'utf8');
    fs.writeFileSync(path.join(deployDir, 'package.json'), templateContent);
  } else {
    // Create a minimal package.json for cPanel
    const packageJson = {
      name: "ipcr-early-warning-system",
      version: "1.0.0",
      description: "IPCR Early Warning & Response System",
      main: "start-mysql.cjs",
      scripts: {
        "start": "node start-mysql.cjs"
      },
      dependencies: {
        "express": "^4.18.2",
        "express-session": "^1.17.3",
        "cors": "^2.8.5",
        "mysql2": "^3.6.5",
        "dotenv": "^16.3.1",
        "passport": "^0.7.0",
        "passport-local": "^1.0.0",
        "connect-mysql": "^4.0.0",
        "bcryptjs": "^2.4.3"
      },
      engines: {
        "node": ">=18.0.0"
      }
    };
    
    fs.writeFileSync(
      path.join(deployDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }
  
  // Step 6: Create .htaccess file for proper routing
  if (!fs.existsSync(path.join(deployDir, '.htaccess'))) {
    const htaccess = `
# Handle frontend routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
    fs.writeFileSync(path.join(deployDir, '.htaccess'), htaccess);
  }
  
  // Step 7: Create .env template file
  if (!fs.existsSync(path.join(deployDir, '.env.template'))) {
    const envTemplate = `
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=your_cpanel_database_user
MYSQL_PASSWORD=your_cpanel_database_password
MYSQL_DATABASE=ipcr-new
MYSQL_PORT=3306

# Session Secret (Change this to a random string)
SESSION_SECRET=change-this-to-a-random-secure-string

# Application settings
PORT=8080
NODE_ENV=production

# API Keys (if needed)
OPENAI_API_KEY=your_openai_api_key
`;
    fs.writeFileSync(path.join(deployDir, '.env.template'), envTemplate);
  }
  
  // Step 8: Create deployment README
  const readmePath = path.join(deployDir, 'README.md');
  const deploymentReadme = `
# IPCR Early Warning System - cPanel Deployment

## Deployment Instructions (No SSH Access)

### 1. Prepare Your cPanel Account
- Log in to your cPanel account
- Navigate to "Setup Node.js App" in cPanel
- Create a new Node.js application:
  - Node.js version: 18.x or higher
  - Application mode: Production
  - Application root: Your desired directory (e.g., 'earlywarning')
  - Application URL: Your domain or subdomain
  - Application startup file: start-mysql.cjs

### 2. Upload Files
- Using FTP or the cPanel File Manager, upload all files from the 'cpanel-deploy' directory to your configured application root directory

### 3. Setup Environment Variables
- In cPanel, navigate to "Setup Node.js App" 
- Click on your application, then "Environment Variables"
- Add variables from '.env.template' with your actual values:
  - MYSQL_HOST: Your cPanel MySQL hostname (typically 'localhost')
  - MYSQL_USER: Your cPanel database username
  - MYSQL_PASSWORD: Your cPanel database password
  - MYSQL_DATABASE: ipcr-new
  - SESSION_SECRET: A long, random string
  - PORT: Usually 8080 (may be assigned by cPanel)
  - NODE_ENV: production
  - OPENAI_API_KEY: Your API key if translation features are used

### 4. Setup Database
- In cPanel, navigate to "MySQL Databases"
- Create a new database named "ipcr-new"
- Create a user with all privileges on this database
- Use the provided 'mysql-schema.sql' file to create tables:
  - Go to phpMyAdmin
  - Select your database
  - Go to the "Import" tab
  - Upload and execute 'mysql-schema.sql'

### 5. Install Dependencies
- In cPanel, navigate to "Setup Node.js App"
- Click on your application, then the "Run NPM Install" button

### 6. Start the Application
- Click the "Start Application" or "Restart Application" button
- Wait for the app to start (check the logs if available)

### 7. Test the Application
- Visit your configured domain/subdomain to verify the application is running

## Troubleshooting

If your application doesn't start:
1. Check your environment variables are correctly set
2. Verify the database connection using phpMyAdmin
3. Check if Node.js is correctly configured in cPanel
4. Review application logs in cPanel (if available)
5. See the 'TROUBLESHOOTING.md' file for more detailed help

`;
  fs.writeFileSync(readmePath, deploymentReadme);
  
  // Step 9: Create a ZIP file for easy download (if zip command is available)
  console.log('📦 Creating ZIP archive for easy download...');
  try {
    const zipFilename = 'cpanel-deploy-package.zip';
    execSync(`zip -r ${zipFilename} cpanel-deploy/`, { stdio: 'inherit' });
    console.log(`✅ Created ${zipFilename} successfully!`);
  } catch (error) {
    console.log('⚠️ Could not create ZIP file automatically. Please create it manually.');
  }
  
  console.log(`
✅ Build completed successfully!

📋 Deployment Instructions:
1. Download the 'cpanel-deploy-package.zip' file
2. Extract it to your local machine
3. Follow the instructions in 'cpanel-deploy/README.md' to deploy to cPanel
4. Remember to create database tables using 'mysql-schema.sql'

No SSH access is required for this deployment method. 
Everything can be done through the cPanel web interface.
`);

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

/**
 * Helper function to copy a directory recursively
 */
function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}