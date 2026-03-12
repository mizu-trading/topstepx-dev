# Domain Pitfalls

**Domain:** AI skill framework for trading API integration (TopStepX / PineScript conversion)
**Researched:** 2026-03-11

---

## Critical Pitfalls

Mistakes that cause rewrites, unsafe trading behavior, or fundamental architecture failures.

### Pitfall 1: PineScript Repainting Illusion in Converted Code

**What goes wrong:** PineScript strategies use `close`, `high`, `low` on the current bar, which on historical data are finalized values but on live bars change tick-by-tick. A naive conversion translates `close` as "current price" without distinguishing confirmed vs. unconfirmed data. The converted bot enters trades on mid-bar signals that would never have existed in backtesting, producing wildly different live results than the PineScript backtest suggested.

**Why it happens:** PineScript's bar-by-bar execution model hides the historical/realtime distinction. The `close` keyword means "the last price of this bar" historically but "the current price right now" on a live bar. Agents converting PineScript to imperative API code don't have this context unless the skill explicitly teaches it.

**Consequences:** Users deploy a converted strategy that appeared profitable in TradingView backtests but bleeds money live. The framework gets blamed for producing incorrect conversions. Trust is destroyed.

**Prevention:**
- The PineScript conversion workflow MUST include a "signal confirmation" step that forces agents to decide: does this signal fire on bar close (confirmed) or on tick (unconfirmed)?
- The PINESCRIPT.md reference MUST document repainting, `barstate.isconfirmed`, and the `close[1]` offset pattern
- Conversion templates should default to confirmed-bar-only signals with an explicit opt-in for tick-level execution
- Include a "repainting audit" checklist that agents run on every converted strategy

**Detection:** Strategy uses `close`, `high`, `low` without offset in signal conditions. No `barstate.isconfirmed` equivalent in the converted code. Backtest results seem too good.

**Phase relevance:** PineScript conversion workflow -- this must be addressed in the conversion agent's core logic, not as an afterthought.

