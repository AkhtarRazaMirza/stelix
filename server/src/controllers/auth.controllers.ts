import { AuthService } from '../services/auth.service.js';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';

const authService = new AuthService();

export class AuthController {
    public async createUserWithEmailAndPassword(req: Request, res: Response) {
        try {
            const result = await authService.createUserWithEmailPassword(req.body);

            // Return user data
            res.status(201).json({
                user: result.user
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    public async verifyEmail(req: Request, res: Response) {
        try {
            const token = req.query.token;

            if (typeof token !== "string") {
                res.status(400).json({
                    error: "Verification token is required"
                });
                return;
            }
            await authService.verifyEmail(token);

            // Return user data
            res.status(200).json({ message: 'Email verified successfully' });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    public async loginUserWithEmailAndPassword(req: Request, res: Response) {
        try {
            const result = await authService.loginUserWithEmailPassword(req.body);

            // Set secure HTTP-only cookies
            authService.setAuthCookies(res, result.accessToken);

            // Return user data without tokens (they're in cookies now)
            res.status(200).json({
                user: result.user
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    public async getCurrentUser(req: AuthRequest, res: Response) {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'User ID not found in token' });
                return;
            }

            const user = await authService.getUserById(req.userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.status(200).json({
                user: {
                    id: user.id,
                    full_name: user.fullName,
                    email: user.email,
                    created_at: user.createdAt,
                }
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    public async updateUserProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.userId) {
                res.status(401).json({ error: 'User ID not found in token' });
                return;
            }

            const result = await authService.updateUserProfile(req.userId, req.body);

            // Return user data
            res.status(200).json({
                result
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    public async forgotPassword(req: Request, res: Response) {
        try {
            const result = await authService.forgotPassword(req.body);

            // Return user data
            res.status(200).json({
                result
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    public async resetPassword(req: Request, res: Response) {
        try {
            const result = await authService.resetPassword(req.body);

            // Return user data
            res.status(200).json({
                result
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    public async loginUserWithGoogle(req: Request, res: Response) {
        try {
            const result = await authService.loginUserWithGoogle(req.body);

            // Set secure HTTP-only cookie
            authService.setAuthCookies(
                res,
                result.accessToken
            );

            // Return user data only
            res.status(200).json({
                user: result.user
            });
        } catch (error) {
            res.status(400).json({
                error: (error as Error).message
            });
        }
    }

    public async logout(req: AuthRequest, res: Response) {
        try {
            await authService.logoutUser(res);
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

}

