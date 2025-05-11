import mongoose, { Document } from 'mongoose';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  READER = 'reader'
}

// User preferences interface
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: {
    newArticles: boolean;
    comments: boolean;
    mentions: boolean;
    newsletter: boolean;
  };
}

// User profile interface
export interface IUserProfile {
  bio: string;
  avatar: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  location: string;
  interests: string[];
}

// User interface
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  preferences: IUserPreferences;
  profile: IUserProfile;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User preferences schema
const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  emailNotifications: z.object({
    newArticles: z.boolean().default(true),
    comments: z.boolean().default(true),
    mentions: z.boolean().default(true),
    newsletter: z.boolean().default(false)
  })
});

// User profile schema
const userProfileSchema = z.object({
  bio: z.string().max(500).default(''),
  avatar: z.string().url().optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional()
  }).default({}),
  location: z.string().default(''),
  interests: z.array(z.string()).default([])
});

// User schema
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).default(UserRole.READER),
  preferences: userPreferencesSchema.default({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: {
      newArticles: true,
      comments: true,
      mentions: true,
      newsletter: false
    }
  }),
  profile: userProfileSchema.default({
    bio: '',
    avatar: '',
    socialLinks: {},
    location: '',
    interests: []
  })
});

// Mongoose schema
const mongooseSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.READER },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    emailNotifications: {
      newArticles: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false }
    }
  },
  profile: {
    bio: { type: String, maxlength: 500, default: '' },
    avatar: { type: String },
    socialLinks: {
      twitter: { type: String },
      linkedin: { type: String },
      github: { type: String },
      website: { type: String }
    },
    location: { type: String, default: '' },
    interests: [{ type: String }]
  }
}, {
  timestamps: true
});

// Hash password before saving
mongooseSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
mongooseSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', mongooseSchema);
export type UserInput = z.infer<typeof userSchema>; 