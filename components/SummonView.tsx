
import React, { useState, useMemo } from 'react';
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

// Shooting stars that fly across screen (Genshin meteor effect)
const ShootingStars: React.FC<{ color: string; count?: number }> = ({ color, count = 5 }) => {
    const stars = useMemo(() => Array.from({ length: count }).map((_, i) => ({
        id: i,
        delay: i * 0.15,
        top: `${10 + Math.random() * 30}%`,
        size: 3 + Math.random() * 4,
    })), [count]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute animate-meteorShoot"
                    style={{
                        top: star.top,
                        left: '-10%',
                        animationDelay: `${star.delay}s`,
                    }}
                >
                    {/* Star head */}
                    <div
                        className="rounded-full"
                        style={{
                            width: star.size * 2,
                            height: star.size * 2,
                            backgroundColor: color,
                            boxShadow: `0 0 ${star.size * 4}px ${star.size * 2}px ${color}, 0 0 ${star.size * 8}px ${star.size * 4}px ${color}`,
                        }}
                    />
                    {/* Star trail */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{
                            right: star.size * 2,
                            width: star.size * 30,
                            height: star.size,
                            background: `linear-gradient(90deg, transparent, ${color})`,
                            filter: `blur(${star.size / 2}px)`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

// Expanding rings like Genshin wish animation
const WishRings: React.FC<{ color: string }> = ({ color }) => {
    const rings = [0, 0.2, 0.4, 0.6, 0.8];
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1000px' }}>
            {rings.map((delay, i) => (
                <div
                    key={i}
                    className="absolute rounded-full border-4 animate-wishRing"
                    style={{
                        width: 100 + i * 20,
                        height: 100 + i * 20,
                        borderColor: color,
                        animationDelay: `${delay}s`,
                        opacity: 0,
                    }}
                />
            ))}
        </div>
    );
};

// Vertical light beam
const LightBeam: React.FC<{ color: string }> = ({ color }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
            className="absolute w-32 h-[200%] animate-lightBeam"
            style={{
                background: `linear-gradient(180deg, transparent, ${color}40, ${color}, ${color}40, transparent)`,
                filter: 'blur(20px)',
            }}
        />
        <div
            className="absolute w-16 h-[200%] animate-lightBeam"
            style={{
                background: `linear-gradient(180deg, transparent, ${color}80, ${color}, ${color}80, transparent)`,
                filter: 'blur(8px)',
                animationDelay: '0.1s',
            }}
        />
    </div>
);

// Particles gathering toward center
const GatheringParticles: React.FC<{ color: string }> = ({ color }) => {
    const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => {
        const angle = (360 / 30) * i;
        const distance = 150 + Math.random() * 100;
        return {
            id: i,
            x: Math.cos(angle * Math.PI / 180) * distance,
            y: Math.sin(angle * Math.PI / 180) * distance,
            delay: Math.random() * 0.5,
            size: 3 + Math.random() * 5,
        };
    }), []);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full animate-energyGather"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: color,
                        boxShadow: `0 0 ${p.size * 2}px ${color}`,
                        left: `calc(50% + ${p.x}px)`,
                        top: `calc(50% + ${p.y}px)`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

// Glitter/sparkle particles falling
const GlitterParticles: React.FC<{ color: string }> = ({ color }) => {
    const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 1.5,
        size: 2 + Math.random() * 4,
        duration: 1.5 + Math.random() * 1,
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute top-0"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        backgroundColor: color,
                        boxShadow: `0 0 ${p.size * 2}px ${color}`,
                        borderRadius: '50%',
                        animation: `glitterFall ${p.duration}s linear ${p.delay}s forwards`,
                    }}
                />
            ))}
        </div>
    );
};

// Star burst effect at reveal
const StarBurst: React.FC<{ color: string }> = ({ color }) => {
    const rays = 12;
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: rays }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-32 origin-bottom animate-starBurst"
                    style={{
                        background: `linear-gradient(to top, ${color}, transparent)`,
                        transform: `rotate(${(360 / rays) * i}deg)`,
                        animationDelay: `${i * 0.02}s`,
                    }}
                />
            ))}
        </div>
    );
};

// Atmospheric background particles
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
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

// Animation phases
type SummonPhase = 'idle' | 'charging' | 'shooting' | 'reveal' | 'display';

