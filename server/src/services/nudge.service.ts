import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import UserGameData from '../models/UserGameData';
import { User } from '../models/User';
import { generateGuardianCopy } from '../shared/generateGuardianCopy';
import { CreatureType, NudgeLevel } from '../shared/guardianPersonalities';

if (config.sendgrid.apiKey) {
    sgMail.setApiKey(config.sendgrid.apiKey);
} else {
    console.warn('⚠️ SENDGRID_API_KEY is not configured. Nudge emails will be logged to the console instead of sent.');
}

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
     * Process hourly checks across all active users.
     */
    static async processHourlyNudges(): Promise<void> {
        console.log(`[${new Date().toISOString()}] Starting hourly nudge sweep...`);
        try {
            // Find all game records where email notifications are enabled
            const records = await UserGameData.find({ 'emailNotifications.enabled': true });
            console.log(`Found ${records.length} users with email notifications enabled.`);

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
                let isPrefEnabled = false;

                if (localHour === 8) {
                    level = 'morning';
                    isPrefEnabled = gameData.emailNotifications.morning === true;
                } else if (localHour === 14) {
                    level = 'afternoon';
                    isPrefEnabled = gameData.emailNotifications.afternoon === true;
                } else if (localHour === 20) {
                    level = 'evening';
                    isPrefEnabled = gameData.emailNotifications.evening === true;
                }

                if (!level || !isPrefEnabled) {
                    // Not a nudge hour, or the user disabled this nudge tier
                    continue;
                }

                // 4. Rate-limit to prevent double nudging in the same hour
                const now = new Date();
                const lastNudgeTime = gameData.dailyMissions.lastNudgeSentAt;
                if (lastNudgeTime && (now.getTime() - lastNudgeTime.getTime() < 50 * 60 * 1000)) {
                    console.log(`Skip user ${gameData.userId}: nudge already sent in the last 50 minutes.`);
                    continue;
                }

                // 5. Fetch User details for email & name
                const user = await User.findById(gameData.userId);
                if (!user) {
                    console.warn(`User document not found for user ID: ${gameData.userId}`);
                    continue;
                }

                // 6. Generate deep link autologin token
                const token = jwt.sign(
                    { userId: user._id.toString(), email: user.email, purpose: 'email-nudge' },
                    config.jwt.accessTokenSecret,
                    { expiresIn: '7d' }
                );
                const deepLink = `${config.appUrl}?token=${token}`;

                // 7. Generate Guardian Copy
                const copy = generateGuardianCopy({
                    guardianType: (gameData.activeCreature.type as CreatureType) || 'Fire',
                    guardianName: gameData.activeCreature.name || 'Guardian',
                    nudgeLevel: level,
                    userName: user.name || 'Adventurer',
                    currentStreak: gameData.currentStreak || 0,
                    deepLink
                });

                // 8. Dispatch Email via SendGrid or log
                const emailHtml = copy.body;
                const emailText = copy.body.replace(/<[^>]*>/g, ''); // Basic HTML stripper

                if (config.sendgrid.apiKey) {
                    try {
                        await sgMail.send({
                            to: user.email,
                            from: config.sendgrid.fromEmail,
                            subject: copy.subject,
                            html: emailHtml,
                            text: emailText
                        });
                        console.log(`✉️ Email nudge (${level}) sent to ${user.email} from ${gameData.activeCreature.name} (${gameData.activeCreature.type})`);
                    } catch (error) {
                        console.error(`Failed to send email nudge to ${user.email} via SendGrid:`, error);
                        continue;
                    }
                } else {
                    console.log(`[MOCK EMAIL NUDGE]
To: ${user.email}
From: ${config.sendgrid.fromEmail}
Subject: ${copy.subject}
Body:
---------------------------------------------
${emailText}
---------------------------------------------`);
                }

                // 9. Update Database stats
                gameData.dailyMissions.nudgesSent = Math.min(3, gameData.dailyMissions.nudgesSent + 1);
                gameData.dailyMissions.lastNudgeSentAt = new Date();
                gameData.metrics.emailsSent += 1;
                await gameData.save();

                nudgesSentCount++;
            }

            console.log(`[${new Date().toISOString()}] Hourly nudge sweep finished. Dispatched ${nudgesSentCount} nudges.`);
        } catch (error) {
            console.error('Error processing hourly nudges:', error);
        }
    }
}
