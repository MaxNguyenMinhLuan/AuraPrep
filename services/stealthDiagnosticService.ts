/**
 * Stealth Diagnostic Service
 *
 * Core service for the hidden assessment system that evaluates users
 * through their daily missions without a formal diagnostic test.
 */

import {
    UserSkillProfile,
    SubtopicSkillProfile,
    DifficultyTier,
    QuestionAnswerRecord,
    StealthAnswerResult,
    TIMING_THRESHOLDS,
    PIVOT_THRESHOLDS,
    CONFIDENCE_THRESHOLDS,
    CROSS_CATEGORY_INFERENCE,
    HIGH_IMPACT_CATEGORIES,
    createInitialSubtopicProfile,
    createInitialUserSkillProfile,
} from '../types/stealthDiagnostic';
import { SUBTOPICS } from '../constants';

// Storage key for user skill profile
const SKILL_PROFILE_KEY = 'auraprep_skill_profile';

/**
 * Get or create user skill profile from localStorage
 */
export function getUserSkillProfile(uid: string): UserSkillProfile {
    const key = `${uid}_${SKILL_PROFILE_KEY}`;
    const stored = localStorage.getItem(key);

    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return createInitialUserSkillProfile();
        }
    }

    return createInitialUserSkillProfile();
}

/**
 * Save user skill profile to localStorage
 */
export function saveUserSkillProfile(uid: string, profile: UserSkillProfile): void {
    const key = `${uid}_${SKILL_PROFILE_KEY}`;
    profile.lastUpdated = Date.now();
    localStorage.setItem(key, JSON.stringify(profile));
}

/**
 * Get or create a subtopic profile within the user's skill profile
 */
export function getSubtopicProfile(
    userProfile: UserSkillProfile,
    subtopicId: string
): SubtopicSkillProfile {
    if (!userProfile.subtopics[subtopicId]) {
        userProfile.subtopics[subtopicId] = createInitialSubtopicProfile(subtopicId);
    }
    return userProfile.subtopics[subtopicId];
}

/**
 * Rapid-Pivot Algorithm
 *
 * Determines difficulty tier adjustment based on recent performance:
 * - Fast-Track (Hard): 3/3 correct + average time < 30s
 * - Safe-Baseline (Medium): 2/3 correct
 * - Foundation-Build (Easy): 0-1/3 correct OR average time > 90s
 */
export function calculateRapidPivot(
    recentAnswers: QuestionAnswerRecord[],
    currentTier: DifficultyTier
): { newTier: DifficultyTier; tierChange: 'promoted' | 'demoted' | 'unchanged' } {
    if (recentAnswers.length < 3) {
        return { newTier: currentTier, tierChange: 'unchanged' };
    }

    // Get the last 3 answers for this subtopic
    const lastThree = recentAnswers.slice(-3);
    const correctCount = lastThree.filter(a => a.isCorrect).length;
    const averageTime = lastThree.reduce((sum, a) => sum + a.timeToAnswer, 0) / 3;

    let newTier: DifficultyTier = currentTier;
    let tierChange: 'promoted' | 'demoted' | 'unchanged' = 'unchanged';

    // Fast-Track to Hard: 3/3 correct AND fast answers
    if (correctCount === PIVOT_THRESHOLDS.FAST_TRACK_CORRECT &&
        averageTime < TIMING_THRESHOLDS.FAST_ANSWER) {
        if (currentTier === 'Easy') {
            newTier = 'Medium';
            tierChange = 'promoted';
        } else if (currentTier === 'Medium') {
            newTier = 'Hard';
            tierChange = 'promoted';
        }
    }
    // Foundation-Build to Easy: 0-1 correct OR struggling (slow answers)
    else if (correctCount <= PIVOT_THRESHOLDS.FOUNDATION_BUILD_CORRECT ||
             averageTime > TIMING_THRESHOLDS.STRUGGLE_TIMER) {
        if (currentTier === 'Hard') {
            newTier = 'Medium';
            tierChange = 'demoted';
        } else if (currentTier === 'Medium') {
            newTier = 'Easy';
            tierChange = 'demoted';
        }
    }
    // Safe-Baseline (Medium): 2/3 correct - maintain or move toward Medium
    else if (correctCount === PIVOT_THRESHOLDS.SAFE_BASELINE_CORRECT) {
        // Keep current tier, but if at extremes, move toward medium
        if (currentTier === 'Hard' && averageTime > TIMING_THRESHOLDS.NORMAL_MAX) {
            newTier = 'Medium';
            tierChange = 'demoted';
        }
    }

    return { newTier, tierChange };
}

