import { DBQuestion } from '../types';
import { QUESTION_BANK } from './questionBank';

// Pre-indexed question bank for instant lookups
// This avoids filtering through 800+ questions on every request
export interface QuestionIndex {
    [category: string]: {
        Easy: DBQuestion[];
        Medium: DBQuestion[];
        Hard: DBQuestion[];
    };
}

// Build the index once when the module loads
const buildQuestionIndex = (): QuestionIndex => {
    const index: QuestionIndex = {};

    QUESTION_BANK.forEach(question => {
        const category = question.Type;
        const difficulty = question.Difficulty;

        if (!index[category]) {
            index[category] = {
                Easy: [],
                Medium: [],
                Hard: []
            };
        }

        index[category][difficulty].push(question);
    });

    return index;
};

// Export the pre-built index (created once at module load time)
export const INDEXED_QUESTIONS = buildQuestionIndex();

// Utility function for fast question retrieval
export const getQuestionsByCategory = (category: string, difficulty: 'Easy' | 'Medium' | 'Hard'): DBQuestion[] => {
    return INDEXED_QUESTIONS[category]?.[difficulty] || [];
};
