import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import { ApiResponse } from './types';

const app: Express = express();

// Middleware
app.use(cors({
    origin: config.cors.origin,
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);

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
