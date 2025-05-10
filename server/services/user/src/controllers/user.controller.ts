import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '@sharedvoices/shared/src/database/schemas/postgresql/user.entity';
import { Profile } from '@sharedvoices/shared/src/database/schemas/postgresql/profile.entity';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';

export class UserController {
    private userRepository = AppDataSource.getRepository(User);
    private profileRepository = AppDataSource.getRepository(Profile);

    // Create a new user
    async create(req: Request, res: Response) {
        try {
            const { email, password, firstName, lastName, bio } = req.body;

            // Check if user already exists
            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create profile
            const profile = this.profileRepository.create({
                firstName,
                lastName,
                bio,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
            });
            await this.profileRepository.save(profile);

            // Create user
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = this.userRepository.create({
                email,
                password: hashedPassword,
                profile
            });

            // Validate user
            const errors = await validate(user);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            await this.userRepository.save(user);

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            return res.status(201).json(userWithoutPassword);
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get all users
    async getAll(req: Request, res: Response) {
        try {
            const users = await this.userRepository.find({
                relations: ['profile'],
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isEmailVerified: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                    profile: true
                }
            });
            return res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get user by ID
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['profile'],
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isEmailVerified: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                    profile: true
                }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Update user
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { email, firstName, lastName, bio, avatarUrl } = req.body;

            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['profile']
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update user fields
            if (email) user.email = email;

            // Update profile fields
            if (user.profile) {
                if (firstName) user.profile.firstName = firstName;
                if (lastName) user.profile.lastName = lastName;
                if (bio) user.profile.bio = bio;
                if (avatarUrl) user.profile.avatarUrl = avatarUrl;
            }

            // Validate user
            const errors = await validate(user);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            await this.userRepository.save(user);

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete user
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['profile']
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await this.userRepository.remove(user);
            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
} 