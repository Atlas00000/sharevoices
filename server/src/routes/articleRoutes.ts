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
import { auth, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { upload } from '../utils/imageUpload';

const router = express.Router();

// Public routes
router.get('/', getArticles); // Includes search and pagination
router.get('/:id', getArticle);

// Protected routes
router.post('/', 
  auth, 
  authorize(UserRole.ADMIN, UserRole.AUTHOR), 
  upload.single('featuredImage'),
  createArticle
);

router.put('/:id', 
  auth, 
  authorize(UserRole.ADMIN, UserRole.AUTHOR), 
  upload.single('featuredImage'),
  updateArticle
);

router.patch('/:id/status',
  auth,
  authorize(UserRole.ADMIN, UserRole.AUTHOR),
  updateArticleStatus
);

router.get('/:id/versions',
  auth,
  authorize(UserRole.ADMIN, UserRole.AUTHOR),
  getArticleVersions
);

router.delete('/:id', 
  auth, 
  authorize(UserRole.ADMIN), 
  deleteArticle
);

export default router; 