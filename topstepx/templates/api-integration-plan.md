# API Integration Plan Template

Template for API integration planning documents. Captures the complete connection strategy for a trading bot to the TopStepX platform, covering authentication, REST endpoints, WebSocket subscriptions, and error handling.

**Purpose:** Plan the API integration layer before writing code. Ensures all endpoints, auth flows, and error handling are thought through.

<template>

```markdown
# API Integration Plan

**Bot Name:** [name]
**Created:** [YYYY-MM-DD]
**Target API:** TopStepX REST + SignalR WebSocket

## Authentication

| Property | Value |
|----------|-------|
| Login Method | `POST /api/Auth/loginKey` |
| Credentials | TSX_USERNAME + TSX_API_KEY (env vars) |
| Token Type | JWT Bearer token |
| Token Lifetime | 24 hours |
| Refresh Strategy | Proactive at 23 hours via `POST /api/Auth/validate` (SAF-02) |
| Token Storage | In-memory TokenManager class |
| Fallback | Re-authenticate from scratch on refresh failure |

## REST Endpoints Used

| Endpoint | Method | Purpose | Frequency | Rate Category |
|----------|--------|---------|-----------|---------------|
| `/api/Auth/loginKey` | POST | Initial authentication | Once at startup | GENERAL |
| `/api/Auth/validate` | POST | Token refresh | Every 23 hours | GENERAL |
| `/api/Account/search` | POST | Get account details, check balance | [frequency] | GENERAL |
| `/api/Contract/searchById` | POST | Look up contract details | Once at startup | GENERAL |
| `/api/Order/place` | POST | Place orders with brackets | Per signal | GENERAL |
| `/api/Order/search` | POST | Check open orders | [frequency] | GENERAL |
| `/api/Order/cancel` | POST | Cancel open orders | As needed | GENERAL |
| `/api/Position/searchOpen` | POST | Check current positions | [frequency] | GENERAL |
| `/api/History/retrieveBars` | POST | Historical bar data for indicators | [frequency] | HISTORY |
| [additional endpoints] | [method] | [purpose] | [frequency] | [category] |

## WebSocket Subscriptions

| Hub | URL | Method | Events Handled |
|-----|-----|--------|----------------|
| Market Hub | `https://rtc.topstepx.com/markethub` | `SubscribeContractQuotes(contractId)` | `GatewayQuote` -- live quotes for signal evaluation |
| Market Hub | `https://rtc.topstepx.com/markethub` | `SubscribeContractDOM(contractId)` | `GatewayDepth` -- depth of market (if needed) |
| User Hub | `https://rtc.topstepx.com/userhub` | `SubscribeAccounts` | `GatewayAccount` -- account balance updates |
| User Hub | `https://rtc.topstepx.com/userhub` | `SubscribeOrders(accountId)` | `GatewayOrder` -- order fill/reject notifications |
| User Hub | `https://rtc.topstepx.com/userhub` | `SubscribePositions(accountId)` | `GatewayPosition` -- position change events |
| User Hub | `https://rtc.topstepx.com/userhub` | `SubscribeTrades(accountId)` | `GatewayTrade` -- trade execution events |

### WebSocket Configuration

```javascript
{
  skipNegotiation: true,
  transport: HttpTransportType.WebSockets,
  accessTokenFactory: () => tokenManager.getToken(),
  timeout: 10000
}
```

## Error Handling

### Rate Limiting (SAF-03)

| Category | Limit | Window | Strategy |
|----------|-------|--------|----------|
| HISTORY | 50 requests | 30 seconds | Sliding window via RateLimiter class |
| GENERAL | 200 requests | 60 seconds | Sliding window via RateLimiter class |
| On 429 | -- | -- | Back off 5 seconds, retry once, abort if still limited |

### Order Rejection Handling

| Rejection Reason | Action |
|------------------|--------|
| Insufficient margin | Log error, do NOT retry, check account balance |
| Invalid contract | Log error, do NOT retry, verify contract ID |
| Account restricted | Log error, stop bot, notify user |
| Position limit exceeded | Log error, do NOT retry, check open positions |
| Unknown rejection | Log full error, do NOT retry, flag for review |

### Connection Recovery (SAF-05)

| Event | Action |
|-------|--------|
| WebSocket disconnect | `.withAutomaticReconnect()` handles first |
| Reconnection success | Re-subscribe all hubs (accounts, orders, positions, trades, quotes) |
| Permanent disconnect | Manual restart after 5-second delay |
| Token expired during disconnect | TokenManager re-authenticates on next API call |

