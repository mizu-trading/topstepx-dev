# Technology Stack

**Project:** TopStepX AI Skill Framework (TSX)
**Researched:** 2026-03-11
**Scope:** Stack for the TSX framework itself + stack recommendations TSX agents should suggest to users building trading bots

---

## Part 1: TSX Framework Stack (What TSX Itself Is Built With)

The framework is pure Markdown + a thin JS installer. This is correct and should stay this way.

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Markdown (SKILL.md) | agentskills.io spec | Skill definition, commands, agents, workflows, references, templates | Open standard adopted by Claude Code, Codex CLI, OpenCode, Gemini CLI, VS Code Copilot. Zero runtime dependencies. Maximum portability. | HIGH |
| Node.js (CommonJS) | >=16.7.0 | Installer (`bin/install.js`) | Already established. CommonJS for broadest Node compat. Zero deps is a major strength -- keep it. | HIGH |
| YAML frontmatter | --- blocks | Command/agent metadata | GSD pattern convention. All commands and agents use YAML frontmatter for name, description, allowed-tools, argument-hint. | HIGH |

### What NOT to Change in the Framework

| Decision | Rationale |
|----------|-----------|
| Do NOT add runtime dependencies to package.json | Zero-dep installer is a feature. Users run `npx topstepx-skill` and it copies files. No node_modules, no build step. |
| Do NOT convert to TypeScript | The installer is 225 lines of straightforward CommonJS. TypeScript adds a build step for no benefit here. |
| Do NOT add a bundler | There is nothing to bundle. The skill files are Markdown, the installer is a single JS file. |
| Do NOT use a framework for the installer | readline + fs + path is all that is needed. Adding inquirer/commander/yargs would break the zero-dep principle. |

### GSD Pattern Structure (Adapted from get-shit-done)

The TSX framework adapts the GSD directory layout. Based on analysis of the GSD repo structure:

| Directory | Purpose | TSX Adaptation |
|-----------|---------|----------------|
| `commands/tsx/` | Slash commands (`/tsx:build-bot`, `/tsx:convert-pinescript`, etc.) | Same pattern as `commands/gsd/` -- each command is a `.md` file with YAML frontmatter |
| `agents/` | Specialized subagents for context-heavy tasks | Trading-specific agents (e.g., `tsx-strategy-researcher.md`, `tsx-bot-builder.md`) |
| `get-shit-done/workflows/` | Multi-step workflow definitions | `tsx/workflows/` -- build-bot workflow, adapt-code workflow, convert-pinescript workflow |
| `get-shit-done/templates/` | File templates for generated outputs | `tsx/templates/` -- bot project scaffolds, strategy templates, config templates |
| `get-shit-done/references/` | Reference docs loaded by workflows | `tsx/references/` -- API reference (already exists), language-specific patterns, SignalR guides |

### Installer Enhancements Needed

The current installer copies `skills/topstepx-api/` to platform-specific skill directories. It will need to also copy:

| New Content | Destination Pattern | Notes |
|-------------|---------------------|-------|
| `commands/tsx/` | `~/.claude/commands/tsx/` (Claude), `~/.config/opencode/commands/tsx/` (OpenCode), etc. | GSD uses `commands/gsd/` -- TSX uses `commands/tsx/` |
| `agents/` | `~/.claude/agents/` (Claude), etc. | Agent markdown files |
| `tsx/` (workflows, templates, references) | Platform-specific location | The inner framework files |

**Confidence: HIGH** -- Directly observed from GSD repo structure analysis.

---

## Part 2: Recommended Stack for Trading Bots Built by TSX Agents

These are the libraries and tools that TSX agents should recommend to users when building TopStepX trading bots. Organized by language since TSX is language-agnostic.

### JavaScript/TypeScript (Primary Recommendation)

TSX agents should default to TypeScript for new bot projects unless the user specifies otherwise. Rationale: The TopStepX API examples are in JavaScript, SignalR has first-class JS/TS support, and the ecosystem is mature.

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| `@microsoft/signalr` | 10.0.0 | WebSocket real-time data (User Hub + Market Hub) | Official Microsoft library. Required for TopStepX real-time streaming. Supports WebSocket transport, auto-reconnect, JWT auth. | HIGH (verified via npm) |
| `trading-signals` | 7.4.3 | Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, etc.) | Pure TypeScript, zero native deps, streaming API (add data point by point), 100+ indicators. No C compilation issues unlike ta-lib. | HIGH (verified via npm) |
| `dotenv` | 17.3.1 | Environment variable management | Store API keys and credentials safely. Universal standard. | HIGH (verified via npm) |
| `zod` | 4.3.6 | Runtime validation of API responses | TopStepX responses have `success`/`errorCode`/`errorMessage` pattern. Zod validates response shapes at runtime, catching API changes early. | HIGH (verified via npm) |
| `winston` | 3.19.0 | Structured logging | Trading bots need audit trails. Winston provides log levels, file transport, JSON formatting. | MEDIUM (verified via npm) |
| `typescript` | latest | Type safety | Trading bots handle money. Type errors become financial errors. TypeScript catches them at compile time. | HIGH |

