// Dev-only harness: mounts MissionView with mock props so tabs/modals/overflow
// can be tested without auth. Served at /mission-test.html.
// Includes DOUBLE_JEOPARDY power-up in inventory to test the Double Jeopardy
// modal, and one question with an intentionally long stem/passage to probe
// overflow while a question is active.
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import MissionView from '../components/MissionView';
import { MissionInstance, PowerUpType, Question } from '../types';

const LONG_STEM_TEXT = `In the passage below, the author describes a sprawling, multi-clause argument about the socioeconomic effects of a proposed municipal transit expansion, weaving together statistical claims, historical precedent from three separate decades of urban planning literature, and a rhetorical question intended to challenge the reader's assumptions about commuting patterns, before finally arriving — after a lengthy parenthetical aside about comparable mid-sized cities in the Rust Belt and the Pacific Northwest — at the actual claim the question wants you to identify, which is deliberately buried beneath several qualifying clauses and an extended em-dash interruption so that even careful readers must slow down and re-read the sentence twice to correctly isolate the main clause from its many, many modifiers.`;

const QUESTIONS: Question[] = [
    {
        question: 'Which choice best describes the function of the underlined portion of the text?',
        options: [
            'It introduces a counterargument that the author later refutes.',
            'It provides statistical evidence supporting the central claim.',
            'It offers a historical analogy to contextualize the argument.',
            'It transitions from a general claim to a specific example.',
        ],
        answerIndex: 3,
        explanation: 'The underlined portion moves from a broad generalization ("many cities struggle with transit") to a specific, concrete example, which is a classic general-to-specific transition.',
        subtopic: 'Rhetorical Synthesis',
        hasGraphic: false,
    },
    {
        question: LONG_STEM_TEXT,
        options: [
            'The transit expansion will reduce commute times for most residents, though the benefits will be unevenly distributed across neighborhoods depending on proximity to new stations.',
            'Municipal budgets cannot sustain the proposed expansion without significant tax increases over the next decade.',
            'Historical precedent from comparable cities suggests transit expansions rarely meet ridership projections.',
            'The rhetorical question posed by the author is meant to be answered negatively by an informed reader.',
        ],
        answerIndex: 0,
        explanation: 'Despite the lengthy buildup, the author\'s actual claim — buried after the em-dash — is that commute times will fall, but unevenly. Every other option restates a supporting point, not the main claim.',
        subtopic: 'Command of Evidence',
        hasGraphic: false,
        passage: 'This is a companion passage included to test the scrollable stimulus panel: ' + LONG_STEM_TEXT + ' ' + LONG_STEM_TEXT,
    },
    {
        question: 'Based on the graph, which year saw the largest year-over-year increase in ridership?',
        options: ['2019', '2020', '2021', '2022'],
        answerIndex: 2,
        explanation: 'Ridership jumped most sharply between 2020 and 2021 as pandemic restrictions eased, visible as the steepest segment on the line graph.',
        subtopic: 'Data Analysis',
        hasGraphic: true,
        graphData: {
            type: 'line',
            labels: { x: 'Year (0=2018)', y: 'Ridership (thousands)' },
            points: [
                { x: 0, y: 120 },
                { x: 1, y: 135 },
                { x: 2, y: 90 },
                { x: 3, y: 210 },
                { x: 4, y: 240 },
            ],
        },
    },
    {
        question: 'Which of the following best replaces the underlined word to match the tone of the passage?',
        options: ['ubiquitous', 'common', 'widespread', 'prevalent'],
        answerIndex: 2,
        explanation: '"Widespread" matches the passage\'s slightly formal but accessible tone better than the more academic "ubiquitous" or "prevalent."',
        subtopic: 'Words in Context',
        hasGraphic: false,
    },
    {
        question: 'The author includes the research notes primarily to:',
        options: [
            'Provide competing viewpoints on the topic.',
            'Establish the credibility of the central claim.',
            'Summarize prior scholarship for context.',
            'Set up a synthesis question about combining sources.',
        ],
        answerIndex: 3,
        explanation: 'This is a classic Rhetorical Synthesis setup — bullet notes are provided so the question can ask you to combine or select from them.',
        subtopic: 'Rhetorical Synthesis',
        hasGraphic: false,
        notes: [
            'Note 1: Transit ridership fell 25% in 2020 across all major metro systems studied.',
            'Note 2: Cities that paired expansion with fare subsidies saw faster ridership recovery.',
            'Note 3: Rust Belt cities historically lag Pacific Northwest cities in adoption by 3-5 years.',
        ],
    },
];

const createMission = (overrides?: Partial<MissionInstance>): MissionInstance => ({
    id: 'test-mission-1',
    title: 'Daily Grind',
    description: 'Answer 5 questions correctly in a row to complete this mission.',
    subtopic: 'Reading & Writing',
    questionCount: QUESTIONS.length,
    reward: 150,
    xp: 75,
    difficulty: 'Medium',
    completed: false,
    progress: 0,
    correctAnswers: 0,
    questions: QUESTIONS,
    ...overrides,
});

const Harness: React.FC = () => {
    const [mission, setMission] = useState<MissionInstance>(createMission);
    const [inventory, setInventory] = useState<{ [key in PowerUpType]?: number }>({
        DOUBLE_JEOPARDY: 2,
        ELIMINATE: 3,
        SKIP: 1,
        HINT: 4,
        SECOND_CHANCE: 2,
    });
    const [log, setLog] = useState<string[]>([]);

    const appendLog = (msg: string) => setLog(l => [...l.slice(-9), msg]);

    const handleAnswer = (missionId: string, isCorrect: boolean, forceEarlyEnd?: boolean, loseAllRewards?: boolean) => {
        appendLog(`onAnswer(${missionId}, correct=${isCorrect}, forceEarlyEnd=${!!forceEarlyEnd}, loseAllRewards=${!!loseAllRewards})`);
        setMission(m => {
            if (forceEarlyEnd) {
                // Mirror App.tsx-style behavior: early end completes/exits the mission.
                return { ...m, completed: true };
            }
            if (isCorrect) {
                const nextProgress = m.progress + 1;
                if (nextProgress >= m.questionCount) {
                    return { ...m, progress: nextProgress, correctAnswers: m.correctAnswers + 1, completed: true };
                }
                return { ...m, progress: nextProgress, correctAnswers: m.correctAnswers + 1 };
            }
            // Wrong answer with no Double Jeopardy save: streak resets to 0.
            return { ...m, progress: 0 };
        });
    };

    const handleExit = () => {
        appendLog('onExit() called');
    };

    const consumePowerUp = (type: PowerUpType) => {
        appendLog(`consumePowerUp(${type})`);
        setInventory(inv => ({ ...inv, [type]: Math.max(0, (inv[type] || 0) - 1) }));
    };

    const resetMission = () => {
        setMission(createMission());
        setLog([]);
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between gap-2 flex-wrap">
                <button
                    onClick={resetMission}
                    className="text-[10px] bg-secondary text-primary font-bold px-3 py-2 rounded-lg"
                    data-testid="harness-reset"
                >
                    Reset Mission
                </button>
                <div className="text-[9px] text-text-dim" data-testid="harness-log">
                    {log.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>
            <div className="max-w-2xl mx-auto">
                <MissionView
                    mission={mission}
                    onAnswer={handleAnswer}
                    onExit={handleExit}
                    inventory={inventory}
                    consumePowerUp={consumePowerUp}
                    userId="test-uid"
                    userEmail="test@example.com"
                />
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
