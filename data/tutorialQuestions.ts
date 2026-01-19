/**
 * Tutorial Questions
 *
 * These are dummy questions used during the tutorial to teach users
 * how the practice mode and boss fight system works.
 * Questions are intentionally simple to ensure success.
 */

import { Question, DBQuestion } from '../types';

// The special tutorial subtopic name
export const TUTORIAL_SUBTOPIC = 'Tutorial: Basics';

// Easy tutorial questions - users should get these right
export const TUTORIAL_QUESTIONS_EASY: DBQuestion[] = [
    {
        Question: 'What is 2 + 2?',
        A: '3',
        B: '4',
        C: '5',
        D: '6',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial',
        Explanation: 'Adding 2 and 2 gives you 4. Great job!'
    },
    {
        Question: 'Which word is spelled correctly?',
        A: 'Definately',
        B: 'Defanitely',
        C: 'Definitely',
        D: 'Definetely',
        CorrectAns: 'C',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial',
        Explanation: '"Definitely" is the correct spelling. A helpful trick: think "finite" in the middle!'
    },
    {
        Question: 'What is 10 - 3?',
        A: '6',
        B: '7',
        C: '8',
        D: '9',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial',
        Explanation: '10 minus 3 equals 7. You\'re doing great!'
    },
    {
        Question: 'Which sentence uses correct punctuation?',
        A: 'Hello how are you',
        B: 'Hello, how are you?',
        C: 'Hello how are you.',
        D: 'hello, how are you',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial',
        Explanation: 'Questions end with a question mark, and we use commas to separate clauses.'
    },
    {
        Question: 'What is 5 × 2?',
        A: '7',
        B: '8',
        C: '10',
        D: '12',
        CorrectAns: 'C',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial',
        Explanation: '5 times 2 equals 10. Multiplication is just repeated addition!'
    },
    {
        Question: 'Which is NOT a primary color?',
        A: 'Red',
        B: 'Blue',
        C: 'Yellow',
        D: 'Green',
        CorrectAns: 'D',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial',
        Explanation: 'The primary colors are red, blue, and yellow. Green is made by mixing blue and yellow!'
    },
    {
        Question: 'What is the capital of the United States?',
        A: 'New York',
        B: 'Los Angeles',
        C: 'Washington D.C.',
        D: 'Chicago',
        CorrectAns: 'C',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial',
        Explanation: 'Washington D.C. is the capital city of the United States.'
    },
    {
        Question: 'Which number comes next: 2, 4, 6, 8, ?',
        A: '9',
        B: '10',
        C: '11',
        D: '12',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial',
        Explanation: 'The pattern increases by 2 each time. 8 + 2 = 10!'
    }
];

// A deliberately tricky question for the "forced wrong" moment in tutorial
// This is designed to be confusing so the user gets it wrong
export const TUTORIAL_QUESTION_TRICKY: DBQuestion = {
    Question: 'This is a TRICK question! Please select the WRONG answer on purpose.\n\nWhat is 1 + 1?',
    A: '2 (This is correct - DON\'T pick this)',
    B: '11 (Pick this one!)',
    C: '3',
    D: '0',
    CorrectAns: 'A',  // The "correct" answer, but we tell them to pick wrong
    Type: TUTORIAL_SUBTOPIC,
    Difficulty: 'Easy',
    Source: 'Tutorial',
    Explanation: 'This was a trick question to show you what happens when you get something wrong. Don\'t worry - wrong answers help you learn! The question will now appear in your Training Queue.'
};

