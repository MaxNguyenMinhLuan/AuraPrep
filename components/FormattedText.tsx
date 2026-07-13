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
    // Protect LaTeX block math from being double spaced, which breaks remark-math
    const parts = text.split(/(\$\$[\s\S]*?\$\$)/);
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
