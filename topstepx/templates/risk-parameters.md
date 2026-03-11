# Risk Parameters Template

Template for risk parameter documents that capture position sizing, loss limits, and safety constraints for trading bots. These parameters are mandatory -- every bot must have explicit risk guardrails before any code is written.

**Purpose:** Define the safety envelope within which a trading bot operates. References SAF-01 from safety-patterns.md for bracket order and position sizing defaults.

<template>

```markdown
# Risk Parameters

**Bot Name:** [name]
**Created:** [YYYY-MM-DD]
**Account Type:** [Evaluation / Funded / Simulation]

## Account Context

| Property | Value |
|----------|-------|
| Account Type | [TopStepX Evaluation / Funded / Simulation] |
| Starting Balance | [$amount] |
| Daily Loss Limit (Platform) | [$amount -- from TopStepX account rules] |
| Trailing Drawdown Limit (Platform) | [$amount -- from TopStepX account rules] |
| Max Contracts Allowed | [platform limit] |
| Trading Hours | [RTH only / ETH / 24hr] |

## Position Sizing

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max Contracts Per Order | [number] | [e.g., "Conservative start for evaluation"] |
| Max Total Position Size | [number] | [e.g., "Never exceed N contracts in any direction"] |
| Scaling Rules | [None / Add on pullback / Pyramid on trend] | [description if applicable] |
| Position Sizing Method | [Fixed / Risk-based / Percentage] | [how size is determined] |
| Risk Per Trade | [$amount or % of balance] | [e.g., "$200 or 1% of balance"] |

## Loss Limits

| Parameter | Value | Action on Breach |
|-----------|-------|------------------|
| Max Loss Per Trade | [$amount] | [e.g., "Stop-loss bracket enforced, no override"] |
| Max Daily Loss | [$amount] | [e.g., "Stop trading for the day, flatten positions"] |
| Max Drawdown | [$amount or %] | [e.g., "Stop bot entirely, alert user"] |
| Buffer from Platform Limit | [% or $amount] | [e.g., "20% buffer below platform daily loss limit"] |
| Consecutive Loss Limit | [N trades] | [e.g., "After 3 consecutive losers, pause for 30 minutes"] |

### Daily Loss Calculation

```
Bot Daily Loss Limit = Platform Daily Loss Limit - Buffer
Example: $2,000 platform limit - 20% buffer = $1,600 bot limit
```

## Order Defaults

| Parameter | Value | Notes |
|-----------|-------|-------|
| Default Order Type | [Market / Limit] | [e.g., "Market for speed, accept slippage"] |
| Bracket Orders | Required (always) | SAF-01 -- non-negotiable |
| Stop-Loss Ticks | [ticks] | [e.g., "20 ticks default"] |
| Take-Profit Ticks | [ticks] | [e.g., "40 ticks default (2:1 R:R)"] |
| Trailing Stop | [Enabled / Disabled] | [configuration if enabled] |
| Time-in-Force | [Day / GTC / IOC] | [e.g., "Day for regular orders"] |

### Bracket Order Configuration

```javascript
// Default bracket configuration (SAF-01)
{
  stopLossBracket: { ticks: [stopTicks], type: OrderType.Limit },
  takeProfitBracket: { ticks: [profitTicks], type: OrderType.Limit }
}
```

## Safety Overrides

| Condition | Action | Priority |
|-----------|--------|----------|
| Daily loss limit reached | Flatten all positions, cancel all orders, stop trading | HIGHEST |
| Drawdown limit reached | Flatten all positions, stop bot entirely, alert user | HIGHEST |
| Consecutive loss limit | Pause trading for [duration], then resume | HIGH |
| WebSocket disconnection > [seconds] | Flatten positions via REST API | HIGH |
| Token refresh failure | Attempt re-authentication, stop bot if fails | HIGH |
| Position reconciliation mismatch | Log warning, use actual position, alert user | MEDIUM |
| End of trading hours | Flatten all positions, cancel all orders | MEDIUM |
| [Custom condition] | [custom action] | [priority] |

### Kill Switch

The kill switch activates on any HIGHEST priority condition. When triggered:

1. Cancel all open orders immediately
2. Flatten all open positions with market orders
3. Destroy all WebSocket connections
4. Log final account state
5. Exit process with error code

## Monitoring

| Metric | Tracking Method | Alert Threshold |
|--------|-----------------|-----------------|
| Current P&L | Account balance delta from start | Within 80% of daily loss limit |
| Open position size | Position search / events | At max contracts |
| Order fill rate | Track fills vs placements | Below 90% for limit orders |
| Consecutive losses | Counter in trade logic | At N-1 of limit |

---
*Risk parameters defined: [date]*
*Reviewed by user: [yes/no]*
```

