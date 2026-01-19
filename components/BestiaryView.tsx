import React, { useState } from 'react';
import { CreatureInstance, Rarity, CreatureType, XP_PER_LEVEL, MAX_LEVEL } from '../types';
import { INITIAL_CREATURES } from '../constants';
import CreatureCard, { PixelCreature } from './CreatureCard';

interface BestiaryViewProps {
    userCreatures: CreatureInstance[];
    onToggleFavorite: (instanceId: number) => void;
}

const getRarityClasses = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.Common: return { bg: 'bg-common/20', text: 'text-common', border: 'border-common/50' };
        case Rarity.Rare: return { bg: 'bg-rare/20', text: 'text-rare', border: 'border-rare/50' };
        case Rarity.Legendary: return { bg: 'bg-legendary/20', text: 'text-legendary', border: 'border-legendary/50' };
        default: return { bg: 'bg-background', text: 'text-text-main', border: 'border-text-dim' };
    }
};

const getTypeColor = (type: CreatureType): string => {
    switch (type) {
        case CreatureType.Leaf: return 'bg-green-100 text-green-700 border-green-400';
        case CreatureType.Fire: return 'bg-orange-100 text-orange-700 border-orange-400';
        case CreatureType.Water: return 'bg-blue-100 text-blue-700 border-blue-400';
        case CreatureType.Electric: return 'bg-yellow-100 text-yellow-700 border-yellow-400';
        case CreatureType.Wind: return 'bg-cyan-100 text-cyan-700 border-cyan-400';
        case CreatureType.Metal: return 'bg-gray-100 text-gray-700 border-gray-400';
        case CreatureType.Light: return 'bg-amber-100 text-amber-700 border-amber-400';
        case CreatureType.Dark: return 'bg-purple-100 text-purple-700 border-purple-400';
        default: return 'bg-secondary/20 text-text-main border-secondary/50';
    }
};

