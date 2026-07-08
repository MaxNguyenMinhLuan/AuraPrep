# Project Findings & Constraints

## Discovery & Research

### Codebase State
- **Frontend:** A React (Vite) project featuring Google Sign-In via Firebase Auth. It stores state in `localStorage` and syncs with the backend API.
- **Backend:** An Express.js application (`server/`) that connects to MongoDB Atlas using connection pooling and Mongoose schemas (`User`, `UserGameData`, `Analytics`).
- **Cloud Functions:** Located in `functions/`, containing scheduled hourly triggers for morning, afternoon, and evening nudges. However, these are implemented to read and write directly to **Firestore**, causing a mismatch since the main backend is MongoDB.

### UI State
- Screens for Dashboard, Missions, Summon, Bestiary, Progress, and Leaderboard are present.
- A "Battle" visual button is missing and must be added with a "Coming Soon" styling.

### SAT Curriculum Research (B.L.A.S.T. Phase 1)
- **Strategy & Cheat Sheet:** A detailed system has been defined to focus the curriculum around gaming/cheesing the Digital SAT. This is documented in [findings_sat_strategy.md](file:///Users/maxminhluannguyen/AuraPrep/findings_sat_strategy.md). It highlights Desmos hacks (intersection, slider checks, linear regressions) and Standard English Conventions shortcuts (period-equals-semicolon, comma splice splice rules).
- **Official Question Style & Calibration:** Official College Board SAT question structures, tones, and difficulty bands (Easy, Medium, Hard) have been mapped out to avoid difficulty mismatch. Phrasing templates for non-copyrighted questions are documented in [findings_sat_style_guide.md](file:///Users/maxminhluannguyen/AuraPrep/findings_sat_style_guide.md).

## System Constraints
- **Mobile-first viewport:** must fit screen width, with no horizontal scrolling.
- **V1 gameplay:** limited to guardian summon, growth/leveling, and evolution. Battle must remain disabled.

## Key Findings
- Scheduled cloud functions require environment secrets (`SENDGRID_API_KEY`, `JWT_SECRET`, `APP_URL`).
- To make the email nudge system work, we need a unified database strategy (either using Firestore or MongoDB Atlas).

