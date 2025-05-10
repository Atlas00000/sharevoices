const { DataSource } = require('typeorm');
const path = require('path');
const { execSync } = require('child_process');

// Install ts-node if not already installed
try {
  console.log('Checking for ts-node...');
  execSync('npx ts-node --version', { stdio: 'ignore' });
  console.log('ts-node is installed.');
} catch (error) {
  console.log('Installing ts-node...');
  execSync('npm install -g ts-node typescript @types/node', { stdio: 'inherit' });
}

// Run the TypeScript seed file directly with ts-node
console.log('Running seed script with ts-node...');
try {
  execSync('npx ts-node -r tsconfig-paths/register db/seeds/postgresql/seed.ts', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      TS_NODE_PROJECT: 'db/tsconfig.json'
    }
  });
} catch (error) {
  console.error('Error running seed script:', error.message);
  process.exit(1);
}
