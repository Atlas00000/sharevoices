import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectRedis } from '@sharedvoices/shared/src/database/redis';

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

async function start() {
  try {
    // Connect to Redis
    await connectRedis(process.env.REDIS_URL || 'redis://localhost:6379');
    redisConnected = true;
  } catch (err) {
    redisConnected = false;
    console.error('Failed to connect to Redis:', err);
  }

  app.listen(port, () => {
    console.log(`Notification service listening on port ${port}`);
  });
}

start(); 