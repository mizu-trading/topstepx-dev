---
phase: 10-installer-and-distribution
plan: 01
subsystem: infra
tags: [installer, npm, multi-platform, cli, distribution]

# Dependency graph
requires:
  - phase: 08-core-commands
    provides: 32 command files in commands/tsx/
  - phase: 03-agents
    provides: 12 agent files in topstepx/agents/
provides:
  - Full framework installer with per-platform transformations for Claude Code, OpenCode, Gemini CLI, Codex CLI
  - Uninstall support with TSX-only namespace-safe file removal
  - Dry-run mode for install/uninstall preview
affects: [distribution, npm-publish, user-onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns: [per-platform-content-transformation, frontmatter-parsing, path-prefix-rewriting, namespace-safe-uninstall]

key-files:
  created: []
  modified: [bin/install.js]

key-decisions:
  - "Single-file installer (879 lines) matching GSD pragmatic pattern -- no lib/ modules"
  - "CRLF normalization in frontmatter parser for Windows compatibility"
  - "Codex agents as skill directories (SKILL.md format) rather than config.toml merging per research v1 recommendation"

patterns-established:
  - "Platform transformation pipeline: parseFrontmatter -> transformCommand/Agent -> rewritePaths -> write"
  - "Namespace safety: isTsxPath() guard on all uninstall removals"

requirements-completed: [INF-02, INF-03, INF-04, INF-05]

# Metrics
duration: 6min
completed: 2026-03-13
---

# Phase 10 Plan 01: Installer and Distribution Summary

**Full framework installer with 4-platform transformations (Claude MD, OpenCode flat-MD, Gemini TOML, Codex skill-dirs), uninstall support, and dry-run mode in a single 879-line zero-dependency Node.js file**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-13T03:46:18Z
- **Completed:** 2026-03-13T03:53:07Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Expanded bin/install.js from 224-line skills-only installer to 879-line full framework installer
- Per-platform command transformations: nested MD (Claude), flattened MD (OpenCode), TOML (Gemini), skill directories (Codex)
- Per-platform agent transformations: tools array (Claude), tools object (OpenCode), snake_case tools (Gemini), skill format (Codex)
- Path rewriting for all 4 platforms ($HOME/.claude/topstepx/ to platform-specific prefixes)
- Uninstall support with namespace-safe TSX-only file removal
- Dry-run mode for previewing install/uninstall operations
- Tool name mapping tables (Claude->OpenCode, Claude->Gemini)

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand installer with full asset copying and per-platform transformations** - `5158d0f` (feat)
2. **Task 2: Add uninstall support and end-to-end install verification** - `c549862` (fix)

## Files Created/Modified
- `bin/install.js` - Full framework installer with 4-platform transformations, uninstall, dry-run (879 lines)

## Decisions Made
- Single-file installer (879 lines) matching GSD pragmatic pattern -- no lib/ modules needed for TSX's simpler scope
- CRLF normalization added to frontmatter parser for Windows compatibility (source files use CRLF)
- Codex agents installed as skill directories (SKILL.md format) rather than config.toml merging, per research v1 recommendation
- Tool name mappings follow GSD reference implementation (claudeToOpencodeTools, claudeToGeminiTools)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CRLF line ending handling in frontmatter parser**
- **Found during:** Task 2 (end-to-end verification)
- **Issue:** Windows CRLF line endings (`\r\n`) caused regex `$` anchors to fail, producing empty frontmatter for all files
- **Fix:** Added `.replace(/\r\n/g, '\n').replace(/\r/g, '\n')` normalization at start of parseFrontmatter()
- **Files modified:** bin/install.js
- **Verification:** All 4 platform transforms produce correct frontmatter after fix
- **Committed in:** c549862 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed double-quoting of argument-hint in OpenCode transform**
- **Found during:** Task 2 (end-to-end verification)
- **Issue:** argument-hint values already include surrounding quotes from source frontmatter; OpenCode transform added another set
- **Fix:** Removed wrapping quotes from template literal in transformCommandOpenCode
- **Files modified:** bin/install.js
- **Verification:** OpenCode commands show single-quoted argument-hint values
- **Committed in:** c549862 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for correctness on Windows. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Installer is complete and verified for all 4 platforms
- Ready for package.json metadata updates and README rewrite (future plans if applicable)
- GSD coexistence verified by namespace separation (tsx/* vs gsd/*)

## Self-Check: PASSED

- FOUND: bin/install.js
- FOUND: .planning/phases/10-installer-and-distribution/10-01-SUMMARY.md
- FOUND: commit 5158d0f
- FOUND: commit c549862

---
*Phase: 10-installer-and-distribution*
*Completed: 2026-03-13*
