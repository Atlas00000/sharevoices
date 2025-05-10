const fs = require('fs');
const path = require('path');

// Base directory paths
const SERVER_DIR = path.join(__dirname, '..', 'server');
const SERVICES_DIR = path.join(SERVER_DIR, 'services');

// Environment variables for each service
const envConfigs = {
  user: {
    NODE_ENV: 'development',
    PORT: '3001',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'postgres',
    POSTGRES_DB: 'sharedvoices',
    JWT_SECRET: 'your-jwt-secret-key',
    JWT_EXPIRATION: '24h',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379'
  },
  content: {
    NODE_ENV: 'development',
    PORT: '3002',
    MONGODB_URI: 'mongodb://localhost:27017/sharedvoices',
    ELASTICSEARCH_NODE: 'http://localhost:9200',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379'
  },
  interaction: {
    NODE_ENV: 'development',
    PORT: '3003',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'postgres',
    POSTGRES_DB: 'sharedvoices',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379'
  },
  notification: {
    NODE_ENV: 'development',
    PORT: '3004',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'postgres',
    POSTGRES_DB: 'sharedvoices',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379'
  },
  gateway: {
    NODE_ENV: 'development',
    PORT: '3000',
    USER_SERVICE_URL: 'http://localhost:3001',
    CONTENT_SERVICE_URL: 'http://localhost:3002',
    INTERACTION_SERVICE_URL: 'http://localhost:3003',
    NOTIFICATION_SERVICE_URL: 'http://localhost:3004'
  }
};

function ensureServiceDir(serviceName) {
  const dirPath = path.join(SERVER_DIR, 'services', serviceName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created missing directory for ${serviceName} service`);
  }
}

// Function to create .env file
function createEnvFile(serviceName, config) {
  ensureServiceDir(serviceName);
  const envPath = path.join(SERVER_DIR, 'services', serviceName, '.env');
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Created .env file for ${serviceName} service`);
  } catch (error) {
    console.error(`❌ Error creating .env file for ${serviceName} service:`, error.message);
  }
}

// Function to create .env.example file
function createEnvExampleFile(serviceName, config) {
  ensureServiceDir(serviceName);
  const envExamplePath = path.join(SERVER_DIR, 'services', serviceName, '.env.example');
  const envExampleContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  try {
    fs.writeFileSync(envExamplePath, envExampleContent);
    console.log(`✅ Created .env.example file for ${serviceName} service`);
  } catch (error) {
    console.error(`❌ Error creating .env.example file for ${serviceName} service:`, error.message);
  }
}

// Main function to generate all .env files
function generateEnvFiles() {
  console.log('🚀 Generating .env files for all services...\n');

  // Create .env files for each service
  Object.entries(envConfigs).forEach(([serviceName, config]) => {
    createEnvFile(serviceName, config);
    createEnvExampleFile(serviceName, config);
  });

  console.log('\n✨ Environment files generation completed!');
  console.log('\n⚠️  Important:');
  console.log('1. Review the generated .env files and update sensitive values');
  console.log('2. Add .env files to .gitignore if not already added');
  console.log('3. Keep .env.example files in version control as templates');
}

// Run the script
generateEnvFiles(); 