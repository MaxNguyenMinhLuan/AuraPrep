/**
 * First Mission Question Component
 *
 * A single super-easy math question for the very first tutorial step.
 * Designed to give the user immediate success.
 */

import React, { useState } from 'react';

interface FirstMissionQuestionProps {
    onComplete: (isCorrect: boolean) => void;
}

const FirstMissionQuestion: React.FC<FirstMissionQuestionProps> = ({ onComplete }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Super easy question
    const question = {
        text: "What is 2 + 3?",
        options: ["4", "5", "6", "7"],
        correctIndex: 1, // Answer is 5
        explanation: "2 + 3 = 5. Great job!"
    };

    const handleSelect = (index: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
        setShowResult(true);
    };

    const handleContinue = () => {
        onComplete(selectedAnswer === question.correctIndex);
    };

    const isCorrect = selectedAnswer === question.correctIndex;

    return (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-6 animate-fadeIn">
                    <div className="inline-block bg-highlight/20 border-2 border-highlight rounded-full px-4 py-1 mb-3">
                        <span className="text-highlight text-xs font-bold">First Question!</span>
                    </div>
                    <h1 className="text-2xl font-serif text-highlight">Your First Mission</h1>
                    <p className="text-text-dim text-sm mt-1">Let's start with something easy!</p>
                </div>

                {/* Question Card */}
                <div className="bg-surface border-2 border-secondary/30 rounded-xl p-6 shadow-card animate-scaleIn">
                    <p className="text-lg font-medium text-text-main mb-6 text-center">
                        {question.text}
                    </p>

                    {/* Answer Options */}
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            let buttonClass = 'w-full text-left p-4 transition-all border-2 flex justify-between items-center rounded-xl ';
                            let icon = null;

                            if (selectedAnswer === null) {
                                buttonClass += 'bg-surface hover:bg-secondary/30 border-secondary/30 shadow-card hover:shadow-card-hover';
                            } else {
                                if (index === question.correctIndex) {
                                    buttonClass += 'bg-success/10 border-success text-success font-bold animate-successPop';
                                    icon = '✅';
                                } else if (index === selectedAnswer) {
                                    buttonClass += 'bg-accent/10 border-accent text-accent font-bold';
                                    icon = '❌';
                                } else {
                                    buttonClass += 'bg-surface opacity-50 border-text-dark/20';
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(index)}
                                    disabled={selectedAnswer !== null}
                                    className={buttonClass}
                                >
                                    <span className="text-base">
                                        <span className="font-bold mr-3 text-primary">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        {option}
                                    </span>
                                    {icon && <span className="text-xl">{icon}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Result + Continue */}
                    {showResult && (
                        <div className="mt-6 animate-slideUp">
                            <div className={`p-4 rounded-xl border-2 mb-4 ${
                                isCorrect
                                    ? 'bg-success/10 border-success/50'
                                    : 'bg-accent/10 border-accent/50'
                            }`}>
                                <p className={`font-bold mb-1 ${isCorrect ? 'text-success' : 'text-accent'}`}>
                                    {isCorrect ? '✓ Correct!' : '✗ Not quite!'}
                                </p>
                                <p className="text-text-dim text-sm">{question.explanation}</p>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full bg-highlight hover:brightness-110 text-white font-bold py-4 px-6 rounded-xl border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg"
                            >
                                Continue
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FirstMissionQuestion;
