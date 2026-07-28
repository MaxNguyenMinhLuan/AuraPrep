
import React, { useState } from 'react';

interface ReportQuestionModalProps {
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

const ReportQuestionModal: React.FC<ReportQuestionModalProps> = ({ onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        const trimmed = reason.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setSubmitted(true);
        setTimeout(onClose, 1200);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-surface border-4 border-accent p-6 max-w-sm w-full shadow-card-hover animate-scaleIn rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {submitted ? (
                    <div className="text-center py-4 animate-fadeIn">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="font-bold text-success">Thanks — your report was sent!</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-lg font-bold text-highlight mb-2 flex items-center gap-2">
                            🚩 Report This Question
                        </h2>
                        <p className="text-xs text-text-dim mb-3 leading-relaxed">
                            What's wrong with it? (typo, wrong answer marked correct, confusing wording, etc.)
                        </p>
                        <textarea
                            autoFocus
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe the issue..."
                            rows={4}
                            className="w-full p-3 bg-background border-2 border-secondary/30 rounded-lg text-sm text-text-main resize-none focus:outline-none focus:border-accent"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-secondary text-primary font-bold py-2.5 border-b-4 border-secondary-hover rounded-xl press-effect transition-premium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!reason.trim()}
                                className="flex-1 bg-accent text-white font-bold py-2.5 border-b-4 border-accent-dark rounded-xl press-effect transition-premium disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportQuestionModal;
