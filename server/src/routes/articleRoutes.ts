import express from 'express';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  updateArticleStatus,
  getArticleVersions
} from '../controllers/articleController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.get('/', getArticles); // Includes search and pagination
router.get('/:id', getArticle);

// Protected routes
router.post('/', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.AUTHOR]), 
  createArticle
);

router.put('/:id', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.AUTHOR]), 
  updateArticle
);

router.patch('/:id/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.AUTHOR]),
  updateArticleStatus
);

router.get('/:id/versions',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.AUTHOR]),
  getArticleVersions
);

router.delete('/:id', 
  authenticate, 
  authorize([UserRole.ADMIN]), 
  deleteArticle
);

export default router; 