# PowerShell script for domain and Cloudflare setup

# Function to print colored output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Function to check command status
function Test-CommandStatus($message) {
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "✅ $message"
    }
    else {
        Write-ColorOutput Red "❌ $message"
        exit 1
    }
}

# Check required environment variables
$requiredVars = @(
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_EMAIL",
    "DOMAIN_NAME"
)

foreach ($var in $requiredVars) {
    if (-not (Get-Item env:$var -ErrorAction SilentlyContinue)) {
        Write-ColorOutput Red "Error: $var is not set"
        exit 1
    }
}

Write-ColorOutput Yellow "🚀 Starting domain and Cloudflare setup..."

# Get Cloudflare Zone ID
Write-ColorOutput Yellow "📡 Fetching Cloudflare Zone ID..."
$zoneResponse = curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$env:DOMAIN_NAME" `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -H "Content-Type: application/json"

$zoneId = ($zoneResponse | ConvertFrom-Json).result[0].id

if (-not $zoneId) {
    Write-ColorOutput Red "❌ Failed to get Zone ID. Please check your domain and API token."
    exit 1
}

Write-ColorOutput Green "✅ Got Zone ID: $zoneId"

# Create DNS records
Write-ColorOutput Yellow "📝 Creating DNS records..."

# A record for root domain
$rootDomainResponse = curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -H "Content-Type: application/json" `
    --data "{
        `"type`": `"A`",
        `"name`": `"$env:DOMAIN_NAME`",
        `"content`": `"$env:INGRESS_IP`",
        `"proxied`": true
    }"
Test-CommandStatus "Created A record for root domain"

# A record for www subdomain
$wwwDomainResponse = curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -H "Content-Type: application/json" `
    --data "{
        `"type`": `"A`",
        `"name`": `"www.$env:DOMAIN_NAME`",
        `"content`": `"$env:INGRESS_IP`",
        `"proxied`": true
    }"
Test-CommandStatus "Created A record for www subdomain"

# CNAME record for api subdomain
$apiDomainResponse = curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -H "Content-Type: application/json" `
    --data "{
        `"type`": `"CNAME`",
        `"name`": `"api.$env:DOMAIN_NAME`",
        `"content`": `"$env:DOMAIN_NAME`",
        `"proxied`": true
    }"
Test-CommandStatus "Created CNAME record for api subdomain"

# Enable SSL/TLS
Write-ColorOutput Yellow "🔒 Enabling SSL/TLS..."
$sslResponse = curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zoneId/settings/ssl" `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -H "Content-Type: application/json" `
    --data "{
        `"value`": `"full`"
    }"
Test-CommandStatus "Enabled SSL/TLS"

# Enable Always Use HTTPS
Write-ColorOutput Yellow "🔒 Enabling Always Use HTTPS..."
$httpsResponse = curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zoneId/settings/always_use_https" `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -H "Content-Type: application/json" `
    --data "{
        `"value`": `"on`"
    }"
Test-CommandStatus "Enabled Always Use HTTPS"

# Enable Auto Minify
Write-ColorOutput Yellow "📦 Enabling Auto Minify..."
$minifyResponse = curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zoneId/settings/minify" `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -H "Content-Type: application/json" `
    --data "{
        `"value`": {
            `"css`": `"on`",
            `"html`": `"on`",
            `"js`": `"on`"
        }
    }"
Test-CommandStatus "Enabled Auto Minify"

# Enable Brotli
Write-ColorOutput Yellow "📦 Enabling Brotli..."
$brotliResponse = curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$zoneId/settings/brotli" `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -H "Content-Type: application/json" `
    --data "{
        `"value`": `"on`"
    }"
Test-CommandStatus "Enabled Brotli"

Write-ColorOutput Green "✨ Domain and Cloudflare setup completed successfully!"
Write-Output "📝 Please update your credentials-tracker.md with the following information:"
Write-Output "   - Cloudflare Zone ID: $zoneId"
Write-Output "   - SSL Certificate: Enabled (Full)" 