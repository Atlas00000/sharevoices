import mongoose, { Schema, Document } from 'mongoose';

export interface IArticleVersion extends Document {
    articleId: mongoose.Types.ObjectId;
    version: number;
    title: string;
    content: string;
    category: string;
    tags: string[];
    authorId: string;
    changes: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    createdAt: Date;
    createdBy: string;
}

const ArticleVersionSchema: Schema = new Schema({
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    authorId: { type: String, required: true },
    changes: [{
        field: { type: String, required: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed }
    }],
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true }
}, {
    timestamps: true
});

// Indexes for better query performance
ArticleVersionSchema.index({ articleId: 1, version: 1 }, { unique: true });
ArticleVersionSchema.index({ createdAt: -1 });

export const ArticleVersion = mongoose.model<IArticleVersion>('ArticleVersion', ArticleVersionSchema); 