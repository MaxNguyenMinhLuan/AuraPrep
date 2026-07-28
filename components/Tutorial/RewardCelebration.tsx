/**
 * Reward Celebration Component
 *
 * Shows a celebratory screen when the player earns rewards during the tutorial.
 * Used after completing the first mission to show the 500 Aura reward.
 */

import React, { useEffect, useState } from 'react';

interface RewardCelebrationProps {
    auraAmount: number;
    message: string;
    subMessage?: string;
    onContinue: () => void;
}

const RewardCelebration: React.FC<RewardCelebrationProps> = ({
    auraAmount,
    message,
    subMessage,
    onContinue
}) => {
    const [showAura, setShowAura] = useState(false);
    const [countedAura, setCountedAura] = useState(0);

    // Animate the aura counter
    useEffect(() => {
        const showTimer = setTimeout(() => setShowAura(true), 500);

        return () => clearTimeout(showTimer);
    }, []);

    useEffect(() => {
        if (!showAura) return;

        const duration = 1500; // 1.5 seconds to count
        const steps = 30;
        const increment = auraAmount / steps;
        const stepDuration = duration / steps;

        let current = 0;
        const interval = setInterval(() => {
            current += increment;
            if (current >= auraAmount) {
                setCountedAura(auraAmount);
                clearInterval(interval);
            } else {
                setCountedAura(Math.floor(current));
            }
        }, stepDuration);

        return () => clearInterval(interval);
    }, [showAura, auraAmount]);

    return (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
            {/* Particle effects background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        <span className="text-2xl opacity-50">✨</span>
                    </div>
                ))}
            </div>

            <div className="max-w-md w-full text-center relative">
                {/* Celebration emoji */}
                <div className="text-7xl mb-6 animate-gentleBounce">🎉</div>

                {/* Message */}
                <h1 className="text-3xl font-serif text-highlight mb-2 animate-fadeIn">
                    {message}
                </h1>

                {subMessage && (
                    <p className="text-text-dim mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        {subMessage}
                    </p>
                )}

                {/* Aura reward display */}
                {showAura && (
                    <div className="bg-surface border-4 border-highlight rounded-2xl p-6 mb-8 animate-scaleIn shadow-glow-highlight">
                        <p className="text-text-dim text-sm mb-2">You earned</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-5xl font-bold text-highlight">
                                +{countedAura}
                            </span>
                            <span className="text-4xl">💎</span>
                        </div>
                        <p className="text-highlight font-bold mt-2">Aura Points</p>
                    </div>
                )}

                {/* Continue button */}
                {countedAura >= auraAmount && (
                    <button
                        onClick={onContinue}
                        className="w-full bg-highlight hover:brightness-110 text-white font-bold py-4 px-8 rounded-xl border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg animate-fadeIn"
                        style={{ animationDelay: '0.3s' }}
                    >
                        Awesome!
                    </button>
                )}
            </div>
        </div>
    );
};

export default RewardCelebration;
