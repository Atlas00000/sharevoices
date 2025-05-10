# PowerShell script for GitHub environment and secrets setup

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
    "GITHUB_TOKEN",
    "GITHUB_REPOSITORY",
    "DOMAIN_NAME",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ZONE_ID",
    "MONGODB_URI",
    "POSTGRES_URI",
    "JWT_SECRET",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "INGRESS_IP"
)

foreach ($var in $requiredVars) {
    if (-not (Get-Item env:$var -ErrorAction SilentlyContinue)) {
        Write-ColorOutput Red "Error: $var is not set"
        exit 1
    }
}

Write-ColorOutput Yellow "🚀 Starting GitHub environment and secrets setup..."

# Function to create or update a secret
function Set-GitHubSecret {
    param (
        [string]$Environment,
        [string]$SecretName,
        [string]$SecretValue
    )

    Write-ColorOutput Yellow "🔐 Setting secret $SecretName for $Environment environment..."

    # Get public key
    $keyResponse = curl -s -X GET "https://api.github.com/repos/$env:GITHUB_REPOSITORY/actions/secrets/public-key" `
        -H "Authorization: token $env:GITHUB_TOKEN" `
        -H "Accept: application/vnd.github.v3+json"

    $keyData = $keyResponse | ConvertFrom-Json
    $publicKey = $keyData.key
    $keyId = $keyData.key_id

    # Encrypt the secret
    $encryptedValue = [Convert]::ToBase64String(
        [System.Security.Cryptography.RSA]::Create().Encrypt(
            [System.Text.Encoding]::UTF8.GetBytes($SecretValue),
            [System.Security.Cryptography.RSAEncryptionPadding]::OaepSHA256
        )
    )

    # Create or update the secret
    $secretResponse = curl -s -X PUT "https://api.github.com/repos/$env:GITHUB_REPOSITORY/environments/$Environment/secrets/$SecretName" `
        -H "Authorization: token $env:GITHUB_TOKEN" `
        -H "Accept: application/vnd.github.v3+json" `
        --data "{
            `"encrypted_value`": `"$encryptedValue`",
            `"key_id`": `"$keyId`"
        }"

    Test-CommandStatus "Set secret $SecretName for $Environment environment"
}

# Create staging environment
Write-ColorOutput Yellow "🌱 Creating staging environment..."
$stagingResponse = curl -s -X PUT "https://api.github.com/repos/$env:GITHUB_REPOSITORY/environments/staging" `
    -H "Authorization: token $env:GITHUB_TOKEN" `
    -H "Accept: application/vnd.github.v3+json" `
    --data "{
        `"wait_timer`": 0,
        `"deployment_branch_policy`": {
            `"protected_branches`": false,
            `"custom_branches`": true
        }
    }"
Test-CommandStatus "Created staging environment"

# Create production environment
Write-ColorOutput Yellow "🚀 Creating production environment..."
$productionResponse = curl -s -X PUT "https://api.github.com/repos/$env:GITHUB_REPOSITORY/environments/production" `
    -H "Authorization: token $env:GITHUB_TOKEN" `
    -H "Accept: application/vnd.github.v3+json" `
    --data "{
        `"wait_timer`": 30,
        `"deployment_branch_policy`": {
            `"protected_branches`": true,
            `"custom_branches`": false
        }
    }"
Test-CommandStatus "Created production environment"

# Set secrets for staging environment
$stagingSecrets = @{
    "DOMAIN_NAME" = $env:DOMAIN_NAME
    "CLOUDFLARE_API_TOKEN" = $env:CLOUDFLARE_API_TOKEN
    "CLOUDFLARE_ZONE_ID" = $env:CLOUDFLARE_ZONE_ID
    "MONGODB_URI" = $env:MONGODB_URI
    "POSTGRES_URI" = $env:POSTGRES_URI
    "JWT_SECRET" = $env:JWT_SECRET
    "AWS_ACCESS_KEY_ID" = $env:AWS_ACCESS_KEY_ID
    "AWS_SECRET_ACCESS_KEY" = $env:AWS_SECRET_ACCESS_KEY
    "INGRESS_IP" = $env:INGRESS_IP
}

foreach ($secret in $stagingSecrets.GetEnumerator()) {
    Set-GitHubSecret -Environment "staging" -SecretName $secret.Key -SecretValue $secret.Value
}

# Set secrets for production environment
$productionSecrets = @{
    "DOMAIN_NAME" = $env:DOMAIN_NAME
    "CLOUDFLARE_API_TOKEN" = $env:CLOUDFLARE_API_TOKEN
    "CLOUDFLARE_ZONE_ID" = $env:CLOUDFLARE_ZONE_ID
    "MONGODB_URI" = $env:MONGODB_URI
    "POSTGRES_URI" = $env:POSTGRES_URI
    "JWT_SECRET" = $env:JWT_SECRET
    "AWS_ACCESS_KEY_ID" = $env:AWS_ACCESS_KEY_ID
    "AWS_SECRET_ACCESS_KEY" = $env:AWS_SECRET_ACCESS_KEY
    "INGRESS_IP" = $env:INGRESS_IP
}

foreach ($secret in $productionSecrets.GetEnumerator()) {
    Set-GitHubSecret -Environment "production" -SecretName $secret.Key -SecretValue $secret.Value
}

Write-ColorOutput Green "✨ GitHub environment and secrets setup completed successfully!" 