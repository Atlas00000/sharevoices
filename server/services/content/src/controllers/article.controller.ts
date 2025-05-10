import { Request, Response, NextFunction } from 'express';
import { Article, IArticle } from '../models/Article';
import { AppError } from '@sharedvoices/shared/src/errors';
import { logger } from '../utils/logger';

export class ArticleController {
  // Get all articles with pagination
  getAllArticles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const articles = await Article.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Article.countDocuments();

      res.json({
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get article by ID
  getArticleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) {
        throw new AppError(404, 'Article not found');
      }
      res.json(article);
    } catch (error) {
      next(error);
    }
  };

  // Create new article
  createArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = new Article(req.body);
      await article.save();
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  };

  // Update article
  updateArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await Article.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!article) {
        throw new AppError(404, 'Article not found');
      }
      res.json(article);
    } catch (error) {
      next(error);
    }
  };

  // Delete article
  deleteArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await Article.findByIdAndDelete(req.params.id);
      if (!article) {
        throw new AppError(404, 'Article not found');
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // Get articles by category
  getArticlesByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const articles = await Article.find({ category: req.params.category })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Article.countDocuments({ category: req.params.category });

      res.json({
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Search articles
  searchArticles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        throw new AppError(400, 'Search query is required');
      }

      const articles = await Article.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10);

      res.json(articles);
    } catch (error) {
      next(error);
    }
  };
} 