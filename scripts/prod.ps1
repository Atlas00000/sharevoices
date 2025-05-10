# Production script to start the entire stack in production mode

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "Error: .env file not found. Please create one based on .env.example."
    exit 1
}

# Start the production stack
Write-Host "Starting production stack..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Display logs
Write-Host "Displaying logs (Ctrl+C to exit)..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
