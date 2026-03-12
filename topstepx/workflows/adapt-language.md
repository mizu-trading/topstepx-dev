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

## 5. Adaptation Report Generation

### Populate the Report Template

Using data collected in Steps 2-4, populate the `@topstepx/templates/language-adaptation.md` template.

Fill the following sections from the template:

**Source Analysis table:**
- Source Language, Target Language, Source Framework, Target Framework (from language profiles)
- Source Lines of Code (from Step 2 file inventory)
- TopStepX API Patterns (REST + WebSocket / REST only / WebSocket only, from Step 2)
- Strategy Complexity (Simple / Moderate / Complex, based on indicator count and signal logic)

**File Inventory table:**
- Each source file mapped to its target file path
- Purpose description for each file
- Adaptation notes highlighting key changes needed

**Library Mapping table:**
- All mappings from Step 4, including installation commands
- Source installation: `npm install [packages]` or `pip install [packages]`
- Target installation: corresponding package manager command

**API Pattern Mapping tables:**
- Authentication: login, token storage, bearer header, token refresh timer
- Order Placement: create order, bracket defaults, position sizing, error handling
- WebSocket: connection creation, event handlers, invoke/send methods, reconnection, access token

**Safety Preservation table:**
- All SAF-01 through SAF-05 rows from the template
- Source Present: based on Step 2 safety infrastructure findings
- Target Present: will be "Pending" until Step 6 generates target code
- Verified: will be "Pending" until Step 7 runs safety verification

**Test Plan:**
- Verification steps tailored to the specific source/target languages
- Expected output comparison metrics

**Adaptation Confidence:**
- Library mapping accuracy: based on Step 4 results (HIGH if all libraries mapped, MEDIUM if some manual)
- API pattern fidelity: based on Step 2 pattern coverage
- Safety preservation: Pending (set after Step 7)
- Strategy logic accuracy: based on indicator complexity from Step 2

### Write the Report

Write the populated report to `.planning/language-adaptation.md`:

```bash
# Write the adaptation report
# (Content generated from template with Step 2-4 data)
```

### Interactive Mode: Offer Review

Present a summary of the adaptation report:

```
Adaptation Report Generated
============================
Location: .planning/language-adaptation.md
Source: [language] ([N] files, [N] lines)
Target: [language]
Libraries mapped: [N] (all mapped / [N] need manual mapping)
Safety patterns found: [N]/10
```

Use AskUserQuestion:
- header: "Adaptation Report"
- question: "Review the adaptation report summary above. Ready to proceed with code generation?"
- options:
  - "Proceed with code generation" -- Generate target code based on this report
  - "Let me review the full report first" -- Open .planning/language-adaptation.md for detailed review

### Auto Mode: Proceed Without Review

Log the report path and proceed:

```
Adaptation report written: .planning/language-adaptation.md
Proceeding to code generation...
```

### Commit the Report

```bash
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" commit "docs: language adaptation report" --files .planning/language-adaptation.md
```

## 6. Code Generation

**Generate target code file-by-file using the target language's bot scaffold as the structural base.**

### Load Bot Scaffold

Load the target language's bot scaffold template:
- JavaScript/TypeScript target: `@topstepx/templates/bot-scaffold-js.md`
- Python target: `@topstepx/templates/bot-scaffold-python.md`

The scaffold provides the structural skeleton with all safety infrastructure (SAF-01 through SAF-05) already implemented. The workflow injects source strategy logic translated to target language idioms.

### Conversion Order (MANDATORY -- Trading Build Order)

Convert source code to target code in this exact order. This mirrors the proven trading build order established across TSX:

**1. Safety infrastructure first:**
- Enum constant definitions (OrderSide, OrderType, OrderStatus, PositionType, TimeInForce, BarTimeUnit)
- Configuration constants (API URLs, risk parameters, environment variables)
- Apply target language naming convention from profile (camelCase for JS, snake_case for Python)
- Apply target language enum style from profile (plain objects for JS, IntEnum classes for Python)

**2. Authentication:**
- TokenManager class / token refresh mechanism
- Login flow (POST to /api/Auth/loginKey)
- Bearer header setup for all API calls
- 23-hour proactive refresh timer (SAF-02)
- Re-authentication fallback on refresh failure

**3. Rate limiting:**
- RateLimiter class with sliding window
- RATE_LIMITS constants (HISTORY: 50/30s, GENERAL: 200/60s)
- Wait-for-slot pattern before every API call
- Apply target language async pattern from profile

