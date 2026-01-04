import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Parse CORS origins (comma-separated for multiple origins)
const parseCorsOrigins = (): string | string[] => {
    const origins = process.env.CORS_ORIGIN || 'http://localhost:5173';
    if (origins.includes(',')) {
        return origins.split(',').map(o => o.trim());
    }
    return origins;
};

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),

    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auraprep',
        // Connection pool settings for production scalability
        options: {
            maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10', 10),
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },

    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
        accessTokenExpiry: '15m',
        refreshTokenExpiryDays: 7,
        issuer: 'auraprep-api',
        audience: 'auraprep-client'
    },

    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || ''
    },

    cors: {
        origin: parseCorsOrigins()
    },

    // Rate limiting settings
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
        authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10', 10) // 10 auth attempts per window
    }
};

export function validateConfig(): void {
    const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0 && config.nodeEnv === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (!config.google.clientId) {
        console.warn('Warning: GOOGLE_CLIENT_ID not set. Google OAuth will not work.');
    }
}
