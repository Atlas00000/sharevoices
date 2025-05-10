#!/bin/sh
set -e

# Function to check if PostgreSQL is ready
check_postgres() {
  echo "Checking PostgreSQL connection..."
  max_retries=30
  retries=0

  while [ $retries -lt $max_retries ]; do
    if pg_isready -h ${DB_HOST:-db} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres}; then
      echo "✅ PostgreSQL is ready!"
      return 0
    fi

    retries=$((retries+1))
    echo "PostgreSQL not ready yet (attempt $retries/$max_retries)... waiting 2 seconds..."
    sleep 2
  done

  echo "❌ Failed to connect to PostgreSQL after $max_retries attempts"
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

# Function to run PostgreSQL migrations
run_postgres_migrations() {
  echo "Running PostgreSQL migrations..."
  if [ -f "src/config/database.ts" ]; then
    npx typeorm-ts-node-commonjs migration:run -d src/config/database.ts || echo "⚠️ Migrations failed, but continuing..."
  else
    echo "⚠️ No database.ts found, skipping migrations"
  fi
}

# Function to run seeds
run_seeds() {
  echo "Running database seeds..."
  if [ -f "src/seeds/seed.ts" ]; then
    npx ts-node src/seeds/seed.ts || echo "⚠️ Seeding failed, but continuing..."
  elif [ -f "dist/seeds/seed.js" ]; then
    node dist/seeds/seed.js || echo "⚠️ Seeding failed, but continuing..."
  else
    echo "⚠️ No seed script found, skipping seeding"
  fi
}

# Main execution starts here
echo "🚀 Starting user service initialization..."

# Check database connections
check_postgres || { echo "❌ PostgreSQL connection failed"; exit 1; }
check_redis

# Run migrations and seeds
run_postgres_migrations
run_seeds

# Start the service
echo "✅ Initialization complete. Starting user service..."
exec npm start