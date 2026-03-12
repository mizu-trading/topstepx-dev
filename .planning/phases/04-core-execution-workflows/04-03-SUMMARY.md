---
phase: 04-core-execution-workflows
plan: 03
subsystem: workflows
tags: [verification, uat, debugging, diagnosis, trading-validation]

# Dependency graph
requires:
  - phase: 03-trading-aware-agents
    provides: tsx-verifier, tsx-debugger, tsx-planner, tsx-plan-checker agents
provides:
  - verify-work workflow with conversational UAT and trading validation
  - verify-phase workflow with goal-backward phase verification
  - diagnose-issues workflow with tsx-debugger parallel diagnosis
affects: [05-tsx-specific-workflows, 08-commands-installer]

# Tech tracking
tech-stack:
  added: []
  patterns: [conversational-uat, goal-backward-verification, parallel-debug-diagnosis]

key-files:
  created:
    - topstepx/workflows/verify-work.md
    - topstepx/workflows/verify-phase.md
    - topstepx/workflows/diagnose-issues.md
  modified: []

key-decisions:
  - "Trading-specific severity inference added for order/safety/data issues in verify-work UAT"
  - "tsx-verifier automated pre-check step added before conversational UAT testing"
  - "Trading examples replace generic examples in diagnose-issues (bracket orders, SignalR, PineScript)"

patterns-established:
  - "Verification pipeline: verify-work (UAT) -> diagnose-issues (root cause) -> plan gap closure"
  - "Trading severity inference: missing safety patterns are blockers, data delays are minor"

requirements-completed: [WKF-05]

# Metrics
duration: 6min
completed: 2026-03-12
---

# Phase 4 Plan 3: Verification & Diagnosis Workflows Summary

**Conversational UAT, phase verification, and parallel tsx-debugger diagnosis workflows with trading-specific validation for order flow, safety patterns, and data streaming**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-12T19:03:28Z
- **Completed:** 2026-03-12T19:09:14Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- verify-work.md (654 lines) with tsx-verifier pre-check and trading deliverable extraction (orders, WebSocket, safety)
- verify-phase.md (243 lines) with topstepx paths and tsx-tools references for phase-level goal-backward verification
- diagnose-issues.md (221 lines) with tsx-debugger parallel spawning and trading-aware gap diagnosis

## Task Commits

Each task was committed atomically:

1. **Task 1: Adapt verify-work workflow with trading validation awareness** - `4c90b4e` (feat)
2. **Task 2: Adapt verify-phase and diagnose-issues workflows** - `a750bee` (feat)

## Files Created/Modified
- `topstepx/workflows/verify-work.md` - Conversational UAT with tsx-verifier pre-check and trading severity inference
- `topstepx/workflows/verify-phase.md` - Phase-level goal-backward verification with topstepx paths
- `topstepx/workflows/diagnose-issues.md` - Parallel tsx-debugger diagnosis orchestration with trading examples

## Decisions Made
- Added tsx-verifier automated pre-check step before conversational UAT (not in GSD source) for proactive gap detection
- Trading-specific severity inference rules: missing safety patterns = blocker, wrong fill price = major, data delay = minor
- Trading examples in diagnose-issues replace generic examples (bracket orders, SignalR reconnect, PineScript bar-close)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Verification pipeline complete (verify-work, verify-phase, diagnose-issues)
- Ready for Phase 4 Plan 4 (remaining workflow adaptations)
- All three workflows correctly reference tsx-* agents and topstepx paths

## Self-Check: PASSED

All files verified present, all commits verified in git log.

---
*Phase: 04-core-execution-workflows*
*Completed: 2026-03-12*
