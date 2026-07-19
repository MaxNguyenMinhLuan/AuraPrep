import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

type PushPermission = NotificationPermission | 'unsupported';

export interface EnableNotificationsResult {
    enabled: boolean;
    testSent: boolean;
}

export interface PushNotificationState {
    /** True when this browser can create a Web Push subscription right now. */
    isSupported: boolean;
    /** True when the app is running from an installed PWA window. */
    isInstalled: boolean;
    /** iOS/iPadOS only: the user must add AuraPrep to the Home Screen first. */
    requiresInstallation: boolean;
    /** Null while checking the server configuration. */
    isConfigured: boolean | null;
    /** True if there is already an active push subscription on this device. */
    isSubscribed: boolean;
    /** True while subscribing, unsubscribing, or sending a test notification. */
    isLoading: boolean;
    /** The current Notification.permission value. */
    permission: PushPermission;
    /** A user-safe explanation when setup cannot continue. */
    error: string | null;
    /** Call directly from a button tap. It invokes the native system permission prompt. */
    enableNotifications: () => Promise<EnableNotificationsResult>;
    /** Send an authenticated test notification through the Web Push service. */
    sendTestNotification: () => Promise<boolean>;
    /** Unsubscribe this device from push notifications. */
    disableNotifications: () => Promise<void>;
}

interface PushConfigurationResponse {
    success: boolean;
    data?: {
        enabled?: boolean;
        publicKey?: string | null;
    };
}

function isAppleMobileDevice(): boolean {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isIOS || isIPadOS;
}

function isInstalledWebApp(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Convert a base64url VAPID public key to the format PushManager expects. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let index = 0; index < rawData.length; index += 1) {
        outputArray[index] = rawData.charCodeAt(index);
    }

    return outputArray;
}

async function getAuthHeaders(): Promise<HeadersInit | null> {
    const token = await auth.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
}

