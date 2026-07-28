"use strict";
/**
 * Guardian Copy Generation
 *
 * Generates personalized email copy based on Guardian type and escalation level.
 * This is shared between backend (Cloud Functions) and frontend.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGuardianCopy = generateGuardianCopy;
exports.isValidGuardianType = isValidGuardianType;
exports.isValidNudgeLevel = isValidNudgeLevel;
const guardianPersonalities_1 = require("./guardianPersonalities");
/**
 * Generate personalized email copy for a Guardian nudge
 */
function generateGuardianCopy(options) {
    const { guardianType, guardianName, nudgeLevel, userName, currentStreak, deepLink } = options;
    try {
        const template = (0, guardianPersonalities_1.getNudgeTemplate)(guardianType, nudgeLevel);
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
    }
    catch (error) {
        console.error('Error generating Guardian copy:', error);
        return getDefaultCopy(userName, currentStreak, deepLink);
    }
}
/**
 * Fallback copy for error cases
 */
function getDefaultCopy(userName, currentStreak, deepLink) {
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
function isValidGuardianType(type) {
    const validTypes = ['Fire', 'Water', 'Leaf', 'Electric', 'Wind', 'Metal', 'Light', 'Dark'];
    return validTypes.includes(type);
}
/**
 * Validate if a nudge level is valid
 */
function isValidNudgeLevel(level) {
    const validLevels = ['morning', 'afternoon', 'evening'];
    return validLevels.includes(level);
}
//# sourceMappingURL=generateGuardianCopy.js.map