# Bot Scaffold Template (JavaScript/TypeScript)

Near-runnable scaffold for a TopStepX trading bot in JavaScript/TypeScript. All safety infrastructure (SAF-01 through SAF-05) is implemented as non-optional defaults. Strategy-specific logic is marked with placeholder comments.

**Purpose:** Give agents a working bot structure where they fill in strategy logic but MUST NOT modify safety infrastructure code.

<template>

```javascript
// ============================================================================
// TopStepX Trading Bot Scaffold (JavaScript/TypeScript)
// ============================================================================
// Safety patterns SAF-01 through SAF-05 are implemented below.
// DO NOT modify safety infrastructure code.
// Fill in strategy logic where marked with "YOUR STRATEGY LOGIC" comments.
// ============================================================================

const { HubConnectionBuilder, HttpTransportType } = require('@microsoft/signalr');

// --- CONFIG ---
const CONFIG = {
  apiBaseUrl: 'https://api.topstepx.com',
  rtcBaseUrl: 'https://rtc.topstepx.com',
  username: process.env.TSX_USERNAME,
  apiKey: process.env.TSX_API_KEY,
  contractId: 0,        // Set after contract lookup
  accountId: 0,         // Set after account search
  // Risk parameters (fill from risk-parameters.md)
  maxPositionSize: 1,   // Max contracts per order
  stopLossTicks: 20,    // Default stop-loss
  takeProfitTicks: 40,  // Default take-profit (2:1 R:R)
  maxDailyLoss: 1600,   // Dollar amount
  maxConsecutiveLosses: 3,
};

// ============================================================================
// SAF-01: Enum Constants (Risk Guardrails)
// NEVER use bare integers for API enums. Always use these named constants.
// ============================================================================

const OrderSide = { Bid: 0, Ask: 1 };

const OrderType = {
  Unknown: 0, Limit: 1, Market: 2, StopLimit: 3,
  Stop: 4, TrailingStop: 5, JoinBid: 6, JoinAsk: 7
};

const OrderStatus = {
  None: 0, Open: 1, Filled: 2, Cancelled: 3,
  Expired: 4, Rejected: 5, Pending: 6
};

const PositionType = { Undefined: 0, Long: 1, Short: 2 };

const TimeInForce = { Day: 0, GTC: 1, GTD: 2, IOC: 3, FOK: 4 };

const BarTimeUnit = {
  Second: 1, Minute: 2, Hour: 3, Day: 4, Week: 5, Month: 6
};

// ============================================================================
// SAF-02: JWT Token Refresh
// Proactive refresh at 23 hours. Never wait for 401.
// ============================================================================

class TokenManager {
  constructor(initialToken) {
    this.token = initialToken;
    this.refreshInterval = 23 * 60 * 60 * 1000; // 23 hours
    this.startRefreshTimer();
  }

  getToken() {
    return this.token;
  }

  async refreshToken() {
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}/api/Auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success && data.newToken) {
        this.token = data.newToken;
        console.log('[TokenManager] Token refreshed successfully');
        this.startRefreshTimer();
      } else {
        console.error('[TokenManager] Refresh failed, re-authenticating...');
        await this.reAuthenticate();
      }
    } catch (err) {
      console.error(`[TokenManager] Refresh error: ${err.message}`);
      await this.reAuthenticate();
    }
  }

  async reAuthenticate() {
    const response = await fetch(`${CONFIG.apiBaseUrl}/api/Auth/loginKey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: CONFIG.username,
        apiKey: CONFIG.apiKey
      })
    });
    const data = await response.json();

    if (data.success && data.token) {
      this.token = data.token;
      this.startRefreshTimer();
      console.log('[TokenManager] Re-authenticated successfully');
    } else {
      throw new Error('Re-authentication failed -- check credentials');
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

// ============================================================================
// SAF-03: Rate Limit Compliance
// Track request timestamps per endpoint category. Wait for slot before sending.
// ============================================================================

const RATE_LIMITS = {
  HISTORY: { requests: 50, windowMs: 30_000 },
  GENERAL: { requests: 200, windowMs: 60_000 },
};

class RateLimiter {
  constructor(limit) {
    this.limit = limit;
    this.timestamps = [];
  }

  async waitForSlot() {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.limit.windowMs);

    if (this.timestamps.length >= this.limit.requests) {
      const oldestInWindow = this.timestamps[0];
      const waitMs = this.limit.windowMs - (now - oldestInWindow) + 100;
      console.log(`[RateLimiter] Waiting ${waitMs}ms for rate limit slot`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    this.timestamps.push(Date.now());
  }
}

const historyLimiter = new RateLimiter(RATE_LIMITS.HISTORY);
const generalLimiter = new RateLimiter(RATE_LIMITS.GENERAL);

// ============================================================================
// SAF-01: Order Creation with Bracket Defaults
// ALWAYS include stopLossBracket and takeProfitBracket. Position sizing enforced.
// ============================================================================

function createOrder(side, size, contractId, accountId, options = {}) {
  const defaultStopLoss = options.stopLossTicks || CONFIG.stopLossTicks;
  const defaultTakeProfit = options.takeProfitTicks || CONFIG.takeProfitTicks;

  return {
    accountId,
    contractId,
    side: side,
    type: OrderType.Market,
    size: Math.min(size, CONFIG.maxPositionSize),
    stopLossBracket: { ticks: defaultStopLoss, type: OrderType.Limit },
    takeProfitBracket: { ticks: defaultTakeProfit, type: OrderType.Limit }
  };
}

// ============================================================================
// SAF-05: Safe Order Placement with Error Handling
// Handles rate limiting (429), rejection (success: false), connection failure.
// ============================================================================

async function placeOrderSafe(orderParams, tokenManager, retried = false) {
  try {
    await generalLimiter.waitForSlot();

    const response = await fetch(`${CONFIG.apiBaseUrl}/api/Order/place`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderParams)
    });

    if (response.status === 429) {
      if (retried) {
        console.error('[Order] Rate limited after retry -- aborting');
        return { success: false, error: 'Rate limited after retry' };
      }
      console.warn('[Order] Rate limited, backing off 5 seconds...');
      await new Promise(r => setTimeout(r, 5000));
      return placeOrderSafe(orderParams, tokenManager, true);
    }

    const data = await response.json();

    if (!data.success) {
      console.error(`[Order] Rejected: ${data.errorMessage} (code: ${data.errorCode})`);
      return { success: false, error: data.errorMessage, errorCode: data.errorCode };
    }

    return { success: true, orderId: data.orderId };
  } catch (err) {
    console.error(`[Order] Connection error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ============================================================================
// Bot Class
// ============================================================================

class TradingBot {
  constructor() {
    this.tokenManager = null;
    this.marketHub = null;
    this.userHub = null;
    this.running = false;
    this.dailyPnL = 0;
    this.consecutiveLosses = 0;
    this.currentPosition = { size: 0, side: PositionType.Undefined };

    // --- YOUR STRATEGY LOGIC ---
    // Initialize your strategy state here (indicators, signal buffers, etc.)
    // Example:
    // this.emaFast = [];
    // this.emaSlow = [];
    // --- END YOUR STRATEGY LOGIC ---
  }

  // --------------------------------------------------------------------------
  // Connection & Authentication
  // --------------------------------------------------------------------------

  async connect() {
    // Authenticate
    const loginResponse = await fetch(`${CONFIG.apiBaseUrl}/api/Auth/loginKey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: CONFIG.username,
        apiKey: CONFIG.apiKey
      })
    });
    const loginData = await loginResponse.json();

    if (!loginData.success || !loginData.token) {
      throw new Error(`Authentication failed: ${loginData.errorMessage || 'Unknown error'}`);
    }

    this.tokenManager = new TokenManager(loginData.token);
    console.log('[Bot] Authenticated successfully');

    // Search for account
    await generalLimiter.waitForSlot();
    const accountResponse = await fetch(`${CONFIG.apiBaseUrl}/api/Account/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.tokenManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const accountData = await accountResponse.json();

    if (accountData.accounts && accountData.accounts.length > 0) {
      CONFIG.accountId = accountData.accounts[0].id;
      console.log(`[Bot] Account found: ${CONFIG.accountId}`);
    } else {
      throw new Error('No accounts found');
    }

    // --- YOUR STRATEGY LOGIC ---
    // Look up your contract, fetch historical data, initialize indicators
    // Example:
    // const bars = await this.fetchHistoricalBars(contractId, 100, 5, BarTimeUnit.Minute);
    // this.initializeIndicators(bars);
    // --- END YOUR STRATEGY LOGIC ---

    // Connect WebSocket hubs
    await this.connectWebSockets();
    this.running = true;
    console.log('[Bot] Connected and running');
  }

  async connectWebSockets() {
    // Market Hub
    this.marketHub = new HubConnectionBuilder()
      .withUrl(`${CONFIG.rtcBaseUrl}/markethub`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => this.tokenManager.getToken(),
        timeout: 10000
      })
      .withAutomaticReconnect()
      .build();

    // SAF-05: Re-subscribe after reconnection
    this.marketHub.onreconnected((connectionId) => {
      console.log(`[MarketHub] Reconnected (${connectionId}), re-subscribing...`);
      if (CONFIG.contractId) {
        this.marketHub.invoke('SubscribeContractQuotes', CONFIG.contractId);
      }
    });

    this.marketHub.onclose((error) => {
      console.error('[MarketHub] Connection closed:', error);
      if (this.running) {
        setTimeout(() => this.marketHub.start(), 5000);
      }
    });

    this.marketHub.on('GatewayQuote', (quote) => this.onQuote(quote));

    // User Hub
    this.userHub = new HubConnectionBuilder()
      .withUrl(`${CONFIG.rtcBaseUrl}/userhub`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => this.tokenManager.getToken(),
        timeout: 10000
      })
      .withAutomaticReconnect()
      .build();

    // SAF-05: Re-subscribe after reconnection
    this.userHub.onreconnected((connectionId) => {
      console.log(`[UserHub] Reconnected (${connectionId}), re-subscribing...`);
      this.userHub.invoke('SubscribeAccounts');
      this.userHub.invoke('SubscribeOrders', CONFIG.accountId);
      this.userHub.invoke('SubscribePositions', CONFIG.accountId);
      this.userHub.invoke('SubscribeTrades', CONFIG.accountId);
    });

    this.userHub.onclose((error) => {
      console.error('[UserHub] Connection closed:', error);
      if (this.running) {
        setTimeout(() => this.userHub.start(), 5000);
      }
    });

    this.userHub.on('GatewayOrder', (order) => this.onOrderEvent(order));
    this.userHub.on('GatewayPosition', (position) => this.onPositionEvent(position));

    // Start connections
    await this.marketHub.start();
    await this.userHub.start();

    // Subscribe
    if (CONFIG.contractId) {
      await this.marketHub.invoke('SubscribeContractQuotes', CONFIG.contractId);
    }
    await this.userHub.invoke('SubscribeAccounts');
    await this.userHub.invoke('SubscribeOrders', CONFIG.accountId);
    await this.userHub.invoke('SubscribePositions', CONFIG.accountId);
    await this.userHub.invoke('SubscribeTrades', CONFIG.accountId);

    console.log('[Bot] WebSocket subscriptions active');
  }

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  onQuote(quote) {
    if (!this.running) return;

    // --- YOUR STRATEGY LOGIC ---
    // Process incoming quote data
    // Update indicator calculations
    // Example:
    // this.updateIndicators(quote);
    // --- END YOUR STRATEGY LOGIC ---

    // Evaluate signal after processing quote
    this.evaluateSignal(quote);
  }

  evaluateSignal(quote) {
    if (!this.running) return;

    // Safety checks before any signal evaluation
    if (Math.abs(this.dailyPnL) >= CONFIG.maxDailyLoss) {
      console.log('[Bot] Daily loss limit reached -- no new trades');
      return;
    }
    if (this.consecutiveLosses >= CONFIG.maxConsecutiveLosses) {
      console.log('[Bot] Consecutive loss limit reached -- pausing');
      return;
    }

    // --- YOUR STRATEGY LOGIC ---
    // Evaluate entry/exit conditions based on your indicators
    // Return a signal object: { action: 'buy'|'sell'|'none', reason: '...' }
    // Example:
    //
    // const signal = this.checkCrossover();
    // if (signal.action === 'buy' && this.currentPosition.size === 0) {
    //   this.placeOrder(OrderSide.Bid, 1);
    // } else if (signal.action === 'sell' && this.currentPosition.size === 0) {
    //   this.placeOrder(OrderSide.Ask, 1);
    // }
    // --- END YOUR STRATEGY LOGIC ---
  }

  onOrderEvent(order) {
    if (order.status === OrderStatus.Filled) {
      console.log(`[Order] Filled: ${order.orderId}, side=${order.side}, size=${order.size}`);
    } else if (order.status === OrderStatus.Rejected) {
      console.error(`[Order] Rejected: ${order.orderId}, reason=${order.errorMessage}`);
    }
  }

  onPositionEvent(position) {
    this.currentPosition = {
      size: position.size || 0,
      side: position.type || PositionType.Undefined
    };
    console.log(`[Position] Updated: side=${this.currentPosition.side}, size=${this.currentPosition.size}`);
  }

  // --------------------------------------------------------------------------
  // Order Placement (uses SAF-01 + SAF-05)
  // --------------------------------------------------------------------------

  async placeOrder(side, size, options = {}) {
    const orderParams = createOrder(side, size, CONFIG.contractId, CONFIG.accountId, options);
    console.log(`[Bot] Placing order: side=${side}, size=${orderParams.size}, ` +
                `SL=${orderParams.stopLossBracket.ticks}t, TP=${orderParams.takeProfitBracket.ticks}t`);

    const result = await placeOrderSafe(orderParams, this.tokenManager);
    if (result.success) {
      console.log(`[Bot] Order placed: ${result.orderId}`);
    } else {
      console.error(`[Bot] Order failed: ${result.error}`);
    }
    return result;
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------

  async fetchHistoricalBars(contractId, count, interval, timeUnit) {
    await historyLimiter.waitForSlot();
    const response = await fetch(`${CONFIG.apiBaseUrl}/api/History/retrieveBars`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.tokenManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contractId,
        live: false,
        count,
        unit: timeUnit,
        unitNumber: interval
      })
    });
    const data = await response.json();
    return data.bars || [];
  }

  // --------------------------------------------------------------------------
  // Shutdown
  // --------------------------------------------------------------------------

  async shutdown() {
    console.log('[Bot] Shutting down...');
    this.running = false;

    // Cancel open orders and flatten positions if needed
    // (implement based on strategy requirements)

    if (this.marketHub) {
      try { await this.marketHub.stop(); } catch (e) { /* ignore */ }
    }
    if (this.userHub) {
      try { await this.userHub.stop(); } catch (e) { /* ignore */ }
    }
    if (this.tokenManager) {
      this.tokenManager.destroy();
    }

    console.log('[Bot] Shutdown complete');
  }
}

// ============================================================================
// Entry Point
// ============================================================================

async function main() {
  if (!CONFIG.username || !CONFIG.apiKey) {
    console.error('Missing TSX_USERNAME or TSX_API_KEY environment variables');
    process.exit(1);
  }

  const bot = new TradingBot();

  // Graceful shutdown on SIGINT/SIGTERM
  process.on('SIGINT', async () => {
    await bot.shutdown();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await bot.shutdown();
    process.exit(0);
  });

  try {
    await bot.connect();
  } catch (err) {
    console.error(`[Bot] Fatal error: ${err.message}`);
    await bot.shutdown();
    process.exit(1);
  }
}

main();
```

</template>

<guidelines>

**Safety infrastructure is NON-NEGOTIABLE. Agents MUST NOT modify:**
- Enum constant definitions (OrderSide, OrderType, OrderStatus, PositionType, TimeInForce, BarTimeUnit)
- TokenManager class (proactive 23-hour refresh, re-authentication fallback)
- RateLimiter class and RATE_LIMITS constants
- createOrder function (bracket defaults, position sizing via Math.min)
- placeOrderSafe function (429 handling, rejection logging, connection error catch)
- WebSocket reconnection handlers (onreconnected re-subscribe pattern)
- Graceful shutdown signal handlers

**Agents SHOULD fill in sections marked with `// --- YOUR STRATEGY LOGIC ---`:**
- Constructor: Initialize strategy state (indicator arrays, signal buffers)
- connect(): Look up contract, fetch historical data, initialize indicators
- onQuote(): Process incoming quote data, update indicator calculations
- evaluateSignal(): Check entry/exit conditions, trigger placeOrder()

**When using this scaffold:**
1. Copy the entire scaffold as the starting point
2. Fill in CONFIG values from the strategy-spec.md and risk-parameters.md
3. Implement indicator calculations in the strategy sections
4. Implement signal evaluation logic
5. Test with TopStepX evaluation account first

**Dependencies:**
```bash
npm install @microsoft/signalr
```

**Environment variables required:**
- `TSX_USERNAME` -- TopStepX login username
- `TSX_API_KEY` -- TopStepX API key ($29/mo add-on)

</guidelines>
