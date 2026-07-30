
import React from 'react';
import { Question } from '../types';
import PassagePane from './PassagePane';

interface TwoPaneQuestionProps {
    question: Question;
    children: React.ReactNode;
}

/**
 * Bluebook-style layout: when a question carries a reading stimulus
 * (passage / passages / notes), splits into a left reading pane and a
 * right pane holding the prompt + choices (passed as children — this
 * component only handles layout, not question-answering behavior, so it
 * drops into any of the app's question-rendering call sites unchanged).
 * Questions with no reading stimulus (most math, and R/W items testing a
 * single sentence) render children directly in a single column, matching
 * today's behavior exactly.
 *
 * Desktop: side-by-side panes with a visible divider, each independently
 * scrollable. Mobile: passage collapses into a toggle above the question
 * so both stay reachable without competing for the same viewport.
 */
const TwoPaneQuestion: React.FC<TwoPaneQuestionProps> = ({ question, children }) => {
    const hasPassage = !!(question.passage || (question.passages && question.passages.length > 0) || (question.notes && question.notes.length > 0));

    if (!hasPassage) {
        return <>{children}</>;
    }

    const [showPassageOnMobile, setShowPassageOnMobile] = React.useState(true);

    return (
        <div className="lg:flex lg:gap-0 lg:min-h-[420px] lg:border-2 lg:border-secondary/30 lg:rounded-xl lg:overflow-hidden lg:shadow-card">
            {/* Mobile: collapsible passage toggle */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setShowPassageOnMobile(prev => !prev)}
                    className="w-full flex justify-between items-center px-4 py-2.5 bg-secondary/20 border-2 border-secondary/30 rounded-lg text-xs font-bold text-text-main"
                >
                    <span>{showPassageOnMobile ? 'Hide' : 'Show'} Passage</span>
                    <span className="text-text-dim">{showPassageOnMobile ? '▲' : '▼'}</span>
                </button>
                {showPassageOnMobile && (
                    <div className="mt-2 max-h-64 overflow-y-auto bg-background/50 border-2 border-secondary/20 rounded-lg">
                        <PassagePane question={question} />
                    </div>
                )}
            </div>

            {/* Desktop: side-by-side panes */}
            <div className="hidden lg:block lg:w-1/2 bg-background/50 border-r-2 border-secondary/30 overflow-y-auto">
                <PassagePane question={question} />
            </div>
            <div className="lg:w-1/2 lg:overflow-y-auto lg:p-5">
                {children}
            </div>
        </div>
    );
};

export default TwoPaneQuestion;
