import type { Request, Response, NextFunction } from 'express';
import { TokenService } from '../config/jwt.js';

export interface AuthRequest extends Request {
    userId?: string;
}

const tokenSwrvice = new TokenService

export function verifyAccessToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            res.status(401).json({ error: 'No access token provided' });
            return;
        }

        const decoded = tokenSwrvice.verifyAccessToken(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid or expired access token' });
            return;
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

export function verifyRefreshTokenMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(401).json({ error: 'No refresh token provided' });
            return;
        }

        const decoded = tokenSwrvice.verifyEmailVerificationToken(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid or expired refresh token' });
            return;
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
}
