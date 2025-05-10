import { DataSource } from "typeorm";
import { User } from "../../schemas/postgresql/user.entity";
import { Profile } from "../../schemas/postgresql/profile.entity";
import * as bcrypt from "bcrypt";
import { seedNotifications } from './notification.seed';

export async function seedUsers(dataSource: DataSource): Promise<void> {
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

export async function seedAll(dataSource: DataSource): Promise<void> {
    await seedUsers(dataSource);
    await seedNotifications(dataSource);
} 