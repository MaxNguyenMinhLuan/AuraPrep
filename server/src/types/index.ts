import { Request } from 'express';
import mongoose from 'mongoose';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export interface AccessTokenPayload {
    userId: string;
    email: string;
    type: 'access';
}

export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
    type: 'refresh';
}

export interface GoogleUserInfo {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
    emailVerified: boolean;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export interface AuthResponseData {
    user: {
        id: string;
        email: string;
        name: string;
        photoUrl: string | null;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    isNewUser?: boolean;
}

export interface IUser {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    photoUrl?: string;
    authProvider: 'local' | 'google';
    googleId?: string;
    passwordHash?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
}

export interface IRefreshToken {
    _id: mongoose.Types.ObjectId;
    token: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    isRevoked: boolean;
    replacedByToken?: string;
    userAgent?: string;
    ipAddress?: string;
}
