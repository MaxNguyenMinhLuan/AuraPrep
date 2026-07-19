// Dev-only harness: mounts SummonView with mock props so the Comet Rite
// animation can be tested without auth. Served at /summon-test.html.
// ?rig=ultra  → every pull is Ultra Rare (purple big-pull beat)
// ?rig=shiny  → every pull is a shiny Common (gold big-pull beat)
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import SummonView from '../components/SummonView';
import { CreatureInstance } from '../types';

const rig = new URLSearchParams(window.location.search).get('rig');
if (rig === 'ultra') {
    // rand*100 = 99.9 → Ultra Rare bucket; shiny check 0.999 < 1/500 fails
    Math.random = () => 0.999;
} else if (rig === 'shiny') {
    // rand*100 = 0.01 → Common bucket; shiny check 0.0001 < 1/500 passes
    Math.random = () => 0.0001;
}

// Seed 6 owned creatures when rigging so the "first summons are unique"
// dedup branch (which can fall back to off-rarity picks) is bypassed.
const seedCreatures: CreatureInstance[] = rig
    ? Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1, creatureId: i + 1, xp: 0, level: 5, evolutionStage: 1 as const,
    }))
    : [];

const Harness: React.FC = () => {
    const [aura, setAura] = useState(1_000_000);
    const [creatures, setCreatures] = useState<CreatureInstance[]>(seedCreatures);

    const addCreature = (creatureId: number, custom?: Partial<CreatureInstance>) => {
        setCreatures(prev => [...prev, {
            id: prev.length + 1,
            creatureId,
            xp: 0,
            level: 5,
            evolutionStage: 1,
            ...custom,
        }]);
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <SummonView
                auraPoints={aura}
                setAuraPoints={setAura}
                userCreatures={creatures}
                addCreature={addCreature}
            />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
