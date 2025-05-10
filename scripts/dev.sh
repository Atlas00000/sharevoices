#!/bin/bash
# Development script to start the entire stack in development mode

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if required ports are available
check_ports() {
    local ports=(3000 3001 3002 3003 8080 9090 5601 9200)
    for port in "${ports[@]}"; do
        if lsof -i :$port > /dev/null 2>&1; then
            echo "Port $port is already in use. Please free up the port and try again."
            exit 1
        fi
    done
}

# Function to start services
start_services() {
    echo "Starting development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
}

# Function to start monitoring
start_monitoring() {
    if [ "$1" == "--with-monitoring" ]; then
        echo "Starting monitoring services..."
        docker-compose -f docker-compose.monitoring.yml up -d
    fi
}

# Function to check service health
check_health() {
    echo "Checking service health..."
    sleep 10  # Give services time to start
    
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

# Main execution
check_docker
check_ports
start_services
start_monitoring "$1"
check_health

echo "Development environment is ready!"
echo "Frontend: http://localhost:3000"
echo "API Gateway: http://localhost:8080"
echo "Grafana: http://localhost:3000 (if monitoring is enabled)"
echo "Kibana: http://localhost:5601 (if monitoring is enabled)"
