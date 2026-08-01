import React from 'react';

interface CalculatorButtonProps {
    className?: string;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ className = '' }) => (
    <button
        onClick={() => window.open('https://www.desmos.com/calculator', '_blank', 'noopener,noreferrer')}
        className={`bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 touch-target text-sm font-bold rounded-lg transition-premium press-effect ${className}`}
        title="Opens the Desmos calculator in a new tab"
    >
        Calculator
    </button>
);

export default CalculatorButton;
