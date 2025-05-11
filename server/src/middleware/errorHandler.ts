import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message || err });
} 