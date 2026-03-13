<purpose>
Convert a TradingView PineScript strategy into a live-tradeable TopStepX trading bot with mandatory repainting audit (SAF-04), multi-timeframe lookahead bias audit, signal confirmation decision, and full safety guardrails (SAF-01 through SAF-05). Handles the paradigm shift from PineScript's declarative bar-by-bar execution to TopStepX's imperative REST/WebSocket API, including bar data infrastructure and explicit position reversal logic that PineScript provides implicitly.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<auto_mode>
## Auto Mode Detection

Check if `--auto` flag is present in $ARGUMENTS.

**If auto mode:**
- REQUIRES: PineScript source file path and target language as arguments
- If either missing, error:

```
Error: --auto requires PineScript source path and target language.

Usage:
  /tsx:adapt-pinescript --auto ./strategy.pine javascript
  /tsx:adapt-pinescript --auto ./my-strategy.pine python
  /tsx:adapt-pinescript --auto ./strategies/ javascript

Supported languages: javascript, python
```

**Auto-mode behavior per step:**
- Step 1 (Setup): Parse source path and target language from arguments -- never skipped
- Step 2 (Source Analysis): Runs fully -- never skipped
- Step 3 (Repainting Audit): Runs fully -- MANDATORY, never skipped; auto-applies safe defaults for any repainting issues
- Step 4 (MTF Audit): Runs fully -- MANDATORY, never skipped; auto-applies `[1]` offset defaults
- Step 5 (Signal Confirmation): Auto-selects confirmed-bar mode (default), logs the choice
- Step 6 (Target Language): Auto-select from arguments
- Step 7 (Conversion Mapping): Skip confirmation, log mapping table
- Step 8 (Conversion Report): Write report, log path, proceed without review
- Step 9 (Code Generation): Runs fully -- never skipped
- Step 10 (Safety Verification): Runs fully -- MANDATORY, never skipped
- Step 11 (Completion): Display summary
</auto_mode>

<pinescript_mapping>
## PineScript Mapping Reference

Full mapping tables are in `@topstepx/references/PINESCRIPT.md`. This section summarizes the categories for workflow step reference during Steps 2, 7, and 9.

### Strategy Functions

| PineScript | TopStepX API | Notes |
|------------|-------------|-------|
| `strategy.entry("id", strategy.long)` | `POST /api/Order/place` with `side: OrderSide.Bid, type: OrderType.Market` | See Position Reversal below |
| `strategy.entry("id", strategy.short)` | `POST /api/Order/place` with `side: OrderSide.Ask, type: OrderType.Market` | See Position Reversal below |
| `strategy.exit(..., profit=N)` | `takeProfitBracket: { ticks: N, type: OrderType.Limit }` | Bracket parameter on entry order |
| `strategy.exit(..., loss=N)` | `stopLossBracket: { ticks: N, type: OrderType.Limit }` | Bracket parameter on entry order |
| `strategy.exit(..., trail_points=N)` | `POST /api/Order/place` with `type: OrderType.TrailingStop` | Separate trailing stop order |
| `strategy.close("id")` | `POST /api/Position/closeContract` | Close specific entry |
| `strategy.close_all()` | Close each open position via `/api/Position/closeContract` | Loop all positions |
| `strategy.cancel("id")` | `POST /api/Order/cancel` with `orderId` | Cancel pending order |

### TA Functions

Reference `@topstepx/references/PINESCRIPT.md` TA Function Conversion Mapping table. Key examples:

| PineScript | JS (trading-signals) | Python (pandas-ta) |
|------------|---------------------|-------------------|
| `ta.sma(src, len)` | `new SMA(len)` | `ta.sma(series, length=len)` |
| `ta.ema(src, len)` | `new EMA(len)` | `ta.ema(series, length=len)` |
| `ta.rsi(src, len)` | `new RSI(len)` | `ta.rsi(series, length=len)` |
| `ta.macd(src, fast, slow, sig)` | `new MACD({fast, slow, signal})` | `ta.macd(series, fast, slow, signal)` |
| `ta.crossover(a, b)` | Manual: `a[i-1] < b[i-1] && a[i] > b[i]` | Manual: comparison |
| `ta.crossunder(a, b)` | Manual: `a[i-1] > b[i-1] && a[i] < b[i]` | Manual: comparison |

### Input to Config Mapping

Every PineScript input MUST become a configurable parameter in the converted bot. Never hardcode input defaults as magic numbers.

| PineScript | Bot Config |
|------------|-----------|
| `input.int(defval, title)` | Config property with integer default value |
| `input.float(defval, title)` | Config property with float default value |
| `input.bool(defval, title)` | Config property with boolean default value |
| `input.string(defval, title, options=[...])` | Config property with enum/options |
| `input.source(close, title)` | Config property referencing bar data field |

### Constructs to SKIP (Visual-Only)

These TradingView display functions have NO trading logic equivalent. Count them during source analysis but skip during conversion:

`plot()`, `plotshape()`, `plotchar()`, `bgcolor()`, `hline()`, `fill()`, `barcolor()`, `plotcandle()`, `plotbar()`, `plotarrow()`, `label.new()`, `line.new()`, `box.new()`, `table.new()`

### Position Reversal Handling (CRITICAL)

PineScript's `strategy.entry()` automatically reverses positions -- entering long while short closes the short AND opens long (total 2x contracts transacted). TopStepX has NO auto-reversal.

