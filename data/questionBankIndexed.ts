import { DBQuestion } from '../types';
import { QUESTION_BANK } from './questionBank';

// Pre-indexed question bank for instant lookups
// This avoids filtering through 800+ questions on every request
export interface QuestionIndex {
    [category: string]: {
        Easy: DBQuestion[];
        Medium: DBQuestion[];
        Hard: DBQuestion[];
        'Extra Hard': DBQuestion[];
    };
}

/**
 * Alias map: maps question bank Type values that don't match SUBTOPICS
 * to their closest SUBTOPIC equivalent. This ensures all questions
 * in the bank are accessible through the UI categories.
 *
 * Format: { bankType → subtopic }
 */
const TYPE_ALIASES: Record<string, string> = {
    // Algebra aliases
    'Algebra: Exponents and Radicals': 'Algebra: Exponential Functions',
    'Algebra: Functions': 'Function Notation',
    'Algebra: Linear Equations': 'Algebra: Linear Functions',
    'Algebra: Polynomial Functions': 'Algebra: Polynomial Manipulation',
    'Algebra: Polynomials': 'Algebra: Polynomial Manipulation',
    'Algebra: Ratios and Proportions': 'Ratios and Proportions',
    'Algebra: Systems of Equations': 'Algebra: Systems of Linear Equations',

    // Coordinate Geometry aliases
    'Coordinate Geometry: Graphing': 'Coordinate Geometry: Nonlinear Functions',

    // Data aliases
    'Data: Data Interpretation': 'Data: Experimental Interpretation',
    'Data: Percentages': 'Data: Categories and Probabilities',
    'Data: Probability': 'Data: Categories and Probabilities',
    'Data: Statistics': 'Data: Central Tendency and Standard Deviation',
    'Data: Tables and Graphs': 'Data: Scatterplots and Graphs',
    'Data: Two-Way Tables': 'Data: Categories and Probabilities',

    // Geometry aliases
    'Geometry: Angles': 'Geometry: Lines and Angles',
    'Geometry: Angles and Lines': 'Geometry: Lines and Angles',
    'Geometry: Polygons': 'Geometry: Triangles and Polygons',
    'Geometry: Surface Area and Volume': 'Geometry: Solid Geometry',
    'Geometry: Triangles': 'Geometry: Triangles and Polygons',

    // Grammar aliases
    'Grammar: Modifier Placement': 'Grammar: Modifiers',
    'Grammar: Parallel Structure': 'Grammar: Sentence Structure',
    'Grammar: Pronoun Reference': 'Grammar: Pronouns',
    'Grammar: Pronoun Usage': 'Grammar: Pronouns',
    'Grammar: Transitions': 'Rhetoric: Transitions',

    // R/W aliases
    'R/W: Inference': 'R/W: Drawing Inferences',
    'R/W: Main Idea': 'R/W: Identifying Main Idea',
    'R/W: Supporting Details': 'R/W: Finding Key Details',
};

// Build the index once when the module loads
const buildQuestionIndex = (): QuestionIndex => {
    const index: QuestionIndex = {};

    QUESTION_BANK.forEach(question => {
        // Use alias if available, otherwise use original Type
        const category = TYPE_ALIASES[question.Type] || question.Type;
        const difficulty = question.Difficulty;

        if (!index[category]) {
            index[category] = {
                Easy: [],
                Medium: [],
                Hard: [],
                'Extra Hard': []
            };
        }

        index[category][difficulty].push(question);
    });

    return index;
};

// Export the pre-built index (created once at module load time)
export const INDEXED_QUESTIONS = buildQuestionIndex();

// Utility function for fast question retrieval
// Falls back to checking all difficulties if the exact difficulty has no questions
export const getQuestionsByCategory = (category: string, difficulty: 'Easy' | 'Medium' | 'Hard'): DBQuestion[] => {
    const categoryQuestions = INDEXED_QUESTIONS[category];
    if (!categoryQuestions) return [];

    // Try exact difficulty first
    const exact = categoryQuestions[difficulty];
    if (exact && exact.length > 0) return exact;

    // Fallback: try adjacent difficulties (Medium → Easy → Hard)
    const fallbackOrder: ('Easy' | 'Medium' | 'Hard')[] =
        difficulty === 'Easy' ? ['Medium', 'Hard'] :
        difficulty === 'Hard' ? ['Medium', 'Easy'] :
        ['Easy', 'Hard'];

    for (const fallback of fallbackOrder) {
        const questions = categoryQuestions[fallback];
        if (questions && questions.length > 0) return questions;
    }

    return [];
};
