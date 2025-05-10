import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

async function runMigrations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // Create collections and indexes
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Create articles collection with indexes
    await db.createCollection('articles');
    await db.collection('articles').createIndexes([
      { key: { slug: 1 }, unique: true },
      { key: { title: 'text', content: 'text' } },
      { key: { category: 1 } },
      { key: { createdAt: -1 } }
    ]);

    // Create article_versions collection with indexes
    await db.createCollection('article_versions');
    await db.collection('article_versions').createIndexes([
      { key: { articleId: 1, version: 1 }, unique: true },
      { key: { createdAt: -1 } }
    ]);

    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigrations }; 