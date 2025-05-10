import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const authorizeRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'You do not have permission to perform this action' 
            });
        }

        next();
    };
}; 