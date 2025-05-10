# Master PowerShell script for complete setup process

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

# Function to print section headers
function Write-Header($message) {
    Write-ColorOutput Yellow "`n=== $message ==="
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

# Check for required tools
Write-Header "Checking Required Tools"

$requiredTools = @("curl", "jq", "openssl")
foreach ($tool in $requiredTools) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-ColorOutput Red "Error: $tool is not installed"
        exit 1
    }
    Write-ColorOutput Green "✅ $tool is installed"
}

# Check required environment variables
Write-Header "Checking Environment Variables"

$requiredVars = @(
    "GITHUB_TOKEN",
    "GITHUB_REPOSITORY",
    "DOMAIN_NAME",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_EMAIL",
    "MONGODB_URI",
    "POSTGRES_URI",
    "JWT_SECRET",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "INGRESS_IP"
)

$missingVars = @()
foreach ($var in $requiredVars) {
    if (-not (Get-Item env:$var -ErrorAction SilentlyContinue)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-ColorOutput Red "Error: The following environment variables are not set:"
    foreach ($var in $missingVars) {
        Write-ColorOutput Red "  - $var"
    }
    Write-ColorOutput Yellow "`nPlease set these variables before running the script again."
    exit 1
}

Write-ColorOutput Green "✅ All required environment variables are set"

# Set default domain name if not provided
if (-not $env:DOMAIN_NAME) {
    $env:DOMAIN_NAME = "sharedvoices.dev"
    Write-ColorOutput Yellow "Using default domain name: $env:DOMAIN_NAME"
}

# Run domain setup
Write-Header "Setting Up Domain and Cloudflare"
& "$PSScriptRoot\setup-domain.ps1"
Test-CommandStatus "Domain and Cloudflare setup completed"

# Run GitHub setup
Write-Header "Setting Up GitHub Environments and Secrets"
& "$PSScriptRoot\setup-github.ps1"
Test-CommandStatus "GitHub setup completed"

# Update credentials tracker
Write-Header "Updating Credentials Tracker"
$date = Get-Date -Format "yyyy-MM-dd"
$content = Get-Content "docs/credentials-tracker.md" -Raw
$content = $content -replace "Last Updated: \d{4}-\d{2}-\d{2}", "Last Updated: $date"
$content | Set-Content "docs/credentials-tracker.md"
Test-CommandStatus "Credentials tracker updated"

Write-ColorOutput Green "`n✨ All setup tasks completed successfully!"
Write-Output "`nNext steps:"
Write-Output "1. Verify your domain DNS settings in Cloudflare"
Write-Output "2. Check GitHub environments and secrets"
Write-Output "3. Review the credentials tracker"
Write-Output "4. Begin implementing backend services" 