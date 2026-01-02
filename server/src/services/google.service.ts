import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';
import { GoogleUserInfo } from '../types';

const client = new OAuth2Client(config.google.clientId);

export class GoogleService {
    /**
     * Verify a Google ID token and extract user info
     */
    static async verifyIdToken(credential: string): Promise<GoogleUserInfo | null> {
        try {
            if (!config.google.clientId) {
                console.error('Google Client ID not configured');
                return null;
            }

            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: config.google.clientId
            });

            const payload = ticket.getPayload();

            if (!payload) {
                console.error('Google token verification failed: no payload');
                return null;
            }

            // Verify token is not expired
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                console.error('Google token verification failed: token expired');
                return null;
            }

            // Verify issuer
            const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
            if (!validIssuers.includes(payload.iss || '')) {
                console.error('Google token verification failed: invalid issuer');
                return null;
            }

            // Ensure we have required fields
            if (!payload.sub || !payload.email) {
                console.error('Google token verification failed: missing sub or email');
                return null;
            }

            return {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name || payload.email.split('@')[0],
                picture: payload.picture,
                emailVerified: payload.email_verified || false
            };
        } catch (error) {
            console.error('Google token verification error:', error);
            return null;
        }
    }
}
