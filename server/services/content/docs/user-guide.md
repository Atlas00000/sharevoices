# User Guide

## Overview

This guide provides information on how to use the Content Service, including features, functionality, and best practices.

## Getting Started

### Installation

1. Prerequisites
   ```bash
   # Check Node.js
   node --version  # Should be >= 18.0.0

   # Check MongoDB
   mongod --version  # Should be >= 6.0.0

   # Check Redis
   redis-cli --version  # Should be >= 7.0.0
   ```

2. Setup
   ```bash
   # Clone repository
   git clone https://github.com/your-org/content-service.git
   cd content-service

   # Install dependencies
   npm install

   # Set up environment
   cp .env.example .env
   ```

3. Configuration
   ```bash
   # Environment variables
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/content
   REDIS_URL=redis://localhost:6379
   ```

4. Start Service
   ```bash
   # Development
   npm run dev

   # Production
   npm start

   # Docker
   docker-compose up
   ```

### Authentication

1. Registration
   ```bash
   # Register user
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

2. Login
   ```bash
   # Login user
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

3. Token
   ```bash
   # Use token
   curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/content
   ```

4. Logout
   ```bash
   # Logout user
   curl -X POST http://localhost:3000/api/auth/logout \
     -H "Authorization: Bearer $TOKEN"
   ```

## Features

### Content Management

1. Create Content
   ```bash
   # Create article
   curl -X POST http://localhost:3000/api/content \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "My Article",
       "content": "Article content",
       "category": "news"
     }'
   ```

2. Read Content
   ```bash
   # Get article
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/content/123

   # List articles
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/content
   ```

3. Update Content
   ```bash
   # Update article
   curl -X PUT http://localhost:3000/api/content/123 \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Updated Article",
       "content": "Updated content"
     }'
   ```

4. Delete Content
   ```bash
   # Delete article
   curl -X DELETE http://localhost:3000/api/content/123 \
     -H "Authorization: Bearer $TOKEN"
   ```

### Category Management

1. Create Category
   ```bash
   # Create category
   curl -X POST http://localhost:3000/api/categories \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "News",
       "description": "News articles"
     }'
   ```

2. Read Categories
   ```bash
   # Get category
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/categories/123

   # List categories
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/categories
   ```

3. Update Category
   ```bash
   # Update category
   curl -X PUT http://localhost:3000/api/categories/123 \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Updated News",
       "description": "Updated description"
     }'
   ```

4. Delete Category
   ```bash
   # Delete category
   curl -X DELETE http://localhost:3000/api/categories/123 \
     -H "Authorization: Bearer $TOKEN"
   ```

### Search

1. Basic Search
   ```bash
   # Search content
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/search?q=news
   ```

2. Advanced Search
   ```bash
   # Search with filters
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/search?q=news&category=tech&author=john
   ```

3. Faceted Search
   ```bash
   # Search with facets
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/search?q=news&facets=category,author
   ```

4. Sort Results
   ```bash
   # Sort search results
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/search?q=news&sort=date:desc
   ```

### Analytics

1. Content Analytics
   ```bash
   # Get content stats
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/analytics/content
   ```

2. User Analytics
   ```bash
   # Get user stats
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/analytics/users
   ```

3. Category Analytics
   ```bash
   # Get category stats
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/analytics/categories
   ```

4. Search Analytics
   ```bash
   # Get search stats
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/analytics/search
   ```

## Best Practices

### Content Creation

1. Structure
   ```markdown
   # Title
   Brief description

   ## Introduction
   Main points

   ## Body
   Detailed content

   ## Conclusion
   Summary
   ```

2. Formatting
   ```markdown
   # Headers
   ## Subheaders
   ### Sub-subheaders

   * Bullet points
   * More points

   1. Numbered list
   2. More items

   > Blockquotes
   > More quotes

   `Code blocks`
   ```

