/**
 * Welcome Mission Component
 *
 * This is the "stealth diagnostic" seed mission that replaces the formal
 * baseline test. It looks like a regular mission but secretly tracks
 * user performance to set initial difficulty levels.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../../types';
import { DifficultyTier } from '../../types/stealthDiagnostic';
import {
    generateSeedMissionQuestions,
    processStealthMissionAnswer,
    completeSeedMissionForUser,
    startQuestionTimer,
    getQuestionTime,
} from '../../services/stealthMissionService';
import { getRecommendedDifficulty, getUserSkillProfile } from '../../services/stealthDiagnosticService';
import QuestionGraph from '../QuestionGraph';

interface WelcomeMissionProps {
    uid: string;
    onComplete: (earnedAura: number, earnedXp: number) => void;
    onExit: () => void;
}

const WelcomeMission: React.FC<WelcomeMissionProps> = ({ uid, onComplete, onExit }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [correctCount, setCorrectCount] = useState(0);
    const [showComplete, setShowComplete] = useState(false);
    const questionStartRef = useRef<number>(Date.now());

    // Load questions on mount
    useEffect(() => {
        const loadQuestions = async () => {
            setIsLoading(true);
            const generatedQuestions = await generateSeedMissionQuestions();
            setQuestions(generatedQuestions);
            setIsLoading(false);
            startQuestionTimer();
            questionStartRef.current = Date.now();
        };
        loadQuestions();
    }, []);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const progress = totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0;

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);

        const timeToAnswer = getQuestionTime();
        const isCorrect = index === currentQuestion.answerIndex;

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
        }

        // Get current difficulty for this subtopic
        const userProfile = getUserSkillProfile(uid);
        const difficulty = getRecommendedDifficulty(userProfile, currentQuestion.subtopic) as DifficultyTier;

        // Process through stealth diagnostic system
        processStealthMissionAnswer(
            uid,
            currentQuestion.subtopic,
            isCorrect,
            timeToAnswer,
            difficulty
        );
    };

    const handleNext = () => {
        if (currentIndex + 1 >= totalQuestions) {
            // Mission complete!
            completeSeedMissionForUser(uid);
            setShowComplete(true);
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            startQuestionTimer();
            questionStartRef.current = Date.now();
        }
    };

    const handleFinish = () => {
        // Calculate rewards based on performance
        const baseAura = 100;
        const bonusAura = correctCount * 10;
        const totalAura = baseAura + bonusAura;
        const xp = correctCount * 5;

        onComplete(totalAura, xp);
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <div className="w-20 h-20 border-4 border-highlight border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-xl font-serif text-highlight mb-2">Preparing Your Welcome Mission</h2>
                    <p className="text-text-dim text-sm">Get ready to start your SAT journey!</p>
                </div>
            </div>
        );
    }

    if (showComplete) {
        const accuracy = Math.round((correctCount / totalQuestions) * 100);
        const baseAura = 100;
        const bonusAura = correctCount * 10;

        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center animate-scaleIn">
                    <div className="text-6xl mb-6 animate-gentleBounce">🎉</div>
                    <h1 className="text-3xl font-serif text-highlight mb-4">Welcome Mission Complete!</h1>
                    <p className="text-text-dim mb-8">Great job! You've completed your first mission.</p>

                    <div className="bg-surface p-6 rounded-xl border-2 border-secondary/30 mb-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-text-dim">Questions Answered:</span>
                            <span className="font-bold text-text-main">{totalQuestions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-text-dim">Correct Answers:</span>
                            <span className="font-bold text-success">{correctCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-text-dim">Accuracy:</span>
                            <span className="font-bold text-highlight">{accuracy}%</span>
                        </div>
                        <div className="h-px bg-secondary/30 my-2"></div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-primary font-bold">Total Aura Earned:</span>
                            <span className="font-bold text-highlight">+{baseAura + bonusAura} 💎</span>
                        </div>
                    </div>

                    <div className="bg-success/10 p-4 rounded-xl border-2 border-success/30 mb-6">
                        <p className="text-success font-bold text-sm">
                            ✓ Your skill levels have been calibrated based on your performance!
                        </p>
                    </div>

                    <button
                        onClick={handleFinish}
                        className="w-full bg-highlight hover:brightness-110 text-white font-bold py-4 px-8 rounded-xl border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg"
                    >
                        Continue to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    const isCorrect = selectedAnswer === currentQuestion.answerIndex;

    return (
        <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
            <div className="max-w-3xl mx-auto p-4 lg:p-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-xl font-serif text-highlight">🌟 Welcome Mission</h1>
                            <p className="text-xs text-text-dim">Begin your SAT journey!</p>
                        </div>
                        <button
                            onClick={onExit}
                            className="px-4 py-2 text-xs font-bold border-2 border-text-dim text-text-dim hover:border-accent hover:text-accent rounded-lg transition-all"
                        >
                            Exit
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                        <div className="flex justify-between text-xs text-text-dim mb-1">
                            <span>Question {currentIndex + 1} of {totalQuestions}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <div className="w-full bg-surface h-3 border-2 border-secondary/30 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-highlight to-yellow-500 h-full transition-all duration-500 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-surface p-5 md:p-6 border-2 border-secondary/30 rounded-xl shadow-card">
                    <p className="text-[10px] text-primary uppercase font-bold tracking-tight mb-4 bg-primary/10 px-3 py-1 rounded-full inline-block">
                        {currentQuestion.subtopic}
                    </p>

                    {/* Graph if present */}
                    {currentQuestion.graphData && <QuestionGraph data={currentQuestion.graphData} />}

                    <p className="text-sm whitespace-pre-wrap leading-relaxed mb-6">{currentQuestion.question}</p>

                    {/* Answer Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            let buttonClass = 'w-full text-left p-4 transition-all border-2 flex justify-between items-center rounded-xl ';
                            let icon = null;

                            if (selectedAnswer === null) {
                                buttonClass += 'bg-surface hover:bg-secondary/30 active:bg-secondary/30 border-secondary/30 shadow-card hover:shadow-card-hover';
                            } else {
                                if (index === currentQuestion.answerIndex) {
                                    buttonClass += 'bg-success/10 border-success text-success font-bold shadow-glow-success animate-successPop';
                                    icon = '✅';
                                } else if (index === selectedAnswer && !isCorrect) {
                                    buttonClass += 'bg-accent/10 border-accent text-accent font-bold animate-shake';
                                    icon = '❌';
                                } else {
                                    buttonClass += 'bg-surface opacity-50 border-text-dark/20';
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={selectedAnswer !== null}
                                    className={buttonClass}
                                >
                                    <span className="text-xs">
                                        <span className="font-bold mr-2 text-primary">{String.fromCharCode(65 + index)}.</span>
                                        {option}
                                    </span>
                                    {icon && <span className="text-lg">{icon}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation + Next Button */}
                    {selectedAnswer !== null && (
                        <div className={`mt-6 p-4 bg-background animate-slideUp border-2 rounded-xl ${isCorrect ? 'border-success/50' : 'border-accent/50'}`}>
                            <h3 className={`text-base font-bold mb-2 ${isCorrect ? 'text-success' : 'text-accent'}`}>
                                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                            </h3>
                            <p className="text-text-dim text-xs leading-relaxed italic mb-4">{currentQuestion.explanation}</p>
                            <button
                                onClick={handleNext}
                                className={`w-full font-bold py-3 rounded-xl border-b-4 transition-all shadow-card ${
                                    isCorrect
                                        ? 'bg-primary text-white border-primary/70 hover:bg-primary/90'
                                        : 'bg-accent text-white border-accent-dark hover:bg-accent/90'
                                }`}
                            >
                                {currentIndex + 1 >= totalQuestions ? 'Complete Mission' : 'Next Question'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Motivational footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-text-dim">
                        {correctCount > 0 && `🔥 ${correctCount} correct so far!`}
                        {correctCount === 0 && currentIndex > 0 && "Keep going! Every question helps us understand your skills."}
                        {currentIndex === 0 && "Good luck! Just do your best."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeMission;
