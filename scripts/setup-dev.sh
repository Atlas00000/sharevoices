#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    echo "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Create .env files from templates if they don't exist
for service in server client; do
    if [ ! -f "$service/.env" ] && [ -f "$service/.env.example" ]; then
        cp "$service/.env.example" "$service/.env"
        echo "Created $service/.env from template"
    fi
done

# Install dependencies for all services
echo "Installing dependencies..."

# Root dependencies
npm install

# Server dependencies
cd server && npm install && cd ..

# Client dependencies
cd client && npm install && cd ..

echo "Development environment setup complete!"
echo "Please review and update the .env files with your specific configuration values." 