# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js first."
    Write-Host "Visit https://nodejs.org/ for installation instructions."
    exit 1
}

# Check if npm is installed
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is not installed. Please install npm first."
    exit 1
}

# Create .env files from templates if they don't exist
$services = @("server", "client")
foreach ($service in $services) {
    if (!(Test-Path "$service/.env") -and (Test-Path "$service/.env.example")) {
        Copy-Item "$service/.env.example" "$service/.env"
        Write-Host "Created $service/.env from template"
    }
}

# Install dependencies for all services
Write-Host "Installing dependencies..."

# Root dependencies
npm install

# Server dependencies
Set-Location server
npm install
Set-Location ..

# Client dependencies
Set-Location client
npm install
Set-Location ..

Write-Host "Development environment setup complete!"
Write-Host "Please review and update the .env files with your specific configuration values." 