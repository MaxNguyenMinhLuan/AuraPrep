
import React, { useState } from 'react';
import { User } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';
import { AuthService } from '../services/authService';

interface LoginViewProps {
    onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [status, setStatus] = useState<'idle' | 'authenticating' | 'syncing'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        try {
            setStatus('authenticating');
            setError(null);
            
            // Call the simulated backend auth service
            const { user, isNewUser } = await AuthService.handleGoogleAuth();
            
            // Simulate a "syncing" step after authentication
            setStatus('syncing');
            await new Promise(resolve => setTimeout(resolve, 800));

            onLogin(user);
        } catch (err) {
            setError("Failed to connect to the Academy. Please try again.");
            setStatus('idle');
        }
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

                    {status === 'idle' ? (
                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-6 rounded-xl border-2 border-secondary shadow-sm transition-all active:scale-95 group"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                </svg>
                                <span className="text-sm">Sign in with Google</span>
                            </button>
                            {error && <p className="text-accent text-[10px] font-bold">{error}</p>}
                        </div>
                    ) : (
                        <div className="py-4 space-y-4 animate-fadeIn">
                            <LoadingSpinner className="h-8 w-8 text-highlight mx-auto" />
                            <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">
                                {status === 'authenticating' ? 'Verifying Credentials...' : 'Syncing Academy Scroll...'}
                            </p>
                        </div>
                    )}
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
