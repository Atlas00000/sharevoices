#!/bin/bash

# Exit on error
set -e

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo "Example: $0 ./backups/sharedvoices_backup_20240101_120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"
RESTORE_DIR="./restore_temp"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Starting restore process..."

# Create temporary restore directory
mkdir -p "${RESTORE_DIR}"

# Extract backup archive
echo "Extracting backup archive..."
tar -xzf "$BACKUP_FILE" -C "${RESTORE_DIR}"

# Restore PostgreSQL database
echo "Restoring PostgreSQL database..."
docker-compose exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker-compose exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" < "${RESTORE_DIR}/sharedvoices_backup_"*"_postgres.sql"

# Restore Redis data
echo "Restoring Redis data..."
docker cp "${RESTORE_DIR}/sharedvoices_backup_"*"_redis.rdb" $(docker-compose ps -q redis):/data/dump.rdb
docker-compose restart redis

# Restore Elasticsearch data
echo "Restoring Elasticsearch data..."
docker-compose exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/sharedvoices_backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/backup"
  }
}'
docker-compose exec -T elasticsearch curl -X POST "localhost:9200/_snapshot/sharedvoices_backup/snapshot_"*"/_restore?wait_for_completion=true"

# Restore configuration files
echo "Restoring configuration files..."
tar -xzf "${RESTORE_DIR}/sharedvoices_backup_"*"_config.tar.gz" -C .

# Clean up temporary files
echo "Cleaning up temporary files..."
rm -rf "${RESTORE_DIR}"

echo "Restore completed successfully!"

# Restart services to apply changes
echo "Restarting services..."
docker-compose down
docker-compose up -d

echo "Services have been restarted. Please verify the restore was successful." 