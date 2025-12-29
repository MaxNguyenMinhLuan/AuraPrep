import React, { useState } from 'react';
import { CreatureInstance, Rarity } from '../types';
import { INITIAL_CREATURES } from '../constants';
import CreatureCard, { PixelCreature } from './CreatureCard';

interface BestiaryViewProps {
    userCreatures: CreatureInstance[];
}

const getRarityClasses = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.Common: return { bg: 'bg-common/20', text: 'text-common', border: 'border-common/50' };
        case Rarity.Rare: return { bg: 'bg-rare/20', text: 'text-rare', border: 'border-rare/50' };
        case Rarity.Legendary: return { bg: 'bg-legendary/20', text: 'text-legendary', border: 'border-legendary/50' };
        default: return { bg: 'bg-background', text: 'text-text-main', border: 'border-text-dim' };
    }
};

const BestiaryView: React.FC<BestiaryViewProps> = ({ userCreatures }) => {
    const [selectedInstance, setSelectedInstance] = useState<CreatureInstance | null>(null);

    const ownedCreatureIds = new Set(userCreatures.map(c => c.creatureId));
    const completionPercentage = (ownedCreatureIds.size / INITIAL_CREATURES.length) * 100;

    // --- Detail View ---
    if (selectedInstance) {
        const creatureData = INITIAL_CREATURES.find(c => c.id === selectedInstance.creatureId);
        if (!creatureData) return null;

        const rarityClasses = getRarityClasses(creatureData.rarity);

        let xpForNextLevel = 0;
        let currentLevelMaxXp = 0;
        
        if (selectedInstance.evolutionStage === 1) {
            xpForNextLevel = selectedInstance.xp;
            currentLevelMaxXp = creatureData.evoThreshold1;
        } else if (selectedInstance.evolutionStage === 2) {
            xpForNextLevel = selectedInstance.xp - creatureData.evoThreshold1;
            currentLevelMaxXp = creatureData.evoThreshold2 - creatureData.evoThreshold1;
        } else {
            xpForNextLevel = 1; // Maxed out
            currentLevelMaxXp = 1;
        }
        
        const xpPercentage = currentLevelMaxXp > 0 ? (xpForNextLevel / currentLevelMaxXp) * 100 : 100;

        let xpDisplay: React.ReactNode;
        if (selectedInstance.evolutionStage === 1) {
            xpDisplay = <span>{selectedInstance.xp} / {creatureData.evoThreshold1}</span>;
        } else if (selectedInstance.evolutionStage === 2) {
            xpDisplay = <span>{selectedInstance.xp} / {creatureData.evoThreshold2}</span>;
        } else {
            xpDisplay = <span>{selectedInstance.xp} (Max Level)</span>;
        }

        return (
            <div className="animate-fadeIn bg-surface max-w-2xl mx-auto rounded-lg shadow-md lg:p-6 p-4">
                <button onClick={() => setSelectedInstance(null)} className="text-text-dim hover:text-highlight mb-4 flex items-center gap-2">
                    <span>&larr;</span> Back to Bestiary
                </button>
                
                <div className="text-center">
                    <h1 className={`font-serif text-4xl ${rarityClasses.text}`}>{creatureData.name}</h1>
                    <p className="text-text-dim text-sm">{creatureData.rarity} - {creatureData.type}</p>
                </div>

                <div className="my-6 flex justify-around items-center bg-background/50 p-4 border-2 border-secondary rounded-lg">
                     <div className="text-center">
                        <PixelCreature creature={creatureData} evolutionStage={1} pixelSize={6} />
                        <p className="text-xs mt-2 font-bold text-text-dim">Stage 1</p>
                    </div>
                     <div className="text-center opacity-75">
                        <PixelCreature creature={creatureData} evolutionStage={2} pixelSize={6} />
                        <p className="text-xs mt-2 font-bold text-text-dim">Stage 2</p>
                    </div>
                     <div className="text-center opacity-50">
                        <PixelCreature creature={creatureData} evolutionStage={3} pixelSize={6} />
                        <p className="text-xs mt-2 font-bold text-text-dim">Stage 3</p>
                    </div>
                </div>

                <div className="bg-background/50 p-4 border-2 border-text-dark rounded-lg mb-4">
                     <h3 className="font-bold text-lg text-primary mb-2">Lore</h3>
                     <p className="text-text-main text-sm italic leading-relaxed">{creatureData.description}</p>
                </div>
                
                <div className="bg-white p-4 border-2 border-text-dark rounded-lg shadow-sm">
                     <h3 className="font-bold text-lg text-primary mb-2">Your Guardian's Stats</h3>
                     <p className="text-sm mb-1">Current Stage: <span className="font-bold">{selectedInstance.evolutionStage}</span></p>
                     <p className="text-sm">XP: <span className="font-bold">{xpDisplay}</span></p>
                      <div className="mt-2">
                        <p className="text-xs text-text-main mb-1">Progress to next stage:</p>
                         <div className="w-full bg-surface h-4 border border-text-dim rounded-full overflow-hidden">
                            <div className="bg-success h-full flex items-center justify-center text-[10px] text-text-light" style={{ width: `${xpPercentage}%` }}>
                                {xpPercentage.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Gallery View ---
    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-6">
                <h1 className="font-sans text-xl lg:text-2xl bg-highlight text-text-light px-4 py-2 inline-block rounded shadow-sm">Bestiary</h1>
                <p className="text-text-dim mt-2 text-sm">Your collection of guardians.</p>
            </div>
            
            <div className="mb-8 max-w-lg mx-auto">
                <div className="flex justify-between text-xs mb-1 font-bold text-text-dim">
                     <span>Collection Progress</span>
                     <span>{completionPercentage.toFixed(0)}%</span>
                </div>
                 <div className="w-full bg-surface h-4 border-2 border-primary/50 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-highlight h-full transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <p className="text-center text-xs mt-1 text-text-dim">{ownedCreatureIds.size} / {INITIAL_CREATURES.length} Discovered</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {INITIAL_CREATURES.map(creature => {
                    const instance = userCreatures.find(c => c.creatureId === creature.id);
                    if (instance) {
                        return (
                            <button 
                                key={creature.id} 
                                onClick={() => setSelectedInstance(instance)}
                                className="w-full h-full hover:scale-105 transition-transform duration-200 group"
                            >
                                <div className="h-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <CreatureCard instance={instance} showDetails={true} />
                                </div>
                            </button>
                        );
                    } else {
                        return (
                            <div key={creature.id} className="bg-background/50 p-4 text-center flex flex-col items-center justify-center opacity-40 border-2 border-text-dark border-dashed rounded-lg h-32 lg:h-40">
                                <p className="font-sans text-3xl text-text-dark mb-2">?</p>
                                <p className="text-text-dark font-semibold text-xs">Unknown</p>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default BestiaryView;