3. Media
   ```markdown
   ![Image alt](image.jpg)

   [Link text](url)

   <video src="video.mp4"></video>

   <audio src="audio.mp3"></audio>
   ```

4. Metadata
   ```json
   {
     "title": "Article Title",
     "description": "Article description",
     "keywords": ["keyword1", "keyword2"],
     "author": "Author Name",
     "date": "2024-03-20"
   }
   ```

### Category Organization

1. Hierarchy
   ```json
   {
     "name": "Technology",
     "subcategories": [
       {
         "name": "Programming",
         "subcategories": [
           {
             "name": "JavaScript",
             "subcategories": []
           }
         ]
       }
     ]
   }
   ```

2. Tags
   ```json
   {
     "name": "Article",
     "tags": [
       "technology",
       "programming",
       "javascript"
     ]
   }
   ```

3. Relationships
   ```json
   {
     "name": "Article",
     "related": [
       {
         "id": "123",
         "type": "article",
         "relationship": "similar"
       }
     ]
   }
   ```

4. Metadata
   ```json
   {
     "name": "Category",
     "description": "Category description",
     "keywords": ["keyword1", "keyword2"],
     "parent": "parent-category",
     "order": 1
   }
   ```

### Search Optimization

1. Keywords
   ```json
   {
     "title": "Article Title",
     "keywords": [
       "main keyword",
       "related keyword",
       "long tail keyword"
     ]
   }
   ```

2. Metadata
   ```json
   {
     "title": "Article Title",
     "description": "Article description",
     "keywords": ["keyword1", "keyword2"],
     "author": "Author Name",
     "date": "2024-03-20"
   }
   ```

3. Structure
   ```json
   {
     "title": "Article Title",
     "sections": [
       {
         "title": "Section 1",
         "content": "Content 1"
       },
       {
         "title": "Section 2",
         "content": "Content 2"
       }
     ]
   }
   ```

4. Links
   ```json
   {
     "title": "Article Title",
     "links": [
       {
         "text": "Link 1",
         "url": "url1"
       },
       {
         "text": "Link 2",
         "url": "url2"
       }
     ]
   }
   ```

### Analytics Usage

1. Content Metrics
   ```json
   {
     "views": 1000,
     "likes": 100,
     "comments": 50,
     "shares": 25
   }
   ```

2. User Metrics
   ```json
   {
     "active": 500,
     "new": 50,
     "returning": 450,
     "engaged": 200
   }
   ```

3. Category Metrics
   ```json
   {
     "total": 10,
     "active": 8,
     "popular": 5,
     "trending": 3
   }
   ```

4. Search Metrics
   ```json
   {
     "total": 1000,
     "successful": 800,
     "failed": 200,
     "popular": ["term1", "term2"]
   }
   ```

## Integration

### API Integration

