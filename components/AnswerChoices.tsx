
import React from 'react';
import FormattedText from './FormattedText';

type AnswerChoicesVariant = 'standard' | 'compact' | 'boss';

interface AnswerChoicesProps {
    options: string[];
    answerIndex: number;
    selectedAnswer: number | null;
    isCorrect: boolean | null;
    onSelect: (index: number) => void;
    /** Boss-fight power-ups: indices removed by ELIMINATE. */
    hiddenIndices?: number[];
    /** Boss-fight power-ups: indices locked out (e.g. during a modal). */
    disabledIndices?: number[];
    /** External gate (e.g. a "resetting after wrong answer" transition state). */
    disabled?: boolean;
    variant?: AnswerChoicesVariant;
    /** Override the options-list wrapper spacing (defaults per-variant below). */
    spacingClassName?: string;
}

const VARIANT_CLASSES: Record<AnswerChoicesVariant, { button: string; letter: string; showIcons: boolean }> = {
    standard: {
        button: 'p-3 md:p-4 transition-premium rounded-xl touch-target press-effect shadow-card hover:shadow-card-hover',
        letter: 'font-bold mr-2 text-primary',
        showIcons: true,
    },
    compact: {
        button: 'p-3 transition-all duration-200 rounded-md shadow-sm',
        letter: 'font-bold mr-2',
        showIcons: true,
    },
    boss: {
        button: 'p-4 transition-all duration-200 rounded-md',
        letter: 'font-bold mr-2 text-primary',
        showIcons: false,
    },
};

/**
 * Shared lettered answer-choice list used by every question-answering
 * surface (missions, review/training, practice, boss fights, the welcome
 * mission). `variant` reproduces each surface's prior visual treatment
 * exactly — this consolidation is functional parity, not a redesign; the
 * Bluebook-style visual pass lands in Workstream D.
 */
const AnswerChoices: React.FC<AnswerChoicesProps> = ({
    options,
    answerIndex,
    selectedAnswer,
    isCorrect,
    onSelect,
    hiddenIndices = [],
    disabledIndices = [],
    disabled = false,
    variant = 'standard',
    spacingClassName,
}) => {
    const { button, letter, showIcons } = VARIANT_CLASSES[variant];
    const defaultSpacing = variant === 'boss' ? 'space-y-4' : 'space-y-2 md:space-y-3';

    return (
        <div className={spacingClassName ?? defaultSpacing}>
            {options.map((option, index) => {
                if (hiddenIndices.includes(index)) {
                    return (
                        <div key={index} className="w-full h-14 border-2 border-dashed border-text-dark/20 flex items-center justify-center text-text-dark/30 text-[8px] rounded-md">
                            Eliminated
                        </div>
                    );
                }

                const isLockedOut = disabledIndices.includes(index);
                let buttonClass = `w-full text-left ${button} border-2 flex justify-between items-center `;
                let icon: React.ReactNode = null;

                if (selectedAnswer === null) {
                    buttonClass += isLockedOut
                        ? 'bg-text-dark/10 border-text-dark/30 text-text-dim cursor-not-allowed opacity-60'
                        : 'bg-surface hover:bg-secondary/30 active:bg-secondary/30 border-secondary/30';
                } else if (index === answerIndex) {
                    buttonClass += 'bg-success/10 border-success text-success font-bold shadow-glow-success animate-successPop';
                    if (showIcons) {
                        icon = (
                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        );
                    }
                } else if (index === selectedAnswer && !isCorrect) {
                    buttonClass += 'bg-accent/10 border-accent text-accent font-bold';
                    if (showIcons) {
                        icon = (
                            <svg className="w-5 h-5 text-accent animate-shake" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        );
                    }
                } else {
                    buttonClass += 'bg-surface opacity-50 border-text-dark/20';
                }

                return (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        disabled={selectedAnswer !== null || isLockedOut || disabled}
                        className={buttonClass}
                    >
                        <span className="text-xs md:text-sm flex items-start text-left">
                            <span className={letter}>{String.fromCharCode(65 + index)}.</span>
                            <FormattedText className="inline text-sm md:text-base font-clean" text={option} />
                        </span>
                        {icon && <span className="ml-2 flex-shrink-0">{icon}</span>}
                    </button>
                );
            })}
        </div>
    );
};

export default AnswerChoices;
