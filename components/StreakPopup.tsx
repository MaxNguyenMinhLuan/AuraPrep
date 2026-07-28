
import React, { useState, useEffect } from 'react';

interface StreakPopupProps {
    streak: number;
    onClose: () => void;
}

const MILESTONES = [10, 25, 50, 100, 200, 300, 500, 600, 700, 800, 900, 1000];

const ParticleBurst: React.FC<{ color?: string }> = ({ color = '#ca8a04' }) => {
    const particles = Array.from({ length: 40 });
    return (
        <>
            {particles.map((_, i) => {
                const angle = (360 / particles.length) * i;
                const duration = 0.6 + Math.random() * 0.9;
                const delay = Math.random() * 0.3;
                const size = Math.floor(6 + Math.random() * 10);

                return (
                    <div
                        key={i}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                        style={{ transform: `rotate(${angle}deg)` }}
                    >
                        <div
                            className="rounded-full shadow-lg"
                            style={{
                                width: size,
                                height: size,
                                backgroundColor: color,
                                animation: `burst ${duration}s ease-out ${delay}s forwards`,
                            }}
                        />
                    </div>
                );
            })}
        </>
    );
};

const StreakPopup: React.FC<StreakPopupProps> = ({ streak, onClose }) => {
    const [displayCount, setDisplayCount] = useState(streak - 1);
    const [isAnimating, setIsAnimating] = useState(false);
    const isMilestone = MILESTONES.includes(streak);

    useEffect(() => {
        // Delay the increment slightly for visual anticipation
        const timer = setTimeout(() => {
            setDisplayCount(streak);
            setIsAnimating(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [streak]);

    const getMilestoneMessage = (s: number) => {
        if (s >= 1000) return "GODLIKE! A MILLENNIUM OF WISDOM!";
        if (s >= 500) return "UNSTOPPABLE! YOU ARE A LEGEND!";
        if (s >= 100) return "INCREDIBLE! 100 DAYS OF MASTERY!";
        if (s >= 50) return "AMAZING! HALF A CENTURY STREAK!";
        return "PHENOMENAL PROGRESS!";
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            <div 
                className={`relative bg-surface p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border-4 transition-all duration-500 overflow-hidden ${
                    isMilestone ? 'border-highlight scale-110 animate-shake' : 'border-primary'
                }`}
            >
                {isMilestone && isAnimating && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-highlight/20 to-transparent animate-pulse" />
                        <ParticleBurst color="#ca8a04" />
                        <ParticleBurst color="#ef4444" />
                        <ParticleBurst color="#ffffff" />
                    </>
                )}

                <div className="relative z-10">
                    <div className={`text-7xl mb-6 transition-transform duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}>
                        {isMilestone ? '🔥👑🔥' : '🔥'}
                    </div>

                    <h2 className="text-sm font-bold text-text-dim uppercase tracking-[0.2em] mb-2">
                        {isMilestone ? 'New Milestone!' : 'Daily Streak Up!'}
                    </h2>

                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className={`text-6xl font-black font-serif transition-all duration-500 ${isAnimating ? 'text-highlight' : 'text-text-main'}`}>
                            {displayCount}
                        </span>
                        <span className="text-2xl font-bold text-text-dim">Days</span>
                    </div>

                    {isMilestone && (
                        <div className="bg-highlight/10 p-4 rounded-lg border-2 border-highlight/30 mb-6 animate-reveal">
                            <p className="text-highlight font-bold text-sm leading-tight">
                                {getMilestoneMessage(streak)}
                            </p>
                        </div>
                    )}

                    {!isMilestone && (
                        <p className="text-text-dim text-xs mb-8">
                            You're building momentum. Come back tomorrow to keep the flame alive!
                        </p>
                    )}

                    <button
                        onClick={onClose}
                        className={`w-full py-4 rounded-xl font-bold text-lg border-b-4 transition-all active:border-b-0 active:translate-y-1 ${
                            isMilestone 
                            ? 'bg-highlight text-white border-yellow-800 hover:bg-yellow-500' 
                            : 'bg-primary text-white border-primary/70 hover:bg-primary/90'
                        }`}
                    >
                        {isMilestone ? 'I AM A LEGEND' : 'Keep it Going!'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StreakPopup;
