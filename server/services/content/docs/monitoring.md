# Content Service Monitoring Guide

## Overview

This guide covers monitoring and observability for the Content Service, including metrics collection, logging, alerting, and performance monitoring.

## Metrics Collection

### Prometheus Metrics

1. Service metrics:
```typescript
// metrics/service.metrics.ts
import { Counter, Histogram } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
```

2. Business metrics:
```typescript
// metrics/business.metrics.ts
export const articleViews = new Counter({
  name: 'article_views_total',
  help: 'Total number of article views',
  labelNames: ['article_id', 'category']
});

export const articleCreationDuration = new Histogram({
  name: 'article_creation_duration_seconds',
  help: 'Duration of article creation in seconds',
  labelNames: ['category']
});
```

### Metrics Endpoints

1. Prometheus metrics:
```typescript
// routes/metrics.routes.ts
router.get('/metrics', metricsMiddleware);
```

2. Health check:
```typescript
// routes/health.routes.ts
router.get('/health', healthController.check);
```

## Logging

### Log Configuration

1. Winston logger:
```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. Log rotation:
```typescript
// utils/logger.ts
import 'winston-daily-rotate-file';

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});
```

### Log Patterns

1. Request logging:
```typescript
// middleware/request-logger.middleware.ts
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('user-agent')
    });
  });
  next();
};
```

2. Error logging:
```typescript
// middleware/error-logger.middleware.ts
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user
  });
  next(err);
};
```

## Alerting

### Alert Rules

1. Prometheus alert rules:
```yaml
# alerts/rules.yml
groups:
  - name: content-service
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: Error rate is above 10% for 5 minutes

      - alert: HighLatency
        expr: http_request_duration_seconds{quantile="0.9"} > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High latency detected
          description: 90th percentile latency is above 1 second
```

2. Custom alerts:
```typescript
// alerts/custom.alerts.ts
export const checkErrorRate = async () => {
  const errorRate = await getErrorRate();
  if (errorRate > 0.1) {
    await sendAlert({
      level: 'critical',
      message: 'High error rate detected',
      details: { errorRate }
    });
  }
};
```

### Alert Channels

1. Email alerts:
```typescript
// alerts/email.alerts.ts
export const sendEmailAlert = async (alert: Alert) => {
  await sendEmail({
    to: process.env.ALERT_EMAIL,
    subject: `[${alert.level}] Content Service Alert`,
    text: alert.message
  });
};
```

2. Slack alerts:
```typescript
// alerts/slack.alerts.ts
export const sendSlackAlert = async (alert: Alert) => {
  await slack.send({
    channel: process.env.SLACK_ALERT_CHANNEL,
    text: `*[${alert.level}]* ${alert.message}`,
    attachments: [{ text: JSON.stringify(alert.details, null, 2) }]
  });
};
```

## Performance Monitoring

### Database Monitoring

1. MongoDB metrics:
```typescript
// monitoring/mongodb.monitoring.ts
export const monitorMongoDB = async () => {
  const stats = await db.stats();
  logger.info('MongoDB Stats', {
    collections: stats.collections,
    objects: stats.objects,
    avgObjSize: stats.avgObjSize,
    dataSize: stats.dataSize,
    storageSize: stats.storageSize,
    indexes: stats.indexes,
    indexSize: stats.indexSize
  });
};
```

2. Query monitoring:
```typescript
// monitoring/query.monitoring.ts
mongoose.set('debug', (collectionName, method, query, doc) => {
  logger.debug('MongoDB Query', {
    collection: collectionName,
    method,
    query,
    doc
  });
});
```

### Cache Monitoring

1. Redis metrics:
```typescript
// monitoring/redis.monitoring.ts
export const monitorRedis = async () => {
  const info = await redis.info();
  logger.info('Redis Stats', {
    connectedClients: info.connected_clients,
    usedMemory: info.used_memory,
    totalConnections: info.total_connections_received,
    commandsProcessed: info.total_commands_processed
  });
};
```

2. Cache hit rate:
```typescript
// monitoring/cache.monitoring.ts
export const monitorCacheHitRate = async () => {
  const hits = await redis.get('cache:hits');
  const misses = await redis.get('cache:misses');
  const hitRate = hits / (hits + misses);
  
  logger.info('Cache Hit Rate', { hitRate });
};
```

## Dashboard Configuration

### Grafana Dashboards

1. Service overview:
```json
{
  "dashboard": {
    "title": "Content Service Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "{{route}}"
          }
        ]
      }
    ]
  }
}
```

2. Business metrics:
```json
{
  "dashboard": {
    "title": "Business Metrics",
    "panels": [
      {
        "title": "Article Views",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(article_views_total[5m])",
            "legendFormat": "{{category}}"
          }
        ]
      },
      {
        "title": "Article Creation Duration",
        "type": "heatmap",
        "targets": [
          {
            "expr": "rate(article_creation_duration_seconds_bucket[5m])",
            "legendFormat": "{{le}}"
          }
        ]
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. High latency:
   - Check database query performance
   - Monitor cache hit rates
   - Review service dependencies
   - Check resource utilization

2. High error rates:
   - Review error logs
   - Check service dependencies
   - Monitor rate limits
   - Review recent deployments

3. Memory leaks:
   - Monitor memory usage
   - Check for unclosed connections
   - Review caching strategies
   - Monitor garbage collection

### Debug Tools

1. Node.js profiling:
```bash
node --prof app.js
node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt
```

2. Memory heap dump:
```bash
node --heapsnapshot app.js
```

3. CPU profiling:
```bash
node --cpu-prof app.js
```

## Best Practices

1. Metrics:
   - Use meaningful metric names
   - Include relevant labels
   - Set appropriate aggregation
   - Monitor rate of change

2. Logging:
   - Use structured logging
   - Include context
   - Set appropriate log levels
   - Implement log rotation

3. Alerting:
   - Set meaningful thresholds
   - Include actionable information
   - Use appropriate severity levels
   - Implement alert grouping

4. Performance:
   - Monitor key metrics
   - Set performance budgets
   - Implement caching
   - Optimize database queries

## Resources

1. Tools:
   - [Prometheus](https://prometheus.io)
   - [Grafana](https://grafana.com)
   - [Winston](https://github.com/winstonjs/winston)
   - [Node.js Profiling](https://nodejs.org/en/docs/guides/simple-profiling)

2. Documentation:
   - [Prometheus Best Practices](https://prometheus.io/docs/practices/naming)
   - [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards)
   - [Winston Documentation](https://github.com/winstonjs/winston/blob/master/docs/transports.md)
   - [Node.js Monitoring](https://nodejs.org/en/docs/guides/diagnostics)

3. Community:
   - [Prometheus Users](https://groups.google.com/forum/#!forum/prometheus-users)
   - [Grafana Community](https://community.grafana.com)
   - [Node.js Diagnostics](https://github.com/nodejs/diagnostics)
   - [Winston Issues](https://github.com/winstonjs/winston/issues) 