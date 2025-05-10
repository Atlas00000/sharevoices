import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB } from '@sharedvoices/shared/src/database/mongodb';
import { connectRedis } from '@sharedvoices/shared/src/database/redis';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4003;

let mongoConnected = false;
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
    service: 'interaction-service',
    version: process.env.npm_package_version || '1.0.0'
  });
});

async function start() {
  try {
    // Connect to MongoDB
    await connectMongoDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharedvoices');
    mongoConnected = true;
  } catch (err) {
    mongoConnected = false;
    console.error('Failed to connect to MongoDB:', err);
  }

  try {
    // Connect to Redis
    await connectRedis(process.env.REDIS_URL || 'redis://localhost:6379');
    redisConnected = true;
  } catch (err) {
    redisConnected = false;
    console.error('Failed to connect to Redis:', err);
  }

  app.listen(port, () => {
    console.log(`Interaction service listening on port ${port}`);
  });
}

start(); 