**Confidence:** HIGH -- this is well-documented in [TradingView's official repainting documentation](https://www.tradingview.com/pine-script-docs/concepts/repainting/) and is the single most common source of backtest-to-live divergence.

---

### Pitfall 2: Scope Creep from Code Generation into Runtime Execution

**What goes wrong:** The framework starts as "teach agents to BUILD trading integrations" but gradually absorbs runtime concerns: token refresh loops, WebSocket connection managers, order execution retry logic, position state tracking. The skill becomes a trading engine rather than a teaching framework.

**Why it happens:** Every workflow naturally encounters runtime problems. "Build a trading bot" leads to "the bot needs to handle reconnection" which leads to "here's a reconnection manager component" which leads to "the framework now ships a runtime library." The boundary between teaching and doing is inherently blurry.

**Consequences:** The framework balloons in complexity. Maintenance burden explodes. A bug in framework-provided runtime code causes real financial losses. The zero-dependency constraint becomes impossible to maintain. Scope diverges from GSD's pattern of static content distribution.

**Prevention:**
- Define a hard boundary: TSX provides TEMPLATES and PATTERNS, never LIBRARIES or RUNTIME CODE
- Every template should generate standalone code that the user owns, not code that imports from TSX
- The "out of scope" section in PROJECT.md already states this -- reference it in every workflow's constraints
- When an agent needs to address a runtime concern (reconnection, token refresh), it generates that code INTO the user's project, not as a framework dependency
- Add a scope-check gate to workflows: "Does this change add executable code to the framework itself? If yes, stop."

**Detection:** Framework files contain executable JavaScript beyond the installer. Templates import from a TSX runtime module. The package.json gains runtime dependencies.

**Phase relevance:** ALL phases -- this is a continuous discipline, not a one-time fix. Every workflow design must enforce this boundary.

**Confidence:** HIGH -- explicitly identified in PROJECT.md out-of-scope section. This is the most likely architectural drift.

---

### Pitfall 3: Missing Order Safety Guardrails in Generated Code

**What goes wrong:** AI agents generate trading bot code that places orders without position size limits, maximum loss checks, or error handling for rejected orders. A market order with `size: 100` on ES futures represents $600,000+ in notional value. The TopStepX API will happily accept this if the account allows it.

**Why it happens:** AI coding assistants optimize for "does the code work?" not "is the code safe?" The TopStepX API's order placement endpoint accepts any valid size -- there is no framework-level guardrail. The agent sees `size` as just a parameter and picks a plausible-looking value.

**Consequences:** A user runs AI-generated code that opens oversized positions, blows through prop firm risk limits, and loses their funded account. Even on sim accounts, this creates a false sense of strategy viability.

**Prevention:**
- Every order-placement template MUST include risk parameter validation before the API call
- Define mandatory risk parameters in workflow templates: `maxPositionSize`, `maxDailyLoss`, `maxOpenOrders`
- The "from scratch" and "PineScript conversion" workflows should have a risk configuration step BEFORE any order logic
- Templates should generate code that checks position size against account balance and contract tick value
- Include bracket orders (stop loss / take profit) as default, not optional, in generated code
- The TopStepX API reference should annotate order endpoints with risk warnings

**Detection:** Generated code calls `/api/Order/place` without a preceding size validation check. No stop loss bracket in order placement. No daily P&L tracking in the generated bot.

**Phase relevance:** Workflow templates and agent instructions -- risk guardrails must be baked into templates from the start, not layered on later.

**Confidence:** HIGH -- the TopStepX API docs show bracket orders exist (`stopLossBracket`, `takeProfitBracket`) but they are optional. Without framework guidance, agents will omit them.

---

### Pitfall 4: PineScript Lookahead Bias in Multi-Timeframe Conversions

**What goes wrong:** PineScript strategies using `request.security()` for higher-timeframe data have a subtle lookahead parameter. Without `barmerge.lookahead_off` (or proper offset), historical bars "see" future higher-timeframe data. When converted to API code, the agent either: (a) replicates the bug by fetching current HTF data for decision-making (masking the bias), or (b) correctly uses only completed HTF bars, causing the live strategy to perform worse than the backtest.

**Why it happens:** The `request.security()` lookahead behavior is one of PineScript's most subtle and misunderstood features. Even experienced PineScript developers get this wrong. An AI agent converting code literally will preserve whatever the source PineScript does -- including bugs.

**Consequences:** Converted multi-timeframe strategies either have hidden lookahead bias (appear profitable but can't be replicated live) or appear to "break" during conversion (user thinks the agent did it wrong when actually the PineScript itself was flawed).

**Prevention:**
- PINESCRIPT.md must document `request.security()` lookahead behavior in detail
- The conversion workflow should include a "multi-timeframe audit" step that flags any `request.security()` calls and asks the user whether the original PineScript used lookahead correctly
- Conversion templates should default to `[1]` offset for HTF data (conservative, no lookahead)
- When an agent detects potential lookahead bias in source PineScript, it should WARN the user rather than silently "fix" it

**Detection:** Source PineScript contains `request.security()` without explicit `lookahead` parameter. Converted code fetches current-period HTF data for signal generation.

**Phase relevance:** PineScript conversion workflow -- the conversion agent must be specifically trained on this.

**Confidence:** HIGH -- documented in [TradingView's official docs on other timeframes and data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/).

---

### Pitfall 5: JWT Token Expiry Causing Silent Bot Death

**What goes wrong:** Generated bots authenticate once, get a 24-hour JWT token, and never refresh it. The bot runs for 24 hours, the token expires, all API calls start returning 401, and orders stop executing. If the bot has open positions, they are unmanaged.

**Why it happens:** The authentication flow is straightforward -- call `/api/Auth/loginKey`, get a token, use it. The 24-hour expiry is documented but easy to overlook. AI agents generating "getting started" code naturally write the happy path first. Token refresh via `/api/Auth/validate` is a separate endpoint that requires proactive scheduling.

**Consequences:** Bots silently stop working after 24 hours. Open positions go unmonitored -- no stop loss adjustments, no profit taking, no response to market events. On a prop firm account, this can violate risk rules and cause account termination.

**Prevention:**
- Token management MUST be a first-class component in every generated bot, not an afterthought
- Templates should include a token refresh mechanism that runs BEFORE expiry (e.g., refresh at 23 hours)
- The TOPSTEPX_API.md skill reference should emphasize the 24-hour expiry prominently and link to the `/api/Auth/validate` endpoint
- Generated code should track token creation time and fail loudly (shut down gracefully) if refresh fails rather than continuing with an expired token
- WebSocket connections also need token handling -- document that reconnection requires a valid token

**Detection:** Generated code calls `/api/Auth/loginKey` but never calls `/api/Auth/validate`. No timer or scheduled refresh in the bot architecture. No error handling for 401 responses.

**Phase relevance:** "From scratch" workflow and all templates -- token lifecycle management is a table-stakes concern.

**Confidence:** HIGH -- directly visible in the TopStepX API documentation: tokens are 24-hour, `/api/Auth/validate` exists for refresh.

---

## Moderate Pitfalls

Mistakes that cause delays, poor output quality, or accumulated technical debt.

### Pitfall 6: SignalR Reconnection Without Resubscription

**What goes wrong:** The generated WebSocket code uses `.withAutomaticReconnect()` but doesn't resubscribe to channels in the `onreconnected` handler. After a network interruption, the connection restores but no data flows. The bot appears connected but receives zero market data or order updates.

**Why it happens:** SignalR's `withAutomaticReconnect()` restores the transport connection but does NOT restore application-level subscriptions. This is a known gotcha documented by Microsoft. The TopStepX API examples in the codebase already handle this correctly (they call `subscribe()` in `onreconnected`), but agents generating new code from scratch may not include it.

**Prevention:**
- The SignalR connection template MUST include the `onreconnected` resubscription pattern
- The TOPSTEPX_API.md reference already shows this pattern -- ensure agents are directed to follow it exactly
- Templates should include a "connection health check" that verifies data is flowing after reconnection (e.g., if no quote received in 30 seconds after reconnect, force full reconnection)

**Detection:** Generated code has `.withAutomaticReconnect()` but no `onreconnected` handler, or the handler doesn't call subscribe methods.

**Phase relevance:** Real-time data templates and "from scratch" workflow.

**Confidence:** HIGH -- [Microsoft's SignalR documentation](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-concept-client-disconnections) explicitly describes this behavior.

---

### Pitfall 7: Rate Limit Ignorance in Historical Data Fetching

**What goes wrong:** Agents generate code that fetches historical bars in a tight loop without respecting the 50 requests/30 seconds rate limit on `/api/History/retrieveBars`. The API returns HTTP 429, the bot crashes or enters an infinite retry loop, and the user thinks the API is broken.

**Why it happens:** AI agents writing data-fetching code default to "fetch as fast as possible." The rate limit is documented but not enforced client-side. When building backtesting or data analysis features, the agent naturally writes a loop that requests many date ranges sequentially.

**Prevention:**
- Historical data templates MUST include rate-limiting logic (token bucket or simple delay)
- Document the two distinct rate limits clearly: 50/30s for history, 200/60s for everything else
- Templates should include a `rateLimiter` utility pattern that the generated code uses
- For bulk historical data, templates should batch requests with appropriate delays

**Detection:** Generated code has a loop calling `retrieveBars` without delay or rate tracking. No HTTP 429 handling with backoff.

**Phase relevance:** Templates and reference documentation.

**Confidence:** HIGH -- rate limits are explicitly documented in the TopStepX API.

---

### Pitfall 8: GSD Pattern Divergence Making TSX Feel Bolted-On

**What goes wrong:** TSX commands, agents, and workflows drift from GSD's established patterns. Commands use different frontmatter structures. Agents have different execution flow conventions. Workflows skip steps that GSD workflows include (like verification). Users familiar with GSD find TSX jarring and inconsistent.

**Why it happens:** Trading domain concerns tempt developers to "improve" on GSD patterns. "GSD's verification step doesn't make sense for trading" leads to skipping it. "GSD's agent structure is too verbose for our use case" leads to custom formats. Each small deviation compounds.

**Prevention:**
- Clone GSD's actual file structures as starting points, then specialize the CONTENT, not the STRUCTURE
- Maintain a GSD compatibility checklist: same frontmatter schema, same agent sections, same workflow phase structure
- Use `tsx:` prefix consistently but mirror `gsd:` command naming conventions (e.g., if GSD has `gsd:new-project`, TSX has `tsx:new-integration`)
- Test by asking: "Could someone who knows GSD commands predict how TSX commands work?" If not, the pattern has diverged too far

**Detection:** TSX YAML frontmatter fields don't match GSD's schema. TSX workflows have different phase names or ordering than GSD equivalents. TSX agents lack sections that GSD agents include.

**Phase relevance:** Command system and agent definition phases -- the foundation must match GSD before any trading specialization.

**Confidence:** MEDIUM -- this is an architectural judgment call based on the PROJECT.md requirements. No external source validates the specific GSD patterns to match since GSD itself is the reference.

---

### Pitfall 9: Language Adaptation Hardcoding Instead of Language-Agnostic Patterns

**What goes wrong:** The language adaptation workflow gets built with specific language pairs in mind (e.g., "Python to JavaScript" or "JavaScript to Python") rather than as a generic any-to-any conversion. Adding a new language requires modifying the workflow itself rather than just adding a language-specific template.

**Why it happens:** The first implementation naturally targets the most common case. "Let's just handle Python and JavaScript for now" leads to conditional logic branching on language names. This becomes entrenched architecture that is painful to generalize later.

**Prevention:**
- Design the adaptation workflow as language-agnostic from day one: source analysis -> API mapping -> target generation
- The workflow should parameterize language-specific concerns (HTTP client libraries, WebSocket libraries, async patterns) rather than hardcoding them
- Use a language profile pattern: each supported language has a profile describing its idioms, common libraries for HTTP/WebSocket, and async model
- The agent instructions should say "analyze the source code's intent and API usage" not "convert this Python to JavaScript"

**Detection:** Workflow files contain `if language === "python"` style branching. Adding support for a new language requires editing the workflow rather than adding a new profile.

**Phase relevance:** Language adaptation workflow design.

**Confidence:** MEDIUM -- this is a software design principle applied to the specific project context.

---

### Pitfall 10: Enum Misuse in Generated Order Code

**What goes wrong:** The TopStepX API uses integer enums for critical fields: `OrderSide` (0=Bid/Buy, 1=Ask/Sell), `OrderType` (0-7), `OrderStatus` (0-6). AI agents generating code may confuse these values, mix up bid/ask, or use incorrect order type integers. A bug where bid and ask are swapped means the bot buys when it should sell.

**Why it happens:** Integer enums with no descriptive names in the API request body are error-prone. The difference between `"side": 0` (buy) and `"side": 1` (sell) is a single digit. AI agents working from memory rather than reference documentation may transpose values.

**Prevention:**
- Templates MUST define named constants for all enums (e.g., `const ORDER_SIDE = { BUY: 0, SELL: 1 }`)
- The enum reference must be loaded by agents BEFORE generating any order code
- Generated code should never use bare integers for enum values -- always named constants
- Include a "order dry-run" validation step in workflows that logs the human-readable version of what would be placed before actually calling the API

**Detection:** Generated code uses bare integer literals in order placement calls (e.g., `"side": 0` instead of `"side": ORDER_SIDE.BUY`). No enum constant definitions in generated code.

**Phase relevance:** Templates and reference materials -- enum definitions must be prominent, not buried.

**Confidence:** HIGH -- directly visible in the API: `"side": 0` vs `"side": 1` is a trivially easy mistake with catastrophic consequences.

---

## Minor Pitfalls

Mistakes that cause friction but are recoverable without major rework.

### Pitfall 11: Contract ID Format Confusion

**What goes wrong:** Users or agents construct contract IDs incorrectly. The format `CON.F.US.<symbol>.<expiry>` has specific conventions (e.g., `ENQ` for Nasdaq, `EP` for S&P, `U25` for September 2025). Agents may guess wrong contract IDs, use expired contracts, or confuse symbol IDs with contract IDs.

**Prevention:**
- Templates should always start by calling `/api/Contract/available` or `/api/Contract/search` to discover valid contract IDs rather than hardcoding them
- Document the contract ID format clearly with examples for common futures
- Include month code reference: F=Jan, G=Feb, H=Mar, J=Apr, K=May, M=Jun, N=Jul, Q=Aug, U=Sep, V=Oct, X=Nov, Z=Dec

**Detection:** Hardcoded contract IDs in generated code. No contract discovery step in the workflow.

**Phase relevance:** Templates and reference documentation.

**Confidence:** HIGH -- contract IDs are visible in the API docs with the specific format.

---

### Pitfall 12: Half-Turn Trade Confusion

**What goes wrong:** The TopStepX API returns `null` for `profitAndLoss` on half-turn trades (opening trades). Agents generating P&L tracking code may treat `null` P&L as zero profit or as an error, producing incorrect performance reports.

**Prevention:**
- Document the half-turn trade concept in the reference materials
- Templates for P&L tracking should explicitly handle `null` profitAndLoss as "this is an opening trade, P&L is not yet realized"
- Include a complete trade matching example in templates that pairs half-turns into round-trips

**Detection:** Generated P&L code treats `null` profitAndLoss as `0` or throws on null.

**Phase relevance:** Templates and reference documentation.

**Confidence:** HIGH -- explicitly documented in the API: "A null value for profitAndLoss indicates a half-turn trade."

---

### Pitfall 13: Overloading SKILL.md with Framework Content

**What goes wrong:** As TSX expands from a simple API reference skill to a full framework with commands, agents, and workflows, the temptation is to cram everything into SKILL.md or make it the orchestration hub. This makes the skill file enormous and breaks the AI platform's context loading.

**Prevention:**
- SKILL.md remains a concise API reference (its current role)
- Framework orchestration lives in command files and workflow definitions, not in the skill
- Follow GSD's pattern: commands are the entry points, agents do the work, workflows define the steps, references provide domain knowledge
- The skill triggers on keyword matching; commands trigger on explicit user invocation -- keep these separate

**Detection:** SKILL.md exceeds its current size by more than 2x. SKILL.md contains workflow logic or agent instructions.

**Phase relevance:** Framework restructuring phase -- when moving from skill to framework.

**Confidence:** MEDIUM -- based on understanding of how AI platforms load skills and context window constraints.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Command system (`tsx:*`) | GSD pattern divergence (#8) | Clone GSD command structure exactly, specialize content only |
| Agent definitions | Scope creep into runtime (#2) | Hard boundary: agents generate code, never execute trading logic |
| "From scratch" workflow | Missing risk guardrails (#3), token expiry (#5) | Risk config step before order logic; token lifecycle in every template |
| Language adaptation workflow | Hardcoded language pairs (#9) | Language-agnostic design from day one with language profiles |
| PineScript conversion workflow | Repainting (#1), lookahead bias (#4) | Signal confirmation step, multi-timeframe audit, PINESCRIPT.md education |
| Templates (all workflows) | Enum misuse (#10), rate limits (#7) | Named constants for enums; rate limiter utility in data templates |
| Reference materials | Information buried or incomplete | Enum reference prominent; risk warnings on order endpoints; half-turn docs |
| Installer expansion | Overloading SKILL.md (#13) | Keep skill concise; framework logic in commands/workflows/agents |
| WebSocket/real-time features | Reconnection without resubscription (#6) | Mandate `onreconnected` resubscription in all SignalR templates |

---

## Sources

- [TradingView PineScript Repainting Documentation](https://www.tradingview.com/pine-script-docs/concepts/repainting/) -- HIGH confidence
- [TradingView PineScript Other Timeframes and Data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/) -- HIGH confidence
- [Microsoft SignalR Client Disconnections and Reconnection](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-concept-client-disconnections) -- HIGH confidence
- [TopStepX API Documentation](https://api.topstepx.com) -- HIGH confidence (project source material)
- [Crypto Trading Bot Pitfalls and Risks 2025](https://www.gate.com/news/detail/13225882) -- MEDIUM confidence
- [PineGen AI on Repainting and Lookahead Bias](https://medium.com/@rangatechnologies/how-pinegen-ai-handles-repainting-and-look-ahead-bias-at-the-code-level-3f49620e358d) -- MEDIUM confidence
- [AI Coding Best Practices 2025](https://dev.to/ranndy360/ai-coding-best-practices-in-2025-4eel) -- LOW confidence (general, not domain-specific)

---

*Pitfalls research: 2026-03-11*
