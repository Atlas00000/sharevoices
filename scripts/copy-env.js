const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Services to configure
const services = [
  'content',
  'user'
];

// Function to copy .env.example to .env
function copyEnvFile(service) {
  const examplePath = path.join('server', 'services', service, '.env.example');
  const envPath = path.join('server', 'services', service, '.env');

  if (!fs.existsSync(examplePath)) {
    console.error(`Error: ${examplePath} does not exist. Run setup-env.js first.`);
    return false;
  }

  try {
    fs.copyFileSync(examplePath, envPath);
    console.log(`Created ${envPath}`);
    return true;
  } catch (error) {
    console.error(`Error copying ${examplePath} to ${envPath}:`, error.message);
    return false;
  }
}

// Function to prompt for confirmation
function promptConfirmation(service) {
  return new Promise((resolve) => {
    rl.question(`Do you want to create .env for ${service} service? (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Main function
async function copyEnvironmentFiles() {
  console.log('Environment File Setup');
  console.log('=====================');
  console.log('This script will help you create .env files from .env.example templates.');
  console.log('Make sure to review and update the values in the .env files after creation.\n');

  for (const service of services) {
    const shouldCopy = await promptConfirmation(service);
    if (shouldCopy) {
      copyEnvFile(service);
    }
  }

  console.log('\nSetup complete!');
  console.log('\nImportant:');
  console.log('1. Review and update the values in your .env files');
  console.log('2. Never commit .env files to version control');
  console.log('3. Keep your .env.example files up to date with any new variables');

  rl.close();
}

// Run the script
copyEnvironmentFiles(); 