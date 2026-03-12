# Project Research Summary

**Project:** TopStepX AI Skill Framework (TSX)
**Domain:** GSD-style AI coding skill framework for trading API integration
**Researched:** 2026-03-11
**Confidence:** HIGH

## Executive Summary

TSX is a GSD-style skill framework that teaches AI coding agents (Claude Code, OpenCode, Codex CLI, Gemini CLI) how to build TopStepX trading bots. The architecture is pure static content — Markdown files with YAML frontmatter, a zero-dependency JS installer, and no runtime components. The framework adapts GSD's proven four-layer architecture (Commands → Workflows → Agents → Templates/References) to the trading domain, adding trading-specific agents, templates, and three TSX-specific workflows: `new-project` (from scratch), `adapt-language` (cross-language conversion), and `adapt-pinescript` (TradingView PineScript to live bot). The existing codebase already has the API reference content; what it lacks is the full framework scaffolding around it.

The recommended build approach is bottom-up: passive content first (references, templates, state tooling), then execution agents, then the orchestration workflows, then thin command entry points, and finally the expanded installer. This order is enforced by hard dependencies — workflows cannot be written before the tools and agents they orchestrate, and commands cannot be written before the workflows they delegate to. TypeScript is the primary language recommendation for generated bots; Python is the secondary recommendation. Both ecosystems have solid, actively-maintained SignalR clients (`@microsoft/signalr` and `pysignalr` respectively).

The highest risks are not technical but behavioral. Three pitfalls are critical and must be baked into the framework from the start rather than retrofitted: (1) PineScript repainting producing live bots that diverge from backtests, (2) scope creep from framework-as-teacher into framework-as-runtime, and (3) AI-generated order code with no risk guardrails. All three have known prevention patterns that belong in templates and workflow gates, not as documentation footnotes.

---

## Key Findings

### Recommended Stack

The framework itself is intentionally thin: CommonJS Node.js for the zero-dependency installer, Markdown/YAML for all skill content, and the GSD `agentskills.io` spec for portability across AI platforms. There is no build step, no bundler, and no runtime. This is a strength to preserve — adding dependencies to the installer or converting it to TypeScript would be scope creep.

For the trading bots that TSX generates, the research identifies clear winners per language. JavaScript/TypeScript: `@microsoft/signalr@10.0.0` (official Microsoft client, required for TopStepX's ASP.NET Core SignalR), `trading-signals@7.4.3` (streaming-native, no C compilation), `zod@4.3.6` (runtime API response validation), `dotenv`, and `winston`. Python: `pysignalr` (maintained async successor to abandoned `signalrcore`), `httpx` (async-native), `pandas`+`pandas-ta` (indicators without TA-Lib's C compilation nightmare). C# is the natural third option given TopStepX runs on ASP.NET Core; Go and Rust exist but are low-confidence edge cases.

**Core framework technologies:**
- Markdown + YAML frontmatter: skill content and command definitions — portable across all AI coding platforms
- Node.js CommonJS (>=16.7.0): zero-dependency installer — one `npx topstepx-skill` command, no node_modules
- `@microsoft/signalr@10.0.0`: WebSocket streaming in generated JS/TS bots — only correct client for ASP.NET Core SignalR
- `trading-signals@7.4.3`: technical indicators for generated JS/TS bots — streaming API, no C compilation
- `pysignalr`: SignalR client for generated Python bots — actively maintained async-native replacement for abandoned `signalrcore`

### Expected Features

The dependency graph reveals a strict build order for MVP: installer expansion unblocks everything else, commands unblock nothing (they are written last), and the three specialty workflows each depend on agents and references being complete.

