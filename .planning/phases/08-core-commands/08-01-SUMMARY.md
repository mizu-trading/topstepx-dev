---
phase: 08-core-commands
plan: 01
subsystem: commands
tags: [slash-commands, markdown, yaml-frontmatter, workflow-delegation]

# Dependency graph
requires:
  - phase: 04-workflows-utilities
    provides: "All 8 workflow files that commands delegate to (new-project, discuss-phase, plan-phase, execute-phase, verify-work, audit-milestone, complete-milestone, new-milestone)"
  - phase: 05-new-project-workflow
    provides: "Trading-specific new-project workflow"
provides:
  - "8 /tsx:* slash commands for core workflow invocation"
  - "/tsx:new-project, /tsx:discuss-phase, /tsx:plan-phase, /tsx:execute-phase"
  - "/tsx:verify-work, /tsx:audit-milestone, /tsx:complete-milestone, /tsx:new-milestone"
affects: [09-navigation-commands, 10-installer]

# Tech tracking
tech-stack:
  added: []
  patterns: [thin-command-delegation, yaml-frontmatter-schema, canonical-path-prefix]

key-files:
  created:
    - commands/tsx/new-project.md
    - commands/tsx/discuss-phase.md
    - commands/tsx/plan-phase.md
    - commands/tsx/execute-phase.md
    - commands/tsx/verify-work.md
    - commands/tsx/audit-milestone.md
    - commands/tsx/complete-milestone.md
    - commands/tsx/new-milestone.md
  modified: []

key-decisions:
  - "All commands use $HOME/.claude/topstepx/ canonical path prefix for cross-platform portability"
  - "discuss-phase preserves full process section content (longest command besides complete-milestone) for self-contained execution"
  - "complete-milestone preserves full 8-step process inline with /tsx: routing throughout"

patterns-established:
  - "Thin command delegation: every command delegates to exactly one topstepx/workflows/ file with zero inline logic"
  - "YAML frontmatter schema: name, description, argument-hint, allowed-tools, optional agent/type fields"
  - "Path reference pattern: @$HOME/.claude/topstepx/ prefix for all @ references"

requirements-completed: [CMD-01, CMD-02, CMD-03, CMD-04, CMD-05, CMD-06, CMD-07, CMD-08]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 8 Plan 1: Core Commands Summary

**8 thin /tsx:* slash commands delegating to topstepx/workflows/ with zero inline logic and zero GSD naming leaks**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T02:47:19Z
- **Completed:** 2026-03-13T02:50:19Z
- **Tasks:** 2
- **Files created:** 8

## Accomplishments
- Created 4 primary workflow commands: new-project, discuss-phase, plan-phase, execute-phase
- Created 4 lifecycle commands: verify-work, audit-milestone, complete-milestone, new-milestone
- plan-phase.md includes `agent: tsx-planner` for correct model routing
- complete-milestone.md includes `type: prompt` preserving GSD convention exactly
- All 8 commands verified with zero GSD naming leaks

## Task Commits

Each task was committed atomically:

1. **Task 1: Create 4 primary workflow commands** - `0477520` (feat)
2. **Task 2: Create 4 lifecycle commands** - `fc67e58` (feat)

## Files Created/Modified
- `commands/tsx/new-project.md` - /tsx:new-project entry point, delegates to new-project workflow
- `commands/tsx/discuss-phase.md` - /tsx:discuss-phase entry point with full process section
- `commands/tsx/plan-phase.md` - /tsx:plan-phase entry point with agent: tsx-planner
- `commands/tsx/execute-phase.md` - /tsx:execute-phase entry point with tsx-tools reference
- `commands/tsx/verify-work.md` - /tsx:verify-work entry point for conversational UAT
- `commands/tsx/audit-milestone.md` - /tsx:audit-milestone entry point for DoD verification
- `commands/tsx/complete-milestone.md` - /tsx:complete-milestone with type: prompt and full 8-step process
- `commands/tsx/new-milestone.md` - /tsx:new-milestone brownfield entry point

## Decisions Made
- All commands use `$HOME/.claude/topstepx/` canonical path prefix (Phase 10 installer will rewrite to absolute paths)
- discuss-phase preserves full process section content for self-contained execution guidance
- complete-milestone preserves full 8-step process inline with `/tsx:` routing throughout (longest command)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 8 core workflow commands complete, ready for Phase 8 Plan 2 (navigation commands)
- All commands reference existing topstepx/workflows/ files from Phases 4-7
- commands/tsx/ directory established for remaining CMD-09 through CMD-12

## Self-Check: PASSED

- All 8 command files: FOUND
- SUMMARY.md: FOUND
- Commit 0477520: FOUND
- Commit fc67e58: FOUND

---
*Phase: 08-core-commands*
*Completed: 2026-03-12*
