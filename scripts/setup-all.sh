#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${YELLOW}=== $1 ===${NC}\n"
}

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

# Check if required tools are installed
echo "🔍 Checking required tools..."
command -v curl >/dev/null 2>&1 || { echo -e "${RED}❌ curl is required but not installed.${NC}"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${RED}❌ jq is required but not installed.${NC}"; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo -e "${RED}❌ openssl is required but not installed.${NC}"; exit 1; }
check_status "Required tools are installed"

# Check for required environment variables
print_header "Checking Environment Variables"
required_vars=(
    "GITHUB_TOKEN"
    "GITHUB_REPOSITORY"
    "DOMAIN_NAME"
    "CLOUDFLARE_API_TOKEN"
    "CLOUDFLARE_EMAIL"
    "MONGODB_URI"
    "POSTGRES_URI"
    "JWT_SECRET"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "INGRESS_IP"
)

missing_vars=0
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ $var is not set${NC}"
        missing_vars=1
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done

if [ $missing_vars -eq 1 ]; then
    echo -e "\n${RED}Please set all required environment variables before running this script.${NC}"
    exit 1
fi

# Run domain setup
print_header "Setting up Domain and Cloudflare"
bash scripts/setup-domain.sh
check_status "Domain and Cloudflare setup completed"

# Run GitHub setup
print_header "Setting up GitHub Environments and Secrets"
bash scripts/setup-github.sh
check_status "GitHub setup completed"

# Update credentials tracker
print_header "Updating Credentials Tracker"
current_date=$(date +%Y-%m-%d)
sed -i "s/Last Updated: .*/Last Updated: $current_date/" docs/credentials-tracker.md
check_status "Credentials tracker updated"

echo -e "\n${GREEN}✨ All setup tasks completed successfully!${NC}"
echo -e "\nNext steps:"
echo "1. Verify your domain DNS settings in Cloudflare"
echo "2. Check GitHub environments and secrets"
echo "3. Review the credentials tracker for accuracy"
echo "4. Begin implementing backend services" 