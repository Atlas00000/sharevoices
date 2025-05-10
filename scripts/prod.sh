#!/bin/bash
# Production script to start the entire stack in production mode

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check environment variables
check_env() {
    local required_vars=(
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "POSTGRES_DB"
        "JWT_SECRET"
        "REDIS_PASSWORD"
        "ELASTICSEARCH_PASSWORD"
        "GRAFANA_ADMIN_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "Error: $var is not set. Please set all required environment variables."
            exit 1
        fi
    done
}

# Function to create Docker network
create_network() {
    if ! docker network ls | grep -q shared-voices-network; then
        echo "Creating Docker network..."
        docker network create shared-voices-network
    fi
}

# Function to start services
start_services() {
    echo "Starting production environment..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
}

# Function to start monitoring
start_monitoring() {
    echo "Starting monitoring services..."
    docker-compose -f docker-compose.monitoring.yml up -d
}

# Function to check service health
check_health() {
    echo "Checking service health..."
    sleep 30  # Give services more time to start in production
    
    local services=(
        "content-service:3002"
        "user-service:3000"
        "interaction-service:3003"
        "notification-service:3001"
        "api-gateway:8080"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if curl -s "http://localhost:$port/health" > /dev/null; then
            echo "✅ $name is healthy"
        else
            echo "❌ $name is not responding"
        fi
    done
}

# Function to setup SSL certificates
setup_ssl() {
    if [ "$1" == "--with-ssl" ]; then
        echo "Setting up SSL certificates..."
        docker-compose -f docker-compose.ssl.yml up -d
    fi
}

# Main execution
check_docker
check_env
create_network
start_services
start_monitoring
setup_ssl "$1"
check_health

echo "Production environment is ready!"
echo "API Gateway: https://api.sharedvoices.com"
echo "Grafana: https://monitoring.sharedvoices.com"
echo "Kibana: https://logs.sharedvoices.com"
