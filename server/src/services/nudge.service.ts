import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import UserGameData, { IUserGameData } from '../models/UserGameData';
import { User } from '../models/User';
import { PushSubscription } from '../models/PushSubscription';
import { sendNotificationToUser } from './push.service';
import { PushCategory, pickRandomTemplate, pickRival, renderPushTemplate } from '../shared/pushNotificationTemplates';
import { levelsUntilNextEvolution } from '../shared/evolutionThresholds';
import { getUserLeagueRank } from './leaderboard.service';
import { getFirestore } from 'firebase-admin/firestore';

// A nudge "slot" is a distinct reason to notify a user in a given local day.
// 'morning' and 'evening' are the two guaranteed sends; 'afternoon' is
// opportunistic (not guaranteed); 'lunchBreak', 'lastChance', and
// 'evolutionSoon' are event-triggered and independent of the guaranteed slots.
// 'streakBroken'/'dormant'/'dormantHarsh' are inactivity-tier triggers based
// on days since lastCompletionDate, each firing once per gap (not per day).
type NudgeSlot = 'morning' | 'afternoon' | 'evening' | 'lunchBreak' | 'lastChance' | 'evolutionSoon' | 'streakBroken' | 'dormant' | 'dormantHarsh';

// Jitter windows, in minutes-since-local-midnight. Each user's exact target
// minute within a window is deterministic per (userId, localDateStr) so it's
// stable across repeated sweep ticks and server restarts within the same
// day, but still varies day to day - "8:03 one day, 8:06 the next" rather
// than a robotic fixed time.
const MORNING_WINDOW_START_MIN = 7 * 60 + 50; // 7:50
const MORNING_WINDOW_END_MIN = 8 * 60 + 12;   // 8:12
const SUNDAY_MORNING_WINDOW_START_MIN = 7 * 60 + 50; // 7:50
const SUNDAY_MORNING_WINDOW_END_MIN = 7 * 60 + 58;   // 7:58 (per spec: Sunday is ~7:54)
const AFTERNOON_WINDOW_START_MIN = 13 * 60 + 50; // 13:50
const AFTERNOON_WINDOW_END_MIN = 14 * 60 + 15;   // 14:15
const LUNCH_BREAK_WINDOW_START_MIN = 11 * 60;       // 11:00
const LUNCH_BREAK_WINDOW_END_MIN = 13 * 60;         // 13:00
const EVENING_WINDOW_START_MIN = 19 * 60 + 50; // 19:50
const EVENING_WINDOW_END_MIN = 20 * 60 + 15;   // 20:15
const LAST_CHANCE_HOUR = 17; // 5pm local

// Inactivity tiers, in days since lastCompletionDate. Each tier fires once
// per gap (guarded by profile.lastDormancyNudgeTier, reset whenever the user
// actually completes a mission again) - mirrors Duolingo's escalating-tone
// pattern for prolonged absence rather than repeating the same daily nudge.
const STREAK_BROKEN_DAYS = 1;
const DORMANT_DAYS = 3;
const DORMANT_HARSH_DAYS = 7;

export class NudgeService {
    /**
     * Parse the local hour, local minute-of-day, and local date string in
     * the user's timezone.
     */
    static getLocalTimeInfo(timezone: string): { localHour: number; localMinuteOfDay: number; localDateStr: string; dayOfWeek: number } {
        const targetTimezone = timezone || 'America/New_York';
        try {
            return this.computeLocalTimeInfo(targetTimezone);
        } catch (error) {
            console.error(`Error calculating local time for timezone: ${targetTimezone}. Falling back to America/New_York:`, error);
            try {
                return this.computeLocalTimeInfo('America/New_York');
            } catch {
                const now = new Date();
                return {
                    localHour: now.getHours(),
                    localMinuteOfDay: now.getHours() * 60 + now.getMinutes(),
                    localDateStr: now.toISOString().split('T')[0],
                    dayOfWeek: now.getDay(),
                };
            }
        }
    }

