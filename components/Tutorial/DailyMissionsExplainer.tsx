/**
 * Daily Missions Explainer Component
 *
 * Multi-step explanation of how daily missions work.
 * Shown before unlocking the full daily missions system.
 */

import React, { useState } from 'react';
import { TUTORIAL_DIALOGUE } from '../../utils/tutorialSteps';

interface DailyMissionsExplainerProps {
    onComplete: () => void;
}

const DailyMissionsExplainer: React.FC<DailyMissionsExplainerProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: '📋',
            title: TUTORIAL_DIALOGUE.explainDailyMissions.intro,
            content: TUTORIAL_DIALOGUE.explainDailyMissions.point1
        },
        {
            icon: '💎',
            title: 'Earn Rewards',
            content: TUTORIAL_DIALOGUE.explainDailyMissions.point2
        },
        {
            icon: '📊',
            title: 'Adaptive Difficulty',
            content: TUTORIAL_DIALOGUE.explainDailyMissions.point3
        },
        {
            icon: '🎯',
            title: 'Personalized Learning',
            content: TUTORIAL_DIALOGUE.explainDailyMissions.point4
        },
        {
            icon: '🚀',
            title: TUTORIAL_DIALOGUE.explainDailyMissions.ready,
            content: 'Complete all 3 daily missions each day to maximize your Aura and level up your Guardian!'
        }
    ];

    const currentStep = steps[step];
    const isLastStep = step === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setStep(prev => prev + 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${
                                i === step
                                    ? 'w-6 bg-highlight'
                                    : i < step
                                    ? 'bg-highlight/50'
                                    : 'bg-text-dim/30'
                            }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-surface border-4 border-highlight rounded-xl p-6 shadow-2xl animate-scaleIn" key={step}>
                    {/* Pikachu */}
                    <div className="flex justify-center mb-4">
                        <div className="text-5xl animate-gentleBounce">⚡</div>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-3xl">{currentStep.icon}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white border-2 border-secondary rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-bold text-primary mb-2 text-center">
                            {currentStep.title}
                        </h3>
                        <p className="text-text-main text-sm leading-relaxed text-center">
                            {currentStep.content}
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleNext}
                        className="w-full bg-highlight hover:brightness-110 text-white font-bold py-3 px-6 rounded-lg border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg"
                    >
                        {isLastStep ? "Let's Go!" : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyMissionsExplainer;
