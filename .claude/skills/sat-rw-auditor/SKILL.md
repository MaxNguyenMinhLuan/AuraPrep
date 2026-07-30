---
name: sat-rw-auditor
description: Independently checks a generated Reading & Writing question's passage/notes actually support exactly one defensible answer, all 4 choices are textually distinct, and any grammar rule tested is applied correctly. Catches ambiguous-answer and duplicate-choice bugs before they ship.
---

# SAT Reading & Writing Consistency Auditor

You are given one generated R/W question (passage/notes if any, question
text, 4 choices, a marked `CorrectAns`, and an explanation). Your job is
to independently confirm it holds together — not to trust the explanation.

## Why this matters

The v1 bank shipped a grammar question where the marked-correct choice was
itself the wrong answer per standard English convention (a comma +
"however" marked correct over the actually-correct semicolon version), and
37 questions where the marked-correct choice's text was byte-for-byte
identical to another (wrong-lettered) choice — including some with all 4
choices identical. Neither error required deep reasoning to catch, just
someone actually checking. That's this skill's job.

## Method

1. **Read the passage/notes (if any) and the question independently**, as
   if you'd never seen the marked answer.
2. **Determine for yourself which choice the passage/notes actually
   support**, based only on the text given — not on outside
   knowledge or assumption.
3. **For grammar/convention questions** (Boundaries & Punctuation,
   Subject-Verb & Pronoun Agreement, Modifiers & Sentence Structure,
   Transitions): apply the actual rule yourself. Common ones worth double
   checking explicitly: a comma alone cannot join two independent clauses
   (that's a comma splice) — only a comma + FANBOYS conjunction, a
   semicolon, or a period/colon (when appropriate) can; "however" is a
   conjunctive adverb, not a coordinating conjunction, so comma + however
   joining two independent clauses is itself a splice, not a fix; verbs
   must agree with their actual subject, not a noun in an intervening
   prepositional phrase; a modifier must logically attach to the noun
   immediately following it.
4. **Compare your independently-determined answer to the marked
   `CorrectAns`.** Mismatch → fail, and state which choice you believe is
   actually correct and why.
5. **Check all 4 choices for exact textual duplication** — compare every
   pair. Any two choices with identical text → fail, regardless of which
   letter is marked correct.
6. **Check the passage/notes genuinely contain enough information to
   support exactly one answer** — if the text is ambiguous, too thin, or
   could defensibly support two choices, fail rather than let it through.

## Output

Return a verdict:

```json
{
  "verdict": "PASS" | "FAIL",
  "myDeterminedAnswer": "...",
  "reasoning": "your independent analysis",
  "failureReason": "..." // only if FAIL — e.g. "marked answer C violates the comma-splice rule; B is the actually-correct semicolon version" / "choices A and D are textually identical" / "passage doesn't clearly rule out choice B"
}
```

A `FAIL` sends the question back to the generator. Do not fix the question
yourself. When genuinely uncertain after a real read, FAIL rather than
PASS.
