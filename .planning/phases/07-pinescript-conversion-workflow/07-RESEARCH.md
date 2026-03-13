# Phase 7: PineScript Conversion Workflow - Research

**Researched:** 2026-03-12
**Domain:** Workflow authoring for PineScript-to-TopStepX trading bot conversion with repainting audit and safety guardrails
**Confidence:** HIGH

## Summary

Phase 7 creates a single new workflow file (`topstepx/workflows/adapt-pinescript.md`) that enables AI agents to convert TradingView PineScript strategies into live-tradeable TopStepX trading bots. This is the third TSX-specific workflow, following Phase 5's new-project workflow and Phase 6's adapt-language workflow. It follows the same XML tag structure pattern established across all TSX workflows.

The workflow's core differentiator from adapt-language (Phase 6) is the PineScript-specific domain: parsing a declarative bar-by-bar scripting language and mapping it to imperative REST/WebSocket API calls. The workflow MUST include two critical safety steps that adapt-language explicitly deferred: (1) a repainting audit implementing SAF-04's 4-point checklist, and (2) a multi-timeframe lookahead bias audit for `request.security()` calls. Both are non-negotiable gates before code generation.

All building blocks already exist. PINESCRIPT.md (Phase 1, 526 lines) provides the complete PineScript reference with conversion mapping tables, TA function mappings, and enum crosswalks. The pinescript-conversion.md template (Phase 2, TPL-06) defines the report structure including repainting audit, MTF audit, conversion mapping, bar close policy, and safety integration tables. Bot scaffolds (Phase 2) provide structural code bases. Safety-patterns.md (Phase 1) defines SAF-04 specifically for PineScript repainting. The workflow orchestrates these existing assets into a step-based conversion flow.

**Primary recommendation:** Build a single workflow file (~700-1000 lines) following the adapt-language.md pattern: `<purpose>`, `<auto_mode>`, `<process>` with numbered steps, `<output>`, `<success_criteria>`. The step flow should be: (1) Setup, (2) PineScript Source Analysis, (3) Repainting Audit (SAF-04), (4) Multi-Timeframe Audit, (5) Target Language Selection, (6) Conversion Mapping, (7) Conversion Report Generation, (8) Code Generation, (9) Safety Verification (SAF-01 through SAF-05), (10) Completion Summary. The repainting and MTF audit steps are unique to this workflow and MUST block code generation if issues are found without user acknowledgment.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WKF-08 | `adapt-pinescript` workflow -- PineScript to TopStepX live trading bot conversion | Full workflow structure from adapt-language.md pattern; PINESCRIPT.md for conversion mappings (strategy.entry to order placement, ta.* to trading-signals/pandas-ta, alertcondition to event handlers); SAF-04 repainting 4-point checklist in safety-patterns.md; pinescript-conversion.md report template; bot scaffolds for code generation; signal confirmation via barstate.isconfirmed default |
</phase_requirements>

## Standard Stack

### Core
| Asset | Location | Purpose | Why Standard |
|-------|----------|---------|--------------|
| adapt-language.md | topstepx/workflows/adapt-language.md | Sister workflow pattern (654 lines) | Closest structural precedent -- same XML tags, same safety gate, same completion pattern; adapt-pinescript adds PineScript-specific steps |
| PINESCRIPT.md | topstepx/references/PINESCRIPT.md | PineScript language reference with conversion mappings (526 lines) | Complete v6 reference with strategy function mapping, TA function mapping, enum crosswalk, repainting detection guide, and conversion checklist |
| pinescript-conversion.md | topstepx/templates/pinescript-conversion.md | Conversion report template (244 lines) | Already created in Phase 2 (TPL-06); defines source analysis, repainting audit, MTF audit, conversion mapping, bar close policy, safety integration, confidence ratings |
| safety-patterns.md | topstepx/references/safety-patterns.md | Safety patterns including SAF-04 PineScript Repainting Audit (481 lines) | SAF-04 defines the 4-point repainting checklist with REPAINTS vs SAFE code examples; SAF-01 through SAF-05 all required for final verification |
| bot-scaffold-js.md | topstepx/templates/bot-scaffold-js.md | JavaScript bot structural base (578 lines) | Complete scaffold with SAF-01 through SAF-05 built in; target for JavaScript conversions |
| bot-scaffold-python.md | topstepx/templates/bot-scaffold-python.md | Python bot structural base (559 lines) | Complete scaffold with SAF-01 through SAF-05 built in; target for Python conversions |
| tsx-tools.cjs | topstepx/bin/tsx-tools.cjs | CLI for init, commit, state management | Used by all workflows for setup/teardown |

### Supporting
| Asset | Location | Purpose | When to Use |
|-------|----------|---------|-------------|
| TOPSTEPX_API.md | topstepx/references/TOPSTEPX_API.md | API endpoint reference (1,114 lines) | During conversion mapping to verify endpoint paths, request/response shapes, and enum values |
| new-project.md | topstepx/workflows/new-project.md | Gold standard workflow pattern (1,307 lines) | Reference for XML tag structure, AskUserQuestion pattern, init step, completion banner |
| language-adaptation.md | topstepx/templates/language-adaptation.md | Language adaptation report template | Reference for how adapt-language uses a template -- adapt-pinescript uses pinescript-conversion.md similarly |
| strategy-spec.md | topstepx/templates/strategy-spec.md | Strategy specification template | The adapt-pinescript workflow may produce a strategy-spec alongside the conversion report |
| risk-parameters.md | topstepx/templates/risk-parameters.md | Risk parameters template | PineScript strategies often lack risk params -- the workflow must generate risk defaults |

