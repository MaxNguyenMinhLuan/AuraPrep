/**
 * Deep Link Generator
 *
 * Generates secure JWT tokens for email auto-login links.
 * Users can click the link in their email to automatically sign in.
 */
interface DeepLinkPayload {
    userId: string;
    email: string;
    purpose: 'email-nudge';
    iat?: number;
    exp?: number;
}
interface DeepLinkOptions {
    userId: string;
    email: string;
    expiryHours?: number;
}
/**
 * Generate a secure deep link for email auto-login
 */
export declare function generateDeepLink(options: DeepLinkOptions, jwtSecret: string, appUrl: string): string;
/**
 * Verify a deep link token
 */
export declare function verifyDeepLink(token: string, jwtSecret: string): DeepLinkPayload | null;
/**
 * Extract token from query string
 */
export declare function extractTokenFromQuery(query: string): string | null;
export {};
//# sourceMappingURL=deepLinkGenerator.d.ts.map