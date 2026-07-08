import { Response, NextFunction } from 'express';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { TokenService } from '../services/token.service';
import { User } from '../models/User';
import { config } from '../config';
import { AuthenticatedRequest, ApiResponse } from '../types';

// Initialize Firebase Admin
if (getApps().length === 0) {
    try {
        initializeApp({
            projectId: config.firebase.projectId
        });
        console.log(`Firebase Admin initialized with project ID: ${config.firebase.projectId}`);
    } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error);
    }
}

interface DecodedTokenPayload {
    userId: string;
    email: string;
}

/**
 * Helper to verify either a local JWT or a Firebase ID token
 * Returns mapped user ID and email, or null if invalid
 */
const verifyToken = async (token: string): Promise<DecodedTokenPayload | null> => {
    // 1. Try verifying as local backend JWT first
    const localPayload = TokenService.verifyAccessToken(token);
    if (localPayload) {
        return {
            userId: localPayload.userId,
            email: localPayload.email
        };
    }

    // 2. Try verifying as Firebase ID token
    try {
        const decodedFirebaseToken = await getAuth().verifyIdToken(token);
        if (!decodedFirebaseToken.email) {
            console.error('Firebase token is missing email address');
            return null;
        }

        const email = decodedFirebaseToken.email.toLowerCase();

        // Find existing MongoDB user or create a new one
        let user = await User.findOne({ email });
        if (!user) {
            console.log(`Creating new MongoDB user for verified Firebase account: ${email}`);
            const provider = decodedFirebaseToken.firebase?.sign_in_provider === 'google.com' ? 'google' : 'local';
            user = await User.create({
                email,
                name: decodedFirebaseToken.name || email.split('@')[0],
                photoUrl: decodedFirebaseToken.picture || null,
                authProvider: provider,
                googleId: decodedFirebaseToken.firebase?.sign_in_provider === 'google.com' ? decodedFirebaseToken.uid : undefined,
                isEmailVerified: decodedFirebaseToken.email_verified || false,
                isActive: true
            });
        }

        return {
            userId: user._id.toString(),
            email: user.email
        };
    } catch (firebaseError: any) {
        // Log only if it is not a signature mismatch/expired (to avoid polluting logs)
        if (firebaseError.code !== 'auth/argument-error') {
            console.error('Firebase token verification failed:', firebaseError.message);
        }
        return null;
    }
};

/**
 * Middleware to require authentication
 * Verifies the token (local JWT or Firebase ID token) and adds user info to the request
 */
export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Access token required'
                }
            };
            res.status(401).json(response);
            return;
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (!payload) {
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Access token is invalid or expired'
                }
            };
            res.status(401).json(response);
            return;
        }

        // Verify user still exists and is active
        const user = await User.findById(payload.userId).select('isActive');
        if (!user || !user.isActive) {
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'USER_INACTIVE',
                    message: 'User account is inactive or deleted'
                }
            };
            res.status(401).json(response);
            return;
        }

        req.user = {
            id: payload.userId,
            email: payload.email
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        const response: ApiResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Authentication failed'
            }
        };
        res.status(500).json(response);
    }
};

/**
 * Optional auth middleware - doesn't fail if no token present
 * Adds user info to request if valid token is provided
 */
export const optionalAuthMiddleware = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (payload) {
            req.user = {
                id: payload.userId,
                email: payload.email
            };
        }
    }

    next();
};