### Not Needed
| Asset | Why Not |
|-------|---------|
| adapt-language.md (as code base) | adapt-pinescript is a NET-NEW file, not a modification of adapt-language; structural inspiration only |
| Any GSD source files | Phase 7 creates a TSX-specific workflow, not a GSD adaptation |
| External npm packages | This is a markdown workflow document, not executable code |

## Architecture Patterns

### Workflow File Structure
```
topstepx/workflows/adapt-pinescript.md
```

Single file following the established XML tag structure:

```markdown
<purpose>
[Convert TradingView PineScript strategy to live-tradeable TopStepX bot]
</purpose>

<required_reading>
[Load PINESCRIPT.md, safety-patterns.md, TOPSTEPX_API.md]
</required_reading>

<auto_mode>
[--auto flag detection, requires source path + target language]
</auto_mode>

<pinescript_mapping>
[Inline mapping tables for strategy functions, TA functions, enum crosswalks]
</pinescript_mapping>

<process>

## 1. Setup
[tsx-tools.cjs init, parse arguments, validate PineScript file]

## 2. PineScript Source Analysis
[Parse strategy: version, inputs, indicators, entry/exit logic, position mgmt]

## 3. Repainting Audit (SAF-04)
[4-point checklist: request.security, unconfirmed bars, realtime-only, fluid values]

## 4. Multi-Timeframe Audit
[Scan request.security() calls, check lookahead + [1] offset, apply safe defaults]

## 5. Signal Confirmation Decision
[Default to confirmed-bar-only; flag repainting indicators; user can opt into tick-based]

## 6. Target Language Selection
[JavaScript or Python; load language profile from adapt-language pattern]

## 7. Conversion Mapping
[Map PineScript constructs to TopStepX API calls using PINESCRIPT.md tables]

## 8. Conversion Report Generation
[Populate pinescript-conversion.md template with analysis + audit + mapping data]

## 9. Code Generation
[Generate bot code using scaffold + conversion mapping; trading build order]

## 10. Safety Verification
[Grep-based SAF-01 through SAF-05 check INCLUDING SAF-04 repainting compliance]

## 11. Completion Summary
[Display results, route to /tsx:verify-work]

</process>

<output>
[Conversion report + generated bot code files]
</output>

<success_criteria>
[Checkbox list]
</success_criteria>
```

### Pattern 1: PineScript Source Analysis (Inline)
**What:** Structured parsing of PineScript strategy to extract all convertible elements
**When to use:** Step 2, when reading the PineScript source file
**Categories to extract:**

1. **Strategy Declaration:** version (`//@version=N`), strategy name, parameters (pyramiding, margin, fill_orders_on_standard_ohlc)
2. **Inputs:** All `input.*()` calls -- these become bot config parameters
3. **Indicators:** All `ta.*` function calls with their parameters
4. **Entry Conditions:** All `strategy.entry()` calls with direction (long/short), order type (market/limit/stop), quantity
5. **Exit Conditions:** All `strategy.exit()` calls with profit/loss/trail parameters, `strategy.close()`, `strategy.close_all()`
6. **Position Management:** References to `strategy.position_size`, `strategy.position_avg_price`, partial exits via `qty_percent`
7. **Multi-Timeframe:** All `request.security()` and `request.security_lower_tf()` calls
8. **Alert Conditions:** All `alertcondition()` calls -- these become event handlers
9. **Visual-Only Elements:** `plot()`, `bgcolor()`, `hline()`, `plotshape()` -- these are SKIPPED in conversion
10. **User-Defined Functions:** Custom functions that need conversion

### Pattern 2: Repainting Audit (4-Point Checklist from SAF-04)
**What:** Mandatory audit of PineScript source for repainting patterns before any code generation
**When to use:** Step 3, BEFORE target language selection or code generation
**The 4 checks:**

| Check | What It Detects | Safe Pattern | Grep/Scan Pattern |
|-------|----------------|--------------|-------------------|
| 1. `request.security()` without `[1]` offset | Lookahead bias from higher timeframe data | `close[1], lookahead=barmerge.lookahead_on` | Scan for `request.security` calls, check for `[1]` offset AND `lookahead_on` |
| 2. Conditions on unconfirmed bars | Signals that change intra-bar in realtime | Add `and barstate.isconfirmed` to conditions | Scan `strategy.entry`/`strategy.exit` conditions, check for `barstate.isconfirmed` |
| 3. Realtime-only logic | Different behavior on historical vs realtime bars | Avoid `barstate.isrealtime` in trading logic | Scan for `barstate.isrealtime` in conditional blocks containing strategy calls |
| 4. Fluid values in conditions | high/low/close values that change intra-bar | Use `high[1]`, `low[1]`, `close[1]` | Scan conditions using `high`, `low`, `close` without `[1]` offset in strategy calls |