const BestiaryView: React.FC<BestiaryViewProps> = ({ userCreatures, onToggleFavorite }) => {
    const [selectedInstance, setSelectedInstance] = useState<CreatureInstance | null>(null);

    // Keep selectedInstance in sync with userCreatures changes (for favorite toggle)
    const currentInstance = selectedInstance
        ? userCreatures.find(c => c.id === selectedInstance.id) || selectedInstance
        : null;

    const ownedCreatureIds = new Set(userCreatures.map(c => c.creatureId));
    const completionPercentage = (ownedCreatureIds.size / INITIAL_CREATURES.length) * 100;

    // --- Detail View ---
    if (currentInstance) {
        const creatureData = INITIAL_CREATURES.find(c => c.id === currentInstance.creatureId);
        if (!creatureData) return null;

        const rarityClasses = getRarityClasses(creatureData.rarity);
        const maxEvoStage = creatureData.maxEvolutionStage;
        const currentLevel = currentInstance.level || 5;
        const isMaxLevel = currentLevel >= MAX_LEVEL;

        // Calculate XP progress to next level
        const xpForCurrentLevel = currentLevel * XP_PER_LEVEL;
        const xpForNextLevel = (currentLevel + 1) * XP_PER_LEVEL;
        const xpIntoCurrentLevel = currentInstance.xp - xpForCurrentLevel;
        const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
        const levelProgress = isMaxLevel ? 100 : (xpIntoCurrentLevel / xpNeededForNext) * 100;

        // Get next evolution level info
        let nextEvoLevel: number | null = null;
        if (currentInstance.evolutionStage === 1 && maxEvoStage >= 2 && creatureData.evolveLevel1) {
            nextEvoLevel = creatureData.evolveLevel1;
        } else if (currentInstance.evolutionStage === 2 && maxEvoStage >= 3 && creatureData.evolveLevel2) {
            nextEvoLevel = creatureData.evolveLevel2;
        }

        return (
            <div className="animate-scaleIn bg-surface max-w-2xl mx-auto rounded-xl shadow-card p-3 md:p-4 lg:p-6">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                    <button onClick={() => setSelectedInstance(null)} className="text-text-dim hover:text-highlight active:text-highlight flex items-center gap-2 p-2 -ml-2 touch-target press-effect transition-premium">
                        <span>&larr;</span> <span className="text-xs md:text-sm">Back to Bestiary</span>
                    </button>
                    <button
                        onClick={() => onToggleFavorite(currentInstance.id)}
                        className={`p-2 md:p-3 rounded-full transition-all duration-200 touch-target ${
                            currentInstance.isFavorite
                                ? 'text-red-500 bg-red-50 hover:bg-red-100 active:bg-red-100'
                                : 'text-text-dim hover:text-red-400 hover:bg-red-50 active:text-red-400 active:bg-red-50'
                        }`}
                        title={currentInstance.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <svg
                            className="w-5 h-5 md:w-6 md:h-6"
                            fill={currentInstance.isFavorite ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </button>
                </div>

                <div className="text-center">
                    <h1 className={`font-serif text-4xl ${rarityClasses.text}`}>
                        {creatureData.names[currentInstance.evolutionStage - 1] || creatureData.name}
                    </h1>
                    <div className="flex justify-center items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded border ${rarityClasses.bg} ${rarityClasses.text} ${rarityClasses.border}`}>
                            {creatureData.rarity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border font-semibold ${getTypeColor(creatureData.type)}`}>
                            {creatureData.type}
                        </span>
                    </div>
                    {currentInstance.isFavorite && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                            <span>Favorite</span>
                        </span>
                    )}
                </div>

                {/* Evolution chain - only show stages that exist */}
                <div className="my-6 flex justify-around items-center bg-background/50 p-4 border-2 border-secondary/30 rounded-xl shadow-inner-soft">
                    <div className={`text-center ${currentInstance.evolutionStage >= 1 ? '' : 'opacity-50'}`}>
                        <PixelCreature creature={creatureData} evolutionStage={1} pixelSize={6} />
                        <p className="text-xs mt-2 font-bold text-text-dim">{creatureData.names[0]}</p>
                        <p className="text-[10px] text-text-dim">Lv. 5+</p>
                    </div>
                    {maxEvoStage >= 2 && (
                        <div className={`text-center ${currentInstance.evolutionStage >= 2 ? '' : 'opacity-50'}`}>
                            <PixelCreature creature={creatureData} evolutionStage={2} pixelSize={6} />
                            <p className="text-xs mt-2 font-bold text-text-dim">{creatureData.names[1]}</p>
                            <p className="text-[10px] text-text-dim">Lv. {creatureData.evolveLevel1}+</p>
                        </div>
                    )}
                    {maxEvoStage >= 3 && (
                        <div className={`text-center ${currentInstance.evolutionStage >= 3 ? '' : 'opacity-50'}`}>
                            <PixelCreature creature={creatureData} evolutionStage={3} pixelSize={6} />
                            <p className="text-xs mt-2 font-bold text-text-dim">{creatureData.names[2]}</p>
                            <p className="text-[10px] text-text-dim">Lv. {creatureData.evolveLevel2}+</p>
                        </div>
                    )}
                </div>

                <div className="bg-background/50 p-4 border-2 border-secondary/30 rounded-xl mb-4 shadow-inner-soft">
                     <h3 className="font-bold text-lg text-primary mb-2">Lore</h3>
                     <p className="text-text-main text-sm italic leading-relaxed">{creatureData.description}</p>
                </div>

                <div className="bg-white p-4 border-2 border-secondary/30 rounded-xl shadow-card">
                     <h3 className="font-bold text-lg text-primary mb-2">Your Guardian's Stats</h3>
                     <p className="text-sm mb-1">Level: <span className="font-bold text-lg">{currentLevel}</span> / {MAX_LEVEL}</p>
                     <p className="text-sm mb-1">Stage: <span className="font-bold">{currentInstance.evolutionStage}</span> / {maxEvoStage}</p>
                     <p className="text-sm">Total XP: <span className="font-bold">{currentInstance.xp}</span></p>
                      <div className="mt-3">
                        <p className="text-xs text-text-main mb-1">
                            {isMaxLevel ? 'Max Level Reached!' : `Progress to Level ${currentLevel + 1}:`}
                        </p>
                         <div className="w-full bg-surface h-4 border border-secondary/30 rounded-full overflow-hidden shadow-inner-soft">
                            <div className="bg-gradient-to-r from-success to-emerald-400 h-full flex items-center justify-center text-[10px] text-text-light rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }}>
                                {levelProgress.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                    {nextEvoLevel && currentLevel < nextEvoLevel && (
                        <p className="text-xs text-highlight mt-2">
                            Evolves at Level {nextEvoLevel} ({nextEvoLevel - currentLevel} levels to go!)
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // --- Gallery View ---
    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-4 md:mb-6">
                <h1 className="font-sans text-lg md:text-xl lg:text-2xl bg-highlight text-text-light px-3 md:px-4 py-2 inline-block rounded-lg shadow-card animate-slideDown">Bestiary</h1>
                <p className="text-text-dim mt-2 text-xs md:text-sm">Your collection of guardians.</p>
            </div>

            <div className="mb-6 md:mb-8 max-w-lg mx-auto px-2">
                <div className="flex justify-between text-[10px] md:text-xs mb-1 font-bold text-text-dim">
                     <span>Collection Progress</span>
                     <span>{completionPercentage.toFixed(0)}%</span>
                </div>
                 <div className="w-full bg-surface h-3 md:h-4 border-2 border-primary/30 rounded-full overflow-hidden shadow-inner-soft">
                    <div className="bg-gradient-to-r from-primary to-highlight h-full transition-all duration-1000 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <p className="text-center text-[10px] md:text-xs mt-1 text-text-dim">{ownedCreatureIds.size} / {INITIAL_CREATURES.length} Discovered</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                {INITIAL_CREATURES.map((creature, index) => {
                    const instance = userCreatures.find(c => c.creatureId === creature.id);
                    if (instance) {
                        return (
                            <button
                                key={creature.id}
                                onClick={() => setSelectedInstance(instance)}
                                className="w-full h-full hover:scale-105 active:scale-105 transition-premium group relative touch-target press-effect animate-fadeInScale"
                                style={{ animationDelay: `${index * 0.03}s` }}
                            >
                                {instance.isFavorite && (
                                    <div className="absolute top-1 right-1 z-10 text-red-500 animate-popIn">
                                        <svg className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="h-full rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-premium">
                                    <CreatureCard instance={instance} showDetails={true} />
                                </div>
                            </button>
                        );
                    } else {
                        return (
                            <div
                                key={creature.id}
                                className="bg-background/50 p-3 md:p-4 text-center flex flex-col items-center justify-center opacity-40 border-2 border-text-dark border-dashed rounded-xl h-28 md:h-32 lg:h-40 animate-subtlePulse"
                                style={{ animationDelay: `${index * 0.03}s` }}
                            >
                                <p className="font-sans text-2xl md:text-3xl text-text-dark mb-2">?</p>
                                <p className="text-text-dark font-semibold text-[10px] md:text-xs">Unknown</p>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default BestiaryView;