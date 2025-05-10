# Content Service Testing Guide

## Overview

This guide covers testing strategies, tools, and best practices for the Content Service.

## Testing Types

### Unit Testing

1. Article service tests:
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
      expect(article.content).toBe(articleData.content);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = {
        title: '',
        content: ''
      };

      await expect(articleService.createArticle(invalidData))
        .rejects
        .toThrow('Invalid article data');
    });
  });
});
```

2. Category service tests:
```typescript
// tests/unit/services/category.service.test.ts
describe('CategoryService', () => {
  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description'
      };

      const category = await categoryService.createCategory(categoryData);

      expect(category).toBeDefined();
      expect(category.name).toBe(categoryData.name);
    });
  });
});
```

### Integration Testing

1. Article API tests:
```typescript
// tests/integration/api/article.api.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { Article } from '../../../src/models/article.model';

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

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/content')
        .send({});

      expect(response.status).toBe(401);
    });
  });
});
```

2. Category API tests:
```typescript
// tests/integration/api/category.api.test.ts
describe('Category API', () => {
  describe('GET /api/content/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/content/categories')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
```

### End-to-End Testing

1. Article flow tests:
```typescript
// tests/e2e/article.flow.test.ts
import { test, expect } from '@playwright/test';

test('should create and publish article', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');

  // Create article
  await page.goto('/articles/new');
  await page.fill('[data-testid="title"]', 'Test Article');
  await page.fill('[data-testid="content"]', 'Test content');
  await page.selectOption('[data-testid="category"]', 'test');
  await page.click('[data-testid="save-button"]');

  // Publish article
  await page.click('[data-testid="publish-button"]');
  await expect(page.locator('[data-testid="status"]')).toHaveText('Published');
});
```

2. Category flow tests:
```typescript
// tests/e2e/category.flow.test.ts
test('should create and manage category', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'admin@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');

  // Create category
  await page.goto('/categories/new');
  await page.fill('[data-testid="name"]', 'Test Category');
  await page.fill('[data-testid="description"]', 'Test description');
  await page.click('[data-testid="save-button"]');

  // Verify category
  await expect(page.locator('[data-testid="category-name"]')).toHaveText('Test Category');
});
```

## Test Setup

### Test Environment

1. Environment configuration:
```typescript
// tests/setup/test-environment.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
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

### Mocking

1. Service mocks:
```typescript
// tests/mocks/service.mocks.ts
jest.mock('../../../src/services/cache.service', () => ({
  CacheService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }))
}));
```

2. External service mocks:
```typescript
// tests/mocks/external.mocks.ts
jest.mock('../../../src/services/elasticsearch.service', () => ({
  ElasticsearchService: jest.fn().mockImplementation(() => ({
    index: jest.fn(),
    search: jest.fn(),
    delete: jest.fn()
  }))
}));
```

## Test Coverage

### Coverage Configuration

1. Jest configuration:
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

2. Coverage reports:
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
npm run test:coverage:report
```

### Coverage Analysis

1. Coverage thresholds:
```typescript
// tests/coverage/coverage-thresholds.ts
export const coverageThresholds = {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/services': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
};
```

2. Coverage reporting:
```typescript
// tests/coverage/coverage-reporter.ts
export const generateCoverageReport = async () => {
  const coverage = await getCoverage();
  const report = {
    summary: {
      total: coverage.total,
      covered: coverage.covered,
      percentage: coverage.percentage
    },
    details: coverage.details
  };

  await writeCoverageReport(report);
};
```

## Performance Testing

### Load Testing

1. Load test configuration:
```typescript
// tests/performance/load-test.config.ts
export const loadTestConfig = {
  target: 'http://localhost:3001',
  phases: [
    { duration: 60, arrivalRate: 5 },
    { duration: 120, arrivalRate: 10 },
    { duration: 60, arrivalRate: 5 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
};
```

2. Load test scenarios:
```typescript
// tests/performance/load-test.scenarios.ts
export const scenarios = {
  articleCreation: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 10 },
      { duration: '1m', target: 10 },
      { duration: '30s', target: 0 }
    ],
    gracefulRampDown: '30s'
  }
};
```

### Stress Testing

1. Stress test configuration:
```typescript
// tests/performance/stress-test.config.ts
export const stressTestConfig = {
  target: 'http://localhost:3001',
  phases: [
    { duration: 60, arrivalRate: 20 },
    { duration: 120, arrivalRate: 40 },
    { duration: 60, arrivalRate: 20 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05']
  }
};
```

2. Stress test scenarios:
```typescript
// tests/performance/stress-test.scenarios.ts
export const scenarios = {
  articleSearch: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 50 },
      { duration: '2m', target: 50 },
      { duration: '1m', target: 0 }
    ],
    gracefulRampDown: '30s'
  }
};
```

## Best Practices

1. Test Organization:
   - Group tests by feature
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)
   - Keep tests independent

2. Test Data:
   - Use test factories
   - Clean up test data
   - Use meaningful test data
   - Avoid test data dependencies

3. Test Coverage:
   - Aim for high coverage
   - Focus on critical paths
   - Test edge cases
   - Test error scenarios

4. Performance Testing:
   - Test under realistic conditions
   - Monitor system resources
   - Set realistic thresholds
   - Document performance requirements

## Resources

1. Tools:
   - [Jest](https://jestjs.io)
   - [Supertest](https://github.com/visionmedia/supertest)
   - [Playwright](https://playwright.dev)
   - [k6](https://k6.io)

2. Documentation:
   - [Jest Documentation](https://jestjs.io/docs/getting-started)
   - [Supertest Documentation](https://github.com/visionmedia/supertest#readme)
   - [Playwright Documentation](https://playwright.dev/docs/intro)
   - [k6 Documentation](https://k6.io/docs)

3. Community:
   - [Jest GitHub](https://github.com/facebook/jest)
   - [Playwright GitHub](https://github.com/microsoft/playwright)
   - [k6 GitHub](https://github.com/grafana/k6)
   - [Testing Stack Overflow](https://stackoverflow.com/questions/tagged/testing) 