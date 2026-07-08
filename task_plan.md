# AuraPrep B.L.A.S.T. Development Checklist

## Phase 0: Initialization & Discovery
- [x] Initialized Project Memory files (`task_plan.md`, `findings.md`, `progress.md`, `claude.md`, `gemini.md`)
- [/] Drafted and submitted Discovery/Clarification Questions to the user
- [ ] Define JSON Data Schema in `gemini.md` (and `claude.md`)
- [ ] Obtain Blueprint approval from user

## Phase 1: B - Blueprint (Vision & Logic)
- [ ] Map out the 45 SAT subtopics with their starting difficulty tiers (Easy, Medium, Hard)
- [ ] Outline the "Seed" Welcome Mission (10 questions diagnostic flow)
- [ ] Draft calibration pivot scoring logic (TTA < 30s vs. TTA > 90s)
- [ ] Draft cross-category inference mapping rules

## Phase 2: L - Link (Connectivity)
- [ ] Configure and verify Firebase Web App configuration credentials in `.env.local`
- [ ] Configure SendGrid API Key & APP_URL in `functions/.env` (or server `.env`)
- [ ] Write a script to test SendGrid email connectivity and template rendering

## Phase 3: A - Architect (3-Layer Build)
- [ ] **Layer 1 (Architecture):** Define SOPs in `architecture/` for:
  - `calibration_engine.md`
  - `gacha_collection.md`
  - `email_nudge_escalation.md`
- [ ] **Layer 2 (Navigation):** Integrate database routes and frontend auth/navigation flows
- [ ] **Layer 3 (Tools):** Implement backend services / endpoints for:
  - Calibrations (accuracy and TTA logs)
  - Ethereal Guardian summons (Kanto 151 indices)
  - Daily mission tracking and streak verification
  - Analytics data tracking (UserMetrics & PerformanceLogs tables)

## Phase 4: S - Stylize (Refinement & UI)
- [ ] Clean up responsive layouts for mobile (single-column) and desktop (multi-column)
- [ ] Add the disabled, stylized "Battle" action button with a "Coming Soon" badge
- [ ] Refine the email nudge templates copy (Fire/Psychic type variation)

## Phase 5: T - Trigger (Deployment)
- [ ] Deploy frontend to Firebase Hosting
- [ ] Deploy backend to server hosting (or Cloud Functions)
- [ ] Setup Cron schedule (hourly trigger) for email nudges
- [ ] Finalize Maintenance Log in `gemini.md`
