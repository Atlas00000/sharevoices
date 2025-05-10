const { execSync } = require('child_process');

// Install required packages if not already installed
try {
  console.log('Installing required packages...');
  execSync('npm install --no-save ts-node typescript @types/node typeorm pg bcrypt @types/bcrypt', { stdio: 'inherit' });
  console.log('Packages installed.');
} catch (error) {
  console.error('Error installing packages:', error.message);
  process.exit(1);
}

// Run the TypeScript seed file directly with ts-node
console.log('Running direct seed script with ts-node...');
try {
  execSync('npx ts-node scripts/direct-seed.ts', { stdio: 'inherit' });
  console.log('Seeding completed successfully.');
} catch (error) {
  console.error('Error running seed script:', error.message);
  process.exit(1);
}
