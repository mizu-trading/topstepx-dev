---
phase: 06
slug: language-adaptation-workflow
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-12
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (markdown workflow, no executable code) |
| **Config file** | none |
| **Quick run command** | `grep -c "SAF-01\|SAF-02\|SAF-03\|SAF-04\|SAF-05" topstepx/workflows/adapt-language.md` |
| **Full suite command** | Manual review of workflow structure against gold standard pattern |
| **Estimated runtime** | ~5 seconds (grep) |

---

## Sampling Rate

- **After every task commit:** Run quick run command (grep safety patterns)
- **After every plan wave:** Structural review against success criteria
- **Before `/tsx:verify-work`:** Full suite must pass
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | WKF-07-a | manual-only | Verify Step 2 contains source analysis categories | N/A (new file) | pending |
| 06-01-02 | 01 | 1 | WKF-07-b,c,d | manual-only | Verify language profiles, library mapping, safety gate | N/A (new file) | pending |

*Status: pending*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — this phase creates a markdown workflow document, not executable code. Verification is structural review.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Workflow analyzes source code for API patterns | WKF-07-a | Markdown document, not runtime code | Verify Step 2 lists REST, WebSocket, safety, strategy analysis categories |
| Library mapping uses language profiles | WKF-07-b,d | Structural verification | Verify `<language_profiles>` section exists with JS and Python profiles |
| Safety verification gate blocks on failure | WKF-07-c | Markdown document, not runtime code | Verify Step 7 references all SAF-01 through SAF-05 with grep commands |
| Target code preserves trading logic | WKF-07-c | Markdown document | Verify conversion step references bot scaffold templates |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-12
