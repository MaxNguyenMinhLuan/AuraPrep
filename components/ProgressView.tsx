
import React, { useState, useCallback, useEffect } from 'react';
import { Question, UserProfile, Difficulty, SkillLevel, PowerUpType } from '../types';
import { generateSatQuestion } from '../services/questionService';
import { AURA_POINTS_PER_PRACTICE_STREAK, SUBTOPICS, POWER_UPS } from '../constants';
import { getSkillProgress, getDifficultyForLevel, getNextLevel, getBossFightRequirement } from '../utils/mastery';
import { QUESTION_BANK } from '../data/questionBank';
import LoadingSpinner from './icons/LoadingSpinner';
import QuestionGraph from './QuestionGraph';

interface ProgressViewProps {
    profile: UserProfile;
    setAuraPoints: React.Dispatch<React.SetStateAction<number>>;
    updateProfile: (subtopic: string, isCorrect: boolean) => void;
    levelUpSubtopic: (subtopic: string, nextLevel: SkillLevel) => void;
    consumePowerUp: (type: PowerUpType) => void;
    addToReviewQueue: (question: Question) => void;
    awardAura: (amount: number) => void;
}

//--- SUB-COMPONENTS ---//

const PracticeSession: React.FC<{
    subtopic: string;
    profile: UserProfile;
    updateProfile: (subtopic: string, isCorrect: boolean) => void;
    onStreakComplete: () => void;
    onExit: () => void;
}> = ({ subtopic, profile, updateProfile, onStreakComplete, onExit }) => {
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [streak, setStreak] = useState(0);
    const [showStreakToast, setShowStreakToast] = useState(false);

    const difficulty = getDifficultyForLevel(profile.stats[subtopic].level);

    const fetchQuestion = useCallback(async () => {
        const q = await generateSatQuestion(subtopic, difficulty);
        return { ...q, subtopic } as Question;
    }, [subtopic, difficulty]);

    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            const q = await fetchQuestion();
            setCurrentQuestion(q);
            setIsLoading(false);
            fetchQuestion().then(setNextQuestion);
        };
        initialLoad();
    }, [fetchQuestion]);
    
    useEffect(() => {
        if (streak === 3) {
            onStreakComplete();
            setShowStreakToast(true);
            const timer = setTimeout(() => setShowStreakToast(false), 3000);
            setStreak(0);
            return () => clearTimeout(timer);
        }
    }, [streak, onStreakComplete]);

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null || !currentQuestion) return;
        setSelectedAnswer(index);
        const correct = index === currentQuestion.answerIndex;
        setIsCorrect(correct);
        updateProfile(subtopic, correct);
        setStreak(prev => correct ? prev + 1 : 0);
    };
    
    const handleNextQuestion = useCallback(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        if (nextQuestion) {
            setCurrentQuestion(nextQuestion);
            fetchQuestion().then(setNextQuestion);
        } else {
            setIsLoading(true);
            fetchQuestion().then(q => {
                setCurrentQuestion(q);
                setIsLoading(false);
                fetchQuestion().then(setNextQuestion);
            });
        }
    }, [nextQuestion, fetchQuestion]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && selectedAnswer !== null) {
                handleNextQuestion();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAnswer, handleNextQuestion]);

    const getButtonClass = (index: number) => {
        if (!currentQuestion) return "";
        if (selectedAnswer === null) return "bg-surface hover:bg-secondary border-b-4 border-secondary/50";
        if (index === currentQuestion.answerIndex) return "bg-success text-light border-b-4 border-success-dark";
        if (index === selectedAnswer && !isCorrect) return "bg-accent text-light border-b-4 border-accent-dark";
        return "bg-surface opacity-50 border-b-4 border-text-dark";
    };

    return (
        <div className="flex flex-col h-full animate-fadeIn max-w-3xl mx-auto overflow-y-auto pr-1">
            {showStreakToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-highlight text-background font-bold p-3 animate-fadeIn z-20 shadow-lg border-2 border-highlight rounded-lg">
                    Streak Complete! +{AURA_POINTS_PER_PRACTICE_STREAK} Aura!
                </div>
            )}
            <div className="mb-4 flex justify-between items-center">
                <button onClick={onExit} className="text-text-dim hover:text-highlight flex items-center gap-2">&larr; Back</button>
                 <p className="text-primary font-bold">Streak: {'🔥'.repeat(streak)}{'⚫'.repeat(3 - streak)}</p>
            </div>

            {isLoading || !currentQuestion ? (
                 <div className="flex flex-col items-center justify-center flex-grow text-center h-[60vh]">
                    <LoadingSpinner />
                    <p className="text-text-dim mt-2 text-[10px]">Loading {difficulty} question...</p>
                </div>
            ) : (
                <div className="bg-background/50 p-6 border-2 border-text-dark flex-grow flex flex-col justify-between rounded-lg shadow-sm">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] text-text-dim uppercase font-bold tracking-wider">{subtopic}</p>
                            <span className="text-[10px] bg-secondary/30 px-2 py-1 rounded text-primary">{difficulty}</span>
                        </div>

                        {currentQuestion.graphData && <QuestionGraph data={currentQuestion.graphData} />}

                        <p className="text-[10px] mb-8 whitespace-pre-wrap leading-relaxed">{currentQuestion.question}</p>
                        <div className="space-y-4">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={selectedAnswer !== null}
                                    className={`w-full text-left p-4 transition-all duration-200 rounded-md shadow-sm ${getButtonClass(index)}`}
                                >
                                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span> {option}
                                </button>
                            ))}
                        </div>
                    </div>
                    {selectedAnswer !== null && (
                        <div className="mt-8 p-6 bg-background animate-fadeIn border-2 border-secondary rounded-lg shadow-md">
                            <h3 className={`text-xl font-bold ${isCorrect ? 'text-success' : 'text-accent'}`}>{isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                            <p className="text-text-main mt-2 text-[10px] leading-relaxed">{currentQuestion.explanation}</p>
                            <button onClick={handleNextQuestion} className="mt-6 w-full bg-primary text-light font-bold py-4 border-b-4 border-primary/70 rounded-md hover:bg-primary/90 transition-colors">Next Question</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
};

const BossFightPrep: React.FC<{
    inventory: { [key in PowerUpType]?: number };
    onStart: (selectedPowerUps: PowerUpType[]) => void;
    onCancel: () => void;
}> = ({ inventory, onStart, onCancel }) => {
    const [selected, setSelected] = useState<PowerUpType[]>([]);
    const maxReached = selected.length >= 2;

    const toggleSelection = (type: PowerUpType) => {
        if (selected.includes(type)) {
            setSelected(selected.filter(t => t !== type));
        } else {
            if (selected.length < 2) {
                setSelected([...selected, type]);
            }
        }
    };

    return (
        <div className="flex flex-col h-full animate-fadeIn max-w-2xl mx-auto overflow-y-auto pr-1">
             <div className="text-center mb-6">
                 <button onClick={onCancel} className="text-text-dim hover:text-highlight float-left">&larr; Back</button>
                <h1 className="font-serif text-3xl text-accent leading-tight">Boss Loadout</h1>
                <p className="text-center text-text-dim mt-2 text-[10px]">Select up to 2 power-ups to bring into battle.</p>
            </div>
            
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                {POWER_UPS.map(powerUp => {
                    const count = inventory[powerUp.id] || 0;
                    const isSelected = selected.includes(powerUp.id);
                    const isUnselectable = (count === 0 || (maxReached && !isSelected));
                    
                    return (
                         <button 
                            key={powerUp.id}
                            onClick={() => toggleSelection(powerUp.id)}
                            disabled={isUnselectable}
                            className={`w-full p-4 border-2 flex items-center justify-between transition-all rounded-lg ${
                                isSelected 
                                ? 'bg-highlight/20 border-highlight shadow-md scale-[1.02]' 
                                : (isUnselectable ? 'opacity-50 bg-background cursor-not-allowed border-text-dark' : 'bg-surface border-text-dim hover:bg-secondary/20 hover:border-secondary')
                            }`}
                        >
                            <div className="flex items-center gap-4 text-left">
                                <span className="text-3xl bg-background/50 w-12 h-12 flex items-center justify-center rounded-full border">{powerUp.icon}</span>
                                <div>
                                    <p className="font-bold text-sm">{powerUp.name}</p>
                                    <p className="text-[8px] text-text-dim">{powerUp.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold mb-1">x{count}</p>
                                {isSelected && <span className="text-highlight font-bold text-xl">✓</span>}
                            </div>
                        </button>
                    )
                })}
            </div>

            <button 
                onClick={() => onStart(selected)} 
                className="w-full bg-accent text-light font-bold py-4 mt-6 border-b-4 border-accent-dark hover:bg-accent/90 transition-all rounded-lg shadow-lg text-sm tracking-widest"
            >
                ENTER FIGHT
            </button>
        </div>
    )
}

const BossFightSession: React.FC<{
    subtopic: string;
    level: SkillLevel;
    updateProfile: (subtopic: string, isCorrect: boolean) => void;
    onBossFightComplete: (success: boolean) => void;
    equippedPowerUps: PowerUpType[];
    consumePowerUp: (type: PowerUpType) => void;
    addToReviewQueue: (question: Question) => void;
    inventory: { [key in PowerUpType]?: number };
}> = ({ subtopic, level, updateProfile, onBossFightComplete, equippedPowerUps, consumePowerUp, addToReviewQueue, inventory }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSkipping, setIsSkipping] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [fightComplete, setFightComplete] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    
    // Power-up States
    const [availablePowerUps, setAvailablePowerUps] = useState<PowerUpType[]>(equippedPowerUps);
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
    const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
    const [hintVisible, setHintVisible] = useState(false);
    const [secondChanceActive, setSecondChanceActive] = useState(false);

    const BOSS_FIGHT_LENGTH = 10;
    const requirement = getBossFightRequirement(level);
    const difficulty = getDifficultyForLevel(level);

    useEffect(() => {
        const generateBossQuestions = async () => {
            setIsLoading(true);
            const questionPromises = Array(BOSS_FIGHT_LENGTH).fill(0).map(() => generateSatQuestion(subtopic, difficulty));
            const generated = await Promise.all(questionPromises);
            setQuestions(generated.map(q => ({ ...q, subtopic } as Question)));
            setIsLoading(false);
        };
        generateBossQuestions();
    }, [subtopic, difficulty]);

    // Reset power up effects when question changes
    useEffect(() => {
        setHiddenOptions([]);
        setDisabledOptions([]);
        setHintVisible(false);
        setSecondChanceActive(false);
    }, [currentIndex]);

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null || disabledOptions.includes(index)) return;

        const correct = index === questions[currentIndex].answerIndex;

        // Second Wind Mechanic
        if (!correct && secondChanceActive) {
            setSecondChanceActive(false);
            setDisabledOptions(prev => [...prev, index]);
            return;
        }

        setSelectedAnswer(index);
        setIsCorrect(correct);
        updateProfile(subtopic, correct);
        if (correct) setCorrectAnswers(prev => prev + 1);
        
        if (!correct) {
            addToReviewQueue(questions[currentIndex]);
        }
    };
    
    const handleUsePowerUp = async (type: PowerUpType) => {
        if (!availablePowerUps.includes(type) || selectedAnswer !== null) return;

        if (type === 'ELIMINATE') {
            const correctIdx = questions[currentIndex].answerIndex;
            const wrongs = [0, 1, 2, 3].filter(i => i !== correctIdx);
            const toHide = wrongs.sort(() => 0.5 - Math.random()).slice(0, 2);
            setHiddenOptions(toHide);
        } else if (type === 'HINT') {
            setHintVisible(true);
        } else if (type === 'SECOND_CHANCE') {
            setSecondChanceActive(true);
        } else if (type === 'SKIP') {
            setIsSkipping(true);
            // Generate new question
            const newQuestionData = await generateSatQuestion(subtopic, difficulty);
            const newQuestion: Question = { ...newQuestionData, subtopic } as Question;
            
            // Save current question to review queue before discarding
            addToReviewQueue(questions[currentIndex]);

            // Replace current question in array
            setQuestions(prev => {
                const newQs = [...prev];
                newQs[currentIndex] = newQuestion;
                return newQs;
            });
            
            setHiddenOptions([]);
            setDisabledOptions([]);
            setHintVisible(false);
            setSecondChanceActive(false);
            
            setIsSkipping(false);
        }

        // Remove from available list and inventory
        setAvailablePowerUps(prev => prev.filter(p => p !== type));
        consumePowerUp(type);
    };

    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setFightComplete(true);
        }
    }, [currentIndex, questions.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && selectedAnswer !== null) {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAnswer, handleNext]);

    if (isLoading) return <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-4 text-primary animate-pulse">Summoning Boss...</p></div>;
    if (isSkipping) return <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-4 text-highlight animate-pulse">Shifting Phase...</p></div>;

    if (fightComplete) {
        const success = correctAnswers >= requirement;
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn max-w-md mx-auto">
                <h2 className={`text-4xl font-serif mb-6 ${success ? 'text-highlight' : 'text-accent'}`}>{success ? 'Victory!' : 'Defeated'}</h2>
                <div className="bg-surface p-6 rounded-lg border-2 border-secondary mb-6 w-full shadow-md">
                    <p className="text-xl mb-2 font-bold">Score: {correctAnswers}/{BOSS_FIGHT_LENGTH}</p>
                    <p className="text-sm text-text-dim">(Required: {requirement} correct)</p>
                </div>
                <button onClick={() => onBossFightComplete(success)} className="bg-primary text-light font-bold py-4 px-10 text-lg border-b-4 border-primary/70 rounded-md hover:bg-primary/90 transition-all shadow-lg">{success ? 'Claim Reward' : 'Return'}</button>
            </div>
        );
    }
    
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;

    return (
        <div className="flex flex-col h-full animate-fadeIn max-w-4xl mx-auto overflow-y-auto pr-1">
            <div className="text-center mb-4"><h1 className="font-serif text-3xl text-accent">BOSS FIGHT</h1></div>
            <div className="mb-6 max-w-2xl mx-auto w-full">
                <div className="flex justify-between text-[8px] text-primary mb-1 font-bold">
                    <span>Progress</span>
                    <span>{currentIndex + 1} / {BOSS_FIGHT_LENGTH}</span>
                </div>
                <div className="w-full bg-surface h-4 border-2 border-text-dark rounded-full overflow-hidden">
                    <div className="bg-accent h-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / BOSS_FIGHT_LENGTH) * 100}%` }}></div>
                </div>
            </div>
            <div className={`bg-surface p-6 border-2 ${secondChanceActive ? 'border-highlight shadow-[0_0_15px_rgba(202,138,4,0.5)]' : 'border-accent/50'} flex-grow flex flex-col justify-between relative rounded-lg shadow-lg`}>
                {secondChanceActive && <div className="absolute top-0 left-0 w-full bg-highlight text-white text-[8px] font-bold text-center py-1 rounded-t-sm">SECOND WIND ACTIVE</div>}
                
                <div>
                  {currentQuestion.graphData && <QuestionGraph data={currentQuestion.graphData} />}
                  
                  <p className="text-[10px] mb-8 whitespace-pre-wrap leading-relaxed pt-4">{currentQuestion.question}</p>
                  
                  {hintVisible && (
                      <div className="mb-6 p-4 bg-highlight/10 border-l-4 border-highlight text-[8px] text-text-main italic rounded-r-md">
                          <span className="font-bold block mb-1">Oracle's Insight:</span> {currentQuestion.explanation.split('.')[0]}...
                      </div>
                  )}

                  <div className="space-y-4">
                      {currentQuestion.options.map((option, index) => {
                          if (hiddenOptions.includes(index)) {
                              return <div key={index} className="w-full h-14 border-2 border-dashed border-text-dark/20 flex items-center justify-center text-text-dark/30 text-[8px] rounded-md">Eliminated</div>;
                          }

                          let btnClass = 'w-full text-left p-4 border-2 transition-all duration-200 rounded-md ';
                          if (selectedAnswer === null) {
                               if (disabledOptions.includes(index)) {
                                   btnClass += 'bg-text-dark/10 border-text-dark/30 text-text-dim cursor-not-allowed opacity-60';
                               } else {
                                   btnClass += 'bg-surface hover:bg-secondary border-primary/20 shadow-sm';
                               }
                          }
                          else if (index === currentQuestion.answerIndex) btnClass += 'bg-success/10 border-success font-bold';
                          else if (index === selectedAnswer) btnClass += 'bg-accent/10 border-accent font-bold';
                          else btnClass += 'bg-surface opacity-50 border-text-dark/20';
                          
                          return (
                            <button 
                                key={index} 
                                onClick={() => handleAnswerSelect(index)} 
                                disabled={selectedAnswer !== null || disabledOptions.includes(index)} 
                                className={btnClass}
                            >
                                <span className="mr-2 text-[8px]">{String.fromCharCode(65 + index)}.</span> {option}
                            </button>
                          );
                      })}
                  </div>
                </div>

                {/* Power Ups Bar */}
                {selectedAnswer === null && availablePowerUps.length > 0 && (
                    <div className="absolute -bottom-16 right-0 lg:bottom-4 lg:right-4 flex gap-3">
                        {availablePowerUps.map((type, i) => {
                            const def = POWER_UPS.find(p => p.id === type);
                            if(!def) return null;
                            const isActive = (type === 'SECOND_CHANCE' && secondChanceActive) || (type === 'HINT' && hintVisible);
                            return (
                                <button 
                                    key={i}
                                    onClick={() => handleUsePowerUp(type)}
                                    disabled={isActive}
                                    className={`w-12 h-12 bg-surface border-2 ${isActive ? 'border-gray-400 opacity-50' : 'border-highlight'} rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform`}
                                    title={def.name}
                                >
                                    {def.icon}
                                </button>
                            )
                        })}
                    </div>
                )}

                {selectedAnswer !== null && (
                    <div className="mt-8 p-6 bg-background animate-fadeIn rounded-lg border border-secondary">
                        <p className="text-text-main text-[10px] leading-relaxed">{currentQuestion.explanation}</p>
                        <button onClick={handleNext} className="mt-6 w-full bg-primary text-light font-bold py-4 border-b-4 border-primary/70 rounded-md hover:bg-primary/90 transition-colors">{currentIndex < questions.length - 1 ? 'Next' : 'Finish'}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const LevelUpAnimation: React.FC<{
    subtopic: string;
    fromLevel: SkillLevel;
    toLevel: SkillLevel;
    onAnimationEnd: () => void;
}> = ({ subtopic, fromLevel, toLevel, onAnimationEnd }) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationEnd, 3000);
        return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    const rewardAmount = toLevel === 'Master' ? 1000 : 500;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn p-4 overflow-hidden">
            <h1 className="font-serif text-2xl md:text-4xl text-highlight mb-6 drop-shadow-sm uppercase">LEVEL UP!</h1>
            <div className="animate-levelUp bg-surface p-5 md:p-8 border-4 border-highlight rounded-lg shadow-xl w-full max-w-[90vw] md:max-w-md">
                <p className="text-xs md:text-sm font-bold mb-4 uppercase tracking-tighter line-clamp-2">{subtopic}</p>
                <p className="text-sm md:text-lg font-bold flex items-center gap-2 md:gap-4 justify-center">
                    <span className="text-text-dim">{fromLevel}</span>
                    <span className="text-highlight">→</span>
                    <span className="text-success">{toLevel}</span>
                </p>
            </div>
             <p className="mt-8 text-sm md:text-lg animate-pulse">You earned: <span className="font-bold text-highlight block mt-2 md:inline md:mt-0">{rewardAmount} Aura</span></p>
        </div>
    );
};


