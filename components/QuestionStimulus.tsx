
import React from 'react';
import { Question } from '../types';
import QuestionGraph from './QuestionGraph';
import FormattedText from './FormattedText';

interface QuestionStimulusProps {
    question: Question;
}

/**
 * Renders whatever stimulus a question carries ahead of its prompt: v1's
 * graphData, or v2's passage / passages (Cross-Text Connections) / notes
 * (Rhetorical Synthesis). All fields are optional so v1-shaped questions
 * render unchanged — see architecture/reversibility.md.
 *
 * This is single-column today; Workstream D wraps it in a real two-pane
 * Bluebook-style layout without changing what's inside each pane.
 */
const QuestionStimulus: React.FC<QuestionStimulusProps> = ({ question }) => {
    return (
        <>
            {question.graphData && <QuestionGraph data={question.graphData} />}

            {question.passage && (
                <div className="mb-4 md:mb-6 p-4 bg-background/50 border-2 border-secondary/20 rounded-lg max-h-64 overflow-y-auto">
                    <FormattedText className="text-sm md:text-base leading-relaxed font-clean" text={question.passage} />
                </div>
            )}

            {question.passages && question.passages.length > 0 && (
                <div className="mb-4 md:mb-6 space-y-3">
                    {question.passages.map((text, i) => (
                        <div key={i} className="p-4 bg-background/50 border-2 border-secondary/20 rounded-lg max-h-48 overflow-y-auto">
                            <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Text {i + 1}</p>
                            <FormattedText className="text-sm md:text-base leading-relaxed font-clean" text={text} />
                        </div>
                    ))}
                </div>
            )}

            {question.notes && question.notes.length > 0 && (
                <div className="mb-4 md:mb-6 p-4 bg-background/50 border-2 border-secondary/20 rounded-lg">
                    <ul className="list-disc list-inside space-y-1.5">
                        {question.notes.map((note, i) => (
                            <li key={i} className="text-sm md:text-base font-clean">
                                <FormattedText className="inline" text={note} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* question.stimulus (chart/table/figure renderers) lands here in Workstream D */}
        </>
    );
};

export default QuestionStimulus;
