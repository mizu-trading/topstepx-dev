---
phase: 8
slug: core-commands
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (static Markdown files, no executable code) |
| **Config file** | None — commands are Markdown files |
| **Quick run command** | `ls commands/tsx/*.md \| wc -l` (should equal 12) |
| **Full suite command** | `grep -r "gsd\|get-shit-done" commands/tsx/ --include="*.md"` (should return 0 matches) |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `ls commands/tsx/*.md | wc -l` + `grep -r "gsd\|get-shit-done" commands/tsx/`
- **After every plan wave:** Run full suite — verify all 12 files exist, zero GSD leaks, all workflow references valid
- **Before `/tsx:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | CMD-01 | smoke | `head -5 commands/tsx/new-project.md` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | CMD-02 | smoke | `head -5 commands/tsx/discuss-phase.md` | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | CMD-03 | smoke | `grep "agent: tsx-planner" commands/tsx/plan-phase.md` | ❌ W0 | ⬜ pending |
| 08-01-04 | 01 | 1 | CMD-04 | smoke | `head -5 commands/tsx/execute-phase.md` | ❌ W0 | ⬜ pending |
| 08-01-05 | 01 | 1 | CMD-05 | smoke | `head -5 commands/tsx/verify-work.md` | ❌ W0 | ⬜ pending |
| 08-01-06 | 01 | 1 | CMD-06 | smoke | `head -5 commands/tsx/audit-milestone.md` | ❌ W0 | ⬜ pending |
| 08-01-07 | 01 | 1 | CMD-07 | smoke | `grep "type: prompt" commands/tsx/complete-milestone.md` | ❌ W0 | ⬜ pending |
| 08-01-08 | 01 | 1 | CMD-08 | smoke | `head -5 commands/tsx/new-milestone.md` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 1 | CMD-09 | smoke | `grep "topstepx/workflows/progress.md" commands/tsx/progress.md` | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 1 | CMD-10 | smoke | `grep "topstepx/workflows/resume-project.md" commands/tsx/resume-work.md` | ❌ W0 | ⬜ pending |
| 08-02-03 | 02 | 1 | CMD-11 | smoke | `grep "topstepx/workflows/pause-work.md" commands/tsx/pause-work.md` | ❌ W0 | ⬜ pending |
| 08-02-04 | 02 | 1 | CMD-12 | smoke | `grep -c "allowed-tools" commands/tsx/help.md` (should be 0) | ❌ W0 | ⬜ pending |
| ALL | 01+02 | 1 | ALL | integration | `grep -r "gsd\|get-shit-done" commands/tsx/ --include="*.md"` | ❌ W0 | ⬜ pending |
| ALL | 01+02 | 1 | ALL | integration | `wc -l commands/tsx/*.md` (each under 50 lines) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `commands/tsx/` directory — must be created
- [ ] All 12 command `.md` files — none exist yet

*No test framework needed — these are static Markdown files verified by grep/wc commands.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Commands appear in Claude Code palette | ALL | Requires Claude Code runtime | Invoke `/tsx:help` and verify it shows in command list |
| `type: prompt` behavior on complete-milestone | CMD-07 | Platform-specific behavior | Run `/tsx:complete-milestone` and verify correct execution mode |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
