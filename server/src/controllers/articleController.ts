import { Request, Response } from 'express';
import { Article, ArticleSchema, ArticleStatus, ArticleCategory } from '../models/Article';
import { validateAndSanitizeContent } from '../utils/contentValidation';
import { processImage, getImageUrl } from '../utils/imageUpload';
import { scheduleArticlePublication, cancelScheduledPublication } from '../utils/scheduler';

// Get all articles with search, pagination, and filters
export const getArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const category = req.query.category as ArticleCategory;
    const status = req.query.status as ArticleStatus;
    const tag = req.query.tag as string;

    // Build search query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

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
    // Process featured image if uploaded
    let featuredImage;
    if (req.file) {
      const processedImagePath = await processImage(req.file.path);
      featuredImage = getImageUrl(processedImagePath);
    }

    // Validate and sanitize content
    const validatedData = validateAndSanitizeContent({
      ...req.body,
      featuredImage
    });

    const article = new Article({
      ...validatedData,
      author: req.user?.id,
      version: 1
    });

    // Schedule publication if publish date is set
    if (article.publishedAt && article.status === ArticleStatus.DRAFT) {
      await scheduleArticlePublication(article._id.toString(), article.publishedAt);
    }

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

// Update article
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this article' });
    }

    // Process featured image if uploaded
    let featuredImage = article.featuredImage;
    if (req.file) {
      const processedImagePath = await processImage(req.file.path);
      featuredImage = getImageUrl(processedImagePath);
    }

    // Validate and sanitize content
    const validatedData = validateAndSanitizeContent({
      ...req.body,
      featuredImage
    });

    // Store previous version if content is changed
    if (validatedData.content !== article.content) {
      article.previousVersions = article.previousVersions || [];
      article.previousVersions.push({
        content: article.content,
        updatedAt: article.updatedAt,
        updatedBy: article.author.toString()
      });
      article.version += 1;
    }

    // Update article
    Object.assign(article, validatedData);

    // Handle publication scheduling
    if (article.publishedAt && article.status === ArticleStatus.DRAFT) {
      await scheduleArticlePublication(article._id.toString(), article.publishedAt);
    } else {
      cancelScheduledPublication(article._id.toString());
    }

    await article.save();
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

// Update article status
export const updateArticleStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this article' });
    }

    // Update status
    article.status = status;
    if (status === ArticleStatus.PUBLISHED) {
      article.publishedAt = new Date();
      cancelScheduledPublication(article._id.toString());
    }

    await article.save();
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

// Get article versions
export const getArticleVersions = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view article versions' });
    }

    res.json({
      currentVersion: article.version,
      versions: article.previousVersions || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete article
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete articles' });
    }

    // Cancel any scheduled publication
    cancelScheduledPublication(article._id.toString());

    await article.deleteOne();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 