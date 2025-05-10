import mongoose, { Document, Schema } from 'mongoose';

export interface IArticleVersion extends Document {
  articleId: mongoose.Types.ObjectId;
  version: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  metadata: {
    readTime: number;
    featured: boolean;
    [key: string]: any;
  };
  author: string;
  createdAt: Date;
}

const articleVersionSchema = new Schema<IArticleVersion>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    metadata: {
      readTime: { type: Number, default: 0 },
      featured: { type: Boolean, default: false },
    },
    author: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique versions per article
articleVersionSchema.index({ articleId: 1, version: 1 }, { unique: true });

export const ArticleVersion = mongoose.model<IArticleVersion>('ArticleVersion', articleVersionSchema); 