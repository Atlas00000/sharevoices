import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// Article status enum
export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Article category enum
export enum ArticleCategory {
  TECHNOLOGY = 'technology',
  SCIENCE = 'science',
  HEALTH = 'health',
  BUSINESS = 'business',
  POLITICS = 'politics',
  CULTURE = 'culture',
  SPORTS = 'sports',
  OTHER = 'other'
}

// Zod schema for validation
export const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  author: z.string().min(1),
  category: z.nativeEnum(ArticleCategory),
  tags: z.array(z.string()).optional(),
  publishedAt: z.date().optional(),
  status: z.nativeEnum(ArticleStatus).default(ArticleStatus.DRAFT),
  version: z.number().default(1),
  featuredImage: z.string().optional(),
  previousVersions: z.array(z.object({
    content: z.string(),
    updatedAt: z.date(),
    updatedBy: z.string()
  })).optional()
});

// TypeScript interface
export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  category: ArticleCategory;
  tags?: string[];
  publishedAt?: Date;
  status: ArticleStatus;
  version: number;
  featuredImage?: string;
  previousVersions?: Array<{
    content: string;
    updatedAt: Date;
    updatedBy: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const articleSchema = new Schema<IArticle>({
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  author: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: Object.values(ArticleCategory)
  },
  tags: [{ type: String }],
  publishedAt: { type: Date },
  status: { 
    type: String, 
    enum: Object.values(ArticleStatus),
    default: ArticleStatus.DRAFT
  },
  version: { type: Number, default: 1 },
  featuredImage: { type: String },
  previousVersions: [{
    content: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true }
  }]
}, {
  timestamps: true
});

// Create and export the model
export const Article = mongoose.model<IArticle>('Article', articleSchema); 