**What NOT to use (JavaScript):**

| Library | Why Not | Use Instead |
|---------|---------|-------------|
| `@aspnet/signalr` | Deprecated. Replaced by `@microsoft/signalr`. Old package, no updates since 2019. | `@microsoft/signalr` |
| `node-signalr` | Third-party, unmaintained, targets old SignalR (not ASP.NET Core SignalR). TopStepX uses ASP.NET Core SignalR. | `@microsoft/signalr` |
| `technicalindicators` (3.1.0) | Last meaningful update was years ago. API is batch-oriented, harder for streaming use. | `trading-signals` |
| `ta-lib` / `node-talib` | Requires C compilation (TA-Lib C library). Breaks on many systems, especially Windows. Installation nightmare for bot builders. | `trading-signals` |
| `axios` for REST calls | TopStepX API is simple POST-only. Native `fetch` (available in Node 18+) eliminates a dependency. | Built-in `fetch` |

### Python (Secondary Recommendation)

Python is the dominant language for quantitative trading. TSX agents should recommend this stack when users prefer Python.

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| `pysignalr` | 1.3.x | SignalR WebSocket client | Modern, async-native (asyncio), actively maintained. Replaced deprecated `aiosignalrcore`. Supports ASP.NET Core SignalR which TopStepX uses. | MEDIUM (verified via PyPI search) |
| `httpx` | latest | Async HTTP client for REST API | Async-native, supports HTTP/2, better than `requests` for async bots. `requests` is synchronous and blocks the event loop. | MEDIUM |
| `pandas` | latest | Time series data handling | Standard for OHLCV bar data manipulation. Every quant knows it. | HIGH |
| `pandas-ta` | latest | Technical indicators | Pure Python, 130+ indicators, integrates directly with pandas DataFrames. Easier to install than TA-Lib. | MEDIUM |
| `python-dotenv` | latest | Environment variables | Same pattern as JS dotenv. | HIGH |
| `pydantic` | latest | Response validation | Python equivalent of Zod. Validates TopStepX API response shapes. | HIGH |

**What NOT to use (Python):**

| Library | Why Not | Use Instead |
|---------|---------|-------------|
| `signalrcore` | Abandoned by original maintainer. `pysignalr` is the maintained successor. | `pysignalr` |
| `requests` | Synchronous. Trading bots need async I/O for concurrent REST + WebSocket. | `httpx` |
| `TA-Lib` (C library) | Requires compiling C library. Notorious installation issues on Windows and macOS. | `pandas-ta` |

### C# (Tertiary Recommendation)

C# is natural for TopStepX since the server is ASP.NET Core. TSX agents should recommend this when users prefer .NET.

| Library | Purpose | Why | Confidence |
|---------|---------|-----|------------|
| `Microsoft.AspNetCore.SignalR.Client` | SignalR WebSocket client | First-party Microsoft package. Best possible SignalR support since TopStepX server is ASP.NET Core. | HIGH |
| `System.Net.Http.Json` | REST API calls | Built into .NET. No external HTTP dependency needed. | HIGH |
| `Skender.Stock.Indicators` | Technical indicators | Well-maintained .NET library with 150+ indicators. NuGet package. | MEDIUM |

### Go and Rust (Edge Cases)

TSX agents should note these are less common for trading bots but viable.

| Language | SignalR Client | Notes | Confidence |
|----------|---------------|-------|------------|
| Go | `github.com/philippseith/signalr` | Community-maintained. Supports WebSocket transport. Less battle-tested than JS/Python/C# clients. | LOW |
| Rust | `signalrs-client` crate | Early stage. Client implementation exists but server is still WIP. Production use is risky. | LOW |

---

## Part 3: Project Scaffolding Recommendations

When TSX agents scaffold a new trading bot project, they should generate this structure:

### TypeScript Bot Template

