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
        icon: (
            <svg className="w-16 h-16 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: 'Progress Tab Unlocked!',
        description: 'Track your skills in each SAT topic and take on Boss Fights to level up!',
        color: 'primary'
    },
    Training: {
        icon: (
            <svg className="w-16 h-16 mx-auto text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
            </svg>
        ),
        title: 'Training Unlocked!',
        description: 'Review questions you got wrong to master tough concepts and earn bonus Aura!',
        color: 'success'
    },
    Shop: {
        icon: (
            <svg className="w-16 h-16 mx-auto text-highlight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: 'Shop Unlocked!',
        description: 'Buy power-ups to help you during tough questions and boss fights!',
        color: 'highlight'
    },
    Leaderboard: {
        icon: (
            <svg className="w-16 h-16 mx-auto text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
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
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 pointer-events-none">
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
                <div className="relative mb-6 flex justify-center">
                    <svg className="w-16 h-16 text-highlight animate-shake" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                </div>

                {showContent && (
                    <div className={`bg-surface border-4 ${colorClasses[data.color as keyof typeof colorClasses]} rounded-2xl p-6 animate-scaleIn shadow-2xl pointer-events-auto`}>
                        {/* Feature icon */}
                        <div className="mb-4 animate-gentleBounce flex justify-center">
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
