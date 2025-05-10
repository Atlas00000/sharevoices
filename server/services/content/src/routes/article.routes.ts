import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { validateArticle } from '../middleware/validation';

const router = Router();
const articleController = new ArticleController();

// GET /api/articles - Get all articles
router.get('/', articleController.getAllArticles);

// GET /api/articles/:id - Get article by ID
router.get('/:id', articleController.getArticleById);

// POST /api/articles - Create new article
router.post('/', validateArticle, articleController.createArticle);

// PUT /api/articles/:id - Update article
router.put('/:id', validateArticle, articleController.updateArticle);

// DELETE /api/articles/:id - Delete article
router.delete('/:id', articleController.deleteArticle);

// GET /api/articles/category/:category - Get articles by category
router.get('/category/:category', articleController.getArticlesByCategory);

// GET /api/articles/search - Search articles
router.get('/search', articleController.searchArticles);

export default router; 