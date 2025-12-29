
import React, { useState, useCallback, useEffect } from 'react';
import { MissionInstance, PowerUpType } from '../types';
import QuestionGraph from './QuestionGraph';

interface MissionViewProps {
    mission: MissionInstance;
    onAnswer: (missionId: string, isCorrect: boolean, forceEarlyEnd?: boolean, loseAllRewards?: boolean) => void;
    onExit: () => void;
    inventory: { [key in PowerUpType]?: number };
    consumePowerUp: (type: PowerUpType) => void;
}

const MissionView: React.FC<MissionViewProps> = ({ mission, onAnswer, onExit, inventory, consumePowerUp }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showJeopardyModal, setShowJeopardyModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const currentQuestionIndex = mission.progress;
    const hasDoubleJeopardy = (inventory['DOUBLE_JEOPARDY'] || 0) > 0;
    
    // Reset local state when the question changes (or mission progress resets to 0)
    useEffect(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowJeopardyModal(false);
        setIsResetting(false);
    }, [currentQuestionIndex]);
    
    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null || isResetting) return;
        
        const currentQuestion = mission.questions![currentQuestionIndex];
        const correct = index === currentQuestion.answerIndex;
        
        if (!correct && hasDoubleJeopardy) {
            setSelectedAnswer(index);
            setIsCorrect(false);
            setShowJeopardyModal(true);
            return;
        }

        setSelectedAnswer(index);
        setIsCorrect(correct);

        if (!correct) {
            setIsResetting(true);
        }
    };

    const handleNext = useCallback(() => {
        if (isCorrect === null) return;
        onAnswer(mission.id, isCorrect);
    }, [isCorrect, mission.id, onAnswer]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && selectedAnswer !== null && !showJeopardyModal) {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAnswer, showJeopardyModal, handleNext]);

    const handleJeopardyAction = (action: 'risk' | 'end') => {
        consumePowerUp('DOUBLE_JEOPARDY');
        setShowJeopardyModal(false);
        
        if (action === 'risk') {
            setSelectedAnswer(null);
            setIsCorrect(null);
            setIsResetting(false);
        } else {
            // End mission early, claiming current partial rewards (or whatever logic App.tsx defines)
            onAnswer(mission.id, false, true, false);
        }
    };

    if (currentQuestionIndex >= mission.questionCount || mission.completed) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                <h2 className="text-2xl font-serif text-highlight mb-4">{mission.title} Complete!</h2>
                <p className="text-lg mb-2">You maintained a streak of <span className="font-bold text-text-main">{mission.questionCount}</span> correct answers!</p>
                <div className="my-6 p-4 border-2 border-secondary bg-background/50 rounded-lg">
                    <p className="text-md">Rewards Summoned:</p>
                    <p className="text-xl font-bold text-highlight">+{mission.reward} Aura</p>
                    <p className="text-xl font-bold text-success">+{mission.xp} Guardian XP</p>
                </div>
                <button 
                    onClick={onExit}
                    className="bg-primary text-light font-bold py-3 px-8 text-lg border-b-4 border-primary/70 hover:bg-primary/90 transition-all rounded"
                >
                    Return to Dashboard
                </button>
            </div>
        )
    }

    const currentQuestion = mission.questions![currentQuestionIndex];

    return (
        <div className="flex flex-col h-full animate-fadeIn relative">
            {showJeopardyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border-4 border-highlight p-6 max-w-sm w-full shadow-2xl animate-reveal text-center rounded-lg">
                        <div className="text-5xl mb-4">🏹</div>
                        <h2 className="text-xl font-bold text-highlight mb-2">Double Jeopardy!</h2>
                        <p className="text-sm text-text-dim mb-6">You answered incorrectly. Choose your path:</p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleJeopardyAction('risk')}
                                className="w-full bg-accent text-white font-bold py-3 border-b-4 border-accent-dark hover:brightness-110 rounded"
                            >
                                RISK IT ALL (Retry Streak)
                            </button>
                            <button 
                                onClick={() => handleJeopardyAction('end')}
                                className="w-full bg-secondary text-primary font-bold py-3 border-b-4 border-secondary-hover hover:brightness-105 rounded"
                            >
                                TAKE PARTIAL & EXIT
                            </button>
                        </div>
                        <p className="mt-4 text-[10px] text-text-dark italic leading-tight">Caution: If you risk it and fail again, your streak will reset to 0.</p>
                    </div>
                </div>
            )}

            <div className="text-center mb-4">
                 <button onClick={onExit} className="text-text-dim hover:text-highlight float-left">&larr; Back</button>
                <h1 className="font-serif text-2xl text-highlight leading-tight">{mission.title}</h1>
            </div>

            <div className="mb-4">
                <p className="text-primary text-center font-bold uppercase tracking-widest text-[10px]">Current Streak: {mission.progress} / {mission.questionCount}</p>
                <div className="w-full bg-surface h-4 mt-1 border-2 border-text-dark rounded-full overflow-hidden shadow-inner">
                    <div className="bg-highlight h-full transition-all duration-500 shadow-lg" style={{ width: `${(mission.progress / mission.questionCount) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-surface p-4 border-2 border-secondary/50 flex-grow flex flex-col justify-between overflow-y-auto rounded-lg shadow-sm">
                <div className="pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-text-dim uppercase font-bold tracking-tighter">{currentQuestion.subtopic}</p>
                    {hasDoubleJeopardy && !showJeopardyModal && (
                        <span className="text-[10px] bg-highlight/20 text-highlight font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-highlight/30">
                            🏹 Double Jeopardy Active
                        </span>
                    )}
                  </div>
                  
                  {/* Graphical Content */}
                  {currentQuestion.graphData && <QuestionGraph data={currentQuestion.graphData} />}

                  <p className="text-sm mb-6 whitespace-pre-wrap leading-relaxed">{currentQuestion.question}</p>
                  
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
                                disabled={selectedAnswer !== null || isResetting}
                                className={buttonClass}
                            >
                                <span className="text-[10px]"><span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>{option}</span>
                                {icon && <span className="text-lg">{icon}</span>}
                            </button>
                          );
                      })}
                  </div>
                </div>
                {selectedAnswer !== null && !showJeopardyModal && (
                    <div className={`mt-6 p-4 bg-background animate-fadeIn border-2 rounded-lg ${isCorrect ? 'border-success/50' : 'border-accent/50 animate-shake'}`}>
                        <h3 className={`text-lg font-bold ${isCorrect ? 'text-success' : 'text-accent'}`}>
                            {isCorrect ? 'Streak Maintained!' : 'Streak Broken!'}
                        </h3>
                        {!isCorrect && (
                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">Progress Resetting to 0...</p>
                        )}
                        <p className="text-text-main mt-2 text-[10px] leading-relaxed italic">{currentQuestion.explanation}</p>
                        <button 
                            onClick={handleNext} 
                            className={`mt-4 w-full text-white font-bold py-3 border-b-4 transition-all rounded-md shadow-md ${isCorrect ? 'bg-primary border-primary/70 hover:bg-primary/90' : 'bg-accent border-accent-dark hover:bg-accent/90'}`}
                        >
                           {isCorrect ? 'Next Challenge' : 'Try Again From Start'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MissionView;
