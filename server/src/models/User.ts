import mongoose from 'mongoose';
import { z } from 'zod';

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  READER = 'reader'
}

// Zod schema for user validation
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).default(UserRole.READER),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Type inference from Zod schema
export type User = z.infer<typeof userSchema>;

// Mongoose schema
const userMongooseSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.READER 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
userMongooseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model<User>('User', userMongooseSchema); 