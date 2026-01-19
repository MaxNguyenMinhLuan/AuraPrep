/**
 * AuraPrep Cloud Functions
 *
 * Scheduled functions to send Guardian email nudges at specific times.
 * - Morning (8 AM): Motivational nudge
 * - Afternoon (2 PM): Impatient nudge
 * - Evening (8 PM): Desperate nudge
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { EmailService } from './services/emailService';
import { userService } from './services/userService';
import { getTimezonesForLocalHour, getCurrentUTCHour } from './utils/timezoneUtils';
import { generateDeepLink } from './utils/deepLinkGenerator';
import { generateGuardianCopy } from '../../../shared/generateGuardianCopy';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Get configuration from environment
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const APP_URL = process.env.APP_URL || 'https://auraprep.com';

if (!SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not set');
}

const emailService = new EmailService(SENDGRID_API_KEY);

/**
 * Morning nudge - 8 AM local time (helpful, motivational)
 * Runs every hour and checks which users are at 8 AM
 */
export const morningNudge = functions
  .pubsub
  .schedule('0 * * * *')  // Every hour at :00
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Running morning nudge function...');
      const currentUTCHour = getCurrentUTCHour();
      const targetTimezones = getTimezonesForLocalHour(8, currentUTCHour);

      if (targetTimezones.length === 0) {
        console.log('No timezones currently at 8 AM UTC');
        return;
      }

      console.log(`Timezones at 8 AM: ${targetTimezones.join(', ')}`);

      const users = await userService.getUsersForNudge(targetTimezones, 'morning');
      console.log(`Found ${users.length} users to send morning nudges to`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Check if mission already completed today
          if (user.dailyMissions.completed) {
            console.log(`User ${user.email} already completed today, skipping`);
            continue;
          }

          // Check if morning nudge already sent
          if (user.dailyMissions.nudgesSent >= 1) {
            console.log(`Morning nudge already sent to ${user.email}, skipping`);
            continue;
          }

          // Generate personalized copy
          const copy = generateGuardianCopy({
            guardianType: user.activeCreature.type as any,
            guardianName: user.activeCreature.name,
            nudgeLevel: 'morning',
            userName: user.email.split('@')[0],
            currentStreak: user.currentStreak,
            deepLink: generateDeepLink(
              { userId: user._id || '', email: user.email },
              JWT_SECRET,
              APP_URL
            )
          });

          // Send email
          await emailService.sendNudgeEmail({
            to: user.email,
            subject: copy.subject,
            htmlContent: copy.body,
            previewText: copy.preview,
            trackingData: {
              userId: user._id || '',
              nudgeLevel: 'morning'
            }
          });

          // Update nudge tracking
          await userService.updateNudgeSent(user._id || '', 'morning');
          successCount++;
        } catch (error) {
          console.error(`Error sending morning nudge to ${user.email}:`, error);
          errorCount++;
        }
      }

      console.log(`Morning nudge completed: ${successCount} sent, ${errorCount} failed`);
    } catch (error) {
      console.error('Morning nudge function error:', error);
      throw error;
    }
  });

/**
 * Afternoon nudge - 2 PM local time (impatient, concerned)
 * Runs every hour and checks which users are at 2 PM
 */
export const afternoonNudge = functions
  .pubsub
  .schedule('0 * * * *')  // Every hour at :00
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Running afternoon nudge function...');
      const currentUTCHour = getCurrentUTCHour();
      const targetTimezones = getTimezonesForLocalHour(14, currentUTCHour);

      if (targetTimezones.length === 0) {
        console.log('No timezones currently at 2 PM UTC');
        return;
      }

      console.log(`Timezones at 2 PM: ${targetTimezones.join(', ')}`);

      const users = await userService.getUsersForNudge(targetTimezones, 'afternoon');
      console.log(`Found ${users.length} users to send afternoon nudges to`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Check if mission already completed today
          if (user.dailyMissions.completed) {
            console.log(`User ${user.email} already completed today, skipping`);
            continue;
          }

          // Check if afternoon nudge already sent
          if (user.dailyMissions.nudgesSent >= 2) {
            console.log(`Afternoon nudge already sent to ${user.email}, skipping`);
            continue;
          }

          // Generate personalized copy
          const copy = generateGuardianCopy({
            guardianType: user.activeCreature.type as any,
            guardianName: user.activeCreature.name,
            nudgeLevel: 'afternoon',
            userName: user.email.split('@')[0],
            currentStreak: user.currentStreak,
            deepLink: generateDeepLink(
              { userId: user._id || '', email: user.email },
              JWT_SECRET,
              APP_URL
            )
          });

          // Send email
          await emailService.sendNudgeEmail({
            to: user.email,
            subject: copy.subject,
            htmlContent: copy.body,
            previewText: copy.preview,
            trackingData: {
              userId: user._id || '',
              nudgeLevel: 'afternoon'
            }
          });

          // Update nudge tracking
          await userService.updateNudgeSent(user._id || '', 'afternoon');
          successCount++;
        } catch (error) {
          console.error(`Error sending afternoon nudge to ${user.email}:`, error);
          errorCount++;
        }
      }

      console.log(`Afternoon nudge completed: ${successCount} sent, ${errorCount} failed`);
    } catch (error) {
      console.error('Afternoon nudge function error:', error);
      throw error;
    }
  });

