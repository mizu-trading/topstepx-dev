<purpose>
Convert an existing TopStepX trading bot from one supported language to another while preserving all safety guardrails (SAF-01 through SAF-05), API integration patterns, and trading logic. Uses extensible language profiles so adding a new target language requires only a new profile section.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<auto_mode>
## Auto Mode Detection

Check if `--auto` flag is present in $ARGUMENTS.

**If auto mode:**
- REQUIRES: source path and target language as arguments
- Skips: library mapping confirmation (Step 4), adaptation report review (Step 5)
- Does NOT skip: source analysis (Step 2), safety verification (Step 7)
- Auto-selects target language from arguments instead of prompting

If source path or target language is missing, error:

```
Error: --auto requires source path and target language.

Usage:
  /tsx:adapt-language --auto ./src python
  /tsx:adapt-language --auto ./bot.js python
  /tsx:adapt-language --auto ./bot.py javascript

Supported languages: javascript, python
```

**Auto-mode behavior per step:**
- Step 1 (Setup): Parse source path and target language from arguments
- Step 2 (Source Analysis): Runs fully -- never skipped
- Step 3 (Language Profile Selection): Auto-select from arguments
- Step 4 (Library Mapping): Skip confirmation, log mapping table
- Step 5 (Adaptation Report): Write report, log path, proceed without review
- Step 6 (Code Generation): Runs fully -- never skipped
- Step 7 (Safety Verification): Runs fully -- MANDATORY, never skipped
- Step 8 (Completion): Display summary
</auto_mode>

<language_profiles>
## Language Profiles

Language profiles define the canonical mappings for each supported language. The workflow uses these profiles in Steps 3, 4, and 6 to drive source analysis, library mapping, and code generation.

**Adding a new language:** Add a new profile section below with all 11 properties. No branching logic changes are needed anywhere in the workflow -- the profile-based design handles new languages automatically.

### JavaScript/TypeScript (Node.js)

| Property | Value |
|----------|-------|
| Runtime | Node.js 18+ |
| Package Manager | npm |
| SignalR Client | `@microsoft/signalr` (HubConnectionBuilder) |
| HTTP Client | built-in `fetch` |
| Indicator Library | `trading-signals` |
| Async Model | Promises / async-await |
| Naming Convention | camelCase |
| Enum Style | Plain objects (`const OrderSide = { Bid: 0, Ask: 1 }`) |
| Timer Pattern | `setTimeout` / `setInterval` |
| Signal Handler | `process.on('SIGINT', handler)` / `process.on('SIGTERM', handler)` |
| Bot Scaffold | `@topstepx/templates/bot-scaffold-js.md` |

### Python

| Property | Value |
|----------|-------|
| Runtime | Python 3.11+ |
| Package Manager | pip |
| SignalR Client | `pysignalr` (SignalRClient) |
| HTTP Client | `aiohttp` (ClientSession) |
| Indicator Library | `pandas-ta` |
| Async Model | asyncio / async-await |
| Naming Convention | snake_case |
| Enum Style | `IntEnum` classes (`class OrderSide(IntEnum): Bid = 0; Ask = 1`) |
| Timer Pattern | `asyncio.sleep` / `asyncio.ensure_future` |
| Signal Handler | `loop.add_signal_handler(signal.SIGINT, handler)` |
| Bot Scaffold | `@topstepx/templates/bot-scaffold-python.md` |

</language_profiles>

<process>

## 1. Setup

**MANDATORY FIRST STEP -- Execute these checks before ANY user interaction:**

```bash
INIT=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" init adapt-language "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `commit_docs`, `project_exists`, `has_git`.

**If `project_exists` is false:** Error -- no project initialized.
```
Error: No project initialized. Run /tsx:new-project first.
```

### Parse Arguments

Extract from $ARGUMENTS:
- **Source path** (required): directory or file path to convert
- **Target language** (required in auto-mode, prompted in interactive mode)
- **`--auto` flag**: skip interactive confirmations

**If auto mode and source path or target language missing:** Display the error message from `<auto_mode>` section and exit.

### Validate Source Path

```bash
if [ ! -e "${SOURCE_PATH}" ]; then
  echo "Error: Source path '${SOURCE_PATH}' does not exist."
  exit 1
