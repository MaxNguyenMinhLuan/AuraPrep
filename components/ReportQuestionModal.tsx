
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
                className="genshin-modal p-6 max-w-sm w-full animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {submitted ? (
                    <div className="text-center py-4 animate-fadeIn">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="font-bold text-success">Thanks — your report was sent!</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-lg font-bold text-highlight mb-1 text-center">
                            Report This Question
                        </h2>
                        <div className="genshin-divider mb-3" />
                        <p className="text-xs text-text-dim mb-3 leading-relaxed">
                            What's wrong with it? (typo, wrong answer marked correct, confusing wording, etc.)
                        </p>
                        <textarea
                            autoFocus
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe the issue..."
                            rows={4}
                            className="w-full p-3 bg-background border-2 border-secondary/40 rounded-lg text-sm text-text-main resize-none focus:outline-none focus:border-highlight/70 focus:shadow-[0_0_0_2px_rgba(232,200,131,0.25)]"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 genshin-btn-dark font-bold py-2.5 uppercase tracking-widest text-[11px]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!reason.trim()}
                                className="flex-1 genshin-btn-light font-bold py-2.5 uppercase tracking-widest text-[11px] disabled:opacity-50"
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
