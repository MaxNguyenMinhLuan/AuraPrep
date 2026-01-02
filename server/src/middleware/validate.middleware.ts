import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

/**
 * Middleware factory for request validation using Zod
 */
export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: error.errors.map(e => ({
                            field: e.path.join('.'),
                            message: e.message
                        }))
                    }
                };
                res.status(400).json(response);
                return;
            }
            next(error);
        }
    };
};

// Validation schemas

export const registerSchema = z.object({
    body: z.object({
        email: z.string()
            .email('Invalid email format')
            .max(255, 'Email too long'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password too long')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        name: z.string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name too long')
            .trim()
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string()
            .email('Invalid email format'),
        password: z.string()
            .min(1, 'Password is required')
    })
});

export const googleAuthSchema = z.object({
    body: z.object({
        credential: z.string()
            .min(1, 'Google credential is required')
    })
});

export const refreshSchema = z.object({
    body: z.object({
        refreshToken: z.string()
            .min(1, 'Refresh token is required')
    })
});

export const logoutSchema = z.object({
    body: z.object({
        refreshToken: z.string().optional()
    })
});
