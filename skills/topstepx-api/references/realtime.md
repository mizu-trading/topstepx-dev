# TopStepX Real-Time Data - SignalR WebSocket Reference

The TopStepX API uses SignalR over WebSocket for real-time streaming. There are two hubs: User Hub for account/order/position/trade updates, and Market Hub for quotes/trades/depth.

## Connection Configuration

### Required Settings

- **Transport**: WebSocket only (`skipNegotiation: true`)
- **Authentication**: JWT token via query parameter and `accessTokenFactory`
- **Auto-reconnect**: Enable and re-subscribe on reconnect
- **Timeout**: Recommend 10000ms

### Connection URLs

- **User Hub**: `https://rtc.topstepx.com/hubs/user?access_token=<JWT_TOKEN>`
- **Market Hub**: `https://rtc.topstepx.com/hubs/market?access_token=<JWT_TOKEN>`

---

## User Hub

URL: `https://rtc.topstepx.com/hubs/user`

### Subscribe/Unsubscribe Methods

| Method                   | Parameters  | Description                |
|--------------------------|-------------|----------------------------|
| `SubscribeAccounts`      | none        | Account balance updates    |
| `UnsubscribeAccounts`    | none        | Stop account updates       |
| `SubscribeOrders`        | accountId   | Order status changes       |
| `UnsubscribeOrders`      | accountId   | Stop order updates         |
| `SubscribePositions`     | accountId   | Position updates           |
| `UnsubscribePositions`   | accountId   | Stop position updates      |
| `SubscribeTrades`        | accountId   | Trade executions           |
| `UnsubscribeTrades`      | accountId   | Stop trade updates         |

### Events

#### GatewayUserAccount

Fired when account data changes (balance updates, status changes).

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

| Field       | Type    | Description                              |
|-------------|---------|------------------------------------------|
| `id`        | int     | The account ID                           |
| `name`      | string  | The name of the account                  |
| `balance`   | number  | The current balance of the account       |
| `canTrade`  | bool    | Whether the account is eligible for trading |
| `isVisible` | bool    | Whether the account should be visible    |
| `simulated` | bool    | Whether the account is simulated or live |

#### GatewayUserOrder

Fired when an order is created, updated, filled, cancelled, or rejected.

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

| Field               | Type   | Description                                |
|---------------------|--------|--------------------------------------------|
| `id`                | long   | The order ID                               |
| `accountId`         | int    | The account associated with the order      |
| `contractId`        | string | The contract ID                            |
| `symbolId`          | string | The symbol ID                              |
| `creationTimestamp`  | string | Timestamp when the order was created       |
| `updateTimestamp`    | string | Timestamp when the order was last updated  |
| `status`            | int    | OrderStatus enum value                     |
| `type`              | int    | OrderType enum value                       |
| `side`              | int    | OrderSide enum value (0=Bid, 1=Ask)        |
| `size`              | int    | Size of the order                          |
| `limitPrice`        | number | Limit price, if applicable                 |
| `stopPrice`         | number | Stop price, if applicable                  |
| `fillVolume`        | int    | Number of contracts filled                 |
| `filledPrice`       | number | Price at which the order was filled        |
| `customTag`         | string | Custom tag, if any                         |

#### GatewayUserPosition

Fired when a position is opened, updated, or closed.

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

| Field               | Type   | Description                                |
|---------------------|--------|--------------------------------------------|
| `id`                | int    | The position ID                            |
| `accountId`         | int    | The account associated with the position   |
| `contractId`        | string | The contract ID                            |
| `creationTimestamp`  | string | Timestamp when the position was created    |
| `type`              | int    | PositionType enum (0=Undefined, 1=Long, 2=Short) |
| `size`              | int    | The size of the position                   |
| `averagePrice`      | number | The average price of the position          |

#### GatewayUserTrade

Fired when a trade execution occurs.

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

| Field              | Type   | Description                                  |
|--------------------|--------|----------------------------------------------|
| `id`               | long   | The trade ID                                 |
| `accountId`        | int    | The account ID                               |
| `contractId`       | string | The contract ID                              |
| `creationTimestamp` | string | Timestamp when the trade was created         |
| `price`            | number | Execution price                              |
| `profitAndLoss`    | number | P&L of the trade (null = half-turn)          |
| `fees`             | number | Total fees                                   |
| `side`             | int    | OrderSide enum (0=Bid, 1=Ask)                |
| `size`             | int    | Size of the trade                            |
| `voided`           | bool   | Whether the trade is voided                  |
| `orderId`          | long   | The associated order ID                      |

---

## Market Hub

URL: `https://rtc.topstepx.com/hubs/market`

### Subscribe/Unsubscribe Methods

| Method                            | Parameters  | Description             |
|-----------------------------------|-------------|-------------------------|
| `SubscribeContractQuotes`         | contractId  | Quote/price updates     |
| `UnsubscribeContractQuotes`       | contractId  | Stop quote updates      |
| `SubscribeContractTrades`         | contractId  | Market trade data       |
| `UnsubscribeContractTrades`       | contractId  | Stop trade data         |
| `SubscribeContractMarketDepth`    | contractId  | DOM / Level 2 data      |
| `UnsubscribeContractMarketDepth`  | contractId  | Stop DOM data           |

### Events

Note: Market Hub event callbacks receive `(contractId, data)` - two arguments.

#### GatewayQuote

