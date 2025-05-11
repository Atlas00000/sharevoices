import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { trackRequestMetrics, trackErrors, trackArticleViews, trackUserActivity } from './middleware/analytics';
import dotenv from 'dotenv';
import path from 'path';
import articleRoutes from './routes/articleRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { initializeScheduledArticles } from './utils/scheduler';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Analytics middleware
app.use(trackRequestMetrics);
app.use(trackArticleViews);
app.use(trackUserActivity);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(trackErrors);
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', config.mongoUri);
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // Initialize scheduled articles
    initializeScheduledArticles()
      .then(() => console.log('Scheduled articles initialized'))
      .catch(error => console.error('Error initializing scheduled articles:', error));

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log('Available routes:');
      console.log('- /api/auth');
      console.log('- /api/users');
      console.log('- /api/articles');
      console.log('- /api/analytics');
      console.log('- /health');
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  });

export default app; 