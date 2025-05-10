import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectPostgreSQL } from '@sharedvoices/shared/src/database/postgresql';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

let postgresConnected = false;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    postgresConnected,
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

  app.listen(port, () => {
    console.log(`User service listening on port ${port}`);
  });
}

start(); 