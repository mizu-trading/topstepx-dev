---
phase: 10
slug: installer-and-distribution
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `assert` + npm pack smoke tests |
| **Config file** | None — Wave 0 creates test harness |
| **Quick run command** | `npm pack --dry-run 2>&1 \| tail -20` |
| **Full suite command** | `npm pack --dry-run && node bin/install.js --claude --global --dry-run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** `npm pack --dry-run` to verify distribution contents
- **After every plan wave:** Full install/uninstall cycle on Claude Code platform
- **Before `/tsx:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | INF-02 | smoke | `npm pack --dry-run 2>&1 \| grep -c "commands/tsx"` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | INF-03 | smoke | `node bin/install.js --help 2>&1 \| grep -c "claude\|opencode\|codex\|gemini"` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | INF-04 | unit | `ls commands/tsx/*.md \| wc -l && ls agents/tsx-*.md \| wc -l` | ✅ | ⬜ pending |
| 10-01-04 | 01 | 1 | INF-05 | smoke | `grep -c "uninstall" bin/install.js` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 1 | INF-06 | unit | `npm pack --dry-run 2>&1 \| grep -c "topstepx/"` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 1 | INF-07 | manual | Visual review of README.md | ❌ W0 | ⬜ pending |
| 10-02-03 | 02 | 1 | INF-08 | manual | Visual review of attribution | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing `bin/install.js` (224 lines) — foundation exists, needs expansion
- [ ] `package.json` — exists, needs `files` array update

*No external test framework needed — npm pack + manual smoke tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| README has framework documentation | INF-07 | Content quality review | Read README.md, verify sections cover installation, usage, commands |
| GSD attribution visible | INF-08 | Visual review | Check README, package.json, LICENSE for attribution text |
| Cross-platform install works | INF-03 | Requires each platform runtime | Install on Claude Code, verify /tsx:help works |
| Uninstall cleans up | INF-05 | Requires installed state | Run uninstall, verify all tsx files removed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
