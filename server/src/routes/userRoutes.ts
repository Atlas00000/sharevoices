import express from 'express';
import { auth } from '../middleware/auth';
import authorize from '../middleware/authorize';
import { UserRole } from '../models/User';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getAllUsers,
  updateUserRole
} from '../controllers/userController';

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
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.put('/preferences', auth, updateUserPreferences);

// Admin routes
router.get('/', auth, authorize(UserRole.ADMIN), getAllUsers);
router.put('/:userId/role', auth, authorize(UserRole.ADMIN), updateUserRole);

export default router; 