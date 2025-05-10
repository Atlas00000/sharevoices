# Script to clean up Docker resources

Write-Host "Stopping all containers..."
docker-compose down

Write-Host "Removing all volumes..."
docker-compose down -v

Write-Host "Removing all images..."
docker-compose down --rmi all

Write-Host "Cleanup complete."
