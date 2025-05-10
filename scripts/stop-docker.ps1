# Stop all containers
Write-Host "Stopping all containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "`nAll services have been stopped." -ForegroundColor Green
Write-Host "To remove volumes as well, run: docker-compose down -v" -ForegroundColor Yellow 