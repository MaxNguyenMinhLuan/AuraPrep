import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface FormattedTextProps {
    text: string;
    className?: string;
}

const preProcessMath = (text: string): string => {
    if (!text) return '';

    let processed = text;

    // Convert raw \pi or \\pi to pi symbol π
    processed = processed.replace(/\\+pi\b/gi, 'π');

    // Convert LaTeX display math delimiters \[ ... \] or \\[ ... \\] to $$
    processed = processed.replace(/\\+\[([\s\S]*?)\\+\]/g, '$$$$$1$$$$');

    // Convert LaTeX inline math delimiters \( ... \) or \\( ... \\) to $
    processed = processed.replace(/\\+\(([\s\S]*?)\\+\)/g, '$$$1$$');

    return processed;
};

const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
    const preprocessed = preProcessMath(text);
    // Protect LaTeX block math from being double spaced, which breaks remark-math
    const parts = preprocessed.split(/(\$\$[\s\S]*?\$\$)/);
    const doubleSpacedText = parts.map(part => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            return part; // Leave math blocks exactly as they are
        }
        // Standardize carriage returns and replace single newlines with double newlines
        return part.replace(/\r\n/g, '\n').replace(/(?<!\n)\n(?!\n)/g, '\n\n');
    }).join('');

    return (
        <div className={`formatted-text leading-relaxed select-text font-medium ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {doubleSpacedText}
            </ReactMarkdown>
        </div>
    );
};

export default FormattedText;
