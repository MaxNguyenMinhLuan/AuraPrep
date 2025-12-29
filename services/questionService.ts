
import { Question, Difficulty, Point, GraphData } from '../types';
import { getQuestionsByCategory } from '../data/questionBankIndexed';

const FALLBACK_QUESTION = (subtopic: string, difficulty: string): Omit<Question, 'subtopic'> => ({
    question: `Content Development: The database is currently being populated with high-quality SAT questions for "${subtopic}" at ${difficulty} level.\n\nCheck back soon, or try "Grammar: Punctuation" for a full experience!`,
    options: ["Understood", "Coming Soon", "Content Pending", "Return Later"],
    answerIndex: 0,
    explanation: "This category is currently in the 'Content Acquisition' phase of development.",
    hasGraphic: false
});

/**
 * Parses legacy question text for bracketed graph descriptions.
 */
const parseLegacyGraphData = (text: string): GraphData | undefined => {
    const pointRegex = /\((-?\d+),\s*(-?\d+)\)/g;
    const matches = Array.from(text.matchAll(pointRegex));

    if (matches.length === 0) return undefined;

    const points: Point[] = matches.map(m => ({
        x: parseInt(m[1]),
        y: parseInt(m[2])
    }));

    if (text.includes('system') || text.includes('intersecting')) {
        return { type: 'system', points };
    }

    if (text.includes('line')) {
        return { type: 'line', points };
    }

    return { type: 'scatter', points };
};

export const generateSatQuestion = async (subtopic: string, difficulty: Difficulty): Promise<Omit<Question, 'subtopic'>> => {
    // Removed artificial delay for instant loading
    // Use pre-indexed questions for O(1) lookup instead of O(n) filtering
    const candidates = getQuestionsByCategory(subtopic, difficulty);

    if (candidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const dbQuestion = candidates[randomIndex];
        const cleanedQuestion = dbQuestion.Question.replace(/\(Graph shows.*?\)/g, '').trim();
        const legacyGraph = parseLegacyGraphData(dbQuestion.Question);

        return {
            question: cleanedQuestion,
            options: [dbQuestion.A, dbQuestion.B, dbQuestion.C, dbQuestion.D],
            answerIndex: ['A', 'B', 'C', 'D'].indexOf(dbQuestion.CorrectAns),
            explanation: dbQuestion.Explanation || "Correct answer explanation not provided.",
            hasGraphic: !!legacyGraph,
            graphData: legacyGraph
        };
    }

    // Fallback to placeholder if nothing exists in bank
    return FALLBACK_QUESTION(subtopic, difficulty);
};
