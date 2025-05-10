import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'user-service',
    version: process.env.npm_package_version || '1.0.0'
  });
});

export const healthRouter = router; 