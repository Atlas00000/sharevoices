import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Article } from '../models/article.model';
import { ArticleVersion } from '../models/article-version.model';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Article.deleteMany({});
    await ArticleVersion.deleteMany({});
    logger.info('Cleared existing data');

    // Create sample articles
    const articles = [
      {
        title: 'Welcome to Shared Voices',
        slug: 'welcome-to-shared-voices',
        content: 'Welcome to our platform where diverse voices come together to share stories and perspectives.',
        category: 'announcement',
        status: 'published',
        author: 'system',
        tags: ['welcome', 'platform'],
        metadata: {
          readTime: 2,
          featured: true
        }
      },
      {
        title: 'Getting Started Guide',
        slug: 'getting-started-guide',
        content: 'Learn how to make the most of Shared Voices platform with our comprehensive guide.',
        category: 'guide',
        status: 'published',
        author: 'system',
        tags: ['guide', 'tutorial'],
        metadata: {
          readTime: 5,
          featured: false
        }
      }
    ];

    // Insert articles
    const createdArticles = await Article.insertMany(articles);
    logger.info(`Created ${createdArticles.length} sample articles`);

    // Create versions for each article
    for (const article of createdArticles) {
      const version = new ArticleVersion({
        articleId: article._id,
        version: 1,
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags,
        metadata: article.metadata,
        author: article.author
      });
      await version.save();
    }
    logger.info('Created initial versions for all articles');

    logger.info('Seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase }; 