const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const path = require('path');

// Database connection
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sharedvoices',
  synchronize: false,
  logging: true,
});

async function seedUsers() {
  // Get repositories
  const userRepo = dataSource.getRepository('users');
  const profileRepo = dataSource.getRepository('profiles');

  // Create admin user
  const adminProfile = profileRepo.create({
    firstName: "Admin",
    lastName: "User",
    bio: "System Administrator",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  });
  await profileRepo.save(adminProfile);

  const adminUser = userRepo.create({
    email: "admin@sharedvoices.com",
    password: await bcrypt.hash("Admin123!", 10),
    role: "admin",
    isEmailVerified: true,
    profileId: adminProfile.id
  });
  await userRepo.save(adminUser);

  // Create editor user
  const editorProfile = profileRepo.create({
    firstName: "Editor",
    lastName: "User",
    bio: "Content Editor",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=editor"
  });
  await profileRepo.save(editorProfile);

  const editorUser = userRepo.create({
    email: "editor@sharedvoices.com",
    password: await bcrypt.hash("Editor123!", 10),
    role: "editor",
    isEmailVerified: true,
    profileId: editorProfile.id
  });
  await userRepo.save(editorUser);

  // Create regular user
  const userProfile = profileRepo.create({
    firstName: "Regular",
    lastName: "User",
    bio: "Regular User",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
  });
  await profileRepo.save(userProfile);

  const regularUser = userRepo.create({
    email: "user@sharedvoices.com",
    password: await bcrypt.hash("User123!", 10),
    role: "user",
    isEmailVerified: true,
    profileId: userProfile.id
  });
  await userRepo.save(regularUser);

  console.log('Users seeded successfully');
  return [adminUser, editorUser, regularUser];
}

async function seedNotifications(users) {
  const notificationRepo = dataSource.getRepository('notifications');

  // Create notifications for each user
  const notifications = users.flatMap((user, idx) => [
    notificationRepo.create({
      userId: user.id,
      type: 'welcome',
      message: `Welcome to Shared Voices, ${user.email}!`,
      isRead: false,
    }),
    notificationRepo.create({
      userId: user.id,
      type: 'reminder',
      message: `Don't forget to check out new articles, ${user.email}!`,
      isRead: false,
    })
  ]);

  await notificationRepo.save(notifications);
  console.log(`Seeded ${notifications.length} notifications.`);
}

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('Database connected');
    
    const users = await seedUsers();
    await seedNotifications(users);
    
    await dataSource.destroy();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

// Install required packages if not already installed
try {
  const { execSync } = require('child_process');
  console.log('Installing required packages...');
  execSync('npm install --no-save typeorm pg bcrypt', { stdio: 'inherit' });
  console.log('Packages installed.');
} catch (error) {
  console.error('Error installing packages:', error.message);
  process.exit(1);
}

// Run the seed function
runSeed();
