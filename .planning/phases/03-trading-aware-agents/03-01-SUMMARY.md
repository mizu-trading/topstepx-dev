---
phase: 03-trading-aware-agents
plan: 01
subsystem: agents
tags: [planner, debugger, agent-adaptation, trading-awareness, system-prompts]

# Dependency graph
requires:
  - phase: 02-templates-and-state-tooling
    provides: tsx-tools.cjs CLI, templates, model profiles with tsx-* agent keys
provides:
  - tsx-planner agent definition (1,328 lines) with trading-aware plan creation guidance
  - tsx-debugger agent definition (1,290 lines) with trading-specific debug patterns
affects: [03-trading-aware-agents, 04-core-execution-workflows]

# Tech tracking
tech-stack:
  added: []
  patterns: [gsd-to-tsx agent adaptation with mechanical naming + trading domain injection]

key-files:
  created:
    - topstepx/agents/tsx-planner.md
    - topstepx/agents/tsx-debugger.md
  modified: []

key-decisions:
  - "Trading domain injection added as inline enhancements to existing sections, not new mega-sections -- preserves GSD structural fidelity"
  - "All absolute Windows paths (C:/Users/bkevi/.claude/get-shit-done/) replaced with portable $HOME/.claude/topstepx/ form"
  - "Trading-specific must-haves guidance added to planner's goal_backward section for safety pattern compliance"
  - "Trading debug checklist added to debugger's investigation_techniques for systematic TopStepX API issue diagnosis"

patterns-established:
  - "Agent adaptation pattern: mechanical naming replacement + targeted trading content injection (~20-40 lines per agent)"
  - "Trading domain injection locations: <role> section, technique/methodology sections, verification sections"
  - "Zero GSD remnant verification: grep -c for gsd-, get-shit-done, gsd_, C:/Users must return 0"

requirements-completed: [AGT-02, AGT-05]

# Metrics
duration: 10min
completed: 2026-03-12
---

# Phase 3 Plan 01: Largest Primary Agents Summary

**tsx-planner (1,328 lines) and tsx-debugger (1,290 lines) adapted from GSD with trading-aware plan validation and TopStepX-specific debug patterns**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-12T18:05:11Z
- **Completed:** 2026-03-12T18:16:04Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- tsx-planner.md created with trading-aware plan creation guidance: safety pattern validation in must_haves, bracket order requirements, enum constant checks, trading template references, and TopStepX research domain awareness
- tsx-debugger.md created with trading-specific debug patterns: JWT 24hr expiry diagnosis, rate limit 429 detection, order rejection enum debugging, WebSocket/SignalR reconnection troubleshooting, and TopStepX error pattern table
- Both agents have zero GSD naming remnants (verified via grep) and preserve all GSD structural patterns (XML tags, execution flow, frontmatter schema)

## Task Commits

Each task was committed atomically:

1. **Task 1: Adapt tsx-planner agent from gsd-planner** - `e4eb82f` (feat)
2. **Task 2: Adapt tsx-debugger agent from gsd-debugger** - `012df1c` (feat)

## Files Created/Modified
- `topstepx/agents/tsx-planner.md` - Trading-aware plan creation agent (1,328 lines from 1,309-line GSD source)
- `topstepx/agents/tsx-debugger.md` - Trading-aware debug agent (1,290 lines from 1,257-line GSD source)

## Decisions Made
- Trading domain injection added as inline enhancements to existing sections (role, methodology, verification), not new mega-sections -- keeps agents recognizably GSD-structured for easy upstream merging
- All absolute Windows paths replaced with portable $HOME/.claude/topstepx/ form for cross-platform compatibility
- Planner received trading-specific must-haves guidance for safety pattern compliance in the goal_backward section
- Debugger received a structured trading debug checklist in investigation_techniques and a TopStepX error pattern table in verification_patterns

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Two largest agents complete, establishing the adaptation pattern for remaining 10 agents
- tsx-planner ready for Phase 4 workflow orchestration (plan-phase workflow will spawn tsx-planner)
- tsx-debugger ready for Phase 4 workflow orchestration (debug workflow will spawn tsx-debugger)
- Remaining Phase 3 plans (03-02, 03-03, 03-04) can follow the same mechanical naming + trading injection pattern

## Self-Check: PASSED

- FOUND: topstepx/agents/tsx-planner.md
- FOUND: topstepx/agents/tsx-debugger.md
- FOUND: .planning/phases/03-trading-aware-agents/03-01-SUMMARY.md
- FOUND: e4eb82f (Task 1 commit)
- FOUND: 012df1c (Task 2 commit)

---
*Phase: 03-trading-aware-agents*
*Completed: 2026-03-12*