    private static computeLocalTimeInfo(timezone: string): { localHour: number; localMinuteOfDay: number; localDateStr: string; dayOfWeek: number } {
        const now = new Date();

        const timeOptions = { timeZone: timezone, hour: 'numeric', minute: 'numeric', hour12: false } as const;
        const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions);
        const timeParts = timeFormatter.formatToParts(now);
        const localHour = parseInt(timeParts.find(p => p.type === 'hour')?.value || '0', 10) % 24;
        const localMinute = parseInt(timeParts.find(p => p.type === 'minute')?.value || '0', 10);

        const dateOptions = { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' } as const;
        const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
        const dateParts = dateFormatter.formatToParts(now);
        const year = dateParts.find(p => p.type === 'year')?.value;
        const month = dateParts.find(p => p.type === 'month')?.value;
        const day = dateParts.find(p => p.type === 'day')?.value;
        const weekday = dateParts.find(p => p.type === 'weekday')?.value || '';
        const localDateStr = `${year}-${month}-${day}`;

        const WEEKDAY_MAP: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        const dayOfWeek = WEEKDAY_MAP[weekday] ?? new Date(`${localDateStr}T12:00:00Z`).getUTCDay();

        return { localHour, localMinuteOfDay: localHour * 60 + localMinute, localDateStr, dayOfWeek };
    }

    /**
     * Get the local date string of a Date object in the user's timezone.
     */
    static getLocalDateStrFromDate(date: Date, timezone: string): string {
        const targetTimezone = timezone || 'America/New_York';
        try {
            const dateOptions = { timeZone: targetTimezone, year: 'numeric', month: '2-digit', day: '2-digit' } as const;
            const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
            const parts = dateFormatter.formatToParts(date);
            const year = parts.find(p => p.type === 'year')?.value;
            const month = parts.find(p => p.type === 'month')?.value;
            const day = parts.find(p => p.type === 'day')?.value;
            return `${year}-${month}-${day}`;
        } catch {
            return date.toISOString().split('T')[0];
        }
    }

    /**
     * Deterministic pseudo-random minute-of-day within [start, end], seeded
     * by userId + localDateStr + a salt distinguishing the window. Stable
     * across repeated sweep ticks and restarts on the same day; different
     * from one day to the next.
     */
    static jitteredTargetMinute(userId: string, localDateStr: string, salt: string, startMin: number, endMin: number): number {
        const hash = crypto.createHash('md5').update(`${userId}:${localDateStr}:${salt}`).digest();
        const span = Math.max(1, endMin - startMin);
        const offset = hash.readUInt16BE(0) % span;
        return startMin + offset;
    }

    /**
     * Decide which push-notification category to pull from for a guaranteed
     * (morning/evening) send. If today's daily missions are already done,
     * redirect toward Practice/Boss Fights instead of repeating a
     * mission-completion nudge that no longer applies. Evening still leans
     * on streak-at-risk / Sunday leaderboard when missions are outstanding.
     */
    static selectPushCategory(
        slot: 'morning' | 'afternoon' | 'evening',
        missionsCompleted: boolean,
        localDateStr: string,
        dayOfWeek: number,
        streakCount: number
    ): PushCategory {
        if (missionsCompleted) {
            return 'beyondMissions';
        }
        if (slot === 'evening') {
            if (dayOfWeek === 0) return 'leaderboard';
            if (streakCount > 0) return 'streak';
            return 'dailyMissions';
        }
        if (slot === 'afternoon') return 'auraFarming';
        return 'dailyMissions';
    }

