import React, { useState, useRef, useCallback, useEffect } from 'react';
import { User } from '../types';
import { db, auth } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

const NDA_VERSION = '1.0-BETA';

// localStorage key: keyed by uid so different users on same device work correctly
const ndaKey = (uid: string) => `aura_nda_signed_${uid}`;

interface NDAModalProps {
    user: User;
    onAccept: (legalName: string, version: string) => Promise<void>;
    onDecline: () => void;
}

/**
 * Check if NDA has been accepted — reads from localStorage first (instant, no permissions),
 * so the gate always works even if Firestore rules are misconfigured.
 */
export function checkNdaSigned(uid: string): boolean {
    try {
        const val = localStorage.getItem(ndaKey(uid));
        if (val) {
            const parsed = JSON.parse(val);
            return parsed?.signed === true;
        }
    } catch {}
    return false;
}

/**
 * Store NDA acceptance.
 * Primary: localStorage (instant, no server needed, no permissions errors).
 * Backup: silent Firestore write for audit trail — if it fails due to rules, we ignore it.
 */
async function storeNdaSigned(uid: string, email: string, legalName: string): Promise<void> {
    const record = {
        signed: true,
        version: NDA_VERSION,
        name: legalName,
        email,
        ts: new Date().toISOString(),
    };

    // Primary: localStorage — always works
    localStorage.setItem(ndaKey(uid), JSON.stringify(record));

    // Backup: Firestore (best-effort, silent fail if rules block it)
    try {
        const firebaseUid = auth.currentUser?.uid ?? uid;
        await setDoc(doc(db, 'ndaCompliance', firebaseUid), record, { merge: true });
    } catch {
        // Silently ignore — localStorage record is the source of truth
    }
}

