
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Question, UserProfile, Difficulty, SkillLevel, PowerUpType } from '../types';
import { generateSatQuestion, fetchQuestionCounts } from '../services/questionService';
import { AURA_POINTS_PER_PRACTICE_STREAK, SUBTOPICS, POWER_UPS, getBossForSubtopic } from '../constants';
import { getSkillProgress, getDifficultyForLevel, getNextLevel, getBossFightRequirement } from '../utils/mastery';
import { INDEXED_QUESTIONS } from '../data/questionBankIndexed';
import { getStrategyTip } from '../utils/strategyTips';
import { getSkillsOfTheDay } from '../utils/skillsOfTheDay';
import LoadingSpinner from './icons/LoadingSpinner';
import QuestionGraph from './QuestionGraph';
import ScissorsIcon from './icons/ScissorsIcon';
import EyeIcon from './icons/EyeIcon';
import { LockIcon } from './icons/LockIcon';
import AuraIcon from './icons/AuraIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import ShieldIcon from './icons/ShieldIcon';
import TargetIcon from './icons/TargetIcon';

const getPowerUpColorClass = (id: PowerUpType) => {
    switch (id) {
        case 'ELIMINATE': return 'text-orange-500 dark:text-orange-400';
        case 'HINT': return 'text-indigo-500 dark:text-indigo-400';
        case 'SKIP': return 'text-cyan-500 dark:text-cyan-400';
        case 'SECOND_CHANCE': return 'text-emerald-500 dark:text-emerald-400';
        case 'DOUBLE_JEOPARDY': return 'text-rose-500 dark:text-rose-400';
        default: return 'text-primary dark:text-indigo-400';
    }
};

const renderPowerUpIcon = (id: PowerUpType, className = "w-6 h-6") => {
    const colorClass = getPowerUpColorClass(id);
    const fullClass = `${className} ${colorClass}`;
    switch (id) {
        case 'ELIMINATE': return <ScissorsIcon className={fullClass} />;
        case 'HINT': return <EyeIcon className={fullClass} />;
        case 'SKIP': return <ShuffleIcon className={fullClass} />;
        case 'SECOND_CHANCE': return <ShieldIcon className={fullClass} />;
        case 'DOUBLE_JEOPARDY': return <TargetIcon className={fullClass} />;
        default: return null;
    }
};

interface ProgressViewProps {
    userId: string;
    profile: UserProfile;
    setAuraPoints: React.Dispatch<React.SetStateAction<number>>;
    updateProfile: (subtopic: string, isCorrect: boolean) => void;
    levelUpSubtopic: (subtopic: string, nextLevel: SkillLevel) => void;
    consumePowerUp: (type: PowerUpType) => void;
    addToReviewQueue: (question: Question) => void;
    awardAura: (amount: number) => void;
    addXpToActiveCreature: (xp: number) => void;
    setIsBossFightActive?: (isActive: boolean) => void;
}

//--- SUB-COMPONENTS ---//

