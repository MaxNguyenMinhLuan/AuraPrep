/**
 * Stealth Mission Service
 *
 * Generates missions that integrate with the stealth diagnostic system.
 * Creates the "Welcome Mission" (seed mission) and adapts regular missions
 * based on the user's skill profile.
 */

import { MissionInstance, DailyMission, Question, Difficulty } from '../types';
import {
    UserSkillProfile,
    DifficultyTier,
    QuestionAnswerRecord,
    HIGH_IMPACT_CATEGORIES,
    DEFAULT_SEED_MISSION_CONFIG,
} from '../types/stealthDiagnostic';
import {
    getUserSkillProfile,
    saveUserSkillProfile,
    processStealthAnswer,
    getRecommendedDifficulty,
    completeSeedMission,
    isStealthPlacementComplete,
    getSeedMissionSubtopics,
} from './stealthDiagnosticService';
import { generateSatQuestion } from './questionService';
import { SUBTOPICS } from '../constants';

// Seed mission ID constant
export const SEED_MISSION_ID = 'welcome-mission';

/**
 * Create the seed mission for stealth diagnostic
 * This is the "Welcome Mission" that appears as the user's first mission
 */
export function createSeedMission(): DailyMission {
    return {
        id: SEED_MISSION_ID,
        title: 'Welcome Mission',
        description: 'Begin your SAT journey with a warm-up challenge!',
        subtopic: 'Mixed', // Special indicator for mixed subtopics
        questionCount: DEFAULT_SEED_MISSION_CONFIG.questionCount,
        reward: 150, // Generous reward to encourage completion
        xp: 50,
    };
}

/**
 * Generate questions for the seed mission
 * Selects from high-impact categories at Medium difficulty
 */
export async function generateSeedMissionQuestions(): Promise<Question[]> {
    const subtopics = getSeedMissionSubtopics(DEFAULT_SEED_MISSION_CONFIG.questionCount);
    const questions: Question[] = [];

    for (const subtopic of subtopics) {
        try {
            const questionData = await generateSatQuestion(subtopic, 'Medium');
            questions.push({
                ...questionData,
                subtopic,
            });
        } catch (error) {
            console.error(`Failed to generate question for ${subtopic}:`, error);
            // Generate a fallback question
            questions.push({
                question: `Practice question for ${subtopic}`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                answerIndex: 0,
                explanation: 'This is a placeholder question.',
                subtopic,
                hasGraphic: false,
            });
        }
    }

    return questions;
}

/**
 * Convert DifficultyTier to Difficulty type for question generation
 */
function tierToDifficulty(tier: DifficultyTier): Difficulty {
    switch (tier) {
        case 'Easy': return 'Easy';
        case 'Medium': return 'Medium';
        case 'Hard': return 'Hard';
        default: return 'Medium';
    }
}

/**
 * Generate an adaptive mission based on user's skill profile
 * Selects subtopics that need work and appropriate difficulty
 */
export async function generateAdaptiveMission(
    uid: string,
    missionId: string,
    title: string,
    questionCount: number = 5
): Promise<MissionInstance> {
    const userProfile = getUserSkillProfile(uid);
    const questions: Question[] = [];

    // Select subtopics that need practice (low confidence or not yet assessed)
    const subtopicsToTarget = selectSubtopicsForPractice(userProfile, questionCount);

    for (const subtopic of subtopicsToTarget) {
        const difficulty = getRecommendedDifficulty(userProfile, subtopic);
        try {
            const questionData = await generateSatQuestion(subtopic, tierToDifficulty(difficulty));
            questions.push({
                ...questionData,
                subtopic,
            });
        } catch (error) {
            console.error(`Failed to generate question for ${subtopic}:`, error);
        }
    }

    // Calculate reward based on average difficulty
    const avgDifficulty = calculateAverageDifficulty(userProfile, subtopicsToTarget);
    const baseReward = 50;
    const difficultyMultiplier = avgDifficulty === 'Hard' ? 1.5 : avgDifficulty === 'Medium' ? 1.2 : 1;

    return {
        id: missionId,
        title,
        description: `Practice ${questionCount} SAT questions`,
        subtopic: subtopicsToTarget[0] || 'Mixed',
        questionCount: questions.length,
        reward: Math.round(baseReward * difficultyMultiplier * questions.length / 5),
        xp: questions.length * 5,
        completed: false,
        progress: 0,
        correctAnswers: 0,
        questions,
    };
}

/**
 * Select subtopics that need practice based on user's profile
 */
function selectSubtopicsForPractice(
    userProfile: UserSkillProfile,
    count: number
): string[] {
    const subtopicScores: { subtopic: string; score: number }[] = [];

    for (const subtopic of SUBTOPICS) {
        const profile = userProfile.subtopics[subtopic];
        let score = 50; // Base score for unassessed subtopics

        if (profile) {
            // Lower confidence = higher priority for practice
            score = 100 - profile.confidenceScore;

            // Boost priority for topics with few attempts
            if (profile.totalAttempted < 5) {
                score += 20;
            }

            // Boost priority for inferred topics (need verification)
            if (profile.isInferred) {
                score += 15;
            }

            // Slight boost for topics with low accuracy
            if (profile.accuracyRatio < 0.5 && profile.totalAttempted >= 3) {
                score += 10;
            }
        }

        subtopicScores.push({ subtopic, score });
    }

    // Sort by score (highest priority first) and add some randomness
    subtopicScores.sort((a, b) => {
        // Add random factor to avoid always picking the same topics
        const randomFactor = (Math.random() - 0.5) * 20;
        return (b.score + randomFactor) - (a.score + randomFactor);
    });

    return subtopicScores.slice(0, count).map(s => s.subtopic);
}