Real-time quote updates for a contract.

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

| Field           | Type   | Description                          |
|-----------------|--------|--------------------------------------|
| `symbol`        | string | The symbol ID                        |
| `symbolName`    | string | Friendly symbol name (currently unused) |
| `lastPrice`     | number | Last traded price                    |
| `bestBid`       | number | Current best bid price               |
| `bestAsk`       | number | Current best ask price               |
| `change`        | number | Price change since previous close    |
| `changePercent` | number | Percent change since previous close  |
| `open`          | number | Opening price                        |
| `high`          | number | Session high price                   |
| `low`           | number | Session low price                    |
| `volume`        | number | Total traded volume                  |
| `lastUpdated`   | string | Last updated time                    |
| `timestamp`     | string | Quote timestamp                      |

#### GatewayDepth

Level 2 / DOM (Depth of Market) updates.

```json
{
  "timestamp": "2024-07-21T13:45:00Z",
  "type": 1,
  "price": 2100.00,
  "volume": 10,
  "currentVolume": 5
}
```

| Field           | Type   | Description                          |
|-----------------|--------|--------------------------------------|
| `timestamp`     | string | Timestamp of the DOM update          |
| `type`          | int    | DomType enum value                   |
| `price`         | number | The price level                      |
| `volume`        | number | Total volume at this price level     |
| `currentVolume` | int    | Current volume at this price level   |

#### GatewayTrade

Market trade (time & sales) data.

```json
{
  "symbolId": "F.US.EP",
  "price": 2100.25,
  "timestamp": "2024-07-21T13:45:00Z",
  "type": 0,
  "volume": 2
}
```

| Field      | Type   | Description                          |
|------------|--------|--------------------------------------|
| `symbolId` | string | The symbol ID                        |
| `price`    | number | The trade price                      |
| `timestamp`| string | The trade timestamp                  |
| `type`     | int    | TradeLogType enum (0=Buy, 1=Sell)    |
| `volume`   | number | The trade volume                     |

---

## JavaScript Connection Example - User Hub

```javascript
const { HubConnectionBuilder, HttpTransportType } = require('@microsoft/signalr');

function setupUserHub(jwtToken, accountId) {
  const userHubUrl = 'https://rtc.topstepx.com/hubs/user';

  const connection = new HubConnectionBuilder()
    .withUrl(userHubUrl, {
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      accessTokenFactory: () => jwtToken,
      timeout: 10000
    })
    .withAutomaticReconnect()
    .build();

  const subscribe = () => {
    connection.invoke('SubscribeAccounts');
    connection.invoke('SubscribeOrders', accountId);
    connection.invoke('SubscribePositions', accountId);
    connection.invoke('SubscribeTrades', accountId);
  };

  connection.on('GatewayUserAccount', (data) => {
    console.log('Account update:', data);
  });

  connection.on('GatewayUserOrder', (data) => {
    console.log('Order update:', data);
  });

  connection.on('GatewayUserPosition', (data) => {
    console.log('Position update:', data);
  });

  connection.on('GatewayUserTrade', (data) => {
    console.log('Trade update:', data);
  });

  connection.start().then(() => {
    subscribe();
  });

  connection.onreconnected(() => {
    subscribe();
  });

  return connection;
}
```

## JavaScript Connection Example - Market Hub

```javascript
const { HubConnectionBuilder, HttpTransportType } = require('@microsoft/signalr');

function setupMarketHub(jwtToken, contractId) {
  const marketHubUrl = 'https://rtc.topstepx.com/hubs/market';

  const connection = new HubConnectionBuilder()
    .withUrl(marketHubUrl, {
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      accessTokenFactory: () => jwtToken,
      timeout: 10000
    })
    .withAutomaticReconnect()
    .build();

  const subscribe = () => {
    connection.invoke('SubscribeContractQuotes', contractId);
    connection.invoke('SubscribeContractTrades', contractId);
    connection.invoke('SubscribeContractMarketDepth', contractId);
  };

  connection.on('GatewayQuote', (contractId, data) => {
    console.log('Quote:', data);
  });

  connection.on('GatewayTrade', (contractId, data) => {
    console.log('Market trade:', data);
  });

  connection.on('GatewayDepth', (contractId, data) => {
    console.log('Depth:', data);
  });

  connection.start().then(() => {
    subscribe();
  });

  connection.onreconnected(() => {
    subscribe();
  });

  return connection;
}
```

## SignalR Client Libraries by Language

When generating code for other languages, use the appropriate SignalR client:

| Language      | Package/Library                                           |
|---------------|-----------------------------------------------------------|
| JavaScript    | `@microsoft/signalr` (npm)                                |
| Python        | `signalrcore` or `pysignalr` (pip)                        |
| C# / .NET     | `Microsoft.AspNetCore.SignalR.Client` (NuGet)             |
| Java          | `com.microsoft.signalr` (Maven/Gradle)                    |
| Go            | `github.com/philippseith/signalr` or manual WebSocket     |
| Rust          | Manual WebSocket with SignalR protocol implementation     |

### Key implementation notes for all languages:

1. Always use WebSocket transport and skip negotiation
2. Pass the JWT token both as query parameter and in the connection configuration
3. Enable automatic reconnection
4. Re-subscribe to all channels after reconnection
5. Market Hub events pass `(contractId, data)` as two arguments; User Hub events pass `(data)` as one argument