1. Authentication
   ```javascript
   // Get token
   const token = await fetch('http://localhost:3000/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'user@example.com',
       password: 'password'
     })
   }).then(res => res.json()).then(data => data.token);

   // Use token
   const response = await fetch('http://localhost:3000/api/content', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

2. Content Operations
   ```javascript
   // Create content
   const content = await fetch('http://localhost:3000/api/content', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       title: 'My Article',
       content: 'Article content',
       category: 'news'
     })
   }).then(res => res.json());

   // Get content
   const article = await fetch(`http://localhost:3000/api/content/${content.id}`, {
     headers: { 'Authorization': `Bearer ${token}` }
   }).then(res => res.json());
   ```

3. Search Operations
   ```javascript
   // Search content
   const results = await fetch('http://localhost:3000/api/search?q=news', {
     headers: { 'Authorization': `Bearer ${token}` }
   }).then(res => res.json());

   // Filter results
   const filtered = await fetch('http://localhost:3000/api/search?q=news&category=tech', {
     headers: { 'Authorization': `Bearer ${token}` }
   }).then(res => res.json());
   ```

4. Analytics Operations
   ```javascript
   // Get analytics
   const analytics = await fetch('http://localhost:3000/api/analytics/content', {
     headers: { 'Authorization': `Bearer ${token}` }
   }).then(res => res.json());

   // Get specific metrics
   const metrics = await fetch('http://localhost:3000/api/analytics/content/views', {
     headers: { 'Authorization': `Bearer ${token}` }
   }).then(res => res.json());
   ```

### SDK Integration

1. Installation
   ```bash
   # Install SDK
   npm install content-service-sdk
   ```

2. Initialization
   ```javascript
   // Initialize SDK
   const contentService = new ContentService({
     apiKey: 'your-api-key',
     baseUrl: 'http://localhost:3000'
   });
   ```

3. Content Operations
   ```javascript
   // Create content
   const content = await contentService.content.create({
     title: 'My Article',
     content: 'Article content',
     category: 'news'
   });

   // Get content
   const article = await contentService.content.get(content.id);
   ```

4. Search Operations
   ```javascript
   // Search content
   const results = await contentService.search.query('news');

   // Filter results
   const filtered = await contentService.search.query('news', {
     category: 'tech'
   });
   ```

### Webhook Integration

1. Configuration
   ```javascript
   // Configure webhook
   const webhook = await contentService.webhooks.create({
     url: 'https://your-domain.com/webhook',
     events: ['content.created', 'content.updated']
   });
   ```

2. Event Handling
   ```javascript
   // Handle webhook
   app.post('/webhook', (req, res) => {
     const event = req.body;
     switch (event.type) {
       case 'content.created':
         handleContentCreated(event.data);
         break;
       case 'content.updated':
         handleContentUpdated(event.data);
         break;
     }
     res.status(200).send('OK');
   });
   ```

3. Security
   ```javascript
   // Verify webhook
   app.post('/webhook', (req, res) => {
     const signature = req.headers['x-content-service-signature'];
     const isValid = contentService.webhooks.verify(
       req.body,
       signature
     );
     if (!isValid) {
       return res.status(401).send('Invalid signature');
     }
     // Handle webhook
   });
   ```

4. Retry Logic
   ```javascript
   // Configure retry
   const webhook = await contentService.webhooks.create({
     url: 'https://your-domain.com/webhook',
     events: ['content.created'],
     retry: {
       maxAttempts: 3,
       interval: 1000
     }
   });
   ```

## Security

### Authentication

1. Password Policy
   ```javascript
   // Password requirements
   const passwordPolicy = {
     minLength: 8,
     requireUppercase: true,
     requireLowercase: true,
     requireNumbers: true,
     requireSpecialChars: true
   };
   ```

2. Token Management
   ```javascript
   // Token configuration
   const tokenConfig = {
     expiresIn: '1h',
     refreshToken: true,
     refreshExpiresIn: '7d'
   };
   ```

3. Session Management
   ```javascript
   // Session configuration
   const sessionConfig = {
     maxConcurrent: 5,
     timeout: 3600,
     renewOnActivity: true
   };
   ```

4. MFA
   ```javascript
   // MFA configuration
   const mfaConfig = {
     enabled: true,
     methods: ['totp', 'sms'],
     required: true
   };
   ```

### Authorization

1. Role-Based Access
   ```javascript
   // Role configuration
   const roles = {
     admin: ['*'],
     editor: ['content.*', 'category.*'],
     author: ['content.create', 'content.read'],
     reader: ['content.read']
   };
   ```

2. Permission Management
   ```javascript
   // Permission configuration
   const permissions = {
     'content.create': ['admin', 'editor', 'author'],
     'content.read': ['*'],
     'content.update': ['admin', 'editor'],
     'content.delete': ['admin']
   };
   ```

3. Resource Access
   ```javascript
   // Resource configuration
   const resources = {
     content: {
       owner: 'authorId',
       shared: ['editorId', 'reviewerId']
     }
   };
   ```

4. API Access
   ```javascript
   // API configuration
   const apiConfig = {
     rateLimit: 100,
     ipWhitelist: ['192.168.1.1'],
     requireApiKey: true
   };
   ```

### Data Protection

1. Encryption
   ```javascript
   // Encryption configuration
   const encryptionConfig = {
     algorithm: 'aes-256-gcm',
     keyRotation: 30,
     backupKeys: true
   };
   ```

2. Data Masking
   ```javascript
   // Masking configuration
   const maskingConfig = {
     fields: ['password', 'token', 'key'],
     method: 'partial',
     visibleChars: 4
   };
   ```

3. Data Retention
   ```javascript
   // Retention configuration
   const retentionConfig = {
     content: '7y',
     logs: '1y',
     backups: '3y'
   };
   ```

4. Data Backup
   ```javascript
   // Backup configuration
   const backupConfig = {
     frequency: 'daily',
     retention: '30d',
     encryption: true
   };
   ```

## Maintenance

### Updates

1. Version Management
   ```bash
   # Check version
   npm list content-service

   # Update version
   npm update content-service

   # Install specific version
   npm install content-service@1.0.0
   ```

2. Dependency Updates
   ```bash
   # Check dependencies
   npm outdated

   # Update dependencies
   npm update

   # Audit dependencies
   npm audit
   ```

3. Security Updates
   ```bash
   # Check security
   npm audit

   # Fix security issues
   npm audit fix

   # Force security fixes
   npm audit fix --force
   ```

4. Configuration Updates
   ```bash
   # Update configuration
   npm run config:update

   # Validate configuration
   npm run config:validate

   # Reset configuration
   npm run config:reset
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

