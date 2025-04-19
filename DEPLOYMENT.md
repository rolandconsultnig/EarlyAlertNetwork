# IPCR Early Warning & Early Response System - AWS Deployment Guide

This guide provides step-by-step instructions for deploying the IPCR application to AWS with minimal configuration.

## Prerequisites

- [AWS Account](https://aws.amazon.com/)
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) (v16 or newer)
- [Docker](https://www.docker.com/) (optional, for local testing)

## Deployment Options

There are three ways to deploy this application to AWS:

1. **AWS Elastic Beanstalk** (Recommended for simplicity)
2. **AWS CloudFormation** (Recommended for production environments)
3. **Manual Docker Deployment** (For advanced users)

## Option 1: Deploy with AWS Elastic Beanstalk (One-Click)

### Step 1: Initialize the EB CLI (First-time setup)

```bash
# Install the EB CLI
pip install awsebcli

# Initialize EB CLI in your project directory
eb init

# Select your region
# Choose an application name (e.g., ipcr-ewers)
# Select Node.js platform
# Choose to create keypair for SSH (recommended)
```

### Step 2: Create and deploy the application

```bash
# Create an environment and deploy your application
eb create ipcr-ewers-production

# The deployment will take 5-10 minutes. When complete, you'll see a URL
# where your application is running.
```

### Step 3: Configure environment variables

```bash
# Open the AWS Elastic Beanstalk Console
# Navigate to your environment
# Go to Configuration > Software
# Add the following environment variables:
# - NODE_ENV=production
# - DATABASE_URL=your_postgres_connection_string
# - SESSION_SECRET=your_session_secret
```

### Step 4: Set up the Database

1. Go to AWS RDS Console
2. Create a new PostgreSQL database
3. Configure security group to allow traffic from your EB environment
4. Update the DATABASE_URL environment variable with the new connection details

## Option 2: Deploy with AWS CloudFormation

AWS CloudFormation allows you to deploy the complete infrastructure including:
- VPC with public and private subnets
- Application servers in an Auto Scaling Group
- Application Load Balancer
- PostgreSQL database
- Security Groups

### Step 1: Run the deployment script

```bash
# Make the script executable
chmod +x deploy.sh

# Run the script
./deploy.sh
```

### Step 2: Follow the on-screen instructions

1. Choose the environment (dev, staging, or production)
2. The script will deploy all necessary infrastructure
3. At the end, you'll receive the URL of your load balancer

## Option 3: Manual Docker Deployment

If you prefer to have more control over the deployment process, you can:

### Step 1: Build the Docker image

```bash
docker build -t ipcr-ewers .
```

### Step 2: Push to Amazon ECR

```bash
# Create a repository
aws ecr create-repository --repository-name ipcr-ewers

# Authenticate Docker to your ECR registry
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com

# Tag your image
docker tag ipcr-ewers:latest your-account-id.dkr.ecr.your-region.amazonaws.com/ipcr-ewers:latest

# Push the image
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/ipcr-ewers:latest
```

### Step 3: Deploy to ECS or EKS

Follow the AWS documentation for deploying Docker containers to:
- [Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/getting-started.html)
- [Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

## Application Configuration

After deployment, you need to configure the following services:

### 1. Database Migration

```bash
# Connect to one of your application instances (via SSH or AWS Systems Manager)
cd /var/app/current
npm run db:push
```

### 2. Social Media Integration

For each social media platform (Twitter/X, Facebook, Instagram), you need to:
1. Create developer accounts and apps on each platform
2. Generate API keys/tokens
3. Configure them as environment variables:

```
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret

FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_access_token

INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password
```

### 3. SMS Integration (Twilio)

1. Create a Twilio account
2. Obtain your account SID, auth token, and phone number
3. Configure them as environment variables:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

## Monitoring and Maintenance

Once deployed, you can:

1. **Monitor Logs**:
   - Elastic Beanstalk: `eb logs`
   - CloudFormation: Check CloudWatch Logs

2. **Update the Application**:
   - Elastic Beanstalk: `eb deploy`
   - CloudFormation: `./deploy.sh` and select update option

3. **Set Up Alarms**:
   - Configure CloudWatch alarms for key metrics
   - Set up SNS notifications for critical events

## Troubleshooting

Common issues and their solutions:

### Database Connection Issues

If the application can't connect to the database:
1. Check security group rules
2. Verify the DATABASE_URL environment variable
3. Check database credentials

### Application Not Starting

If the application fails to start:
1. Check the application logs: `eb logs`
2. Verify all required environment variables are set
3. Check for build errors in the deployment logs

### Social Media Integration Issues

If social media integration is not working:
1. Verify API keys and tokens
2. Check integration logs
3. Ensure proper permissions are configured in the social media developer portals

## Support

For assistance with deployment issues, contact:
- IPCR IT Support Team: support@ipcr.gov.ng
- Project Developer: afrinict.com