/**
 * Update confidence score based on answer result
 */
export function updateConfidenceScore(
    currentConfidence: number,
    isCorrect: boolean,
    timeToAnswer: number,
    currentTier: DifficultyTier
): number {
    let change = 0;

    // Base confidence change
    if (isCorrect) {
        // Faster correct answers give more confidence
        if (timeToAnswer < TIMING_THRESHOLDS.FAST_ANSWER) {
            change = 15; // Fast and correct
        } else if (timeToAnswer < TIMING_THRESHOLDS.NORMAL_MAX) {
            change = 10; // Normal speed and correct
        } else {
            change = 5; // Slow but correct
        }

        // Harder tiers give more confidence
        if (currentTier === 'Hard') change += 5;
        else if (currentTier === 'Easy') change -= 3;
    } else {
        // Wrong answers decrease confidence
        if (timeToAnswer < TIMING_THRESHOLDS.FAST_ANSWER) {
            change = -10; // Fast but wrong (careless?)
        } else if (timeToAnswer > TIMING_THRESHOLDS.STRUGGLE_TIMER) {
            change = -15; // Slow and wrong (struggling)
        } else {
            change = -12; // Normal wrong
        }

        // Easier tiers lose more confidence when wrong
        if (currentTier === 'Easy') change -= 5;
    }

    // Clamp to valid range
    return Math.max(
        CONFIDENCE_THRESHOLDS.MIN_CONFIDENCE,
        Math.min(CONFIDENCE_THRESHOLDS.MAX_CONFIDENCE, currentConfidence + change)
    );
}

/**
 * Process a single answer through the stealth diagnostic system
 */
