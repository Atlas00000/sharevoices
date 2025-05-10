const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sharedvoices'
});

async function runMigrations() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create the uuid-ossp extension if it doesn't exist
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    console.log('Ensured uuid-ossp extension is available');

    // Read and execute migration files
    const migrationsDir = path.join(__dirname, '../db/migrations/postgresql');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order

    console.log(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(migrationSql);
      console.log(`Completed migration: ${file}`);
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    // Close the connection
    await client.end();
  }
}

// Install required packages if not already installed
try {
  const { execSync } = require('child_process');
  console.log('Installing required packages...');
  execSync('npm install --no-save pg', { stdio: 'inherit' });
  console.log('Packages installed.');
} catch (error) {
  console.error('Error installing packages:', error.message);
  process.exit(1);
}

// Run the migrations
runMigrations();
