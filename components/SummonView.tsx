
import React, { useState, useMemo, useEffect } from 'react';
import { Creature, Rarity, CreatureInstance } from '../types';
import { INITIAL_CREATURES, SUMMON_COST } from '../constants';
import { PixelCreature } from './CreatureCard';

interface SummonResult extends Creature {
    isNew: boolean;
    multiplier: number;
}

interface SummonViewProps {
    auraPoints: number;
    setAuraPoints: React.Dispatch<React.SetStateAction<number>>;
    userCreatures: CreatureInstance[];
    addCreature: (creatureId: number, customData?: Partial<CreatureInstance>) => void;
}

const AtmosphericParticles: React.FC = () => {
    const particles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${4 + Math.random() * 4}s`,
        delay: `${Math.random() * 5}s`,
        size: `${Math.floor(2 + Math.random() * 4)}px`,
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="aura-particle absolute bottom-0 bg-highlight/30 rounded-full"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        '--duration': p.duration,
                        '--delay': p.delay,
                    } as any}
                />
            ))}
        </div>
    );
};

const ParticleBurst: React.FC<{ color?: string }> = ({ color = '#ca8a04' }) => {
    const particles = Array.from({ length: 40 });
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            {particles.map((_, i) => {
                const angle = (360 / particles.length) * i;
                const distanceX = Math.cos(angle * (Math.PI / 180)) * (100 + Math.random() * 150);
                const distanceY = Math.sin(angle * (Math.PI / 180)) * (100 + Math.random() * 150);
                const duration = 0.8 + Math.random() * 0.6;
                const delay = Math.random() * 0.1;
                const size = Math.floor(4 + Math.random() * 10);

                return (
                    <div
                        key={i}
                        className="absolute rounded-full shadow-lg"
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: color,
                            '--tw-translate-x': `${distanceX}px`,
                            '--tw-translate-y': `${distanceY}px`,
                            animation: `burst ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) ${delay}s forwards`,
                        } as any}
                    />
                );
            })}
        </div>
    );
};

const SummonView: React.FC<SummonViewProps> = ({ auraPoints, setAuraPoints, userCreatures, addCreature }) => {
    const [isSummoning, setIsSummoning] = useState(false);
    const [summonedResults, setSummonedResults] = useState<SummonResult[]>([]);

    const performSummon = (count: number) => {
        const totalCost = SUMMON_COST * count;
        if (auraPoints < totalCost || isSummoning) return;

        setAuraPoints(prev => prev - totalCost);
        setIsSummoning(true);
        setSummonedResults([]);

        setTimeout(() => {
            const results: SummonResult[] = [];
            const currentOwnedMap = new Map<number, number>();
            userCreatures.forEach(c => {
                currentOwnedMap.set(c.creatureId, (currentOwnedMap.get(c.creatureId) || 0) + 1);
            });

            for (let i = 0; i < count; i++) {
                const rand = Math.random() * 100;
                let chosenRarity: Rarity;
                if (rand < 5) chosenRarity = Rarity.Legendary;
                else if (rand < 30) chosenRarity = Rarity.Rare;
                else chosenRarity = Rarity.Common;

                const possibleCreatures = INITIAL_CREATURES.filter(c => c.rarity === chosenRarity);
                const creature = possibleCreatures[Math.floor(Math.random() * possibleCreatures.length)];
                
                const ownedBeforeThisBatch = currentOwnedMap.get(creature.id) || 0;
                const isNew = ownedBeforeThisBatch === 0;
                const newCount = ownedBeforeThisBatch + 1;
                currentOwnedMap.set(creature.id, newCount);

                results.push({
                    ...creature,
                    isNew,
                    multiplier: newCount
                });
                
                addCreature(creature.id);
            }
            setSummonedResults(results);
        }, 1800);

        setTimeout(() => setIsSummoning(false), 4500);
    };

    const getRarityColor = (rarity: Rarity) => {
        switch (rarity) {
            case Rarity.Common: return 'text-common';
            case Rarity.Rare: return 'text-rare';
            case Rarity.Legendary: return 'text-legendary';
            default: return 'text-text-main';
        }
    };

    const getRarityHex = (rarity: Rarity) => {
        switch (rarity) {
            case Rarity.Common: return '#6b7280';
            case Rarity.Rare: return '#4338ca';
            case Rarity.Legendary: return '#ca8a04';
            default: return '#000000';
        }
    };
    
    const isCharging = isSummoning && summonedResults.length === 0;

    return (
        <div className="flex flex-col items-center h-full text-center p-4 max-w-4xl mx-auto">
            <h1 className="font-sans text-lg bg-highlight text-text-light px-6 py-2 inline-block mb-2 mt-4 shadow-lg rounded-sm transform -rotate-1">Divine Portal</h1>
            <p className="text-text-dim mb-8 text-[10px] uppercase tracking-widest font-bold">Bridge the gap between worlds</p>

            <div className="flex-grow w-full flex items-center justify-center">
                <div className={`w-full min-h-[400px] lg:min-h-[500px] bg-slate-900 border-4 border-slate-800 flex items-center justify-center relative overflow-hidden transition-all duration-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${isCharging ? 'animate-shake' : ''}`}>
                    <AtmosphericParticles />
                    <div className={`absolute w-32 h-32 rounded-full blur-2xl transition-all duration-1000 ${isCharging ? 'bg-highlight/40 scale-[4] opacity-100' : 'bg-highlight/10 scale-100 opacity-50'}`}></div>

                    {isCharging && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="absolute w-48 h-48 border-t-4 border-b-4 border-highlight/60 rounded-full animate-spinSlow"></div>
                            <div className="absolute w-64 h-64 border-l-4 border-r-4 border-primary/40 rounded-full animate-spinSlowReverse"></div>
                            <div className="absolute w-24 h-24 bg-highlight rounded-full filter blur-xl animate-pulse"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#ca8a04_100%)] opacity-20 animate-pulse"></div>
                        </div>
                    )}

                    {summonedResults.length > 0 && (
                        <div className="w-full h-full p-4 overflow-y-auto max-h-[60vh] lg:max-h-full flex items-center justify-center">
                            {isSummoning && (
                                <div className="absolute inset-0 bg-white animate-flash z-20 pointer-events-none shadow-[inset_0_0_100px_rgba(255,255,255,1)]" />
                            )}
                            
                            {summonedResults.length === 1 ? (
                                <div className={`text-center py-12 relative ${isSummoning ? 'animate-reveal' : 'animate-float'}`}>
                                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-pulse"></div>
                                    <div className="relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                        <PixelCreature creature={summonedResults[0]} evolutionStage={1} pixelSize={14} />
                                        {summonedResults[0].isNew ? (
                                            <div className="absolute -top-4 -right-4 bg-accent text-white font-black text-xs px-3 py-1.5 rounded-sm border-2 border-white shadow-lg animate-bounce uppercase tracking-tighter">NEW</div>
                                        ) : (
                                            <div className="absolute -bottom-4 -right-4 bg-primary text-white font-black text-sm px-2 py-1 rounded-sm border-2 border-white shadow-lg uppercase tracking-tighter">x{summonedResults[0].multiplier}</div>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-bold mt-8 text-white tracking-tighter drop-shadow-md">{summonedResults[0].name}</h2>
                                    <p className={`text-xl font-black uppercase tracking-[0.3em] mt-2 ${getRarityColor(summonedResults[0].rarity)}`}>{summonedResults[0].rarity}</p>
                                    {isSummoning && <ParticleBurst color={getRarityHex(summonedResults[0].rarity)} />}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full max-w-3xl">
                                    {summonedResults.map((result, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`bg-slate-800/50 border-2 border-slate-700 p-4 rounded-xl relative flex flex-col items-center justify-center transition-all shadow-xl ${isSummoning ? 'animate-reveal' : 'hover:scale-105 hover:bg-slate-700/50'}`}
                                            style={{ animationDelay: `${idx * 150}ms` }}
                                        >
                                            <div className="drop-shadow-lg relative">
                                                <PixelCreature creature={result} evolutionStage={1} pixelSize={4} />
                                                {result.isNew ? (
                                                    <div className="absolute -top-4 -right-4 bg-accent text-white font-black text-[8px] px-1.5 py-0.5 rounded-sm border border-white shadow-md animate-pulse uppercase">NEW</div>
                                                ) : (
                                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white font-black text-[10px] px-1 rounded-sm border border-white shadow-md">x{result.multiplier}</div>
                                                )}
                                            </div>
                                            <p className={`text-[9px] mt-4 font-bold truncate w-full text-slate-300 uppercase`}>{result.name}</p>
                                            <p className={`text-[8px] font-black tracking-widest ${getRarityColor(result.rarity)}`}>{result.rarity}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {!isSummoning && summonedResults.length === 0 && (
                        <div className="text-center text-slate-500 animate-fadeIn">
                            <div className="text-7xl mb-6 filter drop-shadow-[0_0_20px_rgba(100,100,255,0.2)] animate-float">🔮</div>
                            <p className="text-sm font-sans uppercase tracking-[0.2em] opacity-60">The portal is silent...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full mt-10 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                    <button 
                        onClick={() => performSummon(1)} 
                        disabled={(auraPoints < SUMMON_COST) || isSummoning}
                        className="flex-1 bg-surface hover:bg-secondary/20 text-text-main font-bold py-4 px-6 shadow-md transition-all duration-200 border-2 border-secondary disabled:opacity-40 disabled:cursor-not-allowed border-b-4 active:border-b-0 active:translate-y-0.5 rounded-lg flex items-center justify-center gap-3 uppercase tracking-tighter text-[10px]"
                    >
                        <span>Summon x1</span>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded font-mono">{SUMMON_COST} 💎</span>
                    </button>
                    <button 
                        onClick={() => performSummon(10)} 
                        disabled={(auraPoints < SUMMON_COST * 10) || isSummoning}
                        className="flex-1 bg-highlight hover:brightness-110 text-white font-bold py-4 px-6 shadow-md transition-all duration-200 border-2 border-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed border-b-4 border-yellow-900 active:border-b-0 active:translate-y-0.5 rounded-lg flex items-center justify-center gap-3 uppercase tracking-tighter text-[10px]"
                    >
                        <span>Summon x10</span>
                        <span className="bg-white/20 px-2 py-1 rounded font-mono">{SUMMON_COST * 10} 💎</span>
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-surface/80 backdrop-blur px-8 py-3 rounded-lg border-2 border-secondary shadow-sm animate-fadeIn flex items-center gap-3">
                <span className="text-lg">💎</span>
                <p className="text-xs tracking-widest uppercase font-bold text-primary">Your Aura: <span className="text-highlight font-black ml-1">{auraPoints.toLocaleString()}</span></p>
            </div>
        </div>
    );
};

export default SummonView;
