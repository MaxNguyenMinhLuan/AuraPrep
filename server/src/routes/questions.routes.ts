import { Router, Request, Response } from 'express';
import { OfficialQuestion } from '../models/OfficialQuestion';
import { BackupQuestion } from '../models/BackupQuestion';

const router = Router();

// Subtopic to official domain mapping
const SUBTOPIC_TO_DOMAIN_MAP: Record<string, string> = {
    // Heart of Algebra
    'Algebra: Linear Functions': 'Heart of Algebra',
    'Algebra: Single Variable Equations': 'Heart of Algebra',
    'Algebra: Systems of Linear Equations': 'Heart of Algebra',
    'Algebra: Inequalities': 'Heart of Algebra',
    'Algebra: Absolute Value': 'Heart of Algebra',

    // Advanced Math
    'Algebra: Quadratic Equations': 'Advanced Math',
    'Algebra: Exponential Functions': 'Advanced Math',
    'Algebra: Polynomial Manipulation': 'Advanced Math',
    'Function Notation': 'Advanced Math',

    // Problem Solving and Data Analysis
    'Ratios and Proportions': 'Problem Solving and Data Analysis',
    'Data: Scatterplots and Graphs': 'Problem Solving and Data Analysis',
    'Data: Categories and Probabilities': 'Problem Solving and Data Analysis',
    'Data: Central Tendency and Standard Deviation': 'Problem Solving and Data Analysis',
    'Data: Experimental Interpretation': 'Problem Solving and Data Analysis',

    // Geometry and Trigonometry
    'Geometry: Lines and Angles': 'Geometry and Trigonometry',
    'Geometry: Triangles and Polygons': 'Geometry and Trigonometry',
    'Geometry: Solid Geometry': 'Geometry and Trigonometry',
    'Coordinate Geometry: Nonlinear Functions': 'Geometry and Trigonometry',
    'Trigonometry': 'Geometry and Trigonometry',

    // Craft and Structure
    'R/W: Identifying Main Idea': 'Craft and Structure',
    'R/W: Analyzing Text Structure': 'Craft and Structure',
    'R/W: Comparing Texts': 'Craft and Structure',
    'Rhetoric: Word Choice': 'Craft and Structure',

    // Information and Ideas
    'R/W: Finding Key Details': 'Information and Ideas',
    'R/W: Drawing Inferences': 'Information and Ideas',
    'R/W: Analyzing Arguments': 'Information and Ideas',
    'Data: Tables and Graphs': 'Information and Ideas',

    // Standard English Conventions
    'Grammar: Sentence Structure': 'Standard English Conventions',
    'Grammar: Subject-Verb Agreement': 'Standard English Conventions',
    'Grammar: Verb Tense and Form': 'Standard English Conventions',
    'Grammar: Pronouns': 'Standard English Conventions',
    'Grammar: Modifiers': 'Standard English Conventions',
    'Grammar: Punctuation': 'Standard English Conventions',

    // Expression of Ideas
    'Rhetoric: Transitions': 'Expression of Ideas',
    'Rhetoric: Rhetorical Synthesis': 'Expression of Ideas'
};
router.get('/counts', async (_req: Request, res: Response) => {
    try {
        const counts: Record<string, number> = {};
        for (const [subtopic, domain] of Object.entries(SUBTOPIC_TO_DOMAIN_MAP)) {
            const officialCount = await OfficialQuestion.countDocuments({ domain });
            if (officialCount > 0) {
                counts[subtopic] = officialCount;
            } else {
                const backupCount = await BackupQuestion.countDocuments({ Type: subtopic });
                counts[subtopic] = backupCount;
            }
        }
        return res.json({ success: true, data: counts });
    } catch (error) {
        console.error('Error fetching question counts:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get('/', async (req: Request, res: Response) => {
    const { category, difficulty } = req.query;

    if (!category || !difficulty) {
        return res.status(400).json({ success: false, message: 'Category and difficulty parameters are required.' });
    }

    try {
        const subtopic = String(category);
        const diff = String(difficulty);

        const domain = SUBTOPIC_TO_DOMAIN_MAP[subtopic];

        // 1. Try finding official questions matching the mapped domain and difficulty
        if (domain) {
            const officialQuestions = await OfficialQuestion.find({
                domain,
                difficulty: diff
            });

            if (officialQuestions.length > 0) {
                // Return randomly selected question formatted like client expects
                const randomIndex = Math.floor(Math.random() * officialQuestions.length);
                const q = officialQuestions[randomIndex];

                // Adapt format: Paragraph + QuestionText or just QuestionText
                let questionString = q.questionText;
                if (q.paragraph) {
                    questionString = `${q.paragraph}\n\n${q.questionText}`;
                }

                return res.json({
                    success: true,
                    data: {
                        question: questionString,
                        options: [q.choices.A, q.choices.B, q.choices.C, q.choices.D],
                        answerIndex: ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer),
                        explanation: q.explanation || '',
                        subtopic: subtopic,
                        hasGraphic: !!q.visuals
                    }
                });
            }
        }

        // 2. Fallback: Query backup questions if no official questions are available
        const backupQuestions = await BackupQuestion.find({
            Type: subtopic,
            Difficulty: diff
        });

        if (backupQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * backupQuestions.length);
            const q = backupQuestions[randomIndex];

            return res.json({
                success: true,
                data: {
                    question: q.Question,
                    options: [q.A, q.B, q.C, q.D],
                    answerIndex: ['A', 'B', 'C', 'D'].indexOf(q.CorrectAns),
                    explanation: q.Explanation || '',
                    subtopic: subtopic,
                    hasGraphic: !!q.GraphData
                }
            });
        }

        // 3. Absolute fallback: get any backup question
        const anyQuestions = await BackupQuestion.find({ Type: subtopic });
        if (anyQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * anyQuestions.length);
            const q = anyQuestions[randomIndex];
            return res.json({
                success: true,
                data: {
                    question: q.Question,
                    options: [q.A, q.B, q.C, q.D],
                    answerIndex: ['A', 'B', 'C', 'D'].indexOf(q.CorrectAns),
                    explanation: q.Explanation || '',
                    subtopic: subtopic,
                    hasGraphic: !!q.GraphData
                }
            });
        }

        return res.status(404).json({ success: false, message: 'No questions found for this category.' });
    } catch (error) {
        console.error('Error fetching question:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

export default router;
