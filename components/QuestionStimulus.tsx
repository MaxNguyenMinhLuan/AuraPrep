
import React from 'react';
import { Question } from '../types';
import QuestionGraph from './QuestionGraph';
import ChartRenderer from './ChartRenderer';
import TableRenderer from './TableRenderer';
import GeometryFigureRenderer from './GeometryFigureRenderer';

interface QuestionStimulusProps {
    question: Question;
}

/**
 * Renders the math/data stimulus that sits beside a question's prompt: v1's
 * graphData, or v2's structured chart/table/figure stimulus. Reading
 * stimulus (passage / passages / notes) is handled separately by
 * PassagePane + TwoPaneQuestion, since that belongs in its own pane, not
 * inline above the prompt. All fields are optional so v1-shaped questions
 * render unchanged — see architecture/reversibility.md.
 */
const QuestionStimulus: React.FC<QuestionStimulusProps> = ({ question }) => {
    return (
        <>
            {question.graphData && <QuestionGraph data={question.graphData} />}

            {question.stimulus?.kind === 'chart' && <ChartRenderer data={question.stimulus} />}
            {question.stimulus?.kind === 'table' && <TableRenderer data={question.stimulus} />}
            {question.stimulus?.kind === 'figure' && <GeometryFigureRenderer data={question.stimulus} />}
        </>
    );
};

export default QuestionStimulus;
