import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectRedis } from '@sharedvoices/shared/src/database/redis';
import { AppDataSource } from './database';
import notificationRouter from './routes/notification';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4004;

let redisConnected = false;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'notification-service',
    version: process.env.npm_package_version || '1.0.0',
    redisConnected
  });
});

// Register notification CRUD routes
app.use('/api/notifications', notificationRouter);

// Error handling
app.use(errorHandler);

async function start() {
  try {
    // Connect to PostgreSQL
    await AppDataSource.initialize();
    console.log('PostgreSQL connected');
    // Connect to Redis
    await connectRedis(process.env.REDIS_URL || 'redis://localhost:6379');
    redisConnected = true;
  } catch (err) {
    redisConnected = false;
    console.error('Failed to connect to DB or Redis:', err);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Notification service listening on port ${port}`);
  });
}

start(); 