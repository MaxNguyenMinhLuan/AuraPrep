import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { User } from '../models/User';

const router = Router();

// Validation schema for sign-nda
const signNdaSchema = z.object({
    body: z.object({
        versionAccepted: z.string().min(1, 'Version accepted is required'),
        legalName: z.string().min(2, 'Legal name must be at least 2 characters').trim()
    })
});

/**
 * POST /api/v1/compliance/sign-nda
 * Record NDA acceptance for the authenticated user
 */
router.post(
    '/sign-nda',
    authMiddleware,
    validate(signNdaSchema),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const { versionAccepted, legalName } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Check if NDA already signed
            if (user.ndaCompliance?.hasSigned === true) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: 'NDA_ALREADY_SIGNED',
                        message: 'NDA has already been signed'
                    }
                });
                return;
            }

            // Extract IP address
            const forwardedFor = req.headers['x-forwarded-for'];
            const ipAddress = forwardedFor
                ? String(forwardedFor).split(',')[0].trim()
                : req.ip;

            // Extract User-Agent
            const clientUserAgent = req.headers['user-agent'] || '';

            // Update user with NDA compliance data
            const ndaCompliance = {
                hasSigned: true,
                legalName: legalName.trim(),
                signedVersion: versionAccepted,
                timestamp: new Date(),
                ipAddress,
                clientUserAgent
            };

            user.ndaCompliance = ndaCompliance as any;
            await user.save();

            res.status(201).json({
                success: true,
                data: {
                    ndaCompliance
                }
            });
            return;
        } catch (error) {
            console.error('Error signing NDA:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    }
);

/**
 * GET /api/v1/compliance/status
 * Get NDA compliance status for the authenticated user
 */
router.get(
    '/status',
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const user = await User.findById(userId).select('ndaCompliance');
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    ndaCompliance: user.ndaCompliance || { hasSigned: false }
                }
            });
            return;
        } catch (error) {
            console.error('Error fetching NDA status:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    }
);

export default router;