// Boss fight questions - still easy but formatted like real questions
export const TUTORIAL_BOSS_QUESTIONS: DBQuestion[] = [
    {
        Question: 'If a train travels 60 miles in 1 hour, how far will it travel in 2 hours at the same speed?',
        A: '60 miles',
        B: '90 miles',
        C: '120 miles',
        D: '180 miles',
        CorrectAns: 'C',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: 'Distance = Speed × Time. At 60 mph for 2 hours: 60 × 2 = 120 miles.'
    },
    {
        Question: 'Choose the sentence with the correct subject-verb agreement:\n\n"The group of students _____ ready for the test."',
        A: 'are',
        B: 'is',
        C: 'were',
        D: 'being',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: '"Group" is a singular collective noun, so it takes the singular verb "is".'
    },
    {
        Question: 'What is 15% of 100?',
        A: '10',
        B: '15',
        C: '20',
        D: '25',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: '15% means 15 out of 100, so 15% of 100 = 15.'
    },
    {
        Question: 'Which word is a synonym for "happy"?',
        A: 'Sad',
        B: 'Angry',
        C: 'Joyful',
        D: 'Tired',
        CorrectAns: 'C',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: '"Joyful" means full of joy or happiness - it\'s a synonym for happy!'
    },
    {
        Question: 'Solve for x: x + 5 = 12',
        A: 'x = 5',
        B: 'x = 7',
        C: 'x = 12',
        D: 'x = 17',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: 'Subtract 5 from both sides: x = 12 - 5 = 7.'
    },
    {
        Question: 'Which sentence contains a grammatical error?',
        A: 'She runs every morning.',
        B: 'They were playing soccer.',
        C: 'He don\'t like broccoli.',
        D: 'We are going to the store.',
        CorrectAns: 'C',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: '"He don\'t" should be "He doesn\'t" - singular subjects need singular verb forms.'
    },
    {
        Question: 'What is the area of a rectangle with length 5 and width 3?',
        A: '8',
        B: '15',
        C: '16',
        D: '20',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: 'Area of a rectangle = length × width = 5 × 3 = 15.'
    },
    {
        Question: 'Which word best completes the sentence?\n\n"Despite the rain, the team _____ to practice."',
        A: 'decided',
        B: 'deciding',
        C: 'decides',
        D: 'decision',
        CorrectAns: 'A',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: 'The sentence needs a past tense verb. "Decided" fits grammatically.'
    },
    {
        Question: 'If 3x = 15, what is the value of x?',
        A: '3',
        B: '5',
        C: '12',
        D: '45',
        CorrectAns: 'B',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: 'Divide both sides by 3: x = 15 ÷ 3 = 5.'
    },
    {
        Question: 'Which word is an antonym of "difficult"?',
        A: 'Hard',
        B: 'Challenging',
        C: 'Easy',
        D: 'Tough',
        CorrectAns: 'C',
        Type: TUTORIAL_SUBTOPIC,
        Difficulty: 'Easy',
        Source: 'Tutorial Boss',
        Explanation: 'An antonym is a word with the opposite meaning. "Easy" is the opposite of "difficult".'
    }
];

// Convert DBQuestion to Question format
export function convertTutorialQuestion(dbQ: DBQuestion): Question {
    return {
        question: dbQ.Question,
        options: [dbQ.A, dbQ.B, dbQ.C, dbQ.D],
        answerIndex: ['A', 'B', 'C', 'D'].indexOf(dbQ.CorrectAns),
        explanation: dbQ.Explanation || '',
        subtopic: TUTORIAL_SUBTOPIC,
        hasGraphic: false
    };
}

// Get questions for tutorial practice (returns 3 easy + 1 tricky)
export function getTutorialPracticeQuestions(): Question[] {
    const shuffled = [...TUTORIAL_QUESTIONS_EASY].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(convertTutorialQuestion);
}

// Get the tricky question for forced wrong answer
export function getTutorialTrickyQuestion(): Question {
    return convertTutorialQuestion(TUTORIAL_QUESTION_TRICKY);
}

// Get questions for tutorial boss fight
export function getTutorialBossQuestions(): Question[] {
    return TUTORIAL_BOSS_QUESTIONS.map(convertTutorialQuestion);
}

// Get a random easy tutorial question
export function getRandomTutorialQuestion(): Question {
    const randomIndex = Math.floor(Math.random() * TUTORIAL_QUESTIONS_EASY.length);
    return convertTutorialQuestion(TUTORIAL_QUESTIONS_EASY[randomIndex]);
}
