---
phase: 04-core-execution-workflows
plan: 04
subsystem: workflows
tags: [naming-adaptation, workflows, tsx-commands, utility-workflows]

# Dependency graph
requires:
  - phase: 02-templates-tooling-config
    provides: "tsx-tools.cjs references, topstepx paths, tsx/ branch prefixes"
  - phase: 03-trading-aware-agents
    provides: "tsx-* agent names for spawning references"
provides:
  - "26 utility/supporting workflow files in topstepx/workflows/"
  - "Complete /tsx: command reference in help.md"
  - "topstepx-dev@latest package name in update.md"
  - "~/.tsx/ config paths in settings.md"
affects: [05-new-project-trading, 06-debug-workflow, 07-verify-work-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mechanical naming replacement: gsd-* -> tsx-*, /gsd: -> /tsx:, GSD -> TSX"
    - "Naming-only adaptation preserving full GSD workflow logic"

key-files:
  created:
    - topstepx/workflows/new-project.md
    - topstepx/workflows/complete-milestone.md
    - topstepx/workflows/quick.md
    - topstepx/workflows/help.md
    - topstepx/workflows/new-milestone.md
    - topstepx/workflows/progress.md
    - topstepx/workflows/add-tests.md
    - topstepx/workflows/audit-milestone.md
    - topstepx/workflows/map-codebase.md
    - topstepx/workflows/resume-project.md
    - topstepx/workflows/discovery-phase.md
    - topstepx/workflows/plan-milestone-gaps.md
    - topstepx/workflows/update.md
    - topstepx/workflows/settings.md
    - topstepx/workflows/list-phase-assumptions.md
    - topstepx/workflows/check-todos.md
    - topstepx/workflows/validate-phase.md
    - topstepx/workflows/add-todo.md
    - topstepx/workflows/remove-phase.md
    - topstepx/workflows/cleanup.md
    - topstepx/workflows/health.md
    - topstepx/workflows/insert-phase.md
    - topstepx/workflows/pause-work.md
    - topstepx/workflows/add-phase.md
    - topstepx/workflows/set-profile.md
    - topstepx/workflows/research-phase.md
  modified: []

key-decisions:
  - "Naming-only adaptation of 7,719 lines across 26 files -- zero refactoring of production-proven GSD workflow logic"
  - "help.md rebranded: TSX (TopStepX) creates hierarchical project plans optimized for solo agentic development of TopStepX trading bots"
  - "new-project.md kept naming-only -- deep trading injection deferred to Phase 5 (WKF-01)"
  - "update.md package name changed to topstepx-dev@latest"
  - "settings.md config paths use ~/.tsx/ instead of ~/.gsd/"

patterns-established:
  - "All utility workflows use consistent tsx-* agent spawning references"
  - "All /tsx: command prefixes replace /gsd: throughout"
  - "All $HOME/.claude/topstepx/ paths replace C:/Users/bkevi/.claude/get-shit-done/"

requirements-completed: [WKF-06]

# Metrics
duration: 6min
completed: 2026-03-12
---

# Phase 04 Plan 04: Utility Workflows Summary

**26 utility/supporting workflows adapted from GSD to TSX with consistent tsx-* naming, /tsx: commands, and topstepx paths -- zero logic changes**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-12T19:03:24Z
- **Completed:** 2026-03-12T19:09:24Z
- **Tasks:** 2
- **Files created:** 26

## Accomplishments
- Adapted 13 larger utility workflows (new-project, complete-milestone, quick, help, new-milestone, progress, add-tests, audit-milestone, map-codebase, resume-project, discovery-phase, plan-milestone-gaps, update)
- Adapted 13 smaller utility workflows (settings, list-phase-assumptions, check-todos, validate-phase, add-todo, remove-phase, cleanup, health, insert-phase, pause-work, add-phase, set-profile, research-phase)
- Zero GSD references remaining across all 26 files verified with grep
- help.md fully rebranded with TSX framework description and 85 /tsx: command references

## Task Commits

Each task was committed atomically:

1. **Task 1: Adapt 13 larger utility workflows** - `aa83678` (feat)
2. **Task 2: Adapt 13 smaller utility workflows** - `f31f8e4` (feat)

## Files Created/Modified
- `topstepx/workflows/new-project.md` - Project initialization workflow (1,111 lines, naming-only)
- `topstepx/workflows/complete-milestone.md` - Milestone completion and archiving (764 lines)
- `topstepx/workflows/quick.md` - Ad-hoc task execution with tsx-planner/tsx-executor (601 lines)
- `topstepx/workflows/help.md` - Complete /tsx: command reference (489 lines, rebranded)
- `topstepx/workflows/new-milestone.md` - New milestone cycle initialization (384 lines)
- `topstepx/workflows/progress.md` - Progress tracking and routing (382 lines)
- `topstepx/workflows/add-tests.md` - Test generation for completed phases (351 lines)
- `topstepx/workflows/audit-milestone.md` - Milestone audit with tsx-integration-checker (332 lines)
- `topstepx/workflows/map-codebase.md` - Codebase mapping with tsx-codebase-mapper (316 lines)
- `topstepx/workflows/resume-project.md` - Session resumption with context restoration (307 lines)
- `topstepx/workflows/discovery-phase.md` - Multi-depth discovery workflow (289 lines)
- `topstepx/workflows/plan-milestone-gaps.md` - Gap closure phase creation (274 lines)
- `topstepx/workflows/update.md` - Update workflow with topstepx-dev@latest (240 lines)
- `topstepx/workflows/settings.md` - Interactive config with ~/.tsx/ paths (214 lines)
- `topstepx/workflows/list-phase-assumptions.md` - Phase assumption surfacing (178 lines)
- `topstepx/workflows/check-todos.md` - Todo listing and routing (177 lines)
- `topstepx/workflows/validate-phase.md` - Nyquist validation with tsx-nyquist-auditor (167 lines)
- `topstepx/workflows/add-todo.md` - Todo capture from conversations (158 lines)
- `topstepx/workflows/remove-phase.md` - Phase removal and renumbering (155 lines)
- `topstepx/workflows/cleanup.md` - Phase directory archival (152 lines)
- `topstepx/workflows/health.md` - Planning directory health check (159 lines)
- `topstepx/workflows/insert-phase.md` - Decimal phase insertion (130 lines)
- `topstepx/workflows/pause-work.md` - Work pause with handoff file (122 lines)
- `topstepx/workflows/add-phase.md` - Phase addition to roadmap (112 lines)
- `topstepx/workflows/set-profile.md` - Model profile switching (81 lines)
- `topstepx/workflows/research-phase.md` - Phase research spawning (74 lines)

## Decisions Made
- Naming-only adaptation preserves all GSD production-proven logic without refactoring
- help.md description rebranded from "GSD (Get Shit Done)" to "TSX (TopStepX) creates hierarchical project plans optimized for solo agentic development of TopStepX trading bots"
- new-project.md intentionally kept at naming-only -- deep trading questioning deferred to Phase 5 (WKF-01)
- update.md npm package name changed to topstepx-dev@latest
- settings.md global defaults path changed to ~/.tsx/defaults.json

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed inline GSD brand text not caught by initial sed replacements**
- **Found during:** Task 1 (verification step)
- **Issue:** sed script caught most references but missed inline "GSD" brand text in banners (GSD ►, GSD >), descriptions, and "gsd-tools" without .cjs extension
- **Fix:** Applied secondary sed replacements for GSD brand text, gsd-tools inline references, and banner text across all files
- **Files modified:** All 26 workflow files
- **Verification:** Final grep confirms zero GSD references
- **Committed in:** aa83678, f31f8e4 (part of task commits)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor -- the initial sed script needed supplementary passes for edge cases in brand text. No scope creep.

## Issues Encountered
None -- mechanical replacement was straightforward once all replacement patterns were identified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 26 utility workflows complete, combined with Plans 01-03 gives full workflow coverage
- Ready for Phase 5 (WKF-01) deep trading injection into new-project.md
- All tsx-* agent spawning references consistent across all workflows

## Self-Check: PASSED

- All 26 utility workflow files exist in topstepx/workflows/
- Total workflow files: 34 (including 8 from Plans 01-03)
- Commit aa83678 exists (Task 1)
- Commit f31f8e4 exists (Task 2)
- SUMMARY.md exists at expected path

---
*Phase: 04-core-execution-workflows*
*Completed: 2026-03-12*
