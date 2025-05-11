import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as UserRole;
    if (!req.user || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    next();
  };
};

export default authorize; 