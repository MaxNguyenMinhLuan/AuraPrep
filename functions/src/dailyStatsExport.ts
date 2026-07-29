/**
 * Twice-daily export of per-user daily activity (logins, missions,
 * practice questions, summons, boss fights) from Firestore to a live
 * Google Sheet.
 *
 * Source of truth: users_game_data/{uid}/dailyStats/{date} docs, written
 * directly by the client as events happen (services/dailyStatsService.ts).
 * This function just reads and republishes them — it never invents counts.
 *
 * Runs at 8am and 8pm America/New_York. Each run re-exports BOTH today and
 * yesterday (not just today): since every field it writes is a full
 * overwrite of that row (not a delta), re-processing yesterday is free and
 * self-heals a missed run — if the 8pm run fails, the next morning's 8am
 * run still catches yesterday's final numbers.
 *
 * Setup required before this does anything useful — see functions/SHEETS_SETUP.md.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { upsertSheetRows, SheetRow } from './services/sheetsService';

if (!admin.apps.length) {
  admin.initializeApp();
}

const HEADER = [
  'Key',
  'Date',
  'User',
  'Logins',
  'Login Times',
  'Missions Completed',
  'Practice Questions',
  'Summons',
  'Boss Fights',
  'Last Updated',
];

interface DailyStatsDoc {
  date: string;
  logins?: number;
  loginTimestamps?: string[];
  missionsCompleted?: number;
  questionsAnswered?: number;
  summons?: number;
  bossFights?: number;
  updatedAt?: string;
}

/** YYYY-MM-DD for `date` as seen in `timeZone`, matching the client's en-CA date-key format. */
function dateKeyInTimezone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

async function resolveUserLabel(uid: string): Promise<string> {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord.email || userRecord.displayName || uid;
  } catch (error) {
    console.warn(`[DailyStatsExport] Could not resolve auth record for ${uid}:`, error);
    return uid;
  }
}

export async function runDailyStatsExport(): Promise<{ rowsWritten: number }> {
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    console.error('[DailyStatsExport] SHEETS_SPREADSHEET_ID is not set — skipping export. See functions/SHEETS_SETUP.md.');
    return { rowsWritten: 0 };
  }

  const timeZone = 'America/New_York';
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateKeys = [dateKeyInTimezone(yesterday, timeZone), dateKeyInTimezone(now, timeZone)];

  const db = admin.firestore();
  const snapshot = await db
    .collectionGroup('dailyStats')
    .where('date', 'in', dateKeys)
    .get();

  if (snapshot.empty) {
    console.log(`[DailyStatsExport] No activity found for ${dateKeys.join(', ')}.`);
    return { rowsWritten: 0 };
  }

  const entries = snapshot.docs.map((docSnap) => ({
    uid: docSnap.ref.parent.parent?.id ?? 'unknown',
    data: docSnap.data() as DailyStatsDoc,
  }));

  // Resolve each distinct uid's label (email) once, even if they have both
  // a yesterday and today doc in this batch.
  const uniqueUids = Array.from(new Set(entries.map((e) => e.uid)));
  const labelPairs = await Promise.all(uniqueUids.map(async (uid) => [uid, await resolveUserLabel(uid)] as const));
  const labelByUid = new Map(labelPairs);

  const rows: SheetRow[] = entries.map(({ uid, data }) => {
    const key = `${data.date}_${uid}`;
    return {
      key,
      values: [
        key,
        data.date,
        labelByUid.get(uid) ?? uid,
        data.logins ?? 0,
        (data.loginTimestamps ?? []).join('; '),
        data.missionsCompleted ?? 0,
        data.questionsAnswered ?? 0,
        data.summons ?? 0,
        data.bossFights ?? 0,
        data.updatedAt ?? '',
      ],
    };
  });

  await upsertSheetRows(spreadsheetId, HEADER, rows);
  console.log(`[DailyStatsExport] Wrote ${rows.length} row(s) for ${dateKeys.join(', ')}.`);
  return { rowsWritten: rows.length };
}

export const exportDailyStatsToSheet = functions.pubsub
  .schedule('0 8,20 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    await runDailyStatsExport();
    return null;
  });
