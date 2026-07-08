# Project Constitution (claude.md)

## Data Schemas
Please refer to the main Project Schema file [gemini.md](file:///Users/maxminhluannguyen/AuraPrep/gemini.md) for full descriptions of all database models (User, UserGameData, PerformanceLogs).

## Behavioral Rules
1. Never guess at business logic.
2. Prioritize reliability over speed.
3. Update SOPs in `architecture/` before updating code if logic changes.
4. Keep the repair loop active for self-healing.
5. All scraped data, logs, and temporary files live in `.tmp/`.

## Architectural Invariants
1. 3-Layer Build structure must be maintained:
   - Layer 1: SOPs (`architecture/*.md`)
   - Layer 2: Navigation (LLM decision layer)
   - Layer 3: Tools (`tools/*.py`)
2. Environment variables must be loaded from `.env`.