**4. REST API integration:**
- Order placement function with bracket defaults (SAF-01: stopLossBracket, takeProfitBracket)
- Position sizing enforcement via Math.min / min() (SAF-01)
- Safe order placement with 3-mode error handling (SAF-05: 429 retry, rejection logging, connection error catch)
- Account search, contract lookup, position query functions
- History bar retrieval with history rate limiter

**5. WebSocket integration:**
- Market Hub connection with access token factory
- User Hub connection with access token factory
- Event handlers: GatewayQuote, GatewayOrder, GatewayPosition, GatewayTrade
- Subscription calls: SubscribeContractQuotes, SubscribeAccounts, SubscribeOrders, SubscribePositions, SubscribeTrades
- Reconnection handlers with automatic re-subscribe (SAF-05)
- Apply target language SignalR client patterns from profile (HubConnectionBuilder for JS, SignalRClient for Python)

**6. Strategy logic last:**
- Indicator calculations translated to target language's indicator library
- Signal evaluation functions with entry/exit conditions
- Bar processing logic
- Any custom strategy state management
- Apply target language naming convention throughout

### Apply Naming Conventions

Use the target language profile's naming convention for ALL generated code:
- **JavaScript/TypeScript:** camelCase for variables/functions, PascalCase for classes
- **Python:** snake_case for variables/functions, PascalCase for classes

### File Mapping

Each source file maps to a target file, as documented in the adaptation report's File Inventory table:
- Single-file source: generate single target file with appropriate extension
- Multi-file source: generate corresponding target files preserving the module structure
- File extensions: `.js`/`.ts`/`.mjs` -> `.py` (or vice versa)

### Atomic Commits

Commit each converted file individually as it is generated:

```bash
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" commit "feat: convert [filename] to [target language]" --files [target_file_path]
```

This ensures partial progress is preserved if the conversion is interrupted.

## 7. Safety Verification

**MANDATORY -- Conversion is BLOCKED until ALL safety checks pass.**

This step runs in BOTH interactive and auto mode -- it is NEVER skipped.

### Run Grep-Based Verification

For each safety pattern, run grep verification against ALL generated target files. Use the target language profile to select the correct grep patterns.

**For JavaScript/TypeScript target:**

| Safety Pattern | Grep Command | Expected |
|----------------|-------------|----------|
| SAF-01: Enum constants | `grep -c "OrderSide\|OrderType\|OrderStatus\|PositionType\|TimeInForce" [target_files]` | >= 5 |
| SAF-01: Bracket defaults | `grep -c "stopLossBracket\|takeProfitBracket" [target_files]` | >= 2 |
| SAF-01: Position sizing | `grep -c "Math.min" [target_files]` | >= 1 |
| SAF-02: JWT refresh | `grep -c "refreshToken\|refreshInterval\|23.*60.*60" [target_files]` | >= 1 |
| SAF-03: Rate limiter | `grep -c "RateLimiter\|RATE_LIMITS\|waitForSlot" [target_files]` | >= 2 |
| SAF-05: Error handling | `grep -c "placeOrderSafe\|status === 429\|\.catch\|try.*catch" [target_files]` | >= 2 |
| SAF-05: Graceful shutdown | `grep -c "SIGINT\|SIGTERM\|shutdown" [target_files]` | >= 2 |

**For Python target:**

| Safety Pattern | Grep Command | Expected |
|----------------|-------------|----------|
| SAF-01: Enum constants | `grep -c "OrderSide\|OrderType\|OrderStatus\|PositionType\|TimeInForce\|IntEnum" [target_files]` | >= 5 |
| SAF-01: Bracket defaults | `grep -c "stopLossBracket\|takeProfitBracket\|stop_loss\|take_profit" [target_files]` | >= 2 |
| SAF-01: Position sizing | `grep -c "min(" [target_files]` | >= 1 |
| SAF-02: JWT refresh | `grep -c "refresh_token\|refresh_interval\|23.*60.*60" [target_files]` | >= 1 |
| SAF-03: Rate limiter | `grep -c "RateLimiter\|RATE_LIMITS\|wait_for_slot" [target_files]` | >= 2 |
| SAF-05: Error handling | `grep -c "place_order_safe\|status == 429\|except\|try:" [target_files]` | >= 2 |
| SAF-05: Graceful shutdown | `grep -c "SIGINT\|SIGTERM\|shutdown\|signal\." [target_files]` | >= 2 |

