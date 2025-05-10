const { execSync } = require('child_process');
const fs = require('fs');

// Output file
const outputFile = 'postgres-docker-setup.log';

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
  log('Setting up PostgreSQL using Docker...');
  
  // Check if Docker is installed
  try {
    log('Checking if Docker is installed...');
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' });
    log('Docker version: ' + dockerVersion.trim());
  } catch (err) {
    log('Docker is not installed or not in PATH: ' + err.message);
    log('Please install Docker Desktop from https://www.docker.com/products/docker-desktop/');
    process.exit(1);
  }
  
  // Check if Docker is running
  try {
    log('Checking if Docker is running...');
    execSync('docker info', { stdio: 'ignore' });
    log('Docker is running');
  } catch (err) {
    log('Docker is not running: ' + err.message);
    log('Please start Docker Desktop and try again');
    process.exit(1);
  }
  
  // Check if PostgreSQL container is already running
  try {
    log('Checking if PostgreSQL container is already running...');
    const runningContainers = execSync('docker ps --filter "name=sharedvoices-postgres" --format "{{.Names}}"', { encoding: 'utf8' });
    
    if (runningContainers.trim()) {
      log('PostgreSQL container is already running: ' + runningContainers.trim());
    } else {
      // Check if container exists but is stopped
      const allContainers = execSync('docker ps -a --filter "name=sharedvoices-postgres" --format "{{.Names}}"', { encoding: 'utf8' });
      
      if (allContainers.trim()) {
        log('PostgreSQL container exists but is not running. Starting it...');
        execSync('docker start sharedvoices-postgres', { stdio: 'inherit' });
        log('PostgreSQL container started');
      } else {
        // Create and start a new PostgreSQL container
        log('Creating and starting a new PostgreSQL container...');
        execSync(`
          docker run --name sharedvoices-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sharedvoices -p 5432:5432 -d postgres:latest
        `, { stdio: 'inherit' });
        log('PostgreSQL container created and started');
        
        // Wait for PostgreSQL to be ready
        log('Waiting for PostgreSQL to be ready...');
        execSync('timeout /t 5', { stdio: 'ignore' });
      }
    }
    
    // Verify PostgreSQL is running
    log('Verifying PostgreSQL container is running...');
    const containerStatus = execSync('docker ps --filter "name=sharedvoices-postgres" --format "{{.Status}}"', { encoding: 'utf8' });
    log('PostgreSQL container status: ' + containerStatus.trim());
    
    // Install pg package
    log('Installing pg package...');
    execSync('npm install --no-save pg', { stdio: 'inherit' });
    
    // Test connection to PostgreSQL
    log('Testing connection to PostgreSQL...');
    const pgTest = `
      const { Client } = require('pg');
      const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'sharedvoices',
        connectionTimeoutMillis: 5000
      });
      
      async function testConnection() {
        try {
          await client.connect();
          console.log('Successfully connected to PostgreSQL');
          
          const res = await client.query('SELECT version()');
          console.log('PostgreSQL version:', res.rows[0].version);
          
          await client.end();
        } catch (err) {
          console.error('Error connecting to PostgreSQL:', err.message);
          process.exit(1);
        }
      }
      
      testConnection();
    `;
    
    fs.writeFileSync('pg-test.js', pgTest);
    try {
      execSync('node pg-test.js', { stdio: 'inherit' });
      log('Successfully connected to PostgreSQL');
    } catch (err) {
      log('Failed to connect to PostgreSQL: ' + err.message);
      process.exit(1);
    }
    fs.unlinkSync('pg-test.js');
    
    log('PostgreSQL setup completed successfully');
    log('You can now run the database setup and seed script');
    
  } catch (err) {
    log('Error checking PostgreSQL container: ' + err.message);
    process.exit(1);
  }
} catch (err) {
  log('Error during setup: ' + err.message);
  process.exit(1);
}
