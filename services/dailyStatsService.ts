import { db, auth } from './firebase';
import { doc, setDoc, increment, arrayUnion } from 'firebase/firestore';

/**
 * Per-user, per-day activity counters, written directly by the client as
 * events happen and read twice a day by the `exportDailyStatsToSheet`
 * Cloud Function (functions/src/dailyStatsExport.ts) to populate the live
 * Google Sheet.
 *
 * Stored at users_game_data/{uid}/dailyStats/{date}, next to (but separate
 * from) the periodic full-state snapshot the app already syncs there.
 */

export type DailyEventType = 'login' | 'mission' | 'question' | 'summon' | 'bossFight';

const FIELD_BY_TYPE: Record<DailyEventType, string> = {
  login: 'logins',
  mission: 'missionsCompleted',
  question: 'questionsAnswered',
  summon: 'summons',
  bossFight: 'bossFights',
};

// Matches the 'today' key the rest of the app already uses for daily
// missions / streaks (App.tsx), so the day boundary lines up with what the
// user sees as "today" rather than a UTC boundary.
function todayKey(): string {
  return new Date().toLocaleDateString('en-CA');
}

/**
 * Increments today's counter for `type` by `count` (default 1). Silently
 * no-ops if there's no signed-in user. Fire-and-forget from call sites —
 * failures are logged but never thrown, since this must never block the
 * actual user action it's tracking.
 */
export async function logDailyEvent(type: DailyEventType, count = 1): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const date = todayKey();
  const field = FIELD_BY_TYPE[type];
  const docRef = doc(db, 'users_game_data', uid, 'dailyStats', date);

  const update: Record<string, unknown> = {
    date,
    [field]: increment(count),
    updatedAt: new Date().toISOString(),
  };

  if (type === 'login') {
    update.loginTimestamps = arrayUnion(new Date().toISOString());
  }

  try {
    await setDoc(docRef, update, { merge: true });
  } catch (error) {
    console.error(`[DailyStats] Failed to log "${type}" event:`, error);
  }
}
