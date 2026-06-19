import { Router } from 'express';
import { AuthController } from '../controllers/auth.controllers.js';
import { verifyAccessToken, requireUserId } from '../middleware/auth.middleware.js';
import { asyncHandler, validate } from '../middleware/validate.middleware.js';
import {
    createUserWithEmailPasswordInput,
    loginUserWithEmailPasswordInput,
    forgotPasswordInput,
    resetPasswordInput,
    loginUserWithGoogleInput,
    verifyEmailInput,
    updateUserProfileInput,
} from '../types/auth.type.js';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validate({ body: createUserWithEmailPasswordInput }), asyncHandler((req, res) => authController.createUserWithEmailAndPassword(req, res)));
router.get('/verify-email', validate({ query: verifyEmailInput }), asyncHandler((req, res) => authController.verifyEmail(req, res)));
router.post('/login', validate({ body: loginUserWithEmailPasswordInput }), asyncHandler((req, res) => authController.loginUserWithEmailAndPassword(req, res)));
router.post('/forgot-password', validate({ body: forgotPasswordInput }), asyncHandler((req, res) => authController.forgotPassword(req, res)));
router.post('/reset-password', validate({ body: resetPasswordInput }), asyncHandler((req, res) => authController.resetPassword(req, res)));
router.post('/google', validate({ body: loginUserWithGoogleInput }), asyncHandler((req, res) => authController.loginUserWithGoogle(req, res)));

// Protected routes
router.post('/logout', verifyAccessToken, asyncHandler((req, res) => authController.logout(req, res)));
router.put("/update-profile", verifyAccessToken, requireUserId, validate({ body: updateUserProfileInput }), asyncHandler((req, res) => authController.updateUserProfile(req, res)));
router.get('/me', verifyAccessToken, requireUserId, asyncHandler((req, res) => authController.getCurrentUser(req, res)));

export const authRoutes = router;
