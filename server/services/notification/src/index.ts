import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectPostgreSQL } from '@sharedvoices/shared/src/database/postgresql';
import { connectRedis } from '@sharedvoices/shared/src/database/redis';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

let postgresConnected = false;
let redisConnected = false;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
    postgresConnected,
    redisConnected,
  });
});

async function start() {
  try {
    // Connect to PostgreSQL
    await connectPostgreSQL({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'sharedvoices',
    });
    postgresConnected = true;
    console.log('Connected to PostgreSQL');
  } catch (err) {
    postgresConnected = false;
    console.error('Failed to connect to PostgreSQL:', err);
  }

  try {
    // Connect to Redis for job queues
    await connectRedis(process.env.REDIS_URL || 'redis://localhost:6379');
    redisConnected = true;
    console.log('Connected to Redis');
  } catch (err) {
    redisConnected = false;
    console.error('Failed to connect to Redis:', err);
  }

  app.listen(port, () => {
    console.log(`Notification service listening on port ${port}`);
  });
}

start(); 