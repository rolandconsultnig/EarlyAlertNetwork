# IPCR Early Warning & Response System - Ubuntu Desktop Deployment Guide

This guide provides step-by-step instructions for deploying the IPCR Early Warning & Response System on Ubuntu Desktop, both manually and using a one-click deployment script.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Manual Deployment](#manual-deployment)
   - [Step 1: System Preparation](#step-1-system-preparation)
   - [Step 2: Clone the Repository](#step-2-clone-the-repository)
   - [Step 3: Install Node.js](#step-3-install-nodejs)
   - [Step 4: Set Up PostgreSQL](#step-4-set-up-postgresql)
   - [Step 5: Configure the Application](#step-5-configure-the-application)
   - [Step 6: Install and Build the Application](#step-6-install-and-build-the-application)
   - [Step 7: Set Up PM2 Process Manager](#step-7-set-up-pm2-process-manager)
   - [Step 8: Configure Nginx (Optional)](#step-8-configure-nginx-optional)
   - [Step 9: Set Up System Service](#step-9-set-up-system-service)
3. [One-Click Deployment](#one-click-deployment)
   - [Using the Automated Deployment Script](#using-the-automated-deployment-script)
4. [Troubleshooting](#troubleshooting)
5. [Updating the Application](#updating-the-application)

## Prerequisites

- Ubuntu Desktop 20.04 LTS or newer
- Sudo privileges on your Ubuntu system
- Basic knowledge of terminal/command line usage
- Internet connection

## Manual Deployment

### Step 1: System Preparation

1. Update your system:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. Install required packages:
   ```bash
   sudo apt install -y git curl build-essential
   ```

### Step 2: Clone the Repository

1. Navigate to a suitable directory (e.g., home directory):
   ```bash
   cd ~
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ipcr-ewers.git
   cd ipcr-ewers
   ```

### Step 3: Install Node.js

1. Install Node.js 16.x:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. Verify the installation:
   ```bash
   node --version  # Should show v16.x.x
   npm --version   # Should show 8.x.x or newer
   ```

### Step 4: Set Up PostgreSQL

1. Install PostgreSQL:
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```

2. Start PostgreSQL service:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. Create a database and user:
   ```bash
   sudo -u postgres psql -c "CREATE USER ipcr_user WITH PASSWORD 'your_secure_password';"
   sudo -u postgres psql -c "CREATE DATABASE ipcr_db OWNER ipcr_user;"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ipcr_db TO ipcr_user;"
   ```

### Step 5: Configure the Application

1. Create environment variables file:
   ```bash
   cd ~/ipcr-ewers
   cp .env.example .env  # If .env.example exists, otherwise create a new file
   ```

2. Edit the `.env` file with your preferred text editor:
   ```bash
   nano .env
   ```

3. Add the following environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://ipcr_user:your_secure_password@localhost:5432/ipcr_db
   SESSION_SECRET=your_random_session_secret_here
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

4. Save and close the file (Ctrl+X, then Y, then Enter if using nano).

### Step 6: Install and Build the Application

1. Install dependencies:
   ```bash
   cd ~/ipcr-ewers
   npm ci
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Run database migrations:
   ```bash
   npm run db:push
   ```

### Step 7: Set Up PM2 Process Manager

1. Install PM2 globally:
   ```bash
   sudo npm install -g pm2
   ```

2. Start the application with PM2:
   ```bash
   cd ~/ipcr-ewers
   pm2 start npm --name "ipcr-app" -- start
   ```

3. Configure PM2 to start on system boot:
   ```bash
   pm2 startup
   ```

4. Follow the instructions given by the previous command, which usually involves running a command like:
   ```bash
   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your_username --hp /home/your_username
   ```

5. Save the current PM2 process list:
   ```bash
   pm2 save
   ```

### Step 8: Configure Nginx (Optional)

1. Install Nginx:
   ```bash
   sudo apt install -y nginx
   ```

2. Create a new site configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/ipcr-ewers
   ```

3. Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_ip;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ipcr-ewers /etc/nginx/sites-enabled/
   ```

5. Test the configuration:
   ```bash
   sudo nginx -t
   ```

6. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### Step 9: Set Up System Service

Instead of using PM2, you may optionally set up a systemd service:

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/ipcr-ewers.service
   ```

2. Add the following content:
   ```
   [Unit]
   Description=IPCR Early Warning & Response System
   After=network.target

   [Service]
   Type=simple
   User=your_username
   WorkingDirectory=/home/your_username/ipcr-ewers
   ExecStart=/usr/bin/npm start
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl enable ipcr-ewers
   sudo systemctl start ipcr-ewers
   ```

4. Check the status:
   ```bash
   sudo systemctl status ipcr-ewers
   ```

## One-Click Deployment

For a fully automated deployment experience, we've created a one-click deployment script.

### Using the Automated Deployment Script

1. Create a deployment script file:
   ```bash
   cd ~
   nano deploy-ipcr.sh
   ```

2. Paste the following script:

```bash
#!/bin/bash

# Exit on error
set -e

# ANSI colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${YELLOW}====================================================${NC}"
echo -e "${GREEN}IPCR Early Warning & Response System - Ubuntu Deployment${NC}"
echo -e "${YELLOW}====================================================${NC}"
echo ""

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root or with sudo.${NC}"
  exit 1
fi

# Get the actual username (not root)
if [ -n "$SUDO_USER" ]; then
  ACTUAL_USER=$SUDO_USER
else
  echo -e "${YELLOW}Enter the username to run the application:${NC}"
  read ACTUAL_USER
fi

HOME_DIR=$(eval echo ~$ACTUAL_USER)
echo -e "${YELLOW}Installing as user:${NC} $ACTUAL_USER"
echo -e "${YELLOW}Home directory:${NC} $HOME_DIR"
echo ""

# Ask for configuration
echo -e "${YELLOW}Application Configuration${NC}"
echo "----------------------------"

# Database settings
read -p "PostgreSQL database name [ipcr_db]: " DB_NAME
DB_NAME=${DB_NAME:-ipcr_db}

read -p "PostgreSQL username [ipcr_user]: " DB_USER
DB_USER=${DB_USER:-ipcr_user}

read -s -p "PostgreSQL password [auto-generate]: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
  # Generate random password
  DB_PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9')
  echo -e "${GREEN}Generated database password:${NC} $DB_PASSWORD ${YELLOW}(SAVE THIS)${NC}"
fi

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Ask to install Nginx
read -p "Install and configure Nginx as reverse proxy? (y/n) [y]: " INSTALL_NGINX
INSTALL_NGINX=${INSTALL_NGINX:-y}

# Repository URL
read -p "Git repository URL [https://github.com/your-username/ipcr-ewers.git]: " REPO_URL
REPO_URL=${REPO_URL:-https://github.com/your-username/ipcr-ewers.git}

# App port
read -p "Application port [5000]: " APP_PORT
APP_PORT=${APP_PORT:-5000}

# API keys
echo -e "${YELLOW}Do you want to configure external services? (Social media, SMS) (y/n) [n]:${NC} "
read CONFIGURE_EXTERNAL
CONFIGURE_EXTERNAL=${CONFIGURE_EXTERNAL:-n}

if [[ "$CONFIGURE_EXTERNAL" == "y" || "$CONFIGURE_EXTERNAL" == "Y" ]]; then
  echo -e "${YELLOW}Twitter/X Configuration (leave empty to skip)${NC}"
  read -p "API Key: " TWITTER_API_KEY
  read -p "API Secret: " TWITTER_API_SECRET
  read -p "Access Token: " TWITTER_ACCESS_TOKEN
  read -p "Access Secret: " TWITTER_ACCESS_SECRET
  
  echo -e "${YELLOW}Facebook Configuration (leave empty to skip)${NC}"
  read -p "App ID: " FACEBOOK_APP_ID
  read -p "App Secret: " FACEBOOK_APP_SECRET
  read -p "Access Token: " FACEBOOK_ACCESS_TOKEN
  
  echo -e "${YELLOW}Instagram Configuration (leave empty to skip)${NC}"
  read -p "Username: " INSTAGRAM_USERNAME
  read -s -p "Password: " INSTAGRAM_PASSWORD
  echo ""
  
  echo -e "${YELLOW}Twilio Configuration (leave empty to skip)${NC}"
  read -p "Account SID: " TWILIO_ACCOUNT_SID
  read -p "Auth Token: " TWILIO_AUTH_TOKEN
  read -p "Phone Number: " TWILIO_PHONE_NUMBER
fi

# Get confirmation
echo ""
echo -e "${YELLOW}Deployment Summary:${NC}"
echo "-------------------"
echo "User: $ACTUAL_USER"
echo "Database: $DB_NAME"
echo "Database User: $DB_USER"
echo "Application Port: $APP_PORT"
echo "Install Nginx: $INSTALL_NGINX"
echo "Repository URL: $REPO_URL"
echo ""

read -p "Proceed with installation? (y/n) [y]: " CONFIRM
CONFIRM=${CONFIRM:-y}

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo -e "${RED}Deployment cancelled.${NC}"
  exit 1
fi

# Start installation
echo -e "\n${YELLOW}Starting deployment...${NC}"

# Update system
echo -e "\n${YELLOW}Updating system packages...${NC}"
apt update
apt upgrade -y

# Install essential packages
echo -e "\n${YELLOW}Installing required packages...${NC}"
apt install -y git curl build-essential

# Install Node.js
echo -e "\n${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs

# Check Node.js installation
NODE_VERSION=$(node --version)
echo -e "${GREEN}Node.js version:${NC} $NODE_VERSION"

# Install PostgreSQL
echo -e "\n${YELLOW}Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Ensure PostgreSQL is running
systemctl start postgresql
systemctl enable postgresql

# Create database and user
echo -e "\n${YELLOW}Setting up PostgreSQL database...${NC}"
su - postgres -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\""
su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\""
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""

# Install PM2
echo -e "\n${YELLOW}Installing PM2 process manager...${NC}"
npm install -g pm2

# Clone repository
echo -e "\n${YELLOW}Cloning application repository...${NC}"
cd $HOME_DIR
if [ -d "ipcr-ewers" ]; then
  echo -e "${YELLOW}Directory already exists. Removing...${NC}"
  rm -rf ipcr-ewers
fi

git clone $REPO_URL ipcr-ewers
chown -R $ACTUAL_USER:$ACTUAL_USER ipcr-ewers
cd ipcr-ewers

# Create environment file
echo -e "\n${YELLOW}Creating environment configuration...${NC}"
cat > .env << EOL
NODE_ENV=production
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
SESSION_SECRET=$SESSION_SECRET
EOL

# Add external service configurations if provided
if [[ "$CONFIGURE_EXTERNAL" == "y" || "$CONFIGURE_EXTERNAL" == "Y" ]]; then
  if [ -n "$TWITTER_API_KEY" ]; then
    cat >> .env << EOL
TWITTER_API_KEY=$TWITTER_API_KEY
TWITTER_API_SECRET=$TWITTER_API_SECRET
TWITTER_ACCESS_TOKEN=$TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_SECRET=$TWITTER_ACCESS_SECRET
EOL
  fi
  
  if [ -n "$FACEBOOK_APP_ID" ]; then
    cat >> .env << EOL
FACEBOOK_APP_ID=$FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=$FACEBOOK_APP_SECRET
FACEBOOK_ACCESS_TOKEN=$FACEBOOK_ACCESS_TOKEN
EOL
  fi
  
  if [ -n "$INSTAGRAM_USERNAME" ]; then
    cat >> .env << EOL
INSTAGRAM_USERNAME=$INSTAGRAM_USERNAME
INSTAGRAM_PASSWORD=$INSTAGRAM_PASSWORD
EOL
  fi
  
  if [ -n "$TWILIO_ACCOUNT_SID" ]; then
    cat >> .env << EOL
TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER
EOL
  fi
fi

chown $ACTUAL_USER:$ACTUAL_USER .env

# Install dependencies and build app
echo -e "\n${YELLOW}Installing dependencies and building application...${NC}"
sudo -u $ACTUAL_USER bash -c "cd $HOME_DIR/ipcr-ewers && npm ci"
sudo -u $ACTUAL_USER bash -c "cd $HOME_DIR/ipcr-ewers && npm run build"

# Run database migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
sudo -u $ACTUAL_USER bash -c "cd $HOME_DIR/ipcr-ewers && npm run db:push"

# Install and configure Nginx if requested
if [[ "$INSTALL_NGINX" == "y" || "$INSTALL_NGINX" == "Y" ]]; then
  echo -e "\n${YELLOW}Installing and configuring Nginx...${NC}"
  apt install -y nginx
  
  # Create Nginx configuration
  cat > /etc/nginx/sites-available/ipcr-ewers << EOL
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL
  
  # Enable site
  ln -sf /etc/nginx/sites-available/ipcr-ewers /etc/nginx/sites-enabled/
  
  # Check configuration
  nginx -t
  
  # Restart Nginx
  systemctl restart nginx
  systemctl enable nginx
  
  echo -e "${GREEN}Nginx configured successfully.${NC}"
fi

# Start application with PM2
echo -e "\n${YELLOW}Starting application with PM2...${NC}"
cd $HOME_DIR/ipcr-ewers
sudo -u $ACTUAL_USER bash -c "cd $HOME_DIR/ipcr-ewers && pm2 start npm --name 'ipcr-app' -- start"

# Setup PM2 to start on boot
pm2_startup=$(sudo -u $ACTUAL_USER bash -c "pm2 startup systemd -u $ACTUAL_USER --hp $HOME_DIR | tail -n 1")
eval "$pm2_startup"
sudo -u $ACTUAL_USER bash -c "pm2 save"

# Display information
echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}IPCR Early Warning & Response System deployment complete!${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "\n${YELLOW}Access Information:${NC}"
echo -e "Local URL: http://localhost:$APP_PORT"

if [[ "$INSTALL_NGINX" == "y" || "$INSTALL_NGINX" == "Y" ]]; then
  IP_ADDRESS=$(hostname -I | awk '{print $1}')
  echo -e "Public URL: http://$IP_ADDRESS"
fi

echo -e "\n${YELLOW}Database Information:${NC}"
echo -e "Name: $DB_NAME"
echo -e "User: $DB_USER"
echo -e "Password: $DB_PASSWORD"

echo -e "\n${YELLOW}Application logs can be viewed with:${NC}"
echo -e "sudo -u $ACTUAL_USER bash -c 'pm2 logs ipcr-app'"

echo -e "\n${YELLOW}To restart the application:${NC}"
echo -e "sudo -u $ACTUAL_USER bash -c 'pm2 restart ipcr-app'"

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
```

3. Make the script executable:
   ```bash
   chmod +x deploy-ipcr.sh
   ```

4. Run the script:
   ```bash
   sudo ./deploy-ipcr.sh
   ```

5. Follow the prompts to configure your deployment.

## Troubleshooting

### Application Won't Start

1. Check the logs:
   ```bash
   pm2 logs ipcr-app
   ```

2. Verify environment variables:
   ```bash
   cat ~/ipcr-ewers/.env
   ```

3. Check if the database is running:
   ```bash
   sudo systemctl status postgresql
   ```

4. Test database connection:
   ```bash
   psql -U ipcr_user -h localhost -d ipcr_db
   ```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check PostgreSQL authentication settings:
   ```bash
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   ```
   
   Make sure there's a line like:
   ```
   host    all             all             127.0.0.1/32            md5
   ```

3. Restart PostgreSQL:
   ```bash
   sudo systemctl restart postgresql
   ```

### Nginx Issues

1. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

2. Test Nginx configuration:
   ```bash
   sudo nginx -t
   ```

3. Check Nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

## Updating the Application

To update the application:

1. Navigate to the application directory:
   ```bash
   cd ~/ipcr-ewers
   ```

2. Pull the latest changes:
   ```bash
   git pull
   ```

3. Install dependencies and rebuild:
   ```bash
   npm ci
   npm run build
   ```

4. Run database migrations if needed:
   ```bash
   npm run db:push
   ```

5. Restart the application:
   ```bash
   pm2 restart ipcr-app
   ```