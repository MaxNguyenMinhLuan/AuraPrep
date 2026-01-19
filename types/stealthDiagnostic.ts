/**
 * Stealth Diagnostic System Types
 *
 * This system replaces the formal baseline test with a hidden assessment
 * that evaluates users through their first few daily missions.
 */

import { SkillLevel } from '../types';

// Difficulty tiers for stealth diagnostic
export type DifficultyTier = 'Easy' | 'Medium' | 'Hard';

// Timing thresholds in seconds
export const TIMING_THRESHOLDS = {
    FAST_ANSWER: 30,      // Fast track threshold (seconds)
    STRUGGLE_TIMER: 90,   // Indicates struggle (seconds)
    NORMAL_MIN: 30,       // Normal range minimum
    NORMAL_MAX: 90,       // Normal range maximum
};

// Scoring thresholds for rapid-pivot logic
export const PIVOT_THRESHOLDS = {
    FAST_TRACK_CORRECT: 3,     // Need 3/3 correct for fast track
    FAST_TRACK_TIME: 30,       // Average time under 30s for fast track
    SAFE_BASELINE_CORRECT: 2,  // Need 2/3 correct for safe baseline
    FOUNDATION_BUILD_CORRECT: 1, // 0-1 correct triggers foundation build
};

// Confidence score thresholds
export const CONFIDENCE_THRESHOLDS = {
    AUTO_PROMOTE: 90,          // Auto-promote to harder tier at 90%
    SAFETY_NET_CONSECUTIVE: 3, // Consecutive wrong answers to drop tier
    INITIAL_CONFIDENCE: 50,    // Starting confidence for new subtopics
    MAX_CONFIDENCE: 100,
    MIN_CONFIDENCE: 0,
};

// High-impact categories for seed mission (matching actual SUBTOPICS from constants.ts)
export const HIGH_IMPACT_CATEGORIES = [
    'Algebra: Linear Functions',
    'Algebra: Systems of Linear Equations',
    'Geometry: Triangles and Polygons',
    'Data: Central Tendency and Standard Deviation',
    'R/W: Identifying Main Idea',
    'R/W: Vocabulary in Context',
    'Grammar: Subject-Verb Agreement',
    'Grammar: Punctuation',
    'Algebra: Quadratic Equations',
    'R/W: Command of Evidence',
];

