import React, { useState, useRef, useCallback, useEffect } from 'react';
import { User } from '../types';
import { db, auth } from '../services/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const NDA_VERSION = '1.0-BETA';

interface NDAModalProps {
    user: User;
    onAccept: (legalName: string, version: string) => Promise<void>;
    onDecline: () => void;
}

/**
 * Stores NDA record directly in Firestore under ndaCompliance/{uid}.
 * Legally valid under ESIGN Act & UETA — the document contains:
 *   - uid, email, legalName (typed e-signature), version
 *   - signedAt (Firestore serverTimestamp — tamper-evident)
 *   - userAgent (browser fingerprint)
 * No backend server required.
 */
export async function storeNdaInFirestore(
    uid: string,
    email: string,
    legalName: string,
    version: string
): Promise<void> {
    const ref = doc(db, 'ndaCompliance', uid);
    await setDoc(ref, {
        uid,
        email: email.toLowerCase(),
        legalName,
        versionAccepted: version,
        hasSigned: true,
        signedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
    }, { merge: true });
}

/**
 * Checks Firestore for an existing NDA record for the given uid.
 */
export async function checkNdaInFirestore(uid: string): Promise<boolean> {
    try {
        const ref = doc(db, 'ndaCompliance', uid);
        const snap = await getDoc(ref);
        return snap.exists() && snap.data()?.hasSigned === true;
    } catch {
        return false;
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
            // Get uid — prefer Firebase auth.currentUser, fall back to user.uid from props
            const uid = auth.currentUser?.uid ?? user.uid;
            const email = auth.currentUser?.email ?? user.email;

            if (!uid) throw new Error('Session expired. Please sign in again.');

            // Write directly to Firestore — no backend call needed
            await storeNdaInFirestore(uid, email, trimmedName, NDA_VERSION);

            // Notify parent (sets ndaAccepted = true in App state)
            await onAccept(trimmedName, NDA_VERSION);
        } catch (err: any) {
            const msg = err?.message || 'Failed to submit. Please try again.';
            setError(msg);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            {/* On mobile: sheet slides up from bottom. On desktop: centered modal */}
            <div className="bg-surface w-full max-w-full sm:max-w-2xl lg:max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-2xl border-2 border-secondary overflow-hidden animate-reveal flex flex-col"
                 style={{ maxHeight: '92dvh' }}>

                {/* ─── Header ─── */}
                <div className="bg-primary px-4 py-3 text-center flex-shrink-0">
                    <h2 className="text-white font-serif text-sm sm:text-xl font-bold tracking-wide">
                        BETA TESTER NDA
                    </h2>
                    <p className="text-white/80 text-[7px] sm:text-[10px] uppercase tracking-widest mt-0.5">
                        Non-Disclosure &amp; Confidentiality Agreement
                    </p>
                    <p className="text-white/60 text-[7px] sm:text-[9px] mt-1 font-sans">
                        Version {NDA_VERSION} • {user.email}
                    </p>
                </div>

                {/* ─── Scroll Progress Banner ─── */}
                {!hasScrolledToBottom && (
                    <div className="bg-accent/10 border-b border-accent/30 px-3 py-1.5 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <span className="text-[8px] sm:text-[10px] text-accent font-bold uppercase tracking-wider font-sans">
                            ↓ Scroll to read entire agreement ↓
                        </span>
                    </div>
                )}
                {hasScrolledToBottom && (
                    <div className="bg-success/10 border-b border-success/30 px-3 py-1.5 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] sm:text-[10px] text-success font-bold uppercase tracking-wider font-sans">
                            ✓ Agreement reviewed
                        </span>
                    </div>
                )}

                {/* ─── NDA Text (Scrollable) ─── */}
                <div
                    ref={scrollRef}
                    className="px-3 sm:px-6 py-3 overflow-y-auto flex-1 min-h-0 text-text-main font-sans select-none scrollbar-thin"
                    style={{ maxHeight: '38vh' }}
                >
                    <h3 className="text-[9px] sm:text-xs font-bold text-primary text-center uppercase tracking-wider mb-3">
                        AURAPREP BETA TESTER NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT
                    </h3>

                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        This Beta Tester Non-Disclosure and Confidentiality Agreement (the &ldquo;Agreement&rdquo;) is entered into and made effective as of the date of final electronic clickwrap execution within the application portal (the &ldquo;Effective Date&rdquo;), by and between the software engineering and development team (the &ldquo;Company&rdquo;) and the individual accessing, reviewing, or testing the proprietary software environment whose full legal name is provided in the signature field below (the &ldquo;Tester&rdquo;).
                    </p>

                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        WHEREAS, the Company has developed a proprietary gamified educational software application currently in its closed beta phase (the &ldquo;App&rdquo;); and WHEREAS, the Company wishes to disclose certain confidential, proprietary, and technical information to the Tester for the sole purpose of evaluation, beta testing, and feedback compilation; NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:
                    </p>

                    <h4 className="text-[9px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                        1. Definition of Confidential Information
                    </h4>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        For the purposes of this Agreement, &ldquo;Confidential Information&rdquo; shall include any and all proprietary data, technical processes, trade secrets, design systems, and operational mechanics disclosed by the Company to the Tester, whether disclosed visually, orally, or via access to the digital testing environment. Confidential Information is categorized explicitly to include, but is not limited to, the following core assets:
                    </p>

                    <h5 className="text-[8px] sm:text-[10px] font-bold text-text-main mt-2 mb-1">1.1 Core Concept &amp; Gamified Learning Mechanics</h5>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The foundational concept of the software, specifically the novel architectural blending of rigorous exam preparation frameworks with a monster-taming Role-Playing Game (RPG) progression system. This encompasses the virtual economy powered by the proprietary currency system known as &ldquo;Aura&rdquo; awarded for quantitative metrics (correct answers, study streak maintenance, daily mission completion); the creature collection systems, &ldquo;Bestiary&rdquo; layouts, and strategic active team-building frameworks utilizing specific psychological or mathematical in-game stat boosts (such as Motivation, Focus, and Luck); the gamified evaluation interfaces where assessments are structured as RPG &ldquo;Boss Fights&rdquo; (including Midterm and Final Boss interfaces) incorporating dynamic real-time health bars and pixel-art combat loops; the randomized summoning mechanics designated as &ldquo;The Divine Portal&rdquo; utilizing multi-tier rarity systems (Common, Rare, Epic, Legendary); and the structural deployment of the in-app economy known as the &ldquo;Power-Up Shop&rdquo; dealing in consumable mechanics (Shields, 2x XP multipliers, question Skips, and dynamic Hints).
                    </p>

                    <h5 className="text-[8px] sm:text-[10px] font-bold text-text-main mt-2 mb-1">1.2 Proprietary Algorithms &amp; Backend Logic</h5>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The backend execution, code architecture, and analytical math models supporting personalization, including: the &ldquo;stealth diagnostic&rdquo; mechanics operating as baseline diagnostic algorithms integrated into introductory user tasks (disguised as a Welcome Mission) to determine student skill levels; the data pipeline driving Adaptive Difficulty &amp; Analytics, which tracks student mastery granularly across academic subtopics to programmatically calibrate questions; and the procedural generation engine utilized for constructing individualized daily missions based on real-time deficiency analysis.
                    </p>

                    <h5 className="text-[8px] sm:text-[10px] font-bold text-text-main mt-2 mb-1">1.3 UI/UX Design &amp; Aesthetic Systems</h5>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The visual styling paradigms representing the signature identity of the application, incorporating the specific Retro-Modern Aesthetic which intersects historical retro pixel-art assets with modern frontend design elements (including glassmorphism, background blurs, fluid spatial animations, and custom neon gradients); the precise color typography of the Custom Dark Mode; and all interactive micro-animations and feedback loops.
                    </p>

                    <h5 className="text-[8px] sm:text-[10px] font-bold text-text-main mt-2 mb-1">1.4 Educational Content &amp; Analytical Telemetry</h5>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        All technical questions, multi-choice options, text explanations, algorithmic hints, and contextual learning strategy tips written for the platform, alongside the taxonomic mapping and categorization of the curriculum. This also includes any system telemetry, performance records, error reporting, usability feedback, or written commentary generated by the Tester.
                    </p>

                    <h5 className="text-[8px] sm:text-[10px] font-bold text-text-main mt-2 mb-1">1.5 Exceptions to Confidentiality</h5>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        Confidential Information shall not include information that: (i) is or becomes publicly known through no breach of this Agreement by the Tester; (ii) was already in the lawful possession of the Tester prior to disclosure; or (iii) is independently developed by the Tester without reference to the Company&rsquo;s Confidential Information.
                    </p>

                    <h4 className="text-[9px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                        2. Intellectual Property &amp; Asset Disclaimer
                    </h4>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        The Tester explicitly understands and agrees that all core mechanics, algorithmic sequences, user flows, database structures, and layout paradigms remain the exclusive, non-transferable intellectual property of the Company.
                    </p>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        <strong className="text-text-main">EXPLICIT ASSET DISCLOSURE AND CARVE-OUT:</strong> The parties formally acknowledge that the current closed-beta iteration of the software utilizes temporary, third-party placeholder visual components (specifically, legacy Pok&eacute;mon creature sprites sourced from public APIs). The Tester recognizes that these visual placeholder assets are not the property of the Company and are completely excluded from the Company&rsquo;s claimed proprietary intellectual property rights, and that the Company maintains an explicit timeline to replace all such placeholder graphics with completely original art assets prior to commercial distribution.
                    </p>

                    <h4 className="text-[9px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                        3. Restrictive Non-Disclosure &amp; Non-Use Obligations
                    </h4>
                    <ul className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed space-y-1 mb-3 list-disc pl-4">
                        <li>The Tester shall not capture screenshots, record video, or stream live sessions of any portion of the App.</li>
                        <li>The Tester shall not discuss or reveal any details concerning the App&rsquo;s mechanics, UI/UX systems, or performance metrics on any public or private social channels.</li>
                        <li>The Tester shall not share authentication credentials or allow any third party to access the application environment.</li>
                        <li>The Tester shall not attempt to reverse-engineer, decompile, or extract the underlying source code, API routes, or database schemas.</li>
                    </ul>

                    <h4 className="text-[9px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                        4. Beta Entry Controls &amp; Allowlist Enforcement
                    </h4>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        The Tester acknowledges that execution of this Agreement is a strict condition precedent for application entry. Access to the software environment is regulated via a server-side authentication allowlist. Any intentional or accidental circumvention of this identity barrier constitutes an actionable material breach of this contract.
                    </p>

                    <h4 className="text-[9px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                        5. Term, Legal Remedies, and Governing Law
                    </h4>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-3">
                        The obligations of confidentiality shall survive the beta testing phase and remain legally binding for five (5) years from the Effective Date. The Tester agrees that a breach would cause irreversible financial and competitive harm to the Company, entitling the Company to seek immediate injunctive relief in addition to financial damages. This Agreement shall be governed by the laws of the United States.
                    </p>

                    <h4 className="text-[9px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                        6. Electronic Signature &amp; Execution by Clickwrap
                    </h4>
                    <p className="text-[9px] sm:text-[11px] text-text-dim leading-relaxed mb-2">
                        By reviewing these terms, checking the affirmative legal acknowledgement box, and inputting their full legal name below, the Tester explicitly agrees to conduct this transaction via electronic means pursuant to the federal Electronic Signatures in Global and National Commerce Act (ESIGN) and the Uniform Electronic Transactions Act (UETA). The applied timestamped electronic marks and matching database records constitute a verified, legally binding execution of the terms herein.
                    </p>

                    <div className="h-1" />
                </div>

                {/* ─── Signature Block ─── */}
                <div className={`px-3 sm:px-6 py-3 bg-background border-t-2 border-secondary/30 flex-shrink-0 space-y-2.5 transition-opacity duration-300 ${hasScrolledToBottom ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

                    {/* Checkbox */}
                    <label className={`flex items-start gap-2.5 cursor-pointer select-none ${!hasScrolledToBottom ? 'cursor-not-allowed' : ''}`}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            disabled={!hasScrolledToBottom || isSubmitting}
                            className="mt-0.5 w-4 h-4 min-w-[16px] rounded border-2 border-secondary accent-highlight cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                        />
                        <span className="text-[8px] sm:text-[10px] text-text-dim leading-snug font-sans">
                            I confirm that checking this box and entering my name constitutes a <strong className="text-text-main">legally binding electronic signature</strong> under the federal ESIGN Act and UETA. I have read and agree to all terms above.
                        </span>
                    </label>

                    {/* Name Input */}
                    <div className="space-y-1">
                        <label className="text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-wider font-sans block">
                            Full Legal Name (Electronic Signature)
                        </label>
                        <input
                            type="text"
                            autoComplete="name"
                            placeholder="Enter your full legal name..."
                            value={legalName}
                            onChange={(e) => setLegalName(e.target.value)}
                            disabled={!hasScrolledToBottom || !isChecked || isSubmitting}
                            className="w-full px-3 py-2 bg-surface text-text-main border-2 border-secondary/50 rounded-xl focus:outline-none focus:border-primary/60 text-xs font-sans placeholder-text-dim/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-inner-soft"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-1.5 text-accent text-[8px] sm:text-[10px] font-sans animate-fadeIn">
                            ⚠ {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`w-full font-bold py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-xs uppercase tracking-wider transition-all touch-target press-effect font-sans ${
                            canSubmit
                                ? 'bg-highlight text-white border-b-4 border-yellow-800 hover:bg-highlight/90 active:border-b-2 active:translate-y-0.5 shadow-button hover:shadow-glow-highlight'
                                : 'bg-text-dark/30 text-text-dark border-b-4 border-text-dark/50 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting && (
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 align-middle" />
                        )}
                        {getButtonText()}
                    </button>

                    {/* Decline link */}
                    <p className="text-center pb-1">
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
