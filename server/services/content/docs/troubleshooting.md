# Troubleshooting Guide

## Overview

This guide provides solutions for common issues that may arise when using the Content Service. It includes diagnostic steps, solutions, and preventive measures.

## Common Issues

### Installation Issues

1. Node.js Version Mismatch
   ```bash
   # Check Node.js version
   node --version

   # Install correct version
   nvm install 18.0.0
   nvm use 18.0.0
   ```

2. MongoDB Connection Issues
   ```bash
   # Check MongoDB status
   mongod --version
   systemctl status mongodb

   # Test connection
   mongosh "mongodb://localhost:27017"
   ```

3. Redis Connection Issues
   ```bash
   # Check Redis status
   redis-cli --version
   systemctl status redis

   # Test connection
   redis-cli ping
   ```

4. Environment Variables
   ```bash
   # Check environment file
   cat .env

   # Verify required variables
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/content
   REDIS_URL=redis://localhost:6379
   ```

### Runtime Issues

1. Service Not Starting
   ```bash
   # Check logs
   tail -f logs/app.log

   # Check process
   ps aux | grep node

   # Check port
   netstat -tulpn | grep 3000
   ```

2. High Memory Usage
   ```bash
   # Check memory usage
   top -p $(pgrep -f node)

   # Check heap
   node --inspect app.js
   ```

3. Slow Response Times
   ```bash
   # Check database
   mongosh --eval "db.currentOp()"

   # Check Redis
   redis-cli info clients

   # Check network
   netstat -s
   ```

4. Connection Timeouts
   ```bash
   # Check timeouts
   curl -v http://localhost:3000/health

   # Check firewall
   iptables -L

   # Check DNS
   nslookup api.content-service.com
   ```

### API Issues

1. Authentication Errors
   ```bash
   # Check token
   curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/content

   # Check permissions
   curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/content/permissions
   ```

2. Rate Limiting
   ```bash
   # Check limits
   curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/content/limits

   # Check usage
   curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/content/usage
   ```

3. Validation Errors
   ```bash
   # Check schema
   curl -H "Content-Type: application/json" -d '{"title":"Test"}' http://localhost:3000/api/content

   # Check validation
   curl -H "Content-Type: application/json" -d '{"title":""}' http://localhost:3000/api/content
   ```

4. CORS Issues
   ```bash
   # Check CORS
   curl -H "Origin: http://localhost:8080" -v http://localhost:3000/api/content

   # Check headers
   curl -I http://localhost:3000/api/content
   ```

### Database Issues

1. Connection Problems
   ```bash
   # Check connection
   mongosh "mongodb://localhost:27017/content"

   # Check logs
   tail -f /var/log/mongodb/mongodb.log
   ```

2. Query Performance
   ```bash
   # Check indexes
   mongosh --eval "db.content.getIndexes()"

   # Check explain
   mongosh --eval "db.content.find().explain()"
   ```

3. Data Consistency
   ```bash
   # Check integrity
   mongosh --eval "db.content.validate()"

   # Check backups
   ls -l /backup/mongodb
   ```

4. Backup Issues
   ```bash
   # Check backup
   mongodump --out /backup/mongodb

   # Check restore
   mongorestore /backup/mongodb
   ```

### Cache Issues

1. Cache Misses
   ```bash
   # Check cache
   redis-cli keys "*"

   # Check stats
   redis-cli info stats
   ```

2. Memory Usage
   ```bash
   # Check memory
   redis-cli info memory

   # Check clients
   redis-cli info clients
   ```

3. Eviction Policy
   ```bash
   # Check policy
   redis-cli config get maxmemory-policy

   # Check limits
   redis-cli config get maxmemory
   ```

4. Persistence
   ```bash
   # Check RDB
   redis-cli config get save

   # Check AOF
   redis-cli config get appendonly
   ```

## Diagnostic Tools

### Logging

1. Application Logs
   ```bash
   # View logs
   tail -f logs/app.log

   # Search logs
   grep "ERROR" logs/app.log

   # Rotate logs
   logrotate -f /etc/logrotate.d/content
   ```

2. Access Logs
   ```bash
   # View access
   tail -f logs/access.log

   # Search access
   grep "POST" logs/access.log

   # Analyze access
   goaccess logs/access.log
   ```

3. Error Logs
   ```bash
   # View errors
   tail -f logs/error.log

   # Search errors
   grep "Exception" logs/error.log

   # Count errors
   wc -l logs/error.log
   ```

4. Audit Logs
   ```bash
   # View audit
   tail -f logs/audit.log

   # Search audit
   grep "admin" logs/audit.log

   # Export audit
   cat logs/audit.log > audit.csv
   ```

### Monitoring

