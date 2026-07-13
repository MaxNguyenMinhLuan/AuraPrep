
import { SUBTOPICS } from '../constants';
import { SubtopicStat, SkillLevel } from '../types';

/** All math subtopics — everything that isn't R/W, Grammar, or Rhetoric */
export const MATH_SUBTOPICS = SUBTOPICS.filter(
    s => !s.startsWith('R/W:') && !s.startsWith('Grammar:') && !s.startsWith('Rhetoric:')
);

/** All English subtopics — R/W, Grammar, Rhetoric */
export const ENGLISH_SUBTOPICS = SUBTOPICS.filter(
    s => s.startsWith('R/W:') || s.startsWith('Grammar:') || s.startsWith('Rhetoric:')
);

/** Compute a "struggle score" for a subtopic: lower = struggling more */
function getStruggleScore(stat: SubtopicStat | undefined): number {
    if (!stat) return 0; // No data = most likely to struggle
    const total = stat.correct + stat.incorrect;
    if (total === 0) return 0;
    const accuracy = stat.correct / total;
    // Weight: level multiplier (Easy=0, Medium=1, Hard=2, Master=3) * accuracy
    const levelWeight: Record<SkillLevel, number> = {
        'Easy': 0,
        'Medium': 0.33,
        'Hard': 0.66,
        'Master': 1,
    };
    return accuracy * (1 + levelWeight[stat.level]);
}

function isMastered(stat: SubtopicStat | undefined): boolean {
    return stat?.level === 'Master';
}

export interface SkillsOfTheDayResult {
    mathSkill: string;
    englishSkill: string;
}

/**
 * Get or generate today's Skills of the Day.
 * Stored in localStorage under key `sotd_{userId}`.
 * Guarantees no repeat vs yesterday, and 1 math + 1 English (unless all mastered).
 */
export function getSkillsOfTheDay(
    userId: string,
    stats: Record<string, SubtopicStat>
): SkillsOfTheDayResult {
    const today = new Date().toLocaleDateString('en-CA');
    const storageKey = `sotd_${userId}`;

    let stored: {
        date: string;
        mathSkill: string;
        englishSkill: string;
        prevMathSkill?: string;
        prevEnglishSkill?: string;
    } | null = null;

    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) stored = JSON.parse(raw);
    } catch {
        stored = null;
    }

    // If we already have today's skills, return them
    if (stored && stored.date === today) {
        return { mathSkill: stored.mathSkill, englishSkill: stored.englishSkill };
    }

    // Remember what yesterday's skills were (for no-repeat)
    const prevMath = stored?.mathSkill || null;
    const prevEnglish = stored?.englishSkill || null;

    // Check if all math/English are mastered
    const allMathMastered = MATH_SUBTOPICS.every(s => isMastered(stats[s]));
    const allEnglishMastered = ENGLISH_SUBTOPICS.every(s => isMastered(stats[s]));

    const pickWorst = (pool: string[], exclude: string | null): string => {
        // Filter out mastered and yesterday's choice if possible
        let candidates = allMathMastered && allEnglishMastered
            ? pool
            : pool.filter(s => !isMastered(stats[s]));

        // Prefer to exclude yesterday's skill
        const withoutPrev = exclude ? candidates.filter(s => s !== exclude) : candidates;
        const finalPool = withoutPrev.length > 0 ? withoutPrev : candidates;

        // Sort by struggle score ascending (worst first)
        const sorted = [...finalPool].sort((a, b) => getStruggleScore(stats[a]) - getStruggleScore(stats[b]));

        // Pick from the worst 3 with some randomness so it varies
        const topN = Math.min(3, sorted.length);
        return sorted[Math.floor(Math.random() * topN)];
    };

    let mathSkill: string;
    let englishSkill: string;

    if (allMathMastered && allEnglishMastered) {
        // All mastered: just pick 2 worst overall
        const allSorted = [...SUBTOPICS].sort((a, b) => getStruggleScore(stats[a]) - getStruggleScore(stats[b]));
        mathSkill = allSorted.find(s => s !== prevMath) || allSorted[0];
        englishSkill = allSorted.find(s => s !== prevEnglish && s !== mathSkill) || allSorted[1];
    } else if (allMathMastered) {
        // All math mastered: pick 2 English
        mathSkill = pickWorst(ENGLISH_SUBTOPICS, prevMath);
        englishSkill = pickWorst(ENGLISH_SUBTOPICS.filter(s => s !== mathSkill), prevEnglish);
    } else if (allEnglishMastered) {
        // All English mastered: pick 2 Math
        mathSkill = pickWorst(MATH_SUBTOPICS, prevMath);
        englishSkill = pickWorst(MATH_SUBTOPICS.filter(s => s !== mathSkill), prevEnglish);
    } else {
        mathSkill = pickWorst(MATH_SUBTOPICS, prevMath);
        englishSkill = pickWorst(ENGLISH_SUBTOPICS, prevEnglish);
    }

    // Save to localStorage
    try {
        localStorage.setItem(storageKey, JSON.stringify({
            date: today,
            mathSkill,
            englishSkill,
            prevMathSkill: prevMath,
            prevEnglishSkill: prevEnglish,
        }));
    } catch {
        // ignore storage errors
    }

    return { mathSkill, englishSkill };
}
