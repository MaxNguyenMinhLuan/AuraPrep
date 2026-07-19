import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Convert a base64url-encoded VAPID public key to the Uint8Array
 * that PushManager.subscribe() expects.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export interface PushNotificationState {
    /** True if the current browser supports service workers + PushManager */
    isSupported: boolean;
    /** True if there is already an active push subscription */
    isSubscribed: boolean;
    /** True while a subscribe/unsubscribe operation is in progress */
    isLoading: boolean;
    /** The current Notification.permission value */
    permission: NotificationPermission | 'unsupported';
    /** Call this from a user-gesture handler (button tap) to request permission + subscribe */
    enableNotifications: () => Promise<boolean>;
    /** Unsubscribe from push notifications */
    disableNotifications: () => Promise<void>;
}

export function usePushNotifications(): PushNotificationState {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');

    // Check browser support and existing subscription on mount
    useEffect(() => {
        const checkSupport = async () => {
            const supported =
                'serviceWorker' in navigator &&
                'PushManager' in window &&
                'Notification' in window;

            setIsSupported(supported);

            if (!supported) {
                setPermission('unsupported');
                return;
            }

            setPermission(Notification.permission);

            // Check for existing subscription
            try {
                const registration = await navigator.serviceWorker.getRegistration('/sw.js');
                if (registration) {
                    const subscription = await registration.pushManager.getSubscription();
                    setIsSubscribed(!!subscription);
                }
            } catch (err) {
                console.warn('[Push] Error checking existing subscription:', err);
            }
        };

        checkSupport();
    }, []);

    const enableNotifications = useCallback(async (): Promise<boolean> => {
        if (!isSupported || !VAPID_PUBLIC_KEY) {
            console.warn('[Push] Not supported or VAPID key missing');
            return false;
        }

        setIsLoading(true);

        try {
            // 1. Register the service worker
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });
            await navigator.serviceWorker.ready;

            // 2. Request notification permission (iOS requires user gesture)
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                setIsLoading(false);
                return false;
            }

            // 3. Subscribe to push with VAPID key
            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey,
            });

            // 4. Extract the subscription keys
            const subscriptionJSON = subscription.toJSON();
            const subData = {
                endpoint: subscriptionJSON.endpoint!,
                keys: {
                    p256dh: subscriptionJSON.keys!.p256dh!,
                    auth: subscriptionJSON.keys!.auth!,
                },
            };

            // 5. Send to backend
            const authToken = await auth.currentUser?.getIdToken();
            if (!authToken) {
                console.warn('[Push] No auth token — cannot register subscription on server');
                setIsLoading(false);
                return false;
            }

            const response = await fetch(`${API_URL}/push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ subscription: subData }),
            });

            if (!response.ok) {
                console.error('[Push] Server rejected subscription:', await response.text());
                setIsLoading(false);
                return false;
            }

            setIsSubscribed(true);
            setIsLoading(false);
            return true;
        } catch (err) {
            console.error('[Push] Error enabling notifications:', err);
            setIsLoading(false);
            return false;
        }
    }, [isSupported]);

    const disableNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.getRegistration('/sw.js');
            if (registration) {
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    const endpoint = subscription.endpoint;

                    // Unsubscribe from browser
                    await subscription.unsubscribe();

                    // Remove from backend
                    const authToken = await auth.currentUser?.getIdToken();
                    if (authToken) {
                        await fetch(`${API_URL}/push/unsubscribe`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${authToken}`,
                            },
                            body: JSON.stringify({ endpoint }),
                        });
                    }
                }
            }
            setIsSubscribed(false);
        } catch (err) {
            console.error('[Push] Error disabling notifications:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isSupported,
        isSubscribed,
        isLoading,
        permission,
        enableNotifications,
        disableNotifications,
    };
}
