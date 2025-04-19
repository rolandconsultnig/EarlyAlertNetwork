# Deployment Guide for IPCR Early Warning & Response System

This guide provides step-by-step instructions for deploying the IPCR Early Warning & Response System to different environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [AWS Deployment Options](#aws-deployment-options)
   - [Option 1: Elastic Beanstalk Deployment (Recommended)](#option-1-elastic-beanstalk-deployment-recommended)
   - [Option 2: AWS CloudFormation Deployment](#option-2-aws-cloudformation-deployment)
   - [Option 3: Manual Deployment](#option-3-manual-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or newer)
- npm (comes with Node.js)
- Git
- AWS CLI (for AWS deployments) - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Docker (optional, for containerized deployments) - [Installation Guide](https://docs.docker.com/get-docker/)

## Environment Variables

The application requires the following environment variables:

### Required Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `SESSION_SECRET`: Secret key for session encryption
- `NODE_ENV`: Environment name (development, staging, production)

### Optional External Service Integration

For social media and SMS integration (if used):

- Twitter/X: `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
- Facebook: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_ACCESS_TOKEN`
- Instagram: `INSTAGRAM_USERNAME`, `INSTAGRAM_PASSWORD`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

## AWS Deployment Options

### Option 1: Elastic Beanstalk Deployment (Recommended)

The easiest way to deploy the application is using AWS Elastic Beanstalk with our automated script.

1. Make the deployment script executable:
   ```bash
   chmod +x deploy-eb.sh
   ```

2. Run the deployment script:
   ```bash
   ./deploy-eb.sh
   ```

3. Follow the on-screen prompts to select your deployment environment (development, staging, or production).

4. The script will:
   - Build and package the application
   - Create or update the Elastic Beanstalk application and environment
   - Deploy the latest version
   - Configure environment variables

5. After deployment completes, you can access your application at the Elastic Beanstalk URL provided in the output.

### Option 2: AWS CloudFormation Deployment

For a more infrastructure-as-code approach, you can use AWS CloudFormation:

1. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the CloudFormation deployment script:
   ```bash
   ./deploy.sh
   ```

3. Follow the prompts to enter stack name and parameters.

4. The CloudFormation template will provision:
   - VPC and networking components
   - Application Load Balancer
   - EC2 instances with auto-scaling
   - RDS PostgreSQL database
   - S3 bucket for application assets
   - CloudWatch alarms and logs
   - IAM roles and security groups

### Option 3: Manual Deployment

For manual deployment to an EC2 instance:

1. Connect to your EC2 instance via SSH.

2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ipcr-ewers.git
   cd ipcr-ewers
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the application:
   ```bash
   npm run build
   ```

5. Create a `.env` file with your environment variables.

6. Install PM2 for process management:
   ```bash
   npm install -g pm2
   ```

7. Start the application:
   ```bash
   pm2 start npm --name "ipcr-app" -- start
   ```

8. Configure PM2 to start on system boot:
   ```bash
   pm2 startup
   pm2 save
   ```

## Docker Deployment

For containerized deployment:

1. Build the Docker image:
   ```bash
   docker build -t ipcr-ewers:latest .
   ```

2. Run the container:
   ```bash
   docker run -d -p 5000:5000 \
     -e DATABASE_URL=your_database_url \
     -e SESSION_SECRET=your_session_secret \
     -e NODE_ENV=production \
     --name ipcr-ewers ipcr-ewers:latest
   ```

Alternatively, use Docker Compose:

```bash
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:

1. Verify that the `DATABASE_URL` environment variable is correctly set.
2. Ensure that the database server is accessible from your deployment environment.
3. Check that the database user has the correct permissions.

### Application Not Starting

If the application fails to start:

1. Check the application logs:
   ```bash
   # For Elastic Beanstalk
   aws elasticbeanstalk retrieve-environment-info --environment-name <env-name>
   
   # For EC2/Docker
   docker logs ipcr-ewers
   # or
   pm2 logs ipcr-app
   ```

2. Verify that all required environment variables are set.

3. Ensure that the Node.js version is compatible (v16+).

### External Service Integration

If external services (Twitter, Facebook, Instagram, Twilio) are not working:

1. Verify that all required API keys and credentials are correctly set as environment variables.
2. Check that the API keys have the necessary permissions and are not expired.
3. Test the API connections individually using the API test endpoints.

For additional help, please contact the development team at support@afrinict.com.