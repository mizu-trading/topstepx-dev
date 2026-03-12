# PineScript Reference — For TopStepX Conversion

> This document provides AI agents with the PineScript knowledge needed to convert TradingView strategies into live TopStepX trading bots. Source: [TradingView Pine Script Docs](https://www.tradingview.com/pine-script-docs/welcome/)

---

## Overview

Pine Script is TradingView's domain-specific language for creating custom indicators and trading strategies. Current version: **v6**. It's a declarative, bar-by-bar execution language — fundamentally different from the imperative REST/WebSocket approach of TopStepX.

**Key paradigm difference for conversion:**
- PineScript: Declarative — "enter long when X crosses Y" (engine handles execution)
- TopStepX: Imperative — "call POST /api/Order/place with these parameters" (you handle everything)

---

## Execution Model

Scripts execute **once per bar** on historical data, **once per tick** on realtime data.

### Bar-by-Bar Processing

```pine
//@version=6
indicator("Example", overlay=true)
plot(close, "Close", color.blue, 5)
```

- Runtime updates `open`, `high`, `low`, `close`, `volume` before each execution
- Variables redeclare/reinitialize each bar by default
- `var` keyword persists values across bars
- `varip` keyword persists across ticks (even within same bar)

### Historical vs Realtime

| Behavior | Historical Bars | Realtime Bar |
|----------|----------------|--------------|
| Executions per bar | 1 | Many (per tick) |
| Rollback | No | Yes (reverts to last committed state) |
| `barstate.ishistory` | true | false |
| `barstate.isrealtime` | false | true |
| `barstate.isconfirmed` | true | true only after bar closes |

### History Referencing

```pine
close[1]   // Previous bar's close
close[5]   // 5 bars ago
ta.change(close, 1) / close[1]  // Return calculation
```

**Conversion note:** TopStepX has no built-in time series. Agents must implement their own bar history buffer using `/api/History/retrieveBars` or WebSocket `GatewayTrade` events.

---

## Type System

### Value Types

| Type | Example | Notes |
|------|---------|-------|
| `int` | `bar_index`, `42` | Whole numbers |
| `float` | `close`, `3.14` | 1e-16 precision |
| `bool` | `true`, `false` | Never returns `na`, returns `false` instead |
| `color` | `#FF0000ff`, `color.red` | RGB hex or named |
| `string` | `"text"`, `'text'` | Escape: `\n`, `\t`, `\\` |

### Qualifiers

| Qualifier | When Set | Changes? |
|-----------|----------|----------|
| `const` | Compile time | Never |
| `input` | Input time (Settings tab) | Never at runtime |
| `simple` | First bar | Never after bar 0 |
| `series` | Every bar | Yes, bar-by-bar |

Hierarchy: `const < input < simple < series`

### The `na` Value

Represents "not available." Must specify type when initializing: `float val = na`

```pine
if na(value)
    // Handle missing data
value = na(variable) ? default : variable
```

### Reference Types

`line`, `label`, `box`, `table`, `array<T>`, `matrix<T>`, `map<K,V>` — all automatically `series` qualified.

### Collections

```pine
array<float> prices = array.new<float>()
array.push(prices, close)
float prev = array.get(prices, 0)

map<string, float> levels = map.new<string, float>()
map.put(levels, "support", 4200.0)
```

---

## Script Structure

### Declaration Functions

Every script must call exactly one:

```pine
//@version=6
indicator("Name", overlay=true)        // Indicator
strategy("Name", overlay=true, ...)     // Strategy (backtestable)
library("Name")                         // Reusable library
```

### Strategy Declaration Parameters

```pine
strategy("My Strategy",
    overlay=true,
    margin_long=100,
    margin_short=100,
    pyramiding=1,                       // Max entries in same direction
    use_bar_magnifier=true,             // Lower TF data for precise fills
    fill_orders_on_standard_ohlc=true   // Use real prices on non-standard charts
)
```

---

## Strategy Functions (Critical for Conversion)

### Entry Orders

```pine
strategy.entry("buy", strategy.long)                    // Market entry long
strategy.entry("sell", strategy.short)                   // Market entry short
strategy.entry("buy", strategy.long, limit=4200.0)      // Limit entry
strategy.entry("buy", strategy.long, stop=4300.0)       // Stop entry
strategy.entry("buy", strategy.long, qty=2)             // Sized entry
```

**Conversion mapping:**
| PineScript | TopStepX API |
|------------|-------------|
| `strategy.entry("id", strategy.long)` | `POST /api/Order/place` with `side: 0` (Bid), `type: 2` (Market) |
| `strategy.entry("id", strategy.short)` | `POST /api/Order/place` with `side: 1` (Ask), `type: 2` (Market) |
| `strategy.entry(..., limit=price)` | `POST /api/Order/place` with `type: 1` (Limit), `limitPrice: price` |
| `strategy.entry(..., stop=price)` | `POST /api/Order/place` with `type: 4` (Stop), `stopPrice: price` |

**Key behavior:** `strategy.entry()` automatically reverses positions. If long 5 and you enter short 5, it closes the long AND opens the short (total 10 contracts transacted). TopStepX requires explicit close + new entry.

### Exit Orders

```pine
strategy.exit("tp/sl", "buy",
    profit=20,          // Take profit in ticks
    loss=10,            // Stop loss in ticks
    trail_points=15,    // Trailing stop activation
    trail_offset=5      // Trailing stop distance
)
strategy.exit("partial", "buy", qty_percent=50, profit=10)  // Partial exit
```

**Conversion mapping:**
| PineScript | TopStepX API |
|------------|-------------|
| `strategy.exit(..., profit=N)` | `takeProfitBracket: { ticks: N, type: 1 }` in order placement |
| `strategy.exit(..., loss=N)` | `stopLossBracket: { ticks: N, type: 1 }` in order placement |
| `strategy.exit(..., trail_points=N)` | `POST /api/Order/place` with `type: 5` (TrailingStop) |
| `strategy.close("buy")` | `POST /api/Position/closeContract` |
| Partial exit (`qty_percent`) | `POST /api/Position/partialCloseContract` with `size` |

### Order Management

```pine
strategy.close("buy")          // Close specific entry
strategy.close_all()           // Close all positions
strategy.cancel("pending_id")  // Cancel pending order
strategy.cancel_all()          // Cancel all pending orders
```

**Conversion mapping:**
| PineScript | TopStepX API |
|------------|-------------|
| `strategy.close("id")` | `POST /api/Position/closeContract` |
| `strategy.close_all()` | `POST /api/Position/closeContract` for each open position |
| `strategy.cancel("id")` | `POST /api/Order/cancel` with `orderId` |
| `strategy.cancel_all()` | `POST /api/Order/cancel` for each open order |

### Position Information

```pine
strategy.position_size          // Current position size (+ long, - short, 0 flat)
strategy.position_avg_price     // Average entry price
strategy.opentrades             // Number of open trades
strategy.closedtrades           // Number of closed trades
strategy.equity                 // Current equity
strategy.netprofit              // Net profit
```

**Conversion:** Use `POST /api/Position/searchOpen` for position data, `POST /api/Trade/search` for trade history, `POST /api/Account/search` for balance/equity.

---

## Technical Analysis Functions

### Moving Averages

```pine
ta.sma(close, 20)      // Simple Moving Average
ta.ema(close, 20)      // Exponential Moving Average
ta.wma(close, 20)      // Weighted Moving Average
ta.vwma(close, 20)     // Volume-Weighted Moving Average
```

### Indicators

```pine
ta.rsi(close, 14)                          // RSI
[macdLine, signalLine, hist] = ta.macd(close, 12, 26, 9)  // MACD
[middle, upper, lower] = ta.bb(close, 20, 2)               // Bollinger Bands
[supertrend, direction] = ta.supertrend(3, 10)              // Supertrend
ta.atr(14)                                  // Average True Range
ta.stoch(close, high, low, 14)             // Stochastic
```

### Crossover/Under Detection

```pine
ta.crossover(fastMA, slowMA)    // Fast crosses above slow
ta.crossunder(fastMA, slowMA)   // Fast crosses below slow
ta.cross(a, b)                  // Either direction
```

### Extremes

```pine
ta.highest(high, 20)    // Highest high in 20 bars
ta.lowest(low, 20)      // Lowest low in 20 bars
ta.highestbars(high, 20) // Bars since highest
ta.lowestbars(low, 20)   // Bars since lowest
```

**Conversion note:** TopStepX has no built-in TA functions. Agents must either:
1. Implement calculations from historical bar data (`/api/History/retrieveBars`)
2. Use a TA library (e.g., `trading-signals` for JS, `pandas-ta` for Python)

---

## User-Defined Functions

### Single-line

```pine
sma(src, len) => ta.sma(src, len)
```

### Multi-line

```pine
getSignal(fastLen, slowLen) =>
    fast = ta.ema(close, fastLen)
    slow = ta.ema(close, slowLen)
    signal = ta.crossover(fast, slow) ? 1 : ta.crossunder(fast, slow) ? -1 : 0
    signal
```

### Tuple Returns

```pine
[bull, bear] = getSignals()
```

### Limitations
- Cannot call `indicator()`, `strategy()`, `plot()`, `hline()` inside functions
- Cannot be recursive
- Cannot be nested
- Parameters cannot be reassigned

---

## Input System

```pine
length = input.int(20, "MA Length", minval=1, maxval=200)
source = input.source(close, "Source")
useEMA = input.bool(true, "Use EMA?")
maType = input.string("EMA", "MA Type", options=["SMA", "EMA", "WMA"])
stopLoss = input.float(1.5, "Stop Loss %", step=0.1)
```

**Conversion note:** PineScript inputs become configuration parameters in the converted bot. Agents should generate a config object/file with these as defaults.

---

## Common Strategy Patterns

### Moving Average Crossover

```pine
//@version=6
strategy("MA Cross", overlay=true)

fastLen = input.int(9, "Fast Length")
slowLen = input.int(21, "Slow Length")

fast = ta.ema(close, fastLen)
slow = ta.ema(close, slowLen)

if ta.crossover(fast, slow)
    strategy.entry("Long", strategy.long)

if ta.crossunder(fast, slow)
    strategy.entry("Short", strategy.short)
```

### RSI Mean Reversion

```pine
//@version=6
strategy("RSI Strategy", overlay=true)

rsiLen = input.int(14, "RSI Length")
overbought = input.int(70, "Overbought")
oversold = input.int(30, "Oversold")

rsi = ta.rsi(close, rsiLen)

if ta.crossunder(rsi, oversold)
    strategy.entry("Long", strategy.long)
    strategy.exit("TP/SL", "Long", profit=20, loss=10)

if ta.crossover(rsi, overbought)
    strategy.entry("Short", strategy.short)
    strategy.exit("TP/SL", "Short", profit=20, loss=10)
```

### Breakout Strategy

```pine
//@version=6
strategy("Breakout", overlay=true)

lookback = input.int(20, "Lookback Period")
highestHigh = ta.highest(high, lookback)
lowestLow = ta.lowest(low, lookback)

if close > highestHigh[1]
    strategy.entry("Long", strategy.long)
    strategy.exit("SL", "Long", stop=lowestLow)

if close < lowestLow[1]
    strategy.entry("Short", strategy.short)
    strategy.exit("SL", "Short", stop=highestHigh)
```

---

## Limitations

| Limit | Value |
|-------|-------|
| Compilation time | 2 minutes |
| Execution time | 20-40 seconds total |
| Loop timeout | 500ms per bar |
| Max plots | 64 per script |
| Max drawings (lines/boxes/labels) | 500 IDs (50 shown default) |
| Max tables | 9 |
| `request.*()` calls | 40-64 |
| Compiled tokens | 100,000 |
| Variables per scope | 1,000 |
| Collection elements | 100,000 |
| Historical buffer | 5,000-10,000 bars |
| Backtesting orders | 9,000 (1M with Deep Backtesting) |

---

## Enum Reference (For Conversion Mapping)

### PineScript → TopStepX Order Side

| PineScript | Value | TopStepX Side | Value |
|------------|-------|---------------|-------|
| `strategy.long` | — | Bid (Buy) | `0` |
| `strategy.short` | — | Ask (Sell) | `1` |

### PineScript → TopStepX Order Type

| PineScript Order | TopStepX Type | TopStepX Value |
|------------------|---------------|----------------|
| Market (default `strategy.entry`) | Market | `2` |
| `limit=` parameter | Limit | `1` |
| `stop=` parameter | Stop | `4` |
| `limit=` + `stop=` | StopLimit | `3` |
| `trail_points=` | TrailingStop | `5` |

### PineScript Position → TopStepX Position

| PineScript | TopStepX PositionType | Value |
|------------|----------------------|-------|
| `strategy.position_size > 0` | Long | `1` |
| `strategy.position_size < 0` | Short | `2` |
| `strategy.position_size == 0` | Undefined (flat) | `0` |

---

## Conversion Checklist

When converting a PineScript strategy to TopStepX:

1. **Identify inputs** → Map to bot configuration parameters
2. **Identify indicators/calculations** → Implement using TA library or raw math on historical bars
3. **Identify entry conditions** → Map `strategy.entry()` calls to `POST /api/Order/place`
4. **Identify exit conditions** → Map `strategy.exit()` to bracket orders or explicit close/cancel
5. **Handle position reversals** → PineScript auto-reverses; TopStepX needs explicit close + new entry
6. **Handle partial exits** → Map `qty_percent` to `POST /api/Position/partialCloseContract`
7. **Add bar data source** → Use `/api/History/retrieveBars` for historical, `GatewayTrade`/`GatewayQuote` for realtime
8. **Add authentication** → JWT via `/api/Auth/loginKey` or `/api/Auth/loginApp`
9. **Add reconnection logic** → SignalR auto-reconnect with re-subscription
10. **Add risk management** → Position sizing, max loss limits (PineScript strategies often lack these)
11. **Add error handling** → Rate limits (429), rejected orders, connection drops
12. **Add logging** — PineScript has no logging; production bots need comprehensive logging

---

*Reference compiled from TradingView Pine Script v6 documentation*
*For TopStepX API details, see TOPSTEPX_API.md*
