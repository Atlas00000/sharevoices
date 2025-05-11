import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import articleRoutes from './routes/articleRoutes';
import userRoutes from './routes/userRoutes';
import { initializeScheduledArticles } from './utils/scheduler';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharedvoices')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Initialize scheduled articles
    initializeScheduledArticles()
      .then(() => console.log('Scheduled articles initialized'))
      .catch(error => console.error('Error initializing scheduled articles:', error));
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 