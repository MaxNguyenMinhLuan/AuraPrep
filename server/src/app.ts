import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import gameDataRoutes from './routes/gameData';
import analyticsRoutes from './routes/analytics';
import { ApiResponse } from './types';

const app: Express = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Compression for responses
app.use(compression());

// Trust proxy for rate limiting behind reverse proxy (Heroku, Render, etc.)
app.set('trust proxy', 1);

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.'
        }
    }
});

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.authMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please try again later.'
        }
    }
});

// Apply general rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors({
    origin: config.cors.origin,
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size

// Request logging in development
if (config.nodeEnv === 'development') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// Health check (no rate limit)
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// Auth routes with stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Game data routes
app.use('/api/game-data', gameDataRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    const response: ApiResponse = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found'
        }
    };
    res.status(404).json(response);
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);

    const response: ApiResponse = {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: config.nodeEnv === 'production'
                ? 'An unexpected error occurred'
                : err.message
        }
    };
    res.status(500).json(response);
});

export default app;
