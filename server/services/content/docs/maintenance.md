# Content Service Maintenance Guide

## Overview

This guide covers maintenance procedures, best practices, and troubleshooting for the Content Service.

## Regular Maintenance

### Database Maintenance

1. Index optimization:
```typescript
// scripts/optimize-indexes.ts
import { Article } from '../models/article.model';
import { Category } from '../models/category.model';

export const optimizeIndexes = async () => {
  try {
    // Rebuild article indexes
    await Article.reIndex();
    logger.info('Article indexes rebuilt');

    // Rebuild category indexes
    await Category.reIndex();
    logger.info('Category indexes rebuilt');

    // Analyze index usage
    const indexStats = await Article.collection.indexStats();
    logger.info('Index statistics:', indexStats);
  } catch (error) {
    logger.error('Index optimization failed:', error);
    throw error;
  }
};
```

2. Data cleanup:
```typescript
// scripts/cleanup-data.ts
export const cleanupData = async () => {
  try {
    // Remove old drafts
    const result = await Article.deleteMany({
      status: 'draft',
      updatedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    logger.info(`Removed ${result.deletedCount} old drafts`);

    // Archive old articles
    await Article.updateMany(
      {
        status: 'published',
        publishedAt: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      },
      { $set: { status: 'archived' } }
    );
    logger.info('Old articles archived');
  } catch (error) {
    logger.error('Data cleanup failed:', error);
    throw error;
  }
};
```

### Cache Maintenance

1. Cache cleanup:
```typescript
// scripts/cleanup-cache.ts
import { redis } from '../config/redis.config';

export const cleanupCache = async () => {
  try {
    // Remove expired keys
    const keys = await redis.keys('article:*');
    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        await redis.del(key);
      }
    }
    logger.info('Cache cleaned up');

    // Reset cache statistics
    await redis.del('cache:hits');
    await redis.del('cache:misses');
    logger.info('Cache statistics reset');
  } catch (error) {
    logger.error('Cache cleanup failed:', error);
    throw error;
  }
};
```

2. Cache optimization:
```typescript
// scripts/optimize-cache.ts
export const optimizeCache = async () => {
  try {
    // Analyze cache usage
    const info = await redis.info();
    logger.info('Cache information:', info);

    // Optimize memory usage
    await redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
    logger.info('Cache memory policy updated');
  } catch (error) {
    logger.error('Cache optimization failed:', error);
    throw error;
  }
};
```

## Performance Optimization

### Query Optimization

1. Slow query analysis:
```typescript
// scripts/analyze-queries.ts
export const analyzeQueries = async () => {
  try {
    // Enable query logging
    mongoose.set('debug', true);

    // Collect slow queries
    const slowQueries = await Article.collection.find({
      $where: 'this.executionTime > 100'
    });

    // Analyze and optimize
    for (const query of slowQueries) {
      logger.info('Slow query:', query);
      // Add appropriate indexes
      await Article.collection.createIndex(query.query);
    }
  } catch (error) {
    logger.error('Query analysis failed:', error);
    throw error;
  }
};
```

2. Index optimization:
```typescript
// scripts/optimize-queries.ts
export const optimizeQueries = async () => {
  try {
    // Analyze index usage
    const indexStats = await Article.collection.indexStats();
    const unusedIndexes = Object.entries(indexStats)
      .filter(([_, stats]) => stats.accesses.ops === 0)
      .map(([name]) => name);

    // Remove unused indexes
    for (const index of unusedIndexes) {
      await Article.collection.dropIndex(index);
      logger.info(`Removed unused index: ${index}`);
    }
  } catch (error) {
    logger.error('Query optimization failed:', error);
    throw error;
  }
};
```

### Resource Optimization

1. Memory optimization:
```typescript
// scripts/optimize-memory.ts
export const optimizeMemory = async () => {
  try {
    // Analyze memory usage
    const memoryUsage = process.memoryUsage();
    logger.info('Memory usage:', memoryUsage);

    // Force garbage collection
    if (global.gc) {
      global.gc();
      logger.info('Garbage collection performed');
    }

    // Clear module cache
    Object.keys(require.cache).forEach(key => {
      delete require.cache[key];
    });
    logger.info('Module cache cleared');
  } catch (error) {
    logger.error('Memory optimization failed:', error);
    throw error;
  }
};
```

2. Connection optimization:
```typescript
// scripts/optimize-connections.ts
export const optimizeConnections = async () => {
  try {
    // Analyze connection pool
    const poolStats = await mongoose.connection.db.admin().serverStatus();
    logger.info('Connection pool stats:', poolStats);

    // Optimize pool size
    await mongoose.connection.db.admin().command({
      setParameter: 1,
      maxPoolSize: 50
    });
    logger.info('Connection pool optimized');
  } catch (error) {
    logger.error('Connection optimization failed:', error);
    throw error;
  }
};
```

## Backup and Recovery

### Database Backup

1. Automated backup:
```typescript
// scripts/backup-database.ts
export const backupDatabase = async () => {
  try {
    const timestamp = new Date().toISOString();
    const backupPath = `/backup/content-${timestamp}`;

    // Create backup
    await exec(`mongodump --uri="${process.env.MONGODB_URI}" --out="${backupPath}"`);
    logger.info('Database backup created');

    // Compress backup
    await exec(`tar -czf "${backupPath}.tar.gz" "${backupPath}"`);
    logger.info('Backup compressed');

    // Upload to storage
    await uploadToStorage(`${backupPath}.tar.gz`);
    logger.info('Backup uploaded');
  } catch (error) {
    logger.error('Database backup failed:', error);
    throw error;
  }
};
```