// Cross-category inference mapping (matching actual SUBTOPICS from constants.ts)
// When a user masters one topic, related topics get inferred difficulty
export const CROSS_CATEGORY_INFERENCE: { [key: string]: string[] } = {
    // Algebra relationships
    'Algebra: Linear Functions': ['Algebra: Systems of Linear Equations', 'Algebra: Inequalities', 'Coordinate Geometry: Lines and Slopes'],
    'Algebra: Quadratic Equations': ['Algebra: Polynomial Manipulation', 'Function Notation'],
    'Algebra: Systems of Linear Equations': ['Algebra: Linear Functions', 'Algebra: Inequalities'],
    'Algebra: Polynomial Manipulation': ['Algebra: Quadratic Equations', 'Algebra: Dividing Polynomials'],
    'Algebra: Dividing Polynomials': ['Algebra: Polynomial Manipulation'],
    'Algebra: Exponential Functions': ['Algebra: Polynomial Manipulation'],
    'Algebra: Absolute Value': ['Algebra: Inequalities', 'Algebra: Linear Functions'],
    'Algebra: Inequalities': ['Algebra: Linear Functions', 'Algebra: Absolute Value'],
    'Algebra: Single Variable Equations': ['Algebra: Linear Functions', 'Formulas and Expressions'],
    'Algebra: Systems of Nonlinear Equations': ['Algebra: Systems of Linear Equations', 'Algebra: Quadratic Equations'],

    // Geometry relationships
    'Geometry: Triangles and Polygons': ['Geometry: Trigonometry', 'Geometry: Lines and Angles'],
    'Geometry: Trigonometry': ['Geometry: Triangles and Polygons'],
    'Geometry: Circles': ['Geometry: Solid Geometry'],
    'Geometry: Solid Geometry': ['Geometry: Circles'],
    'Geometry: Lines and Angles': ['Geometry: Triangles and Polygons', 'Coordinate Geometry: Lines and Slopes'],

    // Coordinate Geometry
    'Coordinate Geometry: Lines and Slopes': ['Algebra: Linear Functions', 'Geometry: Lines and Angles'],
    'Coordinate Geometry: Nonlinear Functions': ['Algebra: Quadratic Equations', 'Function Notation'],

    // Data & Statistics relationships
    'Data: Central Tendency and Standard Deviation': ['Data: Scatterplots and Graphs', 'Data: Categories and Probabilities'],
    'Data: Categories and Probabilities': ['Data: Central Tendency and Standard Deviation', 'Ratios and Proportions'],
    'Data: Scatterplots and Graphs': ['Data: Central Tendency and Standard Deviation', 'Coordinate Geometry: Lines and Slopes'],
    'Data: Experimental Interpretation': ['Data: Scatterplots and Graphs', 'Data: Central Tendency and Standard Deviation'],

    // Reading & Writing relationships
    'R/W: Identifying Main Idea': ['R/W: Command of Evidence', 'R/W: Text Structure and Purpose'],
    'R/W: Command of Evidence': ['R/W: Identifying Main Idea', 'R/W: Drawing Inferences'],
    'R/W: Vocabulary in Context': ['R/W: Determining Sentence Purpose'],
    'R/W: Drawing Inferences': ['R/W: Command of Evidence', 'R/W: Text Structure and Purpose'],
    'R/W: Text Structure and Purpose': ['R/W: Identifying Main Idea', 'Rhetoric: Transitions'],
    'R/W: Multiple Text Analysis': ['R/W: Identifying Main Idea', 'R/W: Text Structure and Purpose'],
    'R/W: Quantitative Analysis': ['Data: Scatterplots and Graphs', 'R/W: Command of Evidence'],
    'R/W: Finding Key Details': ['R/W: Identifying Main Idea', 'R/W: Drawing Inferences'],
    'R/W: Rhetorical Synthesis': ['R/W: Text Structure and Purpose', 'Rhetoric: Transitions'],
    'R/W: Determining Sentence Purpose': ['R/W: Text Structure and Purpose', 'R/W: Vocabulary in Context'],

    // Grammar relationships
    'Grammar: Subject-Verb Agreement': ['Grammar: Pronouns', 'Grammar: Verb Tense'],
    'Grammar: Pronouns': ['Grammar: Subject-Verb Agreement', 'Grammar: Possessives'],
    'Grammar: Verb Tense': ['Grammar: Subject-Verb Agreement', 'Grammar: Sentence Structure'],
    'Grammar: Punctuation': ['Grammar: Sentence Structure', 'Grammar: Conventional Expression'],
    'Grammar: Sentence Structure': ['Grammar: Punctuation', 'Grammar: Modifiers'],
    'Grammar: Modifiers': ['Grammar: Sentence Structure'],
    'Grammar: Possessives': ['Grammar: Pronouns', 'Grammar: Punctuation'],
    'Grammar: Conventional Expression': ['Grammar: Punctuation', 'Grammar: Sentence Structure'],

    // Rhetoric relationships
    'Rhetoric: Transitions': ['R/W: Text Structure and Purpose', 'Grammar: Sentence Structure'],
    'Rhetoric: Precision': ['Grammar: Sentence Structure', 'Rhetoric: Transitions'],

    // Other math relationships
    'Function Notation': ['Algebra: Quadratic Equations', 'Algebra: Linear Functions', 'Coordinate Geometry: Nonlinear Functions'],
    'Formulas and Expressions': ['Algebra: Single Variable Equations', 'Algebra: Linear Functions'],
    'Numbers: Sequences': ['Algebra: Linear Functions', 'Function Notation'],
    'Ratios and Proportions': ['Data: Categories and Probabilities', 'Geometry: Triangles and Polygons'],
};

