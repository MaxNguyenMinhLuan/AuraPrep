import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { TokenService } from '../services/token.service';
import { GoogleService } from '../services/google.service';
import { AuthenticatedRequest, ApiResponse, AuthResponseData } from '../types';

const SALT_ROUNDS = 12;

export class AuthController {
    /**
     * POST /api/auth/register
     * Register a new user with email/password
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'USER_EXISTS',
                        message: 'An account with this email already exists'
                    }
                };
                res.status(400).json(response);
                return;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

            // Create user
            const user = await User.create({
                email: email.toLowerCase(),
                name: name.trim(),
                passwordHash,
                authProvider: 'local',
                isEmailVerified: false
            });

            // Generate tokens
            const accessToken = TokenService.generateAccessToken(
                user._id.toString(),
                user.email
            );
            const { token: refreshToken } = await TokenService.generateRefreshToken(
                user._id,
                req.headers['user-agent'],
                req.ip || undefined
            );

            const response: ApiResponse<AuthResponseData> = {
                success: true,
                data: {
                    user: {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        photoUrl: user.photoUrl || null
                    },
                    accessToken,
                    refreshToken,
                    expiresIn: TokenService.getAccessTokenExpirySeconds(),
                    isNewUser: true
                }
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Registration error:', error);
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Registration failed. Please try again.'
                }
            };
            res.status(500).json(response);
        }
    }

    /**
     * POST /api/auth/login
     * Login with email/password
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Find user by email (local auth only)
            const user = await User.findOne({
                email: email.toLowerCase(),
                authProvider: 'local'
            });

            if (!user || !user.passwordHash) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid email or password'
                    }
                };
                res.status(401).json(response);
                return;
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPassword) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid email or password'
                    }
                };
                res.status(401).json(response);
                return;
            }

            // Check if account is active
            if (!user.isActive) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'ACCOUNT_INACTIVE',
                        message: 'This account has been deactivated'
                    }
                };
                res.status(403).json(response);
                return;
            }

            // Update last login
            user.lastLoginAt = new Date();
            await user.save();

            // Generate tokens
            const accessToken = TokenService.generateAccessToken(
                user._id.toString(),
                user.email
            );
            const { token: refreshToken } = await TokenService.generateRefreshToken(
                user._id,
                req.headers['user-agent'],
                req.ip || undefined
            );

            const response: ApiResponse<AuthResponseData> = {
                success: true,
                data: {
                    user: {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        photoUrl: user.photoUrl || null
                    },
                    accessToken,
                    refreshToken,
                    expiresIn: TokenService.getAccessTokenExpirySeconds()
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Login error:', error);
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Login failed. Please try again.'
                }
            };
            res.status(500).json(response);
        }
    }

    /**
     * POST /api/auth/google
     * Authenticate with Google OAuth
     */
    static async googleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { credential } = req.body;

            // Verify Google token server-side
            const googleUser = await GoogleService.verifyIdToken(credential);

            if (!googleUser) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'INVALID_GOOGLE_TOKEN',
                        message: 'Invalid or expired Google credentials'
                    }
                };
                res.status(401).json(response);
                return;
            }

            // Check if user exists by Google ID or email
            let user = await User.findOne({
                $or: [
                    { googleId: googleUser.googleId },
                    { email: googleUser.email.toLowerCase() }
                ]
            });

            let isNewUser = false;

            if (!user) {
                // Create new user
                isNewUser = true;
                user = await User.create({
                    email: googleUser.email.toLowerCase(),
                    name: googleUser.name,
                    photoUrl: googleUser.picture,
                    authProvider: 'google',
                    googleId: googleUser.googleId,
                    isEmailVerified: googleUser.emailVerified
                });
            } else {
                // Update existing user with latest Google info
                user.name = googleUser.name;
                if (googleUser.picture) {
                    user.photoUrl = googleUser.picture;
                }
                user.lastLoginAt = new Date();

                // Link Google account if user registered with email/password
                if (!user.googleId) {
                    user.googleId = googleUser.googleId;
                    user.isEmailVerified = true;
                }

                await user.save();
            }

            // Check if account is active
            if (!user.isActive) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'ACCOUNT_INACTIVE',
                        message: 'This account has been deactivated'
                    }
                };
                res.status(403).json(response);
                return;
            }

            // Generate tokens
            const accessToken = TokenService.generateAccessToken(
                user._id.toString(),
                user.email
            );
            const { token: refreshToken } = await TokenService.generateRefreshToken(
                user._id,
                req.headers['user-agent'],
                req.ip || undefined
            );

            const response: ApiResponse<AuthResponseData> = {
                success: true,
                data: {
                    user: {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        photoUrl: user.photoUrl || null
                    },
                    accessToken,
                    refreshToken,
                    expiresIn: TokenService.getAccessTokenExpirySeconds(),
                    isNewUser
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Google auth error:', error);
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Google authentication failed. Please try again.'
                }
            };
            res.status(500).json(response);
        }
    }

    /**
     * POST /api/auth/refresh
     * Refresh access token using refresh token
     */
    static async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            const result = await TokenService.rotateRefreshToken(
                refreshToken,
                req.headers['user-agent'],
                req.ip || undefined
            );

            if (!result) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'INVALID_REFRESH_TOKEN',
                        message: 'Refresh token is invalid, expired, or revoked'
                    }
                };
                res.status(401).json(response);
                return;
            }

            const response: ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }> = {
                success: true,
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresIn: TokenService.getAccessTokenExpirySeconds()
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Token refresh error:', error);
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Token refresh failed. Please log in again.'
                }
            };
            res.status(500).json(response);
        }
    }

    /**
     * POST /api/auth/logout
     * Logout and revoke refresh tokens
     */
    static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;

            // Revoke all refresh tokens for this user
            await TokenService.revokeAllUserTokens(userId);

            const response: ApiResponse = {
                success: true,
                message: 'Logged out successfully'
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Logout error:', error);
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Logout failed'
                }
            };
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/auth/me
     * Get current user info
     */
    static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = await User.findById(req.user!.id).select('-passwordHash');

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found'
                    }
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse<{
                user: {
                    id: string;
                    email: string;
                    name: string;
                    photoUrl: string | null;
                    authProvider: string;
                    isEmailVerified: boolean;
                };
            }> = {
                success: true,
                data: {
                    user: {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        photoUrl: user.photoUrl || null,
                        authProvider: user.authProvider,
                        isEmailVerified: user.isEmailVerified
                    }
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Get user error:', error);
            const response: ApiResponse = {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get user info'
                }
            };
            res.status(500).json(response);
        }
    }
}
