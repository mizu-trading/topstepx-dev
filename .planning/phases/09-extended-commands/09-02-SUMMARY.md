---
phase: 09-extended-commands
plan: 02
subsystem: commands
tags: [slash-commands, utility, tsx, map-codebase, quick, add-todo, check-todos, settings, set-profile, update, validate-phase, health, cleanup, add-tests]

# Dependency graph
requires:
  - phase: 04-workflows
    provides: workflow files referenced by command execution_context
  - phase: 08-core-commands
    provides: command pattern and commands/tsx/ directory
provides:
  - 11 utility slash commands completing the TSX command surface
  - Full command coverage for codebase mapping, quick tasks, todos, settings, updates, health, testing, cleanup, validation
affects: [09-03-extended-commands, installer]

# Tech tracking
tech-stack:
  added: []
  patterns: [thin-delegation-commands, systematic-naming-replacement]

key-files:
  created:
    - commands/tsx/add-todo.md
    - commands/tsx/check-todos.md
    - commands/tsx/settings.md
    - commands/tsx/set-profile.md
    - commands/tsx/update.md
    - commands/tsx/cleanup.md
    - commands/tsx/map-codebase.md
    - commands/tsx/quick.md
    - commands/tsx/validate-phase.md
    - commands/tsx/health.md
    - commands/tsx/add-tests.md
  modified: []

key-decisions:
  - "cleanup.md intentionally omits allowed-tools and argument-hint fields, matching GSD source design"
  - "add-tests.md preserves argument-instructions frontmatter for phase number parsing examples"
  - "All commands use $HOME/.claude/topstepx/workflows/ canonical path prefix"

patterns-established:
  - "Thin delegation: commands contain objective, context, and process sections but delegate all logic to workflow files"
  - "Systematic naming: gsd->tsx, get-shit-done->topstepx, gsd-*-agent->tsx-*-agent replacements applied consistently"

requirements-completed: [CMD-18, CMD-19, CMD-21, CMD-22, CMD-23, CMD-24, CMD-25, CMD-27, CMD-28, CMD-29, CMD-30]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 09 Plan 02: Utility Commands Summary

**11 utility slash commands (add-todo, check-todos, settings, set-profile, update, cleanup, map-codebase, quick, validate-phase, health, add-tests) adapted from GSD sources with systematic tsx/topstepx naming**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T03:17:41Z
- **Completed:** 2026-03-13T03:20:38Z
- **Tasks:** 2
- **Files created:** 11

## Accomplishments
- Created 6 simple utility commands (add-todo, check-todos, settings, set-profile, update, cleanup) with correct frontmatter and workflow delegation
- Created 5 medium utility commands (map-codebase, quick, validate-phase, health, add-tests) with special field preservation
- Zero GSD naming leaks verified across all 11 command files
- All special fields preserved: argument-instructions in add-tests, no allowed-tools in cleanup, tsx-codebase-mapper in map-codebase, tsx-planner/tsx-executor in quick

## Task Commits

Each task was committed atomically:

1. **Task 1: Create 6 simple utility commands** - `c6b62bd` (feat)
2. **Task 2: Create 5 medium utility commands** - `40e2799` (feat)

## Files Created/Modified
- `commands/tsx/add-todo.md` - Todo capture command, routes to add-todo workflow
- `commands/tsx/check-todos.md` - Todo listing and selection command
- `commands/tsx/settings.md` - TSX workflow toggles configuration command
- `commands/tsx/set-profile.md` - Model profile switching command (quality/balanced/budget)
- `commands/tsx/update.md` - TSX version update command with changelog display
- `commands/tsx/cleanup.md` - Milestone archive command (minimal, no allowed-tools)
- `commands/tsx/map-codebase.md` - Parallel codebase analysis with tsx-codebase-mapper agents
- `commands/tsx/quick.md` - Quick task execution with tsx-planner + tsx-executor
- `commands/tsx/validate-phase.md` - Nyquist validation audit for completed phases
- `commands/tsx/health.md` - Planning directory health diagnostics with optional repair
- `commands/tsx/add-tests.md` - Test generation with argument-instructions for phase parsing

## Decisions Made
- cleanup.md intentionally omits allowed-tools and argument-hint fields, matching GSD source design
- add-tests.md preserves argument-instructions frontmatter for phase number parsing examples
- All commands use $HOME/.claude/topstepx/workflows/ canonical path prefix for cross-platform portability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 11 utility commands complete, ready for Phase 09 Plan 03 (remaining commands)
- commands/tsx/ directory now contains 23 total commands (12 from Phase 8 + 11 from this plan)

## Self-Check: PASSED

- All 11 command files: FOUND
- SUMMARY.md: FOUND
- Commit c6b62bd: FOUND
- Commit 40e2799: FOUND

---
*Phase: 09-extended-commands*
*Completed: 2026-03-13*
