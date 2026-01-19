/**
 * Unlock Popup Component
 *
 * A celebratory popup that appears when a feature is unlocked.
 * Used for Progress (60 questions), Training, Shop, and Leaderboard (120 questions).
 */

import React, { useEffect, useState } from 'react';

interface UnlockPopupProps {
    feature: 'Progress' | 'Training' | 'Shop' | 'Leaderboard';
    onContinue: () => void;
}

const FEATURE_DATA = {
    Progress: {
        icon: '📊',
        title: 'Progress Tab Unlocked!',
        description: 'Track your skills in each SAT topic and take on Boss Fights to level up!',
        color: 'primary'
    },
    Training: {
        icon: '🎯',
        title: 'Training Unlocked!',
        description: 'Review questions you got wrong to master tough concepts and earn bonus Aura!',
        color: 'success'
    },
    Shop: {
        icon: '🛒',
        title: 'Shop Unlocked!',
        description: 'Buy power-ups to help you during tough questions and boss fights!',
        color: 'highlight'
    },
    Leaderboard: {
        icon: '🏆',
        title: 'Leaderboard Unlocked!',
        description: 'Compete with other Seekers! Climb the leagues and become a legend!',
        color: 'accent'
    }
};

const UnlockPopup: React.FC<UnlockPopupProps> = ({ feature, onContinue }) => {
    const [showContent, setShowContent] = useState(false);
    const data = FEATURE_DATA[feature];

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const colorClasses = {
        primary: 'border-primary bg-primary/10',
        success: 'border-success bg-success/10',
        highlight: 'border-highlight bg-highlight/10',
        accent: 'border-accent bg-accent/10'
    };

    const buttonClasses = {
        primary: 'bg-primary border-primary/70',
        success: 'bg-success border-success/70',
        highlight: 'bg-highlight border-yellow-800',
        accent: 'bg-accent border-accent/70'
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Particle burst effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-particle-burst"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: `rotate(${i * 12}deg)`,
                            animationDelay: `${i * 0.02}s`
                        }}
                    >
                        <div
                            className="w-2 h-2 bg-highlight rounded-full"
                            style={{ marginLeft: `${50 + Math.random() * 50}px` }}
                        />
                    </div>
                ))}
            </div>

            <div className="max-w-sm w-full text-center relative">
                {/* Lock breaking animation */}
                <div className="relative mb-6">
                    <div className="text-7xl animate-shake">🔓</div>
                    <div className="absolute -top-2 -right-2 text-3xl animate-spin-slow">✨</div>
                    <div className="absolute -bottom-2 -left-2 text-3xl animate-spin-slow" style={{ animationDirection: 'reverse' }}>✨</div>
                </div>

                {showContent && (
                    <div className={`bg-surface border-4 ${colorClasses[data.color as keyof typeof colorClasses]} rounded-2xl p-6 animate-scaleIn shadow-2xl`}>
                        {/* Feature icon */}
                        <div className="text-6xl mb-4 animate-gentleBounce">
                            {data.icon}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-serif text-highlight mb-3">
                            {data.title}
                        </h1>

                        {/* Description */}
                        <p className="text-text-dim text-sm mb-6 leading-relaxed">
                            {data.description}
                        </p>

                        {/* Continue button */}
                        <button
                            onClick={onContinue}
                            className={`w-full ${buttonClasses[data.color as keyof typeof buttonClasses]} hover:brightness-110 text-white font-bold py-4 px-6 rounded-xl border-b-4 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg`}
                        >
                            Check it out!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnlockPopup;