1. Health Checks
   ```bash
   # Check health
   curl http://localhost:3000/health

   # Check metrics
   curl http://localhost:3000/metrics

   # Check status
   curl http://localhost:3000/status
   ```

2. Performance Metrics
   ```bash
   # Check CPU
   top -p $(pgrep -f node)

   # Check memory
   free -m

   # Check disk
   df -h
   ```

3. Network Metrics
   ```bash
   # Check connections
   netstat -an | grep 3000

   # Check bandwidth
   iftop -i eth0

   # Check latency
   ping localhost
   ```

4. Resource Usage
   ```bash
   # Check processes
   ps aux | grep node

   # Check threads
   ps -eLf | grep node

   # Check files
   lsof -i :3000
   ```

### Debugging

1. Node.js Debugging
   ```bash
   # Start debugger
   node --inspect app.js

   # Connect debugger
   chrome://inspect

   # Debug memory
   node --inspect --expose-gc app.js
   ```

2. MongoDB Debugging
   ```bash
   # Start debugger
   mongosh --debug

   # Check operations
   mongosh --eval "db.currentOp()"

   # Check locks
   mongosh --eval "db.serverStatus().locks"
   ```

3. Redis Debugging
   ```bash
   # Start debugger
   redis-cli monitor

   # Check memory
   redis-cli debug object key

   # Check slowlog
   redis-cli slowlog get
   ```

4. Network Debugging
   ```bash
   # Check packets
   tcpdump -i eth0 port 3000

   # Check connections
   netstat -an | grep 3000

   # Check routing
   traceroute api.content-service.com
   ```

## Solutions

### Performance

1. Query Optimization
   ```javascript
   // Add indexes
   db.content.createIndex({ title: 1 });
   db.content.createIndex({ category: 1 });
   db.content.createIndex({ authorId: 1 });

   // Optimize queries
   db.content.find({ title: "Test" }).explain();
   ```

2. Caching Strategy
   ```javascript
   // Cache content
   redis.set(`content:${id}`, JSON.stringify(content));
   redis.expire(`content:${id}`, 3600);

   // Cache categories
   redis.set('categories', JSON.stringify(categories));
   redis.expire('categories', 86400);
   ```

3. Resource Scaling
   ```bash
   # Scale CPU
   pm2 scale app 4

   # Scale memory
   node --max-old-space-size=4096 app.js

   # Scale connections
   ulimit -n 65535
   ```

4. Load Balancing
   ```bash
   # Configure nginx
   upstream content {
     server localhost:3000;
     server localhost:3001;
     server localhost:3002;
   }

   # Configure haproxy
   server content1 localhost:3000 check
   server content2 localhost:3001 check
   server content3 localhost:3002 check
   ```

### Stability

1. Error Handling
   ```javascript
   // Global error handler
   process.on('uncaughtException', (error) => {
     logger.error('Uncaught Exception:', error);
     process.exit(1);
   });

   // Promise error handler
   process.on('unhandledRejection', (reason, promise) => {
     logger.error('Unhandled Rejection:', reason);
   });
   ```

2. Memory Management
   ```javascript
   // Garbage collection
   if (global.gc) {
     global.gc();
   }

   // Memory limits
   const heapUsed = process.memoryUsage().heapUsed;
   if (heapUsed > 1024 * 1024 * 1024) {
     logger.warn('High memory usage:', heapUsed);
   }
   ```

3. Connection Management
   ```javascript
   // Connection pool
   mongoose.connect(uri, {
     maxPoolSize: 10,
     minPoolSize: 5,
     serverSelectionTimeoutMS: 5000
   });

   // Redis connection
   redis.on('error', (error) => {
     logger.error('Redis error:', error);
   });
   ```

4. Resource Cleanup
   ```javascript
   // Cleanup on exit
   process.on('SIGTERM', () => {
     mongoose.connection.close();
     redis.quit();
     process.exit(0);
   });

   // Cleanup on error
   process.on('uncaughtException', () => {
     mongoose.connection.close();
     redis.quit();
     process.exit(1);
   });
   ```

### Security

1. Authentication
   ```javascript
   // JWT validation
   const token = jwt.verify(req.token, process.env.JWT_SECRET);
   if (!token) {
     throw new Error('Invalid token');
   }

   // Password hashing
   const hash = await bcrypt.hash(password, 10);
   const match = await bcrypt.compare(password, hash);
   ```

2. Authorization
   ```javascript
   // Role check
   if (!user.roles.includes('admin')) {
     throw new Error('Unauthorized');
   }

   // Permission check
   if (!user.permissions.includes('content:write')) {
     throw new Error('Forbidden');
   }
   ```

