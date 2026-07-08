import React, { useState } from 'react';
import { CreatureInstance, Rarity, CreatureType, XP_PER_LEVEL, MAX_LEVEL } from '../types';
import { INITIAL_CREATURES } from '../constants';
import CreatureCard, { PixelCreature } from './CreatureCard';

interface BestiaryViewProps {
    userCreatures: CreatureInstance[];
    userTeam: number[];
    onToggleTeamMember: (instanceId: number) => void;
    onToggleFavorite: (instanceId: number) => void;
    onRenameCreature: (instanceId: number, newName: string) => void;
}

const getRarityClasses = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.Common: return { bg: 'bg-slate-100/50 dark:bg-slate-800/40', text: 'text-slate-500 dark:text-slate-400 font-bold', border: 'border-slate-300 dark:border-slate-700' };
        case Rarity.Uncommon: return { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400 font-bold', border: 'border-emerald-300 dark:border-emerald-900/60' };
        case Rarity.Rare: return { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400 font-bold', border: 'border-indigo-300 dark:border-indigo-900/60' };
        case Rarity.UltraRare: return { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400 font-bold', border: 'border-purple-300 dark:border-purple-900/60' };
        case Rarity.Legendary: return { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400 font-bold border-dashed animate-pulse', border: 'border-amber-400 dark:border-amber-900/60' };
        default: return { bg: 'bg-background dark:bg-slate-900', text: 'text-text-main dark:text-slate-100', border: 'border-text-dim dark:border-slate-700' };
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

const PixelPencilIcon = () => (
    <svg className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
    </svg>
);

const BestiaryView: React.FC<BestiaryViewProps> = ({ userCreatures, userTeam, onToggleTeamMember, onToggleFavorite, onRenameCreature }) => {
    const [selectedInstance, setSelectedInstance] = useState<CreatureInstance | null>(null);
    const [activeTab, setActiveTab] = useState<'team' | 'binder'>('team');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [isSelectingForTeam, setIsSelectingForTeam] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Keep selectedInstance in sync with userCreatures changes (for favorite toggle)
    const currentInstance = selectedInstance
        ? userCreatures.find(c => c.id === selectedInstance.id) || selectedInstance
        : null;

    const ownedCreatureIds = new Set(userCreatures.map(c => c.creatureId));
    const completionPercentage = (ownedCreatureIds.size / INITIAL_CREATURES.length) * 100;

    const filteredCreatures = userCreatures.filter(instance => {
        const creatureData = INITIAL_CREATURES.find(c => c.id === instance.creatureId);
        if (!creatureData) return false;
        const name = instance.customName || creatureData.names[instance.evolutionStage - 1] || creatureData.name;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleSaveName = () => {
        if (currentInstance) {
            onRenameCreature(currentInstance.id, tempName);
            setIsEditingName(false);
        }
    };

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
            <div className="animate-scaleIn bg-surface max-w-2xl mx-auto rounded-xl shadow-card p-3 md:p-4 lg:p-6 pt-12 lg:pt-6">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                    <button onClick={() => { setSelectedInstance(null); setIsEditingName(false); }} className="text-text-dim hover:text-highlight active:text-highlight flex items-center gap-2 p-2 -ml-2 touch-target press-effect transition-premium">
                        <span>&larr;</span> <span className="text-xs md:text-sm">Back to Collection</span>
                    </button>
                    <button
                        onClick={() => onToggleFavorite(currentInstance.id)}
                        className={`p-2 md:p-3 rounded-full transition-all duration-200 touch-target ${
                            currentInstance.isFavorite
                                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                : 'text-text-dim hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
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
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                    </button>
                </div>

                <div className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        {isEditingName ? (
                            <div className="flex flex-wrap gap-2 items-center justify-center max-w-full px-2">
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="font-sans text-lg md:text-xl border-2 border-primary/30 rounded px-2 py-1 focus:outline-none focus:border-primary text-text-main font-bold w-40 sm:w-auto min-w-0"
                                    maxLength={15}
                                    placeholder="Enter nickname..."
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') setIsEditingName(false);
                                    }}
                                />
                                <div className="flex gap-1.5 shrink-0">
                                    <button onClick={handleSaveName} className="bg-success text-white px-2.5 py-1 rounded text-xs font-bold press-effect">Save</button>
                                    <button onClick={() => setIsEditingName(false)} className="bg-slate-400 text-white px-2.5 py-1 rounded text-xs font-bold press-effect">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <h1 className={`font-serif text-3xl md:text-4xl ${rarityClasses.text}`}>
                                    {currentInstance.customName || creatureData.names[currentInstance.evolutionStage - 1] || creatureData.name}
                                </h1>
                                <button
                                    onClick={() => {
                                        setTempName(currentInstance.customName || creatureData.names[currentInstance.evolutionStage - 1] || creatureData.name);
                                        setIsEditingName(true);
                                    }}
                                    className="p-1 text-xs md:text-sm hover:scale-110 active:scale-95 transition-premium"
                                    title="Rename Auramon"
                                >
                                    <PixelPencilIcon />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded border ${rarityClasses.bg} ${rarityClasses.text} ${rarityClasses.border}`}>
                            {creatureData.rarity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border font-semibold ${getTypeColor(creatureData.type)}`}>
                            {creatureData.type}
                        </span>
                        {currentInstance.isShiny && (
                            <span className="text-xs px-2 py-1 rounded border font-bold bg-amber-400 text-white border-amber-500 shadow-glow animate-pulse">
                                ✨ SHINY ✨
                            </span>
                        )}
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
                        <PixelCreature creature={creatureData} evolutionStage={1} pixelSize={6} isShiny={currentInstance.isShiny} />
                        <p className="text-xs mt-2 font-bold text-text-dim">{creatureData.names[0]}</p>
                        <p className="text-[10px] text-text-dim">Lv. 5+</p>
                    </div>
                    {maxEvoStage >= 2 && (
                        <div className={`text-center ${currentInstance.evolutionStage >= 2 ? '' : 'opacity-50'}`}>
                            <PixelCreature creature={creatureData} evolutionStage={2} pixelSize={6} isShiny={currentInstance.isShiny} />
                            <p className="text-xs mt-2 font-bold text-text-dim">{creatureData.names[1]}</p>
                            <p className="text-[10px] text-text-dim">Lv. {creatureData.evolveLevel1}+</p>
                        </div>
                    )}
                    {maxEvoStage >= 3 && (
                        <div className={`text-center ${currentInstance.evolutionStage >= 3 ? '' : 'opacity-50'}`}>
                            <PixelCreature creature={creatureData} evolutionStage={3} pixelSize={6} isShiny={currentInstance.isShiny} />
                            <p className="text-xs mt-2 font-bold text-text-dim">{creatureData.names[2]}</p>
                            <p className="text-[10px] text-text-dim">Lv. {creatureData.evolveLevel2}+</p>
                        </div>
                    )}
                </div>

                <div className="bg-background/50 p-4 border-2 border-secondary/30 rounded-xl mb-4 shadow-inner-soft">
                     <h3 className="font-bold text-lg text-primary mb-2">Lore</h3>
                     <p className="text-text-main text-sm italic leading-relaxed">{creatureData.description}</p>
                </div>

                <div className="bg-surface p-4 border-2 border-secondary/30 rounded-xl shadow-card">
                     <h3 className="font-bold text-lg text-primary mb-2">Your Auramon's Stats</h3>
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

    return (
        <div className="animate-fadeIn max-w-6xl mx-auto px-4">
            <div className="text-center mb-6">
                <h1 className="font-sans text-lg md:text-xl lg:text-2xl bg-highlight text-text-light px-4 py-2 inline-block rounded-lg shadow-card animate-slideDown">Collection</h1>
                <p className="text-text-dim mt-2 text-xs md:text-sm">Manage your team and view discovered Auramons.</p>
            </div>

            {/* Sub-tabs selector */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 font-bold text-sm rounded-lg transition-premium border-2 ${
                        activeTab === 'team'
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-surface text-primary border-primary/20 hover:border-primary/50'
                    }`}
                >
                    Team Builder
                </button>
                <button
                    onClick={() => setActiveTab('binder')}
                    className={`px-4 py-2 font-bold text-sm rounded-lg transition-premium border-2 ${
                        activeTab === 'binder'
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-surface text-primary border-primary/20 hover:border-primary/50'
                    }`}
                >
                    Binder
                </button>
            </div>

            {activeTab === 'team' ? (
                <div className="space-y-8 animate-fadeIn">
                    {/* Active Team slots */}
                    <div className="bg-surface rounded-xl p-4 shadow-card border border-secondary/30">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Active Team ({userTeam.length} / 6)</h2>
                            {isSelectingForTeam && (
                                <span className="text-xs text-highlight font-bold animate-pulse">
                                    👉 Click an Auramon below to add to team
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {Array.from({ length: 6 }).map((_, idx) => {
                                const instanceId = userTeam[idx];
                                const instance = instanceId ? userCreatures.find(c => c.id === instanceId) : null;
                                const creatureData = instance ? INITIAL_CREATURES.find(c => c.id === instance.creatureId) : null;

                                if (instance && creatureData) {
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => onToggleTeamMember(instance.id)}
                                            className="relative flex flex-col items-center justify-center bg-surface border-2 border-primary/40 p-2 rounded-lg hover:border-red-400 group transition-premium shadow-sm active:scale-95 w-full h-[90px]"
                                        >
                                            <div className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-surface rounded-full p-0.5 shadow-sm">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                            <PixelCreature creature={creatureData} evolutionStage={instance.evolutionStage} pixelSize={2} isShiny={instance.isShiny} />
                                            <span className="text-[10px] font-bold text-text-main mt-1 line-clamp-1">
                                                {instance.customName || creatureData.names[instance.evolutionStage - 1] || creatureData.name}
                                            </span>
                                            <span className="text-[8px] bg-primary/10 text-primary px-1 rounded font-semibold mt-0.5">Lv.{instance.level}</span>
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setIsSelectingForTeam(!isSelectingForTeam)}
                                        className={`flex flex-col items-center justify-center bg-background border-2 border-dashed p-2 h-[90px] rounded-lg transition-premium press-effect ${
                                            isSelectingForTeam
                                                ? 'border-highlight text-highlight bg-highlight/5 animate-pulse'
                                                : 'border-text-dim/20 text-text-dim/40 hover:border-primary/40 hover:text-primary/60'
                                        }`}
                                    >
                                        <span className="text-xl font-light">+</span>
                                        <span className="text-[9px] uppercase font-bold tracking-wider">Empty</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Roster list */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                            <h2 className="text-sm font-bold text-primary">Your Auramons ({userCreatures.length})</h2>
                            <div className="relative w-full sm:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search Auramons..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-1.5 pl-8 bg-surface text-text-main border border-secondary/30 rounded-lg focus:outline-none focus:border-primary/50 text-[11px] font-bold shadow-sm transition-all font-sans placeholder-text-dim/50"
                                />
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim text-xs">🔍</span>
                            </div>
                        </div>
                        {userCreatures.length === 0 ? (
                            <div className="text-center py-8 bg-surface rounded-xl border border-secondary/30">
                                <p className="text-sm text-text-dim">You don't own any Auramons yet. Summon some in the Summon tab!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {[...filteredCreatures]
                                    .sort((a, b) => {
                                        if (a.isFavorite && !b.isFavorite) return -1;
                                        if (!a.isFavorite && b.isFavorite) return 1;
                                        return b.level - a.level;
                                    })
                                    .map((instance) => {
                                        const creatureData = INITIAL_CREATURES.find(c => c.id === instance.creatureId);
                                        if (!creatureData) return null;
                                        const isSelected = userTeam.includes(instance.id);

                                        return (
                                            <div key={instance.id} className="relative group">
                                                {/* Favorite Star button overlay */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleFavorite(instance.id);
                                                    }}
                                                    className={`absolute top-1.5 right-1.5 z-20 rounded-full p-1 transition-all duration-200 ${
                                                        instance.isFavorite
                                                            ? 'bg-yellow-400 hover:bg-yellow-500 text-white shadow-sm'
                                                            : 'bg-black/50 hover:bg-black/80 text-white'
                                                    }`}
                                                    title={instance.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill={instance.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        if (isSelectingForTeam) {
                                                            if (!isSelected && userTeam.length < 6) {
                                                                 onToggleTeamMember(instance.id);
                                                                 if (userTeam.length === 5) {
                                                                     setIsSelectingForTeam(false);
                                                                 }
                                                            } else if (isSelected) {
                                                                onToggleTeamMember(instance.id);
                                                            }
                                                        } else {
                                                            setSelectedInstance(instance);
                                                        }
                                                    }}
                                                    className={`w-full text-left rounded-xl overflow-hidden shadow-card border-2 transition-premium relative ${
                                                        isSelected ? 'border-primary shadow-md scale-[1.02]' : 'border-transparent hover:border-primary/40'
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-1.5 left-1.5 z-10 bg-primary text-white rounded-full p-0.5 shadow-sm">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <CreatureCard instance={instance} showDetails={true} />
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <div className="mb-6 max-w-lg mx-auto px-2">
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
                            const instances = userCreatures.filter(c => c.creatureId === creature.id);
                            const instance = instances[0];
                            if (instance) {
                                return (
                                    <button
                                        key={creature.id}
                                        onClick={() => setSelectedInstance(instance)}
                                        className="w-full h-full hover:scale-105 active:scale-105 transition-premium group relative touch-target press-effect animate-fadeInScale"
                                        style={{ animationDelay: `${index * 0.03}s` }}
                                    >
                                        {instance.isFavorite && (
                                            <div className="absolute top-1.5 right-1.5 z-10 text-red-500 animate-popIn">
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
                                        className="bg-background/50 p-3 md:p-4 text-center flex flex-col items-center justify-center opacity-40 border-2 border-text-dark border-dashed rounded-xl h-full min-h-[140px] animate-subtlePulse"
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
            )}
        </div>
    );
};

export default BestiaryView;