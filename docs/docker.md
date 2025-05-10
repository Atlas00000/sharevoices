# Docker Setup and Usage Guide

## Overview

This guide covers the Docker setup and usage for the Shared Voices platform. The platform uses Docker for containerization, with separate configurations for development and production environments.

## Prerequisites

- Docker Engine 20.10.0 or later
- Docker Compose 2.0.0 or later
- Git
- Node.js 18 or later (for local development)

## Development Environment

### Starting the Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/shared-voices.git
   cd shared-voices
   ```

2. Create environment files:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the development environment:
   ```bash
   ./scripts/dev.sh
   ```

   To include monitoring:
   ```bash
   ./scripts/dev.sh --with-monitoring
   ```

### Development URLs

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Grafana: http://localhost:3000 (if monitoring enabled)
- Kibana: http://localhost:5601 (if monitoring enabled)

## Production Environment

### Deploying to Production

1. Set up environment variables:
   ```bash
   export POSTGRES_USER=your_user
   export POSTGRES_PASSWORD=your_password
   export POSTGRES_DB=sharedvoices
   export JWT_SECRET=your_secret
   export REDIS_PASSWORD=your_redis_password
   export ELASTICSEARCH_PASSWORD=your_es_password
   export GRAFANA_ADMIN_PASSWORD=your_grafana_password
   ```

2. Deploy the production environment:
   ```bash
   ./scripts/prod.sh
   ```

   To include SSL:
   ```bash
   ./scripts/prod.sh --with-ssl
   ```

### Production URLs

- API Gateway: https://api.sharedvoices.com
- Grafana: https://monitoring.sharedvoices.com
- Kibana: https://logs.sharedvoices.com

## Monitoring and Logging

### Prometheus

- URL: http://localhost:9090
- Configuration: `config/monitoring/prometheus.yml`
- Metrics endpoints: `/metrics` on each service

### Grafana

- URL: http://localhost:3000
- Default credentials:
  - Username: admin
  - Password: set in GRAFANA_ADMIN_PASSWORD

### ELK Stack

- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601
- Logstash: Configured to receive logs on port 5000

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Error: "Port XXXX is already in use"
   - Solution: Stop the conflicting service or change the port in docker-compose.yml

2. **Container Health Checks**
   - Error: "Container unhealthy"
   - Solution: Check logs with `docker-compose logs <service-name>`

3. **Database Connection**
   - Error: "Cannot connect to database"
   - Solution: Verify database credentials and network settings

### Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart a service
docker-compose restart <service-name>

# Check service health
curl http://localhost:<port>/health

# View container status
docker-compose ps
```

## Security Considerations

1. **Secrets Management**
   - Use environment variables for sensitive data
   - Never commit .env files to version control
   - Use Docker secrets in production

2. **Network Security**
   - Services communicate over internal Docker network
   - External access only through API Gateway
   - SSL/TLS for all external connections

3. **Container Security**
   - Regular security scans with Trivy
   - Keep base images updated
   - Run containers as non-root users

## Maintenance

### Updating Services

1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

### Backup and Restore

1. Database backup:
   ```bash
   ./scripts/backup.sh
   ```

2. Restore from backup:
   ```bash
   ./scripts/restore.sh <backup-file>
   ```

## Contributing

1. Follow the development workflow:
   ```bash
   git checkout -b feature/your-feature
   ./scripts/dev.sh
   # Make changes
   git commit -m "Your changes"
   git push origin feature/your-feature
   ```

2. Run tests:
   ```bash
   ./scripts/test.sh
   ```

3. Create pull request

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [ELK Stack Documentation](https://www.elastic.co/guide/index.html) 