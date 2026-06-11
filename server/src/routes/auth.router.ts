import { Router } from 'express';
import { AuthController } from '../controllers/auth.controllers.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', (req, res) => authController.createUserWithEmailAndPassword(req, res));
router.get('/verify-email', (req, res) => authController.verifyEmail(req, res));
router.post('/login', (req, res) => authController.loginUserWithEmailAndPassword(req, res));
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
router.post('/google', (req, res) => authController.loginUserWithGoogle(req, res));

// Protected routes
router.post('/logout', verifyAccessToken, (req, res) => authController.logout(req, res));
router.put("/update-profile", verifyAccessToken, (req, res) => authController.updateUserProfile(req, res))
router.get('/me', verifyAccessToken, (req, res) => authController.getCurrentUser(req, res));

export const authRoutes = router;

