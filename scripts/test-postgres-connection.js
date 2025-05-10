const { Client } = require('pg');
const fs = require('fs');

// Output file
const outputFile = 'postgres-connection-test.log';

// Function to write to both console and file
function log(message) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n');
}

// Clear previous output file if it exists
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

// Test connection with different credentials
async function testConnection() {
  log('Testing PostgreSQL connection with different credentials...');
  
  // Common connection parameters
  const commonParams = {
    host: 'localhost',
    port: 5432,
    connectionTimeoutMillis: 5000
  };
  
  // Different credential combinations to try
  const credentialSets = [
    { user: 'postgres', password: 'postgres', database: 'postgres', description: 'Default PostgreSQL credentials' },
    { user: 'postgres', password: '', database: 'postgres', description: 'Empty password' },
    { user: 'postgres', password: 'admin', database: 'postgres', description: 'Common alternative password' },
    { user: 'postgres', password: 'password', database: 'postgres', description: 'Another common password' }
  ];
  
  // Try each set of credentials
  for (const creds of credentialSets) {
    const client = new Client({
      ...commonParams,
      user: creds.user,
      password: creds.password,
      database: creds.database
    });
    
    log(`\nTrying: ${creds.description}`);
    log(`User: ${creds.user}, Password: ${'*'.repeat(creds.password.length)}, Database: ${creds.database}`);
    
    try {
      await client.connect();
      log('✅ Connection successful!');
      
      // Check PostgreSQL version
      const versionResult = await client.query('SELECT version()');
      log(`PostgreSQL version: ${versionResult.rows[0].version}`);
      
      // List databases
      const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
      log('Available databases:');
      dbResult.rows.forEach(row => {
        log(`- ${row.datname}`);
      });
      
      await client.end();
      log('Connection closed.');
      
      // If we got here, we found working credentials
      log('\n✅ FOUND WORKING CREDENTIALS:');
      log(`User: ${creds.user}, Password: ${creds.password}, Database: ${creds.database}`);
      log('Use these credentials in your setup script.');
      
      return true;
    } catch (err) {
      log(`❌ Connection failed: ${err.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignore errors when closing connection
      }
    }
  }
  
  log('\n❌ All connection attempts failed.');
  log('Please check your PostgreSQL installation and credentials.');
  return false;
}

// Install required packages if not already installed
try {
  const { execSync } = require('child_process');
  log('Installing required packages...');
  execSync('npm install --no-save pg', { stdio: 'inherit' });
  log('Packages installed.');
} catch (error) {
  log('Error installing packages: ' + error.message);
  process.exit(1);
}

// Run the test
testConnection().then(success => {
  log(`\nConnection test ${success ? 'succeeded' : 'failed'}.`);
  log(`Results written to ${outputFile}`);
}).catch(err => {
  log(`\nUnexpected error: ${err.message}`);
  log(err.stack || '');
});
