#!/bin/bash

# Exit on error
set -e

echo "Building Docker images for SharedVoices microservices..."

# Build the content service
echo "Building content-service..."
docker-compose build content-service

# Build the user service
echo "Building user-service..."
docker-compose build user-service

# Build the notification service
echo "Building notification-service..."
docker-compose build notification-service

# Build the interaction service
echo "Building interaction-service..."
docker-compose build interaction-service

echo "All services built successfully!"
echo "You can now run 'docker-compose up' to start the services."
