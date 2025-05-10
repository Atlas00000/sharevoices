import { DataSource } from 'typeorm';
import { Notification } from '../../../server/services/notification/src/models/Notification';
import { User } from '../../schemas/postgresql/user.entity';

export async function seedNotifications(dataSource: DataSource): Promise<void> {
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