# TSX — TopStepX AI Skill Framework

## What This Is

TSX is a GSD-style AI skill framework that teaches AI coding assistants how to build trading integrations with the TopStepX (ProjectX Gateway) API. It provides structured workflows — commands, agents, templates, and references — that guide AI agents through building trading bots from scratch, adapting existing code between languages, and converting TradingView PineScript strategies into live TopStepX trading bots. Published on npm, installs alongside GSD to any AI coding platform (Claude Code, OpenCode, Codex CLI, Gemini CLI).

## Core Value

AI agents can take any trading idea — whether from scratch, existing code, or a PineScript strategy — and produce a working, live-tradeable TopStepX integration by following TSX's guided workflows.

## Requirements

### Validated

- ✓ Multi-platform installer (Claude Code, OpenCode, Codex CLI, Gemini CLI) — existing
- ✓ TopStepX API reference documentation (REST + WebSocket + enums) — existing
- ✓ npm package distribution with zero dependencies — existing
- ✓ Interactive and non-interactive CLI modes — existing
- ✓ Complete trading domain reference materials with safety patterns — Phase 1
- ✓ Reference materials (TOPSTEPX_API.md, PINESCRIPT.md) loaded by agents before building — Phase 1
- ✓ Agent definitions adapted from GSD for trading domain (executor, planner, researcher, verifier, debugger) — Phase 3
- ✓ Workflow templates specialized for trading artifacts (strategy specs, risk parameters, backtest reports, API integration plans) — Phase 2
- ✓ "From scratch" workflow — full questioning → research → plan → execute → verify cycle for new TopStepX integrations — Phase 5
- ✓ Each workflow feels native to GSD — same patterns, same quality gates, same state management — Phase 4

### Active

- [ ] GSD-style command system (`/tsx:*` commands) that lives alongside `/gsd:*`
- [ ] "Language adaptation" workflow — convert existing TopStepX code from any language to any other
- [ ] "PineScript conversion" workflow — turn TradingView PineScript strategies into live TopStepX trading bots
- [ ] Installer adapted to copy commands, agents, workflows, templates, and references (matching GSD's install pattern)
- [ ] README, package.json, and all branding updated from simple skill to full framework
- [ ] GSD credited in README, package.json, and LICENSE

### Out of Scope

- Runtime trading execution — TSX teaches AI agents to build, it doesn't trade itself
- Backtesting engine — agents build code that uses TopStepX's own capabilities
- UI/dashboard components — TSX is CLI-installed static content, not a web app
- Proprietary strategy logic — TSX provides structure, not trading alpha
- GSD core modification — TSX extends GSD, doesn't fork or replace it

## Context

**Prior work:** The repo already has a working npm-published skill (`topstepx-skill@1.0.0`) with a multi-platform installer and complete API reference docs split into `rest-api.md`, `realtime.md`, and `enums.md`. The codebase has been mapped (`.planning/codebase/`).

**GSD codebase:** Cloned from https://github.com/gsd-build/get-shit-done. GSD provides the full framework pattern: commands (YAML frontmatter + workflow references), agents (role + execution flow), workflows (step-by-step orchestration), templates (output standards), references (domain knowledge), and a Node.js installer. TSX will adapt this code directly.

**TopStepX API:** REST API at `api.topstepx.com` + SignalR WebSocket hubs at `rtc.topstepx.com`. Covers authentication (JWT), accounts, contracts, orders (market/limit/stop/trailing with brackets), positions, trades, and real-time streaming (quotes, depth, user events). All POST endpoints, JSON payloads.

**PineScript:** TradingView's domain-specific language for trading strategies. Version 6 current. Key concepts: bar-by-bar execution, `strategy.*` functions for entries/exits/position management, `ta.*` for technical analysis, time series model. The conversion workflow must map PineScript's declarative strategy logic to TopStepX's imperative REST/WebSocket API calls.

**Phase 1 complete:** All reference materials built — TOPSTEPX_API.md (1114 lines), PINESCRIPT.md (526 lines), safety-patterns.md (481 lines), checkpoints.md (901 lines), verification-patterns.md (774 lines), plus 7 adapted GSD references with tsx naming. Verified 5/5 must-haves, 9/9 requirements.

**Existing concerns:** No test suite (0% coverage), no .gitignore, no input validation on installer flags, Node.js 16 floor should be 18+.

## Constraints

- **Tech stack**: JavaScript (CommonJS), Node.js >= 18, zero runtime dependencies — matching existing pattern
- **Distribution**: npm package, `npx topstepx-skill` entry point preserved
- **Compatibility**: Must coexist with GSD (`/tsx:*` alongside `/gsd:*`, no conflicts)
- **Platform support**: Claude Code, OpenCode, Codex CLI, Gemini CLI — same 4 platforms
- **Content only**: Static files (Markdown + JSON + JS installer) — no runtime services, no API keys bundled
- **Credits**: GSD project must be visibly credited (README attribution, LICENSE preservation)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use GSD's actual code as base, not rewrite | Proven patterns, maintained framework, reduces development time | — Pending |
| TSX commands use `tsx:` prefix | Coexists with `gsd:` commands without conflict | — Pending |
| Three distinct workflows (scratch, language, pinescript) | Each addresses a real user journey into TopStepX development | — Pending |
| Agents load TOPSTEPX_API.md + PINESCRIPT.md as references | Domain knowledge must be available before any code generation | — Pending |
| Keep zero-dependency constraint | Matches existing pattern, simplifies installation | — Pending |
| Adapt GSD installer pattern (commands + agents + workflows + templates) | Full framework distribution, not just reference docs | — Pending |

---
*Last updated: 2026-03-12 after Phase 5*