    /**
     * Process a sweep across all active users. Runs every 5 minutes so
     * jittered per-user send times (e.g. 8:06, not just 8:00) can actually
     * be hit. Push is the only nudge channel - a saved Web Push
     * subscription is the only opt-in a user needs.
     */
    static async processHourlyNudges(): Promise<void> {
        console.log(`[${new Date().toISOString()}] Starting nudge sweep...`);
        try {
            const pushUserIds = await PushSubscription.distinct('userId');
            const records = await UserGameData.find({ userId: { $in: pushUserIds } });
            console.log(`Found ${records.length} users with an active push subscription.`);

            let nudgesSentCount = 0;

            for (const gameData of records) {
                // 0. Check if user has been surpassed on the leaderboard
                try {
                    await this.checkLeaderboardSurpassed(gameData);
                } catch (error) {
                    console.error(`[Leaderboard] Failed checkLeaderboardSurpassed for ${gameData.userId}:`, error);
                }

                const timezone = gameData.timezone || 'America/New_York';
                const { localMinuteOfDay, localDateStr, dayOfWeek } = this.getLocalTimeInfo(timezone);

                // 1. Check for day rollover in the user's local timezone
                const localMissionDateStr = this.getLocalDateStrFromDate(gameData.dailyMissions.date, timezone);

                if (localMissionDateStr !== localDateStr) {
                    console.log(`Timezone rollover detected for user ${gameData.userId} (${timezone}). Local: ${localDateStr}, Mission Date: ${localMissionDateStr}. Resetting daily mission...`);
                    gameData.dailyMissions.date = new Date();
                    gameData.dailyMissions.completed = false;
                    gameData.dailyMissions.nudgesSent = 0;
                    gameData.dailyMissions.lastNudgeSentAt = undefined;
                    gameData.dailyMissions.nudgeSlotsSent = [];
                    await gameData.save();
                }

                const slotsSentToday = new Set(gameData.dailyMissions.nudgeSlotsSent || []);

                // 2. Rate-limit to prevent double nudging in quick succession,
                // regardless of which slot is firing.
                const now = new Date();
                const lastNudgeTime = gameData.dailyMissions.lastNudgeSentAt;
                if (lastNudgeTime && (now.getTime() - lastNudgeTime.getTime() < 50 * 60 * 1000)) {
                    continue;
                }

                const slot = this.determineDueSlot(gameData, localMinuteOfDay, dayOfWeek, slotsSentToday, userIdStr(gameData), localDateStr);
                if (!slot) {
                    continue;
                }

                await this.sendSlotNudge(gameData, slot, localDateStr, dayOfWeek);
                slotsSentToday.add(slot);
                gameData.dailyMissions.nudgeSlotsSent = Array.from(slotsSentToday);
                gameData.dailyMissions.nudgesSent = Math.min(6, gameData.dailyMissions.nudgesSent + 1);
                gameData.dailyMissions.lastNudgeSentAt = new Date();
                await gameData.save();

                nudgesSentCount++;
            }

            console.log(`[${new Date().toISOString()}] Nudge sweep finished. Dispatched ${nudgesSentCount} nudges.`);
        } catch (error) {
            console.error('Error processing nudge sweep:', error);
        }
    }

    /**
     * Decide which slot (if any) is due right now for this user, checking
     * the guaranteed morning/evening/afternoon jittered windows first, then
     * the event-triggered lastChance and evolutionSoon checks. Returns null
     * if nothing is due this tick.
     */
    private static determineDueSlot(
        gameData: IUserGameData,
        localMinuteOfDay: number,
        dayOfWeek: number,
        slotsSentToday: Set<string>,
        userId: string,
        localDateStr: string
    ): NudgeSlot | null {
        const isSunday = dayOfWeek === 0;

        // Guaranteed morning slot
        if (!slotsSentToday.has('morning')) {
            const [startMin, endMin] = isSunday
                ? [SUNDAY_MORNING_WINDOW_START_MIN, SUNDAY_MORNING_WINDOW_END_MIN]
                : [MORNING_WINDOW_START_MIN, MORNING_WINDOW_END_MIN];
            const target = this.jitteredTargetMinute(userId, localDateStr, 'morning', startMin, endMin);
            if (localMinuteOfDay >= target) return 'morning';
        }

        // Event: lunch break, only if today's mission is still incomplete.
        // Not guaranteed daily - only fires when there's actually something
        // to nudge about, keeping it feeling like an occasional check-in
        // rather than a fixed slot.
        if (!slotsSentToday.has('lunchBreak') && !gameData.dailyMissions.completed) {
            const target = this.jitteredTargetMinute(userId, localDateStr, 'lunchBreak', LUNCH_BREAK_WINDOW_START_MIN, LUNCH_BREAK_WINDOW_END_MIN);
            if (localMinuteOfDay >= target) return 'lunchBreak';
        }

        // Opportunistic afternoon slot
        if (!slotsSentToday.has('afternoon')) {
            const target = this.jitteredTargetMinute(userId, localDateStr, 'afternoon', AFTERNOON_WINDOW_START_MIN, AFTERNOON_WINDOW_END_MIN);
            if (localMinuteOfDay >= target) return 'afternoon';
        }

        // Guaranteed evening slot
        if (!slotsSentToday.has('evening')) {
            const target = this.jitteredTargetMinute(userId, localDateStr, 'evening', EVENING_WINDOW_START_MIN, EVENING_WINDOW_END_MIN);
            if (localMinuteOfDay >= target) return 'evening';
        }

        // Event: 5pm and no mission done yet today
        if (!slotsSentToday.has('lastChance') && !gameData.dailyMissions.completed) {
            if (localMinuteOfDay >= LAST_CHANCE_HOUR * 60) return 'lastChance';
        }

        // Event: creature close to evolving (not slotted per-day - guarded
        // by lastEvolutionNudgeLevel on profile so it only fires once per
        // threshold crossing, not once per day).
        if (this.isEvolutionNudgeDue(gameData)) return 'evolutionSoon';

        // Event: inactivity tiers (streakBroken/dormant/dormantHarsh), each
        // firing once per gap regardless of time-of-day windows above.
        const dormancySlot = this.dueDormancySlot(gameData);
        if (dormancySlot) return dormancySlot;

        return null;
    }

