// Dev-only harness: mounts Dashboard with mock props so all interactive
// elements (creature switcher, mission cards, Training/Shop buttons, profile
// avatar) can be exercised without auth. Served at /dashboard-test.html.
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from '../components/Dashboard';
import { CreatureInstance, MissionInstance, User } from '../types';

const mockUser: User = {
    uid: 'test-uid',
    name: 'Test User',
    email: 'test@example.com',
};

// 8 entries (cycling through the 3 available creatureIds) so the
// max-h-32/max-h-64 overflow-y-auto collection panel actually has to scroll
// on every viewport, exercising the real overflow behavior instead of a
// no-op panel that always fits.
const initialCreatures: CreatureInstance[] = [
    { id: 1, creatureId: 1, xp: 400, level: 12, evolutionStage: 1, isFavorite: true },
    { id: 2, creatureId: 2, xp: 1200, level: 20, evolutionStage: 2, isFavorite: false },
    { id: 3, creatureId: 3, xp: 50, level: 5, evolutionStage: 1, isFavorite: false },
    { id: 4, creatureId: 1, xp: 900, level: 18, evolutionStage: 1, isFavorite: false },
    { id: 5, creatureId: 2, xp: 2200, level: 30, evolutionStage: 2, isFavorite: false },
    { id: 6, creatureId: 3, xp: 100, level: 6, evolutionStage: 1, isFavorite: false },
    { id: 7, creatureId: 1, xp: 3000, level: 40, evolutionStage: 2, isFavorite: false },
    { id: 8, creatureId: 2, xp: 20, level: 5, evolutionStage: 1, isFavorite: false },
];

const initialMissions: MissionInstance[] = [
    {
        id: 'mission-1',
        title: 'Algebra Warmup',
        description: 'Answer 5 Algebra questions correctly',
        subtopic: 'Algebra',
        questionCount: 5,
        reward: 50,
        xp: 20,
        difficulty: 'Easy',
        completed: false,
        progress: 2,
        correctAnswers: 2,
    },
    {
        id: 'mission-2',
        title: 'Reading Sprint',
        description: 'Answer 8 Reading Comprehension questions correctly',
        subtopic: 'Reading Comprehension',
        questionCount: 8,
        reward: 80,
        xp: 35,
        difficulty: 'Medium',
        completed: false,
        progress: 0,
        correctAnswers: 0,
    },
    {
        id: 'mission-3',
        title: 'Grammar Gauntlet',
        description: 'Answer 6 Grammar questions correctly to finish strong',
        subtopic: 'Grammar',
        questionCount: 6,
        reward: 60,
        xp: 25,
        difficulty: 'Hard',
        completed: true,
        progress: 6,
        correctAnswers: 6,
    },
];

const Harness: React.FC = () => {
    const [user, setUser] = useState<User>(mockUser);
    const [auraPoints, setAuraPoints] = useState(1500);
    const [dailyStreak] = useState(5);
    const [creatures] = useState<CreatureInstance[]>(initialCreatures);
    const [activeCreatureId, setActiveCreatureId] = useState<number | null>(1);
    const [dailyMissions, setDailyMissions] = useState<MissionInstance[]>(initialMissions);
    const [preparingMissionId, setPreparingMissionId] = useState<string | null>(null);
    const [reviewQueueCount] = useState(3);
    const [log, setLog] = useState<string[]>([]);

    const pushLog = (msg: string) => {
        // eslint-disable-next-line no-console
        console.log('[dashboard-harness]', msg);
        setLog(l => [...l.slice(-20), msg]);
    };

    const startMission = (mission: MissionInstance) => {
        pushLog(`startMission: ${mission.id}`);
        setPreparingMissionId(mission.id);
        setTimeout(() => {
            setPreparingMissionId(null);
            setDailyMissions(ms => ms.map(m => m.id === mission.id ? { ...m, progress: Math.min(m.progress + 1, m.questionCount) } : m));
        }, 300);
    };

    return (
        <div className="min-h-screen bg-background p-4" data-testid="harness-root">
            <div id="dashboard-harness-log" style={{ display: 'none' }}>{log.join('|')}</div>
            <Dashboard
                user={user}
                auraPoints={auraPoints}
                dailyStreak={dailyStreak}
                creatures={creatures}
                activeCreatureId={activeCreatureId}
                setActiveCreatureId={(id) => { pushLog(`setActiveCreatureId: ${id}`); setActiveCreatureId(id); }}
                startMission={startMission}
                dailyMissions={dailyMissions}
                preparingMissionId={preparingMissionId}
                reviewQueueCount={reviewQueueCount}
                onOpenReview={() => pushLog('onOpenReview')}
                onOpenShop={() => pushLog('onOpenShop')}
                onUpdateUser={(updates) => { pushLog(`onUpdateUser: ${JSON.stringify(updates)}`); setUser(u => ({ ...u, ...updates })); }}
                onLogout={() => pushLog('onLogout')}
                onOpenProfile={() => pushLog('onOpenProfile')}
                tutorialState={undefined}
                onResumeBaseline={() => pushLog('onResumeBaseline')}
                onStartWelcomeMission={() => pushLog('onStartWelcomeMission')}
            />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
