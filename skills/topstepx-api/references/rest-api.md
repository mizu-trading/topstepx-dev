# TopStepX REST API - Complete Endpoint Reference

All endpoints are POST requests to `https://api.topstepx.com`. Include `Authorization: Bearer <token>` header on every request.

---

## Authentication

### POST /api/Auth/loginKey

Authenticate with API key. Recommended for automated systems.

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

### POST /api/Auth/loginApp

Authenticate as application.

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

### POST /api/Auth/validate

Validate and refresh an existing session token. Call periodically to prevent expiry.

**Request:** Empty body. Send existing token in Authorization header.

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

## Account

### POST /api/Account/search

Search for trading accounts.

**Request:**
```json
{
  "onlyActiveAccounts": true
}
```

| Parameter            | Type    | Required | Description                        |
|----------------------|---------|----------|------------------------------------|
| `onlyActiveAccounts` | boolean | Yes      | Filter to only active accounts     |

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

## Contract / Market Data

### POST /api/Contract/available

List all available contracts.

**Request:**
```json
{
  "live": true
}
```

| Parameter | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| `live`    | boolean | Yes      | Retrieve live or sim contracts       |

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

### POST /api/Contract/search

Search for contracts by text.

**Request:**
```json
{
  "live": false,
  "searchText": "NQ"
}
```

| Parameter    | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| `searchText` | string  | Yes      | Contract name to search for          |
| `live`       | boolean | Yes      | Search using sim or live data        |

**Response:** Same structure as `/api/Contract/available`.

### POST /api/Contract/searchById

Get a specific contract by its ID.

**Request:**
```json
{
  "contractId": "CON.F.US.ENQ.H25"
}
```

| Parameter    | Type   | Required | Description          |
|-------------|--------|----------|----------------------|
| `contractId` | string | Yes      | The contract ID      |

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

### POST /api/History/retrieveBars

Retrieve historical OHLCV bar data. Rate limited to 50 requests / 30 seconds. Maximum 20,000 bars per request.

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

| Parameter           | Type     | Required | Description                               |
|---------------------|----------|----------|-------------------------------------------|
| `contractId`        | string   | Yes      | The contract ID                           |
| `live`              | boolean  | Yes      | Use sim or live data subscription         |
| `startTime`         | datetime | Yes      | Start time (ISO 8601)                     |
| `endTime`           | datetime | Yes      | End time (ISO 8601)                       |
| `unit`              | integer  | Yes      | Aggregation unit: 1=Second, 2=Minute, 3=Hour, 4=Day, 5=Week, 6=Month |
| `unitNumber`        | integer  | Yes      | Number of units per bar                   |
| `limit`             | integer  | Yes      | Maximum bars to retrieve (max 20,000)     |
| `includePartialBar` | boolean  | Yes      | Include partial bar for current period    |

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

Bar fields: `t`=timestamp, `o`=open, `h`=high, `l`=low, `c`=close, `v`=volume.

---

## Orders

### POST /api/Order/place

Place a new order. Supports market, limit, stop, stop-limit, trailing stop, and join orders with optional bracket orders.

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

| Parameter            | Type    | Required | Nullable | Description                                    |
|----------------------|---------|----------|----------|------------------------------------------------|
| `accountId`          | integer | Yes      | No       | The account ID                                 |
| `contractId`         | string  | Yes      | No       | The contract ID                                |
| `type`               | integer | Yes      | No       | OrderType enum value                           |
| `side`               | integer | Yes      | No       | 0=Bid (buy), 1=Ask (sell)                      |
| `size`               | integer | Yes      | No       | Number of contracts                            |
| `limitPrice`         | decimal | No       | Yes      | Limit price (for Limit/StopLimit orders)       |
| `stopPrice`          | decimal | No       | Yes      | Stop price (for Stop/StopLimit orders)         |
| `trailPrice`         | decimal | No       | Yes      | Trail price (for TrailingStop orders)          |
| `customTag`          | string  | No       | Yes      | Custom tag (must be unique per account)        |
| `stopLossBracket`    | object  | No       | Yes      | Stop loss bracket: `{ ticks: int, type: int }` |
| `takeProfitBracket`  | object  | No       | Yes      | Take profit bracket: `{ ticks: int, type: int }` |

**Response:**
```json
{
  "orderId": 9056,
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### POST /api/Order/search

Search order history for an account within a time range.

**Request:**
```json
{
  "accountId": 704,
  "startTimestamp": "2025-07-18T00:00:00Z",
  "endTimestamp": "2025-07-19T00:00:00Z"
}
```

| Parameter        | Type     | Required | Nullable | Description              |
|------------------|----------|----------|----------|--------------------------|
| `accountId`      | integer  | Yes      | No       | The account ID           |
| `startTimestamp`  | datetime | Yes      | No       | Start of time range      |
| `endTimestamp`    | datetime | No       | Yes      | End of time range        |

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

### POST /api/Order/searchOpen

Get all open (unfilled) orders for an account.

**Request:**
```json
{
  "accountId": 212
}
```

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

### POST /api/Order/cancel

Cancel an open order.

**Request:**
```json
{
  "accountId": 465,
  "orderId": 26974
}
```

| Parameter   | Type    | Required | Description    |
|-------------|---------|----------|----------------|
| `accountId` | integer | Yes      | The account ID |
| `orderId`   | integer | Yes      | The order ID   |

**Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### POST /api/Order/modify

Modify an existing open order.

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

| Parameter    | Type    | Required | Nullable | Description              |
|-------------|---------|----------|----------|--------------------------|
| `accountId`  | integer | Yes      | No       | The account ID           |
| `orderId`    | integer | Yes      | No       | The order ID             |
| `size`       | integer | No       | Yes      | New size                 |
| `limitPrice` | decimal | No       | Yes      | New limit price          |
| `stopPrice`  | decimal | No       | Yes      | New stop price           |
| `trailPrice` | decimal | No       | Yes      | New trail price          |

**Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

---

## Positions

### POST /api/Position/searchOpen

Get all open positions for an account.

**Request:**
```json
{
  "accountId": 536
}
```

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

### POST /api/Position/closeContract

Close an entire position for a contract.

**Request:**
```json
{
  "accountId": 536,
  "contractId": "CON.F.US.GMET.J25"
}
```

| Parameter    | Type    | Required | Description    |
|-------------|---------|----------|----------------|
| `accountId`  | integer | Yes      | The account ID |
| `contractId` | string  | Yes      | The contract ID |

**Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

### POST /api/Position/partialCloseContract

Partially close a position.

**Request:**
```json
{
  "accountId": 536,
  "contractId": "CON.F.US.GMET.J25",
  "size": 1
}
```

| Parameter    | Type    | Required | Description              |
|-------------|---------|----------|--------------------------|
| `accountId`  | integer | Yes      | The account ID           |
| `contractId` | string  | Yes      | The contract ID          |
| `size`       | integer | Yes      | Number of contracts to close |

**Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "errorMessage": null
}
```

---

## Trades

### POST /api/Trade/search

Search trade history for an account.

**Request:**
```json
{
  "accountId": 203,
  "startTimestamp": "2025-01-21T00:00:00Z",
  "endTimestamp": "2025-01-22T00:00:00Z"
}
```

| Parameter        | Type     | Required | Nullable | Description              |
|------------------|----------|----------|----------|--------------------------|
| `accountId`      | integer  | Yes      | No       | The account ID           |
| `startTimestamp`  | datetime | Yes      | No       | Start of time range      |
| `endTimestamp`    | datetime | No       | Yes      | End of time range        |

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

A `null` value for `profitAndLoss` indicates a half-turn trade (opening side of a round-turn).
