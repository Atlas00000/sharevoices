
import { Router } from 'express';
import { AppDataSource } from '../config/database';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('SELECT 1');
    } else {
      throw new Error('Database not initialized');
    }
    
    res.status(200).json({
      status: 'healthy',
      service: 'notification',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'notification',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