```
my-trading-bot/
  src/
    index.ts              # Entry point
    auth.ts               # TopStepX JWT auth + token refresh
    api/
      rest-client.ts      # REST API wrapper (typed)
      user-hub.ts         # SignalR User Hub connection
      market-hub.ts       # SignalR Market Hub connection
    strategy/
      base-strategy.ts    # Strategy interface
      my-strategy.ts      # User's strategy implementation
    utils/
      logger.ts           # Winston logger setup
      rate-limiter.ts     # Rate limit handling (50/30s for bars, 200/60s for rest)
  .env.example            # Template for API credentials
  tsconfig.json
  package.json
```

### Python Bot Template

```
my-trading-bot/
  src/
    __init__.py
    main.py               # Entry point (asyncio)
    auth.py               # TopStepX JWT auth + token refresh
    api/
      rest_client.py      # REST API wrapper (typed with pydantic)
      user_hub.py         # SignalR User Hub connection
      market_hub.py       # SignalR Market Hub connection
    strategy/
      base_strategy.py    # Strategy ABC
      my_strategy.py      # User's strategy implementation
    utils/
      logger.py           # Logging setup
      rate_limiter.py     # Rate limit handling
  .env.example
  requirements.txt
  pyproject.toml
```

---

## Part 4: Key Technical Decisions for TSX Agent Guidance

### SignalR Connection Pattern (Critical)

TopStepX requires a specific SignalR configuration. TSX agents MUST guide users to:

1. **Use WebSocket-only transport** (`skipNegotiation: true`, `transport: WebSockets`)
2. **Pass JWT via query parameter AND accessTokenFactory** (both are needed)
3. **Enable auto-reconnect** with re-subscription on reconnect
4. **Set timeout** (10000ms recommended)

This is already documented in the API reference but is the #1 source of integration failures.

### Rate Limiting Strategy

| Endpoint | Limit | Recommended Approach |
|----------|-------|---------------------|
| `/api/History/retrieveBars` | 50 req / 30 sec | Token bucket with 30-second window. Cache historical data aggressively. |
| All other endpoints | 200 req / 60 sec | Token bucket with 60-second window. Generous enough for most bots. |

TSX agents should generate rate limiter code in every bot scaffold. This is not optional.

### Token Refresh Pattern

JWT tokens expire after 24 hours. TSX agents should guide users to:

1. Store token + expiry timestamp
2. Check expiry before each API call (with 5-minute buffer)
3. Call `/api/Auth/validate` to refresh
4. Update stored token atomically (avoid race conditions in async code)

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| JS SignalR | `@microsoft/signalr` | `socket.io-client` | TopStepX uses ASP.NET Core SignalR, not Socket.IO. Different protocols. |
| JS Indicators | `trading-signals` | `technicalindicators` | Less maintained, batch API less suited to streaming |
| Python SignalR | `pysignalr` | `signalrcore` | Abandoned. pysignalr is its maintained async successor. |
| Python HTTP | `httpx` | `aiohttp` | httpx has cleaner API, better typing, HTTP/2 support |
| Validation (JS) | `zod` | `joi` | Zod has better TypeScript inference, smaller bundle, more active development |
| Logging (JS) | `winston` | `pino` | Either works. Winston has more transports. Pino is faster. TSX agents could recommend either based on user preference. |

---

## Installation Commands

### TypeScript Bot Bootstrap

```bash
# Initialize project
mkdir my-topstepx-bot && cd my-topstepx-bot
npm init -y
npm install @microsoft/signalr trading-signals dotenv zod winston
npm install -D typescript @types/node tsx
npx tsc --init
```

### Python Bot Bootstrap

```bash
# Initialize project
mkdir my-topstepx-bot && cd my-topstepx-bot
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install pysignalr httpx pandas pandas-ta python-dotenv pydantic
```

---

## Sources

- [@microsoft/signalr npm](https://www.npmjs.com/package/@microsoft/signalr) - verified v10.0.0 via `npm view`
- [trading-signals npm](https://www.npmjs.com/package/trading-signals) - verified v7.4.3 via `npm view`
- [pysignalr PyPI](https://pypi.org/project/pysignalr/) - async SignalR client for Python
- [agentskills.io specification](https://agentskills.io/specification) - open standard for SKILL.md format
- [GSD repo](https://github.com/gsd-build/get-shit-done) - analyzed at /tmp/get-shit-done for pattern structure
- [philippseith/signalr Go client](https://pkg.go.dev/github.com/philippseith/signalr) - Go SignalR implementation
- [signalrs Rust crate](https://github.com/szarykott/signalrs) - Rust SignalR implementation
- [ASP.NET Core SignalR JS client docs](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client?view=aspnetcore-10.0) - official Microsoft documentation
