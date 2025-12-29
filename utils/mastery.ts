
import { SubtopicStat, SkillLevel, Difficulty } from '../types';

export const SKILL_LEVELS: SkillLevel[] = ['Easy', 'Medium', 'Hard', 'Master'];

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
 * @param level - The skill level.
 * @returns The difficulty level.
 */
export const getDifficultyForLevel = (level: SkillLevel): Difficulty => {
    switch (level) {
        case 'Easy': return 'Easy';
        case 'Medium': return 'Medium';
        case 'Hard': return 'Hard';
        case 'Master': return 'Extra Hard'; 
        default: return 'Easy';
    }
};

/**
 * Gets the next skill level in the progression.
 * @param currentLevel - The current skill level.
 * @returns The next SkillLevel, or null if already at Master.
 */
export const getNextLevel = (currentLevel: SkillLevel): SkillLevel | null => {
    const currentIndex = SKILL_LEVELS.indexOf(currentLevel);
    if (currentIndex >= 0 && currentIndex < SKILL_LEVELS.length - 1) {
        return SKILL_LEVELS[currentIndex + 1];
    }
    return null; // Master level is the highest
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
