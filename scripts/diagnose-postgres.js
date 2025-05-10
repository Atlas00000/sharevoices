const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a log file
const logFile = path.join(__dirname, 'postgres-diagnosis.log');
const log = (message) => {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
};

// Clear previous log file if it exists
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

// Database connection parameters
const dbParams = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sharedvoices'
};

log('Database connection parameters:');
log(JSON.stringify({
  ...dbParams,
  password: '********' // Mask password for security
}, null, 2));

async function diagnoseDatabase() {
  const client = new Client(dbParams);

  try {
    log('Attempting to connect to PostgreSQL...');
    await client.connect();
    log('✅ Successfully connected to PostgreSQL');

    // Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    log(`PostgreSQL version: ${versionResult.rows[0].version}`);

    // Check if database exists
    const databaseResult = await client.query('SELECT current_database()');
    log(`Current database: ${databaseResult.rows[0].current_database}`);

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    log('Tables in database:');
    if (tablesResult.rows.length === 0) {
      log('No tables found. You need to run migrations first.');
    } else {
      tablesResult.rows.forEach(row => {
        log(`- ${row.table_name}`);
      });
    }

    // Check if uuid-ossp extension is available
    try {
      const extensionResult = await client.query(`
        SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp';
      `);

      if (extensionResult.rows.length > 0) {
        log('✅ uuid-ossp extension is installed');
      } else {
        log('❌ uuid-ossp extension is NOT installed');
      }
    } catch (error) {
      log('Error checking uuid-ossp extension: ' + error.message);
    }

    log('Database diagnosis complete.');
  } catch (error) {
    log('❌ Error connecting to PostgreSQL: ' + error.message);

    // Provide troubleshooting tips
    log('\nTroubleshooting tips:');
    log('1. Make sure PostgreSQL is running');
    log('2. Check if the database exists');
    log('3. Verify username and password');
    log('4. Ensure the PostgreSQL port is correct');
    log('5. Check if PostgreSQL is accepting connections from your application');
  } finally {
    try {
      await client.end();
      log('Database connection closed.');
    } catch (error) {
      // Ignore errors when closing connection
    }
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

// Run the diagnosis
diagnoseDatabase();
