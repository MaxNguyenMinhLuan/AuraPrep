
import { SubtopicStat, SkillLevel, Difficulty, UserPreferences } from '../types';
import { ACTIVE_QUESTION_BANK } from '../constants';
import { SKILL_TAXONOMY_MAP_V2 } from '../data/skillTaxonomy.v2';

export const SKILL_LEVELS: SkillLevel[] = ['Easy', 'Medium', 'Hard', 'Master'];

const ALL_DIFFICULTY_TIERS: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Extra Hard'];

/**
 * The real difficulty tiers a given skill actually has. Under the v1 bank
 * every subtopic has all four (today's behavior, unchanged). Under v2 it's
 * looked up from the finalized skill taxonomy — not every skill spans
 * Easy through Master (e.g. Trigonometry is Hard-only). 'Extra Hard' is
 * included whenever 'Hard' is: it's an AuraPrep-only stretch tier layered
 * on top of Hard for Master-level users, not a distinct real-SAT tier, so
 * it isn't stored separately in the taxonomy data.
 */
export const getAvailableDifficulties = (skillId: string): Difficulty[] => {
    if (ACTIVE_QUESTION_BANK !== 'v2') return ALL_DIFFICULTY_TIERS;
    const skill = SKILL_TAXONOMY_MAP_V2[skillId];
    if (!skill) return ALL_DIFFICULTY_TIERS; // unknown id — fail open rather than lock a skill out
    const tiers = [...skill.availableDifficulties];
    if (tiers.includes('Hard') && !tiers.includes('Extra Hard')) tiers.push('Extra Hard');
    return tiers;
};

/**
 * The highest SkillLevel a given skill can actually progress to. A skill
 * with no Hard tier (e.g. R/W: Central Ideas) caps at 'Medium' — there's no
 * real Hard or Master content to advance into.
 */
export const getSkillCeiling = (skillId: string): SkillLevel => {
    const tiers = getAvailableDifficulties(skillId);
    if (tiers.includes('Extra Hard')) return 'Master';
    if (tiers.includes('Hard')) return 'Hard';
    if (tiers.includes('Medium')) return 'Medium';
    return 'Easy';
};

/**
 * Gets the numerical progress percentage for a given skill level for UI display.
 * @param level - The skill level.
 * @returns A percentage (25, 50, 75, or 100).
 */
export const getSkillProgress = (level: SkillLevel): number => {
    switch (level) {
        case 'Easy': return 25;
        case 'Medium': return 50;
        case 'Hard': return 75;
        case 'Master': return 100;
        default: return 0;
    }
};

/**
 * Determines the appropriate question difficulty for a given skill level.
 * Used for both boss fights and practice sessions.
 *
 * When skillId is provided, the level is clamped to that skill's actual
 * ceiling (see getSkillCeiling) — this does not rewrite the user's stored
 * SubtopicStat.level, it only affects which difficulty gets requested.
 *
 * When preferences.skipEasyQuestions is on, an 'Easy' result is floored up
 * to the lowest tier at/above Medium that the skill actually has (a skill
 * that's already Medium-only or Hard-only is unaffected).
 */
export const getDifficultyForLevel = (
    level: SkillLevel,
    skillId?: string,
    preferences?: UserPreferences
): Difficulty => {
    let effectiveLevel = level;
    if (skillId) {
        const ceiling = getSkillCeiling(skillId);
        if (SKILL_LEVELS.indexOf(level) > SKILL_LEVELS.indexOf(ceiling)) {
            effectiveLevel = ceiling;
        }
    }

    let difficulty: Difficulty;
    switch (effectiveLevel) {
        case 'Easy': difficulty = 'Easy'; break;
        case 'Medium': difficulty = 'Medium'; break;
        case 'Hard': difficulty = 'Hard'; break;
        case 'Master': difficulty = 'Extra Hard'; break;
        default: difficulty = 'Easy';
    }

    if (preferences?.skipEasyQuestions && difficulty === 'Easy') {
        const available = skillId ? getAvailableDifficulties(skillId) : ALL_DIFFICULTY_TIERS;
        const flooredCandidates: Difficulty[] = ['Medium', 'Hard', 'Extra Hard'];
        const floored = flooredCandidates.find(d => available.includes(d));
        if (floored) difficulty = floored;
    }

    return difficulty;
};

/**
 * Gets the next skill level in the progression, clamped to the skill's own
 * ceiling when skillId is provided (e.g. a Medium-ceiling skill returns
 * null once already at Medium, not just at Master).
 * @param currentLevel - The current skill level.
 * @param skillId - Optional skill id to clamp progression to its real ceiling.
 * @returns The next SkillLevel, or null if already at the ceiling.
 */
export const getNextLevel = (currentLevel: SkillLevel, skillId?: string): SkillLevel | null => {
    const ceiling = skillId ? getSkillCeiling(skillId) : 'Master';
    const currentIndex = SKILL_LEVELS.indexOf(currentLevel);
    const ceilingIndex = SKILL_LEVELS.indexOf(ceiling);
    if (currentIndex >= 0 && currentIndex < ceilingIndex) {
        return SKILL_LEVELS[currentIndex + 1];
    }
    return null; // already at this skill's ceiling
};

/**
 * Gets the number of correct answers required to pass a boss fight for the current level.
 * @param currentLevel - The current skill level of the user for a subtopic.
 * @returns The number of correct answers needed (8 or 9).
 */
export const getBossFightRequirement = (currentLevel: SkillLevel): number => {
    if (currentLevel === 'Hard') {
        return 9; // Hard -> Master requires 9/10 correct
    }
    return 8; // Easy -> Medium and Medium -> Hard require 8/10
};
