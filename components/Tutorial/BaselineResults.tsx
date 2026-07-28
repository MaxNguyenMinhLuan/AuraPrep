import React, { useState, useEffect } from 'react';
import { BaselineResults as Results } from '../../utils/baselineScoring';
import { TUTORIAL_DIALOGUE } from '../../utils/tutorialSteps';

interface BaselineResultsProps {
    results: Results;
    onContinue: () => void;
}

const BaselineResultsModal: React.FC<BaselineResultsProps> = ({ results, onContinue }) => {
    const [stage, setStage] = useState<'analyzing' | 'results' | 'rewards'>('analyzing');
    const [visibleResults, setVisibleResults] = useState<string[]>([]);
    const [auraCount, setAuraCount] = useState(0);

    useEffect(() => {
        // Stage 1: Analyzing (2 seconds)
        setTimeout(() => {
            setStage('results');
            // Show results one by one
            const subtopics = Object.keys(results);
            subtopics.forEach((subtopic, index) => {
                setTimeout(() => {
                    setVisibleResults(prev => [...prev, subtopic]);
                }, index * 300);
            });

            // Move to rewards after all results shown
            setTimeout(() => {
                setStage('rewards');
                // Animate aura counter
                let count = 0;
                const interval = setInterval(() => {
                    count += 50;
                    setAuraCount(count);
                    if (count >= 1000) {
                        clearInterval(interval);
                    }
                }, 30);
            }, subtopics.length * 300 + 1000);
        }, 2000);
    }, [results]);

    if (stage === 'analyzing') {
        return (
            <div className="fixed inset-0 z-[110] bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-main text-lg">{TUTORIAL_DIALOGUE.baselineResults.analyzing}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface border-4 border-highlight rounded-xl shadow-2xl max-w-2xl w-full p-8 my-8 animate-reveal">
                <h2 className="text-3xl font-serif text-center text-highlight mb-6">
                    {TUTORIAL_DIALOGUE.baselineResults.complete}
                </h2>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {Object.entries(results).map(([subtopic, result]: [string, { correct: number; total: number; level: string }]) => {
                        const isVisible = visibleResults.includes(subtopic);
                        const getLevelColor = (level: string) => {
                            switch (level) {
                                case 'Easy': return 'bg-blue-100 text-blue-700 border-blue-300';
                                case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
                                case 'Hard': return 'bg-red-100 text-red-700 border-red-300';
                                default: return 'bg-gray-100 text-gray-700 border-gray-300';
                            }
                        };

                        return (
                            <div
                                key={subtopic}
                                className={`p-3 bg-white border-2 border-secondary rounded-lg transition-all duration-300 ${
                                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-text-main">{subtopic}</span>
                                    <span className={`text-xs px-2 py-1 rounded border font-bold ${getLevelColor(result.level)}`}>
                                        {result.level}
                                    </span>
                                </div>
                                <div className="text-[10px] text-text-dim mt-1">
                                    {result.correct}/{result.total} correct
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rewards */}
                {stage === 'rewards' && (
                    <div className="bg-highlight/10 border-4 border-highlight rounded-xl p-6 mb-6 text-center animate-reveal">
                        <h3 className="text-xl font-bold text-highlight mb-4">Rewards Earned!</h3>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-primary">
                                +{auraCount} 💎
                            </div>
                            <div className="text-sm text-text-dim">
                                Baseline Assessment Bonus
                            </div>
                        </div>
                    </div>
                )}

                {stage === 'rewards' && (
                    <button
                        onClick={onContinue}
                        className="w-full bg-highlight hover:bg-highlight/90 text-white font-bold py-4 px-6 rounded-lg border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg text-lg"
                    >
                        Continue to Unlock Features!
                    </button>
                )}
            </div>
        </div>
    );
};

export default BaselineResultsModal;
