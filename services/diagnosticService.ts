/**
 * Skill Diagnostic Service
 *
 * A live onboarding placement test — see architecture/diagnostic.md for the
 * design rationale. Two prior diagnostic systems exist in this codebase
 * (utils/legacy/baselineScoring.legacy.ts + components/Tutorial/legacy/
 * BaselineTest.legacy.tsx, and the "stealth diagnostic" in
 * services/stealthDiagnosticService.ts + services/stealthMissionService.ts)
 * but neither is actually wired into App.tsx (their imports are commented
 * out) — every user currently starts every skill flat at 'Easy' with no
 * placement at all. This replaces both with one live system that writes
 * directly into the real UserProfile.stats that the rest of the app reads,
 * instead of resurrecting a second disconnected profile store.
 */

import { Question, SkillLevel, UserProfile } from '../types';
import { generateSatQuestion, SUBTOPIC_TO_DOMAIN_MAP } from './questionService';
import { getSkillCeiling } from '../utils/mastery';
import { ACTIVE_QUESTION_BANK } from '../constants';
import { SKILL_TAXONOMY_V2 } from '../data/skillTaxonomy.v2';

const SKILL_LEVEL_ORDER: SkillLevel[] = ['Easy', 'Medium', 'Hard', 'Master'];

// One representative "probe" skill per official College Board domain. Kept
// separate per bank version since v1 and v2 use different subtopic/skill
// name strings for the same domain (e.g. v1 "R/W: Command of Evidence" vs
// v2's split "R/W: Command of Evidence (Textual)"/"(Quantitative)").
const DIAGNOSTIC_PROBES: Record<'v1' | 'v2', { domain: string; subtopic: string }[]> = {
    v1: [
        { domain: 'Algebra', subtopic: 'Algebra: Systems of Linear Equations' },
        { domain: 'Advanced Math', subtopic: 'Algebra: Quadratic Equations' },
        { domain: 'Problem-Solving and Data Analysis', subtopic: 'Data: Central Tendency and Standard Deviation' },
        { domain: 'Geometry and Trigonometry', subtopic: 'Geometry: Triangles and Polygons' },
        { domain: 'Craft and Structure', subtopic: 'R/W: Vocabulary in Context' },
        { domain: 'Information and Ideas', subtopic: 'R/W: Command of Evidence' },
        { domain: 'Standard English Conventions', subtopic: 'Grammar: Subject-Verb Agreement' },
        { domain: 'Expression of Ideas', subtopic: 'Rhetoric: Transitions' },
    ],
    v2: [
        { domain: 'Algebra', subtopic: 'Algebra: Systems of Linear Equations' },
        { domain: 'Advanced Math', subtopic: 'Algebra: Quadratic Equations' },
        { domain: 'Problem-Solving and Data Analysis', subtopic: 'Data: Central Tendency & Spread' },
        { domain: 'Geometry and Trigonometry', subtopic: 'Geometry: Triangles and Polygons' },
        { domain: 'Craft and Structure', subtopic: 'R/W: Words in Context' },
        { domain: 'Information and Ideas', subtopic: 'R/W: Command of Evidence (Textual)' },
        { domain: 'Standard English Conventions', subtopic: 'R/W: Boundaries & Punctuation' },
        { domain: 'Expression of Ideas', subtopic: 'R/W: Transitions' },
    ],
};

export const getDiagnosticProbes = () => DIAGNOSTIC_PROBES[ACTIVE_QUESTION_BANK];

export interface DiagnosticQuestionItem {
    domain: string;
    stage: 'screener' | 'confirm';
    question: Question;
}

export interface DomainPlacement {
    domain: string;
    level: SkillLevel; // Easy | Medium | Hard — a diagnostic never places into Master
    screenerCorrect: boolean;
    confirmCorrect: boolean | null; // null when the screener already resolved to Easy
}

/**
 * Fetches the Medium-difficulty screener question for one domain.
 */
export const fetchScreenerQuestion = async (domain: string): Promise<DiagnosticQuestionItem> => {
    const probe = getDiagnosticProbes().find(p => p.domain === domain);
    if (!probe) throw new Error(`No diagnostic probe configured for domain "${domain}"`);
    const q = await generateSatQuestion(probe.subtopic, 'Medium');
    return { domain, stage: 'screener', question: { ...q, subtopic: probe.subtopic } };
};

/**
 * Fetches the Hard-difficulty confirmation question for one domain — only
 * requested when that domain's screener was answered correctly, keeping the
 * diagnostic adaptive in length (8 questions if every screener is missed,
 * up to 16 if every domain confirms at Hard) rather than a fixed count.
 */
export const fetchConfirmQuestion = async (domain: string): Promise<DiagnosticQuestionItem> => {
    const probe = getDiagnosticProbes().find(p => p.domain === domain);
    if (!probe) throw new Error(`No diagnostic probe configured for domain "${domain}"`);
    const q = await generateSatQuestion(probe.subtopic, 'Hard');
    return { domain, stage: 'confirm', question: { ...q, subtopic: probe.subtopic } };
};

const resolvePlacementLevel = (screenerCorrect: boolean, confirmCorrect: boolean | null): SkillLevel => {
    if (!screenerCorrect) return 'Easy';
    return confirmCorrect ? 'Hard' : 'Medium';
};

export const recordDomainResult = (
    domain: string,
    screenerCorrect: boolean,
    confirmCorrect: boolean | null
): DomainPlacement => ({
    domain,
    level: resolvePlacementLevel(screenerCorrect, confirmCorrect),
    screenerCorrect,
    confirmCorrect,
});

const skillsInDomain = (domain: string): string[] => {
    if (ACTIVE_QUESTION_BANK === 'v2') {
        return SKILL_TAXONOMY_V2.filter(s => s.domain === domain).map(s => s.id);
    }
    return Object.entries(SUBTOPIC_TO_DOMAIN_MAP)
        .filter(([, d]) => d === domain)
        .map(([subtopic]) => subtopic);
};

/**
 * Applies diagnostic placements directly to UserProfile.stats — this IS the
 * "skip the boss fight" mechanic: a domain placement of 'Hard' sets every
 * skill in that domain straight to Hard, no boss fight required to get
 * there. Each skill is clamped to its own ceiling (utils/mastery.ts) and
 * never downgraded below whatever level it already had.
 */
export const applyDomainPlacements = (
    placements: DomainPlacement[],
    stats: UserProfile['stats']
): UserProfile['stats'] => {
    const next = { ...stats };

    for (const { domain, level } of placements) {
        for (const skillId of skillsInDomain(domain)) {
            const ceiling = getSkillCeiling(skillId);
            const clampedLevel = SKILL_LEVEL_ORDER.indexOf(level) > SKILL_LEVEL_ORDER.indexOf(ceiling)
                ? ceiling
                : level;

            const prior = next[skillId] ?? { correct: 0, incorrect: 0, level: 'Easy' as SkillLevel };
            const finalLevel = SKILL_LEVEL_ORDER.indexOf(clampedLevel) > SKILL_LEVEL_ORDER.indexOf(prior.level)
                ? clampedLevel
                : prior.level;

            next[skillId] = { ...prior, level: finalLevel };
        }
    }

    return next;
};
