import { getFirestore } from 'firebase-admin/firestore';

// Mirrors the query shape in services/friendsService.ts's getLeagueCompetitors
// (client-side), but reads directly from the server so the nudge sweep can
// compute a user's real league rank without a round trip through the client.
// Firebase Admin is initialized in auth.middleware.ts before any request
// handling starts.
//
// NOTE: without real service-account credentials (see auth.middleware.ts),
// google-auth-library's internal credential-lookup race throws from outside
// the promise chain this function's try/catch actually wraps, which crashed
// the whole process repeatedly on 2026-07-30 despite this try/catch being
// here the whole time. The try/catch below still catches everything it can;
// server/src/index.ts's process-level uncaughtException/unhandledRejection
// handlers are the real backstop for the cases it can't.

export interface LeagueRankResult {
    rank: number; // 1-indexed position within the league, sorted by weeklyGain desc
    poolSize: number;
}

/**
 * Look up a user's rank within their league by weekly aura gain. Fails soft
 * (returns null) on any Firestore error so a leaderboard hiccup never breaks
 * the rest of the nudge sweep — same fallback philosophy as the client-side
 * getLeagueCompetitors.
 */
export async function getUserLeagueRank(uid: string, league: string): Promise<LeagueRankResult | null> {
    if (!league) return null;

    try {
        const db = getFirestore();
        const snap = await db
            .collection('users')
            .where('league', '==', league)
            .orderBy('weeklyGain', 'desc')
            .get();

        if (snap.empty) return null;

        const rankIndex = snap.docs.findIndex(d => d.id === uid);
        if (rankIndex === -1) return null;

        return { rank: rankIndex + 1, poolSize: snap.size };
    } catch (error) {
        console.error(`[Leaderboard] Failed to compute league rank for ${uid} in ${league}:`, error);
        return null;
    }
}
