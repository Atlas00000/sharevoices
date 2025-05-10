
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
    