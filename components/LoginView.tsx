import React, { useState } from 'react';
import { User } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';
import { AuthService } from '../services/authService';
import { ALLOWED_EMAILS } from '../constants';

interface LoginViewProps {
    onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [status, setStatus] = useState<'idle' | 'authenticating' | 'syncing' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        try {
            setStatus('authenticating');
            setError(null);

            const { user } = await AuthService.signInWithGoogle();

            // Validate against Allowed Emails list (case-insensitive)
            const isAllowed = ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
            
            if (!isAllowed) {
                // Instantly log them out so their session doesn't persist
                await AuthService.logout();
                throw new Error("Access Denied: Your email is not registered for this closed beta. Please complete the NDA and request access.");
            }

            // Brief syncing step
            setStatus('syncing');
            await new Promise(resolve => setTimeout(resolve, 500));

            onLogin(user);
        } catch (err) {
            console.error('Google sign-in error:', err);
            setError(err instanceof Error ? err.message : 'Failed to sign in with Google. Please try again.');
            setStatus('idle');
        }
    };

    const renderContent = () => {
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

        return (
            <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-2">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center">Closed Beta Access Only</p>
                </div>

                {/* Google Sign-In Button */}
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white hover:bg-gray-50 text-text-main font-bold py-3.5 px-6 rounded-xl transition-all active:scale-95 shadow-md border border-secondary/50 flex items-center justify-center gap-3 touch-target"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    <span className="text-xs uppercase tracking-widest">Sign In with Google</span>
                </button>

                {error && (
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 animate-fadeIn">
                        <p className="text-accent text-[11px] font-bold text-center leading-relaxed">{error}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#f5d0fe] via-[#fef9c3] to-[#a5f3fc] dark:from-[#311042] dark:via-[#0f172a] dark:to-[#083344] text-text-main font-sans text-sm p-6 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-highlight/10 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-secondary/30 p-8 text-center animate-reveal">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-highlight/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-highlight/50 shadow-lg group hover:rotate-12 transition-transform">
                        <span className="text-4xl">🔮</span>
                    </div>
                    <h1 className="font-sans text-4xl bg-gradient-to-tr from-[#c084fc] via-[#fcd34d] to-[#22d3ee] bg-clip-text text-transparent font-bold tracking-tighter mb-2 dark:drop-shadow-[0_0_12px_rgba(192,132,252,0.7)]">AuraPrep</h1>
                    <p className="text-text-dim text-sm px-4">Gamified SAT Prep</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-background/50 p-6 rounded-xl border border-secondary/50 text-left">
                        <h3 className="text-[10px] font-bold text-primary uppercase mb-3 tracking-widest">Core Features</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs text-text-main">
                                <span className="bg-success/20 text-success p-1 rounded-full text-[8px]">✓</span>
                                Daily Adaptive Missions
                            </li>
                            <li className="flex items-center gap-3 text-xs text-text-main">
                                <span className="bg-success/20 text-success p-1 rounded-full text-[8px]">✓</span>
                                Collect & Evolve Creatures
                            </li>
                            <li className="flex items-center gap-3 text-xs text-text-main">
                                <span className="bg-success/20 text-success p-1 rounded-full text-[8px]">✓</span>
                                Compete With Friends
                            </li>
                        </ul>
                    </div>

                    {renderContent()}
                </div>

                <div className="mt-6 pt-4 border-t border-secondary/20 flex flex-col items-center gap-2">
                    <p className="text-xs text-text-dim">Want access to the closed beta?</p>
                    <a 
                        href="https://forms.gle/tTa8eumCJ13KJpjp8" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-highlight hover:text-highlight/85 hover:underline transition-colors flex items-center gap-1"
                    >
                        Apply to be a Beta Tester ↗
                    </a>
                </div>

                <p className="mt-6 text-[10px] text-text-dark">
                    By signing in, you agree to the Seeker's Code of Conduct.
                </p>
            </div>
        </div>
    );
};

export default LoginView;
