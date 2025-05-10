const { execSync } = require('child_process');
const fs = require('fs');

// Output file
const outputFile = 'postgres-check-result.txt';

// Function to write to both console and file
function log(message) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n');
}

// Clear previous output file if it exists
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

try {
  log('Checking if PostgreSQL is running...');
  
  // Try to connect to PostgreSQL using psql
  try {
    log('Attempting to run psql command...');
    const psqlOutput = execSync('psql -V', { encoding: 'utf8' });
    log('psql version: ' + psqlOutput.trim());
  } catch (err) {
    log('psql command failed: ' + err.message);
    log('psql may not be installed or not in PATH');
  }
  
  // Try to connect using pg_isready
  try {
    log('Attempting to run pg_isready command...');
    const pgIsReadyOutput = execSync('pg_isready', { encoding: 'utf8' });
    log('pg_isready result: ' + pgIsReadyOutput.trim());
  } catch (err) {
    log('pg_isready command failed: ' + err.message);
    log('PostgreSQL may not be running or pg_isready not in PATH');
  }
  
  // Check if Docker is running PostgreSQL
  try {
    log('Checking if PostgreSQL is running in Docker...');
    const dockerOutput = execSync('docker ps | findstr postgres', { encoding: 'utf8' });
    if (dockerOutput.trim()) {
      log('PostgreSQL container found: ' + dockerOutput.trim());
    } else {
      log('No PostgreSQL container found running in Docker');
    }
  } catch (err) {
    log('Docker check failed: ' + err.message);
    log('Docker may not be installed or not running');
  }
  
  // Try to install pg package
  try {
    log('Installing pg package...');
    execSync('npm install --no-save pg', { stdio: 'inherit' });
    log('pg package installed successfully');
    
    // Try to connect using pg
    log('Attempting to connect to PostgreSQL using pg...');
    const pgCheck = `
      const { Client } = require('pg');
      const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'postgres',
        connectionTimeoutMillis: 5000
      });
      
      client.connect()
        .then(() => {
          console.log('Successfully connected to PostgreSQL');
          return client.query('SELECT version()');
        })
        .then(res => {
          console.log('PostgreSQL version:', res.rows[0].version);
          return client.end();
        })
        .catch(err => {
          console.error('Error connecting to PostgreSQL:', err.message);
          process.exit(1);
        });
    `;
    
    fs.writeFileSync('pg-check.js', pgCheck);
    try {
      execSync('node pg-check.js', { stdio: 'inherit' });
      log('Successfully connected to PostgreSQL using pg');
    } catch (err) {
      log('Failed to connect to PostgreSQL using pg: ' + err.message);
    }
    fs.unlinkSync('pg-check.js');
  } catch (err) {
    log('Failed to install pg package: ' + err.message);
  }
  
  log('Check completed. Results written to ' + outputFile);
} catch (err) {
  log('Error during check: ' + err.message);
}
