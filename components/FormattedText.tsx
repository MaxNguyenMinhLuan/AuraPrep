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

    // 1. Convert LaTeX display math delimiters \[ ... \] or \\[ ... \\] to $$
    processed = processed.replace(/\\+\[([\s\S]*?)\\+\]/g, '$$$$$1$$$$');

    // 2. Convert LaTeX inline math delimiters \( ... \) or \\( ... \\) to $
    processed = processed.replace(/\\+\(([\s\S]*?)\\+\)/g, '$$$1$$');

    // 3. Convert markdown italics containing backslashes (like *\frac{1}{3}*) to math blocks
    processed = processed.replace(/\*([^*]*\\[^*]*)\*/g, '$$$1$$');

    // 4. Convert markdown italics that look like math equations or variables (e.g., *y*, *3y*, *3y = x - 12*) to $...$
    processed = processed.replace(/\*([^*]+)\*/g, (match, p1) => {
        const trimmed = p1.trim();
        
        // If it's a single letter variable
        const isSingleLetter = /^[a-zA-Z]$/.test(trimmed);
        
        // If it has standard mathematical structures (e.g. x^2, 3y, -2, x + y, y = mx + b)
        const hasMathStructure = 
            /^[+-]?\d+$/.test(trimmed) || // just a number (e.g. *12*, *-3*)
            /^[a-zA-Z]\d+$/.test(trimmed) || // letter + number (e.g. *x2*)
            /^\d+[a-zA-Z]$/.test(trimmed) || // number + letter (e.g. *3y*, *2x*)
            /[=+\/^<>≤≥≠]/g.test(trimmed) || // explicit math operators
            ( /-/g.test(trimmed) && !/[a-zA-Z]{2,}-[a-zA-Z]{2,}/.test(trimmed) ); // hyphen but not a word-word link (like y-intercept)
            
        if (isSingleLetter || hasMathStructure) {
            return `$${trimmed}$`;
        }
        return match;
    });

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
                components={{
                    // Tailwind's preflight removes paragraph margins. Restore a
                    // deliberate gap so a passage and its prompt never run together.
                    p: ({ children }) => <p style={{ marginBottom: '1.25rem' }}>{children}</p>
                }}
            >
                {doubleSpacedText}
            </ReactMarkdown>
        </div>
    );
};

export default FormattedText;
