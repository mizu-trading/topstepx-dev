---
phase: 05-from-scratch-workflow
plan: 01
subsystem: workflows
tags: [new-project, trading-questioning, strategy-spec, risk-parameters, trading-requirements]

# Dependency graph
requires:
  - phase: 04-core-execution-workflows
    provides: Naming-only adapted new-project.md workflow (1,112 lines)
  - phase: 01-passive-references
    provides: questioning.md, safety-patterns.md trading references
  - phase: 02-templates
    provides: strategy-spec.md, risk-parameters.md, project.md templates
provides:
  - Trading-specific project initialization workflow with 5-domain questioning
  - Strategy-spec and risk-parameters artifact generation in Step 4
  - Trading requirement categories (API-/STR-/RSK-/RTD-/SAF-/BOT-)
  - Trading-aware research prompts for 4 parallel researchers
  - Auto-mode trading field extraction from provided documents
affects: [06-adapt-pinescript-workflow, 07-discuss-phase-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Trading 5-domain questioning pattern (instrument, strategy, execution, risk, account)"
    - "Triple artifact generation (PROJECT.md + strategy-spec.md + risk-parameters.md)"
    - "Non-optional risk parameter capture with conservative defaults from safety-patterns.md"
    - "Trading requirement category taxonomy (API/STR/RSK/RTD/SAF/BOT)"

key-files:
  created: []
  modified:
    - topstepx/workflows/new-project.md

key-decisions:
  - "Trading questioning replaces generic opener -- 'Tell me about your trading idea' instead of 'What do you want to build'"
  - "Risk parameters captured during Step 3 questioning, generated as artifact in Step 4 -- never deferred to Step 7"
  - "SAF-* and RSK-* requirement categories are non-optional even if user doesn't mention them"
  - "Auto-mode parses trading fields from provided documents including PineScript detection"
  - "Generic category fallback preserved for potential non-trading projects"

patterns-established:
  - "Trading project initialization always produces 3 artifacts: PROJECT.md, strategy-spec.md, risk-parameters.md"
  - "Research prompts filled with specific strategy context, not generic [domain] placeholders"

requirements-completed: [WKF-01]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 5 Plan 1: New Project Trading Workflow Summary

**Trading-specific project initialization with 5-domain questioning, strategy-spec + risk-parameters artifact generation, and API/STR/RSK/RTD/SAF/BOT requirement categories**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-12T20:32:40Z
- **Completed:** 2026-03-12T20:38:04Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Transformed generic "What do you want to build?" opener into trading-specific "Tell me about your trading idea" with 5-domain follow-up questioning
- Added strategy-spec.md and risk-parameters.md artifact generation alongside PROJECT.md in Step 4
- Injected trading requirement categories (API-/STR-/RSK-/RTD-/SAF-/BOT-) into Step 7 with SAF and RSK as non-optional
- Enhanced all 4 parallel research prompts with trading-specific context (SignalR, indicators, bracket orders, repainting)
- Added auto-mode trading field extraction for instruments, indicators, risk params, and PineScript detection

## Task Commits

Each task was committed atomically:

1. **Task 1: Inject trading content into Steps 3, 4, and auto-mode** - `350fc58` (feat)
2. **Task 2: Inject trading content into Steps 6, 7, 9, and success criteria** - `52f7658` (feat)

## Files Created/Modified
- `topstepx/workflows/new-project.md` - Trading-specific project initialization workflow (1,307 lines, up from 1,112)

## Decisions Made
- Trading questioning replaces generic opener with "Tell me about your trading idea -- what do you want to trade and how?"
- Risk parameters are captured during Step 3 questioning and generated as artifacts in Step 4, never deferred to Step 7
- SAF-* and RSK-* requirement categories are always included even if user doesn't mention them (conservative defaults from safety-patterns.md)
- Auto-mode parses trading-specific fields from provided documents, including PineScript code block detection with repainting audit flagging
- Generic feature category examples preserved as fallback for non-trading projects

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- new-project.md workflow is now fully trading-aware
- Ready for Phase 6 (adapt-pinescript workflow) and Phase 7 (discuss-phase workflow) which can proceed in parallel
- All trading references (questioning.md, strategy-spec.md, risk-parameters.md, safety-patterns.md) are properly wired into the workflow

## Self-Check: PASSED

- FOUND: topstepx/workflows/new-project.md
- FOUND: .planning/phases/05-from-scratch-workflow/05-01-SUMMARY.md
- FOUND: 350fc58 (Task 1 commit)
- FOUND: 52f7658 (Task 2 commit)

---
*Phase: 05-from-scratch-workflow*
*Completed: 2026-03-12*
