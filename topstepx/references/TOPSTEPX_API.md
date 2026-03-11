# ProjectX Gateway API - Complete Documentation (TopstepX)

## Getting Started

ProjectX Trading, LLC - through its trading platform ProjectX, offers a complete end-to-end solution for prop firms and evaluation providers. These features include account customization, risk rules & monitoring, liquidations, statistics and robust permissioning. The API utilizes REST API architecture for managing prop firm trader operations.

### Prerequisites

- An understanding of REST API
- cURL or Postman for making sample requests

### Connection URLs

| Service | URL |
|---------|-----|
| API Endpoint | `https://api.topstepx.com` |
| User Hub | `https://rtc.topstepx.com/hubs/user` |
| Market Hub | `https://rtc.topstepx.com/hubs/market` |

### Rate Limits

> **IMPORTANT:** Violating rate limits will result in HTTP 429 errors. See safety-patterns.md SAF-03 for the RateLimiter implementation pattern.

| Endpoint Category | Endpoint(s) | Limit | Window |
|-------------------|-------------|-------|--------|
| History | `POST /api/History/retrieveBars` | 50 requests | 30 seconds |
| General | All other endpoints | 200 requests | 60 seconds |

Exceeding rate limits returns **HTTP 429 Too Many Requests**. Implement a rate limiter that tracks request timestamps per category and waits for a slot before sending. See safety-patterns.md SAF-03 for a complete implementation.

---

## Authentication

All requests use JSON Web Tokens (JWT). Session tokens are valid for **24 hours**. See safety-patterns.md SAF-02 for the proactive refresh pattern -- refresh at 23 hours (1 hour before expiry), never wait for a 401.

### Authenticate with API Key

**POST** `https://api.topstepx.com/api/Auth/loginKey`

**Request:**

```json
{
  "userName": "string",
  "apiKey": "string"
}
```

**Response:**

```json
{
  "token": "your_session_token_here",
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Authenticate as Application

**POST** `https://api.topstepx.com/api/Auth/loginApp`

**Request:**

```json
{
  "userName": "yourUsername",
  "password": "yourPassword",
  "deviceId": "yourDeviceId",
  "appId": "yourApplicationID",
  "verifyKey": "yourVerifyKey"
}
```

**Response:**

```json
{
  "token": "your_session_token_here",
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Validate Session

**POST** `https://api.topstepx.com/api/Auth/validate`

Use this to refresh an expired token.

**Response:**

```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null,
  "newToken": "NEW_TOKEN"
}
```

---

## Account API

### Search for Accounts

**POST** `https://api.topstepx.com/api/Account/search`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `onlyActiveAccounts` | boolean | Whether to filter only active accounts | Required | false |

**Request:**

```json
{
  "onlyActiveAccounts": true
}
```

**Response:**

```json
{
  "accounts": [
    {
      "id": 1,
      "name": "TEST_ACCOUNT_1",
      "balance": 50000,
      "canTrade": true,
      "isVisible": true
    }
  ],
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

---

## Contract / Market Data API

### List Available Contracts

**POST** `https://api.topstepx.com/api/Contract/available`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `live` | boolean | Whether to retrieve live contracts | Required | false |

**Request:**

```json
{
  "live": true
}
```

**Response:**

```json
{
  "contracts": [
    {
      "id": "CON.F.US.ENQ.U25",
      "name": "NQU5",
      "description": "E-mini NASDAQ-100: September 2025",
      "tickSize": 0.25,
      "tickValue": 5,
      "activeContract": true,
      "symbolId": "F.US.ENQ"
    }
  ],
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Search for Contracts

**POST** `https://api.topstepx.com/api/Contract/search`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `searchText` | string | The name of the contract to search for | Required | false |
| `live` | boolean | Whether to search using sim/live data subscription | Required | false |

**Request:**

```json
{
  "live": false,
  "searchText": "NQ"
}
```

**Response:**

