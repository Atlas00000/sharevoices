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
  echo "Checking Redis connection..."
  max_retries=30
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
  
  echo "❌ Failed to connect to Redis after $max_retries attempts"
  return 1
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

# Function to run MongoDB migrations
run_mongodb_migrations() {
  echo "Running MongoDB migrations..."
  if [ -f "src/migrations/index.ts" ]; then
    npx ts-node src/migrations/index.ts || echo "⚠️ Migrations failed, but continuing..."
  elif [ -f "src/migrations/index.js" ]; then
    node dist/migrations/index.js || echo "⚠️ Migrations failed, but continuing..."
  else
    echo "⚠️ No migration script found, skipping migrations"
  fi
}

# Function to run seeds
run_seeds() {
  echo "Running database seeds..."
  if [ -f "src/seeds/seed.ts" ]; then
    npx ts-node src/seeds/seed.ts || echo "⚠️ Seeding failed, but continuing..."
  elif [ -f "src/seeds/index.ts" ]; then
    npx ts-node src/seeds/index.ts || echo "⚠️ Seeding failed, but continuing..."
  elif [ -f "src/seeds/seed.js" ]; then
    node dist/seeds/seed.js || echo "⚠️ Seeding failed, but continuing..."
  elif [ -f "src/seeds/index.js" ]; then
    node dist/seeds/index.js || echo "⚠️ Seeding failed, but continuing..."
  else
    echo "⚠️ No seed script found, skipping seeding"
  fi
}

# Main execution starts here
echo "🚀 Starting service initialization..."

# Check database connections based on service type
if [ "${SERVICE_TYPE}" = "postgres" ] || [ "${DATABASE_TYPE}" = "postgres" ]; then
  check_postgres || { echo "❌ PostgreSQL connection failed"; exit 1; }
  run_postgres_migrations
elif [ "${SERVICE_TYPE}" = "mongodb" ] || [ "${DATABASE_TYPE}" = "mongodb" ]; then
  check_mongodb || { echo "❌ MongoDB connection failed"; exit 1; }
  run_mongodb_migrations
fi

# Check Redis if needed
if [ "${USE_REDIS}" = "true" ]; then
  check_redis || echo "⚠️ Redis connection failed, but continuing..."
fi

# Run seeds
run_seeds

# Start the service
echo "✅ Initialization complete. Starting service..."
exec npm start
