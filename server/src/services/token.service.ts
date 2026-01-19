import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { config } from '../config';
import { RefreshToken } from '../models/RefreshToken';
import { User } from '../models/User';
import { AccessTokenPayload, RefreshTokenPayload } from '../types';

export class TokenService {
    /**
     * Generate a short-lived access token
     */
    static generateAccessToken(userId: string, email: string): string {
        const payload: AccessTokenPayload = {
            userId,
            email,
            type: 'access'
        };

        const options: SignOptions = {
            expiresIn: config.jwt.accessTokenExpiry,
            issuer: config.jwt.issuer,
            audience: config.jwt.audience
        };

        return jwt.sign(payload, config.jwt.accessTokenSecret, options);
    }

    /**
     * Generate a refresh token and store it in the database
     */
    static async generateRefreshToken(
        userId: mongoose.Types.ObjectId,
        userAgent?: string,
        ipAddress?: string
    ): Promise<{ token: string; expiresAt: Date }> {
        const tokenId = crypto.randomBytes(32).toString('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshTokenExpiryDays);

        const payload: RefreshTokenPayload = {
            userId: userId.toString(),
            tokenId,
            type: 'refresh'
        };

        const token = jwt.sign(payload, config.jwt.refreshTokenSecret, {
            expiresIn: `${config.jwt.refreshTokenExpiryDays}d`
        });

        // Store token ID in database for tracking
        await RefreshToken.create({
            token: tokenId,
            userId,
            expiresAt,
            userAgent,
            ipAddress
        });

        return { token, expiresAt };
    }

    /**
     * Verify an access token and return the payload
     */
    static verifyAccessToken(token: string): AccessTokenPayload | null {
        try {
            const decoded = jwt.verify(token, config.jwt.accessTokenSecret, {
                issuer: config.jwt.issuer,
                audience: config.jwt.audience
            }) as AccessTokenPayload;

            if (decoded.type !== 'access') {
                return null;
            }

            return decoded;
        } catch {
            return null;
        }
    }

    /**
     * Verify and rotate a refresh token
     * Returns new tokens if valid, null if invalid
     */
    static async rotateRefreshToken(
        token: string,
        userAgent?: string,
        ipAddress?: string
    ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date } | null> {
        try {
            const decoded = jwt.verify(
                token,
                config.jwt.refreshTokenSecret
            ) as RefreshTokenPayload;

            if (decoded.type !== 'refresh') {
                return null;
            }

            // Find the stored refresh token
            const storedToken = await RefreshToken.findOne({
                token: decoded.tokenId,
                isRevoked: false
            });

            if (!storedToken) {
                // Token not found or already revoked - possible reuse attack
                // Revoke all tokens for this user as a security measure
                await RefreshToken.updateMany(
                    { userId: new mongoose.Types.ObjectId(decoded.userId) },
                    { isRevoked: true }
                );
                console.warn(`Potential token reuse detected for user ${decoded.userId}`);
                return null;
            }

            // Check expiration
            if (storedToken.expiresAt < new Date()) {
                storedToken.isRevoked = true;
                await storedToken.save();
                return null;
            }

            // Revoke the old token
            storedToken.isRevoked = true;

            // Get user for the new access token
            const user = await User.findById(decoded.userId);
            if (!user || !user.isActive) {
                await storedToken.save();
                return null;
            }

            // Generate new tokens
            const userId = new mongoose.Types.ObjectId(decoded.userId);
            const { token: newRefreshToken, expiresAt } = await this.generateRefreshToken(
                userId,
                userAgent,
                ipAddress
            );

            // Link old token to new for audit trail
            storedToken.replacedByToken = newRefreshToken;
            await storedToken.save();

            const accessToken = this.generateAccessToken(decoded.userId, user.email);

            return { accessToken, refreshToken: newRefreshToken, expiresAt };
        } catch {
            return null;
        }
    }

    /**
     * Revoke all refresh tokens for a user
     */
    static async revokeAllUserTokens(userId: string): Promise<void> {
        await RefreshToken.updateMany(
            { userId: new mongoose.Types.ObjectId(userId) },
            { isRevoked: true }
        );
    }

    /**
     * Revoke a specific refresh token by its ID
     */
    static async revokeTokenById(tokenId: string): Promise<void> {
        await RefreshToken.updateOne(
            { token: tokenId },
            { isRevoked: true }
        );
    }

    /**
     * Verify an email token (for auto-login from email links)
     * Email tokens are generated by Cloud Functions with purpose: 'email-nudge'
     */
    static verifyEmailToken(token: string): { userId: string; email: string } | null {
        try {
            const decoded = jwt.verify(token, config.jwt.accessTokenSecret) as any;

            // Validate token purpose
            if (decoded.purpose !== 'email-nudge') {
                return null;
            }

            return {
                userId: decoded.userId,
                email: decoded.email
            };
        } catch (error) {
            console.error('Email token verification error:', error);
            return null;
        }
    }

    /**
     * Get access token expiry in seconds
     */
    static getAccessTokenExpirySeconds(): number {
        // Parse the expiry string (e.g., '15m' -> 900)
        const expiry = config.jwt.accessTokenExpiry;
        const value = parseInt(expiry);
        const unit = expiry.slice(-1);

        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 900; // Default 15 minutes
        }
    }
}
