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

// Subtopic to official domain mapping matching questions.json
const SUBTOPIC_TO_DOMAIN_MAP: Record<string, string> = {
    // Heart of Algebra
    'Algebra: Linear Functions': 'Algebra',
    'Algebra: Single Variable Equations': 'Algebra',
    'Algebra: Systems of Linear Equations': 'Algebra',
    'Algebra: Inequalities': 'Algebra',
    'Algebra: Absolute Value': 'Algebra',
    'Formulas and Expressions': 'Algebra',

    // Advanced Math
    'Algebra: Quadratic Equations': 'Advanced Math',
    'Algebra: Exponential Functions': 'Advanced Math',
    'Algebra: Polynomial Manipulation': 'Advanced Math',
    'Algebra: Dividing Polynomials': 'Advanced Math',
    'Algebra: Systems of Nonlinear Equations': 'Advanced Math',
    'Function Notation': 'Advanced Math',

    // Problem Solving and Data Analysis
    'Ratios and Proportions': 'Problem-Solving and Data Analysis',
    'Data: Scatterplots and Graphs': 'Problem-Solving and Data Analysis',
    'Data: Categories and Probabilities': 'Problem-Solving and Data Analysis',
    'Data: Central Tendency and Standard Deviation': 'Problem-Solving and Data Analysis',
    'Data: Experimental Interpretation': 'Problem-Solving and Data Analysis',
    'Numbers: Sequences': 'Problem-Solving and Data Analysis',

    // Geometry and Trigonometry
    'Geometry: Lines and Angles': 'Geometry and Trigonometry',
    'Geometry: Triangles and Polygons': 'Geometry and Trigonometry',
    'Geometry: Solid Geometry': 'Geometry and Trigonometry',
    'Geometry: Circles': 'Geometry and Trigonometry',
    'Geometry: Trigonometry': 'Geometry and Trigonometry',
    'Coordinate Geometry: Lines and Slopes': 'Geometry and Trigonometry',
    'Coordinate Geometry: Nonlinear Functions': 'Geometry and Trigonometry',

    // Craft and Structure
    'R/W: Identifying Main Idea': 'Craft and Structure',
    'R/W: Text Structure and Purpose': 'Craft and Structure',
    'R/W: Multiple Text Analysis': 'Craft and Structure',
    'R/W: Determining Sentence Purpose': 'Craft and Structure',
    'R/W: Vocabulary in Context': 'Craft and Structure',
    'Rhetoric: Precision': 'Craft and Structure',

    // Information and Ideas
    'R/W: Finding Key Details': 'Information and Ideas',
    'R/W: Drawing Inferences': 'Information and Ideas',
    'R/W: Command of Evidence': 'Information and Ideas',
    'R/W: Quantitative Analysis': 'Information and Ideas',

    // Standard English Conventions
    'Grammar: Sentence Structure': 'Standard English Conventions',
    'Grammar: Subject-Verb Agreement': 'Standard English Conventions',
    'Grammar: Verb Tense': 'Standard English Conventions',
    'Grammar: Pronouns': 'Standard English Conventions',
    'Grammar: Modifiers': 'Standard English Conventions',
    'Grammar: Punctuation': 'Standard English Conventions',
    'Grammar: Conventional Expression': 'Standard English Conventions',
    'Grammar: Possessives': 'Standard English Conventions',

    // Expression of Ideas
    'Rhetoric: Transitions': 'Expression of Ideas',
    'Rhetoric: Rhetorical Synthesis': 'Expression of Ideas'
};

let cachedQuestions: any[] | null = null;
let loadPromise: Promise<any[]> | null = null;

export const loadLocalQuestions = async (): Promise<any[]> => {
    if (cachedQuestions) return cachedQuestions;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        try {
            const response = await fetch('/questions.json');
            if (!response.ok) throw new Error('Failed to load questions.json');
            cachedQuestions = await response.json();
            return cachedQuestions || [];
        } catch (err) {
            console.error('Error loading static questions.json:', err);
            cachedQuestions = [];
            return [];
        }
    })();

    return loadPromise;
};

export const generateSatQuestion = async (subtopic: string, difficulty: Difficulty): Promise<Omit<Question, 'subtopic'>> => {
    const mappedDifficulty: 'Easy' | 'Medium' | 'Hard' = difficulty === 'Extra Hard' ? 'Hard' : difficulty;

    try {
        const questions = await loadLocalQuestions();
        const domain = SUBTOPIC_TO_DOMAIN_MAP[subtopic];
        
        if (domain) {
            const candidates = questions.filter(q => q.domain === domain && q.difficulty === mappedDifficulty);
            if (candidates.length > 0) {
                const randomIndex = Math.floor(Math.random() * candidates.length);
                const q = candidates[randomIndex];
                
                let questionString = q.question.question;
                if (q.question.paragraph && q.question.paragraph !== 'null') {
                    questionString = `${q.question.paragraph}\n\n${q.question.question}`;
                }
                const cleanedQuestion = questionString.replace(/\(Graph shows.*?\)/g, '').trim();
                const legacyGraph = parseLegacyGraphData(questionString);
                
                return {
                    question: cleanedQuestion,
                    options: [
                        q.question.choices.A || '',
                        q.question.choices.B || '',
                        q.question.choices.C || '',
                        q.question.choices.D || ''
                    ],
                    answerIndex: ['A', 'B', 'C', 'D'].indexOf(q.question.correct_answer),
                    explanation: q.question.explanation !== 'null' && q.question.explanation ? q.question.explanation : "Correct answer explanation not provided.",
                    hasGraphic: (q.visuals && q.visuals.type !== 'null') || !!legacyGraph,
                    graphData: legacyGraph
                };
            }
        }
    } catch (error) {
        console.error('Error loading question locally:', error);
    }

    // Fallback: use pre-indexed backup questions if loaded static files fail
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

    return FALLBACK_QUESTION(subtopic, difficulty);
};

export const fetchQuestionCounts = async (): Promise<Record<string, number>> => {
    try {
        const questions = await loadLocalQuestions();
        const counts: Record<string, number> = {};
        
        for (const [subtopic, domain] of Object.entries(SUBTOPIC_TO_DOMAIN_MAP)) {
            const count = questions.filter(q => q.domain === domain).length;
            if (count > 0) {
                counts[subtopic] = count;
            }
        }
        return counts;
    } catch (error) {
        console.error('Error fetching question counts locally:', error);
        return {};
    }
};
