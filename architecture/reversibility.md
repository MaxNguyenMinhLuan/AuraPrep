# Question Bank Reversibility

AuraPrep is mid-overhaul from its original (`v1`) question bank/taxonomy to a
rebuilt, verified `v2` bank on a new 36-skill taxonomy (see the SAT Content &
UI Overhaul plan). To keep that swap reversible without a risky multi-file
revert, everything routes through one switch.

## The switch

`ACTIVE_QUESTION_BANK` in `constants.ts` (`'v1' | 'v2'`) is the single
source of truth for which bank is live. It drives:

- **Which question data file loads.** `QUESTION_BANK_PATHS[ACTIVE_QUESTION_BANK]`
  in `constants.ts` maps to the actual file `services/questionService.ts`
  fetches (`loadLocalQuestions`). `v1` → `public/questions.v1.legacy.json`
  (the original bank, renamed from `public/questions.json` rather than
  deleted). `v2` → `public/questions.v2.json` (added once the rebuilt bank
  ships).
- **Which taxonomy/subtopic list applies**, and which `SUBTOPIC_TO_DOMAIN_MAP`
  (or its `v2` per-skill replacement) is used for filtering.
- **Which `availableDifficulties` map is in effect** — `v1` implicitly
  treats every subtopic as having all four tiers (Easy/Medium/Hard/Master,
  today's behavior); `v2` uses the real per-skill gaps in the new 36-skill
  taxonomy (e.g. Trigonometry is Hard-only).

## Rules for anyone touching this area

1. Never delete or overwrite a `v1`-suffixed file while `v2` work is in
   progress — rename/archive, don't replace in place.
2. New `Question`/`DBQuestion` fields introduced for `v2` (`passage`,
   `passages`, `notes`, `stimulus`) must stay optional, so `v1`-shaped
   questions keep rendering correctly in the shared `QuestionCard`
   component regardless of which bank is active.
3. Flipping `ACTIVE_QUESTION_BANK` back to `'v1'` should be sufficient to
   fully revert content, filtering, and difficulty behavior. If a change
   would break that, it's the wrong change — route it through the switch
   instead.
4. Per-user `UserProfile.stats` are keyed by subtopic/skill name and do
   **not** reconcile across a `v1`/`v2` flip once users have practiced
   under the new taxonomy (several skill names differ). This is an
   accepted limitation, not something to build migration logic for.

`v1` artifacts are only deleted outright as a deliberate, separate cleanup
once `v2` has proven itself in production — not as part of the overhaul
itself.