/**
 * Evening nudge - 8 PM local time (desperate, guilt-tripping)
 * Runs every hour and checks which users are at 8 PM
 */
export const eveningNudge = functions
  .pubsub
  .schedule('0 * * * *')  // Every hour at :00
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Running evening nudge function...');
      const currentUTCHour = getCurrentUTCHour();
      const targetTimezones = getTimezonesForLocalHour(20, currentUTCHour);

      if (targetTimezones.length === 0) {
        console.log('No timezones currently at 8 PM UTC');
        return;
      }

      console.log(`Timezones at 8 PM: ${targetTimezones.join(', ')}`);

      const users = await userService.getUsersForNudge(targetTimezones, 'evening');
      console.log(`Found ${users.length} users to send evening nudges to`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Check if mission already completed today
          if (user.dailyMissions.completed) {
            console.log(`User ${user.email} already completed today, skipping`);
            continue;
          }

          // Check if evening nudge already sent
          if (user.dailyMissions.nudgesSent >= 3) {
            console.log(`Evening nudge already sent to ${user.email}, skipping`);
            continue;
          }

          // Generate personalized copy
          const copy = generateGuardianCopy({
            guardianType: user.activeCreature.type as any,
            guardianName: user.activeCreature.name,
            nudgeLevel: 'evening',
            userName: user.email.split('@')[0],
            currentStreak: user.currentStreak,
            deepLink: generateDeepLink(
              { userId: user._id || '', email: user.email },
              JWT_SECRET,
              APP_URL
            )
          });

          // Send email
          await emailService.sendNudgeEmail({
            to: user.email,
            subject: copy.subject,
            htmlContent: copy.body,
            previewText: copy.preview,
            trackingData: {
              userId: user._id || '',
              nudgeLevel: 'evening'
            }
          });

          // Update nudge tracking
          await userService.updateNudgeSent(user._id || '', 'evening');
          successCount++;
        } catch (error) {
          console.error(`Error sending evening nudge to ${user.email}:`, error);
          errorCount++;
        }
      }

      console.log(`Evening nudge completed: ${successCount} sent, ${errorCount} failed`);
    } catch (error) {
      console.error('Evening nudge function error:', error);
      throw error;
    }
  });

/**
 * Daily reset function
 * Runs every day at midnight UTC to reset daily mission tracking and update streaks
 */
export const dailyReset = functions
  .pubsub
  .schedule('0 0 * * *')  // Every day at 00:00 UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Running daily reset function...');
      const db = admin.firestore();

      // Get all users
      const snapshot = await db.collection('userGameData').get();
      console.log(`Processing ${snapshot.size} users for daily reset`);

      let streakIncrement = 0;
      let streakReset = 0;
      let updated = 0;

      for (const doc of snapshot.docs) {
        try {
          const userData = doc.data();
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (userData.dailyMissions.completed &&
              userData.dailyMissions.completedAt &&
              userData.dailyMissions.completedAt.toDate?.() > today) {
            // Mission was completed today, increment streak
            await doc.ref.update({
              'currentStreak': admin.firestore.FieldValue.increment(1),
              'longestStreak': Math.max(
                userData.longestStreak || 0,
                (userData.currentStreak || 0) + 1
              ),
              'lastCompletionDate': admin.firestore.FieldValue.serverTimestamp(),
              'dailyMissions': {
                date: admin.firestore.Timestamp.now(),
                completed: false,
                nudgesSent: 0
              }
            });
            streakIncrement++;
          } else {
            // Mission not completed, reset streak
            await doc.ref.update({
              'currentStreak': 0,
              'lastCompletionDate': userData.lastCompletionDate || null,
              'dailyMissions': {
                date: admin.firestore.Timestamp.now(),
                completed: false,
                nudgesSent: 0
              }
            });
            streakReset++;
          }
          updated++;
        } catch (error) {
          console.error(`Error processing user ${doc.id}:`, error);
        }
      }

      console.log(`Daily reset completed: ${streakIncrement} streaks incremented, ${streakReset} streaks reset, ${updated} total updated`);
    } catch (error) {
      console.error('Daily reset function error:', error);
      throw error;
    }
  });

/**
 * Health check endpoint
 */
export const health = functions.https.onRequest((req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
