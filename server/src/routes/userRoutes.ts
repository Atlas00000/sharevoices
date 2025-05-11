import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getAllUsers,
  updateUserRole
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.post('/register', (req, res) => {
  // TODO: Implement user registration
  res.status(501).json({ error: 'Not implemented' });
});

router.post('/login', (req, res) => {
  // TODO: Implement user login
  res.status(501).json({ error: 'Not implemented' });
});

// Protected routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.put('/preferences', authenticate, updateUserPreferences);

router.get('/admin/users',
  authenticate,
  authorize([UserRole.ADMIN]),
  (req, res) => {
    // TODO: Implement get all users (admin only)
    res.status(501).json({ error: 'Not implemented' });
  }
);

// Admin routes
router.get('/', authenticate, authorize([UserRole.ADMIN]), getAllUsers);
router.put('/:userId/role', authenticate, authorize([UserRole.ADMIN]), updateUserRole);

export default router; 