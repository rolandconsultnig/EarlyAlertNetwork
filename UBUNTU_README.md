# Ubuntu Deployment for IPCR Early Warning & Response System

This document provides instructions for deploying the IPCR Early Warning & Response System on Ubuntu Desktop.

## Quick Start

### One-Click Deployment (Fully Automated)

1. Download the deployment script:
   ```bash
   wget https://raw.githubusercontent.com/yourusername/ipcr-ewers/main/deploy-ubuntu.sh
   ```

2. Make the script executable:
   ```bash
   chmod +x deploy-ubuntu.sh
   ```

3. Run the script with sudo:
   ```bash
   sudo ./deploy-ubuntu.sh
   ```

4. Follow the on-screen prompts to configure your installation.

5. After installation completes, access the application at:
   - http://localhost:5000 (default port)
   - Or through the desktop shortcut created on your desktop

### What the One-Click Deployment Does

The automated deployment script will:

1. Install all required dependencies (Node.js, PostgreSQL, Nginx, etc.)
2. Create and configure the database
3. Clone the application repository
4. Build and configure the application
5. Set up an admin user for immediate access
6. Configure the application to start automatically on system boot
7. Create a desktop shortcut for easy access
8. Provide an uninstall script if you ever need to remove the application

## Manual Deployment

For step-by-step manual deployment instructions, see [UBUNTU_DEPLOYMENT.md](./UBUNTU_DEPLOYMENT.md).

## System Requirements

- Ubuntu Desktop 20.04 LTS or newer
- At least 2GB of RAM
- At least 10GB of free disk space
- Internet connection for installation
- Administrative (sudo) access

## Troubleshooting

If you encounter issues during the installation:

1. Check the detailed logs displayed during the installation process
2. For application issues after installation, check the logs:
   ```bash
   sudo pm2 logs ipcr-app
   ```
3. Refer to the [UBUNTU_DEPLOYMENT.md](./UBUNTU_DEPLOYMENT.md) for troubleshooting guidance

## Security Notes

- The one-click installer will create an admin user with the credentials you specify
- For production use, ensure you use strong passwords
- Consider changing default passwords after installation

## Uninstalling

To uninstall the application:

```bash
sudo ~/uninstall-ipcr.sh
```

Follow the prompts to remove the application and optionally delete the database.