import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IArticle extends Document {
  title: string;
  content: string;
  slug: string;
  category: string;
  tags: string[];
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  mediaUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  currentVersion: number;
}

const ArticleSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  authorId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featuredImage: { type: String },
  mediaUrls: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  currentVersion: { type: Number, default: 1 }
}, {
  timestamps: true
});

// Indexes for better query performance
ArticleSchema.index({ title: 'text', content: 'text' });
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ authorId: 1 });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ createdAt: -1 });

// Pre-save middleware to update slug
ArticleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

export const Article = mongoose.model<IArticle>('Article', ArticleSchema); 