// Dev-only harness: mounts ReviewView with mock props so answer selection,
// the explanation/strategy-tip panel, and the Report Question modal can be
// tested without auth. Served at /review-test.html.
import React from 'react';
import ReactDOM from 'react-dom/client';
import ReviewView from '../components/ReviewView';
import { Question } from '../types';

const LONG_STEM =
    'In a study of urban commuter behavior conducted across twelve metropolitan areas over a period of five years, researchers observed that when public transit fare prices increased by more than fifteen percent within a single fiscal year, ridership among commuters earning less than the median household income declined disproportionately compared to higher-income commuters, even after controlling for the availability of alternative transportation options, employer-subsidized transit benefits, and the average commute distance across the sampled population. Which choice most logically completes the argument the researchers are making about the relationship between fare elasticity and income?';

const LONG_OPTIONS: string[] = [
    'Fare increases have a uniformly negative effect on ridership regardless of income level, because all commuters face the same nominal price increase and therefore respond to transit cost changes in essentially identical, income-independent ways across every metropolitan area studied.',
    'Lower-income commuters are more price-sensitive to fare increases than higher-income commuters, suggesting that transit agencies should consider income-based fare structures to avoid disproportionately burdening economically vulnerable riders who have fewer alternative transportation options available to them.',
    'The observed decline in ridership is best explained by seasonal variation in commuting patterns rather than by the fare increases themselves, since the study did not adequately control for weather, school calendars, or other confounding seasonal factors across the twelve metropolitan areas.',
    'Employer-subsidized transit benefits fully offset the effect of fare increases for all commuters, meaning that the disproportionate decline in ridership among lower-income commuters must be attributed entirely to factors unrelated to the fare increases described in the study.',
];

const mockQuestions: Question[] = [
    {
        question: LONG_STEM,
        options: LONG_OPTIONS,
        answerIndex: 1,
        explanation:
            'The passage explicitly states that the decline in ridership was disproportionate among lower-income commuters "even after controlling for" alternative transportation, subsidies, and commute distance — meaning the income-based price sensitivity persists independent of those other factors. This directly supports choice B: lower-income riders are more elastic (price-sensitive) with respect to fare changes. Choices A, C, and D each contradict a detail explicitly ruled out or stated in the passage.',
        subtopic: 'Command of Evidence',
        hasGraphic: false,
    },
    {
        question: 'If 3x + 5 = 20, what is the value of x?',
        options: ['3', '5', '10', '15'],
        answerIndex: 1,
        explanation: 'Subtract 5 from both sides: 3x = 15. Divide both sides by 3: x = 5.',
        subtopic: 'Linear Equations',
        hasGraphic: false,
    },
    {
        question: 'Which choice best maintains the tone established in the passage?',
        options: [
            'The committee reluctantly agreed to postpone the vote.',
            'The committee, like, totally did not want to postpone the vote lol.',
            'The committee begrudgingly opted to delay balloting procedures.',
            'The committee said "no way" to delaying the vote.',
        ],
        answerIndex: 0,
        explanation: 'The passage is formal in register throughout, so the correct choice must avoid slang ("like, totally"), overly casual phrasing ("no way"), and needlessly ornate diction ("balloting procedures") — option A is the plain, consistently formal choice.',
        subtopic: 'Rhetorical Synthesis',
        hasGraphic: false,
    },
];

const Harness: React.FC = () => {
    const handleAnswer = (question: Question, isCorrect: boolean) => {
        console.log('[harness] onAnswer', { subtopic: question.subtopic, isCorrect });
    };

    const handleExit = () => {
        console.log('[harness] onExit called');
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <ReviewView
                questions={mockQuestions}
                onAnswer={handleAnswer}
                onExit={handleExit}
                userId="test-uid"
                userEmail="test@example.com"
            />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
