import { Request, Response } from 'express';
import { Article, ArticleSchema } from '../models/Article';

// Get all articles
export const getArticles = async (req: Request, res: Response) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
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
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Create article
export const createArticle = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = ArticleSchema.parse(req.body);
    
    const article = new Article(validatedData);
    await article.save();
    
    res.status(201).json(article);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create article' });
    }
  }
};

// Update article
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const validatedData = ArticleSchema.parse(req.body);
    
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update article' });
    }
  }
};

// Delete article
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
}; 