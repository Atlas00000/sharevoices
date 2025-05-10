# Stop any running containers
Write-Host "Stopping any running containers..." -ForegroundColor Yellow
docker-compose down

# Remove any existing volumes (optional, uncomment if needed)
# Write-Host "Removing existing volumes..." -ForegroundColor Yellow
# docker-compose down -v

# Build and start the containers
Write-Host "Building and starting containers..." -ForegroundColor Green
docker-compose up --build -d

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Show container status
Write-Host "`nContainer Status:" -ForegroundColor Green
docker-compose ps

Write-Host "`nServices are available at:" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000"
Write-Host "Content Service: http://localhost:3002"
Write-Host "User Service: http://localhost:3001"
Write-Host "MongoDB: mongodb://localhost:27017"
Write-Host "PostgreSQL: postgresql://localhost:5432"
Write-Host "Redis: redis://localhost:6379"

Write-Host "`nTo view logs, run: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop services, run: docker-compose down" -ForegroundColor Yellow 