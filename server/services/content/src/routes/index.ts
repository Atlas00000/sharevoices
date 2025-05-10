import { Express } from 'express';
import articleRoutes from './article.routes';
 
export const setupRoutes = (app: Express) => {
  app.use('/api/articles', articleRoutes);
}; 