/**
 * Calculate average difficulty for selected subtopics
 */
function calculateAverageDifficulty(
    userProfile: UserSkillProfile,
    subtopics: string[]
): DifficultyTier {
    let totalScore = 0;
    for (const subtopic of subtopics) {
        const tier = getRecommendedDifficulty(userProfile, subtopic);
        totalScore += tier === 'Hard' ? 3 : tier === 'Medium' ? 2 : 1;
    }
    const avg = totalScore / subtopics.length;
    if (avg >= 2.5) return 'Hard';
    if (avg >= 1.5) return 'Medium';
    return 'Easy';
}

/**
 * Track answer timing for a mission question
 */
let questionStartTime: number = 0;

export function startQuestionTimer(): void {
    questionStartTime = Date.now();
}

export function getQuestionTime(): number {
    if (questionStartTime === 0) return 30; // Default if timer wasn't started
    return Math.round((Date.now() - questionStartTime) / 1000);
}

/**
 * Process an answer during a stealth-tracked mission
 * Updates the user's skill profile based on performance
 */
export function processStealthMissionAnswer(
    uid: string,
    subtopic: string,
    isCorrect: boolean,
    timeToAnswer: number,
    difficulty: DifficultyTier
): void {
    const userProfile = getUserSkillProfile(uid);

    const answerRecord: QuestionAnswerRecord = {
        subtopicId: subtopic,
        isCorrect,
        timeToAnswer,
        difficulty,
        timestamp: Date.now(),
    };

    processStealthAnswer(userProfile, answerRecord);
    saveUserSkillProfile(uid, userProfile);
}

/**
 * Mark the seed mission as complete
 * This unlocks the rest of the app features
 */
export function completeSeedMissionForUser(uid: string): void {
    const userProfile = getUserSkillProfile(uid);
    completeSeedMission(userProfile);
    saveUserSkillProfile(uid, userProfile);
}

/**
 * Check if user has completed the stealth placement
 */
export function hasCompletedStealthPlacement(uid: string): boolean {
    const userProfile = getUserSkillProfile(uid);
    return isStealthPlacementComplete(userProfile);
}

/**
 * Get user's current diagnostic phase
 */
export function getUserDiagnosticPhase(uid: string): string {
    const userProfile = getUserSkillProfile(uid);
    return userProfile.diagnosticPhase;
}

/**
 * Generate daily missions that adapt to user's skill level
 * Returns a mix of the seed mission (if not complete) and regular missions
 */
export async function generateDailyMissions(
    uid: string,
    date: string
): Promise<MissionInstance[]> {
    const userProfile = getUserSkillProfile(uid);
    const missions: MissionInstance[] = [];

    // If seed mission not complete, it should be the primary mission
    if (!userProfile.seedMissionCompleted) {
        const seedMission = createSeedMission();
        const questions = await generateSeedMissionQuestions();

        missions.push({
            ...seedMission,
            completed: false,
            progress: 0,
            correctAnswers: 0,
            questions,
        });

        // Add one more smaller mission for variety
        const bonusMission = await generateAdaptiveMission(
            uid,
            `daily-${date}-bonus`,
            'Quick Practice',
            3
        );
        missions.push(bonusMission);
    } else {
        // Regular daily missions for users who completed seed mission
        // Generate 3 missions with varying focus areas

        // Mission 1: Focus on weakest areas
        const weakMission = await generateAdaptiveMission(
            uid,
            `daily-${date}-1`,
            'Skill Builder',
            5
        );
        missions.push(weakMission);

        // Mission 2: Mixed difficulty challenge
        const challengeMission = await generateAdaptiveMission(
            uid,
            `daily-${date}-2`,
            'Daily Challenge',
            5
        );
        missions.push(challengeMission);

        // Mission 3: Quick review
        const reviewMission = await generateAdaptiveMission(
            uid,
            `daily-${date}-3`,
            'Quick Review',
            3
        );
        missions.push(reviewMission);
    }

    return missions;
}

/**
 * Get a summary of the user's skill levels for display
 */
export function getSkillLevelSummary(uid: string): {
    assessed: number;
    easy: number;
    medium: number;
    hard: number;
} {
    const userProfile = getUserSkillProfile(uid);
    let assessed = 0;
    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const subtopic of SUBTOPICS) {
        const profile = userProfile.subtopics[subtopic];
        if (profile && (profile.totalAttempted > 0 || profile.isInferred)) {
            assessed++;
            switch (profile.currentDifficultyTier) {
                case 'Easy': easy++; break;
                case 'Medium': medium++; break;
                case 'Hard': hard++; break;
            }
        }
    }

    return { assessed, easy, medium, hard };
}
