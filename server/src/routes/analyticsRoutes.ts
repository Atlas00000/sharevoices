import express from 'express';
import { auth } from '../middleware/auth';
import authorize from '../middleware/authorize';
import { UserRole } from '../models/User';
import {
  trackArticleView,
  getArticleAnalytics,
  trackUserEngagement,
  getUserEngagement,
  trackSystemMetrics,
  getSystemMetrics,
  trackError,
  getErrors
} from '../controllers/analyticsController';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const router = express.Router();

// Article Analytics Routes
const articleViewSchema = z.object({
  articleId: z.string()
});

router.post('/articles/:articleId/view', auth, validateRequest({ body: articleViewSchema }), trackArticleView);
router.get('/articles/:articleId/analytics', auth, getArticleAnalytics);

// User Engagement Routes
const userEngagementSchema = z.object({
  type: z.enum(['read', 'comment', 'like', 'share']),
  articleId: z.string()
});

router.post('/engagement', auth, validateRequest({ body: userEngagementSchema }), trackUserEngagement);
router.get('/engagement', auth, getUserEngagement);

// System Metrics Routes (Admin only)
const systemMetricsSchema = z.object({
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  activeUsers: z.number(),
  totalRequests: z.number(),
  averageResponseTime: z.number(),
  errorRate: z.number()
});

router.post('/system/metrics', auth, authorize(UserRole.ADMIN), validateRequest({ body: systemMetricsSchema }), trackSystemMetrics);
router.get('/system/metrics', auth, authorize(UserRole.ADMIN), getSystemMetrics);

// Error Tracking Routes (Admin only)
const errorTrackingSchema = z.object({
  errorType: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  requestPath: z.string(),
  requestMethod: z.string(),
  requestBody: z.any().optional()
});

router.post('/system/errors', auth, authorize(UserRole.ADMIN), validateRequest({ body: errorTrackingSchema }), trackError);
router.get('/system/errors', auth, authorize(UserRole.ADMIN), getErrors);

export default router; 