import React, { useState, useEffect } from 'react';
import { Question, Difficulty } from '../../types';
import { SUBTOPICS } from '../../constants';
import { generateSatQuestion } from '../../services/questionService';
import QuestionGraph from '../QuestionGraph';
import { TUTORIAL_DIALOGUE } from '../../utils/tutorialSteps';

interface BaselineTestProps {
    onComplete: (answers: { subtopic: string; isCorrect: boolean }[]) => void;
    onSaveAndExit: (progress: {
        currentIndex: number;
        answers: { subtopic: string; isCorrect: boolean }[];
        questions: any[];
    }) => void;
    savedProgress?: {
        currentIndex: number;
        answers: { subtopic: string; isCorrect: boolean }[];
        questions: any[];
    };
}

const BaselineTest: React.FC<BaselineTestProps> = ({ onComplete, onSaveAndExit, savedProgress }) => {
    const [questions, setQuestions] = useState<(Question & { subtopic: string })[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answers, setAnswers] = useState<{ subtopic: string; isCorrect: boolean }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSectionComplete, setShowSectionComplete] = useState(false);
    const [completedSection, setCompletedSection] = useState('');

    // Generate baseline questions on mount or load from saved progress
    useEffect(() => {
        const initializeTest = async () => {
            if (savedProgress && savedProgress.questions.length > 0) {
                // Resume from saved progress
                setQuestions(savedProgress.questions);
                setCurrentIndex(savedProgress.currentIndex);
                setAnswers(savedProgress.answers);
                setIsLoading(false);
            } else {
                // Generate new questions
                const baselineQuestions: (Question & { subtopic: string })[] = [];

                // Select 9 subtopics for 27 questions (3 per subtopic)
                const selectedSubtopics = SUBTOPICS.slice(0, 9);

                for (const subtopic of selectedSubtopics) {
                    // 3 questions per subtopic: Easy, Medium, Hard
                    const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

                    for (const difficulty of difficulties) {
                        try {
                            const q = await generateSatQuestion(subtopic, difficulty);
                            baselineQuestions.push({ ...q, subtopic });
                        } catch (error) {
                            console.error(`Failed to generate question for ${subtopic} (${difficulty}):`, error);
                        }
                    }
                }

                setQuestions(baselineQuestions);
                setIsLoading(false);
            }
        };

        initializeTest();
    }, [savedProgress]);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    // Get current category based on subtopic
    const getCurrentCategory = (subtopic: string): string => {
        if (subtopic.startsWith('Grammar')) return 'Grammar';
        if (subtopic.startsWith('Reading')) return 'Reading Comprehension';
        if (subtopic.startsWith('Math')) return 'Mathematics';
        return 'General';
    };

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
    };

    const handleSaveAndExit = () => {
        onSaveAndExit({
            currentIndex,
            answers,
            questions
        });
    };

    const handleNext = () => {
        if (selectedAnswer === null || !currentQuestion) return;

        const isCorrect = selectedAnswer === currentQuestion.answerIndex;
        const newAnswers = [...answers, { subtopic: currentQuestion.subtopic, isCorrect }];
        setAnswers(newAnswers);

        // Check if we've completed a section (every 9 questions)
        if ((currentIndex + 1) % 9 === 0 && currentIndex + 1 < totalQuestions) {
            const category = getCurrentCategory(currentQuestion.subtopic);
            setCompletedSection(category);
            setShowSectionComplete(true);
            setTimeout(() => {
                setShowSectionComplete(false);
                moveToNext();
            }, 2000);
        } else if (currentIndex + 1 >= totalQuestions) {
            // Test complete
            onComplete(newAnswers);
        } else {
            moveToNext();
        }
    };

    const moveToNext = () => {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-dim">Preparing your Baseline Assessment...</p>
                </div>
            </div>
        );
    }

    if (showSectionComplete) {
        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
                <div className="text-center animate-reveal">
                    <div className="text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-success mb-2">
                        {TUTORIAL_DIALOGUE.baselineTest.sectionComplete(completedSection)}
                    </h2>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    const category = getCurrentCategory(currentQuestion.subtopic);
    const showEncouragement = currentIndex > 0 && currentIndex % 5 === 0;

    return (
        <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
            <div className="max-w-3xl mx-auto p-4 lg:p-8">
                {/* Header with Save & Exit button */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl font-serif text-highlight">📋 Baseline Assessment</h1>
                        <button
                            onClick={handleSaveAndExit}
                            className="px-4 py-2 text-xs font-bold border-2 border-text-dim text-text-dim hover:border-primary hover:text-primary rounded-lg transition-all"
                        >
                            💾 Save & Exit
                        </button>
                    </div>
                    <p className="text-center text-xs text-text-dim mb-4">
                        Question {currentIndex + 1} of {totalQuestions} | Category: {category}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface h-4 border-2 border-primary/50 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-primary to-highlight h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Encouragement Message */}
                {showEncouragement && selectedAnswer === null && (
                    <div className="bg-highlight/10 border-2 border-highlight rounded-lg p-3 mb-4 text-center animate-fadeIn">
                        <p className="text-highlight font-bold text-sm">{TUTORIAL_DIALOGUE.baselineTest.encouragement}</p>
                    </div>
                )}

                {/* Question Card */}
                <div className="bg-surface p-6 border-2 border-secondary rounded-xl shadow-lg">
                    <div className="mb-4">
                        <p className="text-xs text-text-dim uppercase font-bold tracking-tight mb-4">{currentQuestion.subtopic}</p>

                        {/* Graph if present */}
                        {currentQuestion.graphData && <QuestionGraph data={currentQuestion.graphData} />}

                        <p className="text-sm whitespace-pre-wrap leading-relaxed mb-6">{currentQuestion.question}</p>

                        {/* Answer Options */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                let buttonClass = 'w-full text-left p-3 transition-all duration-200 border-2 flex justify-between items-center rounded-md ';
                                let icon = null;

                                if (selectedAnswer === null) {
                                    buttonClass += 'bg-surface hover:bg-secondary border-primary/20 shadow-sm';
                                } else {
                                    if (index === currentQuestion.answerIndex) {
                                        buttonClass += 'bg-success/10 border-success text-success font-bold';
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
                                        onClick={() => handleAnswerSelect(index)}
                                        disabled={selectedAnswer !== null}
                                        className={buttonClass}
                                    >
                                        <span className="text-xs">
                                            <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                                            {option}
                                        </span>
                                        {icon && <span className="text-lg">{icon}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Explanation + Next Button */}
                    {selectedAnswer !== null && (
                        <div className="mt-6 p-4 bg-background animate-fadeIn border-2 rounded-lg border-secondary">
                            <p className="text-text-dim text-xs leading-relaxed italic mb-4">{currentQuestion.explanation}</p>
                            <button
                                onClick={handleNext}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg border-b-4 border-primary/70 active:border-b-2 active:translate-y-0.5 transition-all shadow-md"
                            >
                                {currentIndex + 1 >= totalQuestions ? 'Complete Assessment' : 'Next Question'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BaselineTest;
