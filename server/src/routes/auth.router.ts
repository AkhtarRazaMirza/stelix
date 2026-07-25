import { Router } from 'express';
import { AuthController } from '../controllers/auth.controllers.js';
import { verifyAccessToken, requireUserId } from '../middleware/auth.middleware.js';
import { asyncHandler, validate } from '../middleware/validate.middleware.js';
import {
    loginUserWithGoogleInput,
    updateUserProfileInput,
} from '../types/auth.type.js';

const router = Router();
const authController = new AuthController();

// Public routes
// NOTE: Email/password auth (register, verify-email, login, forgot/reset
// password) is disabled for V1. Google OAuth is the sole sign-in method.
// The underlying controller/service methods are retained but intentionally
// left unrouted so no unverifiable accounts can be created in production.
router.post('/google', validate({ body: loginUserWithGoogleInput }), asyncHandler((req, res) => authController.loginUserWithGoogle(req, res)));

// Protected routes
router.post('/logout', verifyAccessToken, asyncHandler((req, res) => authController.logout(req, res)));
router.put("/update-profile", verifyAccessToken, requireUserId, validate({ body: updateUserProfileInput }), asyncHandler((req, res) => authController.updateUserProfile(req, res)));
router.get('/me', verifyAccessToken, requireUserId, asyncHandler((req, res) => authController.getCurrentUser(req, res)));

export const authRoutes = router;