The converted bot MUST implement a 2-step operation:
1. **Check current position** -- query position state before any entry
2. **If reversing:** first close the existing position, then open the new position
3. **Handle atomicity:** document the risk of partial fills between close and entry

Missing this creates double-sized positions or combined long+short exposure.
</pinescript_mapping>

<process>

## 1. Setup

**MANDATORY FIRST STEP -- Execute these checks before ANY user interaction:**

```bash
INIT=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" init adapt-pinescript "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `commit_docs`, `project_exists`, `has_git`.

**If `project_exists` is false:** Error -- no project initialized.
```
Error: No project initialized. Run /tsx:new-project first.
```

### Parse Arguments

Extract from $ARGUMENTS:
- **PineScript source path** (required): file path to `.pine` file or directory containing `.pine` files
- **Target language** (required in auto-mode, prompted in interactive mode): `javascript` or `python`
- **`--auto` flag**: skip interactive confirmations

**If auto mode and source path or target language missing:** Display the error message from `<auto_mode>` section and exit.

### Validate Source Path

```bash
if [ ! -e "${SOURCE_PATH}" ]; then
  echo "Error: Source path '${SOURCE_PATH}' does not exist."
  exit 1
fi
```

Check that the source is a `.pine` file or a directory containing `.pine` files:

```bash
if [ -f "${SOURCE_PATH}" ]; then
  if [[ "${SOURCE_PATH}" != *.pine ]]; then
    echo "Warning: File '${SOURCE_PATH}' does not have .pine extension. Proceeding with PineScript analysis."
  fi
elif [ -d "${SOURCE_PATH}" ]; then
  PINE_COUNT=$(find "${SOURCE_PATH}" -type f -name "*.pine" 2>/dev/null | wc -l)
  if [ "$PINE_COUNT" -eq 0 ]; then
    echo "Error: No .pine files found in directory '${SOURCE_PATH}'."
    exit 1
  fi
fi
```

### Detect PineScript Version

Scan the source file for the version declaration:

```bash
VERSION=$(grep -oP '//\s*@version=\K\d+' "${SOURCE_PATH}" | head -1)
```

- If `//@version=6`: current version, use v6 syntax references
- If `//@version=5`: minor differences from v6, note in conversion report
- If `//@version=4`: note that `security()` maps to v5/v6 `request.security()` for audit purposes. The repainting audit uses `request.security()` terminology but scans for both `security()` and `request.security()`.
- If no version declaration found: default to v5 behavior, log warning:

```
Warning: No //@version=N declaration found in source. Defaulting to v5 behavior.
```

Store the detected version for use in Steps 2-4.

## 2. PineScript Source Analysis

**Parse the PineScript strategy source into 10 structured categories.**

This step runs in BOTH interactive and auto mode -- it is never skipped.

### Read Source Files

Read every `.pine` file in the source path. Build a file inventory:

| File | Lines | Version |
|------|-------|---------|
| [filename] | [count] | [//@version=N] |

### Extract 10 Categories

Analyze the source code for each category. Record findings with line references:

**1. Strategy Declaration**
- Version (`//@version=N`)
- Strategy name from `strategy("name", ...)`
- Parameters: `pyramiding`, `margin_long`, `margin_short`, `fill_orders_on_standard_ohlc`, `default_qty_type`, `default_qty_value`, `use_bar_magnifier`

**2. Inputs**
- All `input.int()`, `input.float()`, `input.bool()`, `input.string()`, `input.source()` calls
- For each: variable name, type, default value, title, options (if applicable)
- These become bot config parameters in Step 9

**3. Indicators**
- All `ta.*` function calls with their parameters
- For each: function name, source, length/parameters, variable assignment

**4. Entry Conditions**
- All `strategy.entry()` calls
- For each: entry ID, direction (`strategy.long` / `strategy.short`), order type (market/limit/stop), quantity, condition expression

**5. Exit Conditions**
- All `strategy.exit()` calls with profit/loss/trail parameters
- All `strategy.close()` and `strategy.close_all()` calls
- For each: exit ID, linked entry, bracket values, condition expression

**6. Position Management**
- References to `strategy.position_size`, `strategy.position_avg_price`
- Partial exits via `qty_percent`
- Pyramiding behavior (from strategy declaration)
- Auto-reversal patterns (entering opposite direction while positioned)

**7. Multi-Timeframe**
- All `request.security()` calls (v5/v6) and `security()` calls (v4)
- All `request.security_lower_tf()` calls (v6)
- For each: symbol, timeframe, data expression, lookahead parameter, offset presence

**8. Alert Conditions**
- All `alertcondition()` calls with condition, title, message
- All `alert()` calls
- These become event handlers in the converted bot

**9. Visual-Only Elements**
- Count and list all: `plot()`, `plotshape()`, `plotchar()`, `bgcolor()`, `hline()`, `fill()`, `barcolor()`, `plotcandle()`, `plotbar()`, `plotarrow()`, `label.new()`, `line.new()`, `box.new()`, `table.new()`
- These are SKIPPED in conversion

**10. User-Defined Functions**
- Custom functions defined with `functionName(params) =>`
- For each: name, parameters, return type, body summary
- These need conversion to target language functions

### Output Analysis Summary

Present the structured summary:

```
PineScript Analysis Complete
=============================
Version: [v4 / v5 / v6]
Strategy Name: [name from strategy() declaration]
Strategy Type: [trend-following / mean-reversion / breakout / scalping / other]
Lines: [total line count]

Inputs Found: [count]
  - [varName]: [type], default=[value], title="[title]"
  - ...

Indicators: [count]
  - [ta.function(params)] -> [variable name]
  - ...

Entry/Exit Logic:
  - Long: [condition] -> strategy.entry(...)
  - Short: [condition] -> strategy.entry(...)
  - Exit: strategy.exit(...) with [bracket params]

Position Management:
  - [auto-reversal / partial exits / pyramiding details]

Multi-Timeframe: [count] request.security() calls / None
Alert Conditions: [count] / None
Visual-Only Elements: [count] (skipped in conversion)
User-Defined Functions: [count] / None
```

### Flag Unsupported Features

Document PineScript features with no direct TopStepX equivalent in the conversion report under "Conversion Notes":

- `strategy.risk.*` rules (allow_entry_in, max_drawdown, etc.) -- document as user-side risk management
- `use_bar_magnifier` -- TradingView-specific, no TopStepX equivalent
- `calc_on_every_tick` -- handled by the signal confirmation decision in Step 5
- `process_orders_on_close` -- document behavior difference

### Classify Strategy Type

Determine strategy type from indicator and entry patterns:

- **Trend-following:** Uses moving average crossovers, trend indicators (SuperTrend, ADX)
- **Mean-reversion:** Uses RSI, Bollinger Bands with reversion-to-mean entries
- **Breakout:** Uses highest/lowest, channel breaks, volatility expansion
- **Scalping:** Uses very short periods, multiple entries, tight stops
- **Other:** Complex or hybrid strategies -- describe in conversion report

## 3. Repainting Audit (SAF-04)

**MANDATORY -- This audit BLOCKS code generation. It runs in BOTH interactive and auto mode and is NEVER skipped.**

Run the 4-point repainting checklist from `@topstepx/references/safety-patterns.md` SAF-04 against the PineScript source analyzed in Step 2.

### The 4-Point Checklist

| Check | What It Detects | Scan Pattern |
|-------|----------------|--------------|
| 1. `request.security()` without `[1]` offset | Lookahead bias from higher timeframe data | Scan for `request.security` / `security` calls, check for `[1]` offset AND `lookahead=barmerge.lookahead_on` |
| 2. Conditions on unconfirmed bars | Signals that change intra-bar in realtime | Scan entry/exit conditions for presence of `barstate.isconfirmed` |
| 3. Realtime-only logic | Different behavior on historical vs realtime bars | Scan for `barstate.isrealtime` in conditional blocks containing `strategy.*` calls |
| 4. Fluid values in conditions | high/low/close values changing intra-bar | Scan conditions using `high`, `low`, `close` without `[1]` offset in `strategy.entry` / `strategy.exit` conditionals |

Reference: `@topstepx/references/safety-patterns.md` SAF-04 for complete REPAINTS vs SAFE code examples for each check.

### Run Each Check

**Check 1: request.security() without [1] offset**

For each `request.security()` call found in Step 2 category 7:
- Verify BOTH `[1]` offset on data expression AND `lookahead=barmerge.lookahead_on`
- Both must be present -- using one without the other is still unsafe
- `request.security_lower_tf()` (v6) passes automatically -- handles synchronization correctly
- For v4 scripts: scan for `security()` instead of `request.security()`

```
Check 1 result:
  [PASS] All request.security() calls use [1] offset + lookahead_on
  [FAIL] Line [N]: request.security(sym, "D", close) -- missing [1] offset
  [N/A]  No request.security() calls found
```

**Check 2: Conditions on unconfirmed bars**

Scan all `strategy.entry()` and `strategy.exit()` condition blocks:
- Check if `barstate.isconfirmed` is used as a guard in the condition chain
- If NOT present: the strategy trades on intra-bar values that may change

```
Check 2 result:
  [PASS] All entry/exit conditions include barstate.isconfirmed
  [FAIL] Line [N]: strategy.entry("Long", strategy.long) condition lacks barstate.isconfirmed
```

**Check 3: Realtime-only logic**

Scan for `barstate.isrealtime` in conditionals that contain `strategy.entry`, `strategy.exit`, `strategy.close`:
- If found: strategy behaves differently on historical vs realtime bars (repainting)

```
Check 3 result:
  [PASS] No barstate.isrealtime usage in trading logic
  [FAIL] Line [N]: barstate.isrealtime used in condition for strategy.entry
```

**Check 4: Fluid values in conditions**

Scan `strategy.entry` / `strategy.exit` conditions for `high`, `low`, `close` without `[1]` offset:
- Note: Indicator-wrapped values (e.g., `ta.ema(close, 20)`) are stable within a bar and pass this check
- Raw `close`, `high`, `low` in direct comparisons are fluid and fail

```
Check 4 result:
  [PASS] No fluid values in trading conditions (or all use [1] offset)
  [FAIL] Line [N]: condition uses raw 'close' without [1] offset
```

### Produce Audit Output

```
Repainting Audit (SAF-04) Results
===================================
| Check | Status | Details | Fix Applied |
|-------|--------|---------|-------------|
| request.security() without [1] offset | [PASS/FAIL/N/A] | [description] | [fix or "None needed"] |
| Conditions on unconfirmed bars | [PASS/FAIL/N/A] | [description] | [fix or "None needed"] |
| Realtime-only logic (barstate.isrealtime) | [PASS/FAIL/N/A] | [description] | [fix or "None needed"] |
| Fluid values in conditions | [PASS/FAIL/N/A] | [description] | [fix or "None needed"] |

Overall Repainting Risk: [NONE / LOW / MEDIUM / HIGH / CRITICAL]
```

Risk level assignment:
- **NONE:** All 4 checks pass
- **LOW:** 1 check fails, indicator-based conditions (EMA/RSI crossovers without barstate.isconfirmed)
- **MEDIUM:** 1-2 checks fail, includes raw price comparisons
- **HIGH:** 2-3 checks fail, includes MTF or realtime-only logic
- **CRITICAL:** 3-4 checks fail, strategy heavily relies on intra-bar data

### Gate Behavior

**If ANY check FAILS:**

*Interactive mode:*
Present findings to the user with issue details (line references, original code, recommended fix). Apply the SAFE pattern as default.

Use AskUserQuestion:
- header: "Repainting Issues Found"
- question: "The PineScript source has repainting issues that could produce false signals in live trading. Safe defaults have been applied. How would you like to proceed?"
- options:
  - "Accept safe defaults (recommended)" -- Proceed with confirmed-bar signals and safe patterns applied. Documented in conversion report.
  - "I understand the risks -- keep original behavior" -- Proceed without safe defaults. User acknowledges repainting risk. Prominently documented in conversion report.

*Auto-mode:*
Always apply the safe default. Log the warning:

```
[Auto] Repainting audit: [N] issue(s) found. Safe defaults applied.
  - Check [N]: [description] -> Applied [safe pattern]
```

**If ALL checks PASS:**
Log clean result and proceed:

```
Repainting Audit: CLEAN (all 4 checks passed)
```

## 4. Multi-Timeframe Audit

**Dedicated MTF scan for `request.security()` lookahead bias.**

This step runs in BOTH interactive and auto mode -- it is NEVER skipped.

### Check for MTF Usage

If no `request.security()` / `security()` calls were found in Step 2 category 7:

```
Multi-Timeframe Audit: N/A (no request.security calls)
```

Proceed to Step 5.

### Audit Each Call

For each `request.security()` call found in Step 2:

| Parameter | Expected Safe Value | Issue If Missing |
|-----------|-------------------|------------------|
| `lookahead` | `barmerge.lookahead_on` | Data may be stale (from two bars ago) |
| Expression offset | `[1]` applied to data (e.g., `close[1]`) | Uses current unconfirmed bar data (future data on historical) |
| Both together | BOTH present | Using one without the other is still unsafe |

**v6 consideration:** `request.security_lower_tf()` handles synchronization correctly without requiring `lookahead_on` -- it passes the audit automatically.

### Produce MTF Audit Output

```
Multi-Timeframe Audit Results
===============================
| Call | Timeframe | Data | Lookahead | Offset | Safe? |
|------|-----------|------|-----------|--------|-------|
| Line [N] | [e.g., "D"] | [e.g., close] | [on/off/default] | [e.g., [1]] | [Yes/No] |

MTF Issues Found: [N]
```

### Apply Default Fix

For each failing `request.security()` call:
- Apply `[1]` offset to the data expression (e.g., `close` becomes `close[1]`)
- Ensure `lookahead=barmerge.lookahead_on` is set

In the converted bot, this translates to:
- Fetch bars with `count = N + 1`
- Use `bars[bars.length - 2]` (JS) or `bars[-2]` (Python) instead of the last bar
- This ensures the bot never uses the current incomplete bar's data from a higher timeframe

*Interactive mode:* Present findings and fix plan.
*Auto-mode:* Apply `[1]` offset defaults, log the changes.

## 5. Signal Confirmation Decision

**Execution model selection -- determines how the converted bot evaluates trading signals.**

### Default: Confirmed-Bar-Only Signals

The default is confirmed-bar-only signals. This is the equivalent of `barstate.isconfirmed` in PineScript -- signals are evaluated only when the current bar closes. Entry orders are placed at the open of the NEXT bar.

### Interactive Mode

Use AskUserQuestion:
- header: "Signal Confirmation Mode"
- question: "How should the converted bot evaluate trading signals?"
- options:
  - "Confirmed Bar (recommended)" -- Signals evaluated only when a bar closes. Eliminates repainting risk. Entries execute at the next bar's open. This is safer and matches the behavior of `barstate.isconfirmed` in PineScript.
  - "Tick-Based (advanced)" -- Signals evaluated on each tick/quote. Faster entries but susceptible to repainting. Requires explicit risk acknowledgment.

**If user selects "Tick-Based":**
Display repainting risk warning:

```
WARNING: Tick-based signal evaluation means:
  - Signals may trigger on intra-bar values that change or reverse
  - Backtest results do NOT reflect real-time behavior
  - This is the primary cause of "strategy looked profitable but lost money live"

You are acknowledging this risk. The conversion report will document this choice.
```

Require explicit confirmation before proceeding. Document the choice prominently in the conversion report.

### Auto-Mode

Auto-select confirmed-bar mode. Log the choice:

```
[Auto] Signal confirmation: Confirmed Bar (default)
```

### Record Decision

Store the signal confirmation mode for use in:
- Step 9 (Code Generation): determines whether signal evaluation runs on bar close or every tick
- Step 10 (Safety Verification): SAF-04 confirmed bar gate check

## 6. Target Language Selection

### Interactive Mode

Use AskUserQuestion:
- header: "Target Language"
- question: "Which language should the converted bot use?"
- options:
  - "JavaScript/TypeScript (Node.js)" -- Uses @microsoft/signalr, trading-signals, built-in fetch. Best for developers familiar with Node.js async/await patterns.
  - "Python" -- Uses pysignalr, pandas-ta, aiohttp. Best for developers familiar with Python async and data science tooling.

### Auto-Mode

Use the target language from command arguments. Log the selection:

```
[Auto] Target language: [javascript / python]
```

### Language Profile (Compact)

Load the minimal language profile needed for PineScript conversion code generation. For the complete 11-property profiles, reference `@topstepx/workflows/adapt-language.md`.

**JavaScript/TypeScript (Node.js)**

| Property | Value |
|----------|-------|
| Runtime | Node.js 18+ |
| Indicator Library | `trading-signals` |
| Naming Convention | camelCase (variables/functions), PascalCase (classes) |
| Enum Style | Plain objects (`const OrderSide = { Bid: 0, Ask: 1 }`) |
| SignalR Client | `@microsoft/signalr` (HubConnectionBuilder) |
| HTTP Client | built-in `fetch` |
| Bot Scaffold | `@topstepx/templates/bot-scaffold-js.md` |

**Python**

| Property | Value |
|----------|-------|
| Runtime | Python 3.11+ |
| Indicator Library | `pandas-ta` |
| Naming Convention | snake_case (variables/functions), PascalCase (classes) |
| Enum Style | `IntEnum` classes (`class OrderSide(IntEnum): Bid = 0; Ask = 1`) |
| SignalR Client | `pysignalr` (SignalRClient) |
| HTTP Client | `aiohttp` (ClientSession) |
| Bot Scaffold | `@topstepx/templates/bot-scaffold-python.md` |

## 7. Conversion Mapping

**Map every PineScript construct found in Step 2 to its TopStepX API equivalent using `@topstepx/references/PINESCRIPT.md` mapping tables.**

### Map Strategy Functions

For each `strategy.entry()`, `strategy.exit()`, `strategy.close()`, `strategy.cancel()` found in Step 2 categories 4 and 5:

- Map to TopStepX API call using the `<pinescript_mapping>` Strategy Functions table
- Reference `@topstepx/references/PINESCRIPT.md` for the complete mapping with parameter details
- Flag auto-reversal patterns: any `strategy.entry()` that enters opposite direction while positioned needs explicit close + entry

### Map TA Functions

For each `ta.*` function found in Step 2 category 3:

- Map to target language indicator library:
  - JavaScript: `trading-signals` classes (SMA, EMA, RSI, MACD, BollingerBands, ATR, Stochastic)
  - Python: `pandas-ta` functions (ta.sma, ta.ema, ta.rsi, ta.macd, ta.bbands, ta.atr, ta.stoch)
- Reference `@topstepx/references/PINESCRIPT.md` TA Function Conversion Mapping table
- For `ta.crossover()` / `ta.crossunder()`: generate manual comparison logic (no direct library equivalent)

### Map Inputs to Config

For each `input.*()` found in Step 2 category 2:

- Create a config parameter entry with:
  - Property name: variable name from PineScript
  - Type: int / float / bool / string
  - Default: the `defval` parameter from the PineScript input
  - Description: the `title` parameter from the PineScript input

Every PineScript input MUST become a configurable parameter. No magic numbers.

### Flag Visual-Only Elements

From Step 2 category 9, report the count of visual-only elements that will be SKIPPED:

```
Visual-only elements skipped: [N] (plot: [n], plotshape: [n], bgcolor: [n], ...)
```

### Flag Position Reversal Handling

From Step 2 category 6, document where the converted bot needs explicit close + entry logic instead of PineScript's auto-reversal:

```
Position reversal handling required:
  - Line [N]: strategy.entry("Short", strategy.short) while potentially Long -> needs explicit close + entry
  - Line [N]: strategy.entry("Long", strategy.long) while potentially Short -> needs explicit close + entry
```

### Flag Bar Data Infrastructure

Document that the converted bot MUST generate bar data management infrastructure that PineScript provides implicitly:

```
Bar data infrastructure required:
  - History warm-up: fetch [N] bars via /api/History/retrieveBars for indicator initialization
  - Tick-to-bar aggregation: aggregate real-time ticks/quotes into OHLCV bars
  - Bar completion detection: detect bar boundaries based on time intervals
```

The bar count for warm-up = max indicator lookback period found in Step 2 category 3 (e.g., if the longest indicator uses 200 periods, warm up with 200+ bars).

### Interactive Mode: Confirm Mapping

Use AskUserQuestion:
- header: "Conversion Mapping"
- question: "Review the mapping summary above. Are these mappings correct?"
- options:
  - "Looks good -- proceed" -- Continue with the mapping as shown
  - "I need to adjust some mappings" -- Let me provide corrections

If the user selects "I need to adjust some mappings":
- Ask which PineScript construct needs a different mapping
- Update the mapping table with corrections
- Re-display for confirmation

### Auto-Mode: Skip Confirmation

Log the mapping summary without confirmation:

```
[Auto] Conversion mapping complete:
  Strategy functions: [N] mapped
  TA functions: [N] mapped
  Inputs to config: [N] mapped
  Visual-only skipped: [N]
  Position reversals flagged: [N]
```

## 8. Conversion Report Generation

**Populate the `@topstepx/templates/pinescript-conversion.md` template with data collected in Steps 2-7.**

### Fill Report Sections

Using the pinescript-conversion.md template structure, populate:

**Source Analysis** (from Step 2):
- PineScript version, strategy name, strategy type, lines of code, complexity
- Indicators Used table (indicator name, PineScript function, parameters, purpose)
- Entry/Exit Logic Summary (plain English descriptions)

**Repainting Audit (SAF-04)** (from Step 3):
- Overall Repainting Risk level
- 4-check results table with status, details, mitigation applied
- Repainting Issues Found with line references, original code, fix applied, impact

**Multi-Timeframe Audit** (from Step 4):
- Uses request.security: Yes/No
- Call-by-call audit table (timeframe, data, lookahead, offset, safe)
- Fix applied description

**Conversion Mapping** (from Step 7):
- Complete PineScript construct to TopStepX equivalent table
- Notes for each mapping including caveats

**Bar Close Policy** (from Step 5):
- Execution Model: Confirmed-bar or Tick-based
- Rationale for the chosen model

**Safety Integration** (pending until Step 10):
- All SAF-01 through SAF-05 rows with "Applied: Pending" status
- Will be updated after Step 10 verification

**Conversion Confidence:**
- Indicator accuracy, Signal fidelity, Safety compliance, Edge case handling

### Write the Report

Write the populated report to `.planning/pinescript-conversion.md`.

### Interactive Mode: Offer Review

Present a summary:

```
Conversion Report Generated
============================
Location: .planning/pinescript-conversion.md
Source: [strategy name] (v[version], [N] lines)
Target: [language]
Indicators: [N] mapped
Inputs: [N] -> config params
Repainting Risk: [level]
MTF Issues: [N] / N/A
```

Use AskUserQuestion:
- header: "Conversion Report"
- question: "Review the conversion report summary above. Ready to proceed with code generation?"
- options:
  - "Proceed with code generation" -- Generate target code based on this report
  - "Let me review the full report first" -- Open .planning/pinescript-conversion.md for detailed review

### Auto-Mode: Proceed Without Review

Log the report path and proceed:

```
[Auto] Conversion report written: .planning/pinescript-conversion.md
Proceeding to code generation...
```

### Commit the Report

```bash
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" commit "docs: PineScript conversion report" --files .planning/pinescript-conversion.md
```

## 9. Code Generation

**Generate target code file-by-file using the target language's bot scaffold as the structural base.**

### Load Bot Scaffold

Load the target language's bot scaffold template:
- JavaScript/TypeScript target: `@topstepx/templates/bot-scaffold-js.md`
- Python target: `@topstepx/templates/bot-scaffold-python.md`

The scaffold provides the structural skeleton with all safety infrastructure (SAF-01 through SAF-05) already implemented. The workflow injects PineScript strategy logic translated to target language idioms.

### Conversion Order (MANDATORY -- PineScript-Specific Trading Build Order)

Convert PineScript strategy to target code in this exact 9-step order. This extends the proven trading build order with PineScript-specific additions (steps 6 and 9):

**1. Safety infrastructure first:**
- Enum constant definitions (OrderSide, OrderType, OrderStatus, PositionType, TimeInForce, BarTimeUnit)
- Config object/dictionary from ALL PineScript inputs found in Step 2 category 2 -- every `input.*()` becomes a named, configurable parameter with its PineScript default value. Never hardcode input defaults as magic numbers.
- Risk parameter definitions (max position size, stop loss ticks, take profit ticks, max daily loss)
- Apply target language naming convention (camelCase for JS, snake_case for Python)
- Apply target language enum style (plain objects for JS, IntEnum classes for Python)

**2. Authentication:**
- TokenManager class / token refresh mechanism
- Login flow (`POST /api/Auth/loginKey`)
- Bearer header setup for all API calls
- 23-hour proactive refresh timer (SAF-02)
- Re-authentication fallback on refresh failure

**3. Rate limiting:**
- RateLimiter class with sliding window
- RATE_LIMITS constants (HISTORY: 50/30s, GENERAL: 200/60s)
- Wait-for-slot pattern before every API call (SAF-03)
- Apply target language async pattern

**4. REST API integration:**
- Order placement function with bracket defaults (SAF-01: stopLossBracket, takeProfitBracket)
- Position sizing enforcement via `Math.min` (JS) / `min()` (Python) (SAF-01)
- Safe order placement with 3-mode error handling (SAF-05: 429 retry, rejection logging, connection error catch)
- Account search, contract lookup, position query functions
- History bar retrieval with history rate limiter

**5. WebSocket integration:**
- Market Hub connection with access token factory
- User Hub connection with access token factory
- Event handlers: GatewayQuote, GatewayOrder, GatewayPosition, GatewayTrade
- Subscription calls: SubscribeContractQuotes, SubscribeAccounts, SubscribeOrders, SubscribePositions, SubscribeTrades
- Reconnection handlers with automatic re-subscribe (SAF-05)
- Apply target language SignalR client patterns (HubConnectionBuilder for JS, SignalRClient for Python)

**6. Bar data management (PineScript-specific):**
This infrastructure does NOT exist in PineScript -- the engine provides bar data implicitly. The converted bot MUST create it.

- **History warm-up:** Fetch historical bars via `POST /api/History/retrieveBars` for indicator initialization. Bar count = max indicator lookback period from Step 2.
- **Tick-to-bar aggregation:** Aggregate real-time ticks/quotes from GatewayQuote events into OHLCV bars with configurable interval.
- **Bar completion detection:** Detect bar boundaries based on time intervals. When a new bar starts, the previous bar is confirmed.
- **Bar history buffer:** Maintain a rolling buffer of completed bars for indicator calculations.

Example structure for JavaScript:
```javascript
class BarManager {
  constructor(intervalMinutes) { /* ... */ }
  async warmUp(contractId, count, interval) { /* fetch via /api/History/retrieveBars */ }
  onTick(timestamp, price, volume) { /* aggregate into current bar, detect completion */ }
  getConfirmedBars() { /* return completed bars only */ }
}
```

Example structure for Python:
```python
class BarManager:
    def __init__(self, interval_minutes): ...
    async def warm_up(self, contract_id, count, interval): ...
    def on_tick(self, timestamp, price, volume): ...
    def get_confirmed_bars(self): ...
```

**7. Indicator calculations:**
- Translate each `ta.*` function found in Step 2 to target language indicator library using mapping from Step 7
- JavaScript: instantiate `trading-signals` classes (SMA, EMA, RSI, etc.), feed bar data from BarManager
- Python: call `pandas-ta` functions on DataFrame built from BarManager bar history
- For `ta.crossover()` / `ta.crossunder()`: generate manual comparison logic checking current vs previous values

**8. Signal evaluation:**
- Translate entry/exit conditions from PineScript Step 2 categories 4 and 5
- Apply confirmed-bar gate based on Step 5 decision:
  - Confirmed-bar mode: signal evaluation triggered by BarManager bar completion event
  - Tick-based mode: signal evaluation triggered on each GatewayQuote event
- Generate condition evaluation functions matching the PineScript logic
- Connect signals to order placement functions from step 4

**9. Position management (PineScript-specific):**
PineScript's auto-reversal does NOT exist in TopStepX. The converted bot MUST implement:

- **Explicit reversal logic:** Before entering a position, check current position state. If reversing direction (e.g., entering short while long), first close the existing position, then enter the new one.
- **Partial exit support:** Map `qty_percent` from `strategy.exit()` to `POST /api/Position/partialCloseContract` with calculated size.
- **Position reconciliation:** After order events, reconcile expected vs actual position via `POST /api/Position/searchOpen`. Handle partial fills and slippage.

### Apply Naming Conventions

Use the target language profile's naming convention for ALL generated code:
- **JavaScript/TypeScript:** camelCase for variables/functions, PascalCase for classes
- **Python:** snake_case for variables/functions, PascalCase for classes

### Atomic Commits

Commit each converted file individually as it is generated:

```bash
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" commit "feat: convert [PineScript element] to [target language]" --files [target_file_path]
```

This ensures partial progress is preserved if the conversion is interrupted.

## 10. Safety Verification

**MANDATORY -- Conversion is BLOCKED until ALL safety checks pass.**

This step runs in BOTH interactive and auto mode -- it is NEVER skipped.

### Run Grep-Based Verification

For each safety pattern, run grep verification against ALL generated target files. The grep commands below are self-contained -- execute them directly.

**For JavaScript/TypeScript target:**

| Safety Pattern | Grep Command | Expected |
|----------------|-------------|----------|
| SAF-01: Enum constants | `grep -c "OrderSide\|OrderType\|OrderStatus\|PositionType\|TimeInForce" [target_files]` | >= 5 |
| SAF-01: Bracket defaults | `grep -c "stopLossBracket\|takeProfitBracket" [target_files]` | >= 2 |
| SAF-01: Position sizing | `grep -c "Math.min" [target_files]` | >= 1 |
| SAF-02: JWT refresh | `grep -c "refreshToken\|refreshInterval\|23.*60.*60" [target_files]` | >= 1 |
| SAF-03: Rate limiter | `grep -c "RateLimiter\|RATE_LIMITS\|waitForSlot" [target_files]` | >= 2 |
| SAF-04: Confirmed bar gate | `grep -c "isConfirmed\|bar.*confirmed\|barCompleted" [target_files]` | >= 1 |
| SAF-04: No repainting logic | `grep -c "isConfirmed.*&&\|confirmed.*=.*true" [target_files]` | >= 1 |
| SAF-05: Error handling | `grep -c "placeOrderSafe\|status === 429\|\.catch\|try.*catch" [target_files]` | >= 2 |
| SAF-05: Graceful shutdown | `grep -c "SIGINT\|SIGTERM\|shutdown" [target_files]` | >= 2 |

**For Python target:**

| Safety Pattern | Grep Command | Expected |
|----------------|-------------|----------|
| SAF-01: Enum constants | `grep -c "OrderSide\|OrderType\|OrderStatus\|PositionType\|TimeInForce\|IntEnum" [target_files]` | >= 5 |
| SAF-01: Bracket defaults | `grep -c "stopLossBracket\|takeProfitBracket\|stop_loss\|take_profit" [target_files]` | >= 2 |
| SAF-01: Position sizing | `grep -c "min(" [target_files]` | >= 1 |
| SAF-02: JWT refresh | `grep -c "refresh_token\|refresh_interval\|23.*60.*60" [target_files]` | >= 1 |
| SAF-03: Rate limiter | `grep -c "RateLimiter\|RATE_LIMITS\|wait_for_slot" [target_files]` | >= 2 |
| SAF-04: Confirmed bar gate | `grep -c "is_confirmed\|bar.*confirmed\|bar_completed" [target_files]` | >= 1 |
| SAF-04: No repainting logic | `grep -c "is_confirmed.*and\|confirmed.*=.*True" [target_files]` | >= 1 |
| SAF-05: Error handling | `grep -c "place_order_safe\|status == 429\|except\|try:" [target_files]` | >= 2 |
| SAF-05: Graceful shutdown | `grep -c "SIGINT\|SIGTERM\|shutdown\|signal\." [target_files]` | >= 2 |

### Present Results

Display the verification results as a pass/fail table:

```
Safety Verification Results
============================

| SAF Pattern | Check | Result |
|-------------|-------|--------|
| SAF-01: Enum constants | OrderSide, OrderType, etc. | [PASS/FAIL] |
| SAF-01: Bracket defaults | stopLossBracket, takeProfitBracket | [PASS/FAIL] |
| SAF-01: Position sizing | Math.min / min() | [PASS/FAIL] |
| SAF-02: JWT refresh | refreshToken, 23hr interval | [PASS/FAIL] |
| SAF-03: Rate limiter | RateLimiter, RATE_LIMITS | [PASS/FAIL] |
| SAF-04: Confirmed bar gate | isConfirmed / is_confirmed | [PASS/FAIL] |
| SAF-04: No repainting logic | confirmed gate in signal eval | [PASS/FAIL] |
| SAF-05: Error handling | placeOrderSafe, 429 handling | [PASS/FAIL] |
| SAF-05: Graceful shutdown | SIGINT, SIGTERM, shutdown | [PASS/FAIL] |

Status: [ALL PASSED / N FAILED]
Safety Confidence: [HIGH / BLOCKED]
```

### If ANY Check FAILS

**The conversion is INCOMPLETE. Do NOT proceed to Step 11.**

For each failed check:
1. Display the missing pattern with its SAF-ID
2. Show what the pattern should look like in the target language (reference `@topstepx/references/safety-patterns.md` for the canonical implementation)
3. Identify which target file should contain the pattern

```
SAFETY VERIFICATION FAILED
============================

FAILED: SAF-04 Confirmed bar gate
  Missing: isConfirmed / is_confirmed in target code
  Expected: Signal evaluation must check bar confirmation before acting
  Reference: @topstepx/references/safety-patterns.md -> SAF-04
  Fix in: [target_file_path]
```

**Loop back to Step 9** to fix the safety gap:
- Add the missing safety pattern to the appropriate target file
- Re-commit the fixed file
- Re-run Step 10 safety verification

Repeat until ALL checks PASS. The workflow CANNOT complete with any safety gap.

### If ALL Checks PASS

- Set safety confidence to **HIGH**
- Update the Safety Integration table in `.planning/pinescript-conversion.md`:
  - Set all "Applied" columns to "Yes"
  - Set all "How" columns with specific implementation details
- Update Conversion Confidence -> Safety compliance to **HIGH**
- Commit the updated report:

```bash
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" commit "docs: update conversion report with safety verification results" --files .planning/pinescript-conversion.md
```

- Proceed to Step 11

## 11. Completion Summary

### Display Completion Banner

```
--------------------------------------------------
 TSX > PINESCRIPT CONVERSION COMPLETE
--------------------------------------------------

Source: [PineScript strategy name] (v[version])
Target: [target language]

| Artifact | Location |
|----------|----------|
| Conversion Report | .planning/pinescript-conversion.md |
| Target Code | [list target file paths] |

Repainting Audit: [CLEAN / N issues found, safe defaults applied]
MTF Audit: [CLEAN / N/A / N issues found, [1] offset applied]
Signal Mode: [Confirmed Bar / Tick-Based (acknowledged)]
Safety Verification: ALL PASSED (SAF-01 through SAF-05)
Indicators Converted: [count]
Inputs Mapped to Config: [count]
Visual Elements Skipped: [count]

--------------------------------------------------

Next Steps:

  /tsx:verify-work [phase]   -- Test the converted bot
  /tsx:progress              -- Check project status

--------------------------------------------------
```

### Commit Final State

```bash
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" commit "feat: PineScript conversion complete ([strategy name] -> [target language])" --files .planning/pinescript-conversion.md
```

</process>

<output>

## Generated Artifacts

- `.planning/pinescript-conversion.md` -- Conversion report (populated from `@topstepx/templates/pinescript-conversion.md`)
- Converted target code files (paths documented in conversion report Generated Files table)

</output>

<success_criteria>

- [ ] PineScript source parsed (strategy declaration, inputs, indicators, entries/exits, position management, MTF, alerts extracted)
- [ ] Repainting audit (SAF-04) completed -- issues flagged with safe defaults applied
- [ ] Multi-timeframe audit completed -- request.security() calls checked for lookahead bias
- [ ] Signal confirmation mode decided (confirmed-bar default or user-acknowledged tick-based)
- [ ] Conversion mapping completed (PineScript constructs to TopStepX API calls)
- [ ] Conversion report generated from `@topstepx/templates/pinescript-conversion.md` template -> committed
- [ ] Target code generated in PineScript-specific trading build order (includes bar data management and position reversal handling)
- [ ] Target code uses bot scaffold template as structural base
- [ ] All PineScript inputs mapped to configurable bot parameters (no magic numbers)
- [ ] Safety verification PASSED for ALL SAF-01 through SAF-05 patterns (including SAF-04 confirmed bar gate)
- [ ] All target files committed atomically
- [ ] User knows next step (/tsx:verify-work or /tsx:progress)

</success_criteria>
