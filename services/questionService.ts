
import { Question, Difficulty, Point, GraphData } from '../types';
import { QUESTION_BANK } from '../data/questionBank';

const FALLBACK_QUESTION = (subtopic: string, difficulty: string): Omit<Question, 'subtopic'> => ({
    question: `Content Development: The database is currently being populated with high-quality SAT questions for "${subtopic}" at ${difficulty} level.\n\nCheck back soon, or try "Grammar: Punctuation" for a full experience!`,
    options: ["Understood", "Coming Soon", "Content Pending", "Return Later"],
    answerIndex: 0,
    explanation: "This category is currently in the 'Content Acquisition' phase of development.",
    hasGraphic: false
});

/**
 * Parses legacy question text for bracketed graph descriptions.
 * Modern questions from Gemini already include structured graphData.
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
    await new Promise(resolve => setTimeout(resolve, 300));

    // 1. Check local static bank first for curated questions
    let candidates = QUESTION_BANK.filter(q => q.Type === subtopic && q.Difficulty === difficulty);

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

    // 2. Fallback to placeholder if nothing exists in bank (or link to Gemini generator in a real live environment)
    return FALLBACK_QUESTION(subtopic, difficulty);
};
