---
phase: 5
slug: from-scratch-workflow
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation (Markdown content adaptation) |
| **Config file** | none |
| **Quick run command** | `grep -c "trading\|strategy\|PineScript\|risk\|instrument\|bracket" topstepx/workflows/new-project.md` |
| **Full suite command** | See Full Verification Commands below |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command (should return 30+)
- **After every plan wave:** Run full grep verification suite
- **Before `/tsx:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | WKF-01a | smoke | `grep -c "instrument\|strategy type\|execution model\|risk tolerance\|account type" topstepx/workflows/new-project.md` | Wave 0 | ⬜ pending |
| 05-01-02 | 01 | 1 | WKF-01b | smoke | `grep -c "strategy-spec\|risk-parameters" topstepx/workflows/new-project.md` | Wave 0 | ⬜ pending |
| 05-01-03 | 01 | 1 | WKF-01c | smoke | `grep -c "position sizing\|max loss\|max contracts\|daily limits\|kill switch\|bracket" topstepx/workflows/new-project.md` | Wave 0 | ⬜ pending |
| 05-01-04 | 01 | 1 | WKF-01d | smoke | `grep -c "plan-phase\|discuss-phase" topstepx/workflows/new-project.md` | Already exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — no test framework needed beyond grep verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Trading questions differentiate bot architectures | WKF-01 SC1 | Semantic quality of questions | Review questioning section covers instrument class, strategy type, execution model, risk tolerance, account type |
| Generated .planning/ has trading content | WKF-01 SC2 | Output quality review | Run workflow on test project, verify PROJECT.md/REQUIREMENTS.md contain trading domain content |
| Risk params embedded before code gen | WKF-01 SC3 | Workflow ordering | Verify risk parameters appear in Step 3 (questioning) not Step 7 (requirements) |
| Seamless routing to plan-phase | WKF-01 SC4 | End-to-end flow | Complete workflow and verify it routes to discuss-phase/plan-phase for Phase 1 |

---

## Full Verification Commands

```bash
# 1. Trading questioning content present
grep -c "instrument\|strategy type\|execution model\|risk tolerance\|account type" topstepx/workflows/new-project.md
# Expected: 10+

# 2. Strategy-spec and risk-parameters generation
grep -c "strategy-spec\|risk-parameters" topstepx/workflows/new-project.md
# Expected: 5+

# 3. Risk parameters mentioned as non-optional
grep -c "position sizing\|max loss\|max contracts\|daily limit\|kill switch\|bracket order" topstepx/workflows/new-project.md
# Expected: 5+

# 4. Trading requirement categories
grep -c "API-\|STR-\|RSK-\|RTD-\|SAF-\|BOT-" topstepx/workflows/new-project.md
# Expected: 5+

# 5. questioning.md reference
grep -c "questioning.md" topstepx/workflows/new-project.md
# Expected: 2+

# 6. safety-patterns.md reference
grep -c "safety-patterns" topstepx/workflows/new-project.md
# Expected: 1+

# 7. Plan-phase routing still works
grep -c "tsx:discuss-phase\|/tsx:plan-phase" topstepx/workflows/new-project.md
# Expected: 3+

# 8. Zero GSD references remain
grep -c "gsd-\|get-shit-done\|\\gsd:" topstepx/workflows/new-project.md
# Expected: 0

# 9. Auto-mode still supported
grep -c "\-\-auto" topstepx/workflows/new-project.md
# Expected: 5+
```

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