**Audit output:** A risk level (NONE / LOW / MEDIUM / HIGH / CRITICAL) and a list of issues with line references, original code, and recommended fixes.

**Gate behavior:** If ANY check FAILS, the workflow presents findings to the user and applies the SAFE pattern as default. The user can:
- Accept the safe default (proceed with confirmed-bar signals)
- Explicitly acknowledge the repainting risk (proceed with original, documented in report)
- In auto-mode: always apply the safe default, log a warning

### Pattern 3: Multi-Timeframe Audit
**What:** Dedicated scan for `request.security()` lookahead bias separate from the general repainting audit
**When to use:** Step 4, after the general repainting audit
**What to check for each `request.security()` call:**

| Parameter | Expected Safe Value | Issue If Missing |
|-----------|-------------------|------------------|
| `lookahead` | `barmerge.lookahead_on` | Data may be stale (two bars ago) |
| Expression offset | `[1]` applied to data (e.g., `close[1]`) | Uses current unconfirmed bar data (future data on historical) |
| Both together | BOTH present | Using one without the other is still unsafe |

**v6 consideration:** PineScript v6 introduced `request.security_lower_tf()` for lower-timeframe requests. This function handles synchronization correctly without requiring `lookahead_on`, so it passes the audit automatically when detected.

**Default fix:** Apply `[1]` offset to all `request.security()` data expressions that lack it, and ensure `lookahead=barmerge.lookahead_on` is set.

### Pattern 4: Signal Confirmation Decision
**What:** Explicit decision step about whether the converted bot uses confirmed-bar or tick-based signal evaluation
**When to use:** Step 5, after audits complete
**Default:** Confirmed-bar-only signals (`barstate.isconfirmed` equivalent in the converted bot)

In the converted bot, this translates to:
- **Confirmed-bar mode (default):** Bot evaluates signals only when a new bar completes (detected via bar timestamp boundary). Entry orders placed at the open of the NEXT bar.
- **Tick-based mode (user opt-in only):** Bot evaluates signals on each incoming quote/tick. User must explicitly acknowledge repainting risk.

### Pattern 5: Conversion Mapping (PineScript to TopStepX)
**What:** The core mapping tables that translate PineScript constructs to TopStepX API calls
**When to use:** Steps 7 and 9, during mapping and code generation
**Key mappings (from PINESCRIPT.md):**

**Strategy Functions:**
| PineScript | TopStepX API | Critical Notes |
|------------|-------------|----------------|
| `strategy.entry("id", strategy.long)` | `POST /api/Order/place` with `side: OrderSide.Bid, type: OrderType.Market` | PineScript auto-reverses positions; TopStepX needs explicit close + new entry |
| `strategy.entry("id", strategy.short)` | `POST /api/Order/place` with `side: OrderSide.Ask, type: OrderType.Market` | Same reversal caveat |
| `strategy.entry(..., limit=price)` | `POST /api/Order/place` with `type: OrderType.Limit, limitPrice: price` | |
| `strategy.entry(..., stop=price)` | `POST /api/Order/place` with `type: OrderType.Stop, stopPrice: price` | |
| `strategy.exit(..., profit=N)` | `takeProfitBracket: { ticks: N, type: OrderType.Limit }` | |
| `strategy.exit(..., loss=N)` | `stopLossBracket: { ticks: N, type: OrderType.Limit }` | |
| `strategy.exit(..., trail_points=N)` | `POST /api/Order/place` with `type: OrderType.TrailingStop` | |
| `strategy.close("id")` | `POST /api/Position/closeContract` | |
| `strategy.close_all()` | Close each open position via `/api/Position/closeContract` | |
| `strategy.cancel("id")` | `POST /api/Order/cancel` with `orderId` | |

**Position Reversal Handling (CRITICAL):**
PineScript's `strategy.entry()` automatically reverses positions -- entering long while short closes the short AND opens long (total 2x contracts transacted). TopStepX has NO auto-reversal. The converted bot MUST:
1. Check current position state before entry
2. If reversing: first close the existing position, then open the new one
3. Handle the two-step operation atomically (or document the risk of partial fills)

**TA Functions (from PINESCRIPT.md mapping table):**
| PineScript | JS (trading-signals) | Python (pandas-ta) |
|------------|---------------------|-------------------|
| `ta.sma(src, len)` | `new SMA(len)` | `ta.sma(series, length=len)` |
| `ta.ema(src, len)` | `new EMA(len)` | `ta.ema(series, length=len)` |
| `ta.rsi(src, len)` | `new RSI(len)` | `ta.rsi(series, length=len)` |
| `ta.macd(src, fast, slow, sig)` | `new MACD({fast, slow, signal})` | `ta.macd(series, fast, slow, signal)` |
| `ta.bb(src, len, mult)` | `new BollingerBands(len, mult)` | `ta.bbands(series, length=len, std=mult)` |
| `ta.atr(len)` | `new ATR(len)` | `ta.atr(high, low, close, length=len)` |
| `ta.crossover(a, b)` | Manual: `a[i-1] < b[i-1] && a[i] > b[i]` | Manual: comparison |
| `ta.crossunder(a, b)` | Manual: `a[i-1] > b[i-1] && a[i] < b[i]` | Manual: comparison |

