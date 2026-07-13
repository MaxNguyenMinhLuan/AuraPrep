import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface FormattedTextProps {
    text: string;
    className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
    // Standardize all carriage returns, then replace any single newlines that aren't already part of a double newline
    const doubleSpacedText = text
        .replace(/\r\n/g, '\n')
        .replace(/(?<!\n)\n(?!\n)/g, '\n\n');

    return (
        <div className={`formatted-text leading-relaxed select-text ${className}`}>
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
