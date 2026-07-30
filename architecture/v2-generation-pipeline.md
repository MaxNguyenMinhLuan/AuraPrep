# v2 Question Generation Pipeline (nightly cron job)

This is the self-contained spec the 3:00 AM scheduled agent follows. It has
no memory of any prior conversation — everything it needs is here or in
the files this doc points to. See also `architecture/reversibility.md` and
`architecture/diagnostic.md` for related context.

## Legal ground rules (non-negotiable, read first)

AuraPrep is a commercial product. Every generated item must be **original**:

- Never copy, closely paraphrase, or "reword just enough" any actual
  College Board Question Bank item, Bluebook item, or other disclosed SAT
  question. That is a real copyright and ToS risk, not a style choice.
- Study is fine, copying is not. The idea/expression dichotomy (17 U.S.C.
  §102(b)) protects specific wording, not the underlying skill/format/
  difficulty being tested. Internalize the *pattern*, invent new scenarios,
  numbers, characters, and passages from scratch.
- R/W passages: either fully original prose, or drawn from verified
  public-domain literature (pre-1929 US works — see the existing 1811
  Austen excerpt in `server/src/config/backupQuestionBank.ts` as the house
  precedent). Never contemporary copyrighted text.
- The Originality Check and Style/Difficulty Cross-Reference stages below
  exist specifically to catch violations of this — do not skip them.

## Inputs

- `data/skillTaxonomy.v2.ts` — the 36 skills, their `availableDifficulties`,
  and (after the research workflow) refined `recipe`/calibration notes.
- `data/generationProgress.v2.json` — per (skill, difficulty) target vs.
  done counts. This is the resumable state — always read it first, always
  update it before finishing.

## Nightly batch size

Target **~100 verified questions per night** (not the whole taxonomy at
once). At that pace the full ~2,600-question target takes roughly 4 weeks.
This is deliberate: keeps each run's token/time cost predictable, keeps
quality reviewable in manageable chunks, and respects that this runs
inside the same rate-limited usage window as daytime interactive work —
running at 3 AM changes *when* the quota is spent, not how much exists.

Selection rule: scan `generationProgress.v2.json` in taxonomy order (R/W
skills first, then Math, each skill's difficulties in Easy→Medium→Hard→
Extra Hard order); fill incomplete cells until the ~100-question budget for
the night is spent. Don't leave a cell partially done if avoidable — finish
a cell before starting a new one when close to the nightly budget.

## Target counts per (skill, difficulty) cell

Only for tiers a skill actually has (`availableDifficulties` in
`data/skillTaxonomy.v2.ts`). 'Extra Hard' is generated only for skills
that have 'Hard' (it's an AuraPrep-only stretch tier, not a distinct
real-SAT tier — see `utils/mastery.ts`'s `getSkillCeiling`).

| Tier | Target per skill |
|---|---|
| Easy | 20 |
| Medium | 30 |
| Hard | 30 |
| Extra Hard | 15 |

## Pipeline stages, models, and skill files

Each stage is a distinct role with its own dedicated skill file under
`.claude/skills/` — don't inline a shared mega-prompt across roles in the
orchestrating workflow script; have each spawned agent `Read` its skill
file and follow it exactly, with only the night's specific batch
parameters (skill id, difficulty, count needed) passed in the prompt. This
keeps each role lean, focused, and independently editable.

Model/effort assignment reasoning: math generation and math verification
are where the original v1 bug class lived (an answer that matches none of
its own choices) — those two stages run on **Opus 5** at **high** effort
because first-pass rigor there avoids expensive reject/regenerate loops
downstream, which is more efficient overall, not less. R/W generation and
the lighter judgment/screening stages run on **Sonnet 5**, since
reading-comprehension and style-consistency work is well within its
strength and it's markedly cheaper for a quota-constrained nightly job.
No stage uses Haiku — correctness, copyright exposure, and difficulty
calibration are the entire point of this rebuild.

1. **Math Generator** — `.claude/skills/sat-math-generator/SKILL.md`.
   Model: Opus 5, effort: high. Covers the 4 math domain clusters
   (Algebra, Advanced Math, Problem-Solving and Data Analysis, Geometry
   and Trigonometry).

2. **R/W Generator** — `.claude/skills/sat-rw-generator/SKILL.md`.
   Model: Sonnet 5, effort: high. Covers the 4 R/W domain clusters (Craft
   and Structure, Information and Ideas, Expression of Ideas, Standard
   English Conventions).

3. **Math Verifier** (math items only) — `.claude/skills/sat-math-verifier/SKILL.md`.
   Model: Opus 5, effort: high. Independently re-derives the answer step
   by step and cross-checks it against the marked choice *and* confirms
   the other 3 are wrong for a stated reason. Reject and regenerate on any
   mismatch — this is the single most important gate in the pipeline.

4. **R/W Consistency Auditor** (R/W items only) — `.claude/skills/sat-rw-auditor/SKILL.md`.
   Model: Sonnet 5, effort: medium. Confirms the passage/notes support
   exactly one defensible answer, all 4 choices are textually distinct,
   and grammar items check out against the skill's recipe.

5. **Adversarial Refuter** (all items) — `.claude/skills/sat-adversarial-refuter/SKILL.md`.
   Model: Sonnet 5, effort: high. Argues each of the 3 distractors is
   secretly also correct. A question passes only if it survives refutation
   on all three; otherwise it's kicked back to the generator.

6. **Originality Check** (all items) — `.claude/skills/sat-originality-check/SKILL.md`.
   Model: Sonnet 5, effort: medium. Confirms the item isn't a close
   paraphrase of any known disclosed SAT question, and that any R/W
   passage is either original or a verified public-domain source. Kept at
   Sonnet rather than downgraded further — this is the legal-exposure gate.

7. **Style/Difficulty Cross-Reference** (all items) — `.claude/skills/sat-style-crossref/SKILL.md`.
   Model: Sonnet 5, effort: medium. Reasons about how the item's difficulty
   and presentation compare to real Digital SAT conventions for that
   skill/tier (general knowledge only — never quoting or reproducing
   actual item text). Flags anything too trivial or too convoluted for its
   tier, or stylistically off. Reject and regenerate on a flag.

8. **Deterministic post-processing** (plain code, not an agent, no skill
   file): shuffle the correct-answer letter placement within the night's
   batch so it's roughly uniform across A/B/C/D — the old v1 bank skewed
   57% "A" in one file, which is pattern-guessable and undermines the
   whole point of fixing difficulty.

## Output

Append verified questions to `data/v2Questions/<skill-safe-id>.json`
(create the file if it doesn't exist), matching the `DBQuestion` shape in
`types.ts` plus the v2 fields (`Passage`, `Passages`, `Notes`, `Stimulus`).
`<skill-safe-id>` = the skill's `id` from `data/skillTaxonomy.v2.ts` with
non-alphanumeric characters replaced by `_`.

Update `data/generationProgress.v2.json` with the new done-counts before
finishing.

## Commit strategy

Commit the night's output to a dedicated branch, **not main**:
`git checkout -B v2-content-generation` (create if it doesn't exist,
otherwise reuse it and commit on top). Commit message format:
`v2 content: +N questions (list of skill/tier cells touched)`. Do not
merge into main, open a PR, or push to a remote — that's a decision for
the user to make once they've spot-checked a batch. Never touch `main`.

If `data/generationProgress.v2.json` shows every cell at its target,
stop and do nothing further (log that generation is complete) rather than
regenerating past target counts.
