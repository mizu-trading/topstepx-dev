# Language Adaptation Report Template

Template for language adaptation report documents. Captures the analysis, library mapping, and safety verification needed when converting a TopStepX trading bot from one programming language to another (e.g., JavaScript to Python or vice versa).

**Purpose:** Ensure accurate, safe language adaptation by mapping libraries, preserving API patterns, and verifying all safety patterns (SAF-01 through SAF-05) survive the conversion.

<template>

```markdown
# Language Adaptation Report

**Bot Name:** [name]
**Created:** [YYYY-MM-DD]
**Source Language:** [JavaScript/TypeScript / Python / Other]
**Target Language:** [JavaScript/TypeScript / Python / Other]

## Source Analysis

| Property | Value |
|----------|-------|
| Source Language | [language + version] |
| Target Language | [language + version] |
| Source Framework | [e.g., "Node.js with @microsoft/signalr"] |
| Target Framework | [e.g., "Python with pysignalr"] |
| Source Lines of Code | [approximate] |
| TopStepX API Patterns | [REST + WebSocket / REST only / WebSocket only] |
| Strategy Complexity | [Simple / Moderate / Complex] |

### File Inventory

| Source File | Purpose | Target File | Adaptation Notes |
|-------------|---------|-------------|-----------------|
| [source path] | [what it does] | [target path] | [key changes needed] |
| [source path] | [what it does] | [target path] | [key changes needed] |
| [source path] | [what it does] | [target path] | [key changes needed] |

## Library Mapping

| Source Library | Target Library | Purpose | Mapping Notes |
|----------------|----------------|---------|---------------|
| `@microsoft/signalr` | `pysignalr` | SignalR WebSocket client | Different API: HubConnectionBuilder vs SignalRClient |
| `node-fetch` / built-in `fetch` | `aiohttp` | HTTP REST client | async/await pattern similar, session management differs |
| `setTimeout` / `setInterval` | `asyncio.sleep` / `asyncio.ensure_future` | Timers and scheduling | Event loop differences |
| `process.env` | `os.environ` | Environment variables | Direct equivalent |
| `console.log` / `console.error` | `print` / `logging` | Output and logging | Consider using logging module |
| [source lib] | [target lib] | [purpose] | [mapping notes] |

### Library Installation

**Source:**
```bash
[e.g., npm install @microsoft/signalr]
```

**Target:**
```bash
[e.g., pip install aiohttp pysignalr]
```

## API Pattern Mapping

### Authentication

| Pattern | Source Implementation | Target Implementation |
|---------|---------------------|----------------------|
| Login | `fetch(url, { method: 'POST', ... })` | `aiohttp.ClientSession().post(url, json=...)` |
| Token storage | `this.token = data.token` | `self.token = data['token']` |
| Bearer header | `headers: { 'Authorization': \`Bearer ${token}\` }` | `headers={'Authorization': f'Bearer {token}'}` |
| Token refresh timer | `setTimeout(() => this.refreshToken(), ms)` | `asyncio.ensure_future(self._refresh_loop())` |

### Order Placement

| Pattern | Source Implementation | Target Implementation |
|---------|---------------------|----------------------|
| Create order | `createOrder(side, size, contractId, accountId)` | `create_order(side, size, contract_id, account_id)` |
| Bracket defaults | `{ stopLossBracket: {...}, takeProfitBracket: {...} }` | `{'stopLossBracket': {...}, 'takeProfitBracket': {...}}` |
| Position sizing | `Math.min(size, maxSize)` | `min(size, max_size)` |
| Error handling | `try { ... } catch (err) { ... }` | `try: ... except Exception as err: ...` |

### WebSocket

| Pattern | Source Implementation | Target Implementation |
|---------|---------------------|----------------------|
| Connection | `new HubConnectionBuilder().withUrl(...)` | `SignalRClient(url, access_token_factory=...)` |
| Event handler | `connection.on('GatewayQuote', handler)` | `client.on('GatewayQuote', handler)` |
| Invoke method | `connection.invoke('SubscribeContractQuotes', id)` | `client.send('SubscribeContractQuotes', [id])` |
| Reconnection | `.withAutomaticReconnect()` | Built-in or manual reconnection loop |
| Access token | `accessTokenFactory: () => token` | `access_token_factory=get_token` |

## Safety Preservation

Verification that ALL safety patterns survive the language adaptation:

| Safety Pattern | Source Present | Target Present | Verified |
|----------------|---------------|----------------|----------|
| SAF-01: Enum Constants (OrderSide, OrderType, etc.) | [Yes] | [Yes] | [Yes/No] |
| SAF-01: Bracket order defaults in createOrder | [Yes] | [Yes] | [Yes/No] |
| SAF-01: Position sizing via min() | [Yes] | [Yes] | [Yes/No] |
| SAF-02: TokenManager with 23hr proactive refresh | [Yes] | [Yes] | [Yes/No] |
| SAF-02: Re-authentication fallback | [Yes] | [Yes] | [Yes/No] |
| SAF-03: RateLimiter with sliding window | [Yes] | [Yes] | [Yes/No] |
| SAF-03: RATE_LIMITS constants (HISTORY + GENERAL) | [Yes] | [Yes] | [Yes/No] |
| SAF-05: placeOrderSafe with 429/rejection/error handling | [Yes] | [Yes] | [Yes/No] |
| SAF-05: WebSocket reconnection with re-subscribe | [Yes] | [Yes] | [Yes/No] |
| SAF-05: Graceful shutdown (SIGINT/SIGTERM) | [Yes] | [Yes] | [Yes/No] |

### Safety Gaps Found

[If NONE: "All safety patterns preserved in target language. No gaps."]

**Gap 1: [description]**
- **Pattern:** [SAF-XX]
- **Source implementation:** [how it works in source]
- **Target gap:** [what's missing or different]
- **Resolution:** [how the gap was closed]

## Generated Files

| File | Purpose | Based On |
|------|---------|----------|
| [target filename] | [Main bot code] | [source filename] |
| [target filename] | [Configuration] | [source config] |
| [target filename] | [Strategy logic] | [source strategy] |

## Test Plan

### Verification Steps

1. **Authentication test:** Log in and verify token received
2. **Token refresh test:** Verify 23-hour timer is set (mock time or log confirmation)
3. **Rate limiter test:** Send requests and verify sliding window behavior
4. **Order creation test:** Create order object and verify bracket defaults present
5. **WebSocket connection test:** Connect to market hub and receive at least one quote
6. **Signal handler test:** Verify SIGINT/SIGTERM triggers graceful shutdown
7. **Strategy logic test:** Verify indicators produce same values as source for known data

### Expected Output Comparison

| Metric | Source | Target | Match? |
|--------|--------|--------|--------|
| Indicator values (sample data) | [values] | [values] | [Yes/No] |
| Order parameters (sample signal) | [params] | [params] | [Yes/No] |
| Position sizing (edge cases) | [results] | [results] | [Yes/No] |

## Adaptation Confidence

| Aspect | Confidence | Notes |
|--------|------------|-------|
| Library mapping accuracy | [HIGH/MEDIUM/LOW] | [e.g., "Direct equivalents available for all libraries"] |
| API pattern fidelity | [HIGH/MEDIUM/LOW] | [e.g., "REST patterns map 1:1, WebSocket has minor differences"] |
| Safety preservation | [HIGH] | [Must be HIGH -- all SAF patterns verified] |
| Strategy logic accuracy | [HIGH/MEDIUM/LOW] | [e.g., "Indicator calculations identical"] |

---
*Adaptation report created: [date]*
*Ready for testing: [yes/no]*
```

</template>

<guidelines>

**Source analysis:**
- Document every file that needs adaptation
- Note the source and target frameworks explicitly
- Identify all TopStepX API patterns used

**Library mapping:**
- Map every library to its target equivalent
- Include installation commands for both source and target
- Note API differences between equivalent libraries (e.g., HubConnectionBuilder vs SignalRClient)

**API pattern mapping:**
- Show concrete code snippets for source and target
- Cover all three API interaction types: auth, REST, WebSocket
- Note syntax differences that could cause bugs (e.g., dict access in Python vs object property in JS)

**Safety preservation:**
- This is the MOST CRITICAL section
- Every SAF-01 through SAF-05 pattern must be verified as present in the target
- Safety confidence MUST be HIGH -- if it's not, the adaptation is incomplete
- Never mark a safety pattern as "verified" without checking the actual target code

**Test plan:**
- Include concrete verification steps
- Compare indicator values between source and target for known data
- Verify safety infrastructure independently of strategy logic

</guidelines>

<example>

```markdown
# Language Adaptation Report

**Bot Name:** EMA Crossover ES Bot
**Created:** 2025-03-15
**Source Language:** JavaScript (Node.js)
**Target Language:** Python 3.11

## Source Analysis

| Property | Value |
|----------|-------|
| Source Language | JavaScript (Node.js 20.x) |
| Target Language | Python 3.11 |
| Source Framework | Node.js with @microsoft/signalr |
| Target Framework | Python with pysignalr |
| Source Lines of Code | 280 |
| TopStepX API Patterns | REST + WebSocket |
| Strategy Complexity | Simple |

## Library Mapping

| Source Library | Target Library | Purpose | Mapping Notes |
|----------------|----------------|---------|---------------|
| `@microsoft/signalr` | `pysignalr` | SignalR WebSocket | Different API surface, similar capabilities |
| built-in `fetch` | `aiohttp` | HTTP client | Both async, session management differs |
| `setTimeout` | `asyncio.sleep` | Timer | asyncio-based scheduling |
| `process.env` | `os.environ` | Env vars | Direct equivalent |

## Safety Preservation

| Safety Pattern | Source Present | Target Present | Verified |
|----------------|---------------|----------------|----------|
| SAF-01: Enum Constants | Yes | Yes (IntEnum classes) | Yes |
| SAF-01: Bracket order defaults | Yes | Yes (create_order function) | Yes |
| SAF-01: Position sizing via min() | Yes | Yes (min() built-in) | Yes |
| SAF-02: TokenManager 23hr refresh | Yes | Yes (asyncio timer) | Yes |
| SAF-03: RateLimiter sliding window | Yes | Yes (deque + time) | Yes |
| SAF-05: placeOrderSafe 3-mode error handling | Yes | Yes (try/except) | Yes |
| SAF-05: Graceful shutdown | Yes | Yes (signal handlers) | Yes |

### Safety Gaps Found

All safety patterns preserved. No gaps.

---
*Adaptation report created: 2025-03-15*
*Ready for testing: yes*
```

</example>
