import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import {
    validate,
    registerSchema,
    loginSchema,
    googleAuthSchema,
    refreshSchema,
    logoutSchema
} from '../middleware/validate.middleware';

const router = Router();

// Public routes (no auth required)
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/google', validate(googleAuthSchema), AuthController.googleAuth);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.post('/verify-email-token', AuthController.verifyEmailToken);

// Protected routes (auth required)
router.post('/logout', authMiddleware, validate(logoutSchema), AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

export default router;