## Environment Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| TSX_USERNAME | TopStepX account | Yes | Login username |
| TSX_API_KEY | TopStepX API settings ($29/mo add-on) | Yes | API key for loginKey endpoint |
| [additional vars] | [source] | [yes/no] | [description] |

## Startup Sequence

1. Load environment variables
2. Authenticate via `/api/Auth/loginKey`
3. Initialize TokenManager with received token
4. Initialize RateLimiter instances (HISTORY + GENERAL)
5. Search accounts via `/api/Account/search`
6. Look up contract via `/api/Contract/searchById`
7. Fetch initial historical bars via `/api/History/retrieveBars`
8. Connect to Market Hub WebSocket
9. Connect to User Hub WebSocket
10. Subscribe to all required events
11. Begin strategy evaluation loop

## Shutdown Sequence

1. Cancel all open orders
2. Flatten any open positions (if configured)
3. Unsubscribe from WebSocket events
4. Close WebSocket connections
5. Destroy TokenManager (clear refresh timer)
6. Log final account state

---
*Integration plan created: [date]*
```

</template>

<guidelines>

**Authentication section:**
- Always use TokenManager pattern from SAF-02
- Never store tokens on disk or in environment variables
- Proactive refresh at 23 hours is mandatory

**REST endpoints:**
- Only include endpoints the bot actually uses
- Note the rate limit category (HISTORY vs GENERAL) for each
- Include expected call frequency for capacity planning

**WebSocket subscriptions:**
- List every subscription the bot needs
- Include the event handler method name
- Note which hub each subscription belongs to

**Error handling:**
- Cover all three failure modes from SAF-05: rate limited, rejected, connection failure
- Never retry rejected orders -- investigate the cause
- Always re-subscribe after WebSocket reconnection

**Startup/shutdown sequences:**
- Order matters -- auth before WebSocket, subscribe after connect
- Shutdown should be graceful -- cancel orders before disconnecting
- Include cleanup of all resources (timers, connections)

</guidelines>

<example>

```markdown
# API Integration Plan

**Bot Name:** EMA Crossover ES Bot
**Created:** 2025-03-15
**Target API:** TopStepX REST + SignalR WebSocket

## Authentication

| Property | Value |
|----------|-------|
| Login Method | `POST /api/Auth/loginKey` |
| Credentials | TSX_USERNAME + TSX_API_KEY (env vars) |
| Token Type | JWT Bearer token |
| Token Lifetime | 24 hours |
| Refresh Strategy | Proactive at 23 hours via `POST /api/Auth/validate` (SAF-02) |
| Token Storage | In-memory TokenManager class |
| Fallback | Re-authenticate from scratch on refresh failure |

## REST Endpoints Used

| Endpoint | Method | Purpose | Frequency | Rate Category |
|----------|--------|---------|-----------|---------------|
| `/api/Auth/loginKey` | POST | Initial authentication | Once at startup | GENERAL |
| `/api/Auth/validate` | POST | Token refresh | Every 23 hours | GENERAL |
| `/api/Account/search` | POST | Get account ID and balance | Once at startup + after daily loss check | GENERAL |
| `/api/Contract/searchById` | POST | Look up ES contract details | Once at startup | GENERAL |
| `/api/Order/place` | POST | Place market orders with brackets | Per EMA crossover signal (~2-5/day) | GENERAL |
| `/api/Position/searchOpen` | POST | Reconcile position after fills | After each order event | GENERAL |
| `/api/History/retrieveBars` | POST | Fetch 5m bars for EMA calculation | Once at startup (100 bars) | HISTORY |

## WebSocket Subscriptions

| Hub | URL | Method | Events Handled |
|-----|-----|--------|----------------|
| Market Hub | `https://rtc.topstepx.com/markethub` | `SubscribeContractQuotes(esContractId)` | `GatewayQuote` -- live 5m bar updates for EMA crossover detection |
| User Hub | `https://rtc.topstepx.com/userhub` | `SubscribeAccounts` | `GatewayAccount` -- balance tracking for daily loss check |
| User Hub | `https://rtc.topstepx.com/userhub` | `SubscribeOrders(accountId)` | `GatewayOrder` -- fill confirmations, rejection alerts |
| User Hub | `https://rtc.topstepx.com/userhub` | `SubscribePositions(accountId)` | `GatewayPosition` -- position size tracking |

## Environment Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| TSX_USERNAME | TopStepX account | Yes | Login username |
| TSX_API_KEY | TopStepX API settings | Yes | API key |

---
*Integration plan created: 2025-03-15*
```

</example>