//--- MAIN COMPONENT ---//

const ProgressView: React.FC<ProgressViewProps & { addToReviewQueue: (q: Question) => void }> = ({ profile, setAuraPoints, updateProfile, levelUpSubtopic, consumePowerUp, addToReviewQueue, awardAura }) => {
    const [view, setView] = useState<'list' | 'options' | 'practice' | 'prep' | 'bossFight' | 'levelUp'>('list');
    const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
    const [lastLevelUpInfo, setLastLevelUpInfo] = useState<{ from: SkillLevel, to: SkillLevel } | null>(null);
    const [equippedPowerUps, setEquippedPowerUps] = useState<PowerUpType[]>([]);

    const handleStreakComplete = useCallback(() => {
        awardAura(AURA_POINTS_PER_PRACTICE_STREAK);
    }, [awardAura]);
    
    const handleSelectSubtopic = (subtopic: string) => {
        setSelectedSubtopic(subtopic);
        setView('options');
    };

    const startBossFight = (powerUps: PowerUpType[]) => {
        setEquippedPowerUps(powerUps);
        setView('bossFight');
    };

    const handleBossFightComplete = (success: boolean) => {
        if (success && selectedSubtopic) {
            const currentLevel = profile.stats[selectedSubtopic].level;
            const nextLevel = getNextLevel(currentLevel);
            if (nextLevel) {
                levelUpSubtopic(selectedSubtopic, nextLevel);
                const reward = nextLevel === 'Master' ? 1000 : 500;
                awardAura(reward);
                setLastLevelUpInfo({ from: currentLevel, to: nextLevel });
                setView('levelUp');
            }
        } else {
            setView('options'); // Return to options if failed or already master
        }
    };
    
    // View: Level Up Animation
    if (view === 'levelUp' && selectedSubtopic && lastLevelUpInfo) {
        return <LevelUpAnimation 
                    subtopic={selectedSubtopic} 
                    fromLevel={lastLevelUpInfo.from}
                    toLevel={lastLevelUpInfo.to}
                    onAnimationEnd={() => setView('list')}
                />;
    }

    // View: Boss Fight Prep (Loadout)
    if (view === 'prep' && selectedSubtopic) {
        return <BossFightPrep 
            inventory={profile.inventory}
            onStart={startBossFight}
            onCancel={() => setView('options')}
        />
    }

    // View: Boss Fight
    if (view === 'bossFight' && selectedSubtopic) {
        return <BossFightSession
                    subtopic={selectedSubtopic}
                    level={profile.stats[selectedSubtopic].level}
                    updateProfile={updateProfile}
                    onBossFightComplete={handleBossFightComplete}
                    equippedPowerUps={equippedPowerUps}
                    consumePowerUp={consumePowerUp}
                    inventory={profile.inventory}
                    addToReviewQueue={addToReviewQueue}
                />
    }
    
    // View: Practice Session
    if (view === 'practice' && selectedSubtopic) {
        return <PracticeSession
                subtopic={selectedSubtopic}
                profile={profile}
                updateProfile={updateProfile}
                onStreakComplete={handleStreakComplete}
                onExit={() => setView('options')}
            />;
    }

    // View: Options (Practice or Boss Fight)
    if (view === 'options' && selectedSubtopic) {
        const currentLevel = profile.stats[selectedSubtopic].level;
        const nextLevel = getNextLevel(currentLevel);
        return (
            <div className="animate-fadeIn max-w-lg mx-auto">
                <button onClick={() => setView('list')} className="text-text-dim hover:text-highlight mb-4 flex items-center gap-2">&larr; All Skills</button>
                <div className="text-center mb-8">
                    <h2 className="text-2xl text-highlight leading-tight">{selectedSubtopic}</h2>
                </div>
                <div className="space-y-6">
                    <button onClick={() => setView('practice')} className="w-full text-left p-6 bg-surface hover:bg-secondary border-b-4 border-secondary/50 transition-colors duration-200 rounded-lg shadow-md group">
                        <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-primary/80">Practice</h3>
                        <p className="text-sm text-text-dim">Hone your skills. Earn {AURA_POINTS_PER_PRACTICE_STREAK} Aura for every 3-question streak.</p>
                    </button>
                     <button onClick={() => setView('prep')} disabled={!nextLevel} className="w-full text-left p-6 bg-surface hover:bg-secondary border-b-4 border-secondary/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md group">
                        <h3 className="text-xl font-bold text-accent mb-2">Boss Fight</h3>
                        {nextLevel ? (
                             <p className="text-sm text-text-dim">Level up from <span className="font-bold">{currentLevel}</span> to <span className="font-bold">{nextLevel}</span>. Reward: {nextLevel === 'Master' ? 1000 : 500} Aura.</p>
                        ) : (
                             <p className="text-sm text-text-dim">You have mastered this skill!</p>
                        )}
                    </button>
                </div>
            </div>
        )
    }
    
    // View: List of all skills (default)
    const getLevelColor = (level: SkillLevel) => {
        if (level === 'Master') return 'bg-gradient-to-r from-highlight to-yellow-300';
        if (level === 'Hard') return 'bg-success';
        if (level === 'Medium') return 'bg-highlight';
        return 'bg-accent';
    }

    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-6">
                <h1 className="text-xl lg:text-2xl bg-highlight text-text-light px-4 py-2 inline-block rounded shadow-sm">Progress</h1>
                <p className="text-text-dim mt-2 text-sm">Practice skills or defeat bosses to level up.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {SUBTOPICS.map(subtopic => {
                    const stat = profile.stats[subtopic] || { correct: 0, incorrect: 0, level: 'Easy' };
                    const { level } = stat;
                    const progress = getSkillProgress(level);
                    const qCount = QUESTION_BANK.filter(q => q.Type === subtopic).length;

                    return (
                        <button key={subtopic} onClick={() => handleSelectSubtopic(subtopic)} className="w-full text-left p-4 bg-surface hover:bg-secondary border-b-4 border-secondary/50 transition-all duration-200 rounded-lg shadow-sm hover:-translate-y-1 relative group overflow-hidden">
                            <div className={`absolute top-0 right-0 px-1.5 py-0.5 rounded-bl uppercase tracking-tighter text-[8px] font-bold ${qCount > 0 ? 'bg-success/20 text-success' : 'bg-text-dark/20 text-text-dim'}`}>
                                {qCount} Question{qCount !== 1 ? 's' : ''}
                            </div>
                            
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-[10px] font-bold flex-1 pr-2 truncate ${qCount > 0 ? 'text-text-main' : 'text-text-dim'}`}>{subtopic}</span>
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${getLevelColor(level)} text-text-light uppercase`}>{level}</span>
                            </div>
                            <div className="w-full bg-background/50 h-2 border border-text-dark rounded-full overflow-hidden">
                                <div className={`${getLevelColor(level)} h-full ${qCount === 0 ? 'opacity-30' : ''}`} style={{ width: `${progress}%` }}></div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default ProgressView;
