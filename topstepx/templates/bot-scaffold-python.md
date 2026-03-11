# Bot Scaffold Template (Python)

Near-runnable scaffold for a TopStepX trading bot in Python. All safety infrastructure (SAF-01 through SAF-05) is implemented as non-optional defaults. Strategy-specific logic is marked with placeholder comments.

**Purpose:** Give agents a working bot structure where they fill in strategy logic but MUST NOT modify safety infrastructure code.

<template>

```python
# ============================================================================
# TopStepX Trading Bot Scaffold (Python)
# ============================================================================
# Safety patterns SAF-01 through SAF-05 are implemented below.
# DO NOT modify safety infrastructure code.
# Fill in strategy logic where marked with "YOUR STRATEGY LOGIC" comments.
# ============================================================================

import asyncio
import os
import time
import signal
from collections import deque
from enum import IntEnum

import aiohttp
from pysignalr.client import SignalRClient
from pysignalr.messages import CompletionMessage


# --- CONFIG ---
CONFIG = {
    'api_base_url': 'https://api.topstepx.com',
    'rtc_base_url': 'https://rtc.topstepx.com',
    'username': os.environ.get('TSX_USERNAME', ''),
    'api_key': os.environ.get('TSX_API_KEY', ''),
    'contract_id': 0,       # Set after contract lookup
    'account_id': 0,        # Set after account search
    # Risk parameters (fill from risk-parameters.md)
    'max_position_size': 1,  # Max contracts per order
    'stop_loss_ticks': 20,   # Default stop-loss
    'take_profit_ticks': 40, # Default take-profit (2:1 R:R)
    'max_daily_loss': 1600,  # Dollar amount
    'max_consecutive_losses': 3,
}


# ============================================================================
# SAF-01: Enum Constants (Risk Guardrails)
# NEVER use bare integers for API enums. Always use these named constants.
# ============================================================================

class OrderSide(IntEnum):
    Bid = 0
    Ask = 1

class OrderType(IntEnum):
    Unknown = 0
    Limit = 1
    Market = 2
    StopLimit = 3
    Stop = 4
    TrailingStop = 5
    JoinBid = 6
    JoinAsk = 7

class OrderStatus(IntEnum):
    NONE = 0
    Open = 1
    Filled = 2
    Cancelled = 3
    Expired = 4
    Rejected = 5
    Pending = 6

class PositionType(IntEnum):
    Undefined = 0
    Long = 1
    Short = 2

class TimeInForce(IntEnum):
    Day = 0
    GTC = 1
    GTD = 2
    IOC = 3
    FOK = 4

class BarTimeUnit(IntEnum):
    Second = 1
    Minute = 2
    Hour = 3
    Day = 4
    Week = 5
    Month = 6


# ============================================================================
# SAF-02: JWT Token Refresh
# Proactive refresh at 23 hours. Never wait for 401.
# ============================================================================

class TokenManager:
    def __init__(self, initial_token: str):
        self.token = initial_token
        self.refresh_interval = 23 * 60 * 60  # 23 hours in seconds
        self._refresh_task = None
        self._start_refresh_timer()

    def get_token(self) -> str:
        return self.token

    async def refresh_token(self):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{CONFIG['api_base_url']}/api/Auth/validate",
                    headers={
                        'Authorization': f'Bearer {self.token}',
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    data = await response.json()

                    if data.get('success') and data.get('newToken'):
                        self.token = data['newToken']
                        print('[TokenManager] Token refreshed successfully')
                        self._start_refresh_timer()
                    else:
                        print('[TokenManager] Refresh failed, re-authenticating...')
                        await self.re_authenticate()
        except Exception as err:
            print(f'[TokenManager] Refresh error: {err}')
            await self.re_authenticate()

    async def re_authenticate(self):
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{CONFIG['api_base_url']}/api/Auth/loginKey",
                json={
                    'userName': CONFIG['username'],
                    'apiKey': CONFIG['api_key']
                }
            ) as response:
                data = await response.json()

                if data.get('success') and data.get('token'):
                    self.token = data['token']
                    self._start_refresh_timer()
                    print('[TokenManager] Re-authenticated successfully')
                else:
                    raise Exception('Re-authentication failed -- check credentials')

    def _start_refresh_timer(self):
        if self._refresh_task and not self._refresh_task.done():
            self._refresh_task.cancel()
        self._refresh_task = asyncio.ensure_future(self._refresh_loop())

    async def _refresh_loop(self):
        await asyncio.sleep(self.refresh_interval)
        await self.refresh_token()

    def destroy(self):
        if self._refresh_task and not self._refresh_task.done():
            self._refresh_task.cancel()


# ============================================================================
# SAF-03: Rate Limit Compliance
# Track request timestamps per endpoint category. Wait for slot before sending.
# ============================================================================

RATE_LIMITS = {
    'HISTORY': {'requests': 50, 'window_sec': 30},
    'GENERAL': {'requests': 200, 'window_sec': 60},
}


class RateLimiter:
    def __init__(self, limit: dict):
        self.max_requests = limit['requests']
        self.window_sec = limit['window_sec']
        self.timestamps = deque()

    async def wait_for_slot(self):
        now = time.time()
        # Remove timestamps outside the window
        while self.timestamps and now - self.timestamps[0] >= self.window_sec:
            self.timestamps.popleft()

        if len(self.timestamps) >= self.max_requests:
            oldest = self.timestamps[0]
            wait_sec = self.window_sec - (now - oldest) + 0.1  # +100ms buffer
            print(f'[RateLimiter] Waiting {wait_sec:.1f}s for rate limit slot')
            await asyncio.sleep(wait_sec)

        self.timestamps.append(time.time())


history_limiter = RateLimiter(RATE_LIMITS['HISTORY'])
general_limiter = RateLimiter(RATE_LIMITS['GENERAL'])


# ============================================================================
# SAF-01: Order Creation with Bracket Defaults
# ALWAYS include stop_loss and take_profit brackets. Position sizing enforced.
# ============================================================================

def create_order(side: OrderSide, size: int, contract_id: int, account_id: int, **options):
    stop_loss_ticks = options.get('stop_loss_ticks', CONFIG['stop_loss_ticks'])
    take_profit_ticks = options.get('take_profit_ticks', CONFIG['take_profit_ticks'])

    return {
        'accountId': account_id,
        'contractId': contract_id,
        'side': int(side),
        'type': int(OrderType.Market),
        'size': min(size, CONFIG['max_position_size']),
        'stopLossBracket': {'ticks': stop_loss_ticks, 'type': int(OrderType.Limit)},
        'takeProfitBracket': {'ticks': take_profit_ticks, 'type': int(OrderType.Limit)}
    }


# ============================================================================
# SAF-05: Safe Order Placement with Error Handling
# Handles rate limiting (429), rejection (success: false), connection failure.
# ============================================================================

async def place_order_safe(order_params: dict, token_manager: TokenManager, retried=False):
    try:
        await general_limiter.wait_for_slot()

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{CONFIG['api_base_url']}/api/Order/place",
                headers={
                    'Authorization': f'Bearer {token_manager.get_token()}',
                    'Content-Type': 'application/json'
                },
                json=order_params
            ) as response:
                # Failure mode 1: Rate limited (429)
                if response.status == 429:
                    if retried:
                        print('[Order] Rate limited after retry -- aborting')
                        return {'success': False, 'error': 'Rate limited after retry'}
                    print('[Order] Rate limited, backing off 5 seconds...')
                    await asyncio.sleep(5)
                    return await place_order_safe(order_params, token_manager, retried=True)

                data = await response.json()

                # Failure mode 2: Order rejected by system
                if not data.get('success'):
                    print(f"[Order] Rejected: {data.get('errorMessage')} (code: {data.get('errorCode')})")
                    return {'success': False, 'error': data.get('errorMessage'), 'errorCode': data.get('errorCode')}

                return {'success': True, 'orderId': data.get('orderId')}

    except Exception as err:
        # Failure mode 3: Connection failure
        print(f'[Order] Connection error: {err}')
        return {'success': False, 'error': str(err)}


# ============================================================================
# Bot Class
# ============================================================================

class TradingBot:
    def __init__(self):
        self.token_manager = None
        self.market_hub = None
        self.user_hub = None
        self.running = False
        self.daily_pnl = 0.0
        self.consecutive_losses = 0
        self.current_position = {'size': 0, 'side': PositionType.Undefined}

        # --- YOUR STRATEGY LOGIC ---
        # Initialize your strategy state here (indicators, signal buffers, etc.)
        # Example:
        # self.ema_fast = []
        # self.ema_slow = []
        # --- END YOUR STRATEGY LOGIC ---

    # -------------------------------------------------------------------------
    # Connection & Authentication
    # -------------------------------------------------------------------------

    async def connect(self):
        # Authenticate
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{CONFIG['api_base_url']}/api/Auth/loginKey",
                json={
                    'userName': CONFIG['username'],
                    'apiKey': CONFIG['api_key']
                }
            ) as response:
                login_data = await response.json()

        if not login_data.get('success') or not login_data.get('token'):
            raise Exception(f"Authentication failed: {login_data.get('errorMessage', 'Unknown error')}")

        self.token_manager = TokenManager(login_data['token'])
        print('[Bot] Authenticated successfully')

        # Search for account
        await general_limiter.wait_for_slot()
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{CONFIG['api_base_url']}/api/Account/search",
                headers={
                    'Authorization': f'Bearer {self.token_manager.get_token()}',
                    'Content-Type': 'application/json'
                },
                json={}
            ) as response:
                account_data = await response.json()

        accounts = account_data.get('accounts', [])
        if accounts:
            CONFIG['account_id'] = accounts[0]['id']
            print(f"[Bot] Account found: {CONFIG['account_id']}")
        else:
            raise Exception('No accounts found')

        # --- YOUR STRATEGY LOGIC ---
        # Look up your contract, fetch historical data, initialize indicators
        # Example:
        # bars = await self.fetch_historical_bars(contract_id, 100, 5, BarTimeUnit.Minute)
        # self.initialize_indicators(bars)
        # --- END YOUR STRATEGY LOGIC ---

        # Connect WebSocket hubs
        await self.connect_websockets()
        self.running = True
        print('[Bot] Connected and running')

    async def connect_websockets(self):
        # Market Hub
        self.market_hub = SignalRClient(
            f"{CONFIG['rtc_base_url']}/markethub",
            access_token_factory=self.token_manager.get_token,
        )

        self.market_hub.on('GatewayQuote', self.on_quote)

        # User Hub
        self.user_hub = SignalRClient(
            f"{CONFIG['rtc_base_url']}/userhub",
            access_token_factory=self.token_manager.get_token,
        )

        self.user_hub.on('GatewayOrder', self.on_order_event)
        self.user_hub.on('GatewayPosition', self.on_position_event)

        # Start connections (run in background tasks)
        asyncio.ensure_future(self.market_hub.run())
        asyncio.ensure_future(self.user_hub.run())

        # Allow connections to establish
        await asyncio.sleep(2)

        # Subscribe
        if CONFIG['contract_id']:
            await self.market_hub.send('SubscribeContractQuotes', [CONFIG['contract_id']])
        await self.user_hub.send('SubscribeAccounts', [])
        await self.user_hub.send('SubscribeOrders', [CONFIG['account_id']])
        await self.user_hub.send('SubscribePositions', [CONFIG['account_id']])
        await self.user_hub.send('SubscribeTrades', [CONFIG['account_id']])

        print('[Bot] WebSocket subscriptions active')

    # -------------------------------------------------------------------------
    # Event Handlers
    # -------------------------------------------------------------------------

    async def on_quote(self, args):
        if not self.running:
            return

        quote = args[0] if args else {}

        # --- YOUR STRATEGY LOGIC ---
        # Process incoming quote data
        # Update indicator calculations
        # Example:
        # self.update_indicators(quote)
        # --- END YOUR STRATEGY LOGIC ---

        # Evaluate signal after processing quote
        await self.evaluate_signal(quote)

    async def evaluate_signal(self, quote):
        if not self.running:
            return

        # Safety checks before any signal evaluation
        if abs(self.daily_pnl) >= CONFIG['max_daily_loss']:
            print('[Bot] Daily loss limit reached -- no new trades')
            return
        if self.consecutive_losses >= CONFIG['max_consecutive_losses']:
            print('[Bot] Consecutive loss limit reached -- pausing')
            return

        # --- YOUR STRATEGY LOGIC ---
        # Evaluate entry/exit conditions based on your indicators
        # Example:
        #
        # signal = self.check_crossover()
        # if signal['action'] == 'buy' and self.current_position['size'] == 0:
        #     await self.place_order(OrderSide.Bid, 1)
        # elif signal['action'] == 'sell' and self.current_position['size'] == 0:
        #     await self.place_order(OrderSide.Ask, 1)
        # --- END YOUR STRATEGY LOGIC ---

    async def on_order_event(self, args):
        order = args[0] if args else {}
        status = order.get('status', 0)

        if status == OrderStatus.Filled:
            print(f"[Order] Filled: {order.get('orderId')}, side={order.get('side')}, size={order.get('size')}")
        elif status == OrderStatus.Rejected:
            print(f"[Order] Rejected: {order.get('orderId')}, reason={order.get('errorMessage')}")

    async def on_position_event(self, args):
        position = args[0] if args else {}
        self.current_position = {
            'size': position.get('size', 0),
            'side': position.get('type', PositionType.Undefined)
        }
        print(f"[Position] Updated: side={self.current_position['side']}, size={self.current_position['size']}")

    # -------------------------------------------------------------------------
    # Order Placement (uses SAF-01 + SAF-05)
    # -------------------------------------------------------------------------

    async def place_order(self, side: OrderSide, size: int, **options):
        order_params = create_order(side, size, CONFIG['contract_id'], CONFIG['account_id'], **options)
        print(f"[Bot] Placing order: side={side}, size={order_params['size']}, "
              f"SL={order_params['stopLossBracket']['ticks']}t, TP={order_params['takeProfitBracket']['ticks']}t")

        result = await place_order_safe(order_params, self.token_manager)
        if result['success']:
            print(f"[Bot] Order placed: {result['orderId']}")
        else:
            print(f"[Bot] Order failed: {result['error']}")
        return result

    # -------------------------------------------------------------------------
    # Utilities
    # -------------------------------------------------------------------------

    async def fetch_historical_bars(self, contract_id, count, interval, time_unit):
        await history_limiter.wait_for_slot()
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{CONFIG['api_base_url']}/api/History/retrieveBars",
                headers={
                    'Authorization': f'Bearer {self.token_manager.get_token()}',
                    'Content-Type': 'application/json'
                },
                json={
                    'contractId': contract_id,
                    'live': False,
                    'count': count,
                    'unit': int(time_unit),
                    'unitNumber': interval
                }
            ) as response:
                data = await response.json()
                return data.get('bars', [])

    # -------------------------------------------------------------------------
    # Shutdown
    # -------------------------------------------------------------------------

    async def shutdown(self):
        print('[Bot] Shutting down...')
        self.running = False

        # Cancel open orders and flatten positions if needed
        # (implement based on strategy requirements)

        if self.token_manager:
            self.token_manager.destroy()

        print('[Bot] Shutdown complete')


# ============================================================================
# Entry Point
# ============================================================================

async def main():
    if not CONFIG['username'] or not CONFIG['api_key']:
        print('Missing TSX_USERNAME or TSX_API_KEY environment variables')
        return

    bot = TradingBot()

    # Graceful shutdown handler
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, lambda: asyncio.ensure_future(bot.shutdown()))
        except NotImplementedError:
            pass  # Windows doesn't support add_signal_handler

    try:
        await bot.connect()
        # Keep running until shutdown
        while bot.running:
            await asyncio.sleep(1)
    except Exception as err:
        print(f'[Bot] Fatal error: {err}')
        await bot.shutdown()


if __name__ == '__main__':
    asyncio.run(main())
```

