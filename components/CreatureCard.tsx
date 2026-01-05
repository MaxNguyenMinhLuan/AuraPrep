
import React from 'react';
import { CreatureInstance, Creature, Rarity, XP_PER_LEVEL, MAX_LEVEL } from '../types';
import { INITIAL_CREATURES } from '../constants';

interface PixelCreatureProps {
    creature: Creature;
    evolutionStage: 1 | 2 | 3;
    pixelSize?: number;
}

export const PixelCreature: React.FC<PixelCreatureProps> = ({ creature, evolutionStage, pixelSize = 8 }) => {
    // Priority 1: Evolution-based sprite URLs (animated GIFs for each stage)
    if (creature.spriteUrls) {
        // Clamp evolution stage to maxEvolutionStage (for Pokemon without evolutions)
        const effectiveStage = Math.min(evolutionStage, creature.maxEvolutionStage);
        const spriteUrl = creature.spriteUrls[effectiveStage - 1];
        const stageName = creature.names[effectiveStage - 1] || creature.name;
        const baseSize = pixelSize * 12; // Larger multiplier for animated sprites
        return (
            <img
                src={spriteUrl}
                alt={stageName}
                className="object-contain drop-shadow-lg"
                style={{
                    width: baseSize,
                    height: baseSize,
                    imageRendering: 'auto' // Better rendering for animated GIFs
                }}
                loading="lazy"
            />
        );
    }

    // Priority 2: Pixel string grid (legacy)
    const sprite = creature.pixelSprite[evolutionStage - 1];
    const colors = creature.pixelColors;
    if (!sprite) return null;

    const width = sprite[0].length * pixelSize;
    const height = sprite.length * pixelSize;

    return (
        <div className="relative inline-block" style={{ width, height, imageRendering: 'pixelated' }}>
            {sprite.map((row, rIndex) => (
                <div key={rIndex} className="flex">
                    {row.split('').map((char, cIndex) => (
                        <div
                            key={cIndex}
                            style={{
                                width: pixelSize,
                                height: pixelSize,
                                backgroundColor: colors[char] || 'transparent',
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};


interface CreatureCardProps {
    instance: CreatureInstance;
    isLarge?: boolean;
    showDetails?: boolean;
}

const getRarityClasses = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.Common: return { bg: 'bg-common/20', text: 'text-common', border: 'border-common/50' };
        case Rarity.Rare: return { bg: 'bg-rare/20', text: 'text-rare', border: 'border-rare/50' };
        case Rarity.Legendary: return { bg: 'bg-legendary/20', text: 'text-legendary', border: 'border-legendary/50' };
        default: return { bg: 'bg-background', text: 'text-text-main', border: 'border-text-dim' };
    }
};

const CreatureCard: React.FC<CreatureCardProps> = ({ instance, isLarge = false, showDetails = false }) => {
    const isCustom = instance.creatureId === 0 && !!instance.customImageUrl;
    const creatureData = INITIAL_CREATURES.find(c => c.id === instance.creatureId);
    
    // Handle max evolution stage (clamp evolution stage to what's available)
    const maxEvoStage = creatureData?.maxEvolutionStage || 3;
    const effectiveStage = Math.min(instance.evolutionStage, maxEvoStage) as 1 | 2 | 3;

    // Fallback/Custom logic - use stage-specific name if available
    const displayName = isCustom
        ? instance.customName
        : (creatureData?.names
            ? (creatureData.names[effectiveStage - 1] || creatureData.name)
            : (creatureData?.name || 'Unknown'));
    const displayRarity = isCustom ? (instance.customRarity || Rarity.Common) : (creatureData?.rarity || Rarity.Common);
    const rarityClasses = getRarityClasses(displayRarity);

    // Level-based progress
    const currentLevel = instance.level;
    const isMaxLevel = currentLevel >= MAX_LEVEL;
    const xpForCurrentLevel = currentLevel * XP_PER_LEVEL;
    const xpForNextLevel = (currentLevel + 1) * XP_PER_LEVEL;
    const xpIntoCurrentLevel = instance.xp - xpForCurrentLevel;
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
    const levelProgress = isMaxLevel ? 100 : Math.min(100, (xpIntoCurrentLevel / xpNeededForNext) * 100);

    const renderSprite = (size: number) => {
        if (isCustom) {
            return (
                <img 
                    src={instance.customImageUrl} 
                    alt={displayName} 
                    className="object-contain"
                    style={{ 
                        width: size * 8, 
                        height: size * 8, 
                        imageRendering: 'pixelated' 
                    }} 
                />
            );
        }
        if (creatureData) {
            return <PixelCreature creature={creatureData} evolutionStage={effectiveStage} pixelSize={size} />;
        }
        return <div className="text-4xl">?</div>;
    };
    
    if (isLarge) {
        return (
            <div className={`p-4 w-64 text-center ${rarityClasses.bg} border-2 ${rarityClasses.border} rounded-lg shadow-inner`}>
                <div className="flex justify-center mb-4 min-h-[120px] items-center">
                    {renderSprite(10)}
                </div>
                <h3 className="text-xl font-bold">{displayName}</h3>
                <p className={`font-semibold ${rarityClasses.text}`}>{displayRarity}</p>
                <div className="mt-4">
                    <p className="text-xs text-text-main">Lv. {currentLevel || 5} {isMaxLevel ? '(MAX)' : ''}</p>
                     <div className="w-full bg-background/50 h-2 mt-1 border border-text-dark rounded-full overflow-hidden">
                        <div className="bg-success h-full transition-all duration-500" style={{ width: `${levelProgress}%` }}></div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (showDetails) {
        return (
            <div className={`p-2 ${rarityClasses.bg} border-2 ${rarityClasses.border} h-full flex flex-col justify-between text-center rounded-md`}>
                <div>
                  <div className="flex justify-center items-center mb-1 h-20">
                      {renderSprite(4)}
                  </div>
                  <h3 className="text-sm font-bold truncate px-1">{displayName}</h3>
                  <p className={`text-[10px] font-semibold ${rarityClasses.text}`}>{displayRarity}</p>
                </div>
                <div className="mt-2">
                    <p className="text-[10px] text-text-dim leading-none">Lv. {currentLevel || 5}</p>
                    <div className="w-full bg-background/50 h-1 mt-1 border border-text-dark rounded-full overflow-hidden">
                        <div className="bg-success h-full" style={{ width: `${levelProgress}%` }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-12 h-12 flex items-center justify-center">
             {renderSprite(3)}
        </div>
    );
};

export default CreatureCard;
