const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a log file
const logFile = path.join(__dirname, 'postgres-setup-seed.log');
const log = (message) => {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
};

// Clear previous log file if it exists
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

// Database connection
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres', // Connect to default postgres database first
  connectionTimeoutMillis: 5000
});

async function setupAndSeedDatabase() {
  try {
    // Connect to the database
    await client.connect();
    log('Connected to PostgreSQL');

    // Check if sharedvoices database exists
    const dbResult = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = 'sharedvoices'
    `);

    if (dbResult.rows.length === 0) {
      log('Creating sharedvoices database...');
      await client.query(`CREATE DATABASE sharedvoices`);
      log('sharedvoices database created');
    } else {
      log('sharedvoices database already exists');
    }

    // Close connection to postgres database
    await client.end();
    log('Reconnecting to sharedvoices database...');

    // Connect to sharedvoices database
    const sharedvoicesClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'sharedvoices',
      connectionTimeoutMillis: 5000
    });

    await sharedvoicesClient.connect();
    log('Connected to sharedvoices database');

    // Step 1: Create the uuid-ossp extension if it doesn't exist
    await sharedvoicesClient.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    log('Ensured uuid-ossp extension is available');

    // Step 2: Check if tables exist
    const tablesResult = await sharedvoicesClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    log('Tables in database:');
    const existingTables = tablesResult.rows.map(row => row.table_name);
    existingTables.forEach(table => {
      log(`- ${table}`);
    });

    // Step 3: Run migrations if tables don't exist
    if (!existingTables.includes('users') || !existingTables.includes('profiles') || !existingTables.includes('notifications')) {
      log('Required tables missing. Running migrations...');

      // Read and execute migration files
      const migrationsDir = path.join(__dirname, '../db/migrations/postgresql');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort to ensure migrations run in order

      log(`Found ${migrationFiles.length} migration files`);

      for (const file of migrationFiles) {
        log(`Running migration: ${file}`);
        const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await sharedvoicesClient.query(migrationSql);
        log(`Completed migration: ${file}`);
      }

      log('All migrations completed successfully!');
    } else {
      log('Required tables already exist. Skipping migrations.');
    }

    // Step 4: Seed the database
    log('Seeding database...');

    // Check if users already exist
    const usersCount = await sharedvoicesClient.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count) > 0) {
      log('Users already exist in the database. Skipping user seeding.');
    } else {
      // Create profiles
      log('Creating profiles...');
      const profilesResult = await sharedvoicesClient.query(`
        INSERT INTO profiles (id, "firstName", "lastName", bio, "avatarUrl", "createdAt", "updatedAt")
        VALUES
          (uuid_generate_v4(), 'Admin', 'User', 'System Administrator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', NOW(), NOW()),
          (uuid_generate_v4(), 'Editor', 'User', 'Content Editor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor', NOW(), NOW()),
          (uuid_generate_v4(), 'Regular', 'User', 'Regular User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user', NOW(), NOW())
        RETURNING id;
      `);

      const profileIds = profilesResult.rows.map(row => row.id);
      log(`Created ${profileIds.length} profiles`);

      // Create users (with plain text passwords for simplicity)
      log('Creating users...');
      const usersResult = await sharedvoicesClient.query(`
        INSERT INTO users (id, email, password, role, "isEmailVerified", "profileId", "createdAt", "updatedAt")
        VALUES
          (uuid_generate_v4(), 'admin@sharedvoices.com', 'Admin123!', 'admin', true, $1, NOW(), NOW()),
          (uuid_generate_v4(), 'editor@sharedvoices.com', 'Editor123!', 'editor', true, $2, NOW(), NOW()),
          (uuid_generate_v4(), 'user@sharedvoices.com', 'User123!', 'user', true, $3, NOW(), NOW())
        RETURNING id;
      `, [profileIds[0], profileIds[1], profileIds[2]]);

      const userIds = usersResult.rows.map(row => row.id);
      log(`Created ${userIds.length} users`);
    }

    // Check if notifications already exist
    const notificationsCount = await sharedvoicesClient.query('SELECT COUNT(*) FROM notifications');
    if (parseInt(notificationsCount.rows[0].count) > 0) {
      log('Notifications already exist in the database. Skipping notification seeding.');
    } else {
      // Get user IDs if we didn't create them
      const userIds = (await sharedvoicesClient.query('SELECT id FROM users LIMIT 3')).rows.map(row => row.id);

      // Create notifications
      log('Creating notifications...');
      const notificationsValues = [];
      const notificationsParams = [];

      let paramIndex = 1;
      userIds.forEach(userId => {
        notificationsValues.push(`(uuid_generate_v4(), $${paramIndex}, 'welcome', 'Welcome to Shared Voices!', false, NOW(), NOW())`);
        notificationsParams.push(userId);
        paramIndex++;

        notificationsValues.push(`(uuid_generate_v4(), $${paramIndex}, 'reminder', 'Don''t forget to check out new articles!', false, NOW(), NOW())`);
        notificationsParams.push(userId);
        paramIndex++;
      });

      const notificationsResult = await sharedvoicesClient.query(`
        INSERT INTO notifications (id, "userId", type, message, "isRead", "createdAt", "updatedAt")
        VALUES ${notificationsValues.join(', ')}
        RETURNING id;
      `, notificationsParams);

      log(`Created ${notificationsResult.rowCount} notifications`);
    }

    log('Database setup and seeding complete!');
  } catch (error) {
    log('Error setting up and seeding database: ' + error.message);
    log(error.stack || '');
  } finally {
    // Close the connection
    try {
      if (client && client._connected) {
        await client.end();
      }
      if (sharedvoicesClient && sharedvoicesClient._connected) {
        await sharedvoicesClient.end();
      }
    } catch (err) {
      log('Error closing database connections: ' + err.message);
    }
    log('Database connections closed.');
  }
}

// Install required packages if not already installed
try {
  const { execSync } = require('child_process');
  log('Installing required packages...');
  execSync('npm install --no-save pg', { stdio: 'inherit' });
  log('Packages installed.');
} catch (error) {
  log('Error installing packages: ' + error.message);
  process.exit(1);
}

// Run the setup and seed function
log('Starting database setup and seeding...');
setupAndSeedDatabase().then(() => {
  log('Script execution completed. Check the log file for details: ' + logFile);
}).catch(err => {
  log('Unhandled error: ' + err.message);
  log(err.stack || '');
});
