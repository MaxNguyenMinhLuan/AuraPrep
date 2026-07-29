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

const db = admin.firestore();

/**
 * Health check endpoint
 */
export const health = functions.https.onRequest((req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Twice-daily export of per-user daily activity (logins, missions,
 * practice questions, summons, boss fights) to a live Google Sheet.
 * See functions/src/dailyStatsExport.ts and functions/SHEETS_SETUP.md.
 */
export { exportDailyStatsToSheet } from './dailyStatsExport';

/**
 * Admin function to add special Auramons to a user's collection.
 * Only works with admin auth (maxidea2008@gmail.com).
 */
export const addSpecialAuramons = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  // Check if user is admin (only allow for maxidea2008@gmail.com)
  const uid = context.auth.uid;
  const userDoc = await db.collection('users').doc(uid).get();
  const userEmail = userDoc.data()?.email;

  if (userEmail !== 'maxidea2008@gmail.com') {
    throw new functions.https.HttpsError('permission-denied', 'Only admin can use this function');
  }

  try {
    // Get current game data
    const gameDataRef = db.collection('users_game_data').doc(uid);
    const gameDataSnap = await gameDataRef.get();

    const gameData = gameDataSnap.data() || {};
    const currentCreatures = gameData.creatures || [];

    // Find the max ID to assign unique instance IDs
    let maxId = 0;
    currentCreatures.forEach((c: any) => {
      if (c.id > maxId) maxId = c.id;
    });

    // Define the Auramons to add
    const auramons = [
      // Charizard (final stage - id: 2)
      { id: 2, evolutionStage: 3, name: 'Charizard' },
      // Snorlax (no evolution - id: 74)
      { id: 74, evolutionStage: 1, name: 'Snorlax' },
      // Raichu (final stage - id: 20)
      { id: 20, evolutionStage: 2, name: 'Raichu' },
      // Shiny Gyarados (final stage - id: 51)
      { id: 51, evolutionStage: 2, name: 'Shiny Gyarados', isShiny: true },
      // Dragonair (middle stage - id: 16)
      { id: 16, evolutionStage: 2, name: 'Dragonair' },
      // Galarian Articuno (no evolution - id: 80)
      { id: 80, evolutionStage: 1, name: 'Galarian Articuno' }
    ];

    // Create new creature instances at max level (100)
    const newCreatures = auramons.map((auramon, index) => ({
      id: maxId + index + 1,
      creatureId: auramon.id,
      xp: (100 - 5) * 30, // Max level 100 XP
      level: 100,
      evolutionStage: auramon.evolutionStage,
      isShiny: auramon.isShiny || false
    }));

    // Update the document
    const updatedCreatures = [...currentCreatures, ...newCreatures];
    await gameDataRef.set({
      ...gameData,
      creatures: updatedCreatures,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return {
      success: true,
      added: newCreatures.length,
      auramons: auramons.map(p => p.name)
    };
  } catch (error: any) {
    console.error('Error adding Auramons:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Redeem a gift code to receive a special Auramon.
 * Gift codes are one-time use and can only be redeemed once per user.
 */
export const redeemGiftCode = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = context.auth.uid;
  const { code } = data;

  if (!code || typeof code !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Gift code is required');
  }

  const trimmedCode = code.toUpperCase().trim();

  try {
    // Get the gift code document
    const giftCodeRef = db.collection('gift_codes').doc(trimmedCode);
    const giftCodeSnap = await giftCodeRef.get();

    if (!giftCodeSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Invalid gift code');
    }

    const giftCodeData = giftCodeSnap.data() as any;

    if (!giftCodeData) {
      throw new functions.https.HttpsError('not-found', 'Invalid gift code');
    }

    // Check if code is still active
    if (giftCodeData.isUsed) {
      throw new functions.https.HttpsError('permission-denied', 'This gift code has already been used');
    }

    if (giftCodeData.expiresAt && new Date(giftCodeData.expiresAt) < new Date()) {
      throw new functions.https.HttpsError('permission-denied', 'This gift code has expired');
    }

    // Check if user already redeemed this code
    const userRedemptionRef = db.collection('users_gift_code_redemptions')
      .doc(`${uid}_${trimmedCode}`);
    const userRedemptionSnap = await userRedemptionRef.get();

    if (userRedemptionSnap.exists) {
      throw new functions.https.HttpsError('permission-denied', 'You have already redeemed this gift code');
    }

    // Get user's game data
    const gameDataRef = db.collection('users_game_data').doc(uid);
    const gameDataSnap = await gameDataRef.get();

    const gameData = gameDataSnap.data() || {};
    const currentCreatures = gameData.creatures || [];

    // Find the max ID to assign unique instance IDs
    let maxId = 0;
    currentCreatures.forEach((c: any) => {
      if (c.id > maxId) maxId = c.id;
    });

    // Create the new Auramon instance
    const newCreature = {
      id: maxId + 1,
      creatureId: giftCodeData.auramonId,
      xp: (giftCodeData.level || 5 - 5) * 30,
      level: giftCodeData.level || 5,
      evolutionStage: giftCodeData.evolutionStage || 1,
      isShiny: giftCodeData.isShiny || false
    };

    // Update the document with new creature
    const updatedCreatures = [...currentCreatures, newCreature];
    await gameDataRef.set({
      ...gameData,
      creatures: updatedCreatures,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Mark the code as redeemed by this user
    await userRedemptionRef.set({
      userId: uid,
      giftCode: trimmedCode,
      redeemedAt: new Date().toISOString(),
      auramonId: giftCodeData.auramonId,
      auramonName: giftCodeData.auramonName
    });

    return {
      success: true,
      auramon: {
        id: giftCodeData.auramonId,
        name: giftCodeData.auramonName,
        level: giftCodeData.level || 5,
        evolutionStage: giftCodeData.evolutionStage || 1,
        isShiny: giftCodeData.isShiny || false
      }
    };
  } catch (error: any) {
    console.error('Error redeeming gift code:', error);
    if (error.code && error.message) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
});
