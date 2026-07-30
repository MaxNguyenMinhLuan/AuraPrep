# Skill Diagnostic

## Why this exists

Before this change, AuraPrep had **two** half-built onboarding diagnostics —
a formal "Baseline Test" (`utils/legacy/baselineScoring.legacy.ts`,
`components/Tutorial/legacy/BaselineTest.legacy.tsx`) and a "stealth
diagnostic" seed mission (`services/stealthDiagnosticService.ts`,
`services/stealthMissionService.ts`, `components/Tutorial/WelcomeMission.tsx`)
— and **neither was actually wired into `App.tsx`**; both sets of imports
were commented out. The stealth system also wrote its results into a
separate `UserSkillProfile` store that nothing else in the app ever read —
even if it had been wired in, it wouldn't have changed what difficulty a
user actually saw in real missions. Net effect: every user starts every
skill flat at `'Easy'` with zero placement, and the only way to reach
Medium/Hard is grinding a boss fight per skill from scratch. This is a
direct contributor to "the app feels too easy."

Both legacy systems are left in place (unused) rather than deleted — they're
real prior work, not something this change has license to remove — but
`services/diagnosticService.ts` is the one live path now, and it writes
straight into the real `UserProfile.stats` that `utils/mastery.ts`,
`ProgressView.tsx`, and every mission-generation call site already read.

## Design

**8 questions minimum, up to 16 — adaptive length, not a fixed count.**
Research on computerized adaptive testing consistently favors spending test
length where it adds signal and cutting it where the outcome is already
clear, rather than a fixed-form test. Concretely:

1. One **screener** question per official College Board domain (8 domains
   — Algebra, Advanced Math, Problem-Solving and Data Analysis, Geometry
   and Trigonometry, Craft and Structure, Information and Ideas, Standard
   English Conventions, Expression of Ideas), at **Medium** difficulty.
2. If the screener is answered **correctly**, ask one more **confirm**
   question at **Hard** for that domain:
   - Confirm correct → the domain places at **Hard**.
   - Confirm incorrect → the domain places at **Medium**.
3. If the screener is answered **incorrectly**, stop for that domain — it
   places at **Easy**. No point spending a second question confirming a
   floor that's already the default.

This deliberately mirrors the Digital SAT's own two-stage adaptive module
structure (a mixed-difficulty first pass, then branching into an easier or
harder second stage) at a meta level — fitting, given the whole point of
the app.

**Full domain coverage beats a bigger arbitrary sample.** The old stealth
system's `HIGH_IMPACT_CATEGORIES` sampled 10 hand-picked subtopics and left
whole domains (e.g. all of Geometry) with zero signal. Probing every domain
guarantees a placement signal everywhere, and that signal is applied to
every skill within the domain (clamped to each skill's own ceiling via
`getSkillCeiling` — a domain acing its Hard confirm doesn't push a
Medium-ceiling skill like `R/W: Central Ideas` past Medium).

**A placement never requires a boss fight.** `applyDomainPlacements` writes
the resolved level directly into `UserProfile.stats[skill].level` — that
field is the single thing every practice/mission/boss-fight call site reads
via `getDifficultyForLevel`. Placing a domain at Hard *is* skipping the
Easy→Medium and Medium→Hard boss fights for every skill in it; boss fights
remain the mechanism to progress *beyond* wherever the diagnostic placed
you (e.g. Hard→Master).

**Never downgrades.** `applyDomainPlacements` only raises a skill's level,
never lowers it — relevant if this is ever re-run against a profile with
existing progress.

## Where it runs

`App.tsx`'s tutorial phase machine: `'choose-active-creature'` →
`'skill-diagnostic'` (new) → `'explain-daily-missions'`. It runs after the
user has picked a starter/active creature but *before* the first batch of
daily missions is generated, so day-one missions are already calibrated
instead of defaulting to Easy for everyone.