    /**
     * Determine the highest inactivity tier due right now, based on days
     * since lastCompletionDate. Returns null if the user has completed a
     * mission recently enough, or if the highest currently-due tier has
     * already been sent for this same inactivity gap.
     */
    private static dueDormancySlot(gameData: IUserGameData): 'streakBroken' | 'dormant' | 'dormantHarsh' | null {
        if (!gameData.lastCompletionDate) return null;

        const daysInactive = Math.floor((Date.now() - gameData.lastCompletionDate.getTime()) / (24 * 60 * 60 * 1000));
        if (daysInactive < STREAK_BROKEN_DAYS) return null;

        const tier: 'streakBroken' | 'dormant' | 'dormantHarsh' =
            daysInactive >= DORMANT_HARSH_DAYS ? 'dormantHarsh' :
            daysInactive >= DORMANT_DAYS ? 'dormant' :
            'streakBroken';

        const tierRank = { streakBroken: 1, dormant: 2, dormantHarsh: 3 };
        const profile = (gameData.profile || {}) as Record<string, any>;
        const lastSentTier = profile.lastDormancyNudgeTier as ('streakBroken' | 'dormant' | 'dormantHarsh' | undefined);

        // Already sent this tier (or a higher one) for the current gap - don't refire.
        if (lastSentTier && tierRank[lastSentTier] >= tierRank[tier]) return null;

        return tier;
    }

    private static isEvolutionNudgeDue(gameData: IUserGameData): boolean {
        const creature = gameData.activeCreature;
        if (!creature) return false;

        const levelsLeft = levelsUntilNextEvolution(creature.creatureId, creature.level);
        if (levelsLeft === null || levelsLeft > 2) return false;

        const profile = (gameData.profile || {}) as Record<string, any>;
        const lastNudgedLevel = profile.lastEvolutionNudgeLevel;
        // Already nudged for this creature at this level (or higher) - don't refire.
        if (typeof lastNudgedLevel === 'number' && lastNudgedLevel >= creature.level) return false;

        return true;
    }

