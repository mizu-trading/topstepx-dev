---
phase: 2
slug: templates-and-state-tooling
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test infrastructure (0% coverage per PROJECT.md) |
| **Config file** | None |
| **Quick run command** | `node topstepx/bin/tsx-tools.cjs --help 2>&1; echo $?` (smoke test) |
| **Full suite command** | N/A — use file existence checks and grep-based verification |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Verify created files exist and pass naming check
- **After every plan wave:** Full grep verification for zero gsd-* naming leaks
- **Before `/gsd:verify-work`:** All 43 template files present + tsx-tools.cjs smoke test passes
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | TPL-01 | smoke | `grep -r "gsd-" topstepx/templates/ \| wc -l` (expect 0) | N/A | ⬜ pending |
| 2-02-01 | 02 | 1 | TPL-02 | smoke | `test -f topstepx/templates/strategy-spec.md` | N/A - W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | TPL-03 | smoke | `test -f topstepx/templates/api-integration-plan.md` | N/A - W0 | ⬜ pending |
| 2-02-03 | 02 | 1 | TPL-04 | smoke | `test -f topstepx/templates/risk-parameters.md` | N/A - W0 | ⬜ pending |
| 2-02-04 | 02 | 1 | TPL-05 | smoke | `test -f topstepx/templates/bot-scaffold-js.md && test -f topstepx/templates/bot-scaffold-python.md` | N/A - W0 | ⬜ pending |
| 2-02-05 | 02 | 1 | TPL-06 | smoke | `test -f topstepx/templates/pinescript-conversion.md` | N/A - W0 | ⬜ pending |
| 2-02-06 | 02 | 1 | TPL-07 | smoke | `test -f topstepx/templates/language-adaptation.md` | N/A - W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | INF-01 | smoke | `node topstepx/bin/tsx-tools.cjs state load 2>&1` | N/A - W0 | ⬜ pending |
| 2-SAF | 02 | 1 | SAF-embed | smoke | `grep -c "OrderSide" topstepx/templates/bot-scaffold-js.md` (expect >0) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `topstepx/templates/` directory — needs creation
- [ ] `topstepx/bin/` directory — needs creation
- [ ] `topstepx/bin/lib/` directory — needs creation
- [ ] No formal test framework — use file existence checks and grep-based verification

*Test infrastructure is out of scope for v1 per REQUIREMENTS.md v2 deferral.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Templates produce well-formed output when used by agents | TPL-01..07 | Requires agent execution | Use template in a test project, verify output structure |
| tsx-tools.cjs state operations match gsd-tools.cjs behavior | INF-01 | Requires comparative testing | Run same commands against both tools, compare JSON output |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
