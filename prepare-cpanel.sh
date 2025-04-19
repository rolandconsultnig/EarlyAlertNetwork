#!/bin/bash

# IPCR Early Warning & Response System - cPanel Preparation Script
# This script prepares the project for cPanel deployment with MySQL support

# Set the script to exit on any error
set -e

echo "=== IPCR Early Warning & Response System - cPanel Preparation ==="
echo "This script will prepare your application for cPanel deployment with MySQL support."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js before running this script."
    exit 1
fi

# Install required dependencies
echo "Installing required dependencies..."
npm install mysql2 express-mysql-session dotenv

# Run the preparation script
echo "Running preparation script..."
node prepare-for-cpanel.mjs

echo
echo "=== Preparation Complete ==="
echo "Your application is now ready for cPanel deployment with MySQL support."
echo "The deployment package is located in the 'cpanel-deploy' directory."
echo
echo "Next steps:"
echo "1. Upload the contents of the 'cpanel-deploy' directory to your cPanel hosting"
echo "2. Follow the instructions in the README.md file to complete the deployment"
echo
echo "For detailed instructions, see CPANEL_MYSQL_INSTRUCTIONS.txt"