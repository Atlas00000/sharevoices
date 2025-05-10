import { Request, Response, NextFunction } from 'express';
import { AppError } from '@sharedvoices/shared/src/errors';

export const validateArticle = (req: Request, res: Response, next: NextFunction) => {
  const { title, content, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new AppError(400, 'Title is required and must be a non-empty string');
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new AppError(400, 'Content is required and must be a non-empty string');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    throw new AppError(400, 'Category is required and must be a non-empty string');
  }

  // Generate slug from title if not provided
  if (!req.body.slug) {
    req.body.slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  next();
}; 