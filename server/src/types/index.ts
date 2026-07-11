import { Request } from 'express';
import mongoose from 'mongoose';

export interface AuthenticatedRequest<
    P = import('express-serve-static-core').ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = import('express-serve-static-core').Query,
    Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
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

export interface INdaCompliance {
    hasSigned: boolean;
    legalName?: string;
    signedVersion?: string;
    timestamp?: Date;
    ipAddress?: string;
    clientUserAgent?: string;
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
    timezone?: string;
    emailNotificationsEnabled?: boolean;
    ndaCompliance?: INdaCompliance;
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

export interface DBQuestion {
    Question: string;
    A: string;
    B: string;
    C: string;
    D: string;
    CorrectAns: 'A' | 'B' | 'C' | 'D';
    Type: string;
    Difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extra Hard';
    Source: string;
    Explanation?: string; 
    GraphData?: any;
}
