import mongoose from 'mongoose';
import { z } from 'zod';

// Article Analytics Schema
export const articleAnalyticsSchema = z.object({
  articleId: z.string(),
  views: z.number().default(0),
  uniqueViews: z.number().default(0),
  likes: z.number().default(0),
  shares: z.number().default(0),
  comments: z.number().default(0),
  averageTimeSpent: z.number().default(0),
  dailyStats: z.array(z.object({
    date: z.date(),
    views: z.number(),
    uniqueViews: z.number(),
    likes: z.number(),
    shares: z.number(),
    comments: z.number()
  })).default([])
});

// User Engagement Schema
export const userEngagementSchema = z.object({
  userId: z.string(),
  totalArticlesRead: z.number().default(0),
  totalComments: z.number().default(0),
  totalLikes: z.number().default(0),
  totalShares: z.number().default(0),
  averageTimeSpent: z.number().default(0),
  lastActive: z.date().default(() => new Date()),
  dailyActivity: z.array(z.object({
    date: z.date(),
    articlesRead: z.number(),
    comments: z.number(),
    likes: z.number(),
    shares: z.number()
  })).default([])
});

// System Metrics Schema
export const systemMetricsSchema = z.object({
  timestamp: z.date().default(() => new Date()),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  activeUsers: z.number(),
  totalRequests: z.number(),
  averageResponseTime: z.number(),
  errorRate: z.number()
});

// Error Tracking Schema
export const errorTrackingSchema = z.object({
  timestamp: z.date().default(() => new Date()),
  errorType: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  userId: z.string().optional(),
  requestPath: z.string(),
  requestMethod: z.string(),
  requestBody: z.any().optional(),
  environment: z.string()
});

// Mongoose Schemas
const articleAnalyticsMongooseSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  views: { type: Number, default: 0 },
  uniqueViews: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  averageTimeSpent: { type: Number, default: 0 },
  dailyStats: [{
    date: { type: Date, required: true },
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  }]
}, { timestamps: true });

const userEngagementMongooseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalArticlesRead: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalShares: { type: Number, default: 0 },
  averageTimeSpent: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  dailyActivity: [{
    date: { type: Date, required: true },
    articlesRead: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  }]
}, { timestamps: true });

const systemMetricsMongooseSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  cpuUsage: { type: Number, required: true },
  memoryUsage: { type: Number, required: true },
  activeUsers: { type: Number, required: true },
  totalRequests: { type: Number, required: true },
  averageResponseTime: { type: Number, required: true },
  errorRate: { type: Number, required: true }
}, { timestamps: true });

const errorTrackingMongooseSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  errorType: { type: String, required: true },
  message: { type: String, required: true },
  stack: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestPath: { type: String, required: true },
  requestMethod: { type: String, required: true },
  requestBody: { type: mongoose.Schema.Types.Mixed },
  environment: { type: String, required: true }
}, { timestamps: true });

// Models
export const ArticleAnalytics = mongoose.model('ArticleAnalytics', articleAnalyticsMongooseSchema);
export const UserEngagement = mongoose.model('UserEngagement', userEngagementMongooseSchema);
export const SystemMetrics = mongoose.model('SystemMetrics', systemMetricsMongooseSchema);
export const ErrorTracking = mongoose.model('ErrorTracking', errorTrackingMongooseSchema);

// Types
export type ArticleAnalytics = z.infer<typeof articleAnalyticsSchema>;
export type UserEngagement = z.infer<typeof userEngagementSchema>;
export type SystemMetrics = z.infer<typeof systemMetricsSchema>;
export type ErrorTracking = z.infer<typeof errorTrackingSchema>; 