**Constructs to SKIP (visual-only):**
`plot()`, `plotshape()`, `plotchar()`, `bgcolor()`, `hline()`, `fill()`, `barcolor()`, `plotcandle()`, `plotbar()`, `plotarrow()`, `label.new()`, `line.new()`, `box.new()`, `table.new()` -- these are TradingView display functions with no trading logic equivalent.

**Input to Config mapping:**
| PineScript | Bot Config |
|------------|-----------|
| `input.int(defval, title)` | Config property with default value |
| `input.float(defval, title)` | Config property with default value |
| `input.bool(defval, title)` | Config property with default value |
| `input.string(defval, title, options=[...])` | Config property with enum/options |
| `input.source(close, title)` | Config property referencing bar data field |

### Pattern 6: Code Generation Order (Trading Build Order)
**What:** File generation follows the established trading build order with PineScript-specific additions
**When to use:** Step 9, during code generation
**Sequence:**
1. Safety infrastructure first (enums, config constants from PineScript inputs, risk parameters)
2. Authentication (TokenManager, login flow, bearer headers)
3. Rate limiting (RateLimiter, RATE_LIMITS constants)
4. REST API integration (order placement with bracket defaults, position queries, history bar retrieval)
5. WebSocket integration (Market Hub, User Hub, event handlers, subscriptions, reconnection)
6. Bar data management (history buffer, bar aggregation from ticks/quotes, bar completion detection)
7. Indicator calculations (translated from ta.* to trading-signals/pandas-ta)
8. Signal evaluation (entry/exit conditions from PineScript, with confirmed-bar gate)
9. Position management (reversal handling, partial exits, position reconciliation)

Note the two additions compared to adapt-language's conversion order: step 6 (bar data management) and step 9 (position management) are PineScript-specific because PineScript strategies assume bar data is provided by the engine, while TopStepX bots must manage their own bar history.

### Anti-Patterns to Avoid
- **Skipping repainting audit:** The workflow MUST run SAF-04's 4-point checklist before ANY code generation. A strategy that repaints appears profitable in backtests but trades on signals that would NOT have existed in real-time. This is the most dangerous failure mode.
- **Assuming PineScript auto-reversal works in TopStepX:** `strategy.entry()` auto-reverses positions in PineScript. The converted bot MUST explicitly close + re-enter. Missing this creates double-sized positions.
- **Copying ta.* formulas instead of using libraries:** The workflow should map ta.* functions to trading-signals (JS) or pandas-ta (Python), not reimplement indicator math. Indicator libraries are tested and handle edge cases (insufficient data, NaN, etc.).
- **Ignoring PineScript inputs:** Every `input.*()` call in the source becomes a configuration parameter. Ignoring them means the bot has hardcoded values that the user expected to be configurable.
- **Not handling the bar data gap:** PineScript strategies receive bar data from TradingView's engine. TopStepX bots must fetch historical bars via `/api/History/retrieveBars` AND aggregate real-time ticks into bars. This is infrastructure the PineScript strategy never needed.
- **Duplicating content from PINESCRIPT.md or safety-patterns.md:** The workflow should REFERENCE these by path, not copy their content inline.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Conversion report format | Custom report structure | `@topstepx/templates/pinescript-conversion.md` | Template already defines repainting audit, MTF audit, conversion mapping, bar close policy, safety integration, and confidence ratings |
| PineScript mapping tables | Custom mapping logic | `@topstepx/references/PINESCRIPT.md` | Complete v6 reference with strategy function mapping, TA function mapping, enum crosswalk (526 lines) |
| Target code structure | Custom bot skeleton | `@topstepx/templates/bot-scaffold-js.md` or `bot-scaffold-python.md` | Scaffolds have all SAF-01 through SAF-05 patterns implemented |
| Repainting detection rules | Custom audit logic | `@topstepx/references/safety-patterns.md` SAF-04 | 4-point checklist with REPAINTS vs SAFE code examples for each pattern |
| TA function implementations | Hand-rolled indicator math | `trading-signals` (JS) or `pandas-ta` (Python) | These libraries handle edge cases and are battle-tested |
| Language-specific details | Inline language profiles | Reuse language profiles from `adapt-language.md` pattern | Same two target languages (JS/Python), same library mappings |
| Safety verification commands | Custom verification | Reuse grep patterns from `adapt-language.md` Step 7 + add SAF-04 | adapt-language already has SAF-01/02/03/05 grep commands for both JS and Python |

**Key insight:** Phase 1 created PINESCRIPT.md and SAF-04, Phase 2 created the pinescript-conversion.md template and bot scaffolds, and Phase 6 established the workflow pattern with safety verification. This workflow is the PineScript-specific orchestration glue that connects all these existing assets, adding the repainting audit and MTF audit as unique steps.

## Common Pitfalls

