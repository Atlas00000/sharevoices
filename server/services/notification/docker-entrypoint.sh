#!/bin/sh
set -e

echo "Running migrations..."
npx typeorm-ts-node-commonjs migration:run -d src/config/database.ts

echo "Running seeds..."
npx ts-node src/seeds/seed.ts || echo "No seed script found, skipping..."

echo "Starting service..."
exec npm run start 