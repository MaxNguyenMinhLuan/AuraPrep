/**
 * Timezone Utilities
 *
 * Handles timezone-aware scheduling for sending emails at specific local times.
 * Finds users whose local time matches the target hour.
 */

interface TimezoneOffset {
  timezone: string;
  offset: number; // Hours from UTC
}

/**
 * Map of common timezone names to UTC offsets
 * Note: This is simplified and doesn't account for daylight saving time.
 * In production, use a library like moment-timezone for accurate handling.
 */
const TIMEZONE_MAP: Record<string, number> = {
  // US Timezones
  'America/New_York': -5,           // EST
  'America/Chicago': -6,            // CST
  'America/Denver': -7,             // MST
  'America/Los_Angeles': -8,        // PST
  'America/Anchorage': -9,          // AKST
  'America/Honolulu': -10,          // HST

  // UTC
  'UTC': 0,
  'Etc/UTC': 0,

  // Europe
  'Europe/London': 0,               // GMT
  'Europe/Paris': 1,                // CET
  'Europe/Berlin': 1,               // CET
  'Europe/Moscow': 3,               // MSK
  'Europe/Istanbul': 3,             // EET

  // Asia
  'Asia/Dubai': 4,                  // GST
  'Asia/Kolkata': 5.5,              // IST (includes half-hour)
  'Asia/Bangkok': 7,                // ICT
  'Asia/Shanghai': 8,               // CST
  'Asia/Hong_Kong': 8,              // HKT
  'Asia/Tokyo': 9,                  // JST
  'Asia/Seoul': 9,                  // KST
  'Asia/Singapore': 8,              // SGT

  // Australia
  'Australia/Sydney': 10,           // AEST (simplified, doesn't account for DST)
  'Australia/Melbourne': 10,        // AEST
  'Australia/Perth': 8,             // AWST

  // Other
  'Pacific/Auckland': 12,           // NZST
};

/**
 * Get all timezones currently at a specific hour (UTC)
 * Example: If UTC hour is 13 and we want 8 AM, this returns timezones UTC-5 (EST)
 */
export function getTimezonesForLocalHour(
  targetLocalHour: number,
  currentUTCHour: number
): string[] {
  // Calculate the UTC offset needed
  const offsetNeeded = (targetLocalHour - currentUTCHour + 24) % 24;

  // Find all timezones with this offset (accounting for floating-point for half-hour offsets)
  const matchingTimezones: string[] = [];

  for (const [timezone, offset] of Object.entries(TIMEZONE_MAP)) {
    const normalizedOffset = Math.round(offset * 2) / 2; // Handle .5 offsets
    const normalizedNeeded = Math.round(offsetNeeded * 2) / 2;

    if (normalizedOffset === normalizedNeeded) {
      matchingTimezones.push(timezone);
    }
  }

  return matchingTimezones;
}

/**
 * Check if user is currently at a specific local time
 */
export function isUserAtLocalTime(userTimezone: string, targetLocalHour: number, currentUTCHour: number): boolean {
  const userOffset = TIMEZONE_MAP[userTimezone];

  if (userOffset === undefined) {
    console.warn(`Unknown timezone: ${userTimezone}`);
    return false;
  }

  // Calculate user's local hour
  const userLocalHour = (currentUTCHour + userOffset + 24) % 24;

  return userLocalHour === targetLocalHour;
}

/**
 * Get a user's local hour given UTC time
 */
export function getUserLocalHour(userTimezone: string, utcHour: number): number {
  const userOffset = TIMEZONE_MAP[userTimezone];

  if (userOffset === undefined) {
    console.warn(`Unknown timezone: ${userTimezone}`);
    return utcHour;
  }

  return (utcHour + userOffset + 24) % 24;
}

/**
 * Convert UTC time to user's local time
 */
export function convertUTCToLocal(date: Date, userTimezone: string): Date {
  const userOffset = TIMEZONE_MAP[userTimezone];

  if (userOffset === undefined) {
    console.warn(`Unknown timezone: ${userTimezone}`);
    return date;
  }

  // Create a new date adjusted for timezone
  const localDate = new Date(date.getTime() + userOffset * 60 * 60 * 1000);
  return localDate;
}

/**
 * Get current UTC hour
 */
export function getCurrentUTCHour(): number {
  return new Date().getUTCHours();
}

/**
 * Format time for logging
 */
export function formatTimeLog(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}

/**
 * Validate timezone format
 */
export function isValidTimezone(timezone: string): boolean {
  return timezone in TIMEZONE_MAP;
}

/**
 * Get all supported timezones
 */
export function getSupportedTimezones(): string[] {
  return Object.keys(TIMEZONE_MAP).sort();
}