### Pitfall 1: Repainting Strategy Producing False Confidence
**What goes wrong:** A PineScript strategy that looks profitable in TradingView backtests generates live trades based on signals that would NOT have existed at the time -- losing real money
**Why it happens:** PineScript's execution model processes historical bars with complete data (all ticks aggregated into OHLCV), making conditions appear to trigger at bar open that actually only resolved at bar close. Without the repainting audit, the converted bot replicates this false confidence.
**How to avoid:** The SAF-04 4-point repainting checklist is MANDATORY before code generation. Default to `barstate.isconfirmed` (confirmed-bar mode). Flag every repainting pattern to the user.
**Warning signs:** Strategy conditions use `close`, `high`, `low` without `[1]` offset; `request.security()` without `[1]` + `lookahead_on`; no `barstate.isconfirmed` anywhere in the source

### Pitfall 2: Position Reversal Double-Sizing
**What goes wrong:** PineScript's `strategy.entry("short", strategy.short)` while long automatically closes long + opens short (2x contracts). A naive conversion just places a short order, resulting in a combined long+short position or double-sized trade.
**Why it happens:** TopStepX has no auto-reversal. An order to sell 1 contract while holding 1 long results in flat (not short 1).
**How to avoid:** The conversion mapping step MUST generate explicit reversal logic: check current position, close if opposite direction, then enter new position. Document this in the conversion report.
**Warning signs:** Conversion code has `strategy.entry` mapped directly to `createOrder` without position state check

### Pitfall 3: Missing Bar Data Infrastructure
**What goes wrong:** The converted bot calculates indicators but has no bar data to feed them -- PineScript provides this implicitly, TopStepX does not
**Why it happens:** In PineScript, `close`, `open`, `high`, `low`, `volume` are built-in series updated by the engine. The converter maps indicator calculations but forgets that the bar data pipeline doesn't exist.
**How to avoid:** Code generation step MUST include bar data management: (1) fetch historical bars via `/api/History/retrieveBars` for indicator warm-up, (2) aggregate real-time ticks/quotes into bars, (3) detect bar completion based on time boundaries. This is step 6 in the code generation order.
**Warning signs:** Generated bot has indicator calculations but no `fetchHistoricalBars` call and no bar aggregation logic

### Pitfall 4: Multi-Timeframe Lookahead Bias Surviving Conversion
**What goes wrong:** Source strategy uses `request.security(sym, "D", close)` without `[1]` offset. The converter maps this to a daily bar fetch, but the fetched data includes the current incomplete day's bar -- replicating the lookahead bias.
**Why it happens:** The MTF audit is easy to miss because `request.security` looks like a simple data fetch
**How to avoid:** The dedicated MTF audit step (Step 4) checks every `request.security()` call. For each, verify BOTH `[1]` offset AND `lookahead_on`. Apply `[1]` offset as default fix. In the converted bot, this means fetching bars with `count` = N+1 and using `bars[bars.length - 2]` instead of `bars[bars.length - 1]`.
**Warning signs:** `request.security()` calls without `[1]` offset in source PineScript

### Pitfall 5: PineScript Input Defaults Becoming Hardcoded Values
**What goes wrong:** PineScript `input.int(14, "RSI Length")` becomes a hardcoded `14` in the converted bot instead of a configurable parameter
**Why it happens:** Inputs are parsed during analysis but forgotten during code generation
**How to avoid:** Step 2 (source analysis) extracts ALL inputs as a structured table. Step 9 (code generation) MUST create a config object/dictionary with every input as a named, configurable parameter with its PineScript default value.
**Warning signs:** Generated bot code has magic numbers that match PineScript input defaults

### Pitfall 6: Workflow File Becoming Too Long
**What goes wrong:** Workflow exceeds 1200+ lines with inline PineScript examples and mapping tables
**Why it happens:** PineScript conversion has more domain content than language adaptation -- more steps, more mapping tables, more audit logic
**How to avoid:** Reference PINESCRIPT.md for mapping tables instead of duplicating them. Reference safety-patterns.md for SAF-04 checklist. Keep inline examples minimal. Target 700-1000 lines.
**Warning signs:** Copy-pasting tables from PINESCRIPT.md into the workflow, embedding full code examples from bot scaffolds

## Code Examples

### Example 1: PineScript Source Analysis Output
```markdown
## 2. PineScript Source Analysis

Parse the PineScript source file and extract:

PineScript Analysis Complete
=============================
Version: v6
Strategy Name: MA Crossover
Strategy Type: trend-following
Lines: 35

Inputs Found:
  - fastLen: int, default=9, title="Fast Length"
  - slowLen: int, default=21, title="Slow Length"
  - stopLossTicks: int, default=20, title="Stop Loss Ticks"

Indicators:
  - ta.ema(close, fastLen) -> fast EMA
  - ta.ema(close, slowLen) -> slow EMA
  - ta.crossover(fast, slow) -> long signal
  - ta.crossunder(fast, slow) -> short signal

Entry/Exit Logic:
  - Long: ta.crossover(fast, slow) -> strategy.entry("Long", strategy.long)
  - Short: ta.crossunder(fast, slow) -> strategy.entry("Short", strategy.short)
  - Exit: strategy.exit("TP/SL", profit=20, loss=10)

Position Management:
  - Uses strategy.entry auto-reversal (needs explicit close+entry in conversion)
  - No partial exits
  - No pyramiding (pyramiding=1)

Multi-Timeframe: None
Alert Conditions: None
Visual-Only Elements: 2 (plot calls -- skipped in conversion)
```
Source: Derived from PINESCRIPT.md conversion checklist and pinescript-conversion.md template source analysis section

