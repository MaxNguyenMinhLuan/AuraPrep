
import React, { useState, useCallback, useEffect } from 'react';
import { Question } from '../types';
import { getStrategyTip } from '../utils/strategyTips';
import LoadingSpinner from './icons/LoadingSpinner';
import QuestionGraph from './QuestionGraph';
import FormattedText from './FormattedText';
import ReportQuestionModal from './ReportQuestionModal';
import { reportQuestion } from '../services/reportService';

interface ReviewViewProps {
    questions: Question[];
    onAnswer: (question: Question, isCorrect: boolean) => void;
    onExit: () => void;
    userId?: string;
    userEmail?: string;
}

const ReviewView: React.FC<ReviewViewProps> = ({ questions, onAnswer, onExit, userId, userEmail }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [completedCount, setCompletedCount] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);

    // If queue is empty
    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                <h2 className="text-2xl font-serif text-highlight mb-4">Training Complete!</h2>
                <p className="text-text-dim mb-6">You've reviewed all your mistakes.</p>
                <button onClick={onExit} className="bg-primary text-light font-bold py-3 px-8 text-lg border-b-4 border-primary/70 rounded-md">Return to Dashboard</button>
            </div>
        );
    }

    const currentQuestion = questions[currentQIndex];
    const strategyTip = currentQuestion ? getStrategyTip(currentQuestion.subtopic, currentQuestion.question) : null;

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null) return;
        
        setSelectedAnswer(index);
        const correct = index === currentQuestion.answerIndex;
        setIsCorrect(correct);
    };

    const handleReportSubmit = (reason: string) => {
        if (!currentQuestion) return;
        reportQuestion({
            reason,
            questionText: currentQuestion.question,
            subtopic: currentQuestion.subtopic,
            userId,
            userEmail
        });
    };

    const handleNext = useCallback(() => {
        if (isCorrect === null) return;

        onAnswer(currentQuestion, isCorrect);

        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowReportModal(false);

        if (isCorrect) {
            setCompletedCount(prev => prev + 1);
             if (currentQIndex >= questions.length - 1) {
                 setCurrentQIndex(0);
             }
        } else {
            setCurrentQIndex(prev => (prev + 1) % questions.length);
        }
    }, [isCorrect, currentQuestion, onAnswer, currentQIndex, questions.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && selectedAnswer !== null) {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAnswer, handleNext]);

    if (!currentQuestion) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                <h2 className="text-2xl font-serif text-highlight mb-4">Training Session Done!</h2>
                <p className="text-text-dim mb-6">Great job reviewing.</p>
                <button onClick={onExit} className="bg-primary text-light font-bold py-3 px-8 text-lg border-b-4 border-primary/70 rounded-md">Return to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-auto animate-fadeIn pr-1">
            <div className="text-center mb-4 flex justify-between items-center">
                 <button onClick={onExit} className="text-text-dim hover:text-highlight">&larr; Exit</button>
                 <span className="text-[8px] font-bold text-highlight">TRAINING MODE</span>
                 <span className="w-8"></span>
            </div>

            <div className="mb-4">
                 <p className="text-primary text-center text-[10px]">Mistakes to Fix: {questions.length}</p>
                 <div className="w-full bg-surface h-2 mt-1 border border-text-dark rounded-full overflow-hidden">
                    <div className="bg-accent h-full transition-all duration-500" style={{ width: `${(completedCount / (completedCount + questions.length)) * 100}%` }}></div>
                </div>
            </div>

            <div className={`p-4 border-2 flex flex-col justify-between relative rounded-lg shadow-md transition-all duration-300 ${
                isCorrect === false ? 'bg-accent/5 border-accent shadow-[0_0_20px_rgba(220,38,38,0.25)] red-flash' : 'bg-surface border-accent/50'
            }`}>
                <div className="absolute top-0 right-0 bg-accent text-white text-[8px] px-2 py-1 font-bold rounded-bl-md">REVIEW</div>
                <div>
                  <p className="text-[10px] text-text-dim mb-2 uppercase font-bold">{currentQuestion.subtopic}</p>
                  
                  {currentQuestion.graphData && <QuestionGraph data={currentQuestion.graphData} />}

                  <FormattedText className="text-base md:text-lg mb-6 leading-relaxed font-clean" text={currentQuestion.question} />
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
                              } else if (index === selectedAnswer && !isCorrect) {
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
                                <span className="text-xs md:text-sm flex items-start text-left"><span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span><FormattedText className="inline text-sm md:text-base font-clean" text={option} /></span>
                                {icon && <span className="text-lg ml-2">{icon}</span>}
                            </button>
                          );
                      })}
                  </div>
                </div>
                {selectedAnswer !== null && (
                    <div className="mt-6 p-4 bg-background animate-fadeIn border-2 border-secondary rounded-lg">
                        <h3 className={`text-lg font-bold ${isCorrect ? 'text-success' : 'text-accent'}`}>
                            {isCorrect ? 'Recovered!' : 'Still Needs Practice'}
                        </h3>
                        <FormattedText className="text-xs md:text-sm text-text-main mt-2 leading-relaxed italic font-clean" text={currentQuestion.explanation} />
                        
                        {/* Strategy Tip Box */}
                        {strategyTip && (
                            <div className="mt-4 p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-xl text-left animate-fadeIn">
                                <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
                                    <span>{strategyTip.icon}</span> {strategyTip.title}
                                </p>
                                <p className="text-[11px] text-text-main mt-1 leading-normal font-sans">{strategyTip.tip}</p>
                            </div>
                        )}

                        <button
                            onClick={handleNext}
                            className="mt-4 w-full bg-primary text-light font-bold py-3 border-b-4 border-primary/70 hover:bg-primary/90 transition-all rounded-md"
                        >
                           {isCorrect ? 'Claim & Continue' : 'Next'}
                        </button>

                        <button
                            onClick={() => setShowReportModal(true)}
                            className="mt-2 w-full text-center text-[10px] text-text-dim hover:text-accent transition-all"
                        >
                            Report This Question
                        </button>
                    </div>
                )}

                {showReportModal && (
                    <ReportQuestionModal
                        onClose={() => setShowReportModal(false)}
                        onSubmit={handleReportSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default ReviewView;
