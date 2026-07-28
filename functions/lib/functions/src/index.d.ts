/**
 * AuraPrep Cloud Functions
 *
 * Scheduled functions to send Guardian email nudges at specific times.
 * - Morning (8 AM): Motivational nudge
 * - Afternoon (2 PM): Impatient nudge
 * - Evening (8 PM): Desperate nudge
 */
import * as functions from 'firebase-functions';
/**
 * Morning nudge - 8 AM local time (helpful, motivational)
 * Runs every hour and checks which users are at 8 AM
 */
export declare const morningNudge: functions.CloudFunction<unknown>;
/**
 * Afternoon nudge - 2 PM local time (impatient, concerned)
 * Runs every hour and checks which users are at 2 PM
 */
export declare const afternoonNudge: functions.CloudFunction<unknown>;
/**
 * Evening nudge - 8 PM local time (desperate, guilt-tripping)
 * Runs every hour and checks which users are at 8 PM
 */
export declare const eveningNudge: functions.CloudFunction<unknown>;
/**
 * Daily reset function
 * Runs every day at midnight UTC to reset daily mission tracking and update streaks
 */
export declare const dailyReset: functions.CloudFunction<unknown>;
/**
 * Health check endpoint
 */
export declare const health: functions.HttpsFunction;
//# sourceMappingURL=index.d.ts.map