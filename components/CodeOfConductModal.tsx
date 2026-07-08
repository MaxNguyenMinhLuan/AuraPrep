import React from 'react';

interface CodeOfConductModalProps {
    onClose: () => void;
}

const CodeOfConductModal: React.FC<CodeOfConductModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border-2 border-secondary overflow-hidden animate-reveal flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="bg-primary p-5 text-center relative flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-lg"
                    >
                        ✕
                    </button>
                    <h2 className="text-white font-serif text-xl font-bold">User Code of Conduct</h2>
                    <p className="text-white/80 text-[10px] uppercase tracking-widest mt-1">AuraPrep Closed Beta Rules</p>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-4 text-text-main leading-relaxed text-sm select-none scrollbar-thin">
                    <section className="space-y-1.5">
                        <h3 className="font-bold text-primary text-xs uppercase tracking-wider">1. Academic Integrity</h3>
                        <p className="text-xs text-text-dim">
                            AuraPrep is built to help you master the SAT. By participating in this beta, you agree to complete all missions, boss battles, and training tasks honestly. Do not utilize third-party scripts, bots, or exploit unintended software bugs to inflate your Aura score.
                        </p>
                    </section>

                    <section className="space-y-1.5">
                        <h3 className="font-bold text-primary text-xs uppercase tracking-wider">2. Leaderboard & Conduct</h3>
                        <p className="text-xs text-text-dim">
                            Healthy competition makes us all stronger. You agree to use appropriate and respectful usernames. Any offensive language, hate speech, or harassment in usernames or user profiles will result in immediate and permanent revocation of beta access.
                        </p>
                    </section>

                    <section className="space-y-1.5">
                        <h3 className="font-bold text-primary text-xs uppercase tracking-wider">3. Confidentiality Obligations</h3>
                        <p className="text-xs text-text-dim">
                            The designs, mechanics, code, and educational content of AuraPrep are strictly confidential. In accordance with your NDA, do not capture screenshots, record video, or publicly share details of the app interface, summoning portal, or gameplay loops.
                        </p>
                    </section>

                    <section className="space-y-1.5">
                        <h3 className="font-bold text-primary text-xs uppercase tracking-wider">4. Constructive Collaboration</h3>
                        <p className="text-xs text-text-dim">
                            Your feedback directly shapes the future of the app. Please report bugs, typos, or suggestions through the official channels. Let's work together to build the ultimate SAT prep experience.
                        </p>
                    </section>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-[11px] text-primary font-medium text-center">
                        Violation of these guidelines will result in account suspension and allowlist removal.
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-background border-t border-secondary/20 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="bg-highlight hover:bg-highlight/90 text-white font-bold py-2.5 px-6 rounded-xl border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all text-xs"
                    >
                        I UNDERSTAND
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodeOfConductModal;
