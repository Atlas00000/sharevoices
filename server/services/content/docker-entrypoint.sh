#!/bin/sh
set -e

# Function to check if MongoDB is ready
check_mongodb() {
  echo "Checking MongoDB connection..."
  max_retries=30
  retries=0

  while [ $retries -lt $max_retries ]; do
    if mongosh --eval "db.adminCommand('ping')" ${MONGODB_URI:-mongodb://localhost:27017} >/dev/null 2>&1; then
      echo "✅ MongoDB is ready!"
      return 0
    fi

    retries=$((retries+1))
    echo "MongoDB not ready yet (attempt $retries/$max_retries)... waiting 2 seconds..."
    sleep 2
  done

  echo "❌ Failed to connect to MongoDB after $max_retries attempts"
  return 1
}

# Function to check if Redis is ready
check_redis() {
  if [ "${USE_REDIS}" = "true" ]; then
    echo "Checking Redis connection..."
    max_retries=15
    retries=0

    while [ $retries -lt $max_retries ]; do
      if redis-cli -h ${REDIS_HOST:-redis} -p ${REDIS_PORT:-6379} ping >/dev/null 2>&1; then
        echo "✅ Redis is ready!"
        return 0
      fi

      retries=$((retries+1))
      echo "Redis not ready yet (attempt $retries/$max_retries)... waiting 2 seconds..."
      sleep 2
    done

    echo "⚠️ Failed to connect to Redis after $max_retries attempts, but continuing..."
  fi
  return 0
}

# Function to run MongoDB migrations
run_mongodb_migrations() {
  echo "Running MongoDB migrations..."
  if [ -f "src/migrations/index.ts" ]; then
    npm run migrate || echo "⚠️ Migrations failed, but continuing..."
  elif [ -f "dist/migrations/index.js" ]; then
    node dist/migrations/index.js || echo "⚠️ Migrations failed, but continuing..."
  else
    echo "⚠️ No migration script found, skipping migrations"
  fi
}

# Function to run seeds
run_seeds() {
  echo "Running database seeds..."
  if [ -f "src/seeds/index.ts" ]; then
    npm run seed || echo "⚠️ Seeding failed, but continuing..."
  elif [ -f "dist/seeds/index.js" ]; then
    node dist/seeds/index.js || echo "⚠️ Seeding failed, but continuing..."
  else
    echo "⚠️ No seed script found, skipping seeding"
  fi
}

# Main execution starts here
echo "🚀 Starting content service initialization..."

# Check database connections
check_mongodb || { echo "❌ MongoDB connection failed"; exit 1; }
check_redis

# Run migrations and seeds
run_mongodb_migrations
run_seeds

# Start the service
echo "✅ Initialization complete. Starting content service..."
exec npm start