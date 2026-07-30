/**
 * Skill Diagnostic — live onboarding placement test.
 * See architecture/diagnostic.md for the design rationale (adaptive
 * 8-domain screener/confirm structure, why it replaces the two prior
 * disconnected diagnostic systems).
 */

import React, { useEffect, useState } from 'react';
import { Question } from '../../types';
import {
    getDiagnosticProbes,
    fetchScreenerQuestion,
    fetchConfirmQuestion,
    recordDomainResult,
    DomainPlacement,
} from '../../services/diagnosticService';
import QuestionStimulus from '../QuestionStimulus';
import AnswerChoices from '../AnswerChoices';
import FormattedText from '../FormattedText';

interface SkillDiagnosticProps {
    onComplete: (placements: DomainPlacement[]) => void;
}

const SkillDiagnostic: React.FC<SkillDiagnosticProps> = ({ onComplete }) => {
    const domains = getDiagnosticProbes().map(p => p.domain);

    const [domainIndex, setDomainIndex] = useState(0);
    const [stage, setStage] = useState<'screener' | 'confirm'>('screener');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [placements, setPlacements] = useState<DomainPlacement[]>([]);
    const [screenerCorrectForDomain, setScreenerCorrectForDomain] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const loadScreener = async (index: number) => {
        setIsLoading(true);
        setStage('screener');
        const item = await fetchScreenerQuestion(domains[index]);
        setCurrentQuestion(item.question);
        setIsLoading(false);
    };

    useEffect(() => {
        loadScreener(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const finish = (finalPlacements: DomainPlacement[]) => {
        setPlacements(finalPlacements);
        setIsDone(true);
    };

    const advanceToNextDomain = async (finalPlacements: DomainPlacement[]) => {
        const nextIndex = domainIndex + 1;
        if (nextIndex >= domains.length) {
            finish(finalPlacements);
            return;
        }
        setDomainIndex(nextIndex);
        setSelectedAnswer(null);
        setIsCorrect(null);
        await loadScreener(nextIndex);
    };

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null || !currentQuestion) return;
        setSelectedAnswer(index);
        setIsCorrect(index === currentQuestion.answerIndex);
    };

    const handleNext = async () => {
        if (isCorrect === null) return;
        const domain = domains[domainIndex];

        if (stage === 'screener') {
            setScreenerCorrectForDomain(isCorrect);
            if (isCorrect) {
                // Confirm at Hard — this domain earns a shot at skipping straight there.
                setIsLoading(true);
                setSelectedAnswer(null);
                setIsCorrect(null);
                setStage('confirm');
                const item = await fetchConfirmQuestion(domain);
                setCurrentQuestion(item.question);
                setIsLoading(false);
            } else {
                const result = recordDomainResult(domain, false, null);
                await advanceToNextDomain([...placements, result]);
            }
        } else {
            const result = recordDomainResult(domain, screenerCorrectForDomain, isCorrect);
            await advanceToNextDomain([...placements, result]);
        }
    };

    if (isDone) {
        const hardCount = placements.filter(p => p.level === 'Hard').length;
        const mediumCount = placements.filter(p => p.level === 'Medium').length;

        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center animate-scaleIn">
                    <svg className="w-16 h-16 text-highlight mx-auto mb-6 animate-gentleBounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="text-3xl font-serif text-highlight mb-4">Calibration Complete!</h1>
                    <p className="text-text-dim mb-8">We've placed your starting difficulty across every skill area.</p>

                    <div className="bg-surface p-6 rounded-xl border-2 border-secondary/30 mb-6 space-y-3 text-left">
                        {placements.map(p => (
                            <div key={p.domain} className="flex justify-between items-center">
                                <span className="text-text-dim text-sm">{p.domain}</span>
                                <span className={`font-bold text-sm px-2 py-0.5 rounded ${
                                    p.level === 'Hard' ? 'bg-success/10 text-success' :
                                    p.level === 'Medium' ? 'bg-highlight/10 text-highlight' :
                                    'bg-secondary/20 text-text-dim'
                                }`}>{p.level}</span>
                            </div>
                        ))}
                    </div>

                    {(hardCount > 0 || mediumCount > 0) && (
                        <div className="bg-success/10 p-4 rounded-xl border-2 border-success/30 mb-6">
                            <p className="text-success font-bold text-sm">
                                ✓ You skipped the Easy tier in {hardCount + mediumCount} domain{hardCount + mediumCount === 1 ? '' : 's'} — no boss fight needed to get there.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => onComplete(placements)}
                        className="w-full bg-highlight hover:brightness-110 text-white font-bold py-4 px-8 rounded-xl border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading || !currentQuestion) {
        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <div className="w-20 h-20 border-4 border-highlight border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-xl font-serif text-highlight mb-2">Calibrating Your Skills</h2>
                    <p className="text-text-dim text-sm">A quick placement check before your first missions.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
            <div className="max-w-3xl mx-auto p-4 lg:p-8">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-xl font-serif text-highlight">🧭 Skill Calibration</h1>
                            <p className="text-xs text-text-dim">Domain {domainIndex + 1} of {domains.length}</p>
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className="w-full bg-surface h-3 border-2 border-secondary/30 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-highlight to-yellow-500 h-full transition-all duration-500 rounded-full"
                                style={{ width: `${(domainIndex / domains.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-5 md:p-6 border-2 border-secondary/30 rounded-xl shadow-card">
                    <p className="text-[10px] text-primary uppercase font-bold tracking-tight mb-4 bg-primary/10 px-3 py-1 rounded-full inline-block">
                        {domains[domainIndex]}
                    </p>

                    <QuestionStimulus question={currentQuestion} />

                    <FormattedText className="text-sm leading-relaxed mb-6" text={currentQuestion.question} />

                    <AnswerChoices
                        options={currentQuestion.options}
                        answerIndex={currentQuestion.answerIndex}
                        selectedAnswer={selectedAnswer}
                        isCorrect={isCorrect}
                        onSelect={handleAnswerSelect}
                        variant="standard"
                    />

                    {selectedAnswer !== null && (
                        <div className={`mt-6 p-4 bg-background animate-slideUp border-2 rounded-xl ${isCorrect ? 'border-success/50' : 'border-accent/50'}`}>
                            <h3 className={`text-base font-bold mb-2 ${isCorrect ? 'text-success' : 'text-accent'}`}>
                                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                            </h3>
                            <FormattedText className="text-text-dim text-xs leading-relaxed italic mb-4 font-clean" text={currentQuestion.explanation} />
                            <button
                                onClick={handleNext}
                                className="w-full bg-primary text-light font-bold py-3 rounded-xl border-b-4 border-primary/70 hover:bg-primary/90 transition-all"
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

export default SkillDiagnostic;
