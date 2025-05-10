const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Database configuration
const POSTGRES_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || '5432',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'sharedvoices'
};

const MONGODB_CONFIG = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sharedvoices'
};

// Function to run shell commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Function to create PostgreSQL database
function createPostgresDatabase() {
  const { host, port, user, password, database } = POSTGRES_CONFIG;
  
  // Create database if it doesn't exist
  const createDbCommand = `psql -h ${host} -p ${port} -U ${user} -c "CREATE DATABASE ${database} WITH OWNER = ${user} ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8' TEMPLATE template0;" postgres`;
  
  try {
    runCommand(createDbCommand);
    console.log('✅ PostgreSQL database created or already exists');
  } catch (error) {
    console.log('Database might already exist, continuing...');
  }
}

// Function to run TypeORM migrations
function runMigrations(serviceName) {
  const servicePath = path.join(__dirname, '..', 'server', 'services', serviceName);
  
  if (fs.existsSync(servicePath)) {
    console.log(`\n🚀 Running migrations for ${serviceName} service...`);
    
    // Run TypeORM migrations
    const migrationCommand = `cd ${servicePath} && npx typeorm-ts-node-commonjs migration:run -d src/config/database.ts`;
    if (runCommand(migrationCommand)) {
      console.log(`✅ Migrations completed for ${serviceName}`);
    }
  }
}

// Function to run seed scripts
function runSeeds(serviceName) {
  const servicePath = path.join(__dirname, '..', 'server', 'services', serviceName);
  const seedScript = path.join(servicePath, 'src', 'seeds', 'seed.ts');
  
  if (fs.existsSync(seedScript)) {
    console.log(`\n🌱 Running seeds for ${serviceName} service...`);
    
    // Run seed script
    const seedCommand = `cd ${servicePath} && npx ts-node src/seeds/seed.ts`;
    if (runCommand(seedCommand)) {
      console.log(`✅ Seeds completed for ${serviceName}`);
    }
  }
}

// Function to set up health check endpoints
function setupHealthChecks(serviceName) {
  const servicePath = path.join(__dirname, '..', 'server', 'services', serviceName);
  const healthRoutePath = path.join(servicePath, 'src', 'routes', 'health.ts');
  
  if (!fs.existsSync(healthRoutePath)) {
    console.log(`\n🏥 Setting up health check for ${serviceName} service...`);
    
    // Create health check route
    const healthCheckContent = `
import { Router } from 'express';
import { AppDataSource } from '../config/database';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('SELECT 1');
    } else {
      throw new Error('Database not initialized');
    }
    
    res.status(200).json({
      status: 'healthy',
      service: '${serviceName}',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: '${serviceName}',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
`;
    
    // Ensure directory exists
    const dirPath = path.dirname(healthRoutePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write health check route
    fs.writeFileSync(healthRoutePath, healthCheckContent);
    console.log(`✅ Health check route created for ${serviceName}`);
  }
}

// Main function to set up all services
async function setupAllServices() {
  console.log('🚀 Starting database setup for all services...\n');
  
  // Create PostgreSQL database
  createPostgresDatabase();
  
  // Services that use PostgreSQL
  const postgresServices = ['user', 'notification', 'interaction'];
  
  // Services that use MongoDB
  const mongoServices = ['content'];
  
  // Set up all services
  for (const service of [...postgresServices, ...mongoServices]) {
    console.log(`\n📦 Setting up ${service} service...`);
    
    // Run migrations for PostgreSQL services
    if (postgresServices.includes(service)) {
      runMigrations(service);
    }
    
    // Run seeds
    runSeeds(service);
    
    // Set up health check
    setupHealthChecks(service);
  }
  
  console.log('\n✨ Database setup completed!');
  console.log('\n⚠️  Next steps:');
  console.log('1. Start each service and test the /health endpoint');
  console.log('2. Verify database connections in service logs');
  console.log('3. Check seeded data in databases');
}

// Run the setup
setupAllServices().catch(console.error); 