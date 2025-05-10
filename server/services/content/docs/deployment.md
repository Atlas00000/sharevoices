# Content Service Deployment Guide

## Overview

This guide covers deployment procedures, configurations, and best practices for the Content Service.

## Prerequisites

1. Required software:
```bash
# Node.js and npm
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0

# MongoDB
mongod --version  # Should be >= 6.0.0

# Redis
redis-cli --version  # Should be >= 7.0.0

# Docker (optional)
docker --version  # Should be >= 24.0.0
```

2. Environment variables:
```bash
# .env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/content
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
```

## Deployment Methods

### Docker Deployment

1. Dockerfile:
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

2. Docker Compose:
```yaml
# docker-compose.yml
version: '3.8'

services:
  content-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/content
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### Kubernetes Deployment

1. Deployment configuration:
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: content-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: content-service
  template:
    metadata:
      labels:
        app: content-service
    spec:
      containers:
      - name: content-service
        image: content-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: content-service-secrets
              key: mongodb-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: content-service-secrets
              key: redis-url
```

2. Service configuration:
```yaml
# kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: content-service
spec:
  selector:
    app: content-service
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

## Deployment Steps

### Local Deployment

1. Install dependencies:
```bash
# Install dependencies
npm install

# Build the application
npm run build
```

2. Start services:
```bash
# Start MongoDB
mongod --dbpath /data/db

# Start Redis
redis-server

# Start the application
npm start
```

### Production Deployment

1. Build and push Docker image:
```bash
# Build the image
docker build -t content-service:latest .

# Push to registry
docker push content-service:latest
```

2. Deploy with Docker Compose:
```bash
# Deploy services
docker-compose up -d

# Check logs
docker-compose logs -f
```

3. Deploy to Kubernetes:
```bash
# Apply configurations
kubectl apply -f kubernetes/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
```

## Monitoring

### Health Checks

1. Health check endpoint:
```typescript
// routes/health.routes.ts
router.get('/health', async (req: Request, res: Response) => {
  const health = {
    status: 'UP',
    timestamp: new Date(),
    services: {
      database: await checkDatabase(),
      cache: await checkCache()
    }
  };

  res.json(health);
});
```

2. Kubernetes health check:
```yaml
# kubernetes/deployment.yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Logging

1. Log configuration:
```typescript
// config/logger.config.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

2. Log aggregation:
```yaml
# kubernetes/fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      type tail
      path /var/log/content-service/*.log
      pos_file /var/log/fluentd-content-service.pos
      tag content-service
      format json
    </source>
    <match content-service>
      type elasticsearch
      host elasticsearch
      port 9200
      index_name content-service-${tag}-%Y%m%d
    </match>
```

## Scaling

### Horizontal Scaling

1. Kubernetes scaling:
```bash
# Scale deployment
kubectl scale deployment content-service --replicas=5

# Enable autoscaling
kubectl autoscale deployment content-service --min=3 --max=10 --cpu-percent=80
```

2. Load balancer configuration:
```yaml
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: content-service-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /content
        pathType: Prefix
        backend:
          service:
            name: content-service
            port:
              number: 80
```

### Vertical Scaling

1. Resource limits:
```yaml
# kubernetes/deployment.yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

2. Database scaling:
```yaml
# kubernetes/mongodb-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: mongodb
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

## Backup and Recovery

### Database Backup

1. MongoDB backup:
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/content" --out=/backup

# Restore backup
mongorestore --uri="mongodb://localhost:27017/content" /backup/content
```

2. Automated backup:
```yaml
# kubernetes/backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mongodb-backup
spec:
  schedule: "0 0 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: mongodb-backup
            image: mongo:6
            command:
            - /bin/sh
            - -c
            - |
              mongodump --uri="$MONGODB_URI" --out=/backup
              aws s3 cp /backup s3://backups/content-service/$(date +%Y%m%d) --recursive
```

### Disaster Recovery

1. Recovery plan:
```typescript
// utils/recovery.ts
export const recoverService = async () => {
  try {
    // Restore database
    await restoreDatabase();

    // Rebuild indexes
    await rebuildIndexes();

    // Verify data integrity
    await verifyDataIntegrity();

    logger.info('Service recovered successfully');
  } catch (error) {
    logger.error('Recovery failed:', error);
    throw error;
  }
};
```

2. Recovery automation:
```yaml
# kubernetes/recovery-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: content-service-recovery
spec:
  template:
    spec:
      containers:
      - name: recovery
        image: content-service:latest
        command: ["npm", "run", "recover"]
      restartPolicy: OnFailure
```

## Best Practices

1. Deployment:
   - Use containerization
   - Implement CI/CD
   - Use infrastructure as code
   - Follow security best practices

2. Monitoring:
   - Set up health checks
   - Implement logging
   - Use metrics collection
   - Set up alerts

3. Scaling:
   - Use horizontal scaling
   - Implement load balancing
   - Monitor resource usage
   - Use auto-scaling

4. Backup:
   - Regular backups
   - Test recovery procedures
   - Store backups securely
   - Document recovery steps

## Resources

1. Tools:
   - [Docker](https://www.docker.com)
   - [Kubernetes](https://kubernetes.io)
   - [Helm](https://helm.sh)
   - [Prometheus](https://prometheus.io)

2. Documentation:
   - [Docker Documentation](https://docs.docker.com)
   - [Kubernetes Documentation](https://kubernetes.io/docs)
   - [MongoDB Deployment](https://docs.mongodb.com/manual/administration)
   - [Redis Deployment](https://redis.io/topics/admin)

3. Community:
   - [Docker Community](https://www.docker.com/community)
   - [Kubernetes Community](https://kubernetes.io/community)
   - [MongoDB Community](https://www.mongodb.com/community)
   - [Redis Community](https://redis.io/community) 