</template>

<guidelines>

**Safety infrastructure is NON-NEGOTIABLE. Agents MUST NOT modify:**
- Enum class definitions (OrderSide, OrderType, OrderStatus, PositionType, TimeInForce, BarTimeUnit)
- TokenManager class (proactive 23-hour refresh via asyncio, re-authentication fallback)
- RateLimiter class and RATE_LIMITS constants (sliding window with deque + time)
- create_order function (bracket defaults, position sizing via min())
- place_order_safe function (429 handling, rejection logging, connection error catch)
- Graceful shutdown signal handlers

**Agents SHOULD fill in sections marked with `# --- YOUR STRATEGY LOGIC ---`:**
- __init__: Initialize strategy state (indicator arrays, signal buffers)
- connect(): Look up contract, fetch historical data, initialize indicators
- on_quote(): Process incoming quote data, update indicator calculations
- evaluate_signal(): Check entry/exit conditions, trigger place_order()

**When using this scaffold:**
1. Copy the entire scaffold as the starting point
2. Fill in CONFIG values from the strategy-spec.md and risk-parameters.md
3. Implement indicator calculations in the strategy sections
4. Implement signal evaluation logic
5. Test with TopStepX evaluation account first

**Dependencies:**
```bash
pip install aiohttp pysignalr
```

**Environment variables required:**
- `TSX_USERNAME` -- TopStepX login username
- `TSX_API_KEY` -- TopStepX API key ($29/mo add-on)

</guidelines>
