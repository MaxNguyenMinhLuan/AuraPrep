// v2 skill taxonomy — finalized by the user + Gem, adopted as-is. Each skill
// lists only the difficulty tiers it actually has on the real Digital SAT,
// anchored to the adaptive-module structure:
//   Easy   = Module 2 Easy (only seen after a weaker Module 1)
//   Medium = Module 1 (the fixed baseline every student sees)
//   Hard   = Module 2 Hard (only seen after a strong Module 1)
// 'Extra Hard' is an AuraPrep-only stretch tier layered on top of Hard for
// Master-level users — see utils/mastery.ts's getSkillCeiling(), not stored
// here since it isn't a distinct real-SAT tier.
//
// Only active when ACTIVE_QUESTION_BANK === 'v2' (constants.ts). See
// architecture/reversibility.md.

import { SkillDefinition } from '../types';

export const SKILL_TAXONOMY_V2: SkillDefinition[] = [
    // ---- Reading & Writing ----
    {
        id: 'R/W: Words in Context',
        domain: 'Craft and Structure',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: common Tier-2 vocabulary with obvious context clues. Medium: standard academic vocabulary with a contrast or continuation pivot. Hard: secondary word meanings, subtle connotation traps, tonal nuance.',
    },
    {
        id: 'R/W: Text Structure & Purpose',
        domain: 'Craft and Structure',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: single-sentence purpose. Medium: paragraph main purpose or function of underlined text. Hard: multi-part, 3-move structural progression.',
    },
    {
        id: 'R/W: Cross-Text Connections',
        domain: 'Craft and Structure',
        availableDifficulties: ['Medium', 'Hard'],
        recipe: 'Medium: standard two-text comparison and perspective matching. Hard: complex opposing-stance synthesis with subtle valence shifts.',
    },
    {
        id: 'R/W: Finding Key Details',
        domain: 'Information and Ideas',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: direct 1:1 factual text scanning. Medium: paraphrased single-detail retrieval.',
    },
    {
        id: 'R/W: Central Ideas',
        domain: 'Information and Ideas',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: clear, straightforward passage main idea. Medium: main idea identification requiring elimination of narrow-detail traps.',
    },
    {
        id: 'R/W: Command of Evidence (Textual)',
        domain: 'Information and Ideas',
        availableDifficulties: ['Medium', 'Hard'],
        recipe: 'Medium: direct textual support for a simple claim. Hard: evaluating complex scientific or literary hypotheses with subtle distractors.',
    },
    {
        id: 'R/W: Command of Evidence (Quantitative)',
        domain: 'Information and Ideas',
        availableDifficulties: ['Medium', 'Hard'],
        recipe: 'Medium: reading a simple bar or line graph to complete a sentence. Hard: interpreting multi-variable charts alongside complex passage arguments.',
    },
    {
        id: 'R/W: Inferences',
        domain: 'Information and Ideas',
        availableDifficulties: ['Medium', 'Hard'],
        recipe: 'Medium: paragraph completion requiring a simple logical conclusion. Hard: abstract claim completion requiring a minimal logical-step rule.',
    },
    {
        id: 'R/W: Rhetorical Synthesis',
        domain: 'Expression of Ideas',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: direct matching of simple prompt goals. Medium: goal matching requiring specific syntax like contrast or similarity keywords.',
    },
    {
        id: 'R/W: Transitions',
        domain: 'Expression of Ideas',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: basic transition words (however, therefore). Medium: functional category matching (consequently, specifically). Hard: punctuation-embedded transitions with deceptive distractor categories.',
    },
    {
        id: 'R/W: Boundaries & Punctuation',
        domain: 'Standard English Conventions',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: basic period vs. comma fixes. Medium: semicolon, colon, single dash, and FANBOYS conjunction rules. Hard: essential vs. non-essential appositives, job titles vs. descriptors, nested clauses.',
    },
    {
        id: 'R/W: Subject-Verb & Pronoun Agreement',
        domain: 'Standard English Conventions',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: basic singular/plural noun and verb matching. Medium: prepositional-phrase stripping and collective-noun rules.',
    },
    {
        id: 'R/W: Modifiers & Sentence Structure',
        domain: 'Standard English Conventions',
        availableDifficulties: ['Medium', 'Hard'],
        recipe: 'Medium: standard dangling-modifier placement after introductory commas. Hard: complex multi-clause parallel structure and passive-voice modifier traps.',
    },

    // ---- Math ----
    {
        id: 'Algebra: Single Variable Equations',
        domain: 'Algebra',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: basic 1-step and 2-step linear equation solving. Medium: multi-step distribution and fraction clearing.',
    },
    {
        id: 'Algebra: Linear Functions & Slopes',
        domain: 'Algebra',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: reading slope and y-intercept directly from y = mx + b. Medium: two-point and table rate of change. Hard: interpreting real-world constants under multi-variable constraints.',
    },
    {
        id: 'Algebra: Systems of Linear Equations',
        domain: 'Algebra',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: finding direct numerical point intersections. Medium: evaluating a secondary expression (e.g. x + y) from the intersection. Hard: unknown-constant systems (no solution / infinitely many solutions).',
    },
    {
        id: 'Algebra: Inequalities & Systems of Inequalities',
        domain: 'Algebra',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: graphing a single linear inequality. Medium: checking ordered-pair solutions in double-shaded regions. Hard: max/min integer values under word-problem constraints.',
    },
    {
        id: 'Algebra: Absolute Value',
        domain: 'Algebra',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: solving basic absolute value equations. Medium: absolute value functions, vertex points, and solution counts.',
    },
    {
        id: 'Algebra: Quadratic Equations',
        domain: 'Advanced Math',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: reading roots directly from factored quadratic expressions. Medium: finding vertex maximum or minimum values. Hard: discriminant analysis and vertex transformations with unknown constants.',
    },
    {
        id: 'Algebra: Exponential Functions',
        domain: 'Advanced Math',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: identifying the initial value in y = a(b)^x. Medium: calculating growth or decay percentage rates. Hard: fractional-exponent time periods and compound interest models.',
    },
    {
        id: 'Algebra: Polynomial Manipulations',
        domain: 'Advanced Math',
        availableDifficulties: ['Medium', 'Hard'],
        recipe: 'Medium: expanding and factoring standard quadratics and cubics. Hard: analyzing root multiplicity, graph axis behavior, and higher-degree curves.',
    },
    {
        id: 'Algebra: Dividing Polynomials & Remainder Theorem',
        domain: 'Advanced Math',
        availableDifficulties: ['Hard'],
        recipe: 'Hard only: advanced polynomial division and Remainder Theorem evaluations.',
    },
    {
        id: 'Algebra: Systems of Nonlinear Equations',
        domain: 'Advanced Math',
        availableDifficulties: ['Hard'],
        recipe: 'Hard only: parabola-line or circle-parabola intersections involving discriminant constants.',
    },
    {
        id: 'Formulas and Expressions',
        domain: 'Advanced Math',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: simple algebraic simplification. Medium: exponent rules and rational-expression rewriting. Hard: multi-variable expression equivalence.',
    },
    {
        id: 'Function Notation & Transformations',
        domain: 'Advanced Math',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: direct evaluation of f(c) for a given value. Medium: evaluating composite functions f(g(x)). Hard: analyzing graphical shifts g(x) = f(x - h) + k.',
    },
    {
        id: 'Ratios and Proportions',
        domain: 'Problem-Solving and Data Analysis',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: single-step unit conversions and basic ratios. Medium: multi-step proportional scaling and dimensional-analysis chains.',
    },
    {
        id: 'Data: Categories & Probabilities',
        domain: 'Problem-Solving and Data Analysis',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: reading a single-row probability from a two-way table. Medium: calculating conditional ("given that") probabilities.',
    },
    {
        id: 'Data: Central Tendency & Spread',
        domain: 'Problem-Solving and Data Analysis',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: calculating mean, median, and mode from a list. Medium: evaluating range and standard deviation across datasets. Hard: analyzing how outliers impact mean vs. median in skewed distributions.',
    },
    {
        id: 'Data: Scatterplots & Best-Fit Models',
        domain: 'Problem-Solving and Data Analysis',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: reading a trendline value directly from a scatterplot. Medium: linear and exponential model regressions from table data. Hard: calculating residuals and evaluating model extrapolations.',
    },
    {
        id: 'Data: Experimental & Margin of Error',
        domain: 'Problem-Solving and Data Analysis',
        availableDifficulties: ['Hard'],
        recipe: 'Hard only: margin-of-error confidence intervals, random-sample generalizability, and experimental design.',
    },
    {
        id: 'Numbers: Sequences',
        domain: 'Problem-Solving and Data Analysis',
        availableDifficulties: ['Hard'],
        recipe: 'Hard only: arithmetic and geometric sequence explicit formulas.',
    },
    {
        id: 'Geometry: Lines and Angles',
        domain: 'Geometry and Trigonometry',
        availableDifficulties: ['Easy', 'Medium'],
        recipe: 'Easy: basic transversal angle measures. Medium: parallel-line and perpendicular negative-reciprocal slope checks.',
    },
    {
        id: 'Geometry: Triangles and Polygons',
        domain: 'Geometry and Trigonometry',
        availableDifficulties: ['Easy', 'Medium', 'Hard'],
        recipe: 'Easy: basic Pythagorean-theorem side-length solving. Medium: special right-triangle ratios (30-60-90, 45-45-90). Hard: similar-triangle area scaling where area ratio equals (a/b)^2.',
    },
    {
        id: 'Geometry: Solid Geometry',
        domain: 'Geometry and Trigonometry',
        availableDifficulties: ['Medium', 'Hard'],
        recipe: 'Medium: direct 3D volume and surface-area formula evaluation. Hard: 3D scale-factor multipliers for length, area, and volume.',
    },
    {
        id: 'Geometry: Circles',
        domain: 'Geometry and Trigonometry',
        availableDifficulties: ['Medium', 'Hard'],
        recipe: 'Medium: standard-form circle equations (x-h)^2 + (y-k)^2 = r^2. Hard: uncompleted general-form circle equations requiring center/radius extraction.',
    },
    {
        id: 'Geometry: Trigonometry',
        domain: 'Geometry and Trigonometry',
        availableDifficulties: ['Hard'],
        recipe: 'Hard only: right-triangle trig ratios, cofunction identities sin(A) = cos(B), inverse trig functions, and radian/degree conversions.',
    },
];

export const SKILLS_V2: string[] = SKILL_TAXONOMY_V2.map(s => s.id);

export const SKILL_TAXONOMY_MAP_V2: Record<string, SkillDefinition> =
    Object.fromEntries(SKILL_TAXONOMY_V2.map(s => [s.id, s]));
