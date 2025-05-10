import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection initialized');

    // Create admin user
    const adminUser = new User();
    adminUser.email = 'admin@sharedvoices.com';
    adminUser.password = await bcrypt.hash('admin123', 10);
    adminUser.role = 'admin';
    adminUser.isActive = true;
    adminUser.firstName = 'Admin';
    adminUser.lastName = 'User';

    // Create regular user
    const regularUser = new User();
    regularUser.email = 'user@sharedvoices.com';
    regularUser.password = await bcrypt.hash('user123', 10);
    regularUser.role = 'user';
    regularUser.isActive = true;
    regularUser.firstName = 'Regular';
    regularUser.lastName = 'User';

    // Save users
    await AppDataSource.manager.save([adminUser, regularUser]);
    console.log('✅ Users seeded successfully');

    // Close database connection
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seed(); 