// Individual subtopic skill profile
export interface SubtopicSkillProfile {
    subtopicId: string;
    currentDifficultyTier: DifficultyTier;
    accuracyRatio: number;           // 0-1 (correct / total attempted)
    totalAttempted: number;
    totalCorrect: number;
    averageSpeed: number;            // Average seconds per question
    confidenceScore: number;         // 0-100
    consecutiveCorrect: number;      // Track for promotion
    consecutiveWrong: number;        // Track for demotion (safety net)
    lastAnswerTime: number;          // Timestamp of last answer
    isInferred: boolean;             // Was this level inferred from related topics?
    inferredFrom?: string;           // Which topic it was inferred from
}

// User's complete skill profile for stealth diagnostic
export interface UserSkillProfile {
    subtopics: { [subtopicId: string]: SubtopicSkillProfile };
    diagnosticPhase: DiagnosticPhase;
    seedMissionCompleted: boolean;
    totalQuestionsAnswered: number;
    calibrationComplete: boolean;    // True after enough data gathered
    lastUpdated: number;             // Timestamp
}

// Phases of the stealth diagnostic
export type DiagnosticPhase =
    | 'seed-mission'      // Initial 10-question assessment
    | 'calibrating'       // Days 2-3, still gathering data
    | 'active'            // Normal operation with continuous calibration
    | 'complete';         // Enough data to be confident

// Question answer record for tracking
export interface QuestionAnswerRecord {
    subtopicId: string;
    isCorrect: boolean;
    timeToAnswer: number;  // Seconds
    difficulty: DifficultyTier;
    timestamp: number;
}

// Seed mission configuration
export interface SeedMissionConfig {
    questionCount: number;
    categories: string[];
    defaultDifficulty: DifficultyTier;
    pivotAfterQuestions: number;  // When to start rapid-pivot (after 3 questions of same subtopic)
}

// Result of processing an answer through the stealth system
export interface StealthAnswerResult {
    updatedProfile: SubtopicSkillProfile;
    tierChange: 'promoted' | 'demoted' | 'unchanged';
    newTier?: DifficultyTier;
    inferredTopics?: string[];  // Topics that were updated via inference
    confidenceChange: number;
}

// Mission generation context for stealth system
export interface StealthMissionContext {
    isFirstMission: boolean;
    isSeedMission: boolean;
    userProfile: UserSkillProfile;
    focusSubtopics?: string[];  // Specific subtopics to focus on
}

// Default seed mission configuration
export const DEFAULT_SEED_MISSION_CONFIG: SeedMissionConfig = {
    questionCount: 10,
    categories: HIGH_IMPACT_CATEGORIES,
    defaultDifficulty: 'Medium',
    pivotAfterQuestions: 3,
};

// Initialize a new subtopic skill profile
export function createInitialSubtopicProfile(subtopicId: string, isInferred: boolean = false, inferredFrom?: string): SubtopicSkillProfile {
    return {
        subtopicId,
        currentDifficultyTier: 'Medium',
        accuracyRatio: 0,
        totalAttempted: 0,
        totalCorrect: 0,
        averageSpeed: 0,
        confidenceScore: CONFIDENCE_THRESHOLDS.INITIAL_CONFIDENCE,
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
        lastAnswerTime: Date.now(),
        isInferred,
        inferredFrom,
    };
}

// Initialize a new user skill profile
export function createInitialUserSkillProfile(): UserSkillProfile {
    return {
        subtopics: {},
        diagnosticPhase: 'seed-mission',
        seedMissionCompleted: false,
        totalQuestionsAnswered: 0,
        calibrationComplete: false,
        lastUpdated: Date.now(),
    };
}
