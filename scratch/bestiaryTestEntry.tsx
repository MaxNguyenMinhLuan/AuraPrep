// Dev-only harness: mounts BestiaryView with mock creature instances so the
// Team Builder / Binder tabs, detail view, rename modal, and evolve button
// can be tested without auth. Served at /bestiary-test.html.
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import BestiaryView from '../components/BestiaryView';
import { CreatureInstance } from '../types';

// XP_PER_LEVEL = 30, so xp for level L ~= L * 30 (put them mid-level so the
// progress bar renders a partial fill, not 0% or 100%, to catch overflow bugs).
const xpForLevel = (level: number) => level * 30 + 12;

const INITIAL_CREATURES_MOCK: CreatureInstance[] = [
    // id 1: Bulbasaur line, low level, stage 1, near evolution (evolveLevel1=16)
    { id: 101, creatureId: 1, xp: xpForLevel(15), level: 15, evolutionStage: 1, isFavorite: false },
    // id 2: Charmander line, mid level, stage 2, custom long nickname to stress-test text wrapping
    { id: 102, creatureId: 2, xp: xpForLevel(30), level: 30, evolutionStage: 2, isFavorite: true, customName: 'SirBlazington the Third' },
    // id 3: Squirtle line, max level, stage 3 (fully evolved, maxed)
    { id: 103, creatureId: 3, xp: xpForLevel(100), level: 100, evolutionStage: 3, isFavorite: false, isShiny: true },
    // id 4: Caterpie line, very low level, stage 1
    { id: 104, creatureId: 4, xp: xpForLevel(5), level: 5, evolutionStage: 1, isFavorite: false },
    // id 5: Weedle line, level past both evolutions but instance still stage 1 (to exercise "Evolve" button appearing)
    { id: 105, creatureId: 5, xp: xpForLevel(20), level: 20, evolutionStage: 1, isFavorite: false },
    // id 6: Pidgey line, stage 2, level between evolutions
    { id: 106, creatureId: 6, xp: xpForLevel(25), level: 25, evolutionStage: 2, isFavorite: true },
    // id 7: Nidoran-F line, stage 3, high level, favorite + shiny (stress rarity/shiny badges)
    { id: 107, creatureId: 7, xp: xpForLevel(80), level: 80, evolutionStage: 3, isFavorite: true, isShiny: true },
    // id 8: Nidoran-M line, stage 1, low level, long custom nickname at max length (15 chars)
    { id: 108, creatureId: 8, xp: xpForLevel(10), level: 10, evolutionStage: 1, isFavorite: false, customName: 'MegaLongName123' },
];

const Harness: React.FC = () => {
    const [userCreatures, setUserCreatures] = useState<CreatureInstance[]>(INITIAL_CREATURES_MOCK);
    // Team pre-populated with 3 instance ids to exercise "remove from team" flow too.
    const [userTeam, setUserTeam] = useState<number[]>([101, 103, 107]);

    const onToggleTeamMember = (instanceId: number) => {
        setUserTeam(prev =>
            prev.includes(instanceId) ? prev.filter(id => id !== instanceId) : [...prev, instanceId]
        );
    };

    const onToggleFavorite = (instanceId: number) => {
        setUserCreatures(prev =>
            prev.map(c => (c.id === instanceId ? { ...c, isFavorite: !c.isFavorite } : c))
        );
    };

    const onRenameCreature = (instanceId: number, newName: string) => {
        setUserCreatures(prev =>
            prev.map(c => (c.id === instanceId ? { ...c, customName: newName } : c))
        );
    };

    const onEvolveCreature = (instanceId: number) => {
        setUserCreatures(prev =>
            prev.map(c =>
                c.id === instanceId
                    ? { ...c, evolutionStage: Math.min(3, c.evolutionStage + 1) as 1 | 2 | 3 }
                    : c
            )
        );
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <BestiaryView
                userCreatures={userCreatures}
                userTeam={userTeam}
                onToggleTeamMember={onToggleTeamMember}
                onToggleFavorite={onToggleFavorite}
                onRenameCreature={onRenameCreature}
                onEvolveCreature={onEvolveCreature}
            />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
