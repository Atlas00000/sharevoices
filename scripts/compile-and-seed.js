const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const dbDir = path.join(__dirname, '../db');
const distDir = path.join(__dirname, '../dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Compile TypeScript files
console.log('Compiling TypeScript files...');
try {
  // Use ts-node to directly run the seed script with TypeScript
  console.log('Running seed script with ts-node...');
  execSync('npx ts-node db/seeds/postgresql/seed.ts', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      TS_NODE_PROJECT: 'db/tsconfig.json'
    }
  });
  
  console.log('Seeding completed successfully.');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