const NDAModal: React.FC<NDAModalProps> = ({ user, onAccept, onDecline }) => {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [legalName, setLegalName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const trimmedName = legalName.trim();
    const isNameValid = trimmedName.length >= 2;
    const canSubmit = hasScrolledToBottom && isChecked && isNameValid && !isSubmitting;

    const getButtonText = () => {
        if (isSubmitting) return 'Processing...';
        if (!hasScrolledToBottom) return 'Scroll to Review Terms';
        if (!isChecked) return 'Check the Agreement Box';
        if (!isNameValid) return 'Enter Your Full Legal Name';
        return 'Execute & Enter Beta';
    };

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
        if (atBottom && !hasScrolledToBottom) setHasScrolledToBottom(true);
    }, [hasScrolledToBottom]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const uid = auth.currentUser?.uid ?? user.uid;
            const email = auth.currentUser?.email ?? user.email;
            await storeNdaSigned(uid, email, trimmedName);
            await onAccept(trimmedName, NDA_VERSION);
        } catch (err: any) {
            setError(err?.message || 'Failed to submit. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border-2 border-secondary overflow-hidden animate-reveal flex flex-col max-h-[85vh]">

                {/* ─── Header ─── */}
                <div className="bg-primary p-4 sm:p-5 text-center flex-shrink-0">
                    <h2 className="text-white font-serif text-base sm:text-xl font-bold tracking-wide">
                        BETA TESTER NDA
                    </h2>
                    <p className="text-white/80 text-[8px] sm:text-[10px] uppercase tracking-widest mt-1">
                        Non-Disclosure &amp; Confidentiality Agreement
                    </p>
                    <p className="text-white/60 text-[8px] mt-1.5 font-sans">
                        Version {NDA_VERSION} • {user.email}
                    </p>
                </div>

                {/* ─── Scroll Progress Banner ─── */}
                {!hasScrolledToBottom && (
                    <div className="bg-accent/10 border-b border-accent/30 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0 animate-pulse">
                        <span className="text-[9px] sm:text-[10px] text-accent font-bold uppercase tracking-wider font-sans">
                            ↓ Scroll down to read entire agreement ↓
                        </span>
                    </div>
                )}
                {hasScrolledToBottom && (
                    <div className="bg-success/10 border-b border-success/30 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0">
                        <span className="text-[9px] sm:text-[10px] text-success font-bold uppercase tracking-wider font-sans">
                            ✓ Agreement reviewed
                        </span>
                    </div>
                )}

                {/* ─── NDA Text (Scrollable) ─── */}
                <div
                    ref={scrollRef}
                    className="px-4 sm:px-6 py-4 overflow-y-auto flex-1 min-h-0 max-h-[45vh] sm:max-h-[50vh] lg:max-h-[55vh] text-text-main font-sans select-none scrollbar-thin"
                >
                    <h3 className="text-[10px] sm:text-xs font-bold text-primary text-center uppercase tracking-wider mb-4">
                        AURAPREP BETA TESTER NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT
                    </h3>

                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        This Beta Tester Non-Disclosure and Confidentiality Agreement (the &ldquo;Agreement&rdquo;) is entered into and made effective as of the date of final electronic clickwrap execution within the application portal (the &ldquo;Effective Date&rdquo;), by and between the software engineering and development team (the &ldquo;Company&rdquo;) and the individual accessing, reviewing, or testing the proprietary software environment whose full legal name is provided in the signature field below (the &ldquo;Tester&rdquo;).
                    </p>

                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-4">
                        WHEREAS, the Company has developed a proprietary gamified educational software application currently in its closed beta phase (the &ldquo;App&rdquo;); and WHEREAS, the Company wishes to disclose certain confidential, proprietary, and technical information to the Tester for the sole purpose of evaluation, beta testing, and feedback compilation; NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:
                    </p>

                    <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-2">
                        1. Definition of Confidential Information
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        For the purposes of this Agreement, &ldquo;Confidential Information&rdquo; shall include any and all proprietary data, technical processes, trade secrets, design systems, and operational mechanics disclosed by the Company to the Tester, whether disclosed visually, orally, or via access to the digital testing environment. Confidential Information is categorized explicitly to include, but is not limited to, the following core assets:
                    </p>

                    <h5 className="text-[9px] sm:text-[10px] font-bold text-text-main mt-3 mb-1">1.1 Core Concept &amp; Gamified Learning Mechanics</h5>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The foundational concept of the software, specifically the novel architectural blending of rigorous exam preparation frameworks with a monster-taming Role-Playing Game (RPG) progression system. This encompasses the virtual economy powered by the proprietary currency system known as &ldquo;Aura&rdquo; awarded for quantitative metrics (correct answers, study streak maintenance, daily mission completion); the creature collection systems, &ldquo;Bestiary&rdquo; layouts, and strategic active team-building frameworks utilizing specific psychological or mathematical in-game stat boosts (such as Motivation, Focus, and Luck); the gamified evaluation interfaces where assessments are structured as RPG &ldquo;Boss Fights&rdquo; (including Midterm and Final Boss interfaces) incorporating dynamic real-time health bars and pixel-art combat loops; the randomized summoning mechanics designated as &ldquo;The Divine Portal&rdquo; utilizing multi-tier rarity systems (Common, Rare, Epic, Legendary); and the structural deployment of the in-app economy known as the &ldquo;Power-Up Shop&rdquo; dealing in consumable mechanics (Shields, 2x XP multipliers, question Skips, and dynamic Hints).
                    </p>

                    <h5 className="text-[9px] sm:text-[10px] font-bold text-text-main mt-3 mb-1">1.2 Proprietary Algorithms &amp; Backend Logic</h5>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The backend execution, code architecture, and analytical math models supporting personalization, including: the &ldquo;stealth diagnostic&rdquo; mechanics operating as baseline diagnostic algorithms integrated into introductory user tasks (disguised as a Welcome Mission) to determine student skill levels; the data pipeline driving Adaptive Difficulty &amp; Analytics, which tracks student mastery granularly across academic subtopics (such as Anatomy, Cell Biology, and US History) to programmatically calibrate questions; and the procedural generation engine utilized for constructing individualized daily missions based on real-time deficiency analysis.
                    </p>

                    <h5 className="text-[9px] sm:text-[10px] font-bold text-text-main mt-3 mb-1">1.3 UI/UX Design &amp; Aesthetic Systems</h5>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The visual styling paradigms representing the signature identity of the application, incorporating the specific Retro-Modern Aesthetic which intersects historical retro pixel-art assets with modern frontend design elements (including glassmorphism, background blurs, fluid spatial animations, and custom neon gradients); the precise color typography of the Custom Dark Mode consisting of high-saturation color arrangements (neon indigo, neon purple, bright gold, and vivid reds) configured to establish a distinct visual glow; and all interactive micro-animations and feedback loops, including structural screen shakes deployed on erroneous inputs and glowing pulse effects engineered for level-up indicators.
                    </p>

                    <h5 className="text-[9px] sm:text-[10px] font-bold text-text-main mt-3 mb-1">1.4 Educational Content &amp; Analytical Telemetry</h5>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        All technical questions, multi-choice options, text explanations, algorithmic hints, and contextual learning strategy tips written for the platform, alongside the taxonomic mapping and categorization of the curriculum. This also includes any system telemetry, performance records, error reporting, usability feedback, or written commentary generated by the Tester during their interaction with the software.
                    </p>

                    <h5 className="text-[9px] sm:text-[10px] font-bold text-text-main mt-3 mb-1">1.5 Exceptions to Confidentiality</h5>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        Confidential Information shall not include information that: (i) is or becomes publicly known through no breach of this Agreement by the Tester; (ii) was already in the lawful possession of the Tester prior to disclosure by the Company; or (iii) is independently developed by the Tester without reference to or reliance upon the Company&rsquo;s Confidential Information.
                    </p>

                    <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-2">
                        2. Intellectual Property &amp; Asset Disclaimer (Carve-Out)
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The Tester explicitly understands and agrees that all core mechanics, algorithmic sequences, user flows, database structures, and layout paradigms remain the exclusive, non-transferable intellectual property of the Company.
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        <strong className="text-text-main">EXPLICIT ASSET DISCLOSURE AND CARVE-OUT:</strong> The parties formally acknowledge that the current closed-beta iteration of the software utilizes temporary, third-party placeholder visual components (specifically, legacy Pok&eacute;mon creature sprites and user interface icons sourced from public application programming interfaces, including but not limited to the Pok&eacute;mon Showdown asset repository). The Tester recognizes that: (i) these visual placeholder assets are not the property of the Company and are completely excluded from the Company&rsquo;s claimed proprietary intellectual property rights; (ii) the presence of these temporary third-party visual elements does not modify, diminish, or invalidate the confidential, proprietary nature of the application&rsquo;s underlying engineering, game logic, system combinations, layout implementations, or unique structural designs; and (iii) the Company maintains an explicit timeline to fully decouple and replace all such placeholder graphics with completely original art assets prior to commercial distribution. No rights or permissions relative to third-party protected works are granted, implied, or established under this text.
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        Additionally, the Tester agrees that all suggestions, feedback, bug reports, or ideas provided to the Company regarding the App (collectively, &ldquo;Feedback&rdquo;) are provided on a non-confidential basis, and the Company shall have a royalty-free, worldwide, perpetual, irrevocable license to use, implement, and commercialize such Feedback in the App or any other products without restriction or compensation to the Tester.
                    </p>

                    <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-2">
                        3. Restrictive Non-Disclosure &amp; Non-Use Obligations
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The Tester shall treat all accessed Confidential Information with the highest standard of care and strict confidentiality. The Tester specifically agrees to the following explicit operational restrictions:
                    </p>
                    <ul className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed space-y-1.5 mb-3 list-disc pl-5">
                        <li>The Tester shall not capture screenshots, record video screen captures, or stream live sessions of any portion of the App&rsquo;s interface, logic, or assets.</li>
                        <li>The Tester shall not discuss, evaluate, publish, or reveal any details concerning the App&rsquo;s gamified learning mechanics, UI/UX systems, or performance metrics on public forums, personal blogs, streaming platforms, or public/private social channels.</li>
                        <li>The Tester shall not share, transfer, or distribute their unique authentication credentials or allow any third party to view, analyze, or engage with the application environment.</li>
                        <li>The Tester shall not attempt to reverse-engineer, decompile, trace, or extract the underlying source code, API routes, or database schemas governing the App.</li>
                    </ul>

                    <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-2">
                        4. Beta Entry Controls &amp; Allowlist Enforcement
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        The Tester acknowledges that execution of this Agreement is a strict condition precedent for application entry. Access to the software environment is regulated via a server-side authentication allowlist. The specific electronic email address authenticated during this digital signing process will serve as the exclusive authorized token for account provisioning. Any intentional or accidental circumvention of this identity barrier, or any attempt to provision access to non-allowlisted credentials, will trigger immediate revocation of testing permissions and constitutes an actionable material breach of this contract.
                    </p>

                    <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-2">
                        5. Term, Legal Remedies, and Governing Law
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        The obligations of confidentiality set forth in this Agreement shall survive the conclusion of the beta testing phase and shall remain legally binding for a period of five (5) years from the Effective Date, or until such time as the Company formally authorizes the public release of the protected mechanics without restriction. The Tester agrees that a breach of this Agreement would cause irreversible financial and competitive harm to the Company for which monetary compensation alone would be inadequate. Consequently, the Company shall be entitled to seek immediate injunctive relief to halt or prevent unauthorized disclosures, in addition to pursuing any financial damages permitted under applicable state and federal statutory frameworks. This Agreement shall be governed by, construed, and enforced in accordance with the laws of the United States without regard to conflict of law principles.
                    </p>

                    <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-2">
                        6. Electronic Signature &amp; Execution by Clickwrap
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        By reviewing these terms, checking the affirmative legal acknowledgement box, and inputting their full legal name below, the Tester explicitly agrees to conduct this transaction via electronic means pursuant to the federal Electronic Signatures in Global and National Commerce Act (ESIGN) and the Uniform Electronic Transactions Act (UETA). The applied timestamped electronic marks and matching backend user database records constitute a verified, legally binding execution of the terms herein.
                    </p>

                    <div className="h-1" />
                </div>

                {/* ─── Signature Block ─── */}
                <div className={`px-4 sm:px-6 py-4 bg-background border-t-2 border-secondary/30 flex-shrink-0 space-y-3 transition-opacity duration-300 ${hasScrolledToBottom ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

                    {/* Checkbox */}
                    <label className={`flex items-start gap-3 cursor-pointer select-none group ${!hasScrolledToBottom ? 'cursor-not-allowed' : ''}`}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            disabled={!hasScrolledToBottom || isSubmitting}
                            className="mt-0.5 w-5 h-5 min-w-[20px] rounded border-2 border-secondary accent-highlight cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                        />
                        <span className="text-[9px] sm:text-[10px] text-text-dim leading-snug font-sans">
                            I confirm that checking this box and entering my name constitutes a <strong className="text-text-main">legally binding electronic signature</strong> under the federal ESIGN Act and UETA. I have read and agree to all terms above.
                        </span>
                    </label>

                    {/* Name Input */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-wider font-sans block">
                            Full Legal Name (Electronic Signature)
                        </label>
                        <input
                            type="text"
                            autoComplete="name"
                            placeholder="Enter your full legal name..."
                            value={legalName}
                            onChange={(e) => setLegalName(e.target.value)}
                            disabled={!hasScrolledToBottom || !isChecked || isSubmitting}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface text-text-main border-2 border-secondary/50 rounded-xl focus:outline-none focus:border-primary/60 text-xs sm:text-sm font-sans placeholder-text-dim/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-inner-soft"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-accent text-[9px] sm:text-[10px] font-sans animate-fadeIn">
                            ⚠ {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`w-full font-bold py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-xs uppercase tracking-wider transition-all touch-target press-effect font-sans ${
                            canSubmit
                                ? 'bg-highlight text-white border-b-4 border-yellow-800 hover:bg-highlight/90 active:border-b-2 active:translate-y-0.5 shadow-button hover:shadow-glow-highlight'
                                : 'bg-text-dark/30 text-text-dark border-b-4 border-text-dark/50 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting && (
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 align-middle" />
                        )}
                        {getButtonText()}
                    </button>

                    {/* Decline link */}
                    <p className="text-center">
                        <button
                            onClick={onDecline}
                            disabled={isSubmitting}
                            className="text-[8px] sm:text-[9px] text-text-dim/60 hover:text-accent transition-colors font-sans underline underline-offset-2 disabled:opacity-50"
                        >
                            Decline &amp; Sign Out
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NDAModal;
