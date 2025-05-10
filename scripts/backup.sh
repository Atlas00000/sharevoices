#!/bin/bash

# Exit on error
set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="sharedvoices_backup_${TIMESTAMP}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting backup process..."

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker-compose exec -T postgres pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql"

# Backup Redis data
echo "Backing up Redis data..."
docker-compose exec -T redis redis-cli SAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb "${BACKUP_DIR}/${BACKUP_NAME}_redis.rdb"

# Backup Elasticsearch data
echo "Backing up Elasticsearch data..."
docker-compose exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/sharedvoices_backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/backup"
  }
}'
docker-compose exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/sharedvoices_backup/snapshot_${TIMESTAMP}?wait_for_completion=true"

# Backup configuration files
echo "Backing up configuration files..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" \
    .env \
    docker-compose.yml \
    docker-compose.monitoring.yml \
    config/monitoring/prometheus.yml \
    config/logstash/pipeline/logstash.conf

# Create final backup archive
echo "Creating final backup archive..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
    "${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql" \
    "${BACKUP_DIR}/${BACKUP_NAME}_redis.rdb" \
    "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz"

# Clean up temporary files
echo "Cleaning up temporary files..."
rm "${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql"
rm "${BACKUP_DIR}/${BACKUP_NAME}_redis.rdb"
rm "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz"

echo "Backup completed successfully: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# List available backups
echo -e "\nAvailable backups:"
ls -lh "${BACKUP_DIR}"/*.tar.gz 