```json
{
  "contracts": [
    {
      "id": "CON.F.US.ENQ.U25",
      "name": "NQU5",
      "description": "E-mini NASDAQ-100: September 2025",
      "tickSize": 0.25,
      "tickValue": 5,
      "activeContract": true,
      "symbolId": "F.US.ENQ"
    }
  ],
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Search for Contract by ID

**POST** `https://api.topstepx.com/api/Contract/searchById`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `contractId` | string | The ID of the contract to search for | Required | false |

**Request:**

```json
{
  "contractId": "CON.F.US.ENQ.H25"
}
```

**Response:**

```json
{
  "contract": {
    "id": "CON.F.US.ENQ.H25",
    "name": "NQH5",
    "description": "E-mini NASDAQ-100: March 2025",
    "tickSize": 0.25,
    "tickValue": 5,
    "activeContract": false,
    "symbolId": "F.US.ENQ"
  },
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Retrieve Bars (Historical Data)

**POST** `https://api.topstepx.com/api/History/retrieveBars`

> **Note:** Maximum of 20,000 bars per request. Rate limited to 50 requests / 30 seconds.

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `contractId` | string | The contract ID | Required | false |
| `live` | boolean | Whether to use sim or live data subscription | Required | false |
| `startTime` | datetime | Start time of historical data | Required | false |
| `endTime` | datetime | End time of historical data | Required | false |
| `unit` | integer | Unit of aggregation (see below) | Required | false |
| `unitNumber` | integer | Number of units to aggregate | Required | false |
| `limit` | integer | Maximum number of bars to retrieve | Required | false |
| `includePartialBar` | boolean | Include partial bar for current time unit | Required | false |

**Unit Values:**

| Value | Unit |
|-------|------|
| 1 | Second |
| 2 | Minute |
| 3 | Hour |
| 4 | Day |
| 5 | Week |
| 6 | Month |

**Request:**

```json
{
  "contractId": "CON.F.US.RTY.Z24",
  "live": false,
  "startTime": "2024-12-01T00:00:00Z",
  "endTime": "2024-12-31T21:00:00Z",
  "unit": 3,
  "unitNumber": 1,
  "limit": 7,
  "includePartialBar": false
}
```

**Response:**

```json
{
  "bars": [
    {
      "t": "2024-12-20T14:00:00+00:00",
      "o": 2208.1,
      "h": 2217.0,
      "l": 2206.7,
      "c": 2210.1,
      "v": 87
    }
  ],
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

---

## Order API

### Place an Order

**POST** `https://api.topstepx.com/api/Order/place`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |
| `contractId` | string | The contract ID | Required | false |
| `type` | integer | Order type (see OrderType enum) | Required | false |
| `side` | integer | Order side: `0` = Bid (buy), `1` = Ask (sell) | Required | false |
| `size` | integer | Size of the order | Required | false |
| `limitPrice` | decimal | Limit price, if applicable | Optional | true |
| `stopPrice` | decimal | Stop price, if applicable | Optional | true |
| `trailPrice` | decimal | Trail price, if applicable | Optional | true |
| `customTag` | string | Custom tag (must be unique per account) | Optional | true |
| `stopLossBracket` | object | Stop loss bracket config | Optional | true |
| `takeProfitBracket` | object | Take profit bracket config | Optional | true |

**Bracket Object (stopLossBracket / takeProfitBracket):**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `ticks` | integer | Number of ticks | Required | false |
| `type` | integer | OrderType enum value | Required | false |

**Request:**

```json
{
  "accountId": 465,
  "contractId": "CON.F.US.DA6.M25",
  "type": 2,
  "side": 1,
  "size": 1,
  "limitPrice": null,
  "stopPrice": null,
  "trailPrice": null,
  "customTag": null,
  "stopLossBracket": {
    "ticks": 10,
    "type": 1
  },
  "takeProfitBracket": {
    "ticks": 20,
    "type": 1
  }
}
```

**Response:**

```json
{
  "orderId": 9056,
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Search for Orders

**POST** `https://api.topstepx.com/api/Order/search`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |
| `startTimestamp` | datetime | Start of timestamp filter | Required | false |
| `endTimestamp` | datetime | End of timestamp filter | Optional | true |

**Response:**

