# PineScript Conversion Report Template

Template for PineScript conversion report documents. Captures the analysis, audit, and mapping needed to convert a TradingView PineScript strategy into a TopStepX trading bot.

**Purpose:** Ensure safe, accurate conversion by auditing for repainting, mapping PineScript constructs to TopStepX equivalents, and documenting all conversion decisions. References SAF-04 from safety-patterns.md.

<template>

```markdown
# PineScript Conversion Report

**Strategy Name:** [name]
**Created:** [YYYY-MM-DD]
**PineScript Version:** [v4 / v5 / v6]
**Conversion Target:** [JavaScript / Python]

## Source Analysis

| Property | Value |
|----------|-------|
| PineScript Version | [v4 / v5 / v6] |
| Strategy Type | [trend-following / mean-reversion / breakout / scalping] |
| Lines of Code | [approximate] |
| Complexity | [Simple / Moderate / Complex] |

### Indicators Used

| Indicator | PineScript Function | Parameters | Purpose |
|-----------|---------------------|------------|---------|
| [name] | [e.g., ta.ema(close, 9)] | [params] | [what it does in the strategy] |
| [name] | [e.g., ta.rsi(close, 14)] | [params] | [what it does in the strategy] |
| [name] | [e.g., ta.crossover(fast, slow)] | [params] | [signal detection] |

### Entry/Exit Logic Summary

**Long Entry:** [plain English description of long entry conditions from PineScript]
**Long Exit:** [plain English description of long exit conditions]
**Short Entry:** [plain English description of short entry conditions]
**Short Exit:** [plain English description of short exit conditions]

## Repainting Audit (SAF-04)

**Overall Repainting Risk:** [NONE / LOW / MEDIUM / HIGH / CRITICAL]

| Check | Status | Details | Mitigation Applied |
|-------|--------|---------|-------------------|
| `request.security()` without `[1]` offset | [PASS / FAIL / N/A] | [description] | [what was fixed] |
| Conditions on unconfirmed bars | [PASS / FAIL / N/A] | [description] | [what was fixed] |
| Realtime-only logic (`barstate.isrealtime`) | [PASS / FAIL / N/A] | [description] | [what was fixed] |
| Fluid values in conditions (high, low, close intra-bar) | [PASS / FAIL / N/A] | [description] | [what was fixed] |

### Repainting Issues Found

[If NONE: "No repainting issues detected. Strategy uses confirmed-bar signals only."]

**Issue 1: [description]**
- **Line(s):** [PineScript line numbers]
- **Original code:** `[the repainting code]`
- **Risk:** [what would happen in live trading]
- **Fix applied:** `[the safe replacement code]`
- **Impact on strategy:** [how the fix changes behavior, if at all]

**Issue 2: [description]**
- [same structure]

## Multi-Timeframe Audit

**Uses `request.security()`:** [Yes / No]

[If Yes:]

| Call | Timeframe | Data | Lookahead | Offset | Safe? |
|------|-----------|------|-----------|--------|-------|
| [line ref] | [e.g., "D"] | [e.g., close] | [on/off/default] | [e.g., [1]] | [Yes/No] |

**Lookahead bias check:** [description of whether MTF data is properly delayed]

**Fix applied:** [description of offset/lookahead corrections, or "No MTF usage"]

## Conversion Mapping

| PineScript Construct | TopStepX Equivalent | Notes |
|----------------------|---------------------|-------|
| `ta.ema(close, N)` | Manual EMA calculation or library | Calculate from bar history |
| `ta.rsi(close, N)` | Manual RSI calculation or library | Wilder's RSI smoothing |
| `ta.crossover(a, b)` | `a > b && prevA <= prevB` | Check current vs previous bar |
| `ta.crossunder(a, b)` | `a < b && prevA >= prevB` | Check current vs previous bar |
| `strategy.entry("Long", strategy.long)` | `createOrder(OrderSide.Bid, size, ...)` | With bracket orders (SAF-01) |
| `strategy.entry("Short", strategy.short)` | `createOrder(OrderSide.Ask, size, ...)` | With bracket orders (SAF-01) |
| `strategy.close("Long")` | Close position via opposite order or cancel | Flatten long position |
| `strategy.exit("SL/TP", stop=..., limit=...)` | `stopLossBracket` + `takeProfitBracket` | Bracket order defaults |
| `barstate.isconfirmed` | Bar completion detection | Check bar timestamp boundaries |
| `request.security(sym, tf, expr)` | Separate bar history fetch + calculation | Via `/api/History/retrieveBars` |
| `input.int(defval, title)` | Config object property | Strategy configuration |
| `plot()`, `bgcolor()`, `hline()` | Not applicable | Visual-only, skip in conversion |
| [additional mappings] | [equivalent] | [notes] |

## Bar Close Policy

**Execution Model:** [Confirmed-bar (default) / Tick-based (user opted in)]

**Rationale:** [Why this model was chosen]

[If confirmed-bar:]
- Signals are evaluated only when the current bar closes
- Entry orders are placed at the open of the next bar
- This eliminates repainting risk at the cost of slightly later entries

[If tick-based:]
- User explicitly acknowledged repainting risk
- Signals are evaluated on each tick/quote update
- Additional safeguards: [list any additional checks added]

## Safety Integration

| Safety Pattern | Applied | How |
|----------------|---------|-----|
| SAF-01: Enum Constants | [Yes] | [All order fields use named constants] |
| SAF-02: Token Refresh | [Yes] | [TokenManager with 23hr proactive refresh] |
| SAF-03: Rate Limiting | [Yes] | [RateLimiter for all API calls] |
| SAF-04: Repainting Audit | [Yes] | [This audit document + code fixes] |
| SAF-05: Error Handling | [Yes] | [placeOrderSafe with 429/rejection/connection handling] |

## Generated Files

| File | Purpose | Based On |
|------|---------|----------|
| [filename] | [Main bot code] | [bot-scaffold-js.md or bot-scaffold-python.md] |
| [filename] | [Strategy configuration] | [risk-parameters.md values] |
| [filename] | [Indicator library] | [Custom indicator calculations] |

## Conversion Confidence

| Aspect | Confidence | Notes |
|--------|------------|-------|
| Indicator accuracy | [HIGH/MEDIUM/LOW] | [e.g., "Standard indicators, well-tested formulas"] |
| Signal fidelity | [HIGH/MEDIUM/LOW] | [e.g., "Logic directly mapped, no ambiguity"] |
| Safety compliance | [HIGH] | [All SAF patterns applied] |
| Edge case handling | [HIGH/MEDIUM/LOW] | [e.g., "Need to test with market gaps"] |

---
*Conversion report created: [date]*
*Ready for implementation: [yes/no]*
```