    /**
     * Build and send the push for a given due slot, picking category +
     * template with the user's real state.
     */
    private static async sendSlotNudge(gameData: IUserGameData, slot: NudgeSlot, localDateStr: string, dayOfWeek: number): Promise<void> {
        const user = await User.findById(gameData.userId);
        if (!user) {
            console.warn(`User document not found for user ID: ${gameData.userId}`);
            return;
        }

        const streakCount = (gameData.profile as any)?.dailyStreak ?? gameData.currentStreak ?? 0;
        const leagueName = (gameData.profile as any)?.league ?? 'Bronze';
        const partnerName = gameData.activeCreature?.name || 'your Auramon';
        const firstName = getFirstName(user.name);

        let pushCategory: PushCategory;
        let levelsToEvolve = 0;
        let daysInactive = 0;

        if (slot === 'streakBroken' || slot === 'dormant' || slot === 'dormantHarsh') {
            pushCategory = slot;
            daysInactive = gameData.lastCompletionDate
                ? Math.floor((Date.now() - gameData.lastCompletionDate.getTime()) / (24 * 60 * 60 * 1000))
                : 0;
        } else if (slot === 'lastChance') {
            pushCategory = 'lastChance';
        } else if (slot === 'lunchBreak') {
            pushCategory = 'lunchBreak';
        } else if (slot === 'evolutionSoon') {
            pushCategory = 'evolutionSoon';
            levelsToEvolve = levelsUntilNextEvolution(gameData.activeCreature.creatureId, gameData.activeCreature.level) ?? 0;
        } else if (slot === 'morning' && dayOfWeek === 0) {
            // Sunday morning: check for real leaderboard stagnation before
            // falling back to the normal morning category selection.
            pushCategory = await this.resolveSundayCategory(gameData, leagueName, streakCount, localDateStr, dayOfWeek);
        } else {
            pushCategory = this.selectPushCategory(slot as 'morning' | 'afternoon' | 'evening', gameData.dailyMissions.completed, localDateStr, dayOfWeek, streakCount);
        }

        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email, purpose: 'push-nudge' },
            config.jwt.accessTokenSecret,
            { expiresIn: '7d' }
        );
        const deepLink = `${config.appUrl}?token=${token}`;

        const pushContent = renderPushTemplate(pickRandomTemplate(pushCategory), {
            firstName,
            partnerName,
            streakCount,
            rival: pickRival(),
            leagueName,
            levelsToEvolve,
            daysInactive,
        });

        const pushResult = await sendNotificationToUser(user._id.toString(), {
            title: pushContent.title,
            body: pushContent.body,
            url: deepLink,
        });

        if (pushResult.sent > 0) {
            console.log(`🔔 Push nudge (${slot}/${pushCategory}) sent to ${user.email} on ${pushResult.sent} device(s).`);
            if (slot === 'evolutionSoon') {
                await this.markEvolutionNudgeSent(gameData);
            }
            if (slot === 'streakBroken' || slot === 'dormant' || slot === 'dormantHarsh') {
                this.markDormancyNudgeSent(gameData, slot);
            }
        } else if (pushResult.failed > 0) {
            console.warn(`Push nudge (${slot}/${pushCategory}) could not be delivered to ${user.email}.`);
        }
    }

    /**
     * Sunday-morning leaderboard stagnation check. Uses the real Firestore
     * league rank (see leaderboard.service.ts) rather than a fake number -
     * fires the 'leaderboard' category if the user's rank hasn't improved
     * since last Sunday, and always records this Sunday's rank for next
     * week's comparison. Falls back to the normal morning category if the
     * Firestore lookup fails or the user has no league yet.
     */
    private static async resolveSundayCategory(
        gameData: IUserGameData,
        leagueName: string,
        streakCount: number,
        localDateStr: string,
        dayOfWeek: number
    ): Promise<PushCategory> {
        const fallback = this.selectPushCategory('morning', gameData.dailyMissions.completed, localDateStr, dayOfWeek, streakCount);

        const rankResult = await getUserLeagueRank(gameData.userId.toString(), leagueName);
        if (!rankResult) return fallback;

        const profile = (gameData.profile || {}) as Record<string, any>;
        const lastWeekRank: number | undefined = profile.lastWeekRank;

        profile.lastWeekRank = rankResult.rank;
        gameData.profile = profile;
        gameData.markModified('profile');

        if (typeof lastWeekRank === 'number' && rankResult.rank <= lastWeekRank) {
            // Held or improved rank - no need for a stagnation nudge.
            return fallback;
        }

        return gameData.dailyMissions.completed ? 'beyondMissions' : 'leaderboard';
    }

    /**
     * Check if a user's leaderboard rank has worsened (i.e. they were surpassed).
     * If so, trigger a surpassed push notification and update their last known rank.
     */
    private static async checkLeaderboardSurpassed(gameData: IUserGameData): Promise<void> {
        const profile = gameData.profile || {};
        const leagueName = profile.league || 'Bronze';
        const rankResult = await getUserLeagueRank(gameData.userId.toString(), leagueName);
        if (!rankResult) return;

        const currentRank = rankResult.rank;
        const lastKnownRank = profile.lastKnownLeaderboardRank;

        // If lastKnownRank is not set, initialize it but don't notify
        if (typeof lastKnownRank !== 'number') {
            profile.lastKnownLeaderboardRank = currentRank;
            gameData.profile = profile;
            gameData.markModified('profile');
            await gameData.save();
            return;
        }

        // If rank number increased, the user went down in rank (got surpassed)
        if (currentRank > lastKnownRank) {
            let rivalName = pickRival();
            try {
                const db = getFirestore();
                const snap = await db
                    .collection('users')
                    .where('league', '==', leagueName)
                    .orderBy('weeklyGain', 'desc')
                    .get();
                if (!snap.empty && snap.docs[currentRank - 2]) {
                    // The user right above us now is at index `currentRank - 2` (since currentRank is 1-indexed)
                    const rivalDoc = snap.docs[currentRank - 2];
                    if (rivalDoc.id !== gameData.userId.toString()) {
                        rivalName = rivalDoc.data()?.name || rivalName;
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch rival name from Firestore:`, err);
            }

            // Clean up the name if it's a full name
            rivalName = getFirstName(rivalName);

            // Send notification
            const user = await User.findById(gameData.userId);
            if (user) {
                const partnerName = gameData.activeCreature?.name || 'your Auramon';
                const firstName = getFirstName(user.name);

                const token = jwt.sign(
                    { userId: user._id.toString(), email: user.email, purpose: 'push-nudge' },
                    config.jwt.accessTokenSecret,
                    { expiresIn: '7d' }
                );
                const deepLink = `${config.appUrl}?token=${token}`;

                const pushContent = renderPushTemplate(pickRandomTemplate('surpassed'), {
                    firstName,
                    partnerName,
                    streakCount: (gameData.profile as any)?.dailyStreak ?? gameData.currentStreak ?? 0,
                    rival: rivalName,
                    leagueName,
                    levelsToEvolve: 0,
                    daysInactive: 0
                });

                const pushResult = await sendNotificationToUser(user._id.toString(), {
                    title: pushContent.title,
                    body: pushContent.body,
                    url: deepLink,
                });

                if (pushResult.sent > 0) {
                    console.log(`🔔 Leaderboard Surpassed push notification sent to ${user.email} (new rank: ${currentRank}, old rank: ${lastKnownRank}, rival: ${rivalName}).`);
                }
            }
        }

        // Update the last known rank to the current one
        if (currentRank !== lastKnownRank) {
            profile.lastKnownLeaderboardRank = currentRank;
            gameData.profile = profile;
            gameData.markModified('profile');
            await gameData.save();
        }
    }

    private static async markEvolutionNudgeSent(gameData: IUserGameData): Promise<void> {
        const profile = (gameData.profile || {}) as Record<string, any>;
        profile.lastEvolutionNudgeLevel = gameData.activeCreature.level;
        gameData.profile = profile;
        gameData.markModified('profile');
    }

    private static markDormancyNudgeSent(gameData: IUserGameData, tier: 'streakBroken' | 'dormant' | 'dormantHarsh'): void {
        const profile = (gameData.profile || {}) as Record<string, any>;
        profile.lastDormancyNudgeTier = tier;
        gameData.profile = profile;
        gameData.markModified('profile');
    }
}

function userIdStr(gameData: IUserGameData): string {
    return gameData.userId.toString();
}

// User.name is a full display name (Google OAuth or local signup) - pull
// just the first token for a more personal {FIRST_NAME} in push copy.
function getFirstName(fullName: string): string {
    const trimmed = (fullName || '').trim();
    if (!trimmed) return 'there';
    return trimmed.split(/\s+/)[0];
}
