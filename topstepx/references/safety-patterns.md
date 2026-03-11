# Safety Patterns Reference

This reference contains mandatory safety patterns for all TopStepX trading bot code. Agents and templates MUST load this file and apply these patterns.

## Table of Contents

- [SAF-01: Enum Constants (Risk Guardrails)](#saf-01-enum-constants-risk-guardrails)
- [SAF-02: JWT Token Refresh](#saf-02-jwt-token-refresh)
- [SAF-03: Rate Limit Compliance](#saf-03-rate-limit-compliance)
- [SAF-04: PineScript Repainting Audit](#saf-04-pinescript-repainting-audit)
- [SAF-05: Error Handling Patterns](#saf-05-error-handling-patterns)

---

## SAF-01: Enum Constants (Risk Guardrails)

**Rule: ALWAYS use named enum constants, NEVER bare integers for API enums.**

Bare integers (`side: 0`, `type: 2`) are unreadable, error-prone, and make code review impossible. Every enum field in the TopStepX API must use a named constant.

### Complete Enum Constant Definitions

```javascript
// OrderSide — used in order placement, order events, trade events
const OrderSide = { Bid: 0, Ask: 1 };

// OrderType — used in order placement, bracket config, order events
const OrderType = {
  Unknown: 0, Limit: 1, Market: 2, StopLimit: 3,
  Stop: 4, TrailingStop: 5, JoinBid: 6, JoinAsk: 7
};

// OrderStatus — used in order search results and order events
const OrderStatus = {
  None: 0, Open: 1, Filled: 2, Cancelled: 3,
  Expired: 4, Rejected: 5, Pending: 6
};

// PositionType — used in position search results and events
const PositionType = { Undefined: 0, Long: 1, Short: 2 };

// TimeInForce — used in order placement
const TimeInForce = { Day: 0, GTC: 1, GTD: 2, IOC: 3, FOK: 4 };

// BarTimeUnit — used in /api/History/retrieveBars
const BarTimeUnit = {
  Second: 1, Minute: 2, Hour: 3, Day: 4, Week: 5, Month: 6
};

// DomType — used in Market Hub GatewayDepth events
const DomType = {
  Unknown: 0, Ask: 1, Bid: 2, BestAsk: 3, BestBid: 4,
  Trade: 5, Reset: 6, Low: 7, High: 8,
  NewBestBid: 9, NewBestAsk: 10, Fill: 11
};

// TradeLogType — used in Market Hub GatewayTrade events
const TradeLogType = { Buy: 0, Sell: 1 };
```

### CORRECT vs WRONG Usage

```javascript
// CORRECT — readable, reviewable, safe:
const order = {
  accountId: ACCOUNT_ID,
  contractId: CONTRACT_ID,
  side: OrderSide.Bid,
  type: OrderType.Market,
  size: 1,
  stopLossBracket: { ticks: 10, type: OrderType.Limit },
  takeProfitBracket: { ticks: 20, type: OrderType.Limit }
};

// WRONG — never do this:
const order = {
  accountId: ACCOUNT_ID,
  contractId: CONTRACT_ID,
  side: 0,    // What does 0 mean? Bid? Ask?
  type: 2,    // Market? Limit? Stop?
  size: 1,
  stopLossBracket: { ticks: 10, type: 1 },
  takeProfitBracket: { ticks: 20, type: 1 }
};
```

### Risk Guardrail Patterns

**Bracket orders are the DEFAULT.** Every order placement should include both a stop-loss and take-profit bracket unless the user explicitly opts out.

```javascript
// Default bracket order pattern — always include protective brackets
function createOrder(side, size, contractId, accountId, options = {}) {
  const defaultStopLoss = options.stopLossTicks || 20;   // Default 20 ticks
  const defaultTakeProfit = options.takeProfitTicks || 40; // Default 40 ticks (2:1 R:R)

  return {
    accountId,
    contractId,
    side: side,
    type: OrderType.Market,
    size: Math.min(size, options.maxSize || 5), // Position sizing limit
    stopLossBracket: { ticks: defaultStopLoss, type: OrderType.Limit },
    takeProfitBracket: { ticks: defaultTakeProfit, type: OrderType.Limit }
  };
}
```

**Position sizing limits:** Never allow unbounded position sizes. Enforce a max contracts limit per order and a max total position size.

**Max loss checks:** Before placing any order, verify the account has not exceeded the daily max loss threshold. Use `POST /api/Account/search` to check balance against starting balance.

---

## SAF-02: JWT Token Refresh

**Rule: Proactive refresh before expiry, never reactive on 401.**

Session tokens are valid for **24 hours**. Refresh at **23 hours** (1 hour before expiry). Never wait for a 401 — by then your WebSocket connections have already dropped.

### API Endpoint

`POST /api/Auth/validate` with Bearer token in Authorization header. Returns `{ success, newToken }`.

### TokenManager Implementation

```javascript
class TokenManager {
  constructor(initialToken) {
    this.token = initialToken;
    this.refreshInterval = 23 * 60 * 60 * 1000; // 23 hours in ms
    this.startRefreshTimer();
  }

  getToken() {
    return this.token;
  }

  async refreshToken() {
    try {
      const response = await fetch('https://api.topstepx.com/api/Auth/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success && data.newToken) {
        this.token = data.newToken;
        console.log('Token refreshed successfully');
        this.startRefreshTimer();
      } else {
        console.error('Token refresh failed, attempting re-authentication');
        await this.reAuthenticate();
      }
    } catch (err) {
      console.error(`Token refresh error: ${err.message}`);
      await this.reAuthenticate();
    }
  }

  async reAuthenticate() {
    // Fallback: re-authenticate from scratch
    const response = await fetch('https://api.topstepx.com/api/Auth/loginKey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: process.env.TSX_USERNAME,
        apiKey: process.env.TSX_API_KEY
      })
    });
    const data = await response.json();

    if (data.success && data.token) {
      this.token = data.token;
      this.startRefreshTimer();
    } else {
      throw new Error('Re-authentication failed — check credentials');
    }
  }

  startRefreshTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.refreshToken(), this.refreshInterval);
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer);
  }
}
```

### Usage

```javascript
// Initialize after login
const loginResponse = await authenticate(userName, apiKey);
const tokenManager = new TokenManager(loginResponse.token);

// All API calls use the managed token
const headers = {
  'Authorization': `Bearer ${tokenManager.getToken()}`,
  'Content-Type': 'application/json'
};

// SignalR connections use accessTokenFactory
const connection = new HubConnectionBuilder()
  .withUrl(hubUrl, {
    accessTokenFactory: () => tokenManager.getToken(),
    // ...
  })
  .build();
```

---

## SAF-03: Rate Limit Compliance

**Rule: Track request timestamps per endpoint category and wait for a slot before sending.**

### Rate Limit Constants

| Endpoint Category | Limit | Window | Applies To |
|-------------------|-------|--------|------------|
| History | 50 requests | 30 seconds | `POST /api/History/retrieveBars` |
| General | 200 requests | 60 seconds | All other endpoints |

Exceeding limits returns **HTTP 429 Too Many Requests**.

### RateLimiter Implementation

```javascript
const RATE_LIMITS = {
  HISTORY: { requests: 50, windowMs: 30_000 },  // /api/History/retrieveBars
  GENERAL: { requests: 200, windowMs: 60_000 }, // All other endpoints
};

class RateLimiter {
  constructor(limit) {
    this.limit = limit;
    this.timestamps = [];
  }

  async waitForSlot() {
    const now = Date.now();
    // Remove timestamps outside the window
    this.timestamps = this.timestamps.filter(t => now - t < this.limit.windowMs);

    if (this.timestamps.length >= this.limit.requests) {
      const oldestInWindow = this.timestamps[0];
      const waitMs = this.limit.windowMs - (now - oldestInWindow) + 100; // +100ms buffer
      console.log(`Rate limit: waiting ${waitMs}ms`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    this.timestamps.push(Date.now());
  }
}

// Create per-category limiters
const historyLimiter = new RateLimiter(RATE_LIMITS.HISTORY);
const generalLimiter = new RateLimiter(RATE_LIMITS.GENERAL);
```

### Usage Pattern

```javascript
// Wrap every API call with the appropriate rate limiter
async function fetchBars(params) {
  await historyLimiter.waitForSlot();
  const response = await fetch('https://api.topstepx.com/api/History/retrieveBars', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}

async function placeOrder(params) {
  await generalLimiter.waitForSlot();
  const response = await fetch('https://api.topstepx.com/api/Order/place', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}
```

---

## SAF-04: PineScript Repainting Audit

**Rule: Audit every PineScript strategy for repainting before conversion. Repainting strategies produce signals in backtesting that would NOT have existed in real-time trading.**

### 4-Point Repainting Checklist

Before converting any PineScript strategy, check for all four patterns:

### Check 1: `request.security()` Without `[1]` Offset

The `[1]` offset and `lookahead_on` are **INTERDEPENDENT** -- both are required.

```pine
// REPAINTS — uses future data from higher timeframe:
htfClose = request.security(syminfo.tickerid, "D", close)

// SAFE — uses previous confirmed bar from higher timeframe:
htfClose = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)
```

Using `lookahead_on` without `[1]` still repaints (gets the current unconfirmed bar). Using `[1]` without `lookahead_on` gets stale data from two bars ago.

### Check 2: Conditions on Unconfirmed Bars

```pine
// REPAINTS — close changes intra-bar in realtime:
if ta.crossover(close, ma)
    strategy.entry("Long", strategy.long)

// SAFE — only acts after bar is confirmed:
if ta.crossover(close, ma) and barstate.isconfirmed
    strategy.entry("Long", strategy.long)
```

### Check 3: Realtime-Only Logic

```pine
// REPAINTS — different behavior on historical vs realtime bars:
if barstate.isrealtime and someCondition
    strategy.entry("Long", strategy.long)

// SAFE — avoid barstate-conditional trading logic entirely.
// If the strategy needs different realtime behavior, document it explicitly.
```

### Check 4: Fluid Values in Conditions

```pine
// REPAINTS — high changes intra-bar in realtime:
if high > threshold
    strategy.entry("Long", strategy.long)

// SAFE — use confirmed bar's value:
if high[1] > threshold and barstate.isconfirmed
    strategy.entry("Long", strategy.long)
```

### Default Policy

When in doubt, require `barstate.isconfirmed` for all entry/exit conditions. **Converted bots should use bar-close signals unless the user explicitly requests tick-based execution.** Bar-close signals trade slightly later but eliminate repainting risk entirely.

### Conversion Action

When repainting is detected during conversion:
1. Flag it to the user with the specific check number and line
2. Apply the SAFE pattern as default
3. Document the change in the conversion report
4. If the user insists on the repainting pattern, require explicit acknowledgment

---

## SAF-05: Error Handling Patterns

**Rule: Handle all three failure modes for every API call: rate limited (429), rejected (success: false), and connection failure (network error).**

### placeOrderSafe Implementation

```javascript
async function placeOrderSafe(orderParams, token, retried = false) {
  try {
    await generalLimiter.waitForSlot(); // SAF-03 compliance

    const response = await fetch('https://api.topstepx.com/api/Order/place', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderParams)
    });

    // Failure mode 1: Rate limited (429)
    if (response.status === 429) {
      if (retried) {
        console.error('Rate limited after retry — aborting order');
        return { success: false, error: 'Rate limited after retry' };
      }
      console.warn('Rate limited, backing off 5 seconds...');
      await new Promise(r => setTimeout(r, 5000));
      return placeOrderSafe(orderParams, token, true); // Retry once
    }

    const data = await response.json();

    // Failure mode 2: Order rejected by system
    if (!data.success) {
      console.error(`Order rejected: ${data.errorMessage} (code: ${data.errorCode})`);
      // DO NOT retry rejected orders — investigate the cause
      return { success: false, error: data.errorMessage, errorCode: data.errorCode };
    }

    return { success: true, orderId: data.orderId };
  } catch (err) {
    // Failure mode 3: Connection failure
    console.error(`Connection error placing order: ${err.message}`);
    return { success: false, error: err.message };
  }
}
```

### WebSocket Reconnection Pattern

Use `.withAutomaticReconnect()` on the SignalR HubConnectionBuilder. After reconnection, re-subscribe to ALL hubs:

```javascript
const connection = new HubConnectionBuilder()
  .withUrl(hubUrl, {
    skipNegotiation: true,
    transport: HttpTransportType.WebSockets,
    accessTokenFactory: () => tokenManager.getToken(),
    timeout: 10000
  })
  .withAutomaticReconnect()
  .build();

// Re-subscribe after every reconnection
connection.onreconnected((connectionId) => {
  console.log(`Reconnected (${connectionId}), re-subscribing...`);
  connection.invoke('SubscribeAccounts');
  connection.invoke('SubscribeOrders', accountId);
  connection.invoke('SubscribePositions', accountId);
  connection.invoke('SubscribeTrades', accountId);
});

// Handle permanent disconnection
connection.onclose((error) => {
  console.error('Connection closed permanently:', error);
  // Attempt manual restart after delay
  setTimeout(() => connection.start(), 5000);
});
```

### Partial Fill and Position Reconciliation

After any order event, reconcile the expected position with the actual position:

```javascript
async function reconcilePosition(accountId, contractId, expectedSize, expectedSide) {
  await generalLimiter.waitForSlot();
  const response = await fetch('https://api.topstepx.com/api/Position/searchOpen', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenManager.getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accountId })
  });
  const data = await response.json();

  const position = data.positions?.find(p => p.contractId === contractId);
  const actualSize = position ? position.size : 0;
  const actualSide = position ? position.type : PositionType.Undefined;

  if (actualSize !== expectedSize || actualSide !== expectedSide) {
    console.warn(`Position mismatch: expected ${expectedSide}x${expectedSize}, ` +
                 `actual ${actualSide}x${actualSize}`);
    // Return actual state for strategy to reconcile
    return { mismatch: true, actualSize, actualSide, position };
  }

  return { mismatch: false, actualSize, actualSide, position };
}
```

---

*Safety patterns compiled from TopStepX API documentation and trading best practices.*
*For API endpoint details, see TOPSTEPX_API.md. For PineScript conversion, see PINESCRIPT.md.*
