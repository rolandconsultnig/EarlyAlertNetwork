#!/bin/bash

# IPCR Early Warning & Early Response System
# AWS Deployment Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}     IPCR Early Warning & Early Response System    ${NC}"
echo -e "${BLUE}           AWS Deployment Tool                    ${NC}"
echo -e "${BLUE}==================================================${NC}"

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

# Functions
function deploy_stack() {
    local env=$1
    local instance_type=$2
    local db_instance=$3
    
    echo -e "${YELLOW}Deploying CloudFormation stack for environment: ${env}${NC}"
    
    # Create or update the stack
    aws cloudformation deploy \
        --template-file aws-deploy.yml \
        --stack-name "ipcr-ewers-${env}" \
        --parameter-overrides \
            EnvironmentName="${env}" \
            InstanceType="${instance_type}" \
            DBInstanceClass="${db_instance}" \
        --capabilities CAPABILITY_IAM
        
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Stack deployment successful!${NC}"
    else
        echo -e "${RED}Stack deployment failed.${NC}"
        exit 1
    fi
    
    # Get stack outputs
    echo -e "${BLUE}Deployment information:${NC}"
    aws cloudformation describe-stacks \
        --stack-name "ipcr-ewers-${env}" \
        --query "Stacks[0].Outputs"
}

function delete_stack() {
    local env=$1
    
    echo -e "${YELLOW}Deleting CloudFormation stack for environment: ${env}${NC}"
    
    aws cloudformation delete-stack --stack-name "ipcr-ewers-${env}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Stack deletion initiated. This process may take several minutes.${NC}"
    else
        echo -e "${RED}Stack deletion failed.${NC}"
        exit 1
    fi
}

function check_status() {
    local env=$1
    
    echo -e "${YELLOW}Checking status of stack: ipcr-ewers-${env}${NC}"
    
    aws cloudformation describe-stacks \
        --stack-name "ipcr-ewers-${env}" \
        --query "Stacks[0].[StackStatus, StackStatusReason]"
}

# Show the menu
show_menu() {
    echo -e "\n${BLUE}Choose an operation:${NC}"
    echo "1) Deploy to DEV environment"
    echo "2) Deploy to STAGING environment"
    echo "3) Deploy to PRODUCTION environment"
    echo "4) Delete DEV environment"
    echo "5) Delete STAGING environment"
    echo "6) Delete PRODUCTION environment"
    echo "7) Check deployment status"
    echo "8) Exit"
    echo -n "Enter your choice [1-8]: "
}

# Main loop
while true; do
    show_menu
    read choice
    
    case $choice in
        1)
            deploy_stack "dev" "t2.small" "db.t3.small"
            ;;
        2)
            deploy_stack "staging" "t2.medium" "db.t3.medium"
            ;;
        3)
            echo -e "${YELLOW}Warning: You are about to deploy to PRODUCTION.${NC}"
            echo -n "Are you sure? (y/n): "
            read confirm
            if [ "$confirm" = "y" ]; then
                deploy_stack "prod" "t3.medium" "db.r5.large"
            else
                echo -e "${BLUE}Operation cancelled.${NC}"
            fi
            ;;
        4)
            delete_stack "dev"
            ;;
        5)
            delete_stack "staging"
            ;;
        6)
            echo -e "${RED}Warning: You are about to DELETE the PRODUCTION environment.${NC}"
            echo -n "Are you sure? This action cannot be undone. Type 'CONFIRM' to proceed: "
            read confirm
            if [ "$confirm" = "CONFIRM" ]; then
                delete_stack "prod"
            else
                echo -e "${BLUE}Operation cancelled.${NC}"
            fi
            ;;
        7)
            echo -e "\n${BLUE}Select environment to check:${NC}"
            echo "1) DEV"
            echo "2) STAGING"
            echo "3) PRODUCTION"
            echo -n "Enter your choice [1-3]: "
            read env_choice
            
            case $env_choice in
                1) check_status "dev" ;;
                2) check_status "staging" ;;
                3) check_status "prod" ;;
                *) echo -e "${RED}Invalid choice.${NC}" ;;
            esac
            ;;
        8)
            echo -e "${GREEN}Exiting deployment tool.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
done