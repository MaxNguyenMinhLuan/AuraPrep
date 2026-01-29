/**
 * Guardian Copy Generation
 *
 * Generates personalized email copy based on Guardian type and escalation level.
 * This is shared between backend (Cloud Functions) and frontend.
 */
import { CreatureType, NudgeLevel } from './guardianPersonalities';
interface GuardianCopyOptions {
    guardianType: CreatureType;
    guardianName: string;
    nudgeLevel: NudgeLevel;
    userName: string;
    currentStreak: number;
    deepLink: string;
}
interface GeneratedCopy {
    subject: string;
    preview: string;
    body: string;
}
/**
 * Generate personalized email copy for a Guardian nudge
 */
export declare function generateGuardianCopy(options: GuardianCopyOptions): GeneratedCopy;
/**
 * Validate if a guardian type is valid
 */
export declare function isValidGuardianType(type: string): type is CreatureType;
/**
 * Validate if a nudge level is valid
 */
export declare function isValidNudgeLevel(level: string): level is NudgeLevel;
export {};
//# sourceMappingURL=generateGuardianCopy.d.ts.map