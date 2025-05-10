const { Client } = require('pg');

// Database connection
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sharedvoices'
});

async function seedDatabase() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create profiles
    console.log('Creating profiles...');
    const profilesResult = await client.query(`
      INSERT INTO profiles (id, "firstName", "lastName", bio, "avatarUrl", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), 'Admin', 'User', 'System Administrator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', NOW(), NOW()),
        (gen_random_uuid(), 'Editor', 'User', 'Content Editor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor', NOW(), NOW()),
        (gen_random_uuid(), 'Regular', 'User', 'Regular User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user', NOW(), NOW())
      RETURNING id;
    `);
    
    const profileIds = profilesResult.rows.map(row => row.id);
    console.log(`Created ${profileIds.length} profiles`);

    // Create users
    console.log('Creating users...');
    const usersResult = await client.query(`
      INSERT INTO users (id, email, password, role, "isEmailVerified", "profileId", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), 'admin@sharedvoices.com', 'Admin123!', 'admin', true, $1, NOW(), NOW()),
        (gen_random_uuid(), 'editor@sharedvoices.com', 'Editor123!', 'editor', true, $2, NOW(), NOW()),
        (gen_random_uuid(), 'user@sharedvoices.com', 'User123!', 'user', true, $3, NOW(), NOW())
      RETURNING id;
    `, [profileIds[0], profileIds[1], profileIds[2]]);
    
    const userIds = usersResult.rows.map(row => row.id);
    console.log(`Created ${userIds.length} users`);

    // Create notifications
    console.log('Creating notifications...');
    const notificationsValues = [];
    const notificationsParams = [];
    
    let paramIndex = 1;
    userIds.forEach(userId => {
      notificationsValues.push(`(gen_random_uuid(), $${paramIndex}, 'welcome', 'Welcome to Shared Voices!', false, NOW(), NOW())`);
      notificationsParams.push(userId);
      paramIndex++;
      
      notificationsValues.push(`(gen_random_uuid(), $${paramIndex}, 'reminder', 'Don''t forget to check out new articles!', false, NOW(), NOW())`);
      notificationsParams.push(userId);
      paramIndex++;
    });
    
    const notificationsResult = await client.query(`
      INSERT INTO notifications (id, "userId", type, message, "isRead", "createdAt", "updatedAt")
      VALUES ${notificationsValues.join(', ')}
      RETURNING id;
    `, notificationsParams);
    
    console.log(`Created ${notificationsResult.rowCount} notifications`);

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await client.end();
  }
}

// Install required packages if not already installed
try {
  const { execSync } = require('child_process');
  console.log('Installing required packages...');
  execSync('npm install --no-save pg', { stdio: 'inherit' });
  console.log('Packages installed.');
} catch (error) {
  console.error('Error installing packages:', error.message);
  process.exit(1);
}

// Run the seed function
seedDatabase();
