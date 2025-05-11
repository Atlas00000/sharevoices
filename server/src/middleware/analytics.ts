import { Request, Response, NextFunction } from 'express';
import { SystemMetrics, ErrorTracking } from '../models/Analytics';
import os from 'os';

// Track request metrics
export const trackRequestMetrics = async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Track response time
  res.on('finish', async () => {
    const duration = Date.now() - start;
    try {
      const cpuUsage = os.loadavg()[0];
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

      await SystemMetrics.create({
        cpuUsage,
        memoryUsage,
        activeUsers: 0, // This should be calculated from active sessions
        totalRequests: 1,
        averageResponseTime: duration,
        errorRate: res.statusCode >= 400 ? 1 : 0
      });
    } catch (error) {
      console.error('Failed to track request metrics:', error);
    }
  });

  next();
};

// Track errors
export const trackErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const error = new ErrorTracking({
    errorType: err.name,
    message: err.message,
    stack: err.stack,
    userId: req.user?.id,
    requestPath: req.path,
    requestMethod: req.method,
    requestBody: req.body,
    environment: process.env.NODE_ENV || 'development'
  });

  error.save().catch(console.error);

  next(err);
};

// Track article views
export const trackArticleViews = async (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/articles/') && req.method === 'GET') {
    const articleId = req.params.id;
    if (articleId) {
      try {
        await SystemMetrics.updateOne(
          { articleId },
          {
            $inc: { views: 1 },
            $addToSet: { uniqueViews: req.user?.id }
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Failed to track article view:', error);
      }
    }
  }
  next();
};

// Track user activity
export const trackUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.id) {
    try {
      await SystemMetrics.updateOne(
        { userId: req.user.id },
        { $set: { lastActive: new Date() } },
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to track user activity:', error);
    }
  }
  next();
}; 