export function processStealthAnswer(
    userProfile: UserSkillProfile,
    answerRecord: QuestionAnswerRecord
): StealthAnswerResult {
    const subtopicProfile = getSubtopicProfile(userProfile, answerRecord.subtopicId);

    // Update basic stats
    subtopicProfile.totalAttempted += 1;
    if (answerRecord.isCorrect) {
        subtopicProfile.totalCorrect += 1;
        subtopicProfile.consecutiveCorrect += 1;
        subtopicProfile.consecutiveWrong = 0;
    } else {
        subtopicProfile.consecutiveCorrect = 0;
        subtopicProfile.consecutiveWrong += 1;
    }

    // Update accuracy ratio
    subtopicProfile.accuracyRatio = subtopicProfile.totalCorrect / subtopicProfile.totalAttempted;

    // Update average speed (rolling average)
    const prevTotal = (subtopicProfile.totalAttempted - 1) * subtopicProfile.averageSpeed;
    subtopicProfile.averageSpeed = (prevTotal + answerRecord.timeToAnswer) / subtopicProfile.totalAttempted;

    // Update confidence score
    const oldConfidence = subtopicProfile.confidenceScore;
    subtopicProfile.confidenceScore = updateConfidenceScore(
        subtopicProfile.confidenceScore,
        answerRecord.isCorrect,
        answerRecord.timeToAnswer,
        subtopicProfile.currentDifficultyTier
    );

    // Track timestamp
    subtopicProfile.lastAnswerTime = answerRecord.timestamp;

    // Determine tier change
    let tierChange: 'promoted' | 'demoted' | 'unchanged' = 'unchanged';
    let newTier = subtopicProfile.currentDifficultyTier;

    // Check for auto-promotion via confidence score
    if (subtopicProfile.confidenceScore >= CONFIDENCE_THRESHOLDS.AUTO_PROMOTE) {
        if (subtopicProfile.currentDifficultyTier === 'Easy') {
            newTier = 'Medium';
            tierChange = 'promoted';
        } else if (subtopicProfile.currentDifficultyTier === 'Medium') {
            newTier = 'Hard';
            tierChange = 'promoted';
        }
    }
    // Check for safety net (consecutive wrong answers)
    else if (subtopicProfile.consecutiveWrong >= CONFIDENCE_THRESHOLDS.SAFETY_NET_CONSECUTIVE) {
        if (subtopicProfile.currentDifficultyTier === 'Hard') {
            newTier = 'Medium';
            tierChange = 'demoted';
        } else if (subtopicProfile.currentDifficultyTier === 'Medium') {
            newTier = 'Easy';
            tierChange = 'demoted';
        }
        // Reset consecutive wrong after demotion
        subtopicProfile.consecutiveWrong = 0;
    }
    // Apply rapid-pivot logic if we have enough data
    else if (subtopicProfile.totalAttempted >= 3) {
        // Build recent answers from profile data (simplified - in real impl would track history)
        // For now, use current stats to simulate
        const simulatedAnswers: QuestionAnswerRecord[] = [];
        for (let i = 0; i < 3; i++) {
            simulatedAnswers.push({
                subtopicId: answerRecord.subtopicId,
                isCorrect: i < subtopicProfile.consecutiveCorrect ||
                          (subtopicProfile.accuracyRatio > 0.66 && i < 2),
                timeToAnswer: subtopicProfile.averageSpeed,
                difficulty: subtopicProfile.currentDifficultyTier,
                timestamp: Date.now() - (2 - i) * 60000,
            });
        }

        const pivotResult = calculateRapidPivot(simulatedAnswers, subtopicProfile.currentDifficultyTier);
        if (pivotResult.tierChange !== 'unchanged') {
            newTier = pivotResult.newTier;
            tierChange = pivotResult.tierChange;
        }
    }

    // Apply tier change
    subtopicProfile.currentDifficultyTier = newTier;

    // Clear inferred flag if user has now answered questions directly
    if (subtopicProfile.isInferred && subtopicProfile.totalAttempted >= 3) {
        subtopicProfile.isInferred = false;
        subtopicProfile.inferredFrom = undefined;
    }

    // Update global stats
    userProfile.totalQuestionsAnswered += 1;
    userProfile.subtopics[answerRecord.subtopicId] = subtopicProfile;

    // Apply cross-category inference
    const inferredTopics = applyCrossCategoryInference(userProfile, answerRecord.subtopicId, subtopicProfile);

    // Check if calibration is complete (enough data gathered)
    checkCalibrationStatus(userProfile);

    return {
        updatedProfile: subtopicProfile,
        tierChange,
        newTier: tierChange !== 'unchanged' ? newTier : undefined,
        inferredTopics,
        confidenceChange: subtopicProfile.confidenceScore - oldConfidence,
    };
}

/**
 * Apply cross-category inference when a user demonstrates mastery
 */
export function applyCrossCategoryInference(
    userProfile: UserSkillProfile,
    masteredSubtopic: string,
    masteredProfile: SubtopicSkillProfile
): string[] {
    const inferredTopics: string[] = [];

    // Only infer if the user has shown competence (confidence > 70)
    if (masteredProfile.confidenceScore < 70 || masteredProfile.totalAttempted < 3) {
        return inferredTopics;
    }

    const relatedTopics = CROSS_CATEGORY_INFERENCE[masteredSubtopic] || [];

    for (const relatedTopic of relatedTopics) {
        // Check if this topic exists in SUBTOPICS
        if (!SUBTOPICS.includes(relatedTopic)) continue;

        const existingProfile = userProfile.subtopics[relatedTopic];

        // Only infer for topics that haven't been directly assessed
        if (existingProfile && existingProfile.totalAttempted > 0 && !existingProfile.isInferred) {
            continue;
        }

        // Create or update inferred profile
        const inferredProfile = existingProfile || createInitialSubtopicProfile(relatedTopic, true, masteredSubtopic);

        // Infer a conservative difficulty based on mastered topic
        // If mastered topic is Hard, infer Medium for related
        // If mastered topic is Medium, infer Easy-Medium for related
        if (masteredProfile.currentDifficultyTier === 'Hard') {
            inferredProfile.currentDifficultyTier = 'Medium';
            inferredProfile.confidenceScore = Math.min(60, masteredProfile.confidenceScore - 20);
        } else if (masteredProfile.currentDifficultyTier === 'Medium' && masteredProfile.confidenceScore >= 75) {
            inferredProfile.currentDifficultyTier = 'Medium';
            inferredProfile.confidenceScore = Math.min(55, masteredProfile.confidenceScore - 25);
        } else {
            inferredProfile.currentDifficultyTier = 'Easy';
            inferredProfile.confidenceScore = Math.min(50, masteredProfile.confidenceScore - 30);
        }

        inferredProfile.isInferred = true;
        inferredProfile.inferredFrom = masteredSubtopic;

        userProfile.subtopics[relatedTopic] = inferredProfile;
        inferredTopics.push(relatedTopic);
    }

    return inferredTopics;
}