fi
```

### Detect Source Language

Determine the source language from file extensions in the source path:

```bash
# Count file types in the source path
JS_COUNT=$(find "${SOURCE_PATH}" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.mjs" \) 2>/dev/null | wc -l)
PY_COUNT=$(find "${SOURCE_PATH}" -type f -name "*.py" 2>/dev/null | wc -l)
```

- If `.js`, `.ts`, or `.mjs` files detected: **Source = JavaScript/TypeScript**
- If `.py` files detected: **Source = Python**
- If both or neither detected: prompt user to clarify (auto-mode: error)

```
Error: Could not auto-detect source language from file extensions in '${SOURCE_PATH}'.
Please specify the source language or ensure the directory contains .js/.ts/.mjs or .py files.
```

Store the detected source language for Step 3.

## 2. Source Analysis

**Read all source files in the provided path and scan for TopStepX API usage patterns.**

This step runs in BOTH interactive and auto mode -- it is never skipped.

### Read Source Files

Read every source file in the path. For directories, read all files matching the detected source language extensions. Build a file inventory table:

| File | Lines | Purpose |
|------|-------|---------|
| [filename] | [count] | [auto-detected from content] |

### Scan for 6 Categories

Analyze the source code for the following pattern categories. For each category, record what was found and in which files:

**1. API Authentication**
- Login calls (`/api/Auth/loginKey`, `loginKey`)
- Token storage (variable holding JWT token)
- Bearer header usage (`Authorization`, `Bearer`)
- Refresh timer (23-hour interval, `refreshToken`, `refresh_token`)

**2. REST Endpoints**
- Order placement (`/api/Order/place`, `createOrder`, `create_order`)
- Account search (`/api/Account/search`)
- Contract lookup (`/api/Contract/search`)
- Position queries (`/api/Position/searchOpen`)
- History bars (`/api/History/retrieveBars`)

**3. WebSocket Connections**
- Market Hub creation (`markethub`, `MarketHub`)
- User Hub creation (`userhub`, `UserHub`)
- Event handlers: `GatewayQuote`, `GatewayOrder`, `GatewayPosition`, `GatewayTrade`
- Subscriptions: `SubscribeContractQuotes`, `SubscribeAccounts`, `SubscribeOrders`, `SubscribePositions`, `SubscribeTrades`
- Reconnection handlers (`onreconnected`, `onclose`, reconnection logic)

**4. Safety Infrastructure**
- Enum constant definitions (`OrderSide`, `OrderType`, `OrderStatus`, `PositionType`, `TimeInForce`)
- Bracket order defaults (`stopLossBracket`, `takeProfitBracket`, `stop_loss`, `take_profit`)
- Position sizing via `Math.min` or `min(`
- TokenManager / token refresh class
- RateLimiter / rate limiter class
- `placeOrderSafe` / `place_order_safe` error handling
- Graceful shutdown handlers (`SIGINT`, `SIGTERM`, shutdown)

**5. Strategy Logic**
- Indicator imports and calculations (EMA, RSI, MACD, Bollinger Bands, ATR, VWAP, etc.)
- Signal evaluation functions
- Entry/exit conditions
- Bar processing logic

**6. Configuration**
- Environment variables (`process.env`, `os.environ`)
- Risk parameters (max position size, stop loss ticks, take profit ticks, max daily loss)
- Contract ID and account ID references

### Output Analysis Summary

Present a structured summary:

```
Source Analysis Complete
========================
Language: [detected language]
Files: [count] source files, [total lines] total lines
API Patterns: [REST + WebSocket / REST only / WebSocket only]

Pattern Coverage:
  [x] Authentication (found in: [files])
  [x] REST Endpoints (found in: [files])
  [x] WebSocket Connections (found in: [files])
  [x] Safety Infrastructure (found in: [files])
  [x] Strategy Logic (found in: [files])
  [x] Configuration (found in: [files])
```

### Flag Unrecognized Libraries

Compare all imported/required libraries against the source language profile. Flag any library NOT in the profile:

```
Warning: Unrecognized libraries found:
  - axios (not in JavaScript/TypeScript profile -- standard mapping: fetch)
  - lodash (not in JavaScript/TypeScript profile -- may need manual mapping)
```

These flagged libraries will be addressed in Step 4 (Library Mapping Confirmation).

## 3. Language Profile Selection

### Confirm Source Language

The source language was auto-detected in Step 1 from file extensions. Confirm it here by cross-referencing with the patterns found in Step 2 (e.g., `require()` / `import` syntax confirms JavaScript, `import asyncio` confirms Python).

If there is a mismatch between extension detection and pattern analysis, prefer the pattern analysis result and log a warning.

### Select Target Language

**Interactive mode:**

Use AskUserQuestion:
- header: "Target Language"
- question: "Which language should the bot be converted to?"
- options:
  - "JavaScript/TypeScript (Node.js)" -- Uses @microsoft/signalr, built-in fetch, trading-signals
  - "Python" -- Uses pysignalr, aiohttp, pandas-ta

**Auto mode:** Use the target language from command arguments.

### Validate Source != Target

```
if source_language == target_language:
    Error: Source and target languages are the same ([language]).
    Nothing to convert. Exiting.
```

### Load Language Profiles

Load both the source and target language profiles from the `<language_profiles>` section above. These profiles drive Steps 4, 5, and 6:
- Source profile: identifies what libraries/patterns to look for in source code
- Target profile: defines what libraries/patterns to generate in target code

## 4. Library Mapping Confirmation

### Build Mapping Table

Using the source and target language profiles, build the library mapping table:

| Source Library | Target Library | Purpose | Mapping Notes |
|----------------|----------------|---------|---------------|
| [source profile SignalR Client] | [target profile SignalR Client] | SignalR WebSocket client | [API differences] |
| [source profile HTTP Client] | [target profile HTTP Client] | HTTP REST client | [Session management differences] |
| [source profile Indicator Library] | [target profile Indicator Library] | Technical indicators | [API surface differences] |
| [source profile Timer Pattern] | [target profile Timer Pattern] | Timers and scheduling | [Event loop model differences] |
| [source profile Signal Handler] | [target profile Signal Handler] | Graceful shutdown | [Platform differences] |
| [source profile Enum Style] | [target profile Enum Style] | Enum definitions | [Style differences] |

### Include Unrecognized Libraries

For any libraries flagged in Step 2 that are not in the source language profile:

| Source Library | Target Library | Purpose | Mapping Notes |
|----------------|----------------|---------|---------------|
| [unrecognized lib] | [?? -- needs mapping] | [detected purpose] | User input needed |

### Interactive Mode: Confirm Mapping

Use AskUserQuestion:
- header: "Library Mapping"
- question: "Review the library mapping table above. Are these mappings correct?"
- options:
  - "Looks good -- proceed" -- Continue with the mapping as shown
  - "I need to adjust some mappings" -- Let me provide corrections

If the user selects "I need to adjust some mappings":
- Ask which source library needs a different target mapping
- Update the mapping table with the user's corrections
- Re-display the updated table for confirmation

For unrecognized libraries:
- Ask user for the target language equivalent
- If user is unsure, suggest spawning `tsx-researcher` for library lookup

### Auto Mode: Skip Confirmation

Log the mapping table without asking for confirmation:

```
Library mapping (auto-approved):
  @microsoft/signalr -> pysignalr (SignalR client)
  fetch -> aiohttp (HTTP client)
  trading-signals -> pandas-ta (indicators)
  ...
```

For unrecognized libraries in auto-mode:
- Log a warning: `Warning: [library] has no automatic mapping. Marked as "manual mapping needed".`
- Continue with best-effort mapping
</process>
