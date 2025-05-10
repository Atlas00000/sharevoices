// MongoDB initialization script
// This script will be executed when the MongoDB container starts for the first time

// Create content database
db = db.getSiblingDB('content');

// Create collections
db.createCollection('articles');
db.createCollection('article_versions');
db.createCollection('categories');
db.createCollection('tags');

// Create indexes
db.articles.createIndex({ slug: 1 }, { unique: true });
db.articles.createIndex({ title: 'text', content: 'text' });
db.articles.createIndex({ category: 1 });
db.articles.createIndex({ createdAt: -1 });

db.article_versions.createIndex({ articleId: 1, version: 1 }, { unique: true });
db.article_versions.createIndex({ createdAt: -1 });

// Create interaction database
db = db.getSiblingDB('interaction');

// Create collections
db.createCollection('interactions');
db.createCollection('polls');
db.createCollection('quizzes');

// Create indexes
db.interactions.createIndex({ userId: 1 });
db.interactions.createIndex({ contentId: 1 });
db.interactions.createIndex({ type: 1 });
db.interactions.createIndex({ createdAt: -1 });

// Create admin user for each database
db = db.getSiblingDB('admin');
db.createUser({
  user: 'mongodb-user',
  pwd: process.env.MONGODB_PASSWORD || 'admin123',
  roles: [
    { role: 'readWrite', db: 'content' },
    { role: 'readWrite', db: 'interaction' },
    { role: 'dbAdmin', db: 'content' },
    { role: 'dbAdmin', db: 'interaction' }
  ]
});
