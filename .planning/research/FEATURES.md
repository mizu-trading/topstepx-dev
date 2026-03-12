# Feature Landscape

**Domain:** AI coding skill framework for trading API integration (GSD-style)
**Researched:** 2026-03-11
**Confidence:** MEDIUM-HIGH (based on analysis of GSD framework structure, Claude Code skills ecosystem, trading bot domain patterns, and existing codebase)

## Table Stakes

Features users expect from a GSD-style AI skill framework for trading. Missing any of these means the framework feels incomplete or broken compared to GSD itself.

### Command System

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `/tsx:new-project` command (from-scratch workflow) | GSD's core value prop is guided project creation; TSX must replicate this for trading bots | High | Must orchestrate questioning, research, requirements, roadmap -- all trading-domain-specific |
| `/tsx:help` command | Users need discoverability; GSD has this as standard | Low | List all `/tsx:*` commands with descriptions |
| `/tsx:progress` command | Users need to see where they are in a workflow | Low | Read `.planning/` state and summarize |
| YAML frontmatter on all commands | Every AI platform (Claude Code, OpenCode, Codex, Gemini) parses frontmatter for tool permissions and metadata | Low | Must follow exact GSD patterns -- `allowed-tools`, `description`, `color` fields |
| Commands delegate to workflows (not inline logic) | GSD pattern: commands are thin entry points, workflows contain orchestration logic | Med | Commands reference workflow files via `@` includes |

### Agent Definitions

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Trading-domain executor agent | GSD spawns fresh executor subagents per task; TSX needs one that understands trading concepts | High | Must load TOPSTEPX_API.md as reference before executing; knows about auth flows, WebSocket patterns, order types |
| Trading-domain planner agent | Plans must account for trading-specific dependencies (auth before orders, contracts before positions) | Med | Adapted from `gsd-planner` with trading domain knowledge injected |
| Trading-domain researcher agent | Research phase needs to know what to investigate for trading projects (API capabilities, rate limits, SignalR patterns) | Med | This is the agent role being used right now |
| Verifier agent | GSD's verify-work pattern catches bugs before users see them; critical for trading where bugs = money | Med | Must verify trading-specific correctness (proper error handling, rate limit compliance, reconnection logic) |
| Debugger agent | When trading code fails, diagnosis needs domain knowledge (is it auth expiry? rate limit? market closed?) | Med | Adapted from `gsd-debugger` with TopStepX error code awareness |

### Workflow Orchestration

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| From-scratch workflow (full GSD cycle) | Primary use case: "I want to build a TopStepX trading bot from nothing" | High | Questions -> research -> requirements -> roadmap -> phase execution; all trading-aware |
| Wave-based parallel execution | GSD executes independent tasks in parallel waves; TSX should too | Med | Reuse GSD's execution pattern; trading tasks have natural wave boundaries (auth first, then data + orders in parallel) |
| State management in `.planning/` | GSD externalizes all state to `.planning/` to prevent context rot; TSX must follow this exactly | Low | Use identical `.planning/` structure: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, phase files |
| Atomic commits per task | GSD commits after each task completes; essential for trading code where partial implementations are dangerous | Low | Reuse GSD's commit pattern directly |

### Reference Materials

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| TopStepX API reference (already exists) | Agents need complete API docs to generate correct code | Done | `TOPSTEPX_API.md` and `skills/topstepx-api/references/*.md` already exist |
| Enum reference (already exists) | Order types, statuses, position types -- agents need these to generate correct enum values | Done | `references/enums.md` exists |
| SignalR/WebSocket reference (already exists) | Real-time streaming is the hardest part of trading integrations; agents need detailed patterns | Done | `references/realtime.md` exists |

### Templates

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Trading project spec template | When questioning users about what to build, need structured format for trading requirements (instruments, strategy type, risk params) | Med | Output template for PROJECT.md adapted to trading domain |
| API integration plan template | Standardize how agents plan trading integrations (auth flow, data layer, order management, streaming) | Med | Structured output for phase plans |
| Strategy specification template | Users describing trading strategies need a consistent format (entry/exit rules, position sizing, risk limits) | Med | Captures strategy intent in a way agents can implement |

### Installer Adaptation

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Install commands + agents + workflows + templates + references | GSD installs all these artifact types; TSX must too | High | Current installer only copies `skills/` -- must expand to copy `commands/tsx/`, `agents/`, `get-shit-done/` equivalents |
| Platform-specific frontmatter transformation | GSD transforms YAML frontmatter per platform (Claude Code vs OpenCode vs Codex vs Gemini) | Med | Must replicate GSD's transformation logic for TSX commands |
| Coexistence with GSD (`/tsx:*` alongside `/gsd:*`) | Users will have both installed; commands must not conflict | Low | Prefix all commands with `tsx:` not `gsd:` |
| Global and local install modes | Already supported for skills; must extend to full framework artifacts | Low | Existing installer has `--global` / `--local` -- extend target directories |

