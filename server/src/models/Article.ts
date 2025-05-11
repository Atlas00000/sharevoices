import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  publishedAt: z.date().optional(),
  status: z.enum(['draft', 'published']).default('draft')
});

// TypeScript interface
export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  category: string;
  tags?: string[];
  publishedAt?: Date;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const articleSchema = new Schema<IArticle>({
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  publishedAt: { type: Date },
  status: { 
    type: String, 
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Create and export the model
export const Article = mongoose.model<IArticle>('Article', articleSchema); 