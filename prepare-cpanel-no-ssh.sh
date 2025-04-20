#!/bin/bash

# IPCR Early Warning System - cPanel Deployment Script
# This script prepares the project for cPanel deployment without SSH access

echo "==== IPCR Early Warning System - cPanel Deployment (No SSH) ===="
echo ""

# Step 1: Prepare cPanel files
echo "🔧 Step 1: Preparing cPanel deployment files..."
node cpanel-prepare-no-ssh.cjs

# Step 2: Build the frontend
echo ""
echo "🔨 Step 2: Building the frontend application..."
npm run build

# Step 3: Copy built files to deployment directory
echo ""
echo "📂 Step 3: Copying built files to deployment directory..."
if [ -d "dist" ]; then
  # Make sure the target directory exists
  mkdir -p cpanel-deploy/dist
  
  # Clear existing files
  rm -rf cpanel-deploy/dist/*
  
  # Copy all files from dist to cpanel-deploy/dist
  cp -r dist/* cpanel-deploy/dist/
  
  echo "✅ Frontend files copied successfully"
else
  echo "❌ Build directory not found. Run 'npm run build' first."
  exit 1
fi

# Step 4: Create a ZIP archive of the deployment files
echo ""
echo "📦 Step 4: Creating deployment ZIP archive..."
zip -r cpanel-deploy-package.zip cpanel-deploy/

echo ""
echo "==========================================================="
echo "✅ cPanel deployment preparation completed!"
echo ""
echo "📋 Instructions:"
echo "1. Download the 'cpanel-deploy-package.zip' file"
echo "2. Extract the archive on your local machine"
echo "3. Upload all files from 'cpanel-deploy/' to your cPanel hosting via FTP"
echo "4. Follow instructions in 'cpanel-deploy/README.md' to complete setup"
echo ""
echo "Default admin login:"
echo "- Username: admin"
echo "- Password: @admin123321nimda$"
echo "==========================================================="