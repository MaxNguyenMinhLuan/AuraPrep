import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),

    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auraprep'
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
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
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
