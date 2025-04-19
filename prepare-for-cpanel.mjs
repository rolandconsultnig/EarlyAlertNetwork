/**
 * IPCR Early Warning & Response System - cPanel Preparation Script
 * This script creates the necessary files for cPanel deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const outputDir = path.join(__dirname, 'cpanel-deploy');
const clientDir = path.join(__dirname, 'client');
const serverDir = path.join(__dirname, 'server');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Build the project
console.log('Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Copy required files
console.log('Copying files for cPanel deployment...');

// Copy client build output
console.log('Copying client build...');
copyDir(path.join(__dirname, 'dist'), path.join(outputDir, 'dist'));

// Copy server files (modified for MySQL compatibility)
console.log('Creating server files with MySQL support...');

// Copy MySQL-specific files
fs.copyFileSync(
  path.join(__dirname, 'cpanel-deploy', 'db-mysql.js'),
  path.join(outputDir, 'db-mysql.js')
);

fs.copyFileSync(
  path.join(__dirname, 'cpanel-deploy', 'server-mysql.js'),
  path.join(outputDir, 'server-mysql.js')
);

fs.copyFileSync(
  path.join(__dirname, 'cpanel-deploy', 'mysql-schema.js'),
  path.join(outputDir, 'mysql-schema.js')
);

fs.copyFileSync(
  path.join(__dirname, 'cpanel-deploy', 'start-mysql.cjs'),
  path.join(outputDir, 'start-mysql.cjs')
);

fs.copyFileSync(
  path.join(__dirname, 'cpanel-deploy', 'README.md'),
  path.join(outputDir, 'README.md')
);

// Make start script executable
try {
  execSync(`chmod +x "${path.join(outputDir, 'start-mysql.cjs')}"`, { stdio: 'inherit' });
} catch (error) {
  console.warn('Could not make start script executable. You may need to do this manually.');
}

// Create .env file template
console.log('Creating .env template...');
const envContent = `# IPCR Early Warning & Response System Environment Configuration
# Edit this file with your actual values before deployment

# Database Configuration (MySQL for cPanel)
DATABASE_URL=mysql://your_db_user:your_password@localhost:3306/your_db_name

# Session Secret (change this to a random secure string)
SESSION_SECRET=change_this_to_a_secure_random_string

# Port (usually provided by cPanel, but can be set as fallback)
PORT=5000

# Node Environment
NODE_ENV=production

# Social Media API Keys (if used)
# TWITTER_API_KEY=
# TWITTER_API_SECRET=
# FACEBOOK_APP_ID=
# FACEBOOK_APP_SECRET=
# INSTAGRAM_ACCESS_TOKEN=

# SMS API Keys (if used)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
`;

fs.writeFileSync(path.join(outputDir, '.env'), envContent);

// Create package.json
console.log('Creating package.json...');
const packageJson = {
  name: 'ipcr-early-warning-system-cpanel',
  version: '1.0.0',
  description: 'IPCR Early Warning & Response System (cPanel MySQL version)',
  main: 'server-mysql.js',
  scripts: {
    start: 'node start-mysql.cjs',
    'init-db': 'node mysql-schema.js'
  },
  dependencies: {
    'express': '^4.18.2',
    'express-session': '^1.17.3',
    'mysql2': '^3.3.3',
    'express-mysql-session': '^3.0.0',
    'dotenv': '^16.0.3'
  }
};

fs.writeFileSync(
  path.join(outputDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

console.log('cPanel deployment package created successfully!');
console.log(`Package location: ${outputDir}`);
console.log('Next steps:');
console.log('1. Upload the contents of the cpanel-deploy directory to your cPanel hosting');
console.log('2. Follow the instructions in README.md to complete the deployment');

// Utility function to copy directories recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}