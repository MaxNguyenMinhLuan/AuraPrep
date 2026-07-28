import React, { useState } from 'react';
import { CreatureInstance, Question } from '../types';
import { INITIAL_CREATURES } from '../constants';
import FormattedText from './FormattedText';
import QuestionGraph from './QuestionGraph';
import CreatureCard from './CreatureCard';

interface BossFightViewProps {
    creatures: CreatureInstance[];
    bossQuestions: Question[];
    onComplete: (success: boolean, activeCreatureId: number) => void;
    onExit: () => void;
    activeCreatureId?: number | null;
}

const BossFightView: React.FC<BossFightViewProps> = ({ creatures = [], bossQuestions = [], onComplete, onExit, activeCreatureId }) => {
    // Automatically select the partner Auramon (or fallback to first owned creature)
    const initialPartnerId = (activeCreatureId !== undefined && activeCreatureId !== null)
        ? activeCreatureId
        : (creatures.length > 0 ? creatures[0].id : null);

    const [phase, setPhase] = useState<'selection' | 'battle' | 'results'>(initialPartnerId !== null ? 'battle' : 'selection');
    const [selectedCreatureId, setSelectedCreatureId] = useState<number | null>(initialPartnerId);
    const [bossHp, setBossHp] = useState<number>(3);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [quizState, setQuizState] = useState<'answering' | 'locked'>('answering');
    const [combatAnim, setCombatAnim] = useState<'idle' | 'auramonAttack' | 'bossUltimate' | 'auramonDefeat'>('idle');
    const [isVictory, setIsVictory] = useState<boolean>(false);

    const activeCreatureInstance = creatures.find(c => c.id === selectedCreatureId);
    const activeCreatureData = activeCreatureInstance ? INITIAL_CREATURES.find(c => c.id === activeCreatureInstance.creatureId) : null;
    const currentQuestion = bossQuestions[currentQuestionIndex];

    const handleSelectCreature = (id: number) => {
        setSelectedCreatureId(id);
        setPhase('battle');
    };

    const handleAnswerSelect = (index: number) => {
        if (quizState === 'locked' || phase !== 'battle') return;
        
        const correct = index === currentQuestion.answerIndex;
        setSelectedAnswer(index);
        setQuizState('locked');

        if (correct) {
            setCombatAnim('auramonAttack');
            setTimeout(() => {
                setCombatAnim('idle');
                const newHp = bossHp - 1;
                setBossHp(newHp);
                if (newHp <= 0) {
                    setIsVictory(true);
                    setPhase('results');
                } else {
                    if (currentQuestionIndex + 1 < bossQuestions.length) {
                        setCurrentQuestionIndex(prev => prev + 1);
                        setSelectedAnswer(null);
                        setQuizState('answering');
                    } else {
                        // Ran out of questions but boss isn't dead?
                        setIsVictory(true);
                        setPhase('results');
                    }
                }
            }, 1000);
        } else {
            setCombatAnim('bossUltimate');
            setTimeout(() => {
                setCombatAnim('auramonDefeat');
                setTimeout(() => {
                    setIsVictory(false);
                    setPhase('results');
                }, 1500);
            }, 1000);
        }
    };

    if (phase === 'selection') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 animate-fadeIn relative z-10">
                <h2 className="text-2xl font-serif text-highlight mb-6 star-bullet drop-shadow-sm">Select Your Partner</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[70vh] p-4 genshin-panel">
                    {creatures.map(c => (
                        <div key={c.id} onClick={() => handleSelectCreature(c.id)} className="cursor-pointer transform hover:scale-105 transition-transform">
                            <CreatureCard instance={c} />
                        </div>
                    ))}
                </div>
                <button onClick={onExit} className="mt-6 text-text-dim hover:text-white transition-colors">Retreat</button>
            </div>
        );
    }

    if (phase === 'results') {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-scaleIn text-center relative z-10">
                <h2 className={`text-5xl font-serif mb-4 ${isVictory ? 'text-highlight star-bullet' : 'text-red-500'}`}>
                    {isVictory ? 'VICTORY' : 'DEFEATED'}
                </h2>
                <p className="text-lg text-text-main mb-8 max-w-md">
                    {isVictory ? 'The boss was defeated! Your Auramon gained massive XP.' : 'Your Auramon was wiped out... Train harder and try again.'}
                </p>
                <button 
                    onClick={() => onComplete(isVictory, selectedCreatureId!)}
                    className="btn-tactile genshin-panel text-text-main px-8 py-3 rounded-md font-bold shadow-button border border-highlight"
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden relative z-10">
            {/* Upper Panel: Retro Battle Viewport */}
            <div className="relative h-[45%] w-full border-b border-gold/30 bg-black flex-shrink-0 overflow-hidden shadow-inner-soft">
                {/* Higgsfield Boss Arena Video */}
                <video 
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_3GhD4cgAIyWe3YK2AOJzkSFiEaQ/hf_20260719_053202_3bbd7613-68dd-41bc-a63c-513d2dce6596.mp4"
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* HUD: Boss HP */}
                <div className="absolute top-4 right-4 genshin-panel p-2 min-w-[150px]">
                    <div className="text-xs font-serif text-highlight mb-1 text-right tracking-widest">RAID BOSS</div>
                    <div className="flex gap-1 h-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={`flex-1 rounded-sm transition-all duration-500 ${i < bossHp ? 'bg-red-500 shadow-glow-highlight' : 'bg-black/80'}`} />
                        ))}
                    </div>
                </div>

                {/* HUD: Player */}
                <div className="absolute bottom-4 left-4 genshin-panel p-2 min-w-[150px]">
                    <div className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{activeCreatureInstance?.customName || activeCreatureData?.name}</div>
                    <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-green-400 w-full shadow-glow-success" />
                    </div>
                </div>

                {/* Battle Sprites */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Boss Sprite */}
                    <div className={`absolute top-[15%] right-[15%] w-32 h-32 md:w-48 md:h-48 flex items-center justify-center
                        ${combatAnim === 'bossUltimate' ? 'animate-bossUltimateAttack' : 'animate-subtlePulse'}
                    `}>
                        <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-black rounded-full blur-xl opacity-80 shadow-[0_0_50px_rgba(255,0,0,0.5)]"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-8xl drop-shadow-[0_0_15px_rgba(255,0,0,1)]">👁️</div>
                        </div>
                    </div>

                    {/* Boss Ultimate Beam */}
                    {combatAnim === 'bossUltimate' && (
                        <div className="absolute top-[30%] right-[30%] w-[150%] h-12 bg-red-500 rounded-full blur-md origin-right animate-scaleIn shadow-[0_0_30px_rgba(255,0,0,1)] z-20" style={{ transform: 'rotate(25deg)' }} />
                    )}

                    {/* Player Sprite */}
                    <div className={`absolute bottom-[10%] left-[15%] w-24 h-24 md:w-32 md:h-32 flex items-center justify-center
                        ${combatAnim === 'auramonAttack' ? 'animate-auramonAttack z-30' : ''}
                        ${combatAnim === 'auramonDefeat' ? 'animate-auramonDefeat' : ''}
                    `}>
                        {activeCreatureData && (
                            <div className="transform scale-125 md:scale-150 relative">
                                <div className="text-5xl md:text-6xl z-10 relative drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] filter drop-shadow-xl">
                                    {activeCreatureData.type === 'Fire' ? '🔥' : activeCreatureData.type === 'Water' ? '💧' : activeCreatureData.type === 'Leaf' ? '🍃' : activeCreatureData.type === 'Electric' ? '⚡' : '✨'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lower Panel: Quiz Area */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-background/95 relative backdrop-blur-md">
                {currentQuestion && (
                    <div className={`transition-opacity duration-300 max-w-2xl mx-auto ${quizState === 'locked' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div className="genshin-panel p-5 mb-5">
                            <FormattedText text={currentQuestion.question} />
                            {currentQuestion.hasGraphic && currentQuestion.graphData && (
                                <div className="mt-4 bg-white/5 p-3 rounded-xl border border-white/10"><QuestionGraph data={currentQuestion.graphData} /></div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrect = index === currentQuestion.answerIndex;
                                let btnClass = 'genshin-panel hover:border-highlight text-left';
                                
                                if (quizState === 'locked') {
                                    if (isSelected && isCorrect) btnClass = 'bg-success/20 border-success shadow-glow-success text-left';
                                    else if (isSelected && !isCorrect) btnClass = 'bg-red-500/20 border-red-500 text-left';
                                    else if (isCorrect) btnClass = 'border-green-500/50 text-left';
                                }

                                return (
                                    <button 
                                        key={index} 
                                        onClick={() => handleAnswerSelect(index)}
                                        className={`w-full p-4 rounded-md transition-all duration-200 ${btnClass} flex items-center btn-tactile`}
                                    >
                                        <span className={`w-8 h-8 rounded-full bg-black/30 border border-white/20 flex items-center justify-center mr-4 font-bold text-sm shrink-0 ${isSelected ? 'text-highlight border-highlight' : 'text-text-dim'}`}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <div className="flex-1 text-text-main"><FormattedText text={option} /></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BossFightView;
