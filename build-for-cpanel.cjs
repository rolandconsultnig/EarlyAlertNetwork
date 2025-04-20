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

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 Building IPCR Early Warning System for cPanel Deployment\n');

// Paths
const sourceDir = __dirname;
const deployDir = path.join(sourceDir, 'cpanel-deploy');
const distDir = path.join(sourceDir, 'dist');

try {
  // Step 1: Prepare cPanel files (if needed)
  console.log('📋 Checking if cPanel deployment files are prepared...');
  if (!fs.existsSync(path.join(deployDir, 'server-mysql.js'))) {
    console.log('Preparing cPanel deployment files first...');
    execSync('node cpanel-prepare-no-ssh.cjs', { stdio: 'inherit' });
  } else {
    console.log('✅ cPanel deployment files already prepared');
  }

  // Step 2: Build the React application
  console.log('\n📦 Building the frontend application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 3: Copy build files to deployment directory
  const deployDistDir = path.join(deployDir, 'dist');
  if (!fs.existsSync(deployDistDir)) {
    fs.mkdirSync(deployDistDir, { recursive: true });
  }
  
  console.log('\n📋 Copying production build to deployment directory...');
  
  // Clear existing files
  if (fs.existsSync(deployDistDir)) {
    fs.readdirSync(deployDistDir).forEach(file => {
      const filePath = path.join(deployDistDir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        // Delete subdirectory
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        // Delete file
        fs.unlinkSync(filePath);
      }
    });
  }
  
  // Copy freshly built files
  if (fs.existsSync(distDir)) {
    copyDirectory(distDir, deployDistDir);
    console.log('✅ Production files copied successfully');
  } else {
    throw new Error('Build directory not found! The build may have failed.');
  }
  
  // Step 4: Create a ZIP file for easy download
  console.log('\n📦 Creating ZIP archive for easy download...');
  try {
    const zipFilename = 'cpanel-deploy-package.zip';
    execSync(`zip -r ${zipFilename} cpanel-deploy/`, { stdio: 'inherit' });
    console.log(`✅ Created ${zipFilename} successfully!`);
  } catch (error) {
    console.log('⚠️ Could not create ZIP file automatically. Please ZIP the cpanel-deploy folder manually.');
  }
  
  console.log(`
✅ Build completed successfully!

📋 Deployment Instructions:
1. Download the 'cpanel-deploy-package.zip' file
2. Extract it to your local machine
3. Upload all files from 'cpanel-deploy/' to your cPanel hosting via FTP
4. Follow the instructions in 'cpanel-deploy/README.md' to complete setup

No SSH access is required for this deployment method. 
Everything can be done through the cPanel web interface.

Default admin login:
- Username: admin
- Password: @admin123321nimda$
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