</template>

<guidelines>

**Source analysis:**
- List every indicator and its exact PineScript function call
- Describe entry/exit logic in plain English before mapping
- Note the PineScript version -- v4 and v5 have different syntax

**Repainting audit (SAF-04):**
- This is the MOST CRITICAL section of the conversion report
- All four checks from safety-patterns.md SAF-04 must be run
- Any FAIL must have a documented fix and impact assessment
- Default to confirmed-bar signals if any repainting risk exists
- Never skip this section -- repainting strategies lose real money

**Conversion mapping:**
- Map every PineScript construct to its TopStepX equivalent
- Visual-only constructs (plot, bgcolor, hline) are explicitly skipped
- strategy.entry/exit map to createOrder with bracket defaults
- barstate.isconfirmed maps to bar completion detection logic

**Bar close policy:**
- Default is confirmed-bar execution
- Tick-based only if user explicitly opts in AND acknowledges risk
- Document the rationale for whichever model is chosen

**Safety integration:**
- All five SAF patterns must be applied -- this is a checklist
- The converted bot should use the bot scaffold template as its base
- Safety code is never optional, never modified

</guidelines>

<example>

```markdown
# PineScript Conversion Report

**Strategy Name:** RSI Overbought/Oversold
**Created:** 2025-03-15
**PineScript Version:** v5
**Conversion Target:** JavaScript

## Source Analysis

| Property | Value |
|----------|-------|
| PineScript Version | v5 |
| Strategy Type | Mean-reversion |
| Lines of Code | 45 |
| Complexity | Simple |

### Indicators Used

| Indicator | PineScript Function | Parameters | Purpose |
|-----------|---------------------|------------|---------|
| RSI | ta.rsi(close, 14) | period=14 | Overbought/oversold detection |

### Entry/Exit Logic Summary

**Long Entry:** RSI crosses below 30 (oversold) on confirmed bar
**Long Exit:** RSI crosses above 70 or stop-loss/take-profit hit
**Short Entry:** RSI crosses above 70 (overbought) on confirmed bar
**Short Exit:** RSI crosses below 30 or stop-loss/take-profit hit

## Repainting Audit (SAF-04)

**Overall Repainting Risk:** LOW (one issue found and fixed)

| Check | Status | Details | Mitigation Applied |
|-------|--------|---------|-------------------|
| `request.security()` without `[1]` offset | N/A | No MTF usage | None needed |
| Conditions on unconfirmed bars | FAIL | Original used `ta.crossunder(rsi, 30)` without bar confirmation | Added `barstate.isconfirmed` check |
| Realtime-only logic | PASS | No barstate.isrealtime usage | None needed |
| Fluid values in conditions | PASS | RSI calculated on close only | None needed |

### Repainting Issues Found

**Issue 1: Entry signals on unconfirmed bars**
- **Line(s):** 12, 18
- **Original code:** `if ta.crossunder(rsi, 30)` / `if ta.crossover(rsi, 70)`
- **Risk:** RSI could cross threshold intra-bar then reverse, generating phantom signals
- **Fix applied:** Added `and barstate.isconfirmed` to both conditions
- **Impact on strategy:** Entries delayed to bar close -- slightly later but eliminates false signals

## Bar Close Policy

**Execution Model:** Confirmed-bar (default)

**Rationale:** RSI values change intra-bar. Confirmed-bar ensures the RSI cross is real, not a temporary intra-bar fluctuation. Mean-reversion strategies are especially susceptible to intra-bar noise.

---
*Conversion report created: 2025-03-15*
*Ready for implementation: yes*
```

</example>