const PracticeSession: React.FC<{
    subtopic: string;
    profile: UserProfile;
    updateProfile: (subtopic: string, isCorrect: boolean) => void;
    onStreakComplete: () => void;
    onExit: () => void;
    awardAura: (amount: number) => void;
    awardXp: (xp: number) => void;
}> = ({ subtopic, profile, updateProfile, onStreakComplete, onExit, awardAura, awardXp }) => {
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [streak, setStreak] = useState(0);
    const [showStreakToast, setShowStreakToast] = useState(false);

    const difficulty = getDifficultyForLevel(profile.stats[subtopic].level);
    const strategyTip = currentQuestion ? getStrategyTip(currentQuestion.subtopic || subtopic, currentQuestion.question) : null;

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
        <div className="flex flex-col h-auto animate-fadeIn max-w-3xl mx-auto pr-1">
            {showStreakToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-highlight text-background font-bold p-3 animate-fadeIn z-20 shadow-lg border-2 border-highlight rounded-lg text-xs md:text-sm">
                    Streak Complete! +{AURA_POINTS_PER_PRACTICE_STREAK} Aura!
                </div>
            )}
            <div className="mb-3 md:mb-4 flex justify-between items-center">
                <button onClick={() => {
                    // Save partial streak progress on exit
                    if (streak > 0) {
                        awardAura(streak * 10);
                        awardXp(streak * 5);
                    }
                    onExit();
                }} className="text-text-dim hover:text-highlight active:text-highlight flex items-center gap-2 p-2 -ml-2 touch-target">← Back</button>
                 <p className="text-primary font-bold text-sm md:text-base">Streak: {'🔥'.repeat(streak)}{'⚫'.repeat(3 - streak)}</p>
            </div>
 
            {isLoading || !currentQuestion ? (
                 <div className="flex flex-col items-center justify-center flex-grow text-center h-[60vh]">
                    <LoadingSpinner />
                    <p className="text-text-dim mt-2 text-[10px]">Loading {difficulty} question...</p>
                </div>
            ) : (
                <div className={`p-4 md:p-6 border-2 flex flex-col justify-between rounded-lg shadow-sm transition-all duration-300 ${
                    isCorrect === false ? 'bg-accent/5 border-accent shadow-[0_0_20px_rgba(220,38,38,0.25)] shake-once red-flash' : 'bg-background/50 border-text-dark'
                }`}>
                    <div>
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <p className="text-[9px] md:text-[10px] text-text-dim uppercase font-bold tracking-wider">{subtopic}</p>
                            <span className="text-[9px] md:text-[10px] bg-secondary/30 px-2 py-1 rounded text-primary">{difficulty}</span>
                        </div>

                        {currentQuestion.graphData && <QuestionGraph data={currentQuestion.graphData} />}

                        <p className="text-sm md:text-base mb-6 md:mb-8 whitespace-pre-wrap leading-relaxed">{currentQuestion.question}</p>
                        <div className="space-y-3 md:space-y-4">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={selectedAnswer !== null}
                                    className={`w-full text-left p-3 md:p-4 transition-all duration-200 rounded-md shadow-sm touch-target text-xs md:text-sm ${getButtonClass(index)}`}
                                >
                                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span> {option}
                                </button>
                            ))}
                        </div>
                    </div>
                    {selectedAnswer !== null && (
                        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-background animate-fadeIn border-2 border-secondary rounded-lg shadow-md">
                            <h3 className={`text-lg md:text-xl font-bold ${isCorrect ? 'text-success' : 'text-accent'}`}>{isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                            <p className="text-text-main mt-2 text-xs md:text-sm leading-relaxed">{currentQuestion.explanation}</p>
                            
                            {/* Strategy Tip Box */}
                            {strategyTip && (
                                <div className="mt-4 p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-xl text-left animate-fadeIn">
                                    <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
                                        <span>{strategyTip.icon}</span> {strategyTip.title}
                                    </p>
                                    <p className="text-[11px] text-text-main mt-1 leading-normal font-sans">{strategyTip.tip}</p>
                                </div>
                            )}

                            <button onClick={handleNextQuestion} className="mt-4 md:mt-6 w-full bg-primary text-light font-bold py-3 md:py-4 border-b-4 border-primary/70 rounded-md hover:bg-primary/90 active:bg-primary/90 transition-colors touch-target">Next Question</button>
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
        <div className="flex flex-col w-full max-w-2xl mx-auto pb-24 pt-8 lg:pt-12 px-4 animate-fadeIn">
             <div className="text-center mb-6">
                 <button onClick={onCancel} className="text-text-dim hover:text-highlight float-left">&larr; Back</button>
                <h1 className="font-serif text-3xl text-accent leading-tight">Boss Loadout</h1>
                <p className="text-center text-text-dim mt-2 text-[10px]">Select up to 2 power-ups to bring into battle.</p>
            </div>
            
            <div className="space-y-3 w-full my-4">
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
                                <span className="text-3xl bg-background/50 w-12 h-12 flex items-center justify-center rounded-full border">{renderPowerUpIcon(powerUp.id, "w-8 h-8")}</span>
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
                className="w-full bg-accent text-light font-bold py-4 mt-4 border-b-4 border-accent-dark hover:bg-accent/90 transition-all rounded-lg shadow-lg text-sm tracking-widest"
            >
                ENTER FIGHT
            </button>
        </div>
    )
}

const getBossThemeClass = (id: string) => {
    switch (id) {
        case 'articuno': return { glow: 'rgba(56, 189, 248, 0.4)', text: 'from-sky-300 to-blue-600' };
        case 'zapdos': return { glow: 'rgba(250, 204, 21, 0.4)', text: 'from-yellow-200 to-amber-500' };
        case 'moltres': return { glow: 'rgba(239, 68, 68, 0.4)', text: 'from-orange-300 to-red-600' };
        case 'articuno-galar': return { glow: 'rgba(168, 85, 247, 0.4)', text: 'from-purple-300 to-fuchsia-600' };
        case 'zapdos-galar': return { glow: 'rgba(249, 115, 22, 0.4)', text: 'from-orange-400 to-red-600' };
        case 'moltres-galar': return { glow: 'rgba(225, 29, 72, 0.4)', text: 'from-rose-500 to-red-900' };
        default: return { glow: 'rgba(255, 255, 255, 0.4)', text: 'from-gray-300 to-gray-600' };
    }
};

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
    
    // Boss State
    const BOSS_FIGHT_LENGTH = 10;
    const initialBossHealth = (level === 'Hard' || level === 'Master') ? 9 : 8;
    const [bossHealth, setBossHealth] = useState(initialBossHealth);
    const [bossTakesDamage, setBossTakesDamage] = useState<number | false>(false);
    const [isBlasted, setIsBlasted] = useState(false);
    const [isBossDefeated, setIsBossDefeated] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds

    const boss = getBossForSubtopic(subtopic);
    
    // Power-up States
    const [availablePowerUps, setAvailablePowerUps] = useState<PowerUpType[]>(equippedPowerUps);
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
    const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
    const [hintVisible, setHintVisible] = useState(false);
    const [secondChanceActive, setSecondChanceActive] = useState(false);
    const [doubleJeopardyActive, setDoubleJeopardyActive] = useState(false);

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

    // Timer logic
    useEffect(() => {
        if (isLoading || fightComplete || isBlasted) return;
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setFightComplete(true); // defeat by timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isLoading, fightComplete, isBlasted]);

    // Reset power up effects when question changes
    useEffect(() => {
        setHiddenOptions([]);
        setDisabledOptions([]);
        setHintVisible(false);
        setSecondChanceActive(false);
        setDoubleJeopardyActive(false);
    }, [currentIndex]);

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null || disabledOptions.includes(index)) return;

        const correct = index === questions[currentIndex].answerIndex;

        if (!correct && secondChanceActive) {
            setSecondChanceActive(false);
            setDisabledOptions(prev => [...prev, index]);
            return;
        }

        setSelectedAnswer(index);
        setIsCorrect(correct);
        updateProfile(subtopic, correct);
        
        if (correct) {
            const damage = doubleJeopardyActive ? 2 : 1;
            setBossHealth(prev => Math.max(0, prev - damage));
            setBossTakesDamage(damage);
            setTimeout(() => setBossTakesDamage(false), 500);
        } else {
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
        } else if (type === 'DOUBLE_JEOPARDY') {
            setDoubleJeopardyActive(true);
        } else if (type === 'SKIP') {
            setIsSkipping(true);
            const newQuestionData = await generateSatQuestion(subtopic, difficulty);
            const newQuestion: Question = { ...newQuestionData, subtopic } as Question;
            addToReviewQueue(questions[currentIndex]);
            setQuestions(prev => {
                const newQs = [...prev];
                newQs[currentIndex] = newQuestion;
                return newQs;
            });
            setHiddenOptions([]);
            setDisabledOptions([]);
            setHintVisible(false);
            setSecondChanceActive(false);
            setDoubleJeopardyActive(false);
            setIsSkipping(false);
        }
        setAvailablePowerUps(prev => prev.filter(p => p !== type));
        consumePowerUp(type);
    };

    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1 && bossHealth > 0) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            if (bossHealth > 0) {
                setIsBlasted(true);
                setTimeout(() => setFightComplete(true), 2500);
            } else {
                setIsBossDefeated(true);
                setTimeout(() => setFightComplete(true), 2500);
            }
        }
    }, [currentIndex, questions.length, bossHealth]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && selectedAnswer !== null) {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAnswer, handleNext]);

    if (isLoading) return <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-4 text-primary animate-pulse">Summoning {boss.name}...</p></div>;
    if (isSkipping) return <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-4 text-highlight animate-pulse">Shifting Phase...</p></div>;

    if (fightComplete) {
        const success = bossHealth === 0;
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn max-w-md mx-auto">
                <h2 className={`text-4xl font-serif mb-6 ${success ? 'text-highlight' : 'text-accent'}`}>{success ? 'Victory!' : 'Defeated by ' + boss.name}</h2>
                {success ? (
                    <div className="bg-surface p-6 rounded-lg border-2 border-secondary mb-6 w-full shadow-md">
                        <p className="text-xl mb-2 font-bold">You defeated {boss.name}!</p>
                        <p className="text-sm text-text-dim">Your Auramon grew stronger.</p>
                    </div>
                ) : (
                    <div className="bg-surface p-6 rounded-lg border-2 border-accent mb-6 w-full shadow-md">
                        <p className="text-xl mb-2 font-bold">Your Auramon fainted...</p>
                        {timeRemaining === 0 ? (
                            <p className="text-sm text-text-dim">Time ran out!</p>
                        ) : (
                            <p className="text-sm text-text-dim">You didn't do enough damage.</p>
                        )}
                    </div>
                )}
                <button onClick={() => onBossFightComplete(success)} className="bg-primary text-light font-bold py-4 px-10 text-lg border-b-4 border-primary/70 rounded-md hover:bg-primary/90 transition-all shadow-lg">{success ? 'Claim Reward' : 'Return'}</button>
            </div>
        );
    }
    
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;
    const strategyTip = getStrategyTip(currentQuestion.subtopic || subtopic, currentQuestion.question);

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
        <div className={`flex flex-col lg:flex-row h-full animate-fadeIn w-full overflow-y-auto overflow-x-hidden pr-1 ${isBlasted ? 'animate-pulse bg-accent/20' : ''}`}>
            {/* Left Panel: Questions */}
            <div className="w-full lg:w-3/4 lg:pr-6 flex flex-col relative z-10">
                {isBlasted && <div className="absolute inset-0 bg-white/50 z-20 pointer-events-none animate-ping"></div>}
                <div className="text-center mb-2"><h1 className="font-serif text-3xl text-accent">BOSS FIGHT</h1></div>
                <div className="flex justify-between items-center mb-4 max-w-2xl mx-auto w-full">
                    <div className="text-sm font-bold text-text-main">
                        Time: <span className={timeRemaining < 300 ? 'text-accent animate-pulse' : 'text-primary'}>
                            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div className="text-sm text-primary font-bold">
                        Q: {currentIndex + 1} / {BOSS_FIGHT_LENGTH}
                    </div>
                </div>
                
                <div className={`p-6 ${selectedAnswer === null && availablePowerUps.length > 0 ? 'pb-20 lg:pb-6' : ''} border-2 ${
                    isCorrect === false ? 'bg-accent/5 border-accent shadow-[0_0_20px_rgba(220,38,38,0.25)] shake-once red-flash' 
                    : doubleJeopardyActive ? 'bg-surface border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                    : secondChanceActive ? 'bg-surface border-highlight shadow-[0_0_15px_rgba(202,138,4,0.5)]' 
                    : 'bg-surface border-accent/50'
                } flex-grow flex flex-col justify-between relative rounded-lg shadow-lg`}>
                    {secondChanceActive && <div className="absolute top-0 left-0 w-full bg-highlight text-white text-[8px] font-bold text-center py-1 rounded-t-sm">SECOND WIND ACTIVE</div>}
                    {doubleJeopardyActive && (
                        <div className="absolute top-0 left-0 w-full bg-rose-500 text-white text-[8px] font-bold text-center py-1 rounded-t-sm animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]">
                            DOUBLE JEOPARDY ACTIVE - 2X DAMAGE
                        </div>
                    )}
                    
                    <div>
                      {currentQuestion.graphData && <QuestionGraph data={currentQuestion.graphData} />}
                      <p className="text-sm md:text-base mb-8 whitespace-pre-wrap leading-relaxed pt-4">{currentQuestion.question}</p>
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
                                <button key={index} onClick={() => handleAnswerSelect(index)} disabled={selectedAnswer !== null || disabledOptions.includes(index)} className={btnClass}>
                                    <span className="mr-2 text-[8px]">{String.fromCharCode(65 + index)}.</span> {option}
                                </button>
                              );
                          })}
                      </div>
                    </div>

                    {/* Power Ups Bar */}
                    {selectedAnswer === null && availablePowerUps.length > 0 && (
                        <div className="absolute bottom-4 right-4 flex gap-2 md:gap-3">
                            {availablePowerUps.map((type, i) => {
                                const def = POWER_UPS.find(p => p.id === type);
                                if(!def) return null;
                                const isActive = (type === 'SECOND_CHANCE' && secondChanceActive) || (type === 'HINT' && hintVisible) || (type === 'DOUBLE_JEOPARDY' && doubleJeopardyActive);
                                return (
                                    <button 
                                        key={i}
                                        onClick={() => handleUsePowerUp(type)}
                                        disabled={isActive}
                                        className={`w-12 h-12 bg-surface border-2 ${isActive ? 'border-gray-400 opacity-50' : 'border-highlight'} rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform`}
                                        title={def.name}
                                    >
                                        {renderPowerUpIcon(def.id, "w-8 h-8")}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {selectedAnswer !== null && (
                        <div className="mt-8 p-6 bg-background animate-fadeIn rounded-lg border border-secondary">
                            <p className="text-text-main text-xs md:text-sm leading-relaxed">{currentQuestion.explanation}</p>
                            {strategyTip && (
                                <div className="mt-4 p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-xl text-left animate-fadeIn">
                                    <p className="text-[10px] font-bold text-yellow-600 flex items-center gap-1.5 uppercase tracking-wider">
                                        <span>{strategyTip.icon}</span> {strategyTip.title}
                                    </p>
                                    <p className="text-[11px] text-text-main mt-1 leading-normal font-sans">{strategyTip.tip}</p>
                                </div>
                            )}
                            <button onClick={handleNext} className="mt-6 w-full bg-primary text-light font-bold py-4 border-b-4 border-primary/70 rounded-md hover:bg-primary/90 transition-colors">
                                {currentIndex < questions.length - 1 && bossHealth > 0 ? 'Next' : 'Finish'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Right Panel: Boss */}
            <div className="w-full lg:w-1/4 mt-6 lg:mt-0 lg:border-l-2 lg:border-secondary lg:pl-6 flex flex-col items-center justify-start lg:justify-center relative z-0">
                <div className="w-full flex flex-col items-center relative">
                    <h2 
                        className={`text-2xl md:text-3xl font-serif mb-4 drop-shadow-sm uppercase text-transparent bg-clip-text bg-gradient-to-r ${getBossThemeClass(boss.id).text} text-center leading-normal whitespace-pre-wrap flex flex-col items-center justify-center w-full`}
                        style={{ WebkitTextStroke: '1.5px var(--color-text-main)' }}
                    >
                        <span>{boss.name.split(' ')[0]}</span>
                        {boss.name.split(' ').length > 1 && <span>{boss.name.split(' ').slice(1).join(' ')}</span>}
                    </h2>
                    {/* Segmented Boss Health Bar */}
                    <div className="w-full max-w-[280px] flex gap-[2px] mb-8 px-2 z-10 relative">
                        {Array.from({ length: initialBossHealth }).map((_, i) => (
                            <div key={i} className="flex-1 h-5 rounded-[2px] bg-surface/30 border border-text-dark/40 overflow-hidden relative -skew-x-12 shadow-sm">
                                <div 
                                    className={`absolute top-0 h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 transition-opacity duration-300 ${i >= bossHealth ? 'opacity-0' : 'opacity-100'}`}
                                    style={{
                                        width: `calc(${initialBossHealth * 100}% + ${(initialBossHealth - 1) * 2}px)`,
                                        left: `calc(-${i * 100}% - ${i * 2}px)`
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Boss Sprite Area */}
                    <div className="relative w-full aspect-[4/5] max-w-[300px] flex flex-col items-center justify-end overflow-visible">
                        {/* Glowing effect behind boss */}
                        <div className="absolute inset-[-50%] z-0 flex items-center justify-center pointer-events-none">
                            <div 
                                className="w-full h-full animate-pulse" 
                                style={{ background: `radial-gradient(circle at center, ${getBossThemeClass(boss.id).glow} 0%, transparent 60%)` }}
                            ></div>
                        </div>
                        
                        <div className={`relative w-[110%] flex-1 mb-6 transition-all duration-1000 ${bossTakesDamage !== false ? 'animate-shake brightness-150 scale-95' : 'animate-float'} ${isBlasted ? 'animate-spin scale-150 brightness-200' : ''} ${isBossDefeated ? 'rotate-[720deg] scale-0 opacity-0 brightness-200 filter blur-md' : ''}`}>
                            <img src={boss.spriteUrl} alt={boss.name} className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-10 relative" style={{ imageRendering: 'pixelated' }} />
                            {isBlasted && <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-50 z-20"></div>}
                            {isBossDefeated && (
                                <>
                                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-100 z-20 shadow-[0_0_100px_rgba(255,255,255,1)]"></div>
                                    <div className="absolute inset-[-50%] bg-highlight/60 rounded-full animate-ping blur-xl z-10" style={{ animationDuration: '1s' }}></div>
                                </>
                            )}
                            {bossTakesDamage !== false && (
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-bounce z-30 ${doubleJeopardyActive ? 'text-rose-500 text-6xl md:text-7xl scale-125 font-serif' : 'text-accent text-5xl'}`}>
                                    -{bossTakesDamage}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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
             <p className="mt-8 text-sm md:text-lg animate-pulse flex items-center justify-center gap-1.5 flex-col md:flex-row">You earned: <span className="font-bold text-primary flex items-center gap-1">{rewardAmount} <AuraIcon className="w-5 h-5" /></span></p>
        </div>
    );
};


//--- MAIN COMPONENT ---//

const ProgressView: React.FC<ProgressViewProps> = ({ userId, profile, setAuraPoints, updateProfile, levelUpSubtopic, consumePowerUp, addToReviewQueue, awardAura, addXpToActiveCreature, setIsBossFightActive }) => {
    const [view, setView] = useState<'list' | 'options' | 'practice' | 'prep' | 'bossFight' | 'levelUp'>('list');
    const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
    const [lastLevelUpInfo, setLastLevelUpInfo] = useState<{ from: SkillLevel, to: SkillLevel } | null>(null);
    const [equippedPowerUps, setEquippedPowerUps] = useState<PowerUpType[]>([]);
    const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
    const [isLoadingCounts, setIsLoadingCounts] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 6;
        let timeoutId: any;

        const loadCounts = async () => {
            try {
                if (retryCount === 0) {
                    setIsLoadingCounts(true);
                }
                const counts = await fetchQuestionCounts();
                if (Object.keys(counts).length > 0) {
                    setQuestionCounts(counts);
                    setIsLoadingCounts(false);
                } else {
                    throw new Error('Empty counts received (server might be starting up)');
                }
            } catch (err) {
                console.warn(`Attempt ${retryCount + 1} failed to load question counts:`, err);
                if (retryCount < maxRetries) {
                    retryCount++;
                    timeoutId = setTimeout(loadCounts, 5000);
                } else {
                    setIsLoadingCounts(false);
                }
            }
        };

        loadCounts();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

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
        setIsBossFightActive?.(true);
    };

    const handleBossFightComplete = (success: boolean) => {
        setIsBossFightActive?.(false);
        if (success && selectedSubtopic) {
            const currentLevel = profile.stats[selectedSubtopic].level;
            const nextLevel = getNextLevel(currentLevel);
            if (nextLevel) {
                levelUpSubtopic(selectedSubtopic, nextLevel);
                const auraReward = nextLevel === 'Master' ? 1000 : 500;
                const xpReward = nextLevel === 'Master' ? 200 : 150;
                awardAura(auraReward);
                addXpToActiveCreature(xpReward);
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
                awardAura={awardAura}
                awardXp={addXpToActiveCreature}
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
                             <p className="text-sm text-text-dim">Level up from <span className="font-bold">{currentLevel}</span> to <span className="font-bold">{nextLevel}</span>. Win to earn <span className="font-bold text-primary">{nextLevel === 'Master' ? 1000 : 500} Aura</span> + <span className="font-bold text-success">{nextLevel === 'Master' ? 200 : 150} Guardian XP</span>.</p>
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

    // Skills of the Day
    const todaysSkills = useMemo(
        () => getSkillsOfTheDay(userId, profile.stats),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [userId] // Recompute only when user changes; daily picks are cached in localStorage
    );
    const sotdSet = new Set([todaysSkills.mathSkill, todaysSkills.englishSkill]);

    const filteredSubtopics = SUBTOPICS.filter(subtopic =>
        subtopic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // For the regular grid, exclude SotD cards (unless the user is searching for them)
    const regularSubtopics = searchQuery
        ? filteredSubtopics
        : filteredSubtopics.filter(s => !sotdSet.has(s));

    const renderSkillCard = (subtopic: string, index: number, isHot = false) => {
        const stat = profile.stats[subtopic] || { correct: 0, incorrect: 0, level: 'Easy' };
        const { level } = stat;
        const progress = getSkillProgress(level);
        const idx = INDEXED_QUESTIONS[subtopic];
        const localCount = idx ? (idx.Easy.length + idx.Medium.length + idx.Hard.length + idx['Extra Hard'].length) : 0;
        const qCount = questionCounts[subtopic] !== undefined ? questionCounts[subtopic] : localCount;
        const displayCount = isLoadingCounts ? '...' : qCount;

        if (isHot) {
            return (
                <button
                    key={subtopic}
                    onClick={() => handleSelectSubtopic(subtopic)}
                    className="w-full text-left p-4 relative group overflow-hidden press-effect animate-fadeInScale rounded-xl shadow-[0_0_20px_rgba(202,138,4,0.35)] border-b-4 hover:-translate-y-1 transition-premium shimmer-overlay"
                    style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 40%, #fbbf24 80%, #f59e0b 100%)',
                        borderColor: '#d97706',
                        animationDelay: `${index * 0.06}s`,
                    }}
                >
                    {/* Animated gold shimmer ring */}
                    <div className="absolute inset-0 rounded-xl border-2 border-yellow-300/60 animate-pulse pointer-events-none" />

                    {/* Question count badge */}
                    <div className={`absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg uppercase tracking-tighter text-[8px] font-bold ${isLoadingCounts ? 'bg-yellow-600/30 text-yellow-900 animate-pulse' : qCount > 0 ? 'bg-yellow-600/30 text-yellow-900' : 'bg-yellow-400/30 text-yellow-800'}`}>
                        {isLoadingCounts ? 'Loading...' : `${displayCount} Question${qCount !== 1 ? 's' : ''}`}
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold flex-1 pr-2 truncate text-yellow-900">{subtopic}</span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${getLevelColor(level)} text-text-light uppercase shadow-button`}>{level}</span>
                    </div>
                    <div className="w-full bg-yellow-200/60 h-2.5 border border-yellow-400/50 rounded-full overflow-hidden">
                        <div className={`${getLevelColor(level)} h-full ${qCount === 0 ? 'opacity-30' : ''} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
                    </div>
                </button>
            );
        }

        return (
            <button
                key={subtopic}
                onClick={() => handleSelectSubtopic(subtopic)}
                className="w-full text-left p-4 bg-surface hover:bg-secondary/30 border-b-4 border-secondary/30 transition-premium rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-1 relative group overflow-hidden press-effect animate-fadeInScale"
                style={{ animationDelay: `${index * 0.03}s` }}
            >
                <div className={`absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg uppercase tracking-tighter text-[8px] font-bold ${isLoadingCounts ? 'bg-secondary/20 text-primary animate-pulse' : qCount > 0 ? 'bg-success/20 text-success' : 'bg-text-dark/20 text-text-dim'}`}>
                    {isLoadingCounts ? 'Loading...' : `${displayCount} Question${qCount !== 1 ? 's' : ''}`}
                </div>

                <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-bold flex-1 pr-2 truncate ${qCount > 0 ? 'text-text-main' : 'text-text-dim'}`}>{subtopic}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${getLevelColor(level)} text-text-light uppercase shadow-button`}>{level}</span>
                </div>
                <div className="w-full bg-background/50 h-2.5 border border-secondary/30 rounded-full overflow-hidden shadow-inner-soft">
                    <div className={`${getLevelColor(level)} h-full ${qCount === 0 ? 'opacity-30' : ''} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
                </div>
            </button>
        );
    };

    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-4 md:mb-6">
                <h1 className="text-lg md:text-xl lg:text-2xl bg-highlight text-text-light px-3 md:px-4 py-2 inline-block rounded-lg shadow-card animate-slideDown">Progress</h1>
                <p className="text-text-dim mt-2 text-xs md:text-sm">Practice skills or defeat bosses to level up.</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-6 relative">
                <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-surface text-text-main border-2 border-secondary/30 rounded-xl focus:outline-none focus:border-primary/50 text-xs md:text-sm font-bold shadow-card transition-all font-sans placeholder-text-dim/50"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim text-sm">🔍</span>
            </div>

            {/* ✨ Skills of the Day — shown only when not searching */}
            {!searchQuery && (
                <div className="mb-8 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">⭐</span>
                        <h2 className="text-[11px] md:text-xs font-bold text-highlight uppercase tracking-widest">Skills of the Day</h2>
                        <span className="text-base">⭐</span>
                        <span className="ml-auto text-[9px] text-text-dim italic">Resets daily • Your weakest picks</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {renderSkillCard(todaysSkills.mathSkill, 0, true)}
                        {renderSkillCard(todaysSkills.englishSkill, 1, true)}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-20">
                {regularSubtopics.map((subtopic, index) => renderSkillCard(subtopic, index))}
            </div>
        </div>
    );
};

export default ProgressView;
