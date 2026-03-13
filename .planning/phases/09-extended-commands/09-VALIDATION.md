---
phase: 9
slug: extended-commands
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (static Markdown files, no executable code) |
| **Config file** | None — commands are Markdown files |
| **Quick run command** | `ls commands/tsx/*.md \| wc -l` (should equal 32 after Phase 9) |
| **Full suite command** | `grep -r "gsd\|get-shit-done" commands/tsx/ --include="*.md"` (should return 0 matches) |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `grep -rn "gsd\|get-shit-done" commands/tsx/{files-in-task}` (zero matches required)
- **After every plan wave:** Run full suite — verify total file count, zero GSD leaks, all workflow references valid
- **Before `/tsx:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | CMD-13 | smoke | `grep "name: tsx:add-phase" commands/tsx/add-phase.md` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | CMD-14 | smoke | `grep "name: tsx:insert-phase" commands/tsx/insert-phase.md` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | CMD-15 | smoke | `grep "name: tsx:remove-phase" commands/tsx/remove-phase.md` | ❌ W0 | ⬜ pending |
| 09-01-04 | 01 | 1 | CMD-16 | smoke | `grep "name: tsx:list-phase-assumptions" commands/tsx/list-phase-assumptions.md` | ❌ W0 | ⬜ pending |
| 09-01-05 | 01 | 1 | CMD-17 | smoke | `grep "name: tsx:plan-milestone-gaps" commands/tsx/plan-milestone-gaps.md` | ❌ W0 | ⬜ pending |
| 09-01-06 | 01 | 1 | CMD-31 | smoke | `grep "topstepx/workflows/adapt-language.md" commands/tsx/adapt-language.md` | ❌ W0 | ⬜ pending |
| 09-01-07 | 01 | 1 | CMD-32 | smoke | `grep "topstepx/workflows/adapt-pinescript.md" commands/tsx/adapt-pinescript.md` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 1 | CMD-18 | smoke | `grep "tsx-codebase-mapper" commands/tsx/map-codebase.md` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 1 | CMD-19 | smoke | `grep "tsx-planner" commands/tsx/quick.md` | ❌ W0 | ⬜ pending |
| 09-02-03 | 02 | 1 | CMD-21 | smoke | `grep "name: tsx:add-todo" commands/tsx/add-todo.md` | ❌ W0 | ⬜ pending |
| 09-02-04 | 02 | 1 | CMD-22 | smoke | `grep "name: tsx:check-todos" commands/tsx/check-todos.md` | ❌ W0 | ⬜ pending |
| 09-02-05 | 02 | 1 | CMD-23 | smoke | `grep -i "TSX" commands/tsx/settings.md` | ❌ W0 | ⬜ pending |
| 09-02-06 | 02 | 1 | CMD-24 | smoke | `grep -i "TSX" commands/tsx/set-profile.md` | ❌ W0 | ⬜ pending |
| 09-02-07 | 02 | 1 | CMD-25 | smoke | `grep -i "TSX" commands/tsx/update.md` | ❌ W0 | ⬜ pending |
| 09-02-08 | 02 | 1 | CMD-27 | smoke | `grep "name: tsx:validate-phase" commands/tsx/validate-phase.md` | ❌ W0 | ⬜ pending |
| 09-02-09 | 02 | 1 | CMD-28 | smoke | `grep "name: tsx:health" commands/tsx/health.md` | ❌ W0 | ⬜ pending |
| 09-02-10 | 02 | 1 | CMD-29 | smoke | `grep "name: tsx:cleanup" commands/tsx/cleanup.md` | ❌ W0 | ⬜ pending |
| 09-02-11 | 02 | 1 | CMD-30 | smoke | `grep "argument-instructions" commands/tsx/add-tests.md` | ❌ W0 | ⬜ pending |
| 09-03-01 | 03 | 2 | CMD-20 | smoke | `grep "tsx-tools.cjs" commands/tsx/debug.md && grep "tsx-debugger" commands/tsx/debug.md` | ❌ W0 | ⬜ pending |
| 09-03-02 | 03 | 2 | CMD-26 | smoke | `grep "tsx-tools.cjs" commands/tsx/research-phase.md && grep "tsx-phase-researcher" commands/tsx/research-phase.md` | ❌ W0 | ⬜ pending |
| ALL | ALL | 2 | ALL | integration | `ls commands/tsx/*.md \| wc -l` (should equal 32) | ❌ W0 | ⬜ pending |
| ALL | ALL | 2 | ALL | integration | `grep -r "gsd\|get-shit-done" commands/tsx/ --include="*.md"` (0 matches) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] 20 command `.md` files in `commands/tsx/` — none exist yet for Phase 9

*No test framework needed — these are static Markdown files verified by grep/wc commands.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Commands appear in Claude Code palette | ALL | Requires Claude Code runtime | Invoke `/tsx:help` and verify all 32 commands show |
| debug.md checkpoint handling works | CMD-20 | Requires runtime agent spawning | Run `/tsx:debug` with a real bug |
| adapt-pinescript.md workflow delegation | CMD-32 | Requires runtime | Run `/tsx:adapt-pinescript` with a PineScript file |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