**Must have (table stakes):**
- Expanded installer copying `commands/tsx/`, `agents/`, and `topstepx/` alongside existing `skills/` — nothing else is deliverable without this
- `/tsx:new-project`, `/tsx:help`, `/tsx:progress` commands with YAML frontmatter following GSD's schema exactly
- Five trading-aware agents: `tsx-executor`, `tsx-planner`, `tsx-researcher`, `tsx-verifier`, `tsx-debugger` (adapted from GSD equivalents)
- `tsx-tools.cjs` state management utility (adapted from `gsd-tools.cjs`)
- From-scratch workflow: guided question flow for trading requirements → research → roadmap → phase execution
- Wave-based parallel execution and atomic commits per task (matching GSD's execution model)
- Trading-specific templates: strategy-spec, risk-params, integration-plan
- All order placement templates include mandatory risk parameter validation and bracket orders by default
- Token refresh logic (24-hour JWT expiry) in every generated bot scaffold
- Named enum constants (never bare integers) in all order-placement templates

**Should have (competitive differentiators):**
- PineScript conversion workflow (`/tsx:adapt-pinescript`) — highest-value differentiator; converts TradingView strategies to live bots
- Language adaptation workflow (`/tsx:adapt-language`) — language-agnostic cross-language conversion for any supported language pair
- `PINESCRIPT.md` reference covering v6 syntax, repainting, `barstate.isconfirmed`, `request.security()` lookahead
- Trading-specific questioning flow asking about instruments, strategy type, risk tolerance, account type
- Rate limiter utility included automatically in every generated bot (50 req/30s for history, 200 req/60s for rest)
- SignalR `onreconnected` resubscription pattern mandated in all WebSocket templates
- Contract discovery step (calling `/api/Contract/search` rather than hardcoding IDs)

**Defer (v2+):**
- `/tsx:quick` command for ad-hoc trading tasks
- Example strategy library (momentum, mean reversion, breakout reference implementations)
- Guided TopStepX account setup wizard
- Backtesting pattern support (sim environment guidance)

### Architecture Approach

TSX is a peer framework to GSD — installed alongside it into the same platform directories (`~/.claude/commands/tsx/`, `~/.claude/agents/tsx-*.md`, `~/.claude/topstepx/`) without any namespace collision. The four-layer architecture is the same as GSD: Commands (thin entry points, 20-40 lines, zero logic) → Workflows (orchestration, agent spawning, state gating) → Agents (execution intelligence, fresh context with explicit file loading) → Templates/References (passive content loaded on demand). GSD's execute-phase, plan-phase, and verify-work workflows are copied with minimal adaptation; only the three TSX-specific workflows (new-project, adapt-language, adapt-pinescript) are written from scratch. Reference layering keeps context budgets manageable: SKILL.md (~200 lines always loaded), detailed API refs loaded by agents on demand, PINESCRIPT.md loaded only by the conversion workflow.

**Major components:**
1. `bin/install.js` (expanded) — copies commands/, agents/, topstepx/, skills/ to target platform directories; rewrites `~/.claude/` path prefixes for each platform
2. `commands/tsx/` — thin Markdown entry points with YAML frontmatter; delegate to workflows via `@` references
3. `topstepx/workflows/` — orchestration logic; spawns agents via `Task()`, manages state via tsx-tools.cjs
4. `agents/tsx-*.md` — trading-aware execution agents; load references and templates before working
5. `topstepx/templates/` — output format standards for generated artifacts; include risk guardrails by default
6. `topstepx/references/` — passive domain knowledge (API, enums, realtime, PineScript); loaded on demand
7. `topstepx/bin/tsx-tools.cjs` — CLI utility adapted from gsd-tools.cjs; manages `.planning/` state
8. `skills/topstepx-api/` — preserved unchanged for backward compatibility with users who only want the simple skill

### Critical Pitfalls

1. **PineScript repainting in converted code** — a naive conversion treats `close` as current price without distinguishing confirmed vs. unconfirmed bars, producing live bots that diverge from backtests. Prevention: the conversion workflow must include a signal confirmation decision step; PINESCRIPT.md must document repainting and `barstate.isconfirmed`; templates default to confirmed-bar-only signals.

2. **Scope creep from framework into runtime** — the framework starts generating templates but gradually absorbs runtime concerns (reconnection managers, token refresh loops, position trackers) until it becomes a trading engine with dependencies. Prevention: hard boundary enforced in all workflow constraints — generated code lives in the user's project, never in the TSX framework itself; executable code beyond the installer is a detection signal.

3. **No risk guardrails in generated order code** — AI agents optimize for "does the code work?" and omit position size limits, daily loss checks, and bracket orders. A market order on ES futures is $600K+ notional. Prevention: every order placement template must include risk parameter validation and bracket orders as non-optional defaults; risk configuration happens before order logic in every workflow.

4. **JWT token expiry causing silent bot death** — bots authenticate once with a 24-hour JWT and never refresh; after 24 hours all API calls return 401, open positions go unmanaged, and prop firm risk rules may trigger. Prevention: token lifecycle management is a first-class component in every generated bot scaffold, never an afterthought.

5. **Enum misuse in generated order code** — `OrderSide` 0=Buy, 1=Sell is a single digit difference; AI agents working without the enum reference may transpose values. Prevention: templates always define named constants (`ORDER_SIDE.BUY`, `ORDER_SIDE.SELL`); enum reference loaded before any order code generation.

---

## Implications for Roadmap

Based on combined research, the dependency graph is unambiguous. The build order is bottom-up: passive content must exist before agents can reference it; agents must exist before workflows can spawn them; workflows must exist before commands can delegate to them; all content must exist before the installer can distribute it.

### Phase 1: Foundation — References, Templates, and State Tooling

**Rationale:** These are the only components with no inbound dependencies. References and templates are passive content; tsx-tools.cjs has no dependency on agents or workflows. Everything else in the framework depends on at least one of these three.
**Delivers:** `topstepx/references/` (consolidating existing API docs + new PINESCRIPT.md), `topstepx/templates/` (strategy-spec, risk-params, integration-plan plus adapted GSD templates), `topstepx/bin/tsx-tools.cjs` (state management CLI).
**Addresses:** FEATURES table stakes — reference materials, templates. Also the foundation for risk guardrail templates (Pitfall 3) and enum constant patterns (Pitfall 10).
**Avoids:** Overloading SKILL.md (Pitfall 13 — keep the skill concise, put framework content in topstepx/).
**Research flag:** SKIP — references are direct content migration; tsx-tools.cjs follows established gsd-tools.cjs pattern.

### Phase 2: Trading-Aware Agents

**Rationale:** Agents depend on Phase 1 content (they load references and templates) but have no dependency on workflows or commands. Establishing agents before workflows prevents the anti-pattern of workflows being written without knowing what agents they spawn.
**Delivers:** `agents/tsx-executor.md`, `tsx-planner.md`, `tsx-researcher.md`, `tsx-verifier.md`, `tsx-debugger.md` — all with trading domain knowledge, explicit reference loading, and GSD-compatible frontmatter schema.
**Uses:** `@microsoft/signalr`, `pysignalr`, trading stack from STACK.md (agent instructions reference these per language).
**Implements:** Agents component from ARCHITECTURE.md; enforces Pattern 3 (explicit files_to_read on agent spawn).
**Avoids:** Monolithic agent anti-pattern (separate agents per concern); GSD pattern divergence (Pitfall 8 — clone GSD agent structure, specialize content only).
**Research flag:** SKIP — follows GSD agent patterns directly; trading specialization is content, not architecture.

### Phase 3: GSD-Adapted Core Workflows

**Rationale:** execute-phase, plan-phase, and verify-work are generic orchestration workflows copied and minimally adapted from GSD. They depend on agents (Phase 2) and tools (Phase 1) but are not trading-specific — they form the execution engine that the three TSX-specific workflows reuse.
**Delivers:** `topstepx/workflows/execute-phase.md`, `execute-plan.md`, `plan-phase.md`, `verify-work.md` — functionally equivalent to GSD's versions with `gsd-*` references replaced with `tsx-*`.
**Implements:** Workflow orchestration component; wave-based parallel execution; atomic commits per task.
**Avoids:** Duplicating and diverging from GSD core (Architecture Anti-Pattern 4 — copy with minimal adaptation, not custom rewrites).
**Research flag:** SKIP — these are straightforward GSD adaptations with documented patterns.

### Phase 4: From-Scratch Workflow (`/tsx:new-project`)

**Rationale:** This is the primary use case and the first TSX-specific workflow. It depends on all of Phase 1-3 (references, templates, agents, execution engine). Building this before the specialty workflows ensures the core flow is proven before the more complex conversions are attempted.
**Delivers:** `topstepx/workflows/new-project.md` — full cycle: trading-specific questioning → domain research → PROJECT.md + REQUIREMENTS.md → ROADMAP.md → phase execution routing.
**Addresses:** FEATURES MVP items — from-scratch workflow, trading-specific questioning flow, state management in `.planning/`.
**Avoids:** Missing risk guardrails (Pitfall 3 — risk config step before any order logic); JWT expiry (Pitfall 5 — token lifecycle in scaffold); rate limits baked into generated code.
**Research flag:** NEEDS RESEARCH — the trading questioning flow and strategy spec template require understanding what questions actually differentiate good bot designs. The GSD questioning pattern is generic; TSX needs domain-specific question design.

### Phase 5: Language Adaptation Workflow (`/tsx:adapt-language`)

**Rationale:** Language adaptation is a differentiator and lower complexity than PineScript conversion (no domain translation, just idiomatic re-expression of the same API calls). Building it before PineScript validates the pattern of "source analysis → API mapping → target generation" that PineScript conversion also uses.
**Delivers:** `topstepx/workflows/adapt-language.md` — language-agnostic workflow with language profiles for JS/TS, Python, C#, with a clear extension point for Go/Rust.
**Uses:** All language stacks from STACK.md (JS, Python, C# recommendations and library equivalents).
**Avoids:** Hardcoded language pairs (Pitfall 9 — design as language-agnostic from day one with language profiles, not `if language === "python"` branching).
**Research flag:** SKIP — language profiles pattern is well-established; STACK.md provides the library mappings needed.

### Phase 6: PineScript Conversion Workflow (`/tsx:adapt-pinescript`)

**Rationale:** The highest-complexity, highest-value workflow. Depends on PINESCRIPT.md (Phase 1), all agents (Phase 2), execution engine (Phase 3), and validates design patterns from Phase 5. Building last ensures all dependencies are proven before tackling the most novel capability.
**Delivers:** `topstepx/workflows/adapt-pinescript.md`, `PINESCRIPT.md` reference (v6 syntax, repainting, lookahead), PineScript-to-imperative concept mapping guide.
**Addresses:** FEATURES killer differentiator — converts TradingView strategies to live TopStepX bots.
**Avoids:** Repainting illusion (Pitfall 1 — signal confirmation decision step, confirmed-bar default); lookahead bias (Pitfall 4 — multi-timeframe audit, `[1]` offset default); enum misuse (Pitfall 10 — enum reference loaded before any order code generation).
**Research flag:** NEEDS RESEARCH — PineScript v6 syntax, `request.security()` lookahead behavior, `strategy.*` to REST API mapping, and `ta.*` to `trading-signals` equivalents all need detailed documentation before the conversion agent can be written correctly.

### Phase 7: Commands and Expanded Installer

**Rationale:** Commands are trivial to write once workflows exist (20-40 line thin wrappers). Installer expansion is last because it needs all installable content to exist first. These are the "last mile" that make everything user-accessible.
**Delivers:** `commands/tsx/` (new-project, adapt-language, adapt-pinescript, execute-phase, plan-phase, verify-work, progress, help); expanded `bin/install.js` copying commands/, agents/, topstepx/ in addition to existing skills/.
**Implements:** Command thin delegation pattern; GSD path-replacement installer pattern for platform portability.
**Avoids:** Logic in commands (Architecture Anti-Pattern 1); hardcoded paths (Anti-Pattern 3 — installer rewrites `~/.claude/` prefixes for each target platform).
**Research flag:** SKIP — commands follow GSD pattern exactly; installer expansion follows established gsd install.js logic.

### Phase Ordering Rationale

- References and templates have no dependencies and must exist before anything that loads them — they go first.
- `tsx-tools.cjs` has no framework dependencies and is needed by every workflow — it goes in Phase 1.
- Agents depend only on Phase 1 content; building them in Phase 2 means workflows in Phase 3-6 always have concrete agents to reference.
- Generic execution workflows (Phase 3) come before TSX-specific workflows (Phases 4-6) because the TSX workflows reuse the execution engine.
- Among TSX-specific workflows, `new-project` (Phase 4) proves the core pattern before the specialty conversions.
- `adapt-language` (Phase 5) before `adapt-pinescript` (Phase 6) because it validates the conversion pattern with lower complexity.
- Commands and installer (Phase 7) are last because they depend on all prior content but are trivially fast to write.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (new-project workflow):** Trading-specific question design — what questions distinguish a breakout strategy from a mean reversion strategy, what risk parameter defaults are appropriate for futures vs. equities, how to structure the questioning for users who don't know what they want yet.
- **Phase 6 (PineScript conversion):** Full PineScript v6 syntax mapping — `strategy.*` functions to REST API calls, `ta.*` library to `trading-signals` equivalents, `request.security()` behavior under all lookahead configurations, `alertcondition()` to event-driven architecture mapping. PINESCRIPT.md must be complete and accurate before the agent can be authored.

Phases with standard patterns (skip research-phase):
- **Phase 1 (foundation):** Direct content migration with established patterns from GSD.
- **Phase 2 (agents):** GSD agent adaptation — structure is known, content specialization is straightforward.
- **Phase 3 (core workflows):** Copy-and-minimally-adapt from GSD — no novel design required.
- **Phase 5 (language adaptation):** Library mapping is complete in STACK.md; language profile pattern is standard.
- **Phase 7 (commands + installer):** Commands follow GSD pattern; installer follows established gsd install.js structure.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | `@microsoft/signalr@10.0.0` and `trading-signals@7.4.3` verified via npm. `pysignalr` verified via PyPI. Framework stack (Markdown/Node/YAML) directly observed from codebase. |
| Features | HIGH | GSD framework analyzed directly from source. Feature dependency graph is logic-derived. MVP prioritization matches PROJECT.md constraints. |
| Architecture | HIGH | Derived from direct analysis of GSD source code at `/tmp/get-shit-done`. All patterns are observed, not inferred. |
| Pitfalls | HIGH | Critical pitfalls documented in official sources (TradingView PineScript docs, Microsoft SignalR docs, TopStepX API docs). Scope creep pitfall explicitly identified in PROJECT.md. |

**Overall confidence:** HIGH

### Gaps to Address

- **PineScript concept mapping completeness:** PINESCRIPT.md does not yet exist. The full mapping of `strategy.*`, `ta.*`, `request.security()`, and execution model to TopStepX API equivalents needs to be authored during Phase 1 (references) with care — this document is the foundation that makes Phase 6 possible.
- **Trading questioning flow design:** What questions does `/tsx:new-project` actually ask? The trading domain narrows the question space but doesn't answer it. This needs to be worked out during Phase 4 planning — what instrument class, strategy type, execution model, and risk parameters are the right questions.
- **tsx-tools.cjs state schema:** The exact state/config schema for TSX (what keys does the config JSON use, what does phase indexing look like for trading workflows) needs to be defined before Phase 1 completes. GSD's gsd-tools.cjs is the template but TSX-specific commands and config keys will differ.
- **Platform-specific installer behavior:** GSD's installer is ~2100 lines and handles Claude Code, OpenCode, Codex, Gemini, and VS Code Copilot with different frontmatter transformations. The exact transformation rules for TSX's commands and agents need to be verified against GSD's install.js during Phase 7.

---

## Sources

### Primary (HIGH confidence)
- GSD source code at `/tmp/get-shit-done` (direct analysis) — command/workflow/agent/installer patterns
- `@microsoft/signalr` npm (verified v10.0.0) — JS SignalR client
- `trading-signals` npm (verified v7.4.3) — JS technical indicators
- [TradingView PineScript Repainting Documentation](https://www.tradingview.com/pine-script-docs/concepts/repainting/) — Pitfall 1
- [TradingView PineScript Other Timeframes and Data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/) — Pitfall 4
- [Microsoft SignalR Client Disconnections](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-concept-client-disconnections) — Pitfall 6
- [ASP.NET Core SignalR JS client docs](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client?view=aspnetcore-10.0) — official connection patterns
- TopStepX API documentation — rate limits, enum values, half-turn trades, JWT expiry
- Existing TSX codebase (direct observation) — current state, PROJECT.md requirements

### Secondary (MEDIUM confidence)
- `pysignalr` PyPI — async Python SignalR client
- [agentskills.io specification](https://agentskills.io/specification) — SKILL.md format standard
- GSD DeepWiki analysis — architecture details corroborating source analysis
- TradingView PineScript ecosystem analysis — conversion landscape, user demand signals

### Tertiary (LOW confidence)
- Go SignalR client (`philippseith/signalr`) — community-maintained, less battle-tested
- Rust `signalrs-client` crate — early stage, production use not recommended
- Skills marketplace details (SkillsMP, SkillHub) — ecosystem context, details unverified

---

*Research completed: 2026-03-11*
*Ready for roadmap: yes*
