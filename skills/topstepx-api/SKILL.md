---
name: topstepx-api
description: >
  Use when building TopStepX integrations, connecting to the TopStepX or ProjectX Gateway API,
  creating trading bots for TopStepX, placing orders, streaming real-time market data via SignalR,
  or any mention of TopStepX/ProjectX in a trading API context. Provides complete REST and
  WebSocket API reference for generating correct integration code in any programming language.
license: MIT
compatibility: Requires network access to api.topstepx.com and rtc.topstepx.com
metadata:
  author: mizu-trading
  version: "1.0.0"
---

# TopStepX (ProjectX Gateway) API

ProjectX Trading, LLC offers a complete trading platform API for prop firms and evaluation providers. The API uses REST for operations and SignalR WebSockets for real-time streaming.

## Connection URLs

| Service        | URL                                        |
|----------------|--------------------------------------------|
| REST API       | `https://api.topstepx.com`                 |
| User Hub (WS)  | `https://rtc.topstepx.com/hubs/user`       |
| Market Hub (WS) | `https://rtc.topstepx.com/hubs/market`     |

## Rate Limits

| Endpoint                          | Limit                    |
|-----------------------------------|--------------------------|
| `POST /api/History/retrieveBars`  | 50 requests / 30 seconds |
| All other endpoints               | 200 requests / 60 seconds |

Exceeding limits returns HTTP 429. Implement backoff and retry logic.

## Authentication

All requests require a JWT Bearer token. Tokens are valid for 24 hours.

### API Key Login (recommended for bots)

```
POST /api/Auth/loginKey
Body: { "userName": "string", "apiKey": "string" }
Response: { "token": "jwt_here", "success": true, "errorCode": 0, "errorMessage": null }
```

### Application Login

```
POST /api/Auth/loginApp
Body: { "userName": "...", "password": "...", "deviceId": "...", "appId": "...", "verifyKey": "..." }
Response: { "token": "jwt_here", "success": true, "errorCode": 0, "errorMessage": null }
```

### Session Validation / Token Refresh

```
POST /api/Auth/validate
Header: Authorization: Bearer <token>
Response: { "success": true, "newToken": "refreshed_jwt", "errorCode": 0 }
```

### Using the Token

Include the token as a Bearer token in the Authorization header for all REST requests:
```
Authorization: Bearer <token>
```

For WebSocket hubs, pass the token as a query parameter:
```
https://rtc.topstepx.com/hubs/user?access_token=<token>
```

## Standard Response Format

Every REST endpoint returns this structure:

```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null,
  "<dataField>": ...
}
```

Always check `success` before processing data. On failure, `errorCode` and `errorMessage` describe the issue.

## REST API Endpoints

All endpoints use POST method with JSON request bodies.

### Account

| Endpoint                | Purpose                    | Key Params                  |
|-------------------------|----------------------------|-----------------------------|
| `/api/Account/search`   | List accounts              | `onlyActiveAccounts`: bool  |

### Contract / Market Data

| Endpoint                     | Purpose                    | Key Params                          |
|------------------------------|----------------------------|-------------------------------------|
| `/api/Contract/available`    | List available contracts   | `live`: bool                        |
| `/api/Contract/search`       | Search contracts by name   | `searchText`: string, `live`: bool  |
| `/api/Contract/searchById`   | Get contract by ID         | `contractId`: string                |
| `/api/History/retrieveBars`  | Historical OHLCV bars      | `contractId`, `live`, `startTime`, `endTime`, `unit`, `unitNumber`, `limit`, `includePartialBar` |

**Bar unit values:** 1=Second, 2=Minute, 3=Hour, 4=Day, 5=Week, 6=Month

### Orders

| Endpoint                  | Purpose              | Key Params                                      |
|---------------------------|----------------------|-------------------------------------------------|
| `/api/Order/place`        | Place new order      | `accountId`, `contractId`, `type`, `side`, `size`, optional: `limitPrice`, `stopPrice`, `trailPrice`, `customTag`, `stopLossBracket`, `takeProfitBracket` |
| `/api/Order/search`       | Search order history | `accountId`, `startTimestamp`, optional: `endTimestamp` |
| `/api/Order/searchOpen`   | Get open orders      | `accountId`                                     |
| `/api/Order/cancel`       | Cancel order         | `accountId`, `orderId`                          |
| `/api/Order/modify`       | Modify order         | `accountId`, `orderId`, optional: `size`, `limitPrice`, `stopPrice`, `trailPrice` |

**Bracket objects** (`stopLossBracket` / `takeProfitBracket`): `{ "ticks": int, "type": OrderType }`

### Positions

| Endpoint                              | Purpose               | Key Params                          |
|---------------------------------------|------------------------|-------------------------------------|
| `/api/Position/searchOpen`            | Get open positions     | `accountId`                         |
| `/api/Position/closeContract`         | Close entire position  | `accountId`, `contractId`           |
| `/api/Position/partialCloseContract`  | Partial close          | `accountId`, `contractId`, `size`   |

### Trades

| Endpoint              | Purpose             | Key Params                                      |
|-----------------------|---------------------|-------------------------------------------------|
| `/api/Trade/search`   | Search trade history | `accountId`, `startTimestamp`, optional: `endTimestamp` |

A `null` value for `profitAndLoss` on a trade indicates a half-turn trade.

## Enums Quick Reference

| Enum          | Values                                                              |
|---------------|---------------------------------------------------------------------|
| OrderSide     | 0=Bid (buy), 1=Ask (sell)                                          |
| OrderType     | 0=Unknown, 1=Limit, 2=Market, 3=StopLimit, 4=Stop, 5=TrailingStop, 6=JoinBid, 7=JoinAsk |
| OrderStatus   | 0=None, 1=Open, 2=Filled, 3=Cancelled, 4=Expired, 5=Rejected, 6=Pending |
| PositionType  | 0=Undefined, 1=Long, 2=Short                                      |
| DomType       | 0=Unknown, 1=Ask, 2=Bid, 3=BestAsk, 4=BestBid, 5=Trade, 6=Reset, 7=Low, 8=High, 9=NewBestBid, 10=NewBestAsk, 11=Fill |
| TradeLogType  | 0=Buy, 1=Sell                                                      |

## Real-Time Data (SignalR WebSockets)

The API uses SignalR over WebSocket for streaming. Two hubs are available:

### User Hub (`/hubs/user`)

Subscribe/unsubscribe methods:
- `SubscribeAccounts()` / `UnsubscribeAccounts()` - account balance updates
- `SubscribeOrders(accountId)` / `UnsubscribeOrders(accountId)` - order status changes
- `SubscribePositions(accountId)` / `UnsubscribePositions(accountId)` - position updates
- `SubscribeTrades(accountId)` / `UnsubscribeTrades(accountId)` - trade executions

Events: `GatewayUserAccount`, `GatewayUserOrder`, `GatewayUserPosition`, `GatewayUserTrade`

### Market Hub (`/hubs/market`)

Subscribe/unsubscribe methods:
- `SubscribeContractQuotes(contractId)` / `UnsubscribeContractQuotes(contractId)` - quote updates
- `SubscribeContractTrades(contractId)` / `UnsubscribeContractTrades(contractId)` - market trades
- `SubscribeContractMarketDepth(contractId)` / `UnsubscribeContractMarketDepth(contractId)` - DOM/L2 data

Events: `GatewayQuote(contractId, data)`, `GatewayTrade(contractId, data)`, `GatewayDepth(contractId, data)`

### SignalR Connection Pattern

Connect with WebSocket transport, skip negotiation, enable auto-reconnect. Re-subscribe to all channels on reconnection. Pass JWT via `access_token` query parameter AND `accessTokenFactory`.

## Language-Agnostic Implementation Guidance

When generating code for any language:

1. **Authentication**: Implement token storage, 24h expiry tracking, and automatic refresh via `/api/Auth/validate`.
2. **HTTP client**: All REST calls are POST with JSON bodies. Set `Content-Type: application/json` and `Authorization: Bearer <token>`.
3. **Error handling**: Always check `success` field. Handle HTTP 429 with exponential backoff.
4. **SignalR**: Use the official SignalR client for the target language. Configure WebSocket-only transport with `skipNegotiation: true`. Always re-subscribe on reconnect.
5. **Contract IDs**: Format is `CON.F.US.<symbol>.<expiry>` (e.g., `CON.F.US.ENQ.U25`).
6. **Timestamps**: Use ISO 8601 format with timezone (`2024-12-01T00:00:00Z`).

## Additional Resources

### Reference Files

For detailed endpoint specifications with full request/response examples, consult:
- **`references/rest-api.md`** - Complete REST endpoint documentation with request bodies and response schemas
- **`references/realtime.md`** - SignalR connection examples, event payload schemas, and language-specific patterns
- **`references/enums.md`** - Full enum definitions with descriptions and usage context