### Example 2: Repainting Audit Output
```markdown
## 3. Repainting Audit (SAF-04)

Running 4-point checklist from safety-patterns.md SAF-04:

| Check | Status | Details | Fix Applied |
|-------|--------|---------|-------------|
| request.security() without [1] offset | N/A | No MTF usage found | None needed |
| Conditions on unconfirmed bars | FAIL | Line 15: `if ta.crossover(fast, slow)` -- no barstate.isconfirmed | Applied confirmed-bar default |
| Realtime-only logic (barstate.isrealtime) | PASS | No barstate.isrealtime usage | None needed |
| Fluid values in conditions (high/low/close without [1]) | PASS | Uses EMA values (stable within bar) | None needed |

Overall Repainting Risk: LOW (1 issue found, fixed with confirmed-bar default)

Issue 1: Entry signals on unconfirmed bars
  Line: 15, 18
  Original: if ta.crossover(fast, slow)
  Risk: EMA crossover could appear intra-bar then disappear
  Fix: Converted bot evaluates signals only on confirmed bar close
  Impact: Entries delayed by up to 1 bar -- slightly later but eliminates false signals
```
Source: Derived from safety-patterns.md SAF-04 and pinescript-conversion.md Repainting Audit section

### Example 3: Position Reversal Handling in Converted Bot
```javascript
// PineScript auto-reversal: strategy.entry("Short", strategy.short)
// while holding Long automatically closes Long and opens Short.
// TopStepX requires explicit handling:

async evaluateSignal(barData) {
  if (!this.running || !barData.isConfirmed) return; // Confirmed-bar gate

  const signal = this.checkCrossover(barData);

  if (signal.action === 'sell' && this.currentPosition.side === PositionType.Long) {
    // PineScript auto-reversal equivalent: close Long, then enter Short
    console.log('[Strategy] Reversing: Long -> Short');
    await this.closeCurrentPosition();
    await this.placeOrder(OrderSide.Ask, 1);
  } else if (signal.action === 'buy' && this.currentPosition.side === PositionType.Short) {
    // PineScript auto-reversal equivalent: close Short, then enter Long
    console.log('[Strategy] Reversing: Short -> Long');
    await this.closeCurrentPosition();
    await this.placeOrder(OrderSide.Bid, 1);
  } else if (signal.action === 'buy' && this.currentPosition.size === 0) {
    await this.placeOrder(OrderSide.Bid, 1);
  } else if (signal.action === 'sell' && this.currentPosition.size === 0) {
    await this.placeOrder(OrderSide.Ask, 1);
  }
}
```
Source: Derived from PINESCRIPT.md position reversal documentation and bot-scaffold-js.md evaluateSignal pattern

### Example 4: Bar Data Management (PineScript-specific infrastructure)
```javascript
// PineScript provides bar data implicitly. TopStepX bot must manage its own.
// Two-phase approach: historical warm-up + real-time aggregation.

class BarManager {
  constructor(barIntervalMinutes) {
    this.barIntervalMs = barIntervalMinutes * 60 * 1000;
    this.bars = [];          // Historical + completed bars
    this.currentBar = null;  // In-progress bar (unconfirmed)
  }

  async warmUp(bot, contractId, count, interval) {
    // Phase 1: Fetch historical bars for indicator initialization
    const historicalBars = await bot.fetchHistoricalBars(
      contractId, count, interval, BarTimeUnit.Minute
    );
    this.bars = historicalBars;
  }

  onTick(timestamp, price, volume) {
    const barStart = Math.floor(timestamp / this.barIntervalMs) * this.barIntervalMs;

    if (!this.currentBar || this.currentBar.timestamp !== barStart) {
      // New bar started -- previous bar is now confirmed
      if (this.currentBar) {
        this.currentBar.isConfirmed = true;
        this.bars.push(this.currentBar);
        // Trigger signal evaluation on confirmed bar
        return { newBarConfirmed: true, bar: this.currentBar };
      }
      this.currentBar = {
        timestamp: barStart,
        open: price, high: price, low: price, close: price,
        volume: volume, isConfirmed: false
      };
    } else {
      // Update current bar
      this.currentBar.high = Math.max(this.currentBar.high, price);
      this.currentBar.low = Math.min(this.currentBar.low, price);
      this.currentBar.close = price;
      this.currentBar.volume += volume;
    }
    return { newBarConfirmed: false };
  }
}
```
Source: Derived from PINESCRIPT.md execution model documentation and TOPSTEPX_API.md /api/History/retrieveBars endpoint

