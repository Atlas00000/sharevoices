import { Request, Response } from 'express';
import { User, UserInput, IUser } from '../models/User';
import { z } from 'zod';

// Profile update schema
const profileUpdateSchema = z.object({
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional()
  }).optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).optional()
});

// Preferences update schema
const preferencesUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  emailNotifications: z.object({
    newArticles: z.boolean().optional(),
    comments: z.boolean().optional(),
    mentions: z.boolean().optional(),
    newsletter: z.boolean().optional()
  }).optional()
});

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const validatedData = profileUpdateSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profile: validatedData } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid profile data', errors: error.errors });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Update user preferences
export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const validatedData = preferencesUpdateSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { preferences: validatedData } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Preferences updated successfully', user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid preferences data', errors: error.errors });
    }
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Error updating preferences' });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user role' });
  }
}; 