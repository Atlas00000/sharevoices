const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Output file
const outputFile = 'ts-node-seed.log';

// Function to write to both console and file
function log(message) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n');
}

// Clear previous output file if it exists
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

try {
  log('Setting up TypeScript seed environment...');
  
  // Install required packages
  log('Installing required packages...');
  execSync('npm install --no-save ts-node typescript @types/node typeorm pg bcrypt @types/bcrypt', { stdio: 'inherit' });
  log('Packages installed.');
  
  // Create a temporary TypeScript seed file
  const seedFile = path.join(__dirname, 'temp-seed.ts');
  log(`Creating temporary seed file: ${seedFile}`);
  
  const seedContent = `
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

// Log file
const logFile = '${outputFile.replace(/\\/g, '\\\\')}';
const log = (message: string) => {
  console.log(message);
  fs.appendFileSync(logFile, message + '\\n');
};

// Define entity classes inline to avoid import issues
@Entity('profiles')
class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToOne(() => User, user => user.profile)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @OneToOne(() => Profile, profile => profile.user)
  @JoinColumn()
  profile: Profile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('notifications')
class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column()
  type: string;

  @Column()
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Import TypeORM decorators
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

// Database connection
const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  synchronize: false,
  logging: true,
  entities: [Profile, User, Notification]
});

async function seedDatabase() {
  try {
    // Connect to the database
    await dataSource.initialize();
    log('Connected to PostgreSQL');

    // Create sharedvoices database if it doesn't exist
    const dbResult = await dataSource.query(\`
      SELECT 1 FROM pg_database WHERE datname = 'sharedvoices'
    \`);
    
    if (dbResult.length === 0) {
      log('Creating sharedvoices database...');
      await dataSource.query(\`CREATE DATABASE sharedvoices\`);
      log('sharedvoices database created');
    } else {
      log('sharedvoices database already exists');
    }
    
    // Close connection to postgres database
    await dataSource.destroy();
    
    // Connect to sharedvoices database
    const sharedvoicesDataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'sharedvoices',
      synchronize: true, // This will create tables based on entities
      logging: true,
      entities: [Profile, User, Notification]
    });
    
    await sharedvoicesDataSource.initialize();
    log('Connected to sharedvoices database');
    
    // Create profiles
    log('Creating profiles...');
    const profileRepo = sharedvoicesDataSource.getRepository(Profile);
    
    const adminProfile = profileRepo.create({
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System Administrator',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    });
    await profileRepo.save(adminProfile);
    
    const editorProfile = profileRepo.create({
      firstName: 'Editor',
      lastName: 'User',
      bio: 'Content Editor',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor'
    });
    await profileRepo.save(editorProfile);
    
    const userProfile = profileRepo.create({
      firstName: 'Regular',
      lastName: 'User',
      bio: 'Regular User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
    });
    await profileRepo.save(userProfile);
    
    log('Profiles created');
    
    // Create users
    log('Creating users...');
    const userRepo = sharedvoicesDataSource.getRepository(User);
    
    const adminUser = userRepo.create({
      email: 'admin@sharedvoices.com',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'admin',
      isEmailVerified: true,
      profile: adminProfile
    });
    await userRepo.save(adminUser);
    
    const editorUser = userRepo.create({
      email: 'editor@sharedvoices.com',
      password: await bcrypt.hash('Editor123!', 10),
      role: 'editor',
      isEmailVerified: true,
      profile: editorProfile
    });
    await userRepo.save(editorUser);
    
    const regularUser = userRepo.create({
      email: 'user@sharedvoices.com',
      password: await bcrypt.hash('User123!', 10),
      role: 'user',
      isEmailVerified: true,
      profile: userProfile
    });
    await userRepo.save(regularUser);
    
    log('Users created');
    
    // Create notifications
    log('Creating notifications...');
    const notificationRepo = sharedvoicesDataSource.getRepository(Notification);
    
    const users = await userRepo.find();
    
    const notifications = users.flatMap(user => [
      notificationRepo.create({
        userId: user.id,
        type: 'welcome',
        message: \`Welcome to Shared Voices, \${user.email}!\`,
        isRead: false
      }),
      notificationRepo.create({
        userId: user.id,
        type: 'reminder',
        message: \`Don't forget to check out new articles, \${user.email}!\`,
        isRead: false
      })
    ]);
    
    await notificationRepo.save(notifications);
    log(\`Created \${notifications.length} notifications\`);
    
    // Close connection
    await sharedvoicesDataSource.destroy();
    log('Database connection closed');
    
    log('Seeding completed successfully!');
  } catch (error) {
    log(\`Error seeding database: \${error.message}\`);
    log(error.stack || '');
  }
}

// Run the seed function
seedDatabase().catch(err => {
  log(\`Unhandled error: \${err.message}\`);
  log(err.stack || '');
});
  `;
  
  fs.writeFileSync(seedFile, seedContent);
  
  // Run the seed file with ts-node
  log('Running seed file with ts-node...');
  try {
    execSync(`npx ts-node ${seedFile}`, { stdio: 'inherit' });
    log('Seed completed successfully!');
  } catch (error) {
    log(`Error running seed: ${error.message}`);
  }
  
  // Clean up
  log('Cleaning up...');
  fs.unlinkSync(seedFile);
  log('Temporary seed file removed');
  
  log('Process completed. Check the log file for details.');
} catch (error) {
  log(`Error: ${error.message}`);
  log(error.stack || '');
}
