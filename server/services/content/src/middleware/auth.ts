import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Remove AppDataSource and User imports for now, or adjust to use MongoDB if needed

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateJWT = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role?: string };
        // For MongoDB, you may want to fetch the user from your User model here
        req.user = { id: decoded.id, role: decoded.role || 'user' };
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}; 