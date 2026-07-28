/**
 * AuraPrep Cloud Functions
 *
 * The morning/afternoon/evening email nudges and daily streak reset that
 * used to live here read and wrote the Firestore collection `userGameData`
 * (camelCase). The live app writes game data to `users_game_data`
 * (see services/gameDataService.ts) via the Express/MongoDB backend, whose
 * own hourly cron (server/src/jobs/scheduler.ts -> NudgeService) already
 * sends the same 8am/2pm/8pm nudges - via SendGrid email AND Web Push -
 * against the real data. These functions were reading/writing a collection
 * no live user document has ever been written to, so they were retired
 * rather than fixed: keeping them deployed only risked duplicate sends
 * once someone pointed them at the right collection, for no benefit over
 * the system that already works. They also carried a hardcoded Gmail App
 * Password fallback, which has been removed - rotate that credential at
 * myaccount.google.com/apppasswords if that has not already happened.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Health check endpoint
 */
export const health = functions.https.onRequest((req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
