import React, { useState, useEffect } from 'react';

interface UnlockAnimationProps {
    features: string[];  // e.g., ["Progress", "Shop", "Training", "Leaderboard"]
    onComplete: () => void;
}

const UnlockAnimation: React.FC<UnlockAnimationProps> = ({ features, onComplete }) => {
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(-1);
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (currentFeatureIndex < features.length) {
            // Shake animation
            setIsShaking(true);
            setTimeout(() => {
                setIsShaking(false);
                // Move to next feature after unlock
                setTimeout(() => {
                    if (currentFeatureIndex + 1 >= features.length) {
                        setTimeout(() => {
                            onComplete();
                        }, 1000);
                    } else {
                        setCurrentFeatureIndex(prev => prev + 1);
                    }
                }, 800);
            }, 600);
        }
    }, [currentFeatureIndex, features.length, onComplete]);

    // Auto-start after mount
    useEffect(() => {
        setTimeout(() => {
            setCurrentFeatureIndex(0);
        }, 500);
    }, []);

    if (currentFeatureIndex === -1) {
        return null;
    }

    const currentFeature = features[currentFeatureIndex];

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="text-center">
                {/* Lock icon that shakes and breaks */}
                <div className={`mb-8 ${isShaking ? 'animate-shake' : ''}`}>
                    <div className="text-8xl">
                        {isShaking ? '🔓' : '🔒'}
                    </div>
                </div>

                {/* Feature name */}
                <div className="bg-surface border-4 border-highlight rounded-xl p-8 shadow-2xl animate-reveal">
                    <h2 className="text-3xl font-bold text-highlight mb-2">
                        {currentFeature} UNLOCKED!
                    </h2>
                    <div className="flex justify-center gap-2 mt-4">
                        {features.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    idx <= currentFeatureIndex ? 'bg-highlight' : 'bg-text-dark/30'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Particle effects */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-highlight rounded-full animate-ping"
                            style={{
                                left: `${50 + (Math.random() - 0.5) * 60}%`,
                                top: `${50 + (Math.random() - 0.5) * 60}%`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                opacity: Math.random()
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UnlockAnimation;
