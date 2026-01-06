import React, { useState } from 'react';
import { User } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';
import { AuthService } from '../services/authService';

interface LoginViewProps {
    onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register';

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [status, setStatus] = useState<'idle' | 'authenticating' | 'syncing' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    // Email/password form state
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        try {
            setStatus('authenticating');
            setError(null);

            const { user } = await AuthService.signInWithGoogle();

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

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        try {
            let result;
            if (authMode === 'register') {
                if (!name.trim()) {
                    setFormError('Please enter your name');
                    setIsSubmitting(false);
                    return;
                }
                result = await AuthService.register(email, password, name);
            } else {
                result = await AuthService.login(email, password);
            }

            setStatus('syncing');
            await new Promise(resolve => setTimeout(resolve, 500));
            onLogin(result.user);
        } catch (err) {
            console.error('Auth error:', err);
            setFormError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setIsSubmitting(false);
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

        if (status === 'error') {
            return (
                <div className="space-y-4">
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                        <p className="text-accent text-xs font-bold">{error}</p>
                    </div>
                    <button
                        onClick={() => { setStatus('idle'); setError(null); }}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                    >
                        <span className="text-xs">Retry</span>
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Google Sign-In Button */}
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white hover:bg-gray-50 text-text-main font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-md border border-secondary/50 flex items-center justify-center gap-3"
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
                    <span className="text-xs uppercase tracking-widest">Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-secondary/50"></div>
                    <span className="text-xs text-text-dim">or</span>
                    <div className="flex-1 h-px bg-secondary/50"></div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                    {authMode === 'register' && (
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-secondary/50 bg-white/50 text-text-main placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-secondary/50 bg-white/50 text-text-main placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-secondary/50 bg-white/50 text-text-main placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                        minLength={6}
                    />

                    {formError && (
                        <p className="text-accent text-xs font-bold text-center">{formError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <LoadingSpinner className="h-5 w-5 mx-auto" />
                        ) : (
                            <span className="text-xs uppercase tracking-widest">
                                {authMode === 'login' ? 'Sign In' : 'Create Account'}
                            </span>
                        )}
                    </button>
                </form>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => {
                            setAuthMode(authMode === 'login' ? 'register' : 'login');
                            setFormError(null);
                        }}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                        {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>

                {/* Guest Mode - works without server */}
                <div className="pt-2">
                    <button
                        onClick={() => {
                            const guestUser: User = {
                                uid: 'guest-' + Date.now(),
                                name: 'Guest Summoner',
                                email: 'guest@auraprep.local'
                            };
                            onLogin(guestUser);
                        }}
                        className="w-full bg-highlight hover:bg-highlight/90 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg"
                    >
                        <span className="text-xs uppercase tracking-widest">Continue as Guest</span>
                    </button>
                    <p className="text-[10px] text-text-dim mt-2">No account needed - progress saved on this device</p>
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
