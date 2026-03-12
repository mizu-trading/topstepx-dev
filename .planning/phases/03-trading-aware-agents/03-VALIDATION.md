---
phase: 3
slug: trading-aware-agents
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (grep-based) |
| **Config file** | None — agent files are static Markdown content |
| **Quick run command** | `grep -rl "gsd-\|get-shit-done\|gsd_" topstepx/agents/ \| wc -l` (must be 0) |
| **Full suite command** | `for f in topstepx/agents/tsx-*.md; do echo "=== $f ==="; grep -c "gsd-\|get-shit-done\|gsd_\|C:/Users" "$f"; done` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `grep -rl "gsd-\|get-shit-done" topstepx/agents/ | wc -l` (must be 0)
- **After every plan wave:** Full suite (all 12 files checked for naming, paths, trading content)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | AGT-01 | smoke | `grep -l "trading\|TopStepX\|safety" topstepx/agents/tsx-executor.md` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | AGT-02 | smoke | `grep -l "trading\|TopStepX\|safety" topstepx/agents/tsx-planner.md` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | AGT-03 | smoke | `grep -l "trading\|TopStepX" topstepx/agents/tsx-researcher.md` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | AGT-04 | smoke | `grep -l "trading\|TopStepX\|safety\|enum\|bracket" topstepx/agents/tsx-verifier.md` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | AGT-05 | smoke | `grep -l "trading\|TopStepX\|JWT\|rate.limit\|WebSocket\|SignalR" topstepx/agents/tsx-debugger.md` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | AGT-06 | smoke | `test -f topstepx/agents/tsx-codebase-mapper.md && echo PASS` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | AGT-07 | smoke | `test -f topstepx/agents/tsx-plan-checker.md && echo PASS` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | AGT-08 | smoke | `test -f topstepx/agents/tsx-roadmapper.md && echo PASS` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 1 | AGT-09 | smoke | `test -f topstepx/agents/tsx-phase-researcher.md && echo PASS` | ❌ W0 | ⬜ pending |
| 03-02-05 | 02 | 1 | AGT-10 | smoke | `test -f topstepx/agents/tsx-research-synthesizer.md && echo PASS` | ❌ W0 | ⬜ pending |
| 03-02-06 | 02 | 1 | AGT-11 | smoke | `test -f topstepx/agents/tsx-integration-checker.md && echo PASS` | ❌ W0 | ⬜ pending |
| 03-02-07 | 02 | 1 | AGT-12 | smoke | `test -f topstepx/agents/tsx-nyquist-auditor.md && echo PASS` | ❌ W0 | ⬜ pending |
| 03-XX-XX | XX | 1 | SC-3 | smoke | `diff <(grep -c '<' topstepx/agents/tsx-executor.md) <(grep -c '<' ~/.claude/agents/gsd-executor.md)` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* No test infrastructure needed — agent files are static Markdown content verified by grep commands. The verification commands listed above serve as the test suite.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Frontmatter portable across 4 platforms | SC-4 | Requires understanding platform-specific constraints | Visual inspection: name, description, tools fields present; no platform-breaking fields |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
