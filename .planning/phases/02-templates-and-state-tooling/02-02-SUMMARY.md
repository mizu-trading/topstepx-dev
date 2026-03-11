---
phase: 02-templates-and-state-tooling
plan: 02
subsystem: templates
tags: [templates, safety-patterns, trading-bot, scaffold, pinescript, strategy-spec]

# Dependency graph
requires:
  - phase: 01-references-and-content
    provides: safety-patterns.md (SAF-01 through SAF-05), questioning.md, TOPSTEPX_API.md, PINESCRIPT.md
provides:
  - 12 adapted subdirectory templates (codebase/ + research-project/) with tsx naming
  - 7 trading-specific templates (strategy-spec, api-integration-plan, risk-parameters, bot-scaffold-js, bot-scaffold-python, pinescript-conversion, language-adaptation)
  - Bot scaffold templates with embedded SAF-01 through SAF-05 safety patterns
affects: [03-agent-definitions, 05-new-project-workflow, 06-convert-pinescript-workflow, 07-adapt-bot-workflow, 08-explore-codebase-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns: [bot-scaffold-with-embedded-safety, template-guidelines-example-structure]

key-files:
  created:
    - topstepx/templates/codebase/architecture.md
    - topstepx/templates/codebase/concerns.md
    - topstepx/templates/codebase/conventions.md
    - topstepx/templates/codebase/integrations.md
    - topstepx/templates/codebase/stack.md
    - topstepx/templates/codebase/structure.md
    - topstepx/templates/codebase/testing.md
    - topstepx/templates/research-project/ARCHITECTURE.md
    - topstepx/templates/research-project/FEATURES.md
    - topstepx/templates/research-project/PITFALLS.md
    - topstepx/templates/research-project/STACK.md
    - topstepx/templates/research-project/SUMMARY.md
    - topstepx/templates/strategy-spec.md
    - topstepx/templates/api-integration-plan.md
    - topstepx/templates/risk-parameters.md
    - topstepx/templates/bot-scaffold-js.md
    - topstepx/templates/bot-scaffold-python.md
    - topstepx/templates/pinescript-conversion.md
    - topstepx/templates/language-adaptation.md
  modified: []

key-decisions:
  - "integrations.md is the only subdirectory template with trading-specific example content (TopStepX REST + SignalR WebSocket)"
  - "Bot scaffolds embed all SAF-01 through SAF-05 patterns as non-optional defaults -- agents fill strategy logic only"
  - "Python scaffold uses IntEnum for type safety, aiohttp for REST, pysignalr for WebSocket"
  - "Bar-close execution model is the default in all templates, tick-based requires explicit user opt-in"

patterns-established:
  - "Template structure: title, purpose, <template> block, <guidelines> block, <example> block"
  - "Safety infrastructure in bot scaffolds is marked NON-NEGOTIABLE with clear YOUR STRATEGY LOGIC placeholders"
  - "Risk parameters are mandatory and never left blank -- conservative defaults from safety-patterns.md used"

requirements-completed: [TPL-01, TPL-02, TPL-03, TPL-04, TPL-05, TPL-06, TPL-07]

# Metrics
duration: 14min
completed: 2026-03-11
---

# Phase 2 Plan 2: Trading Templates Summary

**19 template files created: 12 adapted subdirectory templates with tsx naming + 7 trading-specific templates with embedded SAF-01 through SAF-05 safety guardrails**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-11T19:56:48Z
- **Completed:** 2026-03-11T20:11:17Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments
- Adapted all 12 GSD subdirectory templates (7 codebase + 5 research-project) with tsx naming, zero GSD leaks
- integrations.md includes TopStepX REST API + SignalR WebSocket trading integration example
- Created strategy-spec.md with indicators table, entry/exit conditions, and risk parameters sections
- Created api-integration-plan.md with auth, REST endpoints, WebSocket subscriptions, and error handling
- Created risk-parameters.md with position sizing, loss limits, and safety overrides including kill switch
- Created bot-scaffold-js.md with complete near-runnable JS/TS bot including all 5 safety domains
- Created bot-scaffold-python.md with equivalent Python bot scaffold using aiohttp + pysignalr
- Created pinescript-conversion.md with 4-point repainting audit and bar-close policy sections
- Created language-adaptation.md with library mapping and safety preservation verification checklist

## Task Commits

Each task was committed atomically:

1. **Task 1: Adapt 12 subdirectory GSD templates** - `abc1e90` (feat)
2. **Task 2: Create 7 trading-specific templates** - `21d7eeb` (feat)

## Files Created/Modified
- `topstepx/templates/codebase/architecture.md` - Architecture documentation template
- `topstepx/templates/codebase/concerns.md` - Codebase concerns and tech debt template
- `topstepx/templates/codebase/conventions.md` - Coding conventions template
- `topstepx/templates/codebase/integrations.md` - External integrations template (with trading example)
- `topstepx/templates/codebase/stack.md` - Technology stack template
- `topstepx/templates/codebase/structure.md` - File structure template
- `topstepx/templates/codebase/testing.md` - Testing patterns template
- `topstepx/templates/research-project/ARCHITECTURE.md` - Architecture research template
- `topstepx/templates/research-project/FEATURES.md` - Features research template
- `topstepx/templates/research-project/PITFALLS.md` - Pitfalls research template
- `topstepx/templates/research-project/STACK.md` - Stack research template
- `topstepx/templates/research-project/SUMMARY.md` - Research summary template
- `topstepx/templates/strategy-spec.md` - Trading strategy specification (TPL-02)
- `topstepx/templates/api-integration-plan.md` - API integration planning (TPL-03)
- `topstepx/templates/risk-parameters.md` - Risk parameter capture (TPL-04)
- `topstepx/templates/bot-scaffold-js.md` - JS/TS bot scaffold with safety (TPL-05)
- `topstepx/templates/bot-scaffold-python.md` - Python bot scaffold with safety (TPL-05)
- `topstepx/templates/pinescript-conversion.md` - PineScript conversion report (TPL-06)
- `topstepx/templates/language-adaptation.md` - Language adaptation report (TPL-07)

## Decisions Made
- integrations.md is the only subdirectory template with trading-specific example content -- other subdirectory templates are structurally domain-agnostic
- Bot scaffolds implement all SAF-01 through SAF-05 as non-optional code; agents only fill in strategy-marked sections
- Python scaffold uses IntEnum classes (not plain constants) for type safety in enum definitions
- Bar-close execution model is the default throughout all templates; tick-based execution requires explicit user opt-in acknowledgment

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 19 template files ready for use by downstream agents and workflows
- Bot scaffolds provide complete starting point for tsx-executor agents
- Strategy spec template feeds directly from tsx:new-project questioning flow
- PineScript conversion template integrates with tsx:convert-pinescript workflow
- Language adaptation template integrates with tsx:adapt-bot workflow

## Self-Check: PASSED

- All 19 template files verified present on disk
- Both task commits verified in git log (abc1e90, 21d7eeb)

---
*Phase: 02-templates-and-state-tooling*
*Completed: 2026-03-11*