/**
 * Check if enough data has been gathered for calibration to be complete
 */
export function checkCalibrationStatus(userProfile: UserSkillProfile): void {
    // Consider calibration complete when:
    // 1. Seed mission is done
    // 2. At least 30 total questions answered
    // 3. At least 10 different subtopics have been assessed

    const assessedSubtopics = Object.values(userProfile.subtopics)
        .filter(s => s.totalAttempted > 0 && !s.isInferred).length;

    if (userProfile.seedMissionCompleted &&
        userProfile.totalQuestionsAnswered >= 30 &&
        assessedSubtopics >= 10) {
        userProfile.calibrationComplete = true;
        userProfile.diagnosticPhase = 'complete';
    } else if (userProfile.seedMissionCompleted) {
        userProfile.diagnosticPhase = 'calibrating';
    }
}

/**
 * Get the recommended difficulty for a subtopic
 */
export function getRecommendedDifficulty(
    userProfile: UserSkillProfile,
    subtopicId: string
): DifficultyTier {
    const profile = userProfile.subtopics[subtopicId];

    if (!profile) {
        // New subtopic - check if we can infer from related topics
        const relatedMastered = findRelatedMasteredTopic(userProfile, subtopicId);
        if (relatedMastered) {
            return relatedMastered.currentDifficultyTier === 'Hard' ? 'Medium' : 'Easy';
        }
        return 'Medium'; // Default for completely new subtopics
    }

    return profile.currentDifficultyTier;
}

/**
 * Find a related topic that the user has mastered
 */
function findRelatedMasteredTopic(
    userProfile: UserSkillProfile,
    subtopicId: string
): SubtopicSkillProfile | null {
    // Look through all inference mappings to find if this subtopic is related to any mastered topic
    for (const [masteredTopic, relatedTopics] of Object.entries(CROSS_CATEGORY_INFERENCE)) {
        if (relatedTopics.includes(subtopicId)) {
            const masteredProfile = userProfile.subtopics[masteredTopic];
            if (masteredProfile && masteredProfile.confidenceScore >= 70 && masteredProfile.totalAttempted >= 3) {
                return masteredProfile;
            }
        }
    }
    return null;
}

/**
 * Generate subtopics for the seed mission
 * Selects from high-impact categories with variety
 */
export function getSeedMissionSubtopics(count: number = 10): string[] {
    // Shuffle and take the first N from high-impact categories
    const shuffled = [...HIGH_IMPACT_CATEGORIES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Check if the stealth diagnostic (placement) is complete
 * This is used to determine if features should be unlocked
 */
export function isStealthPlacementComplete(userProfile: UserSkillProfile): boolean {
    return userProfile.seedMissionCompleted;
}

/**
 * Mark the seed mission as complete
 */
export function completeSeedMission(userProfile: UserSkillProfile): void {
    userProfile.seedMissionCompleted = true;
    userProfile.diagnosticPhase = 'calibrating';
}

/**
 * Convert stealth profile difficulty to legacy SkillLevel for compatibility
 */
export function tierToSkillLevel(tier: DifficultyTier): 'Easy' | 'Medium' | 'Hard' {
    return tier;
}

/**
 * Get a summary of the user's assessed skill levels for all subtopics
 */
export function getSkillSummary(userProfile: UserSkillProfile): { [subtopic: string]: DifficultyTier } {
    const summary: { [subtopic: string]: DifficultyTier } = {};

    for (const subtopic of SUBTOPICS) {
        summary[subtopic] = getRecommendedDifficulty(userProfile, subtopic);
    }

    return summary;
}

/**
 * Reset the stealth diagnostic for a user (for testing purposes)
 */
export function resetStealthDiagnostic(uid: string): void {
    const key = `${uid}_${SKILL_PROFILE_KEY}`;
    localStorage.removeItem(key);
}
