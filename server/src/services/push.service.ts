import webpush from 'web-push';
import { config } from '../config';
import { PushSubscription } from '../models/PushSubscription';

// ─────────────────────────────────────────────────────────────
// VAPID Configuration
// ─────────────────────────────────────────────────────────────

const vapidPublicKey = config.vapid.publicKey;
const vapidPrivateKey = config.vapid.privateKey;
const vapidContactEmail = config.vapid.contactEmail;

export const isPushConfigured = (): boolean => Boolean(vapidPublicKey && vapidPrivateKey);

/**
 * VAPID's public key is intentionally safe to expose to the browser. The
 * private key remains only on the API server and signs outgoing push requests.
 */
export const getPushPublicConfiguration = (): { enabled: boolean; publicKey: string | null } => ({
    enabled: isPushConfigured(),
    publicKey: isPushConfigured() ? vapidPublicKey : null,
});

if (isPushConfigured()) {
    webpush.setVapidDetails(vapidContactEmail, vapidPublicKey, vapidPrivateKey);
} else {
    console.warn('⚠️  VAPID keys not configured — Web Push will not work.');
}

// ─────────────────────────────────────────────────────────────
// Save a push subscription for a user
// ─────────────────────────────────────────────────────────────

export async function saveSubscription(
    userId: string,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
): Promise<void> {
    await PushSubscription.findOneAndUpdate(
        { userId, 'subscription.endpoint': subscription.endpoint },
        { userId, subscription },
        { upsert: true, new: true }
    );
}

// ─────────────────────────────────────────────────────────────
// Remove a specific subscription
// ─────────────────────────────────────────────────────────────

export async function removeSubscription(
    userId: string,
    endpoint: string
): Promise<void> {
    await PushSubscription.deleteOne({ userId, 'subscription.endpoint': endpoint });
}

// ─────────────────────────────────────────────────────────────
// Send push notification to all devices for a user
// ─────────────────────────────────────────────────────────────

interface PushPayload {
    title: string;
    body: string;
    url?: string;
}

export async function sendNotificationToUser(
    userId: string,
    payload: PushPayload
): Promise<{ sent: number; failed: number }> {
    if (!isPushConfigured()) {
        console.error('Push send skipped: VAPID keys are not configured.');
        return { sent: 0, failed: 0 };
    }

    const subscriptions = await PushSubscription.find({ userId });

    if (subscriptions.length === 0) {
        return { sent: 0, failed: 0 };
    }

    const payloadString = JSON.stringify(payload);
    let sent = 0;
    let failed = 0;

    const results = subscriptions.map(async (doc) => {
        try {
            await webpush.sendNotification(doc.subscription, payloadString);
            sent++;
        } catch (err: any) {
            const statusCode = err?.statusCode;
            // 410 Gone or 404 Not Found → subscription is dead, clean up
            if (statusCode === 410 || statusCode === 404) {
                await PushSubscription.deleteOne({ _id: doc._id });
                console.log(`🗑️  Deleted expired push subscription for user ${userId} (${statusCode})`);
            } else {
                console.error(`Push failed for user ${userId}:`, err?.message || err);
            }
            failed++;
        }
    });

    await Promise.allSettled(results);
    return { sent, failed };
}

// ─────────────────────────────────────────────────────────────
// Broadcast to all users (admin utility)
// ─────────────────────────────────────────────────────────────

export async function broadcastNotification(
    payload: PushPayload
): Promise<{ sent: number; failed: number }> {
    if (!isPushConfigured()) {
        console.error('Push broadcast skipped: VAPID keys are not configured.');
        return { sent: 0, failed: 0 };
    }

    const allSubscriptions = await PushSubscription.find({});
    const payloadString = JSON.stringify(payload);
    let sent = 0;
    let failed = 0;

    const results = allSubscriptions.map(async (doc) => {
        try {
            await webpush.sendNotification(doc.subscription, payloadString);
            sent++;
        } catch (err: any) {
            const statusCode = err?.statusCode;
            if (statusCode === 410 || statusCode === 404) {
                await PushSubscription.deleteOne({ _id: doc._id });
            }
            failed++;
        }
    });

    await Promise.allSettled(results);
    return { sent, failed };
}
