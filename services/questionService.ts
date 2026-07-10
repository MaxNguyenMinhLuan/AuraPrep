
import { Question, Difficulty, Point, GraphData } from '../types';
import { getQuestionsByCategory } from '../data/questionBankIndexed';

const FALLBACK_QUESTION = (subtopic: string, difficulty: string): Omit<Question, 'subtopic'> => ({
    question: `This category ("${subtopic}" at ${difficulty} level) is still being populated with SAT-style questions.\n\nSelect "Skip this question" to continue without penalty.`,
    options: ["I'll come back later", "Try a different category", "Skip this question", "Notify the team"],
    answerIndex: 2,
    explanation: "No questions are available for this category and difficulty yet. Your answer was not scored. Try categories like 'Grammar: Punctuation' or 'Algebra: Quadratic Equations' for a full experience!",
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
    // Map 'Extra Hard' to 'Hard' for the indexed lookup
    const mappedDifficulty: 'Easy' | 'Medium' | 'Hard' = difficulty === 'Extra Hard' ? 'Hard' : difficulty;

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const response = await fetch(`${API_URL}/questions?category=${encodeURIComponent(subtopic)}&difficulty=${encodeURIComponent(mappedDifficulty)}`);
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const q = result.data;
                    const cleanedQuestion = q.question.replace(/\(Graph shows.*?\)/g, '').trim();
                    const legacyGraph = parseLegacyGraphData(q.question);
                    
                    return {
                        question: cleanedQuestion,
                        options: q.options,
                        answerIndex: q.answerIndex,
                        explanation: q.explanation || "Correct answer explanation not provided.",
                        hasGraphic: q.hasGraphic || !!legacyGraph,
                        graphData: legacyGraph
                    };
                }
            }
            throw new Error(`API responded with status ${response.status}`);
        } catch (error) {
            attempt++;
            console.warn(`Attempt ${attempt} to fetch question failed:`, error);
            if (attempt >= maxRetries) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Fallback: use pre-indexed questions for O(1) lookup
    const candidates = getQuestionsByCategory(subtopic, mappedDifficulty);

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

export const fetchQuestionCounts = async (): Promise<Record<string, number>> => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const response = await fetch(`${API_URL}/questions/counts`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                return result.data;
            }
        }
    } catch (error) {
        console.error('Error fetching question counts from API:', error);
    }
    return {};
};