### Example 5: Safety Verification Step (extends adapt-language pattern with SAF-04)
```markdown
## 10. Safety Verification

**MANDATORY -- conversion is BLOCKED until ALL checks pass.**

This step runs ALL safety checks from adapt-language Step 7 PLUS SAF-04:

[All SAF-01, SAF-02, SAF-03, SAF-05 grep commands from adapt-language.md Step 7]

PLUS PineScript-specific SAF-04 verification:

| Safety Pattern | Grep Command | Expected |
|----------------|-------------|----------|
| SAF-04: Confirmed bar gate | `grep -c "isConfirmed\|is_confirmed\|bar.*confirmed" [target_files]` | >= 1 |
| SAF-04: No raw close/high/low | `grep -n "close[^[].*>\|high[^[].*>\|low[^[].*>" [target_files]` | Review context -- should reference bar history, not raw values |

Note: SAF-04 verification in the safety step confirms the CONVERTED BOT implements
confirmed-bar logic. The repainting audit in Step 3 checks the SOURCE PineScript.
Both are required.
```
Source: Derived from adapt-language.md Step 7 pattern extended with SAF-04

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual PineScript to bot rewrite | Structured workflow with step-by-step mapping + safety gates | This phase | Systematic conversion with repainting audit eliminates the most dangerous failure mode |
| Post-hoc repainting check | Pre-conversion SAF-04 audit as mandatory gate | Phase 1 (SAF-04 definition), this phase (enforcement) | Repainting issues caught and fixed BEFORE code generation, not after deployment |
| Hardcoded bar-close assumption | Explicit signal confirmation decision step with user opt-in for tick-based | This phase | Users choose their execution model with full awareness of tradeoffs |
| PineScript v4/v5 only | v4/v5/v6 support with `request.security_lower_tf()` awareness | PineScript v6 release (mid-2024) | v6's dynamic `request.security()` and `request.security_lower_tf()` require updated audit logic |

**Existing assets this workflow connects:**
- PINESCRIPT.md (Phase 1) -- 526 lines of PineScript reference with conversion mappings
- pinescript-conversion.md template (Phase 2, TPL-06) -- complete report structure
- safety-patterns.md SAF-04 (Phase 1) -- 4-point repainting checklist
- bot-scaffold-js.md (Phase 2) -- 578-line JS scaffold with all SAF patterns
- bot-scaffold-python.md (Phase 2) -- 559-line Python scaffold with all SAF patterns
- adapt-language.md (Phase 6) -- 654-line sister workflow with safety verification gate

## Open Questions

1. **Step count and granularity**
   - What we know: adapt-language has 8 steps. PineScript conversion needs more steps due to repainting audit, MTF audit, and signal confirmation decision.
   - What's unclear: Whether repainting audit + MTF audit + signal confirmation should be 3 separate steps or combined into 1-2 steps
   - Recommendation: Keep them as separate steps (Steps 3, 4, 5) for clarity and because each has distinct gate behavior. 10-11 steps is acceptable -- new-project.md has 9 steps and is 1,307 lines.

2. **Language profile duplication vs reference**
   - What we know: adapt-language.md has inline language profiles. adapt-pinescript.md needs the same profiles for target code generation.
   - What's unclear: Should adapt-pinescript duplicate the language profiles inline, or reference adapt-language.md's profiles?
   - Recommendation: Include a minimal inline version (just the properties needed for code generation: indicator library, naming convention, enum style, bot scaffold reference) and reference adapt-language.md for the full profiles. This avoids duplication while keeping the workflow self-contained for the executor.

3. **PineScript version handling (v4 vs v5 vs v6)**
   - What we know: PINESCRIPT.md documents v6. v4 uses `security()` instead of `request.security()`. v5 was a transition.
   - What's unclear: How much effort to invest in v4/v5 backward compatibility
   - Recommendation: Detect version from `//@version=N` declaration. For v4: map `security()` to `request.security()` mentally during analysis. For v5: minimal differences from v6. Focus primarily on v6 but don't reject v4/v5 scripts -- just note version-specific quirks in the conversion report.

4. **Handling complex PineScript patterns**
   - What we know: Simple crossover strategies are well-mapped. Complex patterns (pyramiding, multiple entries, conditional exits, risk rules) add complexity.
   - What's unclear: How to handle PineScript features with no direct TopStepX equivalent (e.g., `strategy.risk.*` rules, `use_bar_magnifier`)
   - Recommendation: Document unsupported features in the conversion report under "Conversion Notes." The workflow should flag them to the user rather than silently dropping them. For `strategy.risk.allow_entry_in`, map to position-side checks in the bot. For `use_bar_magnifier`, document as TradingView-specific with no TopStepX equivalent.

5. **tsx-tools.cjs init support for adapt-pinescript**
   - What we know: adapt-language uses `tsx-tools.cjs init adapt-language` and it works by returning basic project context
   - What's unclear: Whether `adapt-pinescript` needs special init handling
   - Recommendation: Use `tsx-tools.cjs init adapt-pinescript` -- it will return the standard `commit_docs`, `project_exists`, `has_git` JSON. No tsx-tools changes needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (markdown workflow, no executable code) |
