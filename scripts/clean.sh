#!/bin/bash
# Script to clean up Docker resources

echo "Stopping all containers..."
docker-compose down

echo "Removing all volumes..."
docker-compose down -v

echo "Removing all images..."
docker-compose down --rmi all

echo "Cleanup complete."