2. Logging
   ```bash
   # View logs
   tail -f logs/app.log

   # Search logs
   grep "ERROR" logs/app.log

   # Rotate logs
   logrotate -f /etc/logrotate.d/content
   ```

3. Performance
   ```bash
   # Check CPU
   top -p $(pgrep -f node)

   # Check memory
   free -m

   # Check disk
   df -h
   ```

4. Alerts
   ```bash
   # Check alerts
   curl http://localhost:3000/alerts

   # Configure alerts
   curl -X POST http://localhost:3000/alerts \
     -H "Content-Type: application/json" \
     -d '{"type":"error","threshold":5}'
   ```

### Backup

1. Database Backup
   ```bash
   # Backup MongoDB
   mongodump --out /backup/mongodb

   # Backup Redis
   redis-cli save

   # Backup files
   tar -czf backup.tar.gz /data
   ```

2. Configuration Backup
   ```bash
   # Backup config
   cp .env .env.backup

   # Backup settings
   cp config/* /backup/config

   # Backup certificates
   cp certs/* /backup/certs
   ```

3. Log Backup
   ```bash
   # Backup logs
   tar -czf logs.tar.gz logs/

   # Archive logs
   mv logs/* /archive/logs

   # Clean logs
   find logs/ -type f -mtime +30 -delete
   ```

4. Recovery
   ```bash
   # Restore MongoDB
   mongorestore /backup/mongodb

   # Restore Redis
   redis-cli restore

   # Restore files
   tar -xzf backup.tar.gz
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

### Support

1. Community
   - [GitHub Discussions](https://github.com/your-org/content-service/discussions)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/content-service)
   - [Discord Server](https://discord.gg/content-service)
   - [Reddit Community](https://www.reddit.com/r/content-service)

2. Official
   - [Support Portal](https://support.content-service.com)
   - [Knowledge Base](https://kb.content-service.com)
   - [FAQ](https://faq.content-service.com)
   - [Contact](https://contact.content-service.com)

3. Training
   - [Documentation](https://docs.content-service.com)
   - [Tutorials](https://tutorials.content-service.com)
   - [Webinars](https://webinars.content-service.com)
   - [Certification](https://certification.content-service.com)

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