import { z } from 'zod';

// Common schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

// User schemas
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['user', 'admin', 'editor']).default('user'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Article schemas
export const articleSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  category: z.string(),
  tags: z.array(z.string()),
  authorId: z.string().uuid(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

// Comment schemas
export const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  articleId: z.string().uuid(),
  authorId: z.string().uuid(),
}); 