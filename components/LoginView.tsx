import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';
import { AuthService } from '../services/authService';
import type { CredentialResponse } from '../types/google.d';

interface LoginViewProps {
    onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [status, setStatus] = useState<'idle' | 'loading_gsi' | 'authenticating' | 'syncing' | 'error'>('loading_gsi');
    const [error, setError] = useState<string | null>(null);
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
        try {
            setStatus('authenticating');
            setError(null);

            const { user } = await AuthService.handleCredentialResponse(response);

            // Brief syncing step
            setStatus('syncing');
            await new Promise(resolve => setTimeout(resolve, 500));

            onLogin(user);
        } catch (err) {
            console.error('Authentication error:', err);
            setError('Failed to authenticate. Please try again.');
            setStatus('idle');
        }
    }, [onLogin]);

    useEffect(() => {
        // Prevent double initialization in React StrictMode
        if (initializedRef.current) return;

        const initializeGsi = () => {
            if (!AuthService.isGsiLoaded()) {
                // GSI not loaded yet, retry after a delay
                setTimeout(initializeGsi, 100);
                return;
            }

            const clientId = AuthService.getClientId();
            if (!clientId) {
                setError('Google Sign-In is not configured. Please contact support.');
                setStatus('error');
                return;
            }

            initializedRef.current = true;

            // Initialize GSI
            AuthService.initialize(handleCredentialResponse);

            // Render the button
            if (googleButtonRef.current) {
                AuthService.renderButton(googleButtonRef.current);
            }

            setStatus('idle');

            // Show One Tap prompt (optional - can be removed if not desired)
            // AuthService.prompt();
        };

        // Start checking for GSI
        initializeGsi();
    }, [handleCredentialResponse]);

    const renderContent = () => {
        if (status === 'loading_gsi') {
            return (
                <div className="py-4 space-y-4 animate-fadeIn">
                    <LoadingSpinner className="h-8 w-8 text-highlight mx-auto" />
                    <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">
                        Loading...
                    </p>
                </div>
            );
        }

        if (status === 'authenticating' || status === 'syncing') {
            return (
                <div className="py-4 space-y-4 animate-fadeIn">
                    <LoadingSpinner className="h-8 w-8 text-highlight mx-auto" />
                    <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">
                        {status === 'authenticating' ? 'Verifying Credentials...' : 'Syncing Academy Scroll...'}
                    </p>
                </div>
            );
        }

        if (status === 'error') {
            return (
                <div className="space-y-4">
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                        <p className="text-accent text-xs font-bold">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                    >
                        <span className="text-xs">Retry</span>
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Google Sign-In Button Container */}
                <div className="flex justify-center">
                    <div
                        ref={googleButtonRef}
                        className="google-signin-button"
                    />
                </div>
                {error && (
                    <p className="text-accent text-[10px] font-bold text-center">{error}</p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-highlight/10 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-secondary/30 p-8 text-center animate-reveal">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-highlight/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-highlight/50 shadow-lg group hover:rotate-12 transition-transform">
                        <span className="text-4xl">🔮</span>
                    </div>
                    <h1 className="font-serif text-4xl text-highlight font-bold tracking-tight mb-2">AuraPrep</h1>
                    <p className="text-text-dim text-sm px-4">Master the SAT. Summon the Extraordinary.</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-background/50 p-6 rounded-xl border border-secondary/50 text-left">
                        <h3 className="text-[10px] font-bold text-primary uppercase mb-3 tracking-widest">Academy Features</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs text-text-main">
                                <span className="bg-success/20 text-success p-1 rounded-full text-[8px]">✓</span>
                                Daily Mixed-Subject Missions
                            </li>
                            <li className="flex items-center gap-3 text-xs text-text-main">
                                <span className="bg-success/20 text-success p-1 rounded-full text-[8px]">✓</span>
                                Summon & Evolve Creatures
                            </li>
                            <li className="flex items-center gap-3 text-xs text-text-main">
                                <span className="bg-success/20 text-success p-1 rounded-full text-[8px]">✓</span>
                                Global Hall of Legends
                            </li>
                        </ul>
                    </div>

                    {renderContent()}
                </div>

                <p className="mt-8 text-[10px] text-text-dark">
                    By signing in, you agree to the Seeker's Code of Conduct.<br/>
                    Your progress is synchronized across your devices.
                </p>
            </div>
        </div>
    );
};

export default LoginView;
