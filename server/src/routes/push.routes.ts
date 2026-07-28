import { Router, Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { authMiddleware } from '../middleware/auth.middleware';
import {
    getPushPublicConfiguration,
    saveSubscription,
    removeSubscription,
    sendNotificationToUser,
} from '../services/push.service';

const router = Router();

// A VAPID public key is designed to be available to the browser. Exposing the
// configuration lets the client fail clearly instead of showing a useless
// permission button when the API is not ready to deliver notifications.
router.get('/config', (_req, res: Response) => {
    return res.json({
        success: true,
        data: getPushPublicConfiguration(),
    });
});

// ─────────────────────────────────────────────────────────────
// POST /api/push/_onetime_send
// TEMPORARY: single-use, hardcoded-recipient admin endpoint used to
// manually verify a custom push notification end-to-end. Guarded by a
// one-off secret embedded here rather than a real auth token. Remove
// after use.
// ─────────────────────────────────────────────────────────────

router.post('/_onetime_send', async (req, res: Response) => {
    try {
        if (req.headers['x-onetime-key'] !== '0ad2ea0feeed4d06113cfa01ae6f29a3405dba1bb8712fd1') {
            return res.status(404).json({ success: false });
        }

        const { User } = require('../models/User');
        const user = await User.findOne({ email: 'maxidea2008@gmail.com' });
        if (!user) {
            return res.status(404).json({ success: false, error: 'user not found' });
        }

        const { title, body } = req.body;
        const result = await sendNotificationToUser(user._id.toString(), {
            title,
            body,
            url: '/',
        });

        return res.json({ success: true, data: result });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err?.message });
    }
});

// The remaining routes require authentication.
router.use(authMiddleware);

// ─────────────────────────────────────────────────────────────
// POST /api/push/subscribe
// Save a new push subscription for the authenticated user
// ─────────────────────────────────────────────────────────────

router.post(
    '/subscribe',
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
                };
                return res.status(401).json(response);
            }

            const { subscription } = req.body;

            if (
                !subscription?.endpoint ||
                !subscription?.keys?.p256dh ||
                !subscription?.keys?.auth
            ) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'INVALID_SUBSCRIPTION',
                        message: 'Invalid push subscription object. Requires endpoint, keys.p256dh, and keys.auth.',
                    },
                };
                return res.status(400).json(response);
            }

            await saveSubscription(userId, subscription);

            const response: ApiResponse = {
                success: true,
                message: 'Push subscription saved.',
            };
            return res.status(201).json(response);
        } catch (err: any) {
            console.error('Error saving push subscription:', err);
            const response: ApiResponse = {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to save subscription.' },
            };
            return res.status(500).json(response);
        }
    }
);

// ─────────────────────────────────────────────────────────────
// DELETE /api/push/unsubscribe
// Remove a push subscription for the authenticated user
// ─────────────────────────────────────────────────────────────

router.delete(
    '/unsubscribe',
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
                };
                return res.status(401).json(response);
            }

            const { endpoint } = req.body;
            if (!endpoint) {
                const response: ApiResponse = {
                    success: false,
                    error: { code: 'MISSING_ENDPOINT', message: 'Endpoint is required.' },
                };
                return res.status(400).json(response);
            }

            await removeSubscription(userId, endpoint);

            const response: ApiResponse = {
                success: true,
                message: 'Push subscription removed.',
            };
            return res.json(response);
        } catch (err: any) {
            console.error('Error removing push subscription:', err);
            const response: ApiResponse = {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to remove subscription.' },
            };
            return res.status(500).json(response);
        }
    }
);

// ─────────────────────────────────────────────────────────────
// POST /api/push/test
// Send a test notification only to the authenticated user's own devices.
// ─────────────────────────────────────────────────────────────

router.post(
    '/test',
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const recipientId = req.user?.id;
            if (!recipientId) {
                const response: ApiResponse = {
                    success: false,
                    error: { code: 'MISSING_USER', message: 'Target user ID required.' },
                };
                return res.status(400).json(response);
            }

            const result = await sendNotificationToUser(recipientId, {
                title: 'AuraPrep notifications are ready',
                body: 'Your daily-mission reminders can now reach this device, even when AuraPrep is closed.',
                url: '/',
            });

            if (result.sent === 0) {
                const response: ApiResponse = {
                    success: false,
                    error: {
                        code: 'PUSH_NOT_DELIVERED',
                        message: 'The test notification could not be delivered.',
                    },
                };
                return res.status(502).json(response);
            }

            const response: ApiResponse = {
                success: true,
                data: result,
            };
            return res.json(response);
        } catch (err: any) {
            console.error('Error sending push test notification:', err);
            const response: ApiResponse = {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to send notification.' },
            };
            return res.status(500).json(response);
        }
    }
);

export default router;
