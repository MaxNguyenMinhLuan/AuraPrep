// Dev-only harness: mounts ProgressView with mock props so the Practice and
// Boss Fight report buttons can be tested without auth. Served at
// /progress-test.html. Boss Fight needs level=Hard/Master to get a bearable
// (9-9 HP) fight quickly closeable via wrong answers if needed, but default
// Easy works fine for just reaching the explanation panel.
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ProgressView from '../components/ProgressView';
import { UserProfile, LeagueType, SubtopicStat } from '../types';
import { SUBTOPICS } from '../constants';

const createInitialProfile = (): UserProfile => {
    const stats: { [subtopic: string]: SubtopicStat } = {};
    SUBTOPICS.forEach(s => { stats[s] = { correct: 0, incorrect: 0, level: 'Easy' }; });
    return {
        stats,
        inventory: { ELIMINATE: 5, SKIP: 5, HINT: 5, SECOND_CHANCE: 5, DOUBLE_JEOPARDY: 5 },
        dailyStreak: 0,
        lastStreakDate: '',
        weeklyAuraGain: 0,
        lastWeekResetDate: '',
        league: LeagueType.BRONZE,
    };
};

const Harness: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>(createInitialProfile);
    const [aura, setAura] = useState(1_000_000);

    const updateProfile = (subtopic: string, isCorrect: boolean) => {
        setProfile(p => ({
            ...p,
            stats: {
                ...p.stats,
                [subtopic]: {
                    ...p.stats[subtopic],
                    correct: p.stats[subtopic].correct + (isCorrect ? 1 : 0),
                    incorrect: p.stats[subtopic].incorrect + (isCorrect ? 0 : 1),
                },
            },
        }));
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <ProgressView
                userId="test-uid"
                userEmail="test@example.com"
                profile={profile}
                setAuraPoints={setAura}
                updateProfile={updateProfile}
                levelUpSubtopic={() => {}}
                consumePowerUp={() => {}}
                addToReviewQueue={() => {}}
                awardAura={(n) => setAura(a => a + n)}
                addXpToActiveCreature={() => {}}
                setIsBossFightActive={() => {}}
            />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
