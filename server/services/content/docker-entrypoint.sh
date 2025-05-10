#!/bin/sh
set -e

# Wait for database to be ready (if needed)
echo "Waiting for database to be ready..."
sleep 5

# Run migrations if they exist
if [ -d "/app/db/migrations" ]; then
    echo "Running migrations..."
    npm run migrate || echo "Migrations failed, but continuing..."
fi

# Run seeds if they exist
if [ -d "/app/db/seeds" ]; then
    echo "Seeding database..."
    npm run seed || echo "Seeding failed, but continuing..."
fi

# Start the service
echo "Starting content service..."
exec npm start