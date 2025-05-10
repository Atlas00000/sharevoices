const { DataSource } = require('typeorm');
const path = require('path');

// Import compiled seedAll function
const { seedAll } = require('../db/seeds/postgresql/seed.js');

// Database connection options (match .env.example)
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sharedvoices',
  entities: [
    path.join(__dirname, '../db/schemas/postgresql/*.js'),
    path.join(__dirname, '../server/services/notification/src/models/*.js'),
  ],
  synchronize: false,
  logging: false,
});

async function runSeed() {
  try {
    await dataSource.initialize();
    await seedAll(dataSource);
    await dataSource.destroy();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

runSeed(); 