</template>

<guidelines>

**Account context:**
- Always document the platform limits first -- bot limits derive from these
- Buffer from platform limit is mandatory (default 20%)
- Different account types have different limits -- verify with user

**Position sizing:**
- Default to 1 contract for evaluation accounts
- Never allow unbounded position sizes
- Math.min(requestedSize, maxSize) is enforced in code (SAF-01)

**Loss limits:**
- These are NOT suggestions -- they are hard stops
- Daily loss limit must be BELOW the platform limit (buffer)
- Kill switch conditions are non-negotiable

**Order defaults:**
- Bracket orders are always required -- this is the default, not an option
- Stop-loss and take-profit ticks must have concrete values
- Default to 2:1 reward-to-risk ratio if user doesn't specify

**Safety overrides:**
- Priority determines which override wins in conflict
- HIGHEST priority overrides always flatten and stop
- WebSocket disconnection must have a timeout threshold

**Integration with bot scaffolds:**
- Bot scaffold templates (bot-scaffold-js.md, bot-scaffold-python.md) implement these parameters
- Values from this document feed directly into the bot's config object
- Every parameter here has a corresponding code implementation

</guidelines>

<example>

```markdown
# Risk Parameters

**Bot Name:** EMA Crossover ES Bot
**Created:** 2025-03-15
**Account Type:** Evaluation

## Account Context

| Property | Value |
|----------|-------|
| Account Type | TopStepX 150K Evaluation |
| Starting Balance | $150,000 (simulated) |
| Daily Loss Limit (Platform) | $2,000 |
| Trailing Drawdown Limit (Platform) | $3,000 |
| Max Contracts Allowed | 5 |
| Trading Hours | RTH only (9:30 AM - 4:00 PM ET) |

## Position Sizing

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max Contracts Per Order | 1 | Conservative start for evaluation account |
| Max Total Position Size | 1 | Single position only, no scaling |
| Scaling Rules | None | Keep simple for initial evaluation |
| Position Sizing Method | Fixed | 1 contract per trade |
| Risk Per Trade | $250 | 20 tick stop on ES = $250 |

## Loss Limits

| Parameter | Value | Action on Breach |
|-----------|-------|------------------|
| Max Loss Per Trade | $250 | Stop-loss bracket enforced (20 ticks) |
| Max Daily Loss | $1,600 | Flatten positions, stop trading for the day |
| Max Drawdown | $2,400 | Stop bot entirely, alert user |
| Buffer from Platform Limit | 20% | $2,000 * 0.80 = $1,600 daily; $3,000 * 0.80 = $2,400 drawdown |
| Consecutive Loss Limit | 3 trades | Pause for 30 minutes, then resume |

## Order Defaults

| Parameter | Value | Notes |
|-----------|-------|-------|
| Default Order Type | Market | Accept slippage for reliable fills |
| Bracket Orders | Required (always) | SAF-01 non-negotiable |
| Stop-Loss Ticks | 20 | $250 risk per contract on ES |
| Take-Profit Ticks | 40 | 2:1 R:R ratio |
| Trailing Stop | Disabled | Not used in this strategy |
| Time-in-Force | Day | Orders expire at end of session |

## Safety Overrides

| Condition | Action | Priority |
|-----------|--------|----------|
| Daily loss >= $1,600 | Flatten all, cancel all, stop trading | HIGHEST |
| Drawdown >= $2,400 | Flatten all, stop bot entirely | HIGHEST |
| 3 consecutive losses | Pause 30 minutes | HIGH |
| WebSocket disconnect > 30s | Flatten positions via REST | HIGH |
| 15:55 ET (5 min before close) | Flatten all, cancel all | MEDIUM |

---
*Risk parameters defined: 2025-03-15*
*Reviewed by user: yes*
```

</example>
