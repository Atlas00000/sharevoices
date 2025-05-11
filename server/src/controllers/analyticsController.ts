import { Request, Response } from 'express';
import { ArticleAnalytics, UserEngagement, SystemMetrics, ErrorTracking } from '../models/Analytics';
import { Article } from '../models/Article';
import { User } from '../models/User';
import { z } from 'zod';
import os from 'os';

// Article Analytics Controller
export const trackArticleView = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const userId = req.user?.id;

    console.log('Tracking article view:', { articleId, userId });

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await ArticleAnalytics.findOneAndUpdate(
      { articleId },
      {
        $inc: { views: 1 },
        $addToSet: { uniqueViews: userId },
        $push: {
          dailyStats: {
            date: today,
            views: 1,
            uniqueViews: userId ? 1 : 0
          }
        }
      },
      { upsert: true, new: true }
    );

    console.log('Article view tracked:', analytics);
    res.json(analytics);
  } catch (error) {
    console.error('Error tracking article view:', error);
    res.status(500).json({ error: 'Failed to track article view' });
  }
};

export const getArticleAnalytics = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    console.log('Getting analytics for article:', articleId);

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const analytics = await ArticleAnalytics.findOne({ articleId });
    console.log('Article analytics:', analytics);
    res.json(analytics || { views: 0, uniqueViews: [], dailyStats: [] });
  } catch (error) {
    console.error('Error getting article analytics:', error);
    res.status(500).json({ error: 'Failed to get article analytics' });
  }
};

// User Engagement Controller
export const trackUserEngagement = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { action, articleId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const update: any = {
      lastActive: new Date()
    };

    switch (action) {
      case 'read':
        update.$inc = { totalArticlesRead: 1 };
        update.$push = {
          dailyActivity: {
            date: today,
            articlesRead: 1
          }
        };
        break;
      case 'comment':
        update.$inc = { totalComments: 1 };
        update.$push = {
          dailyActivity: {
            date: today,
            comments: 1
          }
        };
        break;
      case 'like':
        update.$inc = { totalLikes: 1 };
        update.$push = {
          dailyActivity: {
            date: today,
            likes: 1
          }
        };
        break;
      case 'share':
        update.$inc = { totalShares: 1 };
        update.$push = {
          dailyActivity: {
            date: today,
            shares: 1
          }
        };
        break;
    }

    const engagement = await UserEngagement.findOneAndUpdate(
      { userId },
      update,
      { upsert: true, new: true }
    );

    res.json(engagement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track user engagement' });
  }
};

export const getUserEngagement = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const engagement = await UserEngagement.findOne({ userId });
    res.json(engagement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user engagement' });
  }
};

// System Metrics Controller
export const trackSystemMetrics = async (req: Request, res: Response) => {
  try {
    const cpuUsage = os.loadavg()[0];
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    const activeUsers = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) } });
    const totalRequests = await SystemMetrics.aggregate([
      { $sort: { timestamp: -1 } },
      { $limit: 1 },
      { $project: { totalRequests: 1 } }
    ]);

    const metrics = new SystemMetrics({
      cpuUsage,
      memoryUsage,
      activeUsers,
      totalRequests: totalRequests[0]?.totalRequests || 0,
      averageResponseTime: 0, // This should be calculated from request tracking
      errorRate: 0 // This should be calculated from error tracking
    });

    await metrics.save();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track system metrics' });
  }
};

export const getSystemMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await SystemMetrics.find()
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system metrics' });
  }
};

// Error Tracking Controller
export const trackError = async (req: Request, res: Response) => {
  try {
    const { errorType, message, stack, requestPath, requestMethod, requestBody } = req.body;
    const userId = req.user?.id;

    const error = new ErrorTracking({
      errorType,
      message,
      stack,
      userId,
      requestPath,
      requestMethod,
      requestBody,
      environment: process.env.NODE_ENV || 'development'
    });

    await error.save();
    res.json(error);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track error' });
  }
};

export const getErrors = async (req: Request, res: Response) => {
  try {
    const errors = await ErrorTracking.find()
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(errors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get errors' });
  }
}; 