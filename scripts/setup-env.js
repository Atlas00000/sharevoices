console.log('--- setup-env.js script started ---');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration templates for each service
const configTemplates = {
  content: {
    path: 'server/services/content/.env.example',
    template: `# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sharedvoices
MONGODB_DB=sharedvoices

# Logging
LOG_LEVEL=debug

# Security
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}
JWT_EXPIRES_IN=24h

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100`
  },
  user: {
    path: 'server/services/user/.env.example',
    template: `# Server Configuration
PORT=3002
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sharedvoices

# Logging
LOG_LEVEL=debug

# Security
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}
JWT_EXPIRES_IN=24h

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100`
  }
};

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`[INFO] Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`[SUCCESS] Directory created: ${dirPath}`);
    } else {
      console.log(`[INFO] Directory already exists: ${dirPath}`);
    }
  } catch (err) {
    console.error(`[ERROR] Failed to create directory ${dirPath}:`, err.message);
    throw err;
  }
}

// Function to create .env.example file
function createEnvExample(serviceConfig) {
  const dirPath = path.dirname(serviceConfig.path);
  ensureDirectoryExists(dirPath);

  try {
    console.log(`[INFO] Writing file: ${serviceConfig.path}`);
    fs.writeFileSync(serviceConfig.path, serviceConfig.template);
    console.log(`[SUCCESS] Created ${serviceConfig.path}`);
  } catch (err) {
    console.error(`[ERROR] Failed to write file ${serviceConfig.path}:`, err.message);
    throw err;
  }
}

// Function to update .gitignore
function updateGitignore() {
  const gitignorePath = '.gitignore';
  const gitignoreContent = `# Environment files
.env
.env.local
.env.*.local

# Keep example files
!.env.example

# Dependencies
node_modules/
dist/
build/

# Logs
logs/
*.log
npm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db`;

  try {
    console.log(`[INFO] Updating .gitignore`);
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log(`[SUCCESS] Updated .gitignore`);
  } catch (err) {
    console.error(`[ERROR] Failed to update .gitignore:`, err.message);
    throw err;
  }
}

// Main function
function setupEnvironment() {
  console.log('Setting up environment configuration...');
  let errors = [];

  // Create .env.example files for each service
  Object.entries(configTemplates).forEach(([service, config]) => {
    try {
      createEnvExample(config);
    } catch (err) {
      errors.push(`[${service}] ${err.message}`);
    }
  });

  // Update .gitignore
  try {
    updateGitignore();
  } catch (err) {
    errors.push(`[gitignore] ${err.message}`);
  }

  if (errors.length === 0) {
    console.log('\nEnvironment configuration setup complete!');
    console.log('\nNext steps:');
    console.log('1. Copy .env.example to .env in each service directory');
    console.log('2. Update the values in .env files with your specific configuration');
    console.log('3. Never commit .env files to version control');
  } else {
    console.log('\n[ERROR] Some steps failed:');
    errors.forEach(e => console.log(' - ' + e));
    console.log('\nPlease review the errors above and try again.');
  }
}

// Run the setup
setupEnvironment(); 