---
phase: 02-templates-and-state-tooling
plan: 01
subsystem: templates
tags: [markdown, templates, tsx-naming, trading-examples, config]

# Dependency graph
requires:
  - phase: 01-references-and-domain-knowledge
    provides: tsx-* naming convention established in reference adaptations
provides:
  - 24 top-level GSD templates adapted with tsx-* naming in topstepx/templates/
  - Trading-specific examples in 5 medium-adaptation templates
  - config.json with tsx/ branch naming convention
affects: [agents, workflows, commands, installer]

# Tech tracking
tech-stack:
  added: []
  patterns: [tsx-naming-in-templates, trading-example-additions, gsd-structure-preservation]

key-files:
  created:
    - topstepx/templates/context.md
    - topstepx/templates/phase-prompt.md
    - topstepx/templates/research.md
    - topstepx/templates/user-setup.md
    - topstepx/templates/DEBUG.md
    - topstepx/templates/project.md
    - topstepx/templates/requirements.md
    - topstepx/templates/roadmap.md
    - topstepx/templates/state.md
    - topstepx/templates/config.json
    - topstepx/templates/summary.md
    - topstepx/templates/summary-standard.md
    - topstepx/templates/summary-minimal.md
    - topstepx/templates/summary-complex.md
    - topstepx/templates/verification-report.md
    - topstepx/templates/UAT.md
    - topstepx/templates/VALIDATION.md
    - topstepx/templates/continue-here.md
    - topstepx/templates/discovery.md
    - topstepx/templates/milestone.md
    - topstepx/templates/milestone-archive.md
    - topstepx/templates/retrospective.md
    - topstepx/templates/planner-subagent-prompt.md
    - topstepx/templates/debug-subagent-prompt.md
  modified: []

key-decisions:
  - "Trading examples are ADDITIONS to existing GSD examples, not replacements -- preserves template versatility"
  - "config.json uses tsx/ branch prefix (tsx/phase-{phase}-{slug}) for clean separation from GSD branches"
  - "Structural templates (summary variants, VALIDATION.md) kept domain-agnostic -- no forced trading examples where format is the point"

patterns-established:
  - "Template adaptation pattern: copy GSD source, apply 6 naming substitution rules, add trading examples to medium-adaptation templates only"
  - "Trading example scope: context.md, phase-prompt.md, research.md, user-setup.md, DEBUG.md get trading examples; structural templates do not"

requirements-completed: [TPL-01]

# Metrics
duration: 16min
completed: 2026-03-11
---

# Phase 2 Plan 1: Top-Level Template Adaptation Summary

**24 GSD templates adapted with tsx-* naming, /tsx: commands, topstepx paths, and trading-domain examples in 5 medium-complexity templates**

## Performance

- **Duration:** 16 min
- **Started:** 2026-03-11T19:56:24Z
- **Completed:** 2026-03-11T20:12:34Z
- **Tasks:** 2
- **Files modified:** 24

## Accomplishments
- All 24 top-level GSD templates adapted with zero GSD naming leaks (gsd-, /gsd:, get-shit-done, gsd_ all eliminated)
- 5 medium-adaptation templates include trading-specific examples: TopStepX EMA crossover context, bracket order plan task, WebSocket research, API key setup, order rejection debugging
- config.json uses tsx/phase-{phase}-{slug} branch naming convention
- Template structure, section ordering, and guidelines sections preserved exactly from GSD originals

## Task Commits

Each task was committed atomically:

1. **Task 1: Adapt 5 medium-complexity templates with trading examples** - `a345bd2` (feat)
2. **Task 2: Adapt 19 light-complexity templates with tsx naming** - `cd787f2` (feat)

## Files Created/Modified
- `topstepx/templates/context.md` - Phase context template with tsx-phase-researcher/tsx-planner refs and TopStepX EMA crossover trading example
- `topstepx/templates/phase-prompt.md` - Plan template with topstepx @-reference paths and bracket order trading plan example
- `topstepx/templates/research.md` - Research template with tsx naming and TopStepX WebSocket integration research example
- `topstepx/templates/user-setup.md` - User setup template with TopStepX API key configuration example (TOPSTEPX_USERNAME, TOPSTEPX_API_KEY)
- `topstepx/templates/DEBUG.md` - Debug template with TopStepX order rejection debug example (JWT expiry diagnosis)
- `topstepx/templates/project.md` - Project template with /tsx:map-codebase reference
- `topstepx/templates/requirements.md` - Requirements template, structure preserved
- `topstepx/templates/roadmap.md` - Roadmap template, structure preserved
- `topstepx/templates/state.md` - State template with /tsx:add-todo, /tsx:check-todos references
- `topstepx/templates/config.json` - Config with tsx/ branch templates
- `topstepx/templates/summary.md` - Summary template, structure preserved
- `topstepx/templates/summary-standard.md` - Standard summary variant
- `topstepx/templates/summary-minimal.md` - Minimal summary variant
- `topstepx/templates/summary-complex.md` - Complex summary variant with TSX deviation rules reference
- `topstepx/templates/verification-report.md` - Verification report template
- `topstepx/templates/UAT.md` - UAT template with /tsx:plan-phase --gaps and /tsx:verify-work references
- `topstepx/templates/VALIDATION.md` - Validation strategy template with /tsx:verify-work reference
- `topstepx/templates/continue-here.md` - Continue-here template
- `topstepx/templates/discovery.md` - Discovery template with /tsx:research-phase reference
- `topstepx/templates/milestone.md` - Milestone entry template
- `topstepx/templates/milestone-archive.md` - Milestone archive template
- `topstepx/templates/retrospective.md` - Retrospective template
- `topstepx/templates/planner-subagent-prompt.md` - Planner subagent prompt with tsx-planner agent references
- `topstepx/templates/debug-subagent-prompt.md` - Debug subagent prompt with tsx-debugger agent references

## Decisions Made
- Trading examples added only to medium-adaptation templates where domain context is meaningful (context.md, phase-prompt.md, research.md, user-setup.md, DEBUG.md)
- Structural templates (summary variants, VALIDATION.md, continue-here.md) kept domain-agnostic since their format is the point, not domain content
- config.json adds explicit `branching` section with tsx/ prefixed branch templates rather than using top-level defaults

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 24 top-level templates ready for agent consumption
- Plan 02-02 (subdirectory templates + new trading-specific templates) can proceed
- Plan 02-03 (tsx-tools.cjs) can reference template paths established here

## Self-Check: PASSED

- All 24 template files: FOUND
- Commit a345bd2 (Task 1): FOUND
- Commit cd787f2 (Task 2): FOUND
- SUMMARY.md: FOUND

---
*Phase: 02-templates-and-state-tooling*
*Completed: 2026-03-11*
