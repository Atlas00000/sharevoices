import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB } from '@sharedvoices/shared/src/database/mongodb';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

let mongoConnected = false;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'content-service',
    mongoConnected,
  });
});

async function start() {
  try {
    // Connect to MongoDB
    await connectMongoDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharedvoices');
    mongoConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    mongoConnected = false;
    console.error('Failed to connect to MongoDB:', err);
  }

  app.listen(port, () => {
    console.log(`Content service listening on port ${port}`);
  });
}

start(); 