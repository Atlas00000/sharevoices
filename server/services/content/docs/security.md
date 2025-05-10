# Content Service Security Guide

## Overview

This guide covers security best practices, authentication, authorization, and data protection for the Content Service.

## Authentication

### JWT Authentication

1. JWT configuration:
```typescript
// config/jwt.config.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '1h',
  algorithm: 'HS256'
};
```

2. JWT middleware:
```typescript
// middleware/jwt.middleware.ts
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### OAuth2 Authentication

1. OAuth2 configuration:
```typescript
// config/oauth.config.ts
export const oauthConfig = {
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_CALLBACK_URL,
  scope: ['profile', 'email']
};
```

2. OAuth2 routes:
```typescript
// routes/oauth.routes.ts
import passport from 'passport';
import { oauthConfig } from '../config/oauth.config';

router.get('/auth/google',
  passport.authenticate('google', { scope: oauthConfig.scope })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);
```

## Authorization

### Role-Based Access Control

1. Role definitions:
```typescript
// models/role.model.ts
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  READER = 'reader'
}

export interface Role {
  name: UserRole;
  permissions: string[];
}
```

2. Role middleware:
```typescript
// middleware/role.middleware.ts
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
```

### Permission-Based Access Control

1. Permission definitions:
```typescript
// models/permission.model.ts
export enum Permission {
  CREATE_ARTICLE = 'create:article',
  READ_ARTICLE = 'read:article',
  UPDATE_ARTICLE = 'update:article',
  DELETE_ARTICLE = 'delete:article',
  MANAGE_USERS = 'manage:users'
}
```

2. Permission middleware:
```typescript
// middleware/permission.middleware.ts
export const requirePermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const hasPermission = permissions.every(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
```

## Data Protection

### Input Validation

1. Request validation:
```typescript
// middleware/validation.middleware.ts
import { body, validationResult } from 'express-validator';

export const validateArticle = [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('content').trim().isLength({ min: 10 }),
  body('category').isIn(['news', 'blog', 'tutorial']),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

2. Schema validation:
```typescript
// models/article.model.ts
import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },
  category: {
    type: String,
    required: true,
    enum: ['news', 'blog', 'tutorial']
  }
});
```

### Data Encryption

1. Field encryption:
```typescript
// utils/encryption.ts
import crypto from 'crypto';

export const encryptField = (value: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
};

export const decryptField = (value: string): string => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return decipher.update(value, 'hex', 'utf8') + decipher.final('utf8');
};
```

2. Password hashing:
```typescript
// utils/password.ts
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

## API Security

### Rate Limiting

1. Rate limit configuration:
```typescript
// config/rate-limit.config.ts
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
};
```

2. Rate limit middleware:
```typescript
// middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '../config/rate-limit.config';

export const rateLimiter = rateLimit(rateLimitConfig);
```

### CORS Configuration

1. CORS setup:
```typescript
// config/cors.config.ts
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
```

2. CORS middleware:
```typescript
// middleware/cors.middleware.ts
import cors from 'cors';
import { corsConfig } from '../config/cors.config';

export const corsMiddleware = cors(corsConfig);
```

## Security Headers

1. Helmet configuration:
```typescript
// config/helmet.config.ts
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com']
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
};
```

2. Helmet middleware:
```typescript
// middleware/helmet.middleware.ts
import helmet from 'helmet';
import { helmetConfig } from '../config/helmet.config';

export const helmetMiddleware = helmet(helmetConfig);
```

## Best Practices

1. Authentication:
   - Use strong password policies
   - Implement MFA
   - Use secure session management
   - Implement account lockout

2. Authorization:
   - Follow principle of least privilege
   - Implement role-based access control
   - Use permission-based access control
   - Regular permission audits

3. Data Protection:
   - Encrypt sensitive data
   - Implement input validation
   - Use parameterized queries
   - Regular security audits

4. API Security:
   - Use HTTPS
   - Implement rate limiting
   - Configure CORS properly
   - Use security headers

## Resources

1. Tools:
   - [OWASP ZAP](https://www.zaproxy.org)
   - [SonarQube](https://www.sonarqube.org)
   - [Snyk](https://snyk.io)
   - [Dependency Check](https://owasp.org/www-project-dependency-check)

2. Documentation:
   - [OWASP Top 10](https://owasp.org/www-project-top-ten)
   - [Node.js Security](https://nodejs.org/en/docs/guides/security)
   - [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
   - [MongoDB Security](https://docs.mongodb.com/manual/security)

3. Community:
   - [OWASP](https://owasp.org)
   - [Node.js Security WG](https://github.com/nodejs/security-wg)
   - [Express Security](https://github.com/expressjs/express/wiki/Security)
   - [MongoDB Security](https://www.mongodb.com/community/forums/c/security) 