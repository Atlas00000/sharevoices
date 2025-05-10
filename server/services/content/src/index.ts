import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { connectMongoDB } from '../../../../shared/database/mongodb';
import { Article } from '../../../../../db/schemas/mongodb/Article';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRouter);

// CRUD endpoints for Article
app.get('/api/articles', async (req, res, next) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    next(err);
  }
});

app.get('/api/articles/:id', async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    next(err);
  }
});

app.post('/api/articles', async (req, res, next) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
});

app.put('/api/articles/:id', async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/articles/:id', async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Error handling
app.use(errorHandler);

async function start() {
  await connectMongoDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharedvoices');
  app.listen(port, () => {
    logger.info(`Content service listening on port ${port}`);
  });
}

start();