/**
 * Deep Link Generator
 *
 * Generates secure JWT tokens for email auto-login links.
 * Users can click the link in their email to automatically sign in.
 */

import * as jwt from 'jsonwebtoken';

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
export function generateDeepLink(
  options: DeepLinkOptions,
  jwtSecret: string,
  appUrl: string
): string {
  const { userId, email, expiryHours = 24 } = options;

  try {
    // Create JWT token
    const token = jwt.sign(
      {
        userId,
        email,
        purpose: 'email-nudge'
      },
      jwtSecret,
      {
        expiresIn: `${expiryHours}h`,
        algorithm: 'HS256'
      }
    );

    // Construct deep link
    const baseUrl = appUrl.replace(/\/$/, ''); // Remove trailing slash
    const deepLink = `${baseUrl}/auto-login?token=${encodeURIComponent(token)}`;

    return deepLink;
  } catch (error) {
    console.error('Error generating deep link:', error);
    throw error;
  }
}

/**
 * Verify a deep link token
 */
export function verifyDeepLink(token: string, jwtSecret: string): DeepLinkPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256']
    }) as DeepLinkPayload;

    // Validate purpose
    if (decoded.purpose !== 'email-nudge') {
      console.warn('Invalid deep link purpose:', decoded.purpose);
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error verifying deep link:', error);
    return null;
  }
}

/**
 * Extract token from query string
 */
export function extractTokenFromQuery(query: string): string | null {
  const params = new URLSearchParams(query);
  return params.get('token');
}