**Note:** SAF-04 (PineScript Repainting Audit) is NOT checked here. It is specific to Phase 7's `adapt-pinescript` workflow and does not apply to language-to-language conversion.

### Present Results

Display the verification results as a pass/fail table:

```
Safety Verification Results
============================

| SAF Pattern | Check | Result |
|-------------|-------|--------|
| SAF-01: Enum constants | OrderSide, OrderType, etc. | PASS |
| SAF-01: Bracket defaults | stopLossBracket, takeProfitBracket | PASS |
| SAF-01: Position sizing | Math.min / min() | PASS |
| SAF-02: JWT refresh | refreshToken, 23hr interval | PASS |
| SAF-03: Rate limiter | RateLimiter, RATE_LIMITS | PASS |
| SAF-05: Error handling | placeOrderSafe, 429 handling | PASS |
| SAF-05: Graceful shutdown | SIGINT, SIGTERM, shutdown | PASS |

Status: ALL PASSED
Safety Confidence: HIGH
```

### If ANY Check FAILS

**The conversion is INCOMPLETE. Do NOT proceed to Step 8.**

For each failed check:
1. Display the missing pattern with its SAF-ID
2. Show what the pattern should look like in the target language (reference `@topstepx/references/safety-patterns.md` for the canonical implementation)
3. Identify which target file should contain the pattern

```
SAFETY VERIFICATION FAILED
============================

FAILED: SAF-01 Bracket defaults
  Missing: stopLossBracket / takeProfitBracket in target code
  Expected: Order creation function must include bracket parameters
  Reference: @topstepx/references/safety-patterns.md -> SAF-01 -> "Default bracket order pattern"
  Fix in: [target_file_path]
```

**Loop back to Step 6** to fix the safety gap:
- Add the missing safety pattern to the appropriate target file
- Re-commit the fixed file
- Re-run Step 7 safety verification

Repeat until ALL checks PASS. The workflow CANNOT complete with any safety gap.

### If ALL Checks PASS

- Set safety confidence to **HIGH**
- Update the Safety Preservation table in `.planning/language-adaptation.md`:
  - Set all "Target Present" columns to "Yes"
  - Set all "Verified" columns to "Yes"
  - Set "Safety Gaps Found" section to "All safety patterns preserved in target language. No gaps."
- Update Adaptation Confidence -> Safety preservation to **HIGH**
- Commit the updated report:

```bash
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" commit "docs: update adaptation report with safety verification results" --files .planning/language-adaptation.md
```

- Proceed to Step 8

## 8. Completion Summary

### Display Completion Banner

```
--------------------------------------------------
 TSX > LANGUAGE ADAPTATION COMPLETE
--------------------------------------------------

Source: [source language] -> Target: [target language]

| Artifact | Location |
|----------|----------|
| Adaptation Report | .planning/language-adaptation.md |
| Target Code | [list target file paths] |

Safety Verification: ALL PASSED (SAF-01, SAF-02, SAF-03, SAF-05)
Files Converted: [N] source files -> [N] target files
Total Lines: [source lines] -> [target lines]

--------------------------------------------------

Next Steps:

  /tsx:verify-work [phase]   -- Test the converted bot
  /tsx:progress              -- Check project status

--------------------------------------------------
```

### Commit Final State

```bash
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" commit "feat: language adaptation complete ([source] -> [target])" --files .planning/language-adaptation.md
```

</process>

<output>

## Generated Artifacts

- `.planning/language-adaptation.md` -- Adaptation report (populated from `@topstepx/templates/language-adaptation.md`)
- Converted target code files (paths documented in adaptation report File Inventory table)

</output>

<success_criteria>

- [ ] Source code analyzed (REST, WebSocket, safety, strategy patterns identified)
- [ ] Language profiles used for mapping (not hardcoded language pairs)
- [ ] Library mapping confirmed (all source libraries mapped to target equivalents)
- [ ] Adaptation report generated from `@topstepx/templates/language-adaptation.md` template -> committed
- [ ] Target code generated in trading build order (safety first, strategy last)
- [ ] Target code uses bot scaffold template as structural base
- [ ] Safety verification PASSED for all SAF-01, SAF-02, SAF-03, SAF-05 patterns
- [ ] All target files committed atomically
- [ ] User knows next step (`/tsx:verify-work` or `/tsx:progress`)

</success_criteria>
