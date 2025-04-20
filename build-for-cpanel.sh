#!/bin/bash

# IPCR Early Warning System - cPanel Build Script
# This script builds the project for cPanel deployment without SSH access

echo "==== IPCR Early Warning System - cPanel Build (No SSH) ===="
echo ""

# Step 1: Build the frontend
echo "🔨 Step 1: Building the frontend application..."
npm run build

# Step 2: Copy built files to deployment directory
echo ""
echo "📂 Step 2: Copying built files to deployment directory..."
if [ -d "dist" ]; then
  # Make sure the target directory exists
  mkdir -p cpanel-deploy/dist
  
  # Clear existing files
  rm -rf cpanel-deploy/dist/*
  
  # Copy all files from dist to cpanel-deploy/dist
  cp -r dist/* cpanel-deploy/dist/
  
  echo "✅ Frontend files copied successfully"
else
  echo "❌ Build directory not found. Build failed."
  exit 1
fi

# Step 3: Create a ZIP archive of the deployment files
echo ""
echo "📦 Step 3: Creating deployment ZIP archive..."
zip -r cpanel-deploy-package.zip cpanel-deploy/

echo ""
echo "==========================================================="
echo "✅ cPanel build completed!"
echo ""
echo "📋 Instructions:"
echo "1. Download the 'cpanel-deploy-package.zip' file"
echo "2. Extract the archive on your local machine"
echo "3. Upload all files from 'cpanel-deploy/' to your cPanel hosting via FTP"
echo "4. Follow instructions in 'cpanel-deploy/README.md' to complete setup"
echo "==========================================================="