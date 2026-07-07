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
    return (
        <div className={`formatted-text leading-relaxed select-text ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
};

export default FormattedText;