2. Backup verification:
```typescript
// scripts/verify-backup.ts
export const verifyBackup = async (backupPath: string) => {
  try {
    // Restore backup to temporary database
    const tempDb = `temp-${Date.now()}`;
    await exec(`mongorestore --uri="${process.env.MONGODB_URI}" --db="${tempDb}" "${backupPath}"`);

    // Verify data integrity
    const stats = await mongoose.connection.db.admin().serverStatus();
    logger.info('Backup verification stats:', stats);

    // Clean up temporary database
    await mongoose.connection.db.admin().command({ dropDatabase: 1 });
    logger.info('Backup verified successfully');
  } catch (error) {
    logger.error('Backup verification failed:', error);
    throw error;
  }
};
```

### Cache Backup

1. Cache persistence:
```typescript
// scripts/backup-cache.ts
export const backupCache = async () => {
  try {
    // Save cache to disk
    await redis.save();
    logger.info('Cache saved to disk');

    // Copy RDB file
    const timestamp = new Date().toISOString();
    await exec(`cp /var/lib/redis/dump.rdb /backup/cache-${timestamp}.rdb`);
    logger.info('Cache backup created');

    // Upload to storage
    await uploadToStorage(`/backup/cache-${timestamp}.rdb`);
    logger.info('Cache backup uploaded');
  } catch (error) {
    logger.error('Cache backup failed:', error);
    throw error;
  }
};
```

2. Cache recovery:
```typescript
// scripts/recover-cache.ts
export const recoverCache = async (backupPath: string) => {
  try {
    // Stop Redis
    await redis.quit();

    // Restore RDB file
    await exec(`cp "${backupPath}" /var/lib/redis/dump.rdb`);

    // Start Redis
    await redis.connect();
    logger.info('Cache recovered successfully');
  } catch (error) {
    logger.error('Cache recovery failed:', error);
    throw error;
  }
};
```

## Monitoring and Alerts

### Health Monitoring

1. Service health:
```typescript
// scripts/monitor-health.ts
export const monitorHealth = async () => {
  try {
    // Check database health
    const dbHealth = await checkDatabaseHealth();
    logger.info('Database health:', dbHealth);

    // Check cache health
    const cacheHealth = await checkCacheHealth();
    logger.info('Cache health:', cacheHealth);

    // Check service health
    const serviceHealth = await checkServiceHealth();
    logger.info('Service health:', serviceHealth);

    // Send alerts if needed
    if (!dbHealth.isHealthy || !cacheHealth.isHealthy || !serviceHealth.isHealthy) {
      await sendAlert('Service health check failed', {
        dbHealth,
        cacheHealth,
        serviceHealth
      });
    }
  } catch (error) {
    logger.error('Health monitoring failed:', error);
    throw error;
  }
};
```

2. Performance monitoring:
```typescript
// scripts/monitor-performance.ts
export const monitorPerformance = async () => {
  try {
    // Collect metrics
    const metrics = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      activeConnections: mongoose.connection.base.connections.length
    };

    // Analyze metrics
    if (metrics.memory.heapUsed > 1024 * 1024 * 1024) {
      await sendAlert('High memory usage detected', metrics);
    }

    if (metrics.activeConnections > 100) {
      await sendAlert('High connection count detected', metrics);
    }

    logger.info('Performance metrics:', metrics);
  } catch (error) {
    logger.error('Performance monitoring failed:', error);
    throw error;
  }
};
```

### Alert Configuration

1. Alert setup:
```typescript
// config/alert.config.ts
export const alertConfig = {
  email: {
    enabled: true,
    recipients: ['admin@example.com'],
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },
  slack: {
    enabled: true,
    webhook: process.env.SLACK_WEBHOOK
  }
};
```

2. Alert handling:
```typescript
// utils/alert.ts
export const sendAlert = async (message: string, details: any) => {
  try {
    // Send email alert
    if (alertConfig.email.enabled) {
      await sendEmail({
        to: alertConfig.email.recipients,
        subject: `[ALERT] ${message}`,
        text: JSON.stringify(details, null, 2)
      });
    }

    // Send Slack alert
    if (alertConfig.slack.enabled) {
      await sendSlackMessage({
        text: `*[ALERT]* ${message}\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``
      });
    }

    logger.info('Alert sent:', { message, details });
  } catch (error) {
    logger.error('Alert sending failed:', error);
    throw error;
  }
};
```

## Best Practices

1. Regular Maintenance:
   - Schedule regular maintenance windows
   - Document all maintenance procedures
   - Test maintenance scripts
   - Monitor maintenance impact

2. Performance:
   - Regular performance analysis
   - Optimize database queries
   - Monitor resource usage
   - Implement caching strategies

3. Backup:
   - Regular automated backups
   - Verify backup integrity
   - Test recovery procedures
   - Secure backup storage

4. Monitoring:
   - Set up comprehensive monitoring
   - Configure meaningful alerts
   - Regular health checks
   - Performance tracking

## Resources

1. Tools:
   - [MongoDB Compass](https://www.mongodb.com/products/compass)
   - [Redis Commander](https://github.com/joeferner/redis-commander)
   - [Prometheus](https://prometheus.io)
   - [Grafana](https://grafana.com)

2. Documentation:
   - [MongoDB Maintenance](https://docs.mongodb.com/manual/administration)
   - [Redis Maintenance](https://redis.io/topics/admin)
   - [Node.js Performance](https://nodejs.org/en/docs/guides/performance)
   - [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

3. Community:
   - [MongoDB Community](https://www.mongodb.com/community)
   - [Redis Community](https://redis.io/community)
   - [Node.js Community](https://nodejs.org/en/community)
   - [Express Community](https://expressjs.com/en/resources/community.html) 