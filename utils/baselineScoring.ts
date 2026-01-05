import { SkillLevel, SubtopicStat } from '../types';

export interface BaselineResults {
    [subtopic: string]: {
        correct: number;
        total: number;
        level: SkillLevel;
    };
}

/**
 * Calculate skill level based on correct answer rate
 * Never assigns "Master" during baseline
 */
export function calculateSkillLevel(correctRate: number): SkillLevel {
    if (correctRate < 0.4) return 'Easy';
    if (correctRate < 0.7) return 'Medium';
    return 'Hard';  // Never "Master" in baseline
}

/**
 * Process baseline test results and assign skill levels
 */
export function processBaselineResults(
    answers: { subtopic: string; isCorrect: boolean }[]
): BaselineResults {
    const results: BaselineResults = {};

    // Group answers by subtopic
    answers.forEach(({ subtopic, isCorrect }) => {
        if (!results[subtopic]) {
            results[subtopic] = { correct: 0, total: 0, level: 'Easy' };
        }
        results[subtopic].total++;
        if (isCorrect) {
            results[subtopic].correct++;
        }
    });

    // Calculate skill levels
    Object.keys(results).forEach(subtopic => {
        const { correct, total } = results[subtopic];
        const correctRate = total > 0 ? correct / total : 0;
        results[subtopic].level = calculateSkillLevel(correctRate);
    });

    return results;
}

/**
 * Convert baseline results to UserProfile stats format
 */
export function baselineResultsToStats(results: BaselineResults): { [subtopic: string]: SubtopicStat } {
    const stats: { [subtopic: string]: SubtopicStat } = {};

    Object.entries(results).forEach(([subtopic, result]) => {
        stats[subtopic] = {
            correct: result.correct,
            incorrect: result.total - result.correct,
            level: result.level
        };
    });

    return stats;
}
