import { z } from 'zod';

// Base article schema
const baseArticleSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must not exceed 200 characters'),
    content: z.string()
        .min(10, 'Content must be at least 10 characters'),
    category: z.string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must not exceed 50 characters'),
    tags: z.array(z.string())
        .min(1, 'At least one tag is required')
        .max(10, 'Maximum 10 tags allowed'),
    featuredImage: z.string().url('Invalid featured image URL').optional(),
    mediaUrls: z.array(z.string().url('Invalid media URL')).optional()
});

// Create article schema
export const createArticleSchema = baseArticleSchema.extend({
    authorId: z.string().uuid('Invalid author ID')
});

// Update article schema
export const updateArticleSchema = baseArticleSchema.partial().extend({
    status: z.enum(['draft', 'published', 'archived']).optional()
});

// Query parameters schema
export const articleQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    category: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    authorId: z.string().uuid('Invalid author ID').optional(),
    search: z.string().optional()
});

// Response schemas
export const articleResponseSchema = baseArticleSchema.extend({
    id: z.string(),
    slug: z.string(),
    authorId: z.string().uuid(),
    status: z.enum(['draft', 'published', 'archived']),
    viewCount: z.number(),
    likeCount: z.number(),
    commentCount: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
    publishedAt: z.date().optional()
});

export const articleListResponseSchema = z.object({
    articles: z.array(articleResponseSchema),
    total: z.number(),
    page: z.number(),
    totalPages: z.number()
}); 