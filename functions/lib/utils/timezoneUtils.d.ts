/**
 * Timezone Utilities
 *
 * Handles timezone-aware scheduling for sending emails at specific local times.
 * Finds users whose local time matches the target hour.
 */
/**
 * Get all timezones currently at a specific hour (UTC)
 * Example: If UTC hour is 13 and we want 8 AM, this returns timezones UTC-5 (EST)
 */
export declare function getTimezonesForLocalHour(targetLocalHour: number, currentUTCHour: number): string[];
/**
 * Check if user is currently at a specific local time
 */
export declare function isUserAtLocalTime(userTimezone: string, targetLocalHour: number, currentUTCHour: number): boolean;
/**
 * Get a user's local hour given UTC time
 */
export declare function getUserLocalHour(userTimezone: string, utcHour: number): number;
/**
 * Convert UTC time to user's local time
 */
export declare function convertUTCToLocal(date: Date, userTimezone: string): Date;
/**
 * Get current UTC hour
 */
export declare function getCurrentUTCHour(): number;
/**
 * Format time for logging
 */
export declare function formatTimeLog(hour: number): string;
/**
 * Validate timezone format
 */
export declare function isValidTimezone(timezone: string): boolean;
/**
 * Get all supported timezones
 */
export declare function getSupportedTimezones(): string[];
//# sourceMappingURL=timezoneUtils.d.ts.map