3. Input Validation
   ```javascript
   // Schema validation
   const schema = Joi.object({
     title: Joi.string().required(),
     content: Joi.string().required(),
     category: Joi.string().required()
   });

   const { error } = schema.validate(req.body);
   if (error) {
     throw new Error(error.details[0].message);
   }
   ```

4. Rate Limiting
   ```javascript
   // Rate limit
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });

   app.use('/api/', limiter);
   ```

## Prevention

### Best Practices

1. Code Quality
   ```javascript
   // Linting
   npm run lint

   // Testing
   npm test

   // Coverage
   npm run coverage
   ```

2. Documentation
   ```javascript
   /**
    * @api {post} /api/content Create content
    * @apiName CreateContent
    * @apiGroup Content
    * @apiVersion 1.0.0
    *
    * @apiParam {String} title Content title
    * @apiParam {String} content Content body
    * @apiParam {String} category Content category
    *
    * @apiSuccess {Object} content Created content
    */
   ```

3. Monitoring
   ```javascript
   // Health check
   app.get('/health', (req, res) => {
     res.status(200).json({ status: 'ok' });
   });

   // Metrics
   app.get('/metrics', (req, res) => {
     res.status(200).json(metrics);
   });
   ```

4. Logging
   ```javascript
   // Logging
   logger.info('Request received', { path: req.path });
   logger.error('Error occurred', { error: err.message });
   logger.warn('Warning', { data: req.body });
   logger.debug('Debug info', { query: req.query });
   ```

### Maintenance

1. Updates
   ```bash
   # Update dependencies
   npm update

   # Update security
   npm audit fix

   # Update packages
   npm install
   ```

2. Backups
   ```bash
   # Backup database
   mongodump --out /backup/mongodb

   # Backup Redis
   redis-cli save

   # Backup files
   tar -czf backup.tar.gz /data
   ```

3. Monitoring
   ```bash
   # Check logs
   tail -f logs/app.log

   # Check metrics
   curl http://localhost:3000/metrics

   # Check health
   curl http://localhost:3000/health
   ```

4. Security
   ```bash
   # Check vulnerabilities
   npm audit

   # Check dependencies
   npm outdated

   # Check licenses
   npm license-checker
   ```

### Automation

1. CI/CD
   ```yaml
   # GitHub Actions
   name: CI/CD
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
         - run: npm install
         - run: npm test
   ```

2. Deployment
   ```bash
   # Deploy
   pm2 deploy ecosystem.config.js production

   # Rollback
   pm2 deploy ecosystem.config.js production revert

   # Restart
   pm2 restart all
   ```

3. Monitoring
   ```bash
   # Start monitoring
   pm2 monit

   # Check logs
   pm2 logs

   # Check status
   pm2 status
   ```

4. Maintenance
   ```bash
   # Backup
   ./scripts/backup.sh

   # Update
   ./scripts/update.sh

   # Cleanup
   ./scripts/cleanup.sh
   ```

## Resources

### Documentation

1. Guides
   - [User Guide](user-guide.md)
   - [Developer Guide](developer-guide.md)
   - [Admin Guide](admin-guide.md)
   - [API Guide](api-guide.md)

2. References
   - [API Reference](api-reference.md)
   - [Configuration](configuration.md)
   - [Security](security.md)
   - [Troubleshooting](troubleshooting.md)

3. Examples
   - [Code Samples](code-samples.md)
   - [Use Cases](use-cases.md)
   - [Tutorials](tutorials.md)
   - [Recipes](recipes.md)

### Tools

1. Development
   - [IDE Setup](ide-setup.md)
   - [Debugging](debugging.md)
   - [Testing](testing.md)
   - [Deployment](deployment.md)

2. Operations
   - [Monitoring](monitoring.md)
   - [Logging](logging.md)
   - [Backup](backup.md)
   - [Security](security.md)

3. Support
   - [Troubleshooting](troubleshooting.md)
   - [Diagnostics](diagnostics.md)
   - [Recovery](recovery.md)
   - [Prevention](prevention.md)

### Community

1. Forums
   - [GitHub Discussions](https://github.com/your-org/content-service/discussions)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/content-service)
   - [Discord Server](https://discord.gg/content-service)
   - [Reddit Community](https://www.reddit.com/r/content-service)

2. Social Media
   - [Twitter](https://twitter.com/content-service)
   - [LinkedIn](https://linkedin.com/company/content-service)
   - [Facebook](https://facebook.com/content-service)
   - [Instagram](https://instagram.com/content-service)

3. Events
   - [Webinars](https://webinars.content-service.com)
   - [Meetups](https://meetups.content-service.com)
   - [Conferences](https://conferences.content-service.com)
   - [Training](https://training.content-service.com) 