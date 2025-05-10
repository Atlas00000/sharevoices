# Development script to start the entire stack in development mode

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from .env.example..."
    Copy-Item .env.example .env
}

# Start the development stack
Write-Host "Starting development stack..."
docker-compose up -d

# Display logs
Write-Host "Displaying logs (Ctrl+C to exit)..."
docker-compose logs -f