export function usePushNotifications(): PushNotificationState {
    const [isSupported, setIsSupported] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [requiresInstallation, setRequiresInstallation] = useState(false);
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [vapidPublicKey, setVapidPublicKey] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState<PushPermission>('unsupported');
    const [error, setError] = useState<string | null>(null);

    const getRegistration = useCallback(async (): Promise<ServiceWorkerRegistration> => {
        const existingRegistration = await navigator.serviceWorker.getRegistration('/');
        if (existingRegistration) return existingRegistration;

        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        return registration;
    }, []);

    const syncSubscription = useCallback(async (subscription: PushSubscription): Promise<boolean> => {
        const headers = await getAuthHeaders();
        if (!headers) {
            setError('Please sign in again before enabling notifications.');
            return false;
        }

        const subscriptionJSON = subscription.toJSON();
        const response = await fetch(`${API_URL}/push/subscribe`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscription: {
                    endpoint: subscriptionJSON.endpoint,
                    keys: {
                        p256dh: subscriptionJSON.keys?.p256dh,
                        auth: subscriptionJSON.keys?.auth,
                    },
                },
            }),
        });

        if (!response.ok) {
            setError('AuraPrep could not save this device for notifications. Please try again.');
            return false;
        }

        return true;
    }, []);

    const sendTestNotification = useCallback(async (): Promise<boolean> => {
        const headers = await getAuthHeaders();
        if (!headers) {
            setError('Please sign in again before sending a test notification.');
            return false;
        }

        try {
            const response = await fetch(`${API_URL}/push/test`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                setError('Notifications are enabled, but the test notification could not be delivered. Please try again later.');
                return false;
            }

            return true;
        } catch {
            setError('Notifications are enabled, but the test notification could not be delivered. Please check your connection.');
            return false;
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const checkAvailability = async () => {
            const appleMobile = isAppleMobileDevice();
            const installed = isInstalledWebApp();
            const supportsPush = window.isSecureContext &&
                'serviceWorker' in navigator &&
                'PushManager' in window &&
                'Notification' in window;

            if (cancelled) return;

            setIsInstalled(installed);
            setRequiresInstallation(appleMobile && !installed);
            setIsSupported(supportsPush && (!appleMobile || installed));
            setPermission('Notification' in window ? Notification.permission : 'unsupported');

            try {
                const response = await fetch(`${API_URL}/push/config`);
                const payload: PushConfigurationResponse = await response.json();
                const publicKey = payload.data?.publicKey || '';
                const configured = response.ok && payload.data?.enabled === true && Boolean(publicKey);

                if (!cancelled) {
                    setVapidPublicKey(publicKey);
                    setIsConfigured(configured);
                }
            } catch {
                if (!cancelled) setIsConfigured(false);
            }

            if (!supportsPush || (appleMobile && !installed)) return;

            try {
                const registration = await getRegistration();
                const subscription = await registration.pushManager.getSubscription();
                if (!cancelled) setIsSubscribed(Boolean(subscription));
            } catch {
                if (!cancelled) setError('AuraPrep could not prepare notifications in this browser.');
            }
        };

        void checkAvailability();
        return () => { cancelled = true; };
    }, [getRegistration]);

    const enableNotifications = useCallback(async (): Promise<EnableNotificationsResult> => {
        setError(null);

        if (requiresInstallation) {
            setError('On iPhone and iPad, add AuraPrep to your Home Screen and open it from there before allowing notifications.');
            return { enabled: false, testSent: false };
        }

        if (!isSupported) {
            setError('This browser does not support web push notifications.');
            return { enabled: false, testSent: false };
        }

        if (!isConfigured || !vapidPublicKey) {
            setError('Notifications are temporarily unavailable. Please try again later.');
            return { enabled: false, testSent: false };
        }

        if (Notification.permission === 'denied') {
            setPermission('denied');
            setError('Notifications are blocked for AuraPrep. Re-enable them in your device or browser settings.');
            return { enabled: false, testSent: false };
        }

        setIsLoading(true);

        try {
            // This must be the first asynchronous browser operation after the tap.
            // iOS only displays its native Allow / Don’t Allow prompt from a user gesture.
            const grantedPermission = Notification.permission === 'default'
                ? await Notification.requestPermission()
                : Notification.permission;

            setPermission(grantedPermission);
            if (grantedPermission !== 'granted') {
                return { enabled: false, testSent: false };
            }

            const registration = await getRegistration();
            await navigator.serviceWorker.ready;

            const existingSubscription = await registration.pushManager.getSubscription();
            const subscription = existingSubscription || await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            const saved = await syncSubscription(subscription);
            if (!saved) return { enabled: false, testSent: false };

            setIsSubscribed(true);
            const testSent = await sendTestNotification();
            return { enabled: true, testSent };
        } catch (cause) {
            console.error('[Push] Error enabling notifications:', cause);
            setError('AuraPrep could not enable notifications. Please try again.');
            return { enabled: false, testSent: false };
        } finally {
            setIsLoading(false);
        }
    }, [getRegistration, isConfigured, isSupported, requiresInstallation, sendTestNotification, syncSubscription, vapidPublicKey]);

    const disableNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.getRegistration('/');
            const subscription = await registration?.pushManager.getSubscription();

            if (subscription) {
                const headers = await getAuthHeaders();
                await subscription.unsubscribe();

                if (headers) {
                    await fetch(`${API_URL}/push/unsubscribe`, {
                        method: 'DELETE',
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ endpoint: subscription.endpoint }),
                    });
                }
            }

            setIsSubscribed(false);
        } catch (cause) {
            console.error('[Push] Error disabling notifications:', cause);
            setError('AuraPrep could not turn off notifications on this device.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isSupported,
        isInstalled,
        requiresInstallation,
        isConfigured,
        isSubscribed,
        isLoading,
        permission,
        error,
        enableNotifications,
        sendTestNotification,
        disableNotifications,
    };
}
