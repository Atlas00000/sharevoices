import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  tags: string[];
  metadata: {
    readTime: number;
    featured: boolean;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    author: { type: String, required: true },
    tags: [{ type: String }],
    metadata: {
      readTime: { type: Number, default: 0 },
      featured: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export const Article = mongoose.model<IArticle>('Article', articleSchema); 