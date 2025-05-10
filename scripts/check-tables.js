const { Client } = require('pg');

// Database connection
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sharedvoices'
});

async function checkTables() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    if (tablesResult.rows.length === 0) {
      console.log('No tables found. You need to run migrations first.');
    }
  } catch (error) {
    console.error('Error checking tables:', error);
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

// Run the check function
checkTables();
