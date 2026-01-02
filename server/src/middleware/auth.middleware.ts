import { Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { User } from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';

/**
 * Middleware to require authentication
 * Verifies the access token and adds user info to the request
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
        const payload = TokenService.verifyAccessToken(token);

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
        const payload = TokenService.verifyAccessToken(token);

        if (payload) {
            req.user = {
                id: payload.userId,
                email: payload.email
            };
        }
    }

    next();
};
