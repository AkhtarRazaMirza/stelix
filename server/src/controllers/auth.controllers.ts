import { AuthService } from '../services/auth.service.js';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../errors/app.errors.js';
import { logger } from '../config/logger.js';

const authService = new AuthService();

export class AuthController {
    public async createUserWithEmailAndPassword(req: Request, res: Response) {
        logger.info("POST /api/auth/register", {
            requestId: (req as AuthRequest).requestId,
            route: req.path,
        });

        const result = await authService.createUserWithEmailPassword(req.body);

        res.status(201).json({
            user: result.user
        });
    }

    public async verifyEmail(req: Request, res: Response) {
        logger.info("GET /api/auth/verify-email", {
            requestId: (req as AuthRequest).requestId,
            route: req.path,
        });

        const token = req.query.token;

        if (typeof token !== "string") {
            throw new ValidationError("Verification token is required");
        }

        await authService.verifyEmail(token);

        res.status(200).json({ message: 'Email verified successfully' });
    }

    public async loginUserWithEmailAndPassword(req: Request, res: Response) {
        logger.info("POST /api/auth/login", {
            requestId: (req as AuthRequest).requestId,
            route: req.path,
        });

        const result = await authService.loginUserWithEmailPassword(req.body);

        authService.setAuthCookies(res, result.accessToken);

        res.status(200).json({
            user: result.user
        });
    }

    public async getCurrentUser(req: AuthRequest, res: Response) {
        logger.info("GET /api/auth/me", {
            userId: req.userId,
            requestId: req.requestId,
            route: req.path,
        });

        if (!req.userId) {
            throw new UnauthorizedError('User ID not found in token');
        }

        const user = await authService.getUserById(req.userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.status(200).json({
            user: {
                id: user.id,
                full_name: user.fullName,
                email: user.email,
                created_at: user.createdAt,
            }
        });
    }

    public async updateUserProfile(req: AuthRequest, res: Response) {
        logger.info("PUT /api/auth/update-profile", {
            userId: req.userId,
            requestId: req.requestId,
            route: req.path,
        });

        if (!req.userId) {
            throw new UnauthorizedError('User ID not found in token');
        }

        const result = await authService.updateUserProfile(req.userId, req.body);

        res.status(200).json({
            result
        });
    }

    public async forgotPassword(req: Request, res: Response) {
        logger.info("POST /api/auth/forgot-password", {
            requestId: (req as AuthRequest).requestId,
            route: req.path,
        });

        const result = await authService.forgotPassword(req.body);

        res.status(200).json({
            result
        });
    }

    public async resetPassword(req: Request, res: Response) {
        logger.info("POST /api/auth/reset-password", {
            requestId: (req as AuthRequest).requestId,
            route: req.path,
        });

        const result = await authService.resetPassword(req.body);

        res.status(200).json({
            result
        });
    }

    public async loginUserWithGoogle(req: Request, res: Response) {
        logger.info("POST /api/auth/google", {
            requestId: (req as AuthRequest).requestId,
            route: req.path,
        });

        const result = await authService.loginUserWithGoogle(req.body);

        authService.setAuthCookies(res, result.accessToken);

        res.status(200).json({
            user: result.user
        });
    }

    public async logout(req: AuthRequest, res: Response) {
        logger.info("POST /api/auth/logout", {
            userId: req.userId,
            requestId: req.requestId,
            route: req.path,
        });

        await authService.logoutUser(res);
        res.status(200).json({ message: 'Logged out successfully' });
    }
}