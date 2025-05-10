import { DataSource } from 'typeorm';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// Define entity classes inline to avoid import issues
// User entity
class User {
  id: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  profile: Profile;
  createdAt: Date;
  updatedAt: Date;
}

// Profile entity
class Profile {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

// Notification entity
class Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Database connection
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sharedvoices',
  entities: [
    path.join(__dirname, '../db/schemas/postgresql/*.js'),
    path.join(__dirname, '../server/services/notification/src/models/*.js'),
  ],
  synchronize: false,
  logging: true,
});

async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const profileRepository = dataSource.getRepository(Profile);

  // Create admin user
  const adminProfile = profileRepository.create({
    firstName: "Admin",
    lastName: "User",
    bio: "System Administrator",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  });
  await profileRepository.save(adminProfile);

  const adminUser = userRepository.create({
    email: "admin@sharedvoices.com",
    password: await bcrypt.hash("Admin123!", 10),
    role: "admin",
    isEmailVerified: true,
    profile: adminProfile
  });
  await userRepository.save(adminUser);

  // Create editor user
  const editorProfile = profileRepository.create({
    firstName: "Editor",
    lastName: "User",
    bio: "Content Editor",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=editor"
  });
  await profileRepository.save(editorProfile);

  const editorUser = userRepository.create({
    email: "editor@sharedvoices.com",
    password: await bcrypt.hash("Editor123!", 10),
    role: "editor",
    isEmailVerified: true,
    profile: editorProfile
  });
  await userRepository.save(editorUser);

  // Create regular user
  const userProfile = profileRepository.create({
    firstName: "Regular",
    lastName: "User",
    bio: "Regular User",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
  });
  await profileRepository.save(userProfile);

  const regularUser = userRepository.create({
    email: "user@sharedvoices.com",
    password: await bcrypt.hash("User123!", 10),
    role: "user",
    isEmailVerified: true,
    profile: userProfile
  });
  await userRepository.save(regularUser);
}

async function seedNotifications(dataSource: DataSource): Promise<void> {
  const notificationRepo = dataSource.getRepository(Notification);
  const userRepo = dataSource.getRepository(User);

  // Get all users
  const users = await userRepo.find();
  if (users.length === 0) {
    throw new Error('No users found. Seed users before notifications.');
  }

  // Create notifications for each user
  const notifications = users.map((user, idx) =>
    notificationRepo.create({
      userId: user.id,
      type: idx % 2 === 0 ? 'welcome' : 'reminder',
      message: idx % 2 === 0 ? `Welcome to Shared Voices, ${user.email}!` : `Don't forget to check out new articles, ${user.email}!`,
      isRead: false,
    })
  );

  await notificationRepo.save(notifications);
  console.log(`Seeded ${notifications.length} notifications.`);
}

async function seedAll(): Promise<void> {
  try {
    await dataSource.initialize();
    console.log('Database connected');
    
    await seedUsers(dataSource);
    console.log('Users seeded');
    
    await seedNotifications(dataSource);
    console.log('Notifications seeded');
    
    await dataSource.destroy();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

// Run the seed function
seedAll();
