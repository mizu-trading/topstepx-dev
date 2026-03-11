# Strategy Specification Template

Template for strategy specification documents produced during `/tsx:new-project` questioning. Captures the complete trading strategy in a structured format that downstream agents (tsx-planner, tsx-executor) can implement directly.

**Purpose:** Transform the user's trading idea into a precise, implementable specification with indicators, entry/exit rules, and risk parameters.

<template>

```markdown
# Strategy Specification

**Strategy Name:** [name]
**Created:** [YYYY-MM-DD]
**Status:** [Draft | Reviewed | Approved]

## Overview

| Property | Value |
|----------|-------|
| Strategy Type | [trend-following / mean-reversion / breakout / scalping / range-bound] |
| Instrument(s) | [e.g., ES, NQ, MES, CL] |
| Timeframe(s) | [e.g., 5m, 15m, 1h] |
| Market Hours | [RTH only / ETH / 24hr] |
| Execution Model | [bar-close (default) / tick-based] |
| Signal Source | [indicator-based / price-action / volume / multi-timeframe] |

## Indicators

| Indicator | Parameters | Purpose | Timeframe |
|-----------|------------|---------|-----------|
| [indicator name] | [param1=value, param2=value] | [what it measures] | [timeframe] |
| [indicator name] | [param1=value, param2=value] | [what it measures] | [timeframe] |
| [indicator name] | [param1=value, param2=value] | [what it measures] | [timeframe] |

## Entry Conditions

### Long Entry

All conditions must be true simultaneously (AND logic):

1. [Condition 1: e.g., "9 EMA crosses above 21 EMA"]
2. [Condition 2: e.g., "RSI(14) > 50"]
3. [Condition 3: e.g., "Bar is confirmed (barstate.isconfirmed)"]

**Order type:** [Market / Limit at [price level] / Stop at [price level]]

### Short Entry

All conditions must be true simultaneously (AND logic):

1. [Condition 1: e.g., "9 EMA crosses below 21 EMA"]
2. [Condition 2: e.g., "RSI(14) < 50"]
3. [Condition 3: e.g., "Bar is confirmed (barstate.isconfirmed)"]

**Order type:** [Market / Limit at [price level] / Stop at [price level]]

## Exit Conditions

### Stop Loss

- **Type:** [Fixed ticks / ATR-based / Structure-based]
- **Value:** [e.g., 20 ticks, 2x ATR(14), below swing low]
- **Order type:** [Bracket stop (default) / Trailing stop]

### Take Profit

- **Type:** [Fixed ticks / R:R ratio / Target level]
- **Value:** [e.g., 40 ticks, 2:1 R:R, at resistance]
- **Order type:** [Bracket limit (default)]

### Trailing Stop

- **Enabled:** [Yes / No]
- **Type:** [Fixed distance / ATR-based / Breakeven + trail]
- **Value:** [e.g., 15 ticks trailing, 1.5x ATR]
- **Activation:** [e.g., "After 20 ticks profit"]

### Time-Based Exit

- **Enabled:** [Yes / No]
- **Rule:** [e.g., "Flatten at 15:55 CT", "Max 30 bars in trade"]

### Signal Exit

- **Enabled:** [Yes / No]
- **Rule:** [e.g., "Exit long on bearish EMA crossover"]

## Risk Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Max Position Size | [contracts] | [e.g., "1 for evaluation, scale to 3 for funded"] |
| Max Daily Loss | [$amount] | [e.g., "Account daily limit minus 20% buffer"] |
| Max Drawdown | [$amount or %] | [e.g., "Account trailing drawdown minus 20% buffer"] |
| Risk Per Trade | [$amount or %] | [e.g., "$200 or 1% of balance"] |
| Max Concurrent Positions | [number] | [e.g., "1"] |
| Bracket Orders Required | [Yes (default)] | [Non-negotiable for safety] |
| Kill Switch Conditions | [list] | [e.g., "Max daily loss hit, 3 consecutive losers, connection drop"] |

## Source

| Property | Value |
|----------|-------|
| Origin | [Original idea / PineScript conversion / Adapted from existing code] |
| Reference | [PineScript code URL / strategy description / "user-described"] |
| Repainting Status | [Not applicable / Audited-safe / Needs audit] |
| Backtested | [Yes with results / No / Unknown] |

## Implementation Notes

[Any additional context for the implementing agent: special handling, edge cases, user preferences]

---
*Strategy spec created: [date]*
*Reviewed by user: [yes/no]*
```

</template>

<guidelines>

