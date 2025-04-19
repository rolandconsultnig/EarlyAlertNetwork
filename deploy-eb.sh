#!/bin/bash

# IPCR Early Warning & Early Response System
# AWS Elastic Beanstalk One-Click Deployment Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}     IPCR Early Warning & Early Response System    ${NC}"
echo -e "${BLUE}         One-Click AWS Deployment Tool            ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo -e "${RED}Error: Elastic Beanstalk CLI is not installed.${NC}"
    echo "Installing EB CLI..."
    pip install awsebcli
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install EB CLI. Please install it manually.${NC}"
        echo "Visit: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html"
        exit 1
    fi
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Deployment function
deploy_environment() {
    local env_name=$1
    local instance_type=$2
    local env_type=$3
    
    echo -e "${YELLOW}Starting deployment for: ${env_name}${NC}"
    
    # Initialize EB if not already initialized
    if [ ! -d .elasticbeanstalk ]; then
        echo -e "${BLUE}Initializing Elastic Beanstalk...${NC}"
        eb init --platform "node.js-16" --region "$(aws configure get region)" ipcr-ewers
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to initialize Elastic Beanstalk.${NC}"
            exit 1
        fi
    fi
    
    # Create environment if it doesn't exist or update if it does
    if eb status "$env_name" &> /dev/null; then
        echo -e "${BLUE}Environment ${env_name} exists. Updating...${NC}"
        eb deploy "$env_name"
    else
        echo -e "${BLUE}Creating new environment: ${env_name}${NC}"
        
        eb create "$env_name" \
          --instance-type "$instance_type" \
          --single \
          --cname "$env_name" \
          --tags "Environment=$env_type,Project=IPCR-EWERS"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Deployment successful!${NC}"
        echo -e "${BLUE}Your application is now live at:${NC}"
        eb status "$env_name" | grep CNAME
    else
        echo -e "${RED}Deployment failed.${NC}"
        exit 1
    fi
}

# Show the menu
show_menu() {
    echo -e "\n${BLUE}Choose an environment to deploy:${NC}"
    echo "1) Development (t2.micro)"
    echo "2) Staging (t2.small)"
    echo "3) Production (t2.medium)"
    echo "4) View status of an environment"
    echo "5) Exit"
    echo -n "Enter your choice [1-5]: "
}

# Main loop
while true; do
    show_menu
    read choice
    
    case $choice in
        1)
            deploy_environment "ipcr-ewers-dev" "t2.micro" "development"
            ;;
        2)
            deploy_environment "ipcr-ewers-staging" "t2.small" "staging"
            ;;
        3)
            echo -e "${YELLOW}Warning: You are about to deploy to PRODUCTION.${NC}"
            echo -n "Are you sure? (y/n): "
            read confirm
            if [ "$confirm" = "y" ]; then
                deploy_environment "ipcr-ewers-production" "t2.medium" "production"
            else
                echo -e "${BLUE}Operation cancelled.${NC}"
            fi
            ;;
        4)
            echo -e "\n${BLUE}Available environments:${NC}"
            eb list
            echo -n "Enter environment name to check status: "
            read env_name
            eb status "$env_name"
            ;;
        5)
            echo -e "${GREEN}Exiting deployment tool.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
done