#!/bin/bash

# Exit on error
set -e

# Check for required environment variables
required_vars=(
    "CLOUDFLARE_API_TOKEN"
    "CLOUDFLARE_EMAIL"
    "DOMAIN_NAME"
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

echo "🚀 Starting domain and Cloudflare setup..."

# Get Cloudflare Zone ID
echo "📡 Fetching Cloudflare Zone ID..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN_NAME" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" | jq -r '.result[0].id')

if [ -z "$ZONE_ID" ] || [ "$ZONE_ID" = "null" ]; then
    echo "❌ Failed to get Zone ID. Please check your domain and API token."
    exit 1
fi

echo "✅ Got Zone ID: $ZONE_ID"

# Create DNS records
echo "📝 Creating DNS records..."

# A record for root domain
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"type\": \"A\",
        \"name\": \"$DOMAIN_NAME\",
        \"content\": \"$INGRESS_IP\",
        \"proxied\": true
    }"
check_status "Created A record for root domain"

# A record for www subdomain
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"type\": \"A\",
        \"name\": \"www.$DOMAIN_NAME\",
        \"content\": \"$INGRESS_IP\",
        \"proxied\": true
    }"
check_status "Created A record for www subdomain"

# CNAME record for api subdomain
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"type\": \"CNAME\",
        \"name\": \"api.$DOMAIN_NAME\",
        \"content\": \"$DOMAIN_NAME\",
        \"proxied\": true
    }"
check_status "Created CNAME record for api subdomain"

# Enable SSL/TLS
echo "🔒 Enabling SSL/TLS..."
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"value\": \"full\"
    }"
check_status "Enabled SSL/TLS"

# Enable Always Use HTTPS
echo "🔒 Enabling Always Use HTTPS..."
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_use_https" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"value\": \"on\"
    }"
check_status "Enabled Always Use HTTPS"

# Enable Auto Minify
echo "📦 Enabling Auto Minify..."
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/minify" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"value\": {
            \"css\": \"on\",
            \"html\": \"on\",
            \"js\": \"on\"
        }
    }"
check_status "Enabled Auto Minify"

# Enable Brotli
echo "📦 Enabling Brotli..."
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/brotli" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"value\": \"on\"
    }"
check_status "Enabled Brotli"

echo "✨ Domain and Cloudflare setup completed successfully!"
echo "📝 Please update your credentials-tracker.md with the following information:"
echo "   - Cloudflare Zone ID: $ZONE_ID"
echo "   - SSL Certificate: Enabled (Full)" 