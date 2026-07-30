
import React from 'react';
import { Question } from '../types';
import FormattedText from './FormattedText';

interface PassagePaneProps {
    question: Question;
}

/**
 * The reading-stimulus side of the Bluebook-style two-pane layout: a single
 * passage, a Cross-Text Connections pair, or Rhetorical Synthesis' bulleted
 * notes. Only ever rendered when TwoPaneQuestion detects one of these
 * fields is present — see that component for the single-column fallback.
 */
const PassagePane: React.FC<PassagePaneProps> = ({ question }) => {
    if (question.passage) {
        return (
            <div className="h-full overflow-y-auto p-4 md:p-5">
                <FormattedText className="text-sm md:text-base leading-relaxed font-clean" text={question.passage} />
            </div>
        );
    }

    if (question.passages && question.passages.length > 0) {
        return (
            <div className="h-full overflow-y-auto p-4 md:p-5 space-y-4">
                {question.passages.map((text, i) => (
                    <div key={i}>
                        <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Text {i + 1}</p>
                        <FormattedText className="text-sm md:text-base leading-relaxed font-clean" text={text} />
                    </div>
                ))}
            </div>
        );
    }

    if (question.notes && question.notes.length > 0) {
        return (
            <div className="h-full overflow-y-auto p-4 md:p-5">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-3">Research Notes</p>
                <ul className="list-disc list-outside pl-5 space-y-2">
                    {question.notes.map((note, i) => (
                        <li key={i} className="text-sm md:text-base font-clean">
                            <FormattedText className="inline" text={note} />
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return null;
};

export default PassagePane;
