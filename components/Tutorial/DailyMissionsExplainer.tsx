/**
 * Daily Missions Explainer Component
 *
 * Multi-step explanation of how daily missions work.
 * Shown before unlocking the full daily missions system.
 */

import React, { useState } from 'react';
import { TUTORIAL_DIALOGUE } from '../../utils/tutorialSteps';
import { PixelCreature } from '../CreatureCard';
import { INITIAL_CREATURES } from '../../constants';

const pikachu = INITIAL_CREATURES.find(c => c.id === 20);

interface DailyMissionsExplainerProps {
    onComplete: () => void;
}

const DailyMissionsExplainer: React.FC<DailyMissionsExplainerProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: (
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            title: TUTORIAL_DIALOGUE.explainDailyMissions.intro,
            content: TUTORIAL_DIALOGUE.explainDailyMissions.point1
        },
        {
            icon: (
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6-10 12L2 9z" />
                </svg>
            ),
            title: 'Earn Rewards',
            content: TUTORIAL_DIALOGUE.explainDailyMissions.point2
        },
        {
            icon: (
                <svg className="w-8 h-8 text-highlight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: 'Adaptive Difficulty',
            content: TUTORIAL_DIALOGUE.explainDailyMissions.point3
        },
        {
            icon: (
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                </svg>
            ),
            title: 'Personalized Learning',
            content: TUTORIAL_DIALOGUE.explainDailyMissions.point4
        },
        {
            icon: (
                <svg className="w-8 h-8 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
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
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 pointer-events-none">
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
                <div className="bg-surface border-4 border-highlight rounded-xl p-6 shadow-2xl animate-scaleIn pointer-events-auto" key={step}>
                    {/* Pikachu */}
                    <div className="flex justify-center mb-4">
                        <div className="animate-gentleBounce mb-2">
                            {pikachu && <PixelCreature creature={pikachu} evolutionStage={1} pixelSize={6} />}
                        </div>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                            {currentStep.icon}
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
