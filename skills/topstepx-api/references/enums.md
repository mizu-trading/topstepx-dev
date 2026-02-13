# TopStepX API Enum Definitions

Complete reference for all enum types used in the TopStepX API.

---

## OrderSide

Indicates buy or sell direction.

| Value | Name | Description                |
|-------|------|----------------------------|
| 0     | Bid  | Buy order / buy side       |
| 1     | Ask  | Sell order / sell side     |

**Usage:** Used in order placement (`side` field), order events, trade events, and position context.

---

## OrderType

Specifies the order execution type.

| Value | Name         | Description                                          |
|-------|-------------|------------------------------------------------------|
| 0     | Unknown      | Unknown/unspecified order type                        |
| 1     | Limit        | Execute at specified price or better. Requires `limitPrice`. |
| 2     | Market       | Execute immediately at current market price          |
| 3     | StopLimit    | Becomes a limit order when stop price is hit. Requires both `stopPrice` and `limitPrice`. |
| 4     | Stop         | Becomes a market order when stop price is hit. Requires `stopPrice`. |
| 5     | TrailingStop | Stop that trails the market by a set amount. Requires `trailPrice`. |
| 6     | JoinBid      | Join the current best bid price                      |
| 7     | JoinAsk      | Join the current best ask price                      |

**Usage:** Used in `/api/Order/place` (`type` field), order search results, order events, and bracket order configuration.

### Order Type to Required Fields

| OrderType    | limitPrice | stopPrice | trailPrice |
|-------------|------------|-----------|------------|
| Market (2)   | -          | -         | -          |
| Limit (1)    | Required   | -         | -          |
| Stop (4)     | -          | Required  | -          |
| StopLimit (3) | Required   | Required  | -          |
| TrailingStop (5) | -      | -         | Required   |
| JoinBid (6)  | -          | -         | -          |
| JoinAsk (7)  | -          | -         | -          |

---

## OrderStatus

Current status of an order.

| Value | Name      | Description                                    |
|-------|-----------|------------------------------------------------|
| 0     | None      | No status / uninitialized                      |
| 1     | Open      | Order is active and working                    |
| 2     | Filled    | Order has been completely filled               |
| 3     | Cancelled | Order was cancelled by user or system          |
| 4     | Expired   | Order expired (e.g., end of session)           |
| 5     | Rejected  | Order was rejected by the system               |
| 6     | Pending   | Order is pending submission/acceptance         |

**Usage:** Used in order search results and order events (`status` field).

### Status Transitions

Typical order lifecycle:
- New order: `Pending (6)` -> `Open (1)` -> `Filled (2)`
- Cancelled: `Open (1)` -> `Cancelled (3)`
- Rejected: `Pending (6)` -> `Rejected (5)`
- Expired: `Open (1)` -> `Expired (4)`

---

## PositionType

Direction of an open position.

| Value | Name      | Description                           |
|-------|-----------|---------------------------------------|
| 0     | Undefined | Position direction not determined     |
| 1     | Long      | Long position (bought contracts)      |
| 2     | Short     | Short position (sold contracts)       |

**Usage:** Used in position search results and position events (`type` field).

---

## DomType

Depth of Market (Level 2) update types.

| Value | Name       | Description                              |
|-------|------------|------------------------------------------|
| 0     | Unknown    | Unknown DOM update type                  |
| 1     | Ask        | Ask side price level update              |
| 2     | Bid        | Bid side price level update              |
| 3     | BestAsk    | New best ask price                       |
| 4     | BestBid    | New best bid price                       |
| 5     | Trade      | Trade occurred at this level             |
| 6     | Reset      | DOM data reset (clear and rebuild)       |
| 7     | Low        | Session low update                       |
| 8     | High       | Session high update                      |
| 9     | NewBestBid | New best bid (alternative notification)  |
| 10    | NewBestAsk | New best ask (alternative notification)  |
| 11    | Fill       | Fill occurred at this level              |

**Usage:** Used in Market Hub `GatewayDepth` events (`type` field).

---

## TradeLogType

Direction of a market trade (time & sales).

| Value | Name | Description              |
|-------|------|--------------------------|
| 0     | Buy  | Trade hit the ask (buyer initiated) |
| 1     | Sell | Trade hit the bid (seller initiated) |

**Usage:** Used in Market Hub `GatewayTrade` events (`type` field).