**Filling this template:**
- Every field should have a concrete value, not a placeholder
- Entry/exit conditions must be specific enough to code directly
- Indicator parameters must include exact values (period=14, not "short period")
- Risk parameters MUST be filled -- use conservative defaults from safety-patterns.md if user doesn't specify
- Execution model defaults to bar-close unless user explicitly requests tick-based
- Bracket orders are always required -- this is not optional

**Indicators section:**
- List every indicator the strategy uses
- Include exact parameter values
- Note which timeframe each indicator applies to
- If multi-timeframe, list each timeframe's indicators separately

**Entry/exit conditions:**
- Use AND logic by default (all conditions must be true)
- If OR logic needed, explicitly state it
- Always include bar confirmation for bar-close strategies
- Be specific: "9 EMA crosses above 21 EMA" not "moving average crossover"

**Risk parameters:**
- Always fill these -- never leave blank
- Default to conservative values from safety-patterns.md
- Account for TopStepX evaluation account rules
- Kill switch conditions are mandatory

**Source section:**
- Critical for PineScript conversions -- repainting audit required
- Links back to questioning.md categories
- Helps tsx-executor understand the strategy's origin

**Integration with downstream agents:**
- tsx-planner reads this to create implementation tasks
- tsx-executor reads this to write the actual bot code
- Ambiguity here = bugs in production

</guidelines>

<example>

```markdown
# Strategy Specification

**Strategy Name:** EMA Crossover ES Futures
**Created:** 2025-03-15
**Status:** Approved

## Overview

| Property | Value |
|----------|-------|
| Strategy Type | Trend-following |
| Instrument(s) | ES (E-mini S&P 500 Futures) |
| Timeframe(s) | 5m |
| Market Hours | RTH only (9:30 AM - 4:00 PM ET) |
| Execution Model | Bar-close |
| Signal Source | Indicator-based |

## Indicators

| Indicator | Parameters | Purpose | Timeframe |
|-----------|------------|---------|-----------|
| EMA | period=9 | Fast moving average for crossover signal | 5m |
| EMA | period=21 | Slow moving average for crossover signal | 5m |
| RSI | period=14 | Momentum filter to avoid counter-trend entries | 5m |

## Entry Conditions

### Long Entry

All conditions must be true simultaneously (AND logic):

1. 9 EMA crosses above 21 EMA (current bar)
2. RSI(14) > 50
3. Bar is confirmed (barstate.isconfirmed)

**Order type:** Market

### Short Entry

All conditions must be true simultaneously (AND logic):

1. 9 EMA crosses below 21 EMA (current bar)
2. RSI(14) < 50
3. Bar is confirmed (barstate.isconfirmed)

**Order type:** Market

## Exit Conditions

### Stop Loss

- **Type:** Fixed ticks
- **Value:** 20 ticks (5 points on ES)
- **Order type:** Bracket stop (default)

### Take Profit

- **Type:** Fixed ticks (2:1 R:R)
- **Value:** 40 ticks (10 points on ES)
- **Order type:** Bracket limit (default)

### Trailing Stop

- **Enabled:** No

### Time-Based Exit

- **Enabled:** Yes
- **Rule:** Flatten all positions at 15:55 ET (5 minutes before RTH close)

### Signal Exit

- **Enabled:** Yes
- **Rule:** Exit long on bearish EMA crossover (9 EMA crosses below 21 EMA). Exit short on bullish EMA crossover.

## Risk Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Max Position Size | 1 contract | Evaluation account limit |
| Max Daily Loss | $1,500 | Account $2,000 daily limit minus 25% buffer |
| Max Drawdown | $2,400 | Account $3,000 trailing drawdown minus 20% buffer |
| Risk Per Trade | $250 | 20 tick stop = $250 per contract on ES |
| Max Concurrent Positions | 1 | Single position at a time |
| Bracket Orders Required | Yes | Non-negotiable |
| Kill Switch Conditions | Max daily loss hit, 3 consecutive losing trades, WebSocket disconnection > 30s |

## Source

| Property | Value |
|----------|-------|
| Origin | Original idea |
| Reference | User-described during /tsx:new-project questioning |
| Repainting Status | Not applicable (original, not PineScript conversion) |
| Backtested | No |

## Implementation Notes

- User prefers simple, clean implementation over optimization
- No scaling in/out -- single entry, single exit
- RSI filter is a soft filter -- user may want to test without it later

---
*Strategy spec created: 2025-03-15*
*Reviewed by user: yes*
```

</example>
