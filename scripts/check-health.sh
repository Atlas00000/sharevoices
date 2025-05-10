#!/bin/sh

SERVICES="user notification interaction content"
PORTS="3002 3004 3003 3001"

i=1
for service in $SERVICES; do
  port=$(echo $PORTS | cut -d' ' -f$i)
  echo "Checking $service-service at http://localhost:$port/health ..."
  curl -s http://localhost:$port/health || echo "$service-service health check failed"
  echo ""
  i=$((i+1))
done 