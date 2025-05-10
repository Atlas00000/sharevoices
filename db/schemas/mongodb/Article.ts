import { Schema, model, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  slug: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    featuredImage: { type: String },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

ArticleSchema.index({ title: 'text', content: 'text' });
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1 });

export const Article = model<IArticle>('Article', ArticleSchema); 