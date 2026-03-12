---
phase: 06-language-adaptation-workflow
plan: 01
subsystem: workflow
tags: [language-adaptation, cross-language, safety-verification, signalr, trading-bot]

# Dependency graph
requires:
  - phase: 01-references-safety
    provides: safety-patterns.md with SAF-01 through SAF-05 and grep-able verification commands
  - phase: 02-templates
    provides: language-adaptation.md template, bot-scaffold-js.md, bot-scaffold-python.md
  - phase: 04-workflows
    provides: Established TSX workflow XML tag structure pattern (new-project.md gold standard)
provides:
  - adapt-language.md workflow for cross-language TopStepX bot conversion
  - Inline language profiles (JavaScript/TypeScript, Python) with 11 properties each
  - Mandatory grep-based safety verification gate for SAF-01, SAF-02, SAF-03, SAF-05
  - Profile-extensible design (new language = new profile section, no branching logic)
affects: [07-pinescript-workflow, 09-commands]

# Tech tracking
tech-stack:
  added: []
  patterns: [inline-language-profiles, grep-based-safety-gate, trading-build-order-conversion]

key-files:
  created:
    - topstepx/workflows/adapt-language.md
  modified: []

key-decisions:
  - "Language profiles inline within workflow as structured tables (not separate files)"
  - "Safety verification is mandatory grep-based gate -- workflow blocks on any SAF pattern failure"
  - "Conversion follows trading build order: safety first, auth, rate limiting, REST, WebSocket, strategy last"
  - "SAF-04 (PineScript Repainting) explicitly excluded -- belongs to Phase 7 adapt-pinescript"
  - "Auto-mode requires source path and target language args, skips confirmations but never skips safety"

patterns-established:
  - "Profile-based extensibility: adding a language requires only a new profile section"
  - "6-category source analysis: auth, REST, WebSocket, safety, strategy, config"
  - "Trading build order for code generation: safety -> auth -> rate limiting -> REST -> WebSocket -> strategy"

requirements-completed: [WKF-07]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 6 Plan 1: Language Adaptation Workflow Summary

**Cross-language TopStepX bot conversion workflow with inline language profiles, 8-step process, and mandatory SAF-pattern safety verification gate**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-12T21:02:39Z
- **Completed:** 2026-03-12T21:07:08Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Complete adapt-language.md workflow (654 lines) following gold standard TSX XML tag structure
- Inline language profiles for JavaScript/TypeScript and Python with all 11 properties each
- 8-step process covering setup, source analysis, profile selection, library mapping, report generation, code generation, safety verification, and completion
- Mandatory safety verification gate with grep commands for both JS and Python targets (SAF-01, SAF-02, SAF-03, SAF-05)
- Auto-mode and interactive mode paths defined per step

## Task Commits

Each task was committed atomically:

1. **Task 1: Create adapt-language.md with purpose, auto-mode, language profiles, and Steps 1-4** - `6c97b87` (feat)
2. **Task 2: Add Steps 5-8, output, and success_criteria to complete the workflow** - `414e0fb` (feat)

## Files Created/Modified
- `topstepx/workflows/adapt-language.md` - Complete language adaptation workflow (654 lines)

## Decisions Made
- Language profiles defined as inline structured tables within the workflow, matching the single-file pattern used across TSX
- Safety verification uses grep-based pattern matching (not AST parsing) for portability and simplicity
- SAF-04 (PineScript Repainting) explicitly excluded from safety verification -- it belongs to Phase 7's adapt-pinescript workflow
- Auto-mode requires both source path and target language arguments; skips confirmations but never skips analysis or safety verification
- Conversion order follows mandatory trading build order: safety infrastructure first, strategy logic last

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- adapt-language.md workflow is complete and ready for command binding in Phase 9 (CMD-31: /tsx:adapt-language)
- Language profiles are extensible -- adding C#, Rust, Go, etc. requires only a new profile section
- Workflow references (not duplicates) safety-patterns.md, bot-scaffold-js.md, bot-scaffold-python.md, and language-adaptation.md template

---
*Phase: 06-language-adaptation-workflow*
*Completed: 2026-03-12*
