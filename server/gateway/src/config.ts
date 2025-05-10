import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.API_GATEWAY_PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // CORS configuration
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:8080'],
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '1d'
  },
  
  // Service URLs
  services: {
    content: {
      url: process.env.CONTENT_SERVICE_URL || 'http://content-service:3002'
    },
    user: {
      url: process.env.USER_SERVICE_URL || 'http://user-service:3001'
    },
    interaction: {
      url: process.env.INTERACTION_SERVICE_URL || 'http://interaction-service:3003'
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004'
    }
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100
  }
};
