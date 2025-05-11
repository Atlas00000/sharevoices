import { Request, Response } from 'express';
import { Article, ArticleSchema } from '../models/Article';

// Get all articles with search and pagination
export const getArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';

    // Build search query
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // Get total count for pagination
    const total = await Article.countDocuments(query);

    // Get paginated results
    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single article
export const getArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create article
export const createArticle = async (req: Request, res: Response) => {
  try {
    const validatedData = ArticleSchema.parse(req.body);
    const article = new Article({
      ...validatedData,
      author: req.user?.id
    });
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

// Update article
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const validatedData = ArticleSchema.parse(req.body);
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this article' });
    }

    Object.assign(article, validatedData);
    await article.save();
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

// Delete article
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this article' });
    }

    await article.deleteOne();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 