## Differentiators

Features that set TSX apart from generic AI skills or other trading tools. Not expected, but highly valued.

### Workflow: Language Adaptation

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `/tsx:adapt-language` command | Convert working TopStepX code from one language to another (e.g., Python to C#, JS to Rust) | High | Unique to TSX; no other skill offers guided cross-language trading code conversion |
| Language-aware agent context | Agent understands SignalR client differences per language (JS: `@microsoft/signalr`, Python: `signalrcore`, C#: native) | Med | Reference material per language's SignalR client library |
| Idiomatic output per language | Generated code follows language conventions (async/await in JS, asyncio in Python, goroutines in Go) | Med | Templates or agent instructions per target language |

### Workflow: PineScript Conversion

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `/tsx:convert-pinescript` command | Turn any TradingView PineScript strategy into a live TopStepX trading bot | High | This is the "killer feature" -- TradingView has millions of PineScript strategies; converting to live trading is a real pain point |
| PineScript reference material (`PINESCRIPT.md`) | Agent needs deep PineScript knowledge to parse strategies correctly | Med | Must cover v6 syntax, `strategy.*` functions, `ta.*` library, bar-by-bar execution model |
| PineScript-to-imperative mapping guide | PineScript is declarative (bar-by-bar); TopStepX is imperative (REST calls). Agent needs a mapping reference. | Med | Document how `strategy.entry()` maps to `/api/Order/place`, how `ta.sma()` maps to computed values from historical bars, etc. |
| Strategy parameter extraction | Automatically identify PineScript `input()` parameters and map them to configurable bot settings | Low | Parse `input.int()`, `input.float()`, `input.string()` from PineScript and generate config |

### Trading Domain Intelligence

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Trading-specific questioning flow | When a user says "build me a trading bot," the framework asks the RIGHT questions (what instruments? what strategy type? risk tolerance? account type?) | Med | Generic GSD asks about project goals; TSX asks about trading-specific requirements |
| Risk parameter templates | Pre-built risk management patterns (max position size, daily loss limit, trailing stop defaults) that agents include by default | Low | Prevents the #1 trading bot mistake: no risk management |
| Rate limit awareness baked into generated code | Agents automatically include rate limiting logic (50 req/30s for bars, 200 req/60s for everything else) | Low | Embedded in agent instructions and code templates |
| Reconnection pattern for SignalR | Auto-include reconnection + resubscription logic in all WebSocket code | Low | This is a common pitfall; making it automatic is a differentiator |
| Contract ID format awareness | Agents understand `CON.F.US.<symbol>.<expiry>` format and can help users find the right contract | Low | Prevent the "wrong contract ID" class of bugs |

### Developer Experience

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `/tsx:quick` command for ad-hoc trading tasks | Quick mode for small tasks: "add a trailing stop to my existing bot" without full project creation | Med | Adapted from GSD's `/gsd:quick` -- same concept but trading-domain-aware |
| Guided TopStepX account setup | Walk users through getting API keys, understanding sim vs live, account permissions | Low | Reduces time-to-first-trade; many users struggle with initial TopStepX setup |
| Example strategy library (reference, not executable) | Markdown descriptions of common strategies (momentum, mean reversion, breakout) with TopStepX implementation notes | Med | Gives agents concrete examples to reference when building user strategies |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Runtime trading execution engine | TSX teaches AI agents to BUILD trading code, it does not trade itself. Including any runtime creates liability, security concerns, and scope explosion. | Provide templates and patterns that agents use to generate standalone trading code. The generated code runs independently of TSX. |
| Bundled API keys or credentials | Never ship API keys, even for demo purposes. Users will forget to replace them. | Provide clear credential setup instructions. Generated code reads from environment variables or config files. |
| Backtesting engine | Building a backtester is a separate product. TopStepX provides sim accounts for testing. | Guide agents to use TopStepX's sim environment and historical bar API for validation. |
| Proprietary trading strategy logic | TSX provides structure, not alpha. Shipping "winning strategies" creates false expectations and liability. | Provide strategy TEMPLATES (structure without specific parameters) and let users define their own logic. |
| UI/dashboard components | TSX is CLI-installed static content consumed by AI agents. Adding web UI is scope creep. | If users need dashboards, agents can generate standalone web apps using the API. |
| Multi-broker abstraction layer | Abstracting across brokers (TopStepX + Interactive Brokers + Alpaca) sounds useful but massively increases complexity and testing surface. | TSX is specifically for TopStepX. Keep it focused. Other brokers can be separate skills. |
| Automatic code deployment | Do not auto-deploy trading bots to servers. Deployment of financial code must be a deliberate human action. | Provide deployment GUIDANCE (Dockerfiles, systemd units, PM2 configs) as templates, not automation. |
| Real-time market data processing in the framework | The framework is static Markdown content. Do not add any code that connects to TopStepX at install time or runtime. | All market data handling exists only in the code that agents GENERATE, not in TSX itself. |

## Feature Dependencies

```
Installer Adaptation
  |-> Commands (must be installable before they can be used)
  |-> Agents (must be installable)
  |-> Workflows (must be installable)
  |-> Templates (must be installable)
  |-> References (already installable, extend)

Commands (entry points)
  |-> Workflows (commands delegate to workflows)
       |-> Agents (workflows spawn agents)
            |-> References (agents load references before working)
            |-> Templates (agents use templates for output structure)

/tsx:new-project (from-scratch)
  |-> Trading questioning flow (needs strategy spec template)
  |-> Trading researcher agent (needs API + domain references)
  |-> Trading planner agent (needs API references)
  |-> Trading executor agent (needs all references)
  |-> Trading verifier agent (needs API references)

/tsx:adapt-language
  |-> Language-aware agent context (needs per-language SignalR reference)
  |-> Executor agent (needs API references + language-specific patterns)

/tsx:convert-pinescript
  |-> PineScript reference material (PINESCRIPT.md must exist first)
  |-> PineScript-to-imperative mapping guide (must exist first)
  |-> Executor agent (needs both PineScript + API references)
  |-> Strategy parameter extraction (needs PineScript reference)
```

## MVP Recommendation

For MVP (first usable release of the GSD-style framework), prioritize:

1. **Installer adaptation** -- without this, nothing else is deliverable to users
2. **Command system with YAML frontmatter** -- `/tsx:new-project`, `/tsx:help`, `/tsx:progress` minimum
3. **Core agents** -- executor, planner, verifier (trading-domain adapted from GSD)
4. **From-scratch workflow** -- the primary use case, end to end
5. **Templates** -- strategy spec, API integration plan
6. **Trading-specific questioning flow** -- the first differentiator users experience

Defer to post-MVP:
- **Language adaptation workflow** -- valuable but secondary to the primary from-scratch flow
- **PineScript conversion workflow** -- highest complexity, requires PINESCRIPT.md reference material creation, and is the most novel (highest risk)
- **Example strategy library** -- nice to have, not blocking
- **`/tsx:quick` command** -- useful but not critical for initial release

## Phase Ordering Rationale

The dependency graph strongly suggests this build order:

1. **Phase 1: Framework skeleton + installer** -- commands, agents, workflows directories; installer copies them; coexistence with GSD verified
2. **Phase 2: Core agents + references** -- trading-adapted agents that load existing API references
3. **Phase 3: From-scratch workflow** -- the complete questioning -> research -> plan -> execute -> verify cycle
4. **Phase 4: Templates + trading intelligence** -- strategy specs, risk parameters, rate limit awareness
5. **Phase 5: Language adaptation workflow** -- cross-language conversion capability
6. **Phase 6: PineScript conversion workflow** -- the killer differentiator, built last because it has the most dependencies

## Sources

- GSD framework structure: [GitHub - gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) (HIGH confidence)
- GSD architecture details: [DeepWiki - gsd-build/get-shit-done](https://deepwiki.com/gsd-build/get-shit-done) (HIGH confidence)
- Claude Code skills system: [Claude Code Docs - Skills](https://code.claude.com/docs/en/skills) (HIGH confidence)
- Claude Code agent teams: [Claude Code Agent Teams Guide](https://claudefa.st/blog/guide/agents/agent-teams) (MEDIUM confidence)
- Trading bot framework patterns: [Algorithm-Trading-Bot](https://github.com/TheFinanceDev/Algorithm-Trading-Bot), [3commas risk management guide](https://3commas.io/blog/ai-trading-bot-risk-management-guide) (MEDIUM confidence)
- PineScript conversion landscape: [Pineify Blog](https://pineify.app/resources/blog/unlocking-the-power-of-pine-script-trading-bots), [OctoBot PineScript guide](https://www.octobot.cloud/en/guides/octobot-interfaces/tradingview/automating-trading-from-a-pine-script-strategy) (MEDIUM confidence)
- Skills marketplace ecosystem: [SkillsMP](https://skillsmp.com), [SkillHub](https://www.skillhub.club) (LOW confidence - marketplace details unverified)
- Existing codebase analysis: `.planning/codebase/` files, `PROJECT.md` (HIGH confidence - direct observation)
