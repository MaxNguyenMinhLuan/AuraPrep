import jwt from 'jsonwebtoken';
import { config } from '../config';
import UserGameData from '../models/UserGameData';
import { User } from '../models/User';
import { NudgeLevel } from '../shared/guardianPersonalities';
import { PushSubscription } from '../models/PushSubscription';
import { sendNotificationToUser } from './push.service';
import { PushCategory, pickRandomTemplate, pickRival, renderPushTemplate } from '../shared/pushNotificationTemplates';

export class NudgeService {
    /**
     * Parse the local hour and local date string in the user's timezone.
     */
    static getLocalTimeInfo(timezone: string): { localHour: number; localDateStr: string } {
        const targetTimezone = timezone || 'America/New_York';
        try {
            const hourOptions = { timeZone: targetTimezone, hour: 'numeric', hour12: false } as const;
            const hourFormatter = new Intl.DateTimeFormat('en-US', hourOptions);
            const localHour = parseInt(hourFormatter.format(new Date()), 10);

            const dateOptions = { timeZone: targetTimezone, year: 'numeric', month: '2-digit', day: '2-digit' } as const;
            const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
            const parts = dateFormatter.formatToParts(new Date());
            const year = parts.find(p => p.type === 'year')?.value;
            const month = parts.find(p => p.type === 'month')?.value;
            const day = parts.find(p => p.type === 'day')?.value;
            const localDateStr = `${year}-${month}-${day}`;

            return { localHour, localDateStr };
        } catch (error) {
            console.error(`Error calculating local time for timezone: ${targetTimezone}. Falling back to America/New_York:`, error);
            // Fallback to America/New_York
            try {
                const hourOptions = { timeZone: 'America/New_York', hour: 'numeric', hour12: false } as const;
                const hourFormatter = new Intl.DateTimeFormat('en-US', hourOptions);
                const localHour = parseInt(hourFormatter.format(new Date()), 10);

                const dateOptions = { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
                const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
                const parts = dateFormatter.formatToParts(new Date());
                const year = parts.find(p => p.type === 'year')?.value;
                const month = parts.find(p => p.type === 'month')?.value;
                const day = parts.find(p => p.type === 'day')?.value;
                const localDateStr = `${year}-${month}-${day}`;

                return { localHour, localDateStr };
            } catch {
                const now = new Date();
                return {
                    localHour: now.getHours(),
                    localDateStr: now.toISOString().split('T')[0]
                };
            }
        }
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
     * Decide which push-notification category to pull from for this send.
     * Morning leans on the daily-missions set, afternoon on aura-farming,
     * evening on the streak-at-risk set (or leaderboard on Sundays, ahead of
     * the weekly league reset) - falling back to daily-missions whenever the
     * more specific category wouldn't make sense (e.g. no streak to lose).
     */
    static selectPushCategory(level: NudgeLevel, localDateStr: string, streakCount: number): PushCategory {
        if (level === 'evening') {
            const dayOfWeek = new Date(`${localDateStr}T12:00:00Z`).getUTCDay(); // 0 = Sunday
            if (dayOfWeek === 0) return 'leaderboard';
            if (streakCount > 0) return 'streak';
            return 'dailyMissions';
        }
        if (level === 'afternoon') return 'auraFarming';
        return 'dailyMissions';
    }

    /**
     * Process hourly checks across all active users. Push is the only nudge
     * channel - a saved Web Push subscription is the only opt-in a user needs.
     */
    static async processHourlyNudges(): Promise<void> {
        console.log(`[${new Date().toISOString()}] Starting hourly nudge sweep...`);
        try {
            const pushUserIds = await PushSubscription.distinct('userId');
            const records = await UserGameData.find({ userId: { $in: pushUserIds } });
            console.log(`Found ${records.length} users with an active push subscription.`);

            let nudgesSentCount = 0;

            for (const gameData of records) {
                const timezone = gameData.timezone || 'America/New_York';
                const { localHour, localDateStr } = this.getLocalTimeInfo(timezone);

                // 1. Check for day rollover in the user's local timezone
                const localMissionDateStr = this.getLocalDateStrFromDate(gameData.dailyMissions.date, timezone);

                if (localMissionDateStr !== localDateStr) {
                    console.log(`Timezone rollover detected for user ${gameData.userId} (${timezone}). Local: ${localDateStr}, Mission Date: ${localMissionDateStr}. Resetting daily mission...`);
                    gameData.dailyMissions.date = new Date();
                    gameData.dailyMissions.completed = false;
                    gameData.dailyMissions.nudgesSent = 0;
                    gameData.dailyMissions.lastNudgeSentAt = undefined;
                    await gameData.save();
                }

                // 2. If the user has already completed their mission today, skip
                if (gameData.dailyMissions.completed) {
                    continue;
                }

                // 3. Determine if the current local hour is a nudge target: 8 (Morning), 14 (Afternoon), or 20 (Evening)
                let level: NudgeLevel | null = null;
                if (localHour === 8) level = 'morning';
                else if (localHour === 14) level = 'afternoon';
                else if (localHour === 20) level = 'evening';

                if (!level) {
                    continue;
                }

                // 4. Rate-limit to prevent double nudging in the same hour
                const now = new Date();
                const lastNudgeTime = gameData.dailyMissions.lastNudgeSentAt;
                if (lastNudgeTime && (now.getTime() - lastNudgeTime.getTime() < 50 * 60 * 1000)) {
                    console.log(`Skip user ${gameData.userId}: nudge already sent in the last 50 minutes.`);
                    continue;
                }

                // 5. Fetch User details for the deep link
                const user = await User.findById(gameData.userId);
                if (!user) {
                    console.warn(`User document not found for user ID: ${gameData.userId}`);
                    continue;
                }

                // 6. Generate deep link autologin token
                const token = jwt.sign(
                    { userId: user._id.toString(), email: user.email, purpose: 'push-nudge' },
                    config.jwt.accessTokenSecret,
                    { expiresIn: '7d' }
                );
                const deepLink = `${config.appUrl}?token=${token}`;

                // 7. Pick a category + template and render it with the user's real state
                const streakCount = (gameData.profile as any)?.dailyStreak ?? 0;
                const leagueName = (gameData.profile as any)?.league ?? 'Bronze';
                const pushCategory = this.selectPushCategory(level, localDateStr, streakCount);
                const pushContent = renderPushTemplate(pickRandomTemplate(pushCategory), {
                    partnerName: gameData.activeCreature?.name || 'your Auramon',
                    streakCount,
                    rival: pickRival(),
                    leagueName,
                });

                const pushResult = await sendNotificationToUser(user._id.toString(), {
                    title: pushContent.title,
                    body: pushContent.body,
                    url: deepLink,
                });

                if (pushResult.sent > 0) {
                    console.log(`🔔 Push nudge (${level}/${pushCategory}) sent to ${user.email} on ${pushResult.sent} device(s).`);
                } else if (pushResult.failed > 0) {
                    console.warn(`Push nudge (${level}/${pushCategory}) could not be delivered to ${user.email}.`);
                }

                // 8. Update Database stats
                gameData.dailyMissions.nudgesSent = Math.min(3, gameData.dailyMissions.nudgesSent + 1);
                gameData.dailyMissions.lastNudgeSentAt = new Date();
                await gameData.save();

                nudgesSentCount++;
            }

            console.log(`[${new Date().toISOString()}] Hourly nudge sweep finished. Dispatched ${nudgesSentCount} nudges.`);
        } catch (error) {
            console.error('Error processing hourly nudges:', error);
        }
    }
}
