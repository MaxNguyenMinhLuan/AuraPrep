"use strict";
/**
 * Deep Link Generator
 *
 * Generates secure JWT tokens for email auto-login links.
 * Users can click the link in their email to automatically sign in.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeepLink = generateDeepLink;
exports.verifyDeepLink = verifyDeepLink;
exports.extractTokenFromQuery = extractTokenFromQuery;
const jwt = __importStar(require("jsonwebtoken"));
/**
 * Generate a secure deep link for email auto-login
 */
function generateDeepLink(options, jwtSecret, appUrl) {
    const { userId, email, expiryHours = 24 } = options;
    try {
        // Create JWT token
        const token = jwt.sign({
            userId,
            email,
            purpose: 'email-nudge'
        }, jwtSecret, {
            expiresIn: `${expiryHours}h`,
            algorithm: 'HS256'
        });
        // Construct deep link
        const baseUrl = appUrl.replace(/\/$/, ''); // Remove trailing slash
        const deepLink = `${baseUrl}/auto-login?token=${encodeURIComponent(token)}`;
        return deepLink;
    }
    catch (error) {
        console.error('Error generating deep link:', error);
        throw error;
    }
}
/**
 * Verify a deep link token
 */
function verifyDeepLink(token, jwtSecret) {
    try {
        const decoded = jwt.verify(token, jwtSecret, {
            algorithms: ['HS256']
        });
        // Validate purpose
        if (decoded.purpose !== 'email-nudge') {
            console.warn('Invalid deep link purpose:', decoded.purpose);
            return null;
        }
        return decoded;
    }
    catch (error) {
        console.error('Error verifying deep link:', error);
        return null;
    }
}
/**
 * Extract token from query string
 */
function extractTokenFromQuery(query) {
    const params = new URLSearchParams(query);
    return params.get('token');
}
//# sourceMappingURL=deepLinkGenerator.js.map