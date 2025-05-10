#!/bin/bash

# Exit on error
set -e

# Check for required environment variables
required_vars=(
    "GITHUB_TOKEN"
    "GITHUB_REPOSITORY"
    "DOMAIN_NAME"
    "CLOUDFLARE_API_TOKEN"
    "CLOUDFLARE_ZONE_ID"
    "MONGODB_URI"
    "POSTGRES_URI"
    "JWT_SECRET"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "INGRESS_IP"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set"
        exit 1
    fi
done

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
        exit 1
    fi
}

echo "🚀 Starting GitHub environments and secrets setup..."

# Create staging environment
echo "📦 Creating staging environment..."
curl -s -X PUT "https://api.github.com/repos/$GITHUB_REPOSITORY/environments/staging" \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    --data "{
        \"wait_timer\": 0,
        \"reviewers\": [],
        \"deployment_branch_policy\": {
            \"protected_branches\": false,
            \"custom_branches\": [\"develop\"]
        }
    }"
check_status "Created staging environment"

# Create production environment
echo "📦 Creating production environment..."
curl -s -X PUT "https://api.github.com/repos/$GITHUB_REPOSITORY/environments/production" \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    --data "{
        \"wait_timer\": 30,
        \"reviewers\": [],
        \"deployment_branch_policy\": {
            \"protected_branches\": true,
            \"custom_branches\": []
        }
    }"
check_status "Created production environment"

# Function to create or update secret
create_or_update_secret() {
    local env=$1
    local name=$2
    local value=$3

    echo "🔐 Setting $name for $env environment..."
    
    # Get public key
    local public_key=$(curl -s -X GET "https://api.github.com/repos/$GITHUB_REPOSITORY/environments/$env/secrets/public-key" \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" | jq -r '.key')
    
    # Get key ID
    local key_id=$(curl -s -X GET "https://api.github.com/repos/$GITHUB_REPOSITORY/environments/$env/secrets/public-key" \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" | jq -r '.key_id')
    
    # Encrypt value
    local encrypted_value=$(echo -n "$value" | openssl base64 -A | openssl enc -aes-256-cbc -a -A -K "$public_key" -iv "$key_id")
    
    # Create or update secret
    curl -s -X PUT "https://api.github.com/repos/$GITHUB_REPOSITORY/environments/$env/secrets/$name" \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        --data "{
            \"encrypted_value\": \"$encrypted_value\",
            \"key_id\": \"$key_id\"
        }"
    check_status "Set $name for $env environment"
}

# Set secrets for staging environment
echo "🔐 Setting secrets for staging environment..."
create_or_update_secret "staging" "DOMAIN_NAME" "$DOMAIN_NAME"
create_or_update_secret "staging" "CLOUDFLARE_API_TOKEN" "$CLOUDFLARE_API_TOKEN"
create_or_update_secret "staging" "CLOUDFLARE_ZONE_ID" "$CLOUDFLARE_ZONE_ID"
create_or_update_secret "staging" "MONGODB_URI" "$MONGODB_URI"
create_or_update_secret "staging" "POSTGRES_URI" "$POSTGRES_URI"
create_or_update_secret "staging" "JWT_SECRET" "$JWT_SECRET"
create_or_update_secret "staging" "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID"
create_or_update_secret "staging" "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY"
create_or_update_secret "staging" "INGRESS_IP" "$INGRESS_IP"

# Set secrets for production environment
echo "🔐 Setting secrets for production environment..."
create_or_update_secret "production" "DOMAIN_NAME" "$DOMAIN_NAME"
create_or_update_secret "production" "CLOUDFLARE_API_TOKEN" "$CLOUDFLARE_API_TOKEN"
create_or_update_secret "production" "CLOUDFLARE_ZONE_ID" "$CLOUDFLARE_ZONE_ID"
create_or_update_secret "production" "MONGODB_URI" "$MONGODB_URI"
create_or_update_secret "production" "POSTGRES_URI" "$POSTGRES_URI"
create_or_update_secret "production" "JWT_SECRET" "$JWT_SECRET"
create_or_update_secret "production" "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID"
create_or_update_secret "production" "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY"
create_or_update_secret "production" "INGRESS_IP" "$INGRESS_IP"

echo "✨ GitHub environments and secrets setup completed successfully!" 