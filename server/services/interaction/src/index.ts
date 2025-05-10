import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB } from '../../../../shared/database/mongodb';
import { Interaction } from '../../../../../db/schemas/mongodb/Interaction';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4003;

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

// CRUD endpoints for Interaction
app.get('/api/interactions', async (req, res, next) => {
  try {
    const interactions = await Interaction.find().sort({ createdAt: -1 });
    res.json(interactions);
  } catch (err) {
    next(err);
  }
});

app.get('/api/interactions/:id', async (req, res, next) => {
  try {
    const interaction = await Interaction.findById(req.params.id);
    if (!interaction) return res.status(404).json({ message: 'Interaction not found' });
    res.json(interaction);
  } catch (err) {
    next(err);
  }
});

app.post('/api/interactions', async (req, res, next) => {
  try {
    const interaction = new Interaction(req.body);
    await interaction.save();
    res.status(201).json(interaction);
  } catch (err) {
    next(err);
  }
});

app.put('/api/interactions/:id', async (req, res, next) => {
  try {
    const interaction = await Interaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!interaction) return res.status(404).json({ message: 'Interaction not found' });
    res.json(interaction);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/interactions/:id', async (req, res, next) => {
  try {
    const interaction = await Interaction.findByIdAndDelete(req.params.id);
    if (!interaction) return res.status(404).json({ message: 'Interaction not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Error handling middleware placeholder
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: err.message });
});

async function start() {
  await connectMongoDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharedvoices');
  app.listen(port, () => {
    console.log(`Interaction service listening on port ${port}`);
  });
}

start(); 