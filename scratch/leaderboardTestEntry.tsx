// Dev-only harness: mounts LeaderboardView with mock props so tab
// switching, podium rendering, the Add Friend modal, and the PvP fan
// menu can be tested without auth. Served at /leaderboard-test.html.
//
// LeaderboardView fetches Firestore data internally (getLeagueCompetitors /
// getFriendsList) via services/friendsService.ts — both fail soft (catch ->
// return []) so in this harness (no real Firebase session) the League tab
// falls back entirely to the mock `competitors` prop, and the Friends tab
// renders its "No friends yet" empty state. That's expected, not a bug.
import React from 'react';
import ReactDOM from 'react-dom/client';
import LeaderboardView from '../components/LeaderboardView';
import { LeagueType, User } from '../types';

const mockUser: User = {
    uid: 'test-uid-self',
    name: 'Test Scholar',
    email: 'test@example.com',
};

// 15 mock competitors with the exact shape LeaderboardView reads from
// `competitors` (username/weeklyGain/guardianId) — see leagueEntries useMemo
// in components/LeaderboardView.tsx.
const mockCompetitors = [
    { username: 'Aria Blackwood', weeklyGain: 4820, guardianId: 3 },
    { username: 'Marcus Chen', weeklyGain: 4390, guardianId: 1 },
    { username: 'Priya Sharma', weeklyGain: 4105, guardianId: 5 },
    { username: 'Diego Ramirez', weeklyGain: 3870, guardianId: 2 },
    { username: 'Fatima Al-Sayed', weeklyGain: 3640, guardianId: 4 },
    { username: 'Noah Kim', weeklyGain: 3320, guardianId: 1 },
    { username: 'Elena Petrova', weeklyGain: 3105, guardianId: 6 },
    { username: 'Jamal Washington', weeklyGain: 2890, guardianId: 3 },
    { username: 'Sofia Rossi', weeklyGain: 2650, guardianId: 2 },
    { username: 'Liam O\'Connor', weeklyGain: 2410, guardianId: 5 },
    { username: 'Yuki Tanaka', weeklyGain: 2180, guardianId: 1 },
    { username: 'Amara Okafor', weeklyGain: 1950, guardianId: 4 },
    { username: 'Lucas Silva', weeklyGain: 1720, guardianId: 6 },
    { username: 'Zara Ahmed', weeklyGain: 1490, guardianId: 2 },
    { username: 'Ethan Brooks', weeklyGain: 1260, guardianId: 3 },
];

const Harness: React.FC = () => {
    return (
        <div className="min-h-screen bg-background p-4">
            <LeaderboardView
                user={mockUser}
                username="Test Scholar (You)"
                weeklyGain={3005}
                league={LeagueType.GOLD}
                competitors={mockCompetitors}
                activeGuardianId={1}
                activeGuardianEvolutionStage={2}
                pendingFriendRequestCount={3}
                onFriendRequestsChanged={() => {}}
            />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
