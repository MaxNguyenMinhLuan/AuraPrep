
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Creature, Rarity, CreatureInstance } from '../types';
import { INITIAL_CREATURES, SUMMON_COST } from '../constants';
import { PixelCreature } from './CreatureCard';
import AuraIcon from './icons/AuraIcon';

interface SummonResult extends Creature {
    isNew: boolean;
    multiplier: number;
    isShiny?: boolean;
}

interface SummonViewProps {
    auraPoints: number;
    setAuraPoints: React.Dispatch<React.SetStateAction<number>>;
    userCreatures: CreatureInstance[];
    addCreature: (creatureId: number, customData?: Partial<CreatureInstance>) => void;
    onSummonComplete?: () => void;  // Optional callback when summon animation completes
}

// Night-sky star field for the comet flight
const StarField: React.FC<{ count?: number; dim?: boolean }> = ({ count = 50, dim = false }) => {
    const stars = useMemo(() => Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 1.8,
        duration: `${2 + Math.random() * 3}s`,
        delay: `${Math.random() * 3}s`,
    })), [count]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {stars.map((s) => (
                <div
                    key={s.id}
                    className="absolute rounded-full bg-white animate-starTwinkle"
                    style={{
                        left: s.left,
                        top: s.top,
                        width: s.size,
                        height: s.size,
                        opacity: dim ? 0.3 : undefined,
                        '--twinkle-duration': s.duration,
                        '--twinkle-delay': s.delay,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

// The comet: arcs across the sky, hangs at the crest, dives into center.
// Trail color = the batch's best-pull rarity (the Genshin tell).
const Comet: React.FC<{ color: string; secondaryColor: string }> = ({ color, secondaryColor }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute animate-cometFlight">
            {/* Tail — rotates to trail behind the motion direction */}
            <div
                className="absolute top-1/2 animate-cometTail"
                style={{
                    right: 6,
                    width: '36vw',
                    height: 9,
                    transformOrigin: '100% 50%',
                    background: `linear-gradient(90deg, transparent, ${secondaryColor}90, ${color})`,
                    filter: 'blur(5px)',
                    borderRadius: 999,
                }}
            />
            {/* Head */}
            <div
                className="rounded-full"
                style={{
                    width: 18,
                    height: 18,
                    backgroundColor: '#ffffff',
                    boxShadow: `0 0 12px 6px ${color}, 0 0 40px 18px ${secondaryColor}80, 0 0 80px 40px ${color}40`,
                }}
            />
        </div>
    </div>
);

// Vertical light beam
const LightBeam: React.FC<{ color: string; secondaryColor: string }> = ({ color, secondaryColor }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
            className="absolute w-32 h-[200%] animate-lightBeam"
            style={{
                background: `linear-gradient(180deg, transparent, ${color}20, ${color}, ${secondaryColor}, ${secondaryColor}20, transparent)`,
                filter: 'blur(20px)',
            }}
        />
        <div
            className="absolute w-16 h-[200%] animate-lightBeam"
            style={{
                background: `linear-gradient(180deg, transparent, ${color}50, ${color}, ${secondaryColor}, ${secondaryColor}50, transparent)`,
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
const GlitterParticles: React.FC<{ color: string; secondaryColor: string }> = ({ color, secondaryColor }) => {
    const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 1.5,
        size: 2 + Math.random() * 4,
        duration: 1.5 + Math.random() * 1,
        useSecondary: Math.random() > 0.5,
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => {
                const activeColor = p.useSecondary ? secondaryColor : color;
                const randomTop = -10 - Math.random() * 20; // Randomize start height above container top
                return (
                    <div
                        key={p.id}
                        className="absolute"
                        style={{
                            left: p.left,
                            top: `${randomTop}px`,
                            width: p.size,
                            height: p.size,
                            backgroundColor: activeColor,
                            boxShadow: `0 0 ${p.size * 2}px ${activeColor}`,
                            borderRadius: '50%',
                            opacity: 0,
                            animation: `glitterFall ${p.duration}s linear ${p.delay}s both`,
                        }}
                    />
                );
            })}
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
            {particles.map((p) => {
                const randomBottom = -Math.random() * 10;
                return (
                    <div
                        key={p.id}
                        className="aura-particle absolute bg-highlight/30 rounded-full"
                        style={{
                            left: p.left,
                            bottom: `${randomBottom}px`,
                            width: p.size,
                            height: p.size,
                            opacity: 0,
                            '--duration': p.duration,
                            '--delay': p.delay,
                        } as React.CSSProperties}
                    />
                );
            })}
        </div>
    );
};

// Comet Rite phases:
// idle → charging (portal draws energy) → flight (comet arcs, trail = best-pull color)
// → impact (dive + flash) → card ×N (one-by-one tap-through; bigPull interstitial
// before Ultra Rare / Legendary / Shiny) → summary (grid, multi only)
type SummonPhase = 'idle' | 'charging' | 'flight' | 'impact' | 'bigPull' | 'card' | 'summary';

const SummonView: React.FC<SummonViewProps> = ({ auraPoints, setAuraPoints, userCreatures, addCreature, onSummonComplete }) => {
    const [phase, setPhase] = useState<SummonPhase>('idle');
    const [summonedResults, setSummonedResults] = useState<SummonResult[]>([]);
    const [revealIndex, setRevealIndex] = useState(0);

    const timeoutsRef = useRef<number[]>([]);
    const completedRef = useRef(false);
    const prefersReducedMotion = useMemo(
        () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
        []
    );

    const queue = (fn: () => void, ms: number) => {
        timeoutsRef.current.push(window.setTimeout(fn, ms));
    };
    const clearQueue = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };
    useEffect(() => clearQueue, []);

    // Warm the browser cache for the portal videos so the first summon
    // doesn't open on a black screen while ~4.5MB downloads.
    useEffect(() => {
        ['/portal-shatter.mp4', '/portal-resists.mp4'].forEach(src => {
            const v = document.createElement('video');
            v.preload = 'auto';
            v.muted = true;
            v.src = src;
        });
    }, []);

    const getRarityColor = (rarity: Rarity) => {
        switch (rarity) {
            case Rarity.Common: return '#6b7280';
            case Rarity.Uncommon: return '#10b981';
            case Rarity.Rare: return '#4f46e5';
            case Rarity.UltraRare: return '#a855f7';
            case Rarity.Legendary: return '#ca8a04';
            default: return '#6b7280';
        }
    };

    const getSecondaryColor = (rarity: Rarity) => {
        switch (rarity) {
            case Rarity.Common: return '#9ca3af';
            case Rarity.Uncommon: return '#06b6d4';
            case Rarity.Rare: return '#d946ef';
            case Rarity.UltraRare: return '#ec4899';
            case Rarity.Legendary: return '#f97316';
            default: return '#9ca3af';
        }
    };

    const getRarityTextClass = (rarity: Rarity) => {
        switch (rarity) {
            case Rarity.Common: return 'text-slate-500 font-bold';
            case Rarity.Uncommon: return 'text-emerald-600 font-bold';
            case Rarity.Rare: return 'text-indigo-600 font-bold';
            case Rarity.UltraRare: return 'text-purple-600 font-bold';
            case Rarity.Legendary: return 'text-amber-500 font-bold';
            default: return 'text-text-main';
        }
    };

    const isBigPull = (r: SummonResult) =>
        r.isShiny || r.rarity === Rarity.UltraRare || r.rarity === Rarity.Legendary;

    const fireComplete = () => {
        if (!completedRef.current) {
            completedRef.current = true;
            onSummonComplete?.();
        }
    };

    const startCardReveal = (i: number, results: SummonResult[]) => {
        clearQueue();
        setRevealIndex(i);
        setPhase('card');
    };

    const finishReveals = () => {
        clearQueue();
        if (summonedResults.length === 1) {
            setPhase('idle');
            setSummonedResults([]);
        } else {
            setPhase('summary');
        }
        fireComplete();
    };

    const advanceCard = () => {
        const next = revealIndex + 1;
        if (next < summonedResults.length) {
            startCardReveal(next, summonedResults);
        } else {
            finishReveals();
        }
    };

    const performSummon = (count: number) => {
        const totalCost = SUMMON_COST * count;
        if (auraPoints < totalCost) return;

        // Allow summoning from idle or summary phase (not during animation)
        if (phase !== 'idle' && phase !== 'summary') return;

        setAuraPoints(prev => prev - totalCost);
        setSummonedResults([]);
        setRevealIndex(0);
        completedRef.current = false;
        clearQueue();

        // Generate results
        const results: SummonResult[] = [];
        const currentOwnedMap = new Map<number, number>();
        userCreatures.forEach(c => {
            currentOwnedMap.set(c.creatureId, (currentOwnedMap.get(c.creatureId) || 0) + 1);
        });

        // Track unique creature IDs currently owned
        const ownedUniqueIds = new Set<number>();
        userCreatures.forEach(c => ownedUniqueIds.add(c.creatureId));

        for (let i = 0; i < count; i++) {
            const currentOwnedAndBatchIds = new Set<number>([
                ...ownedUniqueIds,
                ...results.map(r => r.id)
            ]);

            let chosenRarity: Rarity;
            let creature: Creature;

            // First 5 summons (guaranteed unique)
            const isNoDuplicateSummon = currentOwnedAndBatchIds.size < 6;

            if (isNoDuplicateSummon) {
                const rand = Math.random() * 100;
                if (rand < 61.5) chosenRarity = Rarity.Common;
                else if (rand < 86.5) chosenRarity = Rarity.Uncommon;
                else if (rand < 99.5) chosenRarity = Rarity.Rare;
                else chosenRarity = Rarity.UltraRare;

                let possibleCreatures = INITIAL_CREATURES.filter(c =>
                    c.rarity === chosenRarity && !currentOwnedAndBatchIds.has(c.id)
                );

                if (possibleCreatures.length === 0) {
                    possibleCreatures = INITIAL_CREATURES.filter(c =>
                        !currentOwnedAndBatchIds.has(c.id)
                    );
                }

                if (possibleCreatures.length === 0) {
                    possibleCreatures = INITIAL_CREATURES.filter(c => c.rarity === chosenRarity);
                }

                creature = possibleCreatures[Math.floor(Math.random() * possibleCreatures.length)];
            } else {
                const rand = Math.random() * 100;
                if (rand < 61.5) chosenRarity = Rarity.Common;
                else if (rand < 86.5) chosenRarity = Rarity.Uncommon;
                else if (rand < 99.5) chosenRarity = Rarity.Rare;
                else chosenRarity = Rarity.UltraRare;

                const possibleCreatures = INITIAL_CREATURES.filter(c => c.rarity === chosenRarity);
                creature = possibleCreatures[Math.floor(Math.random() * possibleCreatures.length)];
            }

            const ownedBeforeThisBatch = currentOwnedMap.get(creature.id) || 0;
            const isNew = ownedBeforeThisBatch === 0;
            const newCount = ownedBeforeThisBatch + 1;
            currentOwnedMap.set(creature.id, newCount);

            const isShiny = Math.random() < 1 / 500;

            results.push({
                ...creature,
                isNew,
                multiplier: newCount,
                isShiny
            });

            addCreature(creature.id, { isShiny });
        }

        // Sort by rarity ascending so the tap-through builds to the best pull
        const sorted = [...results].sort((a, b) => {
            const rarityOrder = {
                [Rarity.Common]: 0,
                [Rarity.Uncommon]: 1,
                [Rarity.Rare]: 2,
                [Rarity.UltraRare]: 3,
                [Rarity.Legendary]: 4
            };
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        });
        setSummonedResults(sorted);

        if (prefersReducedMotion) {
            startCardReveal(0, sorted);
        } else {
            setPhase('flight');
            // Safety net: the portal videos run ~5s. If playback stalls
            // (autoplay blocked, decoder hiccup), advance anyway rather than
            // stranding the user. Cleared by onEnded/onError/tap via clearQueue.
            queue(() => startCardReveal(0, sorted), 6500);
        }
    };

    const handleTap = () => {
        switch (phase) {
            case 'charging':
            case 'flight':
            case 'impact':
                // Skip the cinematics straight to the first card
                startCardReveal(0, summonedResults);
                break;
            case 'bigPull':
                clearQueue();
                setPhase('card');
                break;
            case 'card':
                advanceCard();
                break;
            case 'summary':
                setPhase('idle');
                setSummonedResults([]);
                break;
        }
    };

    // Best rarity in the batch — drives the comet's color tell
    const highestRarity = useMemo(() => {
        if (summonedResults.length === 0) return Rarity.Common;
        const hasLegendary = summonedResults.some(r => r.rarity === Rarity.Legendary);
        const hasUltraRare = summonedResults.some(r => r.rarity === Rarity.UltraRare);
        const hasRare = summonedResults.some(r => r.rarity === Rarity.Rare);
        const hasUncommon = summonedResults.some(r => r.rarity === Rarity.Uncommon);
        if (hasLegendary) return Rarity.Legendary;
        if (hasUltraRare) return Rarity.UltraRare;
        if (hasRare) return Rarity.Rare;
        if (hasUncommon) return Rarity.Uncommon;
        return Rarity.Common;
    }, [summonedResults]);

    const themeColor = getRarityColor(highestRarity);
    const secondaryColor = getSecondaryColor(highestRarity);
    const isAnimating = phase !== 'idle' && phase !== 'summary';
    const isMulti = summonedResults.length > 1;

    const currentCard = phase === 'card' || phase === 'bigPull' ? summonedResults[revealIndex] : null;
    const cardColor = currentCard ? getRarityColor(currentCard.rarity) : themeColor;
    const cardSecondary = currentCard ? getSecondaryColor(currentCard.rarity) : secondaryColor;
    // Big-pull interstitial color: gold for Legendary/Shiny, purple for Ultra Rare
    const bigPullColor = currentCard && (currentCard.rarity === Rarity.Legendary || currentCard.isShiny) ? '#ca8a04' : '#a855f7';
    const bigPullSecondary = currentCard && (currentCard.rarity === Rarity.Legendary || currentCard.isShiny) ? '#f97316' : '#ec4899';

    return (
        <div className={`flex flex-col items-center justify-center min-h-[75vh] lg:min-h-0 w-full text-center p-2 md:p-4 pb-12 max-w-4xl mx-auto ${
            isAnimating ? 'fixed inset-0 z-50 w-screen h-screen bg-slate-900 p-0 max-w-none overflow-y-auto lg:relative lg:w-full lg:h-full lg:bg-transparent lg:p-4 lg:max-w-4xl lg:overflow-visible' : ''
        }`}>
            {!isAnimating && (
                <>
                    <h1 className="font-sans text-base md:text-lg bg-highlight text-text-light px-4 md:px-6 py-2 inline-block mb-2 mt-2 md:mt-4 shadow-lg rounded-sm transform -rotate-1">Divine Portal</h1>
                    <p className="text-text-dim mb-4 md:mb-8 text-[9px] md:text-[10px] uppercase tracking-widest font-bold">Bridge the gap between worlds</p>
                </>
            )}

            <div className="w-full flex items-center justify-center max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto my-3 md:my-6">
                <div
                    className={`w-full bg-slate-900 flex items-center justify-center relative overflow-hidden transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${
                        phase === 'charging' || phase === 'impact' ? 'animate-shake' : ''
                    } ${
                        isAnimating
                            ? 'w-full h-full min-h-screen rounded-none border-none lg:min-h-[500px] lg:rounded-3xl lg:border-4 lg:border-slate-800'
                            : 'min-h-[300px] md:min-h-[400px] lg:min-h-[500px] border-4 border-slate-800 rounded-2xl md:rounded-3xl'
                    }`}
                    onClick={phase !== 'idle' ? handleTap : undefined}
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

                    {/* Phase: Flight (Cinematic Portal Shatter) */}
                    {phase === 'flight' && (
                        <>
                            <div className="absolute inset-0 bg-slate-950" />
                            <video
                                src="/portal-shatter.mp4"
                                autoPlay
                                muted
                                playsInline
                                onEnded={() => startCardReveal(0, summonedResults)}
                                // If the video 404s or can't decode, never strand the user in
                                // the flight phase — fall through to the first card.
                                onError={() => startCardReveal(0, summonedResults)}
                                className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
                                style={{
                                    filter: highestRarity === Rarity.Legendary ? 'sepia(1) saturate(5) hue-rotate(15deg) brightness(1.3)' :
                                            highestRarity === Rarity.UltraRare ? 'sepia(1) saturate(4) hue-rotate(260deg) brightness(1.2)' :
                                            highestRarity === Rarity.Rare ? 'sepia(1) saturate(5) hue-rotate(220deg) brightness(1.2)' :
                                            highestRarity === Rarity.Uncommon ? 'sepia(1) saturate(4) hue-rotate(120deg) brightness(1.1)' :
                                            'grayscale(1) brightness(1.2)'
                                }}
                            />
                            {/* Legendary washes the whole sky gold */}
                            {highestRarity === Rarity.Legendary && (
                                <div className="absolute inset-0 animate-skyWash pointer-events-none mix-blend-screen" style={{ backgroundColor: '#ca8a0440' }} />
                            )}
                        </>
                    )}

                    {/* Phase: Card — one-by-one reveal, tap to advance */}
                    {phase === 'card' && currentCard && (
                        <div key={`card-${revealIndex}`} className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-slate-950" />
                            <StarField dim />
                            {/* Rarity radial glow */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ background: `radial-gradient(circle at 50% 45%, ${cardColor}2e 0%, transparent 60%)` }}
                            />
                            <LightBeam color={cardColor} secondaryColor={cardSecondary} />
                            <GlitterParticles color={cardColor} secondaryColor={cardSecondary} />
                            {/* Entry flash from the previous beat — opacity-0 base so it doesn't
                                revert to solid white once the flash animation ends */}
                            <div className="absolute inset-0 bg-white opacity-0 animate-flash pointer-events-none" />

                            {/* Reveal counter (multi only) */}
                            {isMulti && (
                                <p className="absolute top-6 right-6 text-slate-400 text-xs font-mono tracking-widest z-20">
                                    {revealIndex + 1} / {summonedResults.length}
                                </p>
                            )}

                            <div className="relative z-10 flex flex-col items-center">
                                {/* Burst ring behind the creature, fires as color lands */}
                                <div className="absolute top-1/3 w-32 h-32 rounded-full border-4 summon-burst-ring pointer-events-none" style={{ borderColor: cardColor }} />

                                {/* Creature: rises as silhouette, bursts into color */}
                                <div className="summon-silhouette relative">
                                    <div className={currentCard.isShiny ? 'drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]' : 'drop-shadow-[0_0_30px_rgba(255,255,255,0.35)]'}>
                                        <PixelCreature creature={currentCard} evolutionStage={1} pixelSize={12} isShiny={currentCard.isShiny} />
                                    </div>
                                </div>

                                <h2 className="summon-rise text-2xl md:text-3xl font-bold mt-6 text-white tracking-tighter drop-shadow-md" style={{ animationDelay: '0.8s' }}>
                                    {currentCard.isShiny ? `Shiny ${currentCard.name}` : currentCard.name}
                                </h2>
                                <p className={`summon-stamp text-lg md:text-xl font-black uppercase tracking-[0.3em] mt-2 ${getRarityTextClass(currentCard.rarity)} animate-textGlow`}>
                                    {currentCard.rarity}
                                </p>

                                <div className="summon-rise flex items-center gap-2 mt-4" style={{ animationDelay: '1.1s' }}>
                                    {currentCard.isNew ? (
                                        <span className="bg-accent text-white font-black text-[10px] px-3 py-1 rounded-sm border-2 border-white shadow-lg uppercase tracking-tighter">NEW</span>
                                    ) : (
                                        <span className="bg-primary text-white font-black text-[10px] px-3 py-1 rounded-sm border-2 border-white shadow-lg uppercase tracking-tighter">x{currentCard.multiplier}</span>
                                    )}
                                    {currentCard.isShiny && (
                                        <span className="bg-amber-400 text-white font-black text-[10px] px-3 py-1 rounded-sm border-2 border-white shadow-lg uppercase tracking-tighter">SHINY</span>
                                    )}
                                </div>
                            </div>

                            <p className="summon-rise absolute bottom-6 left-0 right-0 text-center text-slate-500 text-[10px] animate-pulse" style={{ animationDelay: '1.2s' }}>
                                Tap to continue ▸
                            </p>
                        </div>
                    )}

                    {/* Skip All — jump straight to the summary grid */}
                    {isMulti && (phase === 'card' || phase === 'bigPull') && (
                        <button
                            onClick={(e) => { e.stopPropagation(); finishReveals(); }}
                            className="absolute bottom-5 right-5 z-30 text-slate-400 hover:text-white text-[10px] uppercase tracking-widest font-bold border border-slate-600 hover:border-slate-400 rounded-full px-3 py-1.5 transition-colors bg-slate-900/60"
                        >
                            Skip All ≫
                        </button>
                    )}

                    {/* Phase: Summary — the full batch (multi only) */}
                    {phase === 'summary' && summonedResults.length > 0 && (
                        <div className="w-full h-full p-2 md:p-4 overflow-y-auto max-h-[50vh] md:max-h-[60vh] lg:max-h-full flex items-center justify-center scroll-smooth">
                            <GlitterParticles color={themeColor} secondaryColor={secondaryColor} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6 w-full max-w-3xl">
                                {summonedResults.map((result, idx) => (
                                    <div
                                        key={idx}
                                        className={`bg-slate-800/50 border-2 p-4 rounded-xl relative flex flex-col items-center justify-center transition-all shadow-xl animate-creatureReveal hover:scale-105 ${
                                            result.isShiny ? 'border-amber-400' :
                                            result.rarity === Rarity.Legendary ? 'border-legendary' :
                                            result.rarity === Rarity.Rare ? 'border-rare' : 'border-slate-700'
                                        }`}
                                        style={{
                                            animationDelay: `${idx * 100}ms`,
                                            boxShadow: result.isShiny
                                                ? '0 0 20px rgba(251, 191, 36, 0.7)'
                                                : result.rarity === Rarity.Legendary
                                                    ? '0 0 20px rgba(202, 138, 4, 0.5)'
                                                    : result.rarity === Rarity.Rare
                                                        ? '0 0 15px rgba(67, 56, 202, 0.4)'
                                                        : undefined
                                        }}
                                    >
                                        <div className="drop-shadow-lg relative">
                                            <PixelCreature creature={result} evolutionStage={1} pixelSize={4} isShiny={result.isShiny} />
                                            {result.isNew ? (
                                                <div className="absolute -top-4 -right-4 bg-accent text-white font-black text-[8px] px-1.5 py-0.5 rounded-sm border border-white shadow-md animate-pulse uppercase">NEW</div>
                                            ) : (
                                                <div className="absolute -bottom-2 -right-2 bg-primary text-white font-black text-[10px] px-1 rounded-sm border border-white shadow-md">x{result.multiplier}</div>
                                            )}
                                            {result.isShiny && (
                                                <div className="absolute -top-4 -left-4 bg-amber-400 text-white font-black text-[7px] px-1 py-0.5 rounded-sm border border-white shadow-sm animate-pulse">S</div>
                                            )}
                                        </div>
                                        <p className="text-[9px] mt-4 font-bold truncate w-full text-slate-300 uppercase">{result.name}</p>
                                        <p className={`text-[8px] font-black tracking-widest ${getRarityTextClass(result.rarity)}`}>{result.rarity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Idle state */}
                    {phase === 'idle' && summonedResults.length === 0 && (
                        <div className="text-center text-slate-500 animate-fadeIn">
                            <img src="https://play.pokemonshowdown.com/sprites/itemicons/lustrous-orb.png" alt="Crystal Ball" className="w-20 h-20 mx-auto mb-6 filter drop-shadow-[0_0_20px_rgba(100,100,255,0.3)] animate-float" style={{ imageRendering: 'pixelated' }} />
                            <p className="text-sm font-sans uppercase tracking-[0.2em] opacity-60">The portal is silent...</p>
                        </div>
                    )}

                    {/* Skip hint during cinematics */}
                    {phase === 'flight' && (
                        <p className="absolute bottom-4 right-5 text-slate-500 text-[10px] animate-pulse">Tap to skip</p>
                    )}
                </div>
            </div>

            {/* Summon buttons */}
            <div className="w-full mt-3 md:mt-6 space-y-3 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-2xl mx-auto">
                    <button
                        onClick={() => performSummon(1)}
                        disabled={(auraPoints < SUMMON_COST) || (phase !== 'idle' && phase !== 'summary')}
                        className="flex-1 bg-surface hover:bg-secondary/20 active:bg-secondary/20 text-text-main font-bold py-3 md:py-4 px-4 md:px-6 shadow-card hover:shadow-card-hover transition-premium border-2 border-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed border-b-4 active:border-b-0 active:translate-y-0.5 rounded-xl flex items-center justify-center gap-2 md:gap-3 uppercase tracking-tighter text-[9px] md:text-[10px] touch-target press-effect"
                    >
                        <span>Summon x1</span>
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-mono flex items-center gap-1">{SUMMON_COST} <AuraIcon className="w-3.5 h-3.5 text-primary" /></span>
                    </button>
                    <button
                        onClick={() => performSummon(10)}
                        disabled={(auraPoints < SUMMON_COST * 10) || (phase !== 'idle' && phase !== 'summary')}
                        className="flex-1 bg-highlight hover:brightness-110 active:brightness-110 text-white font-bold py-3 md:py-4 px-4 md:px-6 shadow-card hover:shadow-glow-highlight transition-premium border-2 border-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed border-b-4 border-yellow-900 active:border-b-0 active:translate-y-0.5 rounded-xl flex items-center justify-center gap-2 md:gap-3 uppercase tracking-tighter text-[9px] md:text-[10px] touch-target press-effect"
                    >
                        <span>Summon x10</span>
                        <span className="bg-white/20 px-2.5 py-1 rounded-full font-mono flex items-center gap-1">{SUMMON_COST * 10} <AuraIcon className="w-3.5 h-3.5 text-white" /></span>
                    </button>
                </div>
            </div>

            <div className="mt-4 glass px-4 md:px-8 py-2 md:py-3 rounded-xl border-2 border-secondary/30 shadow-card animate-fadeIn flex items-center gap-2 md:gap-3 hover-lift">
                <AuraIcon className="w-4 h-4 md:w-5 md:h-5 text-primary animate-gentleBounce" />
                <p className="text-[10px] md:text-xs tracking-widest uppercase font-bold text-primary flex items-center gap-1">Your Aura: <span className="text-highlight font-black ml-1 flex items-center gap-1">{auraPoints.toLocaleString()} <AuraIcon className="w-3.5 h-3.5 text-highlight" /></span></p>
            </div>
        </div>
    );
};

export default SummonView;