| Config file | none |
| Quick run command | `grep -c "SAF-01\|SAF-02\|SAF-03\|SAF-04\|SAF-05\|repainting\|request.security\|barstate.isconfirmed" topstepx/workflows/adapt-pinescript.md` |
| Full suite command | Manual review of workflow structure against gold standard pattern and success criteria |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WKF-08-a | Workflow parses PineScript strategy to extract entry/exit conditions, position management, indicator logic, and risk parameters | manual-only | Verify Step 2 contains all 10 source analysis categories | N/A (new file) |
| WKF-08-b | Workflow maps PineScript concepts to TopStepX API equivalents | manual-only | `grep -c "strategy.entry\|strategy.exit\|strategy.close\|ta\.\|OrderSide\|OrderType" topstepx/workflows/adapt-pinescript.md` >= 6 | N/A (new file) |
| WKF-08-c | Workflow includes signal confirmation decision step with repainting flags, defaulting to confirmed-bar-only | manual-only | `grep -c "barstate.isconfirmed\|confirmed.bar\|signal.confirmation" topstepx/workflows/adapt-pinescript.md` >= 2 | N/A (new file) |
| WKF-08-d | Workflow audits request.security for lookahead bias with [1] offset defaults | manual-only | `grep -c "request.security\|lookahead\|\[1\].*offset" topstepx/workflows/adapt-pinescript.md` >= 3 | N/A (new file) |
| WKF-08-e | Generated bot code includes all safety guardrails as non-optional defaults | manual-only | Verify Step 10 has grep-based SAF-01 through SAF-05 verification commands for both JS and Python targets | N/A (new file) |

**Justification for manual-only:** This phase creates a markdown workflow document, not executable code. Verification is structural review of the document contents.

### Sampling Rate
- **Per task commit:** Visual inspection that workflow follows XML tag structure pattern
- **Per wave merge:** Verify repainting audit step (SAF-04) and safety verification step (SAF-01 through SAF-05) both present
- **Phase gate:** Full review against 5 success criteria from the roadmap

### Wave 0 Gaps
None -- no test infrastructure needed for a markdown workflow document. Verification is structural review.

## Sources

### Primary (HIGH confidence)
- `topstepx/workflows/adapt-language.md` (654 lines) -- Sister workflow pattern with safety verification gate, language profiles, source analysis, and completion pattern
- `topstepx/references/PINESCRIPT.md` (526 lines) -- Complete PineScript v6 reference with conversion mapping tables, TA function mappings, enum crosswalks, repainting detection guide
- `topstepx/templates/pinescript-conversion.md` (244 lines) -- Complete conversion report template defining source analysis, repainting audit, MTF audit, conversion mapping, bar close policy, safety integration
- `topstepx/references/safety-patterns.md` (481 lines) -- All 5 SAF patterns; SAF-04 specifically defines 4-point PineScript repainting checklist
- `topstepx/templates/bot-scaffold-js.md` (578 lines) -- JavaScript bot scaffold with SAF-01 through SAF-05
- `topstepx/templates/bot-scaffold-python.md` (559 lines) -- Python bot scaffold with SAF-01 through SAF-05
- `topstepx/workflows/new-project.md` (1,307 lines) -- Gold standard workflow XML tag structure

### Secondary (MEDIUM confidence)
- [TradingView Pine Script v6 Docs - Other Timeframes and Data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/) -- `request.security()` and `request.security_lower_tf()` documentation, lookahead parameter behavior
- [TradingView Pine Script Docs - Repainting](https://www.tradingview.com/pine-script-docs/concepts/repainting/) -- Official repainting documentation confirming the 4 patterns in SAF-04
- [TradingView Pine Script Docs - Strategies](https://www.tradingview.com/pine-script-docs/concepts/strategies/) -- `strategy.entry()` auto-reversal behavior, `strategy.exit()` bracket parameters
- [PineCoders - How to avoid repainting when using security()](https://www.tradingview.com/script/cyPWY96u-How-to-avoid-repainting-when-using-security-PineCoders-FAQ/) -- Community best practices confirming `[1]` offset + `lookahead_on` pattern
- [PineGen AI Handles Repainting and Look-Ahead Bias](https://medium.com/@rangatechnologies/how-pinegen-ai-handles-repainting-and-look-ahead-bias-at-the-code-level-3f49620e358d) -- Automated repainting detection patterns used in AI-generated PineScript

### Tertiary (LOW confidence)
- None -- all findings are based on project-internal assets (PRIMARY) and official TradingView documentation (SECONDARY)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All referenced assets exist in the project and have been read; patterns established in Phases 1-6
- Architecture: HIGH -- Workflow XML structure is proven across all TSX workflows; PineScript-specific steps (repainting audit, MTF audit, signal confirmation) are well-defined by SAF-04 and PINESCRIPT.md
- Pitfalls: HIGH -- Position reversal handling and repainting detection are thoroughly documented in PINESCRIPT.md; bar data management gap is a known conversion challenge documented in the execution model section
- Conversion mappings: HIGH -- All mapping tables come directly from PINESCRIPT.md which was created in Phase 1 from official TradingView documentation

**Research date:** 2026-03-12
**Valid until:** Indefinite (all sources are project-internal assets or stable TradingView documentation; PineScript v6 is the current stable version)
