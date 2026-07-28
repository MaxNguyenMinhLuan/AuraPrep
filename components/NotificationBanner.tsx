import React, { useEffect, useState } from 'react';
import { PushNotificationState } from '../hooks/usePushNotifications';

interface NotificationBannerProps {
    push: PushNotificationState;
    userId: string | null;
}

const DISMISSED_KEY = 'push_dismissed_v2';

/**
 * The permission prompt itself always belongs to the browser/OS. This banner
 * only explains the benefit and, after an intentional tap, calls the platform
 * API that opens the native Allow / Don't Allow prompt.
 */
export const NotificationBanner: React.FC<NotificationBannerProps> = ({ push, userId }) => {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [success, setSuccess] = useState(false);
    const [testSent, setTestSent] = useState(false);

    useEffect(() => {
        if (!userId || push.isSubscribed || push.permission === 'denied') return;

        // iOS needs an installed Home Screen web app before it exposes Web Push.
        // Other supported browsers can request permission directly.
        if (!push.requiresInstallation && !push.isSupported) return;

        if (localStorage.getItem(`${DISMISSED_KEY}_${userId}`)) return;

        const timer = window.setTimeout(() => setVisible(true), 2500);
        return () => window.clearTimeout(timer);
    }, [push.isSubscribed, push.isSupported, push.requiresInstallation, push.permission, userId]);

    const handleEnable = async () => {
        const result = await push.enableNotifications();
        if (result.enabled) {
            setTestSent(result.testSent);
            setSuccess(true);
            window.setTimeout(() => setVisible(false), 3600);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        setVisible(false);
        if (userId) localStorage.setItem(`${DISMISSED_KEY}_${userId}`, 'true');
    };

    if (!visible || dismissed) return null;

    const showInstallInstructions = push.requiresInstallation;
    const notificationsUnavailable = push.isConfigured === false && !showInstallInstructions;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ease-out"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            role="region"
            aria-label="Notification setup"
        >
            <div className="mx-3 mt-3 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-indigo-950">
                <div className="h-[2px] w-full bg-indigo-300" />

                <div className="px-5 py-4">
                    {success ? (
                        <div className="flex items-center gap-3 animate-fadeIn">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Notifications are enabled.</p>
                                <p className="text-indigo-200 text-xs mt-0.5">
                                    {testSent
                                        ? 'A test notification is on its way to this device.'
                                        : 'AuraPrep will alert you about your daily missions.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                                <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm leading-snug">
                                    {showInstallInstructions ? 'Use AuraPrep as an app' : 'Allow daily reminders'}
                                </p>
                                <p className="text-indigo-200 text-xs mt-1 leading-relaxed">
                                    {showInstallInstructions
                                        ? 'On iPhone and iPad, tap Share in Safari, choose “Add to Home Screen,” then open AuraPrep from its new Home Screen icon. iOS can only show web push permissions from that installed app.'
                                        : notificationsUnavailable
                                            ? 'Notifications are temporarily unavailable. Please try again later.'
                                            : 'Tap below and your device will show its native notification permission prompt. Allow it to receive daily-mission reminders even when AuraPrep is closed.'}
                                </p>

                                {push.error && (
                                    <p className="text-amber-200 text-xs mt-2 leading-relaxed" role="alert">{push.error}</p>
                                )}

                                <div className="flex items-center gap-2 mt-3">
                                    {showInstallInstructions || notificationsUnavailable ? (
                                        <button
                                            onClick={handleDismiss}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white transition-colors"
                                        >
                                            Got it
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleEnable}
                                            disabled={push.isLoading || push.isConfigured !== true}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                        >
                                            {push.isLoading ? 'Opening…' : 'Allow notifications'}
                                        </button>
                                    )}

                                    <button
                                        onClick={handleDismiss}
                                        className="px-3 py-2 rounded-xl text-xs font-medium text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        Not now
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="text-indigo-300 hover:text-white transition-colors p-1 -mr-1 -mt-1"
                                aria-label="Dismiss notification setup"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
