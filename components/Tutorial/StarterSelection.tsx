import React, { useState } from 'react';
import { INITIAL_CREATURES } from '../../constants';
import { PixelCreature } from '../CreatureCard';
import { STARTER_IDS } from '../../utils/tutorialSteps';
import { CreatureType } from '../../types';

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

interface StarterSelectionProps {
    onSelect: (starterId: number) => void;
}

const StarterSelection: React.FC<StarterSelectionProps> = ({ onSelect }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [confirmed, setConfirmed] = useState(false);

    const starters = INITIAL_CREATURES.filter(c => STARTER_IDS.includes(c.id));

    const handleConfirm = () => {
        if (selectedId !== null) {
            setConfirmed(true);
            setTimeout(() => {
                onSelect(selectedId);
            }, 300);
        }
    };

    return (
        <div className={`fixed inset-0 z-[50] flex items-center justify-center p-4 ${confirmed ? 'animate-fadeOut' : 'animate-fadeIn'} pointer-events-none`}>
            <div className="bg-surface border-4 border-highlight rounded-xl shadow-2xl max-w-4xl w-full p-8 animate-reveal pointer-events-auto">
                <h2 className="text-3xl font-serif text-center text-highlight mb-2">Choose Your Starter!</h2>
                <p className="text-center text-text-dim mb-8">This Guardian will be your first partner on your SAT journey.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {starters.map(starter => {
                        const isSelected = selectedId === starter.id;
                        return (
                            <button
                                key={starter.id}
                                onClick={() => setSelectedId(starter.id)}
                                className={`p-6 rounded-xl border-4 transition-all duration-200 ${
                                    isSelected
                                        ? 'border-highlight bg-highlight/10 scale-105 shadow-xl'
                                        : 'border-secondary bg-background hover:border-highlight/50 hover:scale-102'
                                }`}
                            >
                                <div className="flex justify-center mb-4">
                                    <div className={`transform transition-transform ${isSelected ? 'scale-110' : ''}`}>
                                        <PixelCreature creature={starter} evolutionStage={1} pixelSize={8} />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-center mb-2">{starter.names[0]}</h3>
                                <div className="flex justify-center gap-2 mb-3">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        starter.rarity === 'Rare' ? 'bg-rare/20 text-rare border border-rare/50' : 'bg-common/20 text-common border border-common/50'
                                    }`}>
                                        {starter.rarity}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(starter.type)}`}>
                                        {starter.type}
                                    </span>
                                </div>
                                <p className="text-xs text-text-dim text-center leading-relaxed">{starter.description}</p>

                                {isSelected && (
                                    <div className="mt-4 text-center text-highlight text-sm font-bold animate-pulse">
                                        ✓ Selected
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleConfirm}
                        disabled={selectedId === null}
                        className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                            selectedId === null
                                ? 'bg-text-dark text-text-dim cursor-not-allowed'
                                : 'bg-highlight text-white hover:bg-highlight/90 border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 shadow-lg animate-pulse'
                        }`}
                    >
                        {selectedId === null ? 'Choose a Starter' : 'Confirm Selection'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StarterSelection;
