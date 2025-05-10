import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { AppDataSource } from './database';
import { User } from './entities/User';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRouter);

// CRUD endpoints for User
app.get('/api/users', async (req, res, next) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.get('/api/users/:id', async (req, res, next) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.post('/api/users', async (req, res, next) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = userRepo.create(req.body);
    await userRepo.save(user);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

app.put('/api/users/:id', async (req, res, next) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOneBy({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    userRepo.merge(user, req.body);
    await userRepo.save(user);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/users/:id', async (req, res, next) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await userRepo.remove(user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Error handling
app.use(errorHandler);

// Start server
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connection established');
    app.listen(port, () => {
      logger.info(`User service listening on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error('Error during Data Source initialization:', error);
    process.exit(1);
  }); 