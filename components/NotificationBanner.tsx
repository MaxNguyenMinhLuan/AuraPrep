import React, { useState, useEffect } from 'react';
import { PushNotificationState } from '../hooks/usePushNotifications';

interface NotificationBannerProps {
    push: PushNotificationState;
    userId: string | null;
}

const DISMISSED_KEY = 'push_dismissed_v1';

/**
 * A sleek pop-up banner that slides in from the top after the user logs in,
 * prompting them to enable push notifications. Hidden if:
 * - Browser doesn't support push (older iOS, desktop Firefox, etc.)
 * - User already subscribed
 * - User already dismissed the banner persistently
 * - User denied permission permanently
 */
export const NotificationBanner: React.FC<NotificationBannerProps> = ({ push, userId }) => {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Don't show if unsupported, already subscribed, or previously dismissed
        if (!push.isSupported || push.isSubscribed || !userId) return;
        if (push.permission === 'denied') return;

        const wasDismissed = localStorage.getItem(`${DISMISSED_KEY}_${userId}`);
        if (wasDismissed) return;

        // Show banner after a short delay so the dashboard loads first
        const timer = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(timer);
    }, [push.isSupported, push.isSubscribed, push.permission, userId]);

    const handleEnable = async () => {
        const result = await push.enableNotifications();
        if (result) {
            setSuccess(true);
            setTimeout(() => {
                setVisible(false);
            }, 2000);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        setVisible(false);
        if (userId) {
            localStorage.setItem(`${DISMISSED_KEY}_${userId}`, 'true');
        }
    };

    if (!visible || dismissed) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out ${
                visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="mx-3 mt-3 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                 style={{
                     background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                     backdropFilter: 'blur(20px)',
                 }}
            >
                {/* Decorative shimmer line */}
                <div className="h-[2px] w-full"
                     style={{
                         background: 'linear-gradient(90deg, transparent 0%, #818cf8 30%, #c4b5fd 50%, #818cf8 70%, transparent 100%)',
                     }}
                />

                <div className="px-5 py-4">
                    {success ? (
                        /* Success state */
                        <div className="flex items-center gap-3 animate-fadeIn">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Notifications enabled!</p>
                                <p className="text-indigo-300 text-xs">We'll remind you to keep your streak alive.</p>
                            </div>
                        </div>
                    ) : (
                        /* Prompt state */
                        <div className="flex items-start gap-3">
                            {/* Bell icon */}
                            <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm leading-snug">
                                    Never miss your daily missions
                                </p>
                                <p className="text-indigo-300 text-xs mt-1 leading-relaxed">
                                    Get reminders to keep your streak going and earn bonus Aura.
                                </p>

                                {/* Buttons */}
                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        onClick={handleEnable}
                                        disabled={push.isLoading}
                                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider
                                                   bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600
                                                   text-white shadow-lg shadow-indigo-500/30
                                                   transition-all duration-200
                                                   disabled:opacity-50 disabled:cursor-not-allowed
                                                   flex items-center gap-1.5"
                                    >
                                        {push.isLoading ? (
                                            <>
                                                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                                                </svg>
                                                Enabling…
                                            </>
                                        ) : (
                                            'Enable'
                                        )}
                                    </button>

                                    <button
                                        onClick={handleDismiss}
                                        className="px-3 py-2 rounded-xl text-xs font-medium
                                                   text-indigo-400 hover:text-indigo-200
                                                   hover:bg-white/5 active:bg-white/10
                                                   transition-all duration-200"
                                    >
                                        Not now
                                    </button>
                                </div>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={handleDismiss}
                                className="text-indigo-400/60 hover:text-white/80 transition-colors p-1 -mr-1 -mt-1"
                                aria-label="Dismiss"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
