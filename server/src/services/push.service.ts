import webpush from 'web-push';
import { config } from '../config';
import { PushSubscription } from '../models/PushSubscription';

// ─────────────────────────────────────────────────────────────
// VAPID Configuration
// ─────────────────────────────────────────────────────────────

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidContactEmail = process.env.VAPID_CONTACT_EMAIL || 'mailto:admin@auraprep.academy';

if (vapidPublicKey && vapidPrivateKey) {
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
