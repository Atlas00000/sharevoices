#!/bin/sh
set -e

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

# Function to check if services are ready
check_services() {
  echo "Checking if services are ready..."
  
  # Check content service
  if [ -n "${CONTENT_SERVICE_URL}" ]; then
    echo "Checking content service..."
    max_retries=30
    retries=0
    
    while [ $retries -lt $max_retries ]; do
      if wget -q --spider "${CONTENT_SERVICE_URL}/health" >/dev/null 2>&1; then
        echo "✅ Content service is ready!"
        break
      fi
      
      retries=$((retries+1))
      echo "Content service not ready yet (attempt $retries/$max_retries)... waiting 2 seconds..."
      sleep 2
      
      if [ $retries -eq $max_retries ]; then
        echo "⚠️ Content service not ready after $max_retries attempts, but continuing..."
      fi
    done
  fi
  
  # Check user service
  if [ -n "${USER_SERVICE_URL}" ]; then
    echo "Checking user service..."
    max_retries=30
    retries=0
    
    while [ $retries -lt $max_retries ]; do
      if wget -q --spider "${USER_SERVICE_URL}/health" >/dev/null 2>&1; then
        echo "✅ User service is ready!"
        break
      fi
      
      retries=$((retries+1))
      echo "User service not ready yet (attempt $retries/$max_retries)... waiting 2 seconds..."
      sleep 2
      
      if [ $retries -eq $max_retries ]; then
        echo "⚠️ User service not ready after $max_retries attempts, but continuing..."
      fi
    done
  fi
}

# Main execution starts here
echo "🚀 Starting API Gateway initialization..."

# Check Redis if needed
check_redis

# Check services
check_services

# Start the service
echo "✅ Initialization complete. Starting API Gateway..."
exec npm start
