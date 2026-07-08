/**
 * Guardian Copy Generation
 *
 * Generates personalized email copy based on Guardian type and escalation level.
 * This is shared between backend (Cloud Functions) and frontend.
 */

import { CreatureType, NudgeLevel, getNudgeTemplate } from './guardianPersonalities';

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
export function generateGuardianCopy(options: GuardianCopyOptions): GeneratedCopy {
  const {
    guardianType,
    guardianName,
    nudgeLevel,
    userName,
    currentStreak,
    deepLink
  } = options;

  try {
    const template = getNudgeTemplate(guardianType, nudgeLevel);

    if (!template) {
      console.error(`No template found for ${guardianType} at ${nudgeLevel}`);
      return getDefaultCopy(userName, currentStreak, deepLink);
    }

    // Replace template variables
    const subject = template.subject
      .replace('{{guardianName}}', guardianName)
      .replace('{{userName}}', userName)
      .replace('{{currentStreak}}', currentStreak.toString());

    const preview = template.preview
      .replace('{{guardianName}}', guardianName)
      .replace('{{userName}}', userName)
      .replace('{{currentStreak}}', currentStreak.toString());

    const body = template.body
      .replace(/{{guardianName}}/g, guardianName)
      .replace(/{{userName}}/g, userName)
      .replace(/{{currentStreak}}/g, currentStreak.toString())
      .replace(/{{deepLink}}/g, deepLink);

    return {
      subject,
      preview,
      body
    };
  } catch (error) {
    console.error('Error generating Guardian copy:', error);
    return getDefaultCopy(userName, currentStreak, deepLink);
  }
}

/**
 * Fallback copy for error cases
 */
function getDefaultCopy(userName: string, currentStreak: number, deepLink: string): GeneratedCopy {
  return {
    subject: "Complete Your Daily Mission",
    preview: "Your Guardian is waiting for you...",
    body: `Hi ${userName},

You're on a ${currentStreak}-day streak! Complete one more mission to keep it going.

→ <a href="${deepLink}">Start Mission</a>

Your Guardian`
  };
}

/**
 * Validate if a guardian type is valid
 */
export function isValidGuardianType(type: string): type is CreatureType {
  const validTypes: CreatureType[] = ['Fire', 'Water', 'Leaf', 'Electric', 'Wind', 'Metal', 'Light', 'Dark'];
  return validTypes.includes(type as CreatureType);
}

/**
 * Validate if a nudge level is valid
 */
export function isValidNudgeLevel(level: string): level is NudgeLevel {
  const validLevels: NudgeLevel[] = ['morning', 'afternoon', 'evening'];
  return validLevels.includes(level as NudgeLevel);
}
