import express from 'express';
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
router.get('/profile',
  authenticate,
  (req, res) => {
    // TODO: Implement get user profile
    res.status(501).json({ error: 'Not implemented' });
  }
);

router.put('/profile',
  authenticate,
  (req, res) => {
    // TODO: Implement update user profile
    res.status(501).json({ error: 'Not implemented' });
  }
);

router.get('/admin/users',
  authenticate,
  authorize([UserRole.ADMIN]),
  (req, res) => {
    // TODO: Implement get all users (admin only)
    res.status(501).json({ error: 'Not implemented' });
  }
);

export default router; 