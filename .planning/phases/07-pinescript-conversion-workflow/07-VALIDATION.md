---
phase: 7
slug: pinescript-conversion-workflow
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (markdown workflow, no executable code) |
| **Config file** | none |
| **Quick run command** | `grep -c "SAF-01\|SAF-02\|SAF-03\|SAF-04\|SAF-05\|repainting\|request.security\|barstate.isconfirmed" topstepx/workflows/adapt-pinescript.md` |
| **Full suite command** | Manual review of workflow structure against gold standard pattern and success criteria |
| **Estimated runtime** | ~5 seconds (grep) / ~10 minutes (manual review) |

---

## Sampling Rate

- **After every task commit:** Visual inspection that workflow follows XML tag structure pattern
- **After every plan wave:** Verify repainting audit step (SAF-04) and safety verification step (SAF-01 through SAF-05) both present
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | WKF-08-a | manual-only | Verify Step 2 contains all 10 source analysis categories | N/A (new file) | ⬜ pending |
| 07-01-02 | 01 | 1 | WKF-08-b | manual-only | `grep -c "strategy.entry\|strategy.exit\|strategy.close\|ta\.\|OrderSide\|OrderType" topstepx/workflows/adapt-pinescript.md` >= 6 | N/A (new file) | ⬜ pending |
| 07-01-03 | 01 | 1 | WKF-08-c | manual-only | `grep -c "barstate.isconfirmed\|confirmed.bar\|signal.confirmation" topstepx/workflows/adapt-pinescript.md` >= 2 | N/A (new file) | ⬜ pending |
| 07-01-04 | 01 | 1 | WKF-08-d | manual-only | `grep -c "request.security\|lookahead\|\[1\].*offset" topstepx/workflows/adapt-pinescript.md` >= 3 | N/A (new file) | ⬜ pending |
| 07-01-05 | 01 | 1 | WKF-08-e | manual-only | Verify Step 10 has grep-based SAF-01 through SAF-05 verification commands for both JS and Python | N/A (new file) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* No test framework setup needed — this phase creates a markdown workflow document, not executable code.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Workflow parses PineScript to extract entry/exit, position mgmt, indicators, risk params | WKF-08-a | Markdown document — structural review of step content | Verify Step 2 contains all 10 source analysis categories from research |
| Maps PineScript concepts to TopStepX API equivalents | WKF-08-b | Mapping tables in markdown, not executable | Verify strategy.entry/exit/close mapped to order placement, ta.* mapped to trading-signals/pandas-ta |
| Signal confirmation decision with repainting flags | WKF-08-c | Decision step logic in markdown | Verify dedicated step for signal confirmation with confirmed-bar default |
| Audits request.security for lookahead bias | WKF-08-d | Audit step logic in markdown | Verify dedicated MTF audit step checking [1] offset and lookahead_on |
| Safety guardrails as non-optional defaults | WKF-08-e | Safety verification grep patterns in markdown | Verify SAF-01 through SAF-05 grep commands present for both JS and Python targets |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
