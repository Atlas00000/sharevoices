# Content Service Development Guide

## Getting Started

### Prerequisites

- Node.js 16.x or later
- MongoDB 4.4 or later
- Redis 6.x or later
- Elasticsearch 7.x or later
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/sharedvoices.git
cd sharedvoices/server/services/content
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start development services:
```bash
docker-compose up -d
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validation/      # Request validation
└── app.ts           # Application entry point
```

## Development Workflow

### Branching Strategy

1. Main branches:
   - `main`: Production-ready code
   - `develop`: Development branch
   - `feature/*`: Feature branches
   - `bugfix/*`: Bug fix branches
   - `release/*`: Release preparation branches

2. Branch naming:
   - Feature: `feature/description`
   - Bug fix: `bugfix/issue-number`
   - Release: `release/version`

### Code Style

1. Follow ESLint configuration:
```bash
npm run lint
```

2. Format code with Prettier:
```bash
npm run format
```

3. TypeScript configuration:
```json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Testing

1. Unit tests:
```bash
npm run test:unit
```

2. Integration tests:
```bash
npm run test:integration
```

3. E2E tests:
```bash
npm run test:e2e
```

4. Test coverage:
```bash
npm run test:coverage
```

### API Development

1. Create new endpoint:
```typescript
// routes/article.routes.ts
router.post('/articles', articleController.createArticle);

// controllers/article.controller.ts
export const createArticle = async (req: Request, res: Response) => {
  try {
    const article = await articleService.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

2. Add validation:
```typescript
// validation/article.validation.ts
export const createArticleSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string())
});
```

3. Add service logic:
```typescript
// services/article.service.ts
export const createArticle = async (data: ArticleInput) => {
  const article = new Article(data);
  await article.save();
  return article;
};
```

### Database Operations

1. Create model:
```typescript
// models/article.model.ts
const articleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  authorId: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

2. Create indexes:
```typescript
articleSchema.index({ title: 'text', content: 'text' });
articleSchema.index({ category: 1 });
articleSchema.index({ authorId: 1 });
```

### Caching

1. Redis caching:
```typescript
// services/cache.service.ts
export const getCachedArticle = async (id: string) => {
  const cached = await redis.get(`article:${id}`);
  if (cached) return JSON.parse(cached);
  
  const article = await Article.findById(id);
  await redis.set(`article:${id}`, JSON.stringify(article), 'EX', 3600);
  return article;
};
```

### Error Handling

1. Custom error classes:
```typescript
// utils/errors.ts
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

2. Error middleware:
```typescript
// middleware/error.middleware.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal server error' });
};
```

### Logging

1. Configure logger:
```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. Use logger:
```typescript
logger.info('Article created', { articleId });
logger.error('Failed to create article', { error });
```

### Documentation

1. API documentation:
```typescript
/**
 * @api {post} /api/content Create Article
 * @apiName CreateArticle
 * @apiGroup Article
 * @apiVersion 1.0.0
 *
 * @apiParam {String} title Article title
 * @apiParam {String} content Article content
 * @apiParam {String} category Article category
 * @apiParam {String[]} tags Article tags
 *
 * @apiSuccess {Object} article Created article
 */
```

2. Code documentation:
```typescript
/**
 * Creates a new article
 * @param {ArticleInput} data - Article data
 * @returns {Promise<Article>} Created article
 * @throws {ValidationError} If data is invalid
 */
```

### Performance Optimization

1. Database queries:
```typescript
// Use lean() for read-only operations
const articles = await Article.find().lean();

// Use select() to limit fields
const articles = await Article.find().select('title content');
```

2. Caching strategies:
```typescript
// Cache frequently accessed data
const popularArticles = await redis.get('popular:articles');
if (!popularArticles) {
  const articles = await Article.find().sort('-viewCount').limit(10);
  await redis.set('popular:articles', JSON.stringify(articles), 'EX', 3600);
}
```

### Security

1. Input validation:
```typescript
// middleware/validation.middleware.ts
export const validateRequest = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};
```

2. Rate limiting:
```typescript
// middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Debugging

1. Debug configuration:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Program",
      "program": "${workspaceFolder}/src/app.ts"
    }
  ]
}
```

2. Logging levels:
```typescript
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

## Best Practices

1. Code organization:
   - Keep files small and focused
   - Use meaningful names
   - Follow single responsibility principle
   - Use dependency injection

2. Error handling:
   - Use custom error classes
   - Handle errors at appropriate levels
   - Log errors with context
   - Return meaningful error messages

3. Testing:
   - Write tests for new features
   - Maintain test coverage
   - Use test doubles appropriately
   - Test edge cases

4. Performance:
   - Optimize database queries
   - Use caching effectively
   - Implement pagination
   - Monitor memory usage

5. Security:
   - Validate all input
   - Sanitize output
   - Use parameterized queries
   - Implement rate limiting

## Troubleshooting

1. Common issues:
   - Database connection issues
   - Redis connection issues
   - Elasticsearch indexing issues
   - Memory leaks

2. Debugging tools:
   - Node.js debugger
   - MongoDB Compass
   - Redis Commander
   - Elasticsearch Head

3. Performance profiling:
   - Node.js profiler
   - MongoDB explain
   - Redis slowlog
   - Elasticsearch profile API

## Resources

1. Documentation:
   - [Node.js](https://nodejs.org/docs)
   - [MongoDB](https://docs.mongodb.com)
   - [Redis](https://redis.io/documentation)
   - [Elasticsearch](https://www.elastic.co/guide)

2. Tools:
   - [Postman](https://www.postman.com)
   - [MongoDB Compass](https://www.mongodb.com/products/compass)
   - [Redis Commander](https://github.com/joeferner/redis-commander)
   - [Elasticsearch Head](https://github.com/mobz/elasticsearch-head)

3. Community:
   - [Stack Overflow](https://stackoverflow.com)
   - [GitHub Issues](https://github.com/your-org/sharedvoices/issues)
   - [Slack Channel](https://your-org.slack.com) 