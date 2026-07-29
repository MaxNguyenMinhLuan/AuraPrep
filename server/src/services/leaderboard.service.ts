import { getFirestore } from 'firebase-admin/firestore';

// Mirrors the query shape in services/friendsService.ts's getLeagueCompetitors
// (client-side), but reads directly from the server so the nudge sweep can
// compute a user's real league rank without a round trip through the client.
// Firebase Admin is already initialized in auth.middleware.ts before any
// request handling starts, so getFirestore() here is safe to call lazily.

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
