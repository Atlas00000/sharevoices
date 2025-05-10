# Content Service Contribution Guide

## Overview

This guide covers the process for contributing to the Content Service, including development setup, coding standards, and pull request procedures.

## Development Setup

### Prerequisites

1. Required software:
```bash
# Node.js and npm
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0

# MongoDB
mongod --version  # Should be >= 6.0.0

# Redis
redis-cli --version  # Should be >= 7.0.0

# Git
git --version  # Should be >= 2.0.0
```

2. Development environment:
```bash
# Clone repository
git clone https://github.com/your-org/content-service.git
cd content-service

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Local Development

1. Start services:
```bash
# Start MongoDB
mongod --dbpath /data/db

# Start Redis
redis-server

# Start the service
npm run dev
```

2. Run tests:
```bash
# Run all tests
npm test

# Run specific test
npm test -- -t "test name"

# Run with coverage
npm run test:coverage
```

## Coding Standards

### TypeScript Standards

1. Type definitions:
```typescript
// types/article.types.ts
export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type ArticleInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>;
```

2. Error handling:
```typescript
// utils/error-handling.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const handleError = (error: Error) => {
  if (error instanceof ValidationError) {
    return { status: 400, message: error.message };
  }
  return { status: 500, message: 'Internal server error' };
};
```

### Code Style

1. ESLint configuration:
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

2. Prettier configuration:
```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Testing

### Unit Testing

1. Test structure:
```typescript
// tests/unit/services/article.service.test.ts
import { ArticleService } from '../../../src/services/article.service';
import { Article } from '../../../src/models/article.model';

describe('ArticleService', () => {
  let articleService: ArticleService;

  beforeEach(() => {
    articleService = new ArticleService();
  });

  describe('createArticle', () => {
    it('should create a new article', async () => {
      const articleData = {
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        authorId: '123'
      };

      const article = await articleService.createArticle(articleData);

      expect(article).toBeDefined();
      expect(article.title).toBe(articleData.title);
    });
  });
});
```

2. Test utilities:
```typescript
// tests/utils/test-utils.ts
export const createTestUser = async () => {
  return await User.create({
    email: 'test@example.com',
    password: 'password',
    role: 'author'
  });
};

export const createTestArticle = async (userId: string) => {
  return await Article.create({
    title: 'Test Article',
    content: 'Test content',
    category: 'test',
    authorId: userId
  });
};
```

### Integration Testing

1. API tests:
```typescript
// tests/integration/api/article.api.test.ts
import request from 'supertest';
import { app } from '../../../src/app';

describe('Article API', () => {
  beforeEach(async () => {
    await Article.deleteMany({});
  });

  describe('POST /api/content', () => {
    it('should create a new article', async () => {
      const articleData = {
        title: 'Test Article',
        content: 'Test content',
        category: 'test',
        authorId: '123'
      };

      const response = await request(app)
        .post('/api/content')
        .send(articleData)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(articleData.title);
    });
  });
});
```

2. Service tests:
```typescript
// tests/integration/services/article.service.test.ts
describe('ArticleService Integration', () => {
  describe('createArticle', () => {
    it('should create article and update cache', async () => {
      const article = await articleService.createArticle(articleData);
      const cachedArticle = await redis.get(`article:${article.id}`);

      expect(cachedArticle).toBeDefined();
      expect(JSON.parse(cachedArticle)).toMatchObject(articleData);
    });
  });
});
```

## Documentation

### Code Documentation

1. JSDoc comments:
```typescript
// services/article.service.ts
/**
 * Service for managing articles
 */
export class ArticleService {
  /**
   * Creates a new article
   * @param data - Article data
   * @returns Created article
   * @throws {ValidationError} If article data is invalid
   */
  async createArticle(data: ArticleInput): Promise<Article> {
    // Implementation
  }
}
```

2. API documentation:
```typescript
// routes/article.routes.ts
/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleInput'
 *     responses:
 *       201:
 *         description: Article created
 *       400:
 *         description: Invalid input
 */
router.post('/', validateArticle, createArticle);
```

### README Updates

1. Feature documentation:
```markdown
## Features

### Article Management
- Create, read, update, and delete articles
- Article versioning and history
- Article categorization and tagging
- Article search and filtering

### Category Management
- Create and manage categories
- Category hierarchy
- Category-based article organization
```

2. API documentation:
```markdown
## API Reference

### Articles
- `POST /api/content` - Create article
- `GET /api/content` - List articles
- `GET /api/content/:id` - Get article
- `PUT /api/content/:id` - Update article
- `DELETE /api/content/:id` - Delete article

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
```

## Pull Request Process

### Branch Management

1. Branch naming:
```bash
# Feature branch
git checkout -b feature/article-versioning

# Bug fix branch
git checkout -b fix/article-validation

# Documentation branch
git checkout -b docs/api-documentation
```

2. Branch workflow:
```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push changes
git push origin feature/new-feature
```

### Pull Request Template

1. PR description:
```markdown
## Description
[Describe the changes and their purpose]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Documentation
- [ ] README updated
- [ ] API documentation updated
- [ ] Code comments added/updated

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No linting errors
- [ ] No security vulnerabilities
```

2. Review process:
```markdown
## Review Guidelines
1. Code quality and standards
2. Test coverage
3. Documentation updates
4. Security considerations
5. Performance impact
```

## Best Practices

1. Development:
   - Follow TypeScript best practices
   - Write comprehensive tests
   - Document code changes
   - Use meaningful commit messages

2. Code Review:
   - Review for code quality
   - Check test coverage
   - Verify documentation
   - Consider security implications

3. Testing:
   - Write unit tests
   - Add integration tests
   - Test edge cases
   - Verify error handling

4. Documentation:
   - Update README
   - Document API changes
   - Add code comments
   - Update type definitions

## Resources

1. Tools:
   - [TypeScript](https://www.typescriptlang.org)
   - [ESLint](https://eslint.org)
   - [Prettier](https://prettier.io)
   - [Jest](https://jestjs.io)

2. Documentation:
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)
   - [Node.js Documentation](https://nodejs.org/docs)
   - [Express Documentation](https://expressjs.com)
   - [MongoDB Documentation](https://docs.mongodb.com)

3. Community:
   - [TypeScript Community](https://www.typescriptlang.org/community)
   - [Node.js Community](https://nodejs.org/en/community)
   - [Express Community](https://expressjs.com/en/resources/community.html)
   - [MongoDB Community](https://www.mongodb.com/community) 