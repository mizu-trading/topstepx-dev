---
phase: 4
slug: core-execution-workflows
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (static Markdown content, no runtime) |
| **Config file** | none |
| **Quick run command** | `grep -rn "gsd-" topstepx/workflows/ \| wc -l` (should be 0) |
| **Full suite command** | `grep -rn "gsd-\|get-shit-done\|/gsd:" topstepx/workflows/ \| wc -l` (should be 0) |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** `grep -c "gsd-\|get-shit-done" topstepx/workflows/{modified-file}.md` (should be 0)
- **After every plan wave:** `grep -rn "gsd-\|get-shit-done\|/gsd:" topstepx/workflows/ | wc -l` (should be 0)
- **Before `/gsd:verify-work`:** All 34 files exist + zero GSD references remaining + trading injection verified in core 4
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-XX | 01 | 1 | WKF-02 | grep | `grep -c "tsx-researcher\|tsx-phase-researcher" topstepx/workflows/discuss-phase.md` | ❌ W0 | ⬜ pending |
| 04-01-XX | 01 | 1 | WKF-02 | grep | `grep -c "bracket\|SignalR\|position sizing\|risk" topstepx/workflows/discuss-phase.md` | ❌ W0 | ⬜ pending |
| 04-02-XX | 02 | 1 | WKF-03 | grep | `grep -c "tsx-planner\|tsx-plan-checker\|tsx-phase-researcher" topstepx/workflows/plan-phase.md` | ❌ W0 | ⬜ pending |
| 04-02-XX | 02 | 1 | WKF-03 | grep | `grep -c "topstepx/templates" topstepx/workflows/plan-phase.md` | ❌ W0 | ⬜ pending |
| 04-03-XX | 03 | 1 | WKF-04 | grep | `grep -c "tsx-executor" topstepx/workflows/execute-phase.md` | ❌ W0 | ⬜ pending |
| 04-03-XX | 03 | 1 | WKF-04 | grep | `grep -c "topstepx" topstepx/workflows/execute-plan.md` | ❌ W0 | ⬜ pending |
| 04-04-XX | 04 | 2 | WKF-05 | grep | `grep -c "tsx-verifier\|tsx-debugger" topstepx/workflows/verify-work.md` | ❌ W0 | ⬜ pending |
| 04-05-XX | 05 | 2 | WKF-06 | grep | `grep -rn "gsd-\|get-shit-done\|/gsd:" topstepx/workflows/ \| wc -l` | ❌ W0 | ⬜ pending |
| 04-05-XX | 05 | 2 | WKF-06 | ls | `ls topstepx/workflows/*.md \| wc -l` (should be 34) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — verification is grep-based against static Markdown files. No test framework or fixtures needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Trading domain content quality in discuss-phase | WKF-02 | Semantic quality of gray-area examples | Review discuss-phase.md trading examples for relevance |
| Template references in plan-phase | WKF-03 | Path correctness depends on template existence | Verify template paths resolve to actual files |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
