import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error(`${err.statusCode} - ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack
  });

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or other unknown error: don't leak error details
  // Send generic message
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};
