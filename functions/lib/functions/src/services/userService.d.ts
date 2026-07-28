/**
 * User Service
 *
 * Handles MongoDB queries for user game data.
 * Used by Cloud Functions to fetch and update user information.
 */
interface UserGameData {
    _id?: string;
    userId: string;
    email: string;
    timezone: string;
    dailyMissions: {
        date: Date;
        completed: boolean;
        completedAt?: Date;
        nudgesSent: number;
        lastNudgeSentAt?: Date;
    };
    currentStreak: number;
    longestStreak: number;
    lastCompletionDate?: Date;
    activeCreature: {
        creatureId: number;
        name: string;
        type: string;
        level: number;
    };
    totalQuestionsAnswered: number;
    totalCorrect: number;
    auraBalance: number;
    emailNotifications: {
        enabled: boolean;
        morning: boolean;
        afternoon: boolean;
        evening: boolean;
    };
    metrics: {
        emailsSent: number;
        emailsOpened: number;
        emailsClicked: number;
        conversions: {
            morning: number;
            afternoon: number;
            evening: number;
        };
    };
}
export declare class UserService {
    private db;
    constructor();
    /**
     * Get user's game data by user ID
     */
    getUserGameData(userId: string): Promise<UserGameData | null>;
    /**
     * Get all users who need email nudges at a specific time
     * Filters by timezone and email notification settings
     */
    getUsersForNudge(timezones: string[], nudgeLevel: 'morning' | 'afternoon' | 'evening'): Promise<UserGameData[]>;
    /**
     * Update nudge tracking after sending an email
     */
    updateNudgeSent(userId: string, nudgeLevel: 'morning' | 'afternoon' | 'evening'): Promise<void>;
    /**
     * Update email metrics (opens/clicks)
     */
    updateEmailMetrics(userId: string, metric: 'open' | 'click'): Promise<void>;
    /**
     * Record conversion (mission completed after email nudge)
     */
    recordConversion(userId: string, nudgeType: 'morning' | 'afternoon' | 'evening'): Promise<void>;
    /**
     * Check if user completed their daily mission today
     */
    hasCompletedTodayMission(userId: string): Promise<boolean>;
    /**
     * Get users with unsubscribed emails (for cleanup)
     */
    getUsersWithDisabledNotifications(): Promise<UserGameData[]>;
}
export declare const userService: UserService;
export {};
//# sourceMappingURL=userService.d.ts.map