```json
{
  "orders": [
    {
      "id": 36598,
      "accountId": 704,
      "contractId": "CON.F.US.EP.U25",
      "symbolId": "F.US.EP",
      "creationTimestamp": "2025-07-18T21:00:01.268009+00:00",
      "updateTimestamp": "2025-07-18T21:00:01.268009+00:00",
      "status": 2,
      "type": 2,
      "side": 0,
      "size": 1,
      "limitPrice": null,
      "stopPrice": null,
      "fillVolume": 1,
      "filledPrice": 6335.25,
      "customTag": null
    }
  ],
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Search for Open Orders

**POST** `https://api.topstepx.com/api/Order/searchOpen`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |

**Response:**

```json
{
  "orders": [
    {
      "id": 26970,
      "accountId": 212,
      "contractId": "CON.F.US.EP.M25",
      "creationTimestamp": "2025-04-21T19:45:52.105808+00:00",
      "updateTimestamp": "2025-04-21T19:45:52.105808+00:00",
      "status": 1,
      "type": 4,
      "side": 1,
      "size": 1,
      "limitPrice": null,
      "stopPrice": 5138.0,
      "filledPrice": null
    }
  ],
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Cancel an Order

**POST** `https://api.topstepx.com/api/Order/cancel`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |
| `orderId` | integer | The order ID | Required | false |

**Request:**

```json
{
  "accountId": 465,
  "orderId": 26974
}
```

**Response:**

```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Modify an Order

**POST** `https://api.topstepx.com/api/Order/modify`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |
| `orderId` | integer | The order ID | Required | false |
| `size` | integer | Size of the order | Optional | true |
| `limitPrice` | decimal | Limit price | Optional | true |
| `stopPrice` | decimal | Stop price | Optional | true |
| `trailPrice` | decimal | Trail price | Optional | true |

**Request:**

```json
{
  "accountId": 465,
  "orderId": 26974,
  "size": 1,
  "limitPrice": null,
  "stopPrice": 1604,
  "trailPrice": null
}
```

**Response:**

```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

---

## Position API

### Search for Open Positions

**POST** `https://api.topstepx.com/api/Position/searchOpen`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |

**Response:**

```json
{
  "positions": [
    {
      "id": 6124,
      "accountId": 536,
      "contractId": "CON.F.US.GMET.J25",
      "creationTimestamp": "2025-04-21T19:52:32.175721+00:00",
      "type": 1,
      "size": 2,
      "averagePrice": 1575.75
    }
  ],
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Close Position

**POST** `https://api.topstepx.com/api/Position/closeContract`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |
| `contractId` | string | The contract ID | Required | false |

**Request:**

```json
{
  "accountId": 536,
  "contractId": "CON.F.US.GMET.J25"
}
```

**Response:**

```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### Partially Close Position

**POST** `https://api.topstepx.com/api/Position/partialCloseContract`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |
| `contractId` | string | The contract ID | Required | false |
| `size` | integer | The size to close | Required | false |

**Request:**

```json
{
  "accountId": 536,
  "contractId": "CON.F.US.GMET.J25",
  "size": 1
}
```

**Response:**

```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

---

## Trade API

### Search for Trades

**POST** `https://api.topstepx.com/api/Trade/search`

**Parameters:**

| Name | Type | Description | Required | Nullable |
|------|------|-------------|----------|----------|
| `accountId` | integer | The account ID | Required | false |
| `startTimestamp` | datetime | Start of timestamp filter | Required | false |
| `endTimestamp` | datetime | End of timestamp filter | Optional | true |

**Response:**

```json
{
  "trades": [
    {
      "id": 8604,
      "accountId": 203,
      "contractId": "CON.F.US.EP.H25",
      "creationTimestamp": "2025-01-21T16:13:52.523293+00:00",
      "price": 6065.25,
      "profitAndLoss": 50.0,
      "fees": 1.4,
      "side": 1,
      "size": 1,
      "voided": false,
      "orderId": 14328
    },
    {
      "id": 8603,
      "accountId": 203,
      "contractId": "CON.F.US.EP.H25",
      "creationTimestamp": "2025-01-21T16:13:04.142302+00:00",
      "price": 6064.25,
      "profitAndLoss": null,
      "fees": 1.4,
      "side": 0,
      "size": 1,
      "voided": false,
      "orderId": 14326
    }
  ],
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

> **Note:** A `null` value for `profitAndLoss` indicates a half-turn trade.

---

## Real-Time Data (SignalR / WebSocket)

The API uses the [SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction) library via WebSocket for real-time data. There are two hubs:

- **User Hub** (`https://rtc.topstepx.com/hubs/user`) - account, order, position, and trade updates
- **Market Hub** (`https://rtc.topstepx.com/hubs/market`) - quotes, trades, and market depth

### User Hub - Connection Example

```javascript
const { HubConnectionBuilder, HttpTransportType } = require('@microsoft/signalr');

function setupSignalRConnection() {
  const JWT_TOKEN = 'your_bearer_token';
  const SELECTED_ACCOUNT_ID = 123;
  const userHubUrl = 'https://rtc.topstepx.com/hubs/user?access_token=YOUR_JWT_TOKEN';

  const rtcConnection = new HubConnectionBuilder()
    .withUrl(userHubUrl, {
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      accessTokenFactory: () => JWT_TOKEN,
      timeout: 10000
    })
    .withAutomaticReconnect()
    .build();

  rtcConnection.start().then(() => {
    const subscribe = () => {
      rtcConnection.invoke('SubscribeAccounts');
      rtcConnection.invoke('SubscribeOrders', SELECTED_ACCOUNT_ID);
      rtcConnection.invoke('SubscribePositions', SELECTED_ACCOUNT_ID);
      rtcConnection.invoke('SubscribeTrades', SELECTED_ACCOUNT_ID);
    };

    const unsubscribe = () => {
      rtcConnection.invoke('UnsubscribeAccounts');
      rtcConnection.invoke('UnsubscribeOrders', SELECTED_ACCOUNT_ID);
      rtcConnection.invoke('UnsubscribePositions', SELECTED_ACCOUNT_ID);
      rtcConnection.invoke('UnsubscribeTrades', SELECTED_ACCOUNT_ID);
    };

    rtcConnection.on('GatewayUserAccount', (data) => {
      console.log('Received account update', data);
    });

    rtcConnection.on('GatewayUserOrder', (data) => {
      console.log('Received order update', data);
    });

    rtcConnection.on('GatewayUserPosition', (data) => {
      console.log('Received position update', data);
    });

    rtcConnection.on('GatewayUserTrade', (data) => {
      console.log('Received trade update', data);
    });

    subscribe();

    rtcConnection.onreconnected((connectionId) => {
      console.log('RTC Connection Reconnected');
      subscribe();
    });
  }).catch((err) => {
    console.error('Error starting connection:', err);
  });
}

setupSignalRConnection();
```

### Market Hub - Connection Example

```javascript
const { HubConnectionBuilder, HttpTransportType } = require('@microsoft/signalr');

function setupSignalRConnection() {
  const JWT_TOKEN = 'your_bearer_token';
  const marketHubUrl = 'https://rtc.topstepx.com/hubs/market?access_token=YOUR_JWT_TOKEN';
  const CONTRACT_ID = 'CON.F.US.RTY.H25';

  const rtcConnection = new HubConnectionBuilder()
    .withUrl(marketHubUrl, {
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      accessTokenFactory: () => JWT_TOKEN,
      timeout: 10000
    })
    .withAutomaticReconnect()
    .build();

  rtcConnection.start().then(() => {
    const subscribe = () => {
      rtcConnection.invoke('SubscribeContractQuotes', CONTRACT_ID);
      rtcConnection.invoke('SubscribeContractTrades', CONTRACT_ID);
      rtcConnection.invoke('SubscribeContractMarketDepth', CONTRACT_ID);
    };

    const unsubscribe = () => {
      rtcConnection.invoke('UnsubscribeContractQuotes', CONTRACT_ID);
      rtcConnection.invoke('UnsubscribeContractTrades', CONTRACT_ID);
      rtcConnection.invoke('UnsubscribeContractMarketDepth', CONTRACT_ID);
    };

    rtcConnection.on('GatewayQuote', (contractId, data) => {
      console.log('Received market quote data', data);
    });

    rtcConnection.on('GatewayTrade', (contractId, data) => {
      console.log('Received market trade data', data);
    });

    rtcConnection.on('GatewayDepth', (contractId, data) => {
      console.log('Received market depth data', data);
    });

    subscribe();

    rtcConnection.onreconnected((connectionId) => {
      console.log('RTC Connection Reconnected');
      subscribe();
    });
  }).catch((err) => {
    console.error('Error starting connection:', err);
  });
}

setupSignalRConnection();
```

---

## Real-Time Event Payloads

### User Hub Events

#### GatewayUserAccount

```json
{
  "id": 123,
  "name": "Main Trading Account",
  "balance": 10000.50,
  "canTrade": true,
  "isVisible": true,
  "simulated": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | The account ID |
| `name` | string | The name of the account |
| `balance` | number | The current balance of the account |
| `canTrade` | bool | Whether the account is eligible for trading |
| `isVisible` | bool | Whether the account should be visible |
| `simulated` | bool | Whether the account is simulated or live |

#### GatewayUserPosition

```json
{
  "id": 456,
  "accountId": 123,
  "contractId": "CON.F.US.EP.U25",
  "creationTimestamp": "2024-07-21T13:45:00Z",
  "type": 1,
  "size": 2,
  "averagePrice": 2100.25
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | The position ID |
| `accountId` | int | The account associated with the position |
| `contractId` | string | The contract ID associated with the position |
| `creationTimestamp` | string | Timestamp when the position was created |
| `type` | int (PositionType) | The type of the position (long/short) |
| `size` | int | The size of the position |
| `averagePrice` | number | The average price of the position |

#### GatewayUserOrder

```json
{
  "id": 789,
  "accountId": 123,
  "contractId": "CON.F.US.EP.U25",
  "symbolId": "F.US.EP",
  "creationTimestamp": "2024-07-21T13:45:00Z",
  "updateTimestamp": "2024-07-21T13:46:00Z",
  "status": 1,
  "type": 1,
  "side": 0,
  "size": 1,
  "limitPrice": 2100.50,
  "stopPrice": null,
  "fillVolume": 0,
  "filledPrice": null,
  "customTag": "strategy-1"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | long | The order ID |
| `accountId` | int | The account associated with the order |
| `contractId` | string | The contract ID |
| `symbolId` | string | The symbol ID |
| `creationTimestamp` | string | Timestamp when the order was created |
| `updateTimestamp` | string | Timestamp when the order was last updated |
| `status` | int (OrderStatus) | Current status of the order |
| `type` | int (OrderType) | Type of the order |
| `side` | int (OrderSide) | Side of the order (bid/ask) |
| `size` | int | Size of the order |
| `limitPrice` | number | Limit price, if applicable |
| `stopPrice` | number | Stop price, if applicable |
| `fillVolume` | int | Number of contracts filled |
| `filledPrice` | number | Price at which the order was filled |
| `customTag` | string | Custom tag, if any |

#### GatewayUserTrade

```json
{
  "id": 101112,
  "accountId": 123,
  "contractId": "CON.F.US.EP.U25",
  "creationTimestamp": "2024-07-21T13:47:00Z",
  "price": 2100.75,
  "profitAndLoss": 50.25,
  "fees": 2.50,
  "side": 0,
  "size": 1,
  "voided": false,
  "orderId": 789
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | long | The trade ID |
| `accountId` | int | The account ID |
| `contractId` | string | The contract ID |
| `creationTimestamp` | string | Timestamp when the trade was created |
| `price` | number | Price at which the trade was executed |
| `profitAndLoss` | number | Total P&L of the trade (`null` = half-turn) |
| `fees` | number | Total fees |
| `side` | int (OrderSide) | Side of the trade (bid/ask) |
| `size` | int | Size of the trade |
| `voided` | bool | Whether the trade is voided |
| `orderId` | long | The associated order ID |

### Market Hub Events

#### GatewayQuote

```json
{
  "symbol": "F.US.EP",
  "symbolName": "/ES",
  "lastPrice": 2100.25,
  "bestBid": 2100.00,
  "bestAsk": 2100.50,
  "change": 25.50,
  "changePercent": 0.14,
  "open": 2090.00,
  "high": 2110.00,
  "low": 2080.00,
  "volume": 12000,
  "lastUpdated": "2024-07-21T13:45:00Z",
  "timestamp": "2024-07-21T13:45:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `symbol` | string | The symbol ID |
| `symbolName` | string | Friendly symbol name (currently unused) |
| `lastPrice` | number | Last traded price |
| `bestBid` | number | Current best bid price |
| `bestAsk` | number | Current best ask price |
| `change` | number | Price change since previous close |
| `changePercent` | number | Percent change since previous close |
| `open` | number | Opening price |
| `high` | number | Session high price |
| `low` | number | Session low price |
| `volume` | number | Total traded volume |
| `lastUpdated` | string | Last updated time |
| `timestamp` | string | Quote timestamp |

#### GatewayDepth

```json
{
  "timestamp": "2024-07-21T13:45:00Z",
  "type": 1,
  "price": 2100.00,
  "volume": 10,
  "currentVolume": 5
}
```

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | Timestamp of the DOM update |
| `type` | int (DomType) | DOM type |
| `price` | number | The price level |
| `volume` | number | Total volume at this price level |
| `currentVolume` | int | Current volume at this price level |

#### GatewayTrade

```json
{
  "symbolId": "F.US.EP",
  "price": 2100.25,
  "timestamp": "2024-07-21T13:45:00Z",
  "type": 0,
  "volume": 2
}
```

| Field | Type | Description |
|-------|------|-------------|
| `symbolId` | string | The symbol ID |
| `price` | number | The trade price |
| `timestamp` | string | The trade timestamp |
| `type` | int (TradeLogType) | TradeLog type |
| `volume` | number | The trade volume |

---

## Enum Definitions

> **WARNING:** ALWAYS use named enum constants, NEVER bare integers. Using `side: 0` instead of `side: OrderSide.Bid` is a risk guardrail violation -- bare integers are unreadable, error-prone, and make code review impossible. See safety-patterns.md SAF-01 for complete enum constant definitions and usage patterns.

### OrderSide

| Value | Name |
|-------|------|
| 0 | Bid |
| 1 | Ask |

### OrderType

| Value | Name |
|-------|------|
| 0 | Unknown |
| 1 | Limit |
| 2 | Market |
| 3 | StopLimit |
| 4 | Stop |
| 5 | TrailingStop |
| 6 | JoinBid |
| 7 | JoinAsk |

### OrderStatus

| Value | Name |
|-------|------|
| 0 | None |
| 1 | Open |
| 2 | Filled |
| 3 | Cancelled |
| 4 | Expired |
| 5 | Rejected |
| 6 | Pending |

### PositionType

| Value | Name |
|-------|------|
| 0 | Undefined |
| 1 | Long |
| 2 | Short |

### DomType

| Value | Name |
|-------|------|
| 0 | Unknown |
| 1 | Ask |
| 2 | Bid |
| 3 | BestAsk |
| 4 | BestBid |
| 5 | Trade |
| 6 | Reset |
| 7 | Low |
| 8 | High |
| 9 | NewBestBid |
| 10 | NewBestAsk |
| 11 | Fill |

### TradeLogType

| Value | Name |
|-------|------|
| 0 | Buy |
| 1 | Sell |

---

## Safety Cross-References

The following safety patterns in `safety-patterns.md` are directly related to API usage documented above:

| Safety Pattern | Topic | Relevant API Section |
|----------------|-------|----------------------|
| **SAF-01** | Enum Constants | Enum Definitions -- use named constants, never bare integers |
| **SAF-02** | JWT Token Refresh | Authentication -- proactive refresh before 24hr expiry |
| **SAF-03** | Rate Limit Compliance | Rate Limits -- 50/30s for history, 200/60s for general |
| **SAF-05** | Error Handling | Order API -- handling 429, rejected orders, connection failures |

All generated trading bot code MUST load and apply these safety patterns. See `safety-patterns.md` for complete implementations.
