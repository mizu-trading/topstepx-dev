---
phase: 01-references-and-domain-knowledge
plan: 01
subsystem: references
tags: [topstepx-api, pinescript, safety-patterns, trading, enums, jwt, rate-limits, repainting]

# Dependency graph
requires:
  - phase: none
    provides: "First phase — no prior dependencies"
provides:
  - "Consolidated TopStepX API reference (TOPSTEPX_API.md) with REST, WebSocket, enums, rate limits, safety cross-references"
  - "PineScript v6 reference (PINESCRIPT.md) with conversion mappings, repainting detection, TA function mapping"
  - "Safety patterns reference (safety-patterns.md) with SAF-01 through SAF-05 code patterns"
affects: [templates, agents, workflows, pinescript-conversion, language-adaptation]

# Tech tracking
tech-stack:
  added: []
  patterns: [safety-as-reference-content, content-consolidation-with-layering, cross-reference-linking]

key-files:
  created:
    - topstepx/references/TOPSTEPX_API.md
    - topstepx/references/PINESCRIPT.md
    - topstepx/references/safety-patterns.md
  modified: []

key-decisions:
  - "Kept existing TOPSTEPX_API.md structure intact and enhanced in-place rather than restructuring"
  - "Added TA function conversion mapping table (trading-signals for JS, pandas-ta for Python) to PINESCRIPT.md"
  - "safety-patterns.md includes complete copy-pasteable code patterns rather than abstract descriptions"
  - "Bracket orders (stop-loss + take-profit) documented as the DEFAULT for all order placements in SAF-01"

patterns-established:
  - "Cross-reference pattern: domain references link to safety-patterns.md by SAF-XX identifier"
  - "Enum constant pattern: named constants defined once in SAF-01, referenced by all generated code"
  - "Bar-close default policy: converted bots use barstate.isconfirmed unless user explicitly opts for tick-based"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-03-11
---

# Phase 1 Plan 1: Core Domain References Summary

**Consolidated TopStepX API reference, PineScript v6 conversion reference, and five-domain safety patterns reference (SAF-01 through SAF-05) with copy-pasteable code patterns**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-11T19:10:12Z
- **Completed:** 2026-03-11T19:14:33Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created TOPSTEPX_API.md (1114 lines) with prominent rate limits table, JWT 24hr refresh note, enum constant warning, and safety cross-references linking to SAF-01/02/03/05
- Created PINESCRIPT.md (526 lines) with 4-point repainting detection section, bar-close default policy, TA function conversion mapping (trading-signals/pandas-ta), alertcondition conversion, and safety cross-reference to SAF-04
- Created safety-patterns.md (481 lines) covering all five safety domains with complete code implementations: enum constants (8 types), TokenManager JWT refresh, RateLimiter class, repainting audit checklist, placeOrderSafe error handling, WebSocket reconnection, and position reconciliation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TOPSTEPX_API.md and PINESCRIPT.md** - `a06d1b5` (feat)
2. **Task 2: Create safety-patterns.md** - `f438172` (feat)

## Files Created/Modified
- `topstepx/references/TOPSTEPX_API.md` - Consolidated API reference with REST endpoints, WebSocket events, enum definitions, rate limits, and safety cross-references
- `topstepx/references/PINESCRIPT.md` - PineScript v6 reference with conversion mappings, repainting detection, TA function mapping table
- `topstepx/references/safety-patterns.md` - Five-domain safety reference (SAF-01 through SAF-05) with copy-pasteable code patterns

## Decisions Made
- Kept existing TOPSTEPX_API.md structure intact; enhanced rate limits, authentication, and enum sections in-place rather than reorganizing
- Added TA function conversion mapping table to PINESCRIPT.md (trading-signals for JS, pandas-ta for Python) — not explicitly in plan but needed for complete conversion reference (Rule 2 deviation)
- safety-patterns.md at 481 lines exceeds the 250-400 target range because complete code implementations require more space; completeness prioritized over brevity
- Bracket orders documented as DEFAULT in SAF-01 risk guardrails — every order placement should include stop-loss and take-profit unless explicitly opted out

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added TA function conversion mapping table to PINESCRIPT.md**
- **Found during:** Task 1 (PINESCRIPT.md enhancement)
- **Issue:** Plan mentioned "ensure conversion mapping tables include mappings for ta.* -> trading-signals/pandas-ta equivalents" but the existing file only had basic strategy function mappings, not TA library mappings
- **Fix:** Added a complete TA Function Conversion Mapping table with 9 ta.* functions mapped to both trading-signals (JS) and pandas-ta (Python) equivalents, plus alertcondition conversion table
- **Files modified:** topstepx/references/PINESCRIPT.md
- **Verification:** Table present with ta.sma, ta.ema, ta.rsi, ta.macd, ta.bb, ta.atr, ta.stoch, ta.crossover, ta.crossunder mappings
- **Committed in:** a06d1b5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical functionality)
**Impact on plan:** TA mapping table was required by the plan's own verification criteria. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three core reference files are complete and cross-linked
- Templates (Phase 2) and agents (Phase 3) can load these references via @-references
- PineScript conversion workflow (Phase 7) has the repainting audit and conversion mappings ready
- Safety patterns are ready for embedding in bot scaffold templates (Phase 2)

## Self-Check: PASSED

All files verified present. All commit hashes verified in git log.

---
*Phase: 01-references-and-domain-knowledge*
*Completed: 2026-03-11*