const SummonView: React.FC<SummonViewProps> = ({ auraPoints, setAuraPoints, userCreatures, addCreature }) => {
    const [phase, setPhase] = useState<SummonPhase>('idle');
    const [summonedResults, setSummonedResults] = useState<SummonResult[]>([]);

    const getRarityColor = (rarity: Rarity) => {
        switch (rarity) {
            case Rarity.Common: return '#6b7280';
            case Rarity.Rare: return '#4338ca';
            case Rarity.Legendary: return '#ca8a04';
            default: return '#6b7280';
        }
    };

    const getRarityTextClass = (rarity: Rarity) => {
        switch (rarity) {
            case Rarity.Common: return 'text-common';
            case Rarity.Rare: return 'text-rare';
            case Rarity.Legendary: return 'text-legendary';
            default: return 'text-text-main';
        }
    };

    const performSummon = (count: number) => {
        const totalCost = SUMMON_COST * count;
        if (auraPoints < totalCost || phase !== 'idle') return;

        setAuraPoints(prev => prev - totalCost);
        setSummonedResults([]);

        // Generate results
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

        // Sort results by rarity for dramatic effect (commons first, legendary last)
        const sorted = [...results].sort((a, b) => {
            const rarityOrder = { [Rarity.Common]: 0, [Rarity.Rare]: 1, [Rarity.Legendary]: 2 };
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        });
        setSummonedResults(sorted);

        // Phase 1: Charging (particles gather)
        setPhase('charging');

        // Phase 2: Shooting stars (after 1s)
        setTimeout(() => setPhase('shooting'), 1000);

        // Phase 3: Reveal (after 2s)
        setTimeout(() => setPhase('reveal'), 2000);

        // Phase 4: Display (after 3.5s)
        setTimeout(() => setPhase('display'), 3500);
    };

    const handleSkip = () => {
        if (phase === 'display') {
            setPhase('idle');
            setSummonedResults([]);
        } else if (phase !== 'idle') {
            setPhase('display');
        }
    };

    const handleClose = () => {
        setPhase('idle');
        setSummonedResults([]);
    };

    // Get the highest rarity from results for color theming
    const highestRarity = useMemo(() => {
        if (summonedResults.length === 0) return Rarity.Common;
        const hasLegendary = summonedResults.some(r => r.rarity === Rarity.Legendary);
        const hasRare = summonedResults.some(r => r.rarity === Rarity.Rare);
        if (hasLegendary) return Rarity.Legendary;
        if (hasRare) return Rarity.Rare;
        return Rarity.Common;
    }, [summonedResults]);

    const themeColor = getRarityColor(highestRarity);

    return (
        <div className="flex flex-col items-center h-full text-center p-4 max-w-4xl mx-auto">
            <h1 className="font-sans text-lg bg-highlight text-text-light px-6 py-2 inline-block mb-2 mt-4 shadow-lg rounded-sm transform -rotate-1">Divine Portal</h1>
            <p className="text-text-dim mb-8 text-[10px] uppercase tracking-widest font-bold">Bridge the gap between worlds</p>

            <div className="flex-grow w-full flex items-center justify-center">
                <div
                    className={`w-full min-h-[400px] lg:min-h-[500px] bg-slate-900 border-4 border-slate-800 flex items-center justify-center relative overflow-hidden transition-all duration-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${phase === 'charging' ? 'animate-shake' : ''}`}
                    onClick={phase !== 'idle' ? handleSkip : undefined}
                    style={{ cursor: phase !== 'idle' ? 'pointer' : 'default' }}
                >
                    <AtmosphericParticles />

                    {/* Ambient glow */}
                    <div
                        className={`absolute w-32 h-32 rounded-full blur-2xl transition-all duration-1000 ${
                            phase !== 'idle' ? 'scale-[4] opacity-100' : 'scale-100 opacity-50'
                        }`}
                        style={{ backgroundColor: phase !== 'idle' ? `${themeColor}40` : '#ca8a0410' }}
                    />

                    {/* Phase: Charging - Particles gathering */}
                    {phase === 'charging' && (
                        <>
                            <GatheringParticles color={themeColor} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="absolute w-48 h-48 border-t-4 border-b-4 rounded-full animate-spinSlow" style={{ borderColor: `${themeColor}60` }} />
                                <div className="absolute w-64 h-64 border-l-4 border-r-4 rounded-full animate-spinSlowReverse" style={{ borderColor: `${themeColor}40` }} />
                                <div className="absolute w-24 h-24 rounded-full filter blur-xl animate-pulse" style={{ backgroundColor: themeColor }} />
                            </div>
                            <p className="absolute bottom-8 text-slate-400 text-xs animate-pulse">Summoning...</p>
                        </>
                    )}

                    {/* Phase: Shooting stars */}
                    {phase === 'shooting' && (
                        <>
                            <ShootingStars color={themeColor} count={7} />
                            <WishRings color={themeColor} />
                            <div
                                className="absolute w-40 h-40 rounded-full filter blur-3xl animate-pulse"
                                style={{ backgroundColor: themeColor, opacity: 0.5 }}
                            />
                        </>
                    )}

                    {/* Phase: Reveal - Light beam and burst */}
                    {phase === 'reveal' && (
                        <>
                            <LightBeam color={themeColor} />
                            <StarBurst color={themeColor} />
                            <GlitterParticles color={themeColor} />
                            {/* White flash */}
                            <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
                        </>
                    )}

                    {/* Phase: Display results */}
                    {phase === 'display' && summonedResults.length > 0 && (
                        <div className="w-full h-full p-4 overflow-y-auto max-h-[60vh] lg:max-h-full flex items-center justify-center">
                            <GlitterParticles color={themeColor} />

                            {summonedResults.length === 1 ? (
                                // Single summon - big reveal
                                <div className="text-center py-12 relative animate-creatureReveal">
                                    {/* Rarity aura */}
                                    <div
                                        className={`absolute inset-0 rounded-full ${
                                            summonedResults[0].rarity === Rarity.Legendary ? 'animate-legendaryAura' :
                                            summonedResults[0].rarity === Rarity.Rare ? 'animate-rareAura' : ''
                                        }`}
                                        style={{ transform: 'scale(0.5)' }}
                                    />

                                    {/* Background radial */}
                                    <div
                                        className="absolute inset-0 animate-pulse"
                                        style={{
                                            background: `radial-gradient(circle, ${getRarityColor(summonedResults[0].rarity)}30 0%, transparent 70%)`,
                                        }}
                                    />

                                    <div className="relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                        <PixelCreature creature={summonedResults[0]} evolutionStage={1} pixelSize={14} />
                                        {summonedResults[0].isNew ? (
                                            <div className="absolute -top-4 -right-4 bg-accent text-white font-black text-xs px-3 py-1.5 rounded-sm border-2 border-white shadow-lg animate-bounce uppercase tracking-tighter">NEW</div>
                                        ) : (
                                            <div className="absolute -bottom-4 -right-4 bg-primary text-white font-black text-sm px-2 py-1 rounded-sm border-2 border-white shadow-lg uppercase tracking-tighter">x{summonedResults[0].multiplier}</div>
                                        )}
                                    </div>

                                    <h2 className="text-3xl font-bold mt-8 text-white tracking-tighter drop-shadow-md">{summonedResults[0].name}</h2>
                                    <p className={`text-xl font-black uppercase tracking-[0.3em] mt-2 ${getRarityTextClass(summonedResults[0].rarity)} animate-textGlow`}>
                                        {summonedResults[0].rarity}
                                    </p>
                                </div>
                            ) : (
                                // Multi summon - grid display
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full max-w-3xl">
                                    {summonedResults.map((result, idx) => (
                                        <div
                                            key={idx}
                                            className={`bg-slate-800/50 border-2 p-4 rounded-xl relative flex flex-col items-center justify-center transition-all shadow-xl animate-creatureReveal hover:scale-105 ${
                                                result.rarity === Rarity.Legendary ? 'border-legendary' :
                                                result.rarity === Rarity.Rare ? 'border-rare' : 'border-slate-700'
                                            }`}
                                            style={{
                                                animationDelay: `${idx * 100}ms`,
                                                boxShadow: result.rarity === Rarity.Legendary
                                                    ? '0 0 20px rgba(202, 138, 4, 0.5)'
                                                    : result.rarity === Rarity.Rare
                                                        ? '0 0 15px rgba(67, 56, 202, 0.4)'
                                                        : undefined
                                            }}
                                        >
                                            <div className="drop-shadow-lg relative">
                                                <PixelCreature creature={result} evolutionStage={1} pixelSize={4} />
                                                {result.isNew ? (
                                                    <div className="absolute -top-4 -right-4 bg-accent text-white font-black text-[8px] px-1.5 py-0.5 rounded-sm border border-white shadow-md animate-pulse uppercase">NEW</div>
                                                ) : (
                                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white font-black text-[10px] px-1 rounded-sm border border-white shadow-md">x{result.multiplier}</div>
                                                )}
                                            </div>
                                            <p className="text-[9px] mt-4 font-bold truncate w-full text-slate-300 uppercase">{result.name}</p>
                                            <p className={`text-[8px] font-black tracking-widest ${getRarityTextClass(result.rarity)}`}>{result.rarity}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute bottom-4 right-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Idle state */}
                    {phase === 'idle' && summonedResults.length === 0 && (
                        <div className="text-center text-slate-500 animate-fadeIn">
                            <div className="text-7xl mb-6 filter drop-shadow-[0_0_20px_rgba(100,100,255,0.2)] animate-float">🔮</div>
                            <p className="text-sm font-sans uppercase tracking-[0.2em] opacity-60">The portal is silent...</p>
                        </div>
                    )}

                    {/* Skip hint */}
                    {phase !== 'idle' && phase !== 'display' && (
                        <p className="absolute bottom-4 text-slate-500 text-[10px] animate-pulse">Tap to skip</p>
                    )}
                </div>
            </div>

            {/* Summon buttons */}
            <div className="w-full mt-10 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                    <button
                        onClick={() => performSummon(1)}
                        disabled={(auraPoints < SUMMON_COST) || phase !== 'idle'}
                        className="flex-1 bg-surface hover:bg-secondary/20 text-text-main font-bold py-4 px-6 shadow-md transition-all duration-200 border-2 border-secondary disabled:opacity-40 disabled:cursor-not-allowed border-b-4 active:border-b-0 active:translate-y-0.5 rounded-lg flex items-center justify-center gap-3 uppercase tracking-tighter text-[10px]"
                    >
                        <span>Summon x1</span>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded font-mono">{SUMMON_COST} 💎</span>
                    </button>
                    <button
                        onClick={() => performSummon(10)}
                        disabled={(auraPoints < SUMMON_COST * 10) || phase !== 'idle'}
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
