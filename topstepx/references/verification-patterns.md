# Verification Patterns
<!-- Adapted from GSD (Get Shit Done) framework for TSX trading domain -->
<!-- TSX framework naming: tsx-planner, tsx-executor, tsx-verifier, tsx-tools -->

How to verify different types of artifacts are real implementations, not stubs or placeholders. The tsx-verifier agent uses these patterns to validate plan outputs. Trading-specific verification patterns are appended at the end for TopStepX bot development.

<core_principle>
**Existence does not equal Implementation**

A file existing does not mean the feature works. Verification must check:
1. **Exists** - File is present at expected path
2. **Substantive** - Content is real implementation, not placeholder
3. **Wired** - Connected to the rest of the system
4. **Functional** - Actually works when invoked

Levels 1-3 can be checked programmatically. Level 4 often requires human verification.
</core_principle>

<stub_detection>

## Universal Stub Patterns

These patterns indicate placeholder code regardless of file type:

**Comment-based stubs:**
```bash
# Grep patterns for stub comments
grep -E "(TODO|FIXME|XXX|HACK|PLACEHOLDER)" "$file"
grep -E "implement|add later|coming soon|will be" "$file" -i
grep -E "// \.\.\.|/\* \.\.\. \*/|# \.\.\." "$file"
```

**Placeholder text in output:**
```bash
# UI placeholder patterns
grep -E "placeholder|lorem ipsum|coming soon|under construction" "$file" -i
grep -E "sample|example|test data|dummy" "$file" -i
grep -E "\[.*\]|<.*>|\{.*\}" "$file"  # Template brackets left in
```

**Empty or trivial implementations:**
```bash
# Functions that do nothing
grep -E "return null|return undefined|return \{\}|return \[\]" "$file"
grep -E "pass$|\.\.\.|\bnothing\b" "$file"
grep -E "console\.(log|warn|error).*only" "$file"  # Log-only functions
```

**Hardcoded values where dynamic expected:**
```bash
# Hardcoded IDs, counts, or content
grep -E "id.*=.*['\"].*['\"]" "$file"  # Hardcoded string IDs
grep -E "count.*=.*\d+|length.*=.*\d+" "$file"  # Hardcoded counts
grep -E "\\\$\d+\.\d{2}|\d+ items" "$file"  # Hardcoded display values
```

</stub_detection>

<react_components>

## React/Next.js Components

**Existence check:**
```bash
# File exists and exports component
[ -f "$component_path" ] && grep -E "export (default |)function|export const.*=.*\(" "$component_path"
```

**Substantive check:**
```bash
# Returns actual JSX, not placeholder
grep -E "return.*<" "$component_path" | grep -v "return.*null" | grep -v "placeholder" -i

# Has meaningful content (not just wrapper div)
grep -E "<[A-Z][a-zA-Z]+|className=|onClick=|onChange=" "$component_path"

# Uses props or state (not static)
grep -E "props\.|useState|useEffect|useContext|\{.*\}" "$component_path"
```

**Stub patterns specific to React:**
```javascript
// RED FLAGS - These are stubs:
return <div>Component</div>
return <div>Placeholder</div>
return <div>{/* TODO */}</div>
return <p>Coming soon</p>
return null
return <></>

// Also stubs - empty handlers:
onClick={() => {}}
onChange={() => console.log('clicked')}
onSubmit={(e) => e.preventDefault()}  // Only prevents default, does nothing
```

**Wiring check:**
```bash
# Component imports what it needs
grep -E "^import.*from" "$component_path"

# Props are actually used (not just received)
# Look for destructuring or props.X usage
grep -E "\{ .* \}.*props|\bprops\.[a-zA-Z]+" "$component_path"

# API calls exist (for data-fetching components)
grep -E "fetch\(|axios\.|useSWR|useQuery|getServerSideProps|getStaticProps" "$component_path"
```

**Functional verification (human required):**
- Does the component render visible content?
- Do interactive elements respond to clicks?
- Does data load and display?
- Do error states show appropriately?

</react_components>

<api_routes>

## API Routes (Next.js App Router / Express / etc.)

**Existence check:**
```bash
# Route file exists
[ -f "$route_path" ]

# Exports HTTP method handlers (Next.js App Router)
grep -E "export (async )?(function|const) (GET|POST|PUT|PATCH|DELETE)" "$route_path"

# Or Express-style handlers
grep -E "\.(get|post|put|patch|delete)\(" "$route_path"
```

**Substantive check:**
```bash
# Has actual logic, not just return statement
wc -l "$route_path"  # More than 10-15 lines suggests real implementation

# Interacts with data source
grep -E "prisma\.|db\.|mongoose\.|sql|query|find|create|update|delete" "$route_path" -i

# Has error handling
grep -E "try|catch|throw|error|Error" "$route_path"

# Returns meaningful response
grep -E "Response\.json|res\.json|res\.send|return.*\{" "$route_path" | grep -v "message.*not implemented" -i
```

**Stub patterns specific to API routes:**
```typescript
// RED FLAGS - These are stubs:
export async function POST() {
  return Response.json({ message: "Not implemented" })
}

export async function GET() {
  return Response.json([])  // Empty array with no DB query
}

export async function PUT() {
  return new Response()  // Empty response
}

// Console log only:
export async function POST(req) {
  console.log(await req.json())
  return Response.json({ ok: true })
}
```

**Wiring check:**
```bash
# Imports database/service clients
grep -E "^import.*prisma|^import.*db|^import.*client" "$route_path"

# Actually uses request body (for POST/PUT)
grep -E "req\.json\(\)|req\.body|request\.json\(\)" "$route_path"

# Validates input (not just trusting request)
grep -E "schema\.parse|validate|zod|yup|joi" "$route_path"
```

**Functional verification (human or automated):**
- Does GET return real data from database?
- Does POST actually create a record?
- Does error response have correct status code?
- Are auth checks actually enforced?

</api_routes>

<database_schema>

## Database Schema (Prisma / Drizzle / SQL)

**Existence check:**
```bash
# Schema file exists
[ -f "prisma/schema.prisma" ] || [ -f "drizzle/schema.ts" ] || [ -f "src/db/schema.sql" ]

# Model/table is defined
grep -E "^model $model_name|CREATE TABLE $table_name|export const $table_name" "$schema_path"
```

**Substantive check:**
```bash
# Has expected fields (not just id)
grep -A 20 "model $model_name" "$schema_path" | grep -E "^\s+\w+\s+\w+"

# Has relationships if expected
grep -E "@relation|REFERENCES|FOREIGN KEY" "$schema_path"

# Has appropriate field types (not all String)
grep -A 20 "model $model_name" "$schema_path" | grep -E "Int|DateTime|Boolean|Float|Decimal|Json"
```

**Stub patterns specific to schemas:**
```prisma
// RED FLAGS - These are stubs:
model User {
  id String @id
  // TODO: add fields
}

model Message {
  id        String @id
  content   String  // Only one real field
}

// Missing critical fields:
model Order {
  id     String @id
  // No: userId, items, total, status, createdAt
}
```

**Wiring check:**
```bash
# Migrations exist and are applied
ls prisma/migrations/ 2>/dev/null | wc -l  # Should be > 0
npx prisma migrate status 2>/dev/null | grep -v "pending"

# Client is generated
[ -d "node_modules/.prisma/client" ]
```

**Functional verification:**
```bash
# Can query the table (automated)
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM $table_name"
```

</database_schema>

<hooks_utilities>

## Custom Hooks and Utilities

**Existence check:**
```bash
# File exists and exports function
[ -f "$hook_path" ] && grep -E "export (default )?(function|const)" "$hook_path"
```

**Substantive check:**
```bash
# Hook uses React hooks (for custom hooks)
grep -E "useState|useEffect|useCallback|useMemo|useRef|useContext" "$hook_path"

# Has meaningful return value
grep -E "return \{|return \[" "$hook_path"

# More than trivial length
[ $(wc -l < "$hook_path") -gt 10 ]
```

**Stub patterns specific to hooks:**
```typescript
// RED FLAGS - These are stubs:
export function useAuth() {
  return { user: null, login: () => {}, logout: () => {} }
}

export function useCart() {
  const [items, setItems] = useState([])
  return { items, addItem: () => console.log('add'), removeItem: () => {} }
}

// Hardcoded return:
export function useUser() {
  return { name: "Test User", email: "test@example.com" }
}
```

**Wiring check:**
```bash
# Hook is actually imported somewhere
grep -r "import.*$hook_name" src/ --include="*.tsx" --include="*.ts" | grep -v "$hook_path"

# Hook is actually called
grep -r "$hook_name()" src/ --include="*.tsx" --include="*.ts" | grep -v "$hook_path"
```

</hooks_utilities>

<environment_config>

## Environment Variables and Configuration

**Existence check:**
```bash
# .env file exists
[ -f ".env" ] || [ -f ".env.local" ]

# Required variable is defined
grep -E "^$VAR_NAME=" .env .env.local 2>/dev/null
```

**Substantive check:**
```bash
# Variable has actual value (not placeholder)
grep -E "^$VAR_NAME=.+" .env .env.local 2>/dev/null | grep -v "your-.*-here|xxx|placeholder|TODO" -i

# Value looks valid for type:
# - URLs should start with http
# - Keys should be long enough
# - Booleans should be true/false
```

**Stub patterns specific to env:**
```bash
# RED FLAGS - These are stubs:
DATABASE_URL=your-database-url-here
STRIPE_SECRET_KEY=sk_test_xxx
API_KEY=placeholder
NEXT_PUBLIC_API_URL=http://localhost:3000  # Still pointing to localhost in prod
```

**Wiring check:**
```bash
# Variable is actually used in code
grep -r "process\.env\.$VAR_NAME|env\.$VAR_NAME" src/ --include="*.ts" --include="*.tsx"

# Variable is in validation schema (if using zod/etc for env)
grep -E "$VAR_NAME" src/env.ts src/env.mjs 2>/dev/null
```

</environment_config>

<wiring_verification>

## Wiring Verification Patterns

Wiring verification checks that components actually communicate. This is where most stubs hide.

### Pattern: Component -> API

**Check:** Does the component actually call the API?

```bash
# Find the fetch/axios call
grep -E "fetch\(['\"].*$api_path|axios\.(get|post).*$api_path" "$component_path"

# Verify it's not commented out
grep -E "fetch\(|axios\." "$component_path" | grep -v "^.*//.*fetch"

# Check the response is used
grep -E "await.*fetch|\.then\(|setData|setState" "$component_path"
```

**Red flags:**
```typescript
// Fetch exists but response ignored:
fetch('/api/messages')  // No await, no .then, no assignment

// Fetch in comment:
// fetch('/api/messages').then(r => r.json()).then(setMessages)

// Fetch to wrong endpoint:
fetch('/api/message')  // Typo - should be /api/messages
```

### Pattern: API -> Database

**Check:** Does the API route actually query the database?

```bash
# Find the database call
grep -E "prisma\.$model|db\.query|Model\.find" "$route_path"

# Verify it's awaited
grep -E "await.*prisma|await.*db\." "$route_path"

# Check result is returned
grep -E "return.*json.*data|res\.json.*result" "$route_path"
```

**Red flags:**
```typescript
// Query exists but result not returned:
await prisma.message.findMany()
return Response.json({ ok: true })  // Returns static, not query result

// Query not awaited:
const messages = prisma.message.findMany()  // Missing await
return Response.json(messages)  // Returns Promise, not data
```

### Pattern: Form -> Handler

**Check:** Does the form submission actually do something?

```bash
# Find onSubmit handler
grep -E "onSubmit=\{|handleSubmit" "$component_path"

# Check handler has content
grep -A 10 "onSubmit.*=" "$component_path" | grep -E "fetch|axios|mutate|dispatch"

# Verify not just preventDefault
grep -A 5 "onSubmit" "$component_path" | grep -v "only.*preventDefault" -i
```

**Red flags:**
```typescript
// Handler only prevents default:
onSubmit={(e) => e.preventDefault()}

// Handler only logs:
const handleSubmit = (data) => {
  console.log(data)
}

// Handler is empty:
onSubmit={() => {}}
```

### Pattern: State -> Render

**Check:** Does the component render state, not hardcoded content?

```bash
# Find state usage in JSX
grep -E "\{.*messages.*\}|\{.*data.*\}|\{.*items.*\}" "$component_path"

# Check map/render of state
grep -E "\.map\(|\.filter\(|\.reduce\(" "$component_path"

# Verify dynamic content
grep -E "\{[a-zA-Z_]+\." "$component_path"  # Variable interpolation
```

**Red flags:**
```tsx
// Hardcoded instead of state:
return <div>
  <p>Message 1</p>
  <p>Message 2</p>
</div>

// State exists but not rendered:
const [messages, setMessages] = useState([])
return <div>No messages</div>  // Always shows "no messages"

// Wrong state rendered:
const [messages, setMessages] = useState([])
return <div>{otherData.map(...)}</div>  // Uses different data
```

</wiring_verification>

<verification_checklist>

## Quick Verification Checklist

For each artifact type, run through this checklist:

### Component Checklist
- [ ] File exists at expected path
- [ ] Exports a function/const component
- [ ] Returns JSX (not null/empty)
- [ ] No placeholder text in render
- [ ] Uses props or state (not static)
- [ ] Event handlers have real implementations
- [ ] Imports resolve correctly
- [ ] Used somewhere in the app

### API Route Checklist
- [ ] File exists at expected path
- [ ] Exports HTTP method handlers
- [ ] Handlers have more than 5 lines
- [ ] Queries database or service
- [ ] Returns meaningful response (not empty/placeholder)
- [ ] Has error handling
- [ ] Validates input
- [ ] Called from frontend

### Schema Checklist
- [ ] Model/table defined
- [ ] Has all expected fields
- [ ] Fields have appropriate types
- [ ] Relationships defined if needed
- [ ] Migrations exist and applied
- [ ] Client generated

### Hook/Utility Checklist
- [ ] File exists at expected path
- [ ] Exports function
- [ ] Has meaningful implementation (not empty returns)
- [ ] Used somewhere in the app
- [ ] Return values consumed

### Wiring Checklist
- [ ] Component -> API: fetch/axios call exists and uses response
- [ ] API -> Database: query exists and result returned
- [ ] Form -> Handler: onSubmit calls API/mutation
- [ ] State -> Render: state variables appear in JSX

</verification_checklist>

<automated_verification_script>

## Automated Verification Approach

For the tsx-verifier agent, use this pattern:

```bash
# 1. Check existence
check_exists() {
  [ -f "$1" ] && echo "EXISTS: $1" || echo "MISSING: $1"
}

# 2. Check for stub patterns
check_stubs() {
  local file="$1"
  local stubs=$(grep -c -E "TODO|FIXME|placeholder|not implemented" "$file" 2>/dev/null || echo 0)
  [ "$stubs" -gt 0 ] && echo "STUB_PATTERNS: $stubs in $file"
}

# 3. Check wiring (component calls API)
check_wiring() {
  local component="$1"
  local api_path="$2"
  grep -q "$api_path" "$component" && echo "WIRED: $component -> $api_path" || echo "NOT_WIRED: $component -> $api_path"
}

# 4. Check substantive (more than N lines, has expected patterns)
check_substantive() {
  local file="$1"
  local min_lines="$2"
  local pattern="$3"
  local lines=$(wc -l < "$file" 2>/dev/null || echo 0)
  local has_pattern=$(grep -c -E "$pattern" "$file" 2>/dev/null || echo 0)
  [ "$lines" -ge "$min_lines" ] && [ "$has_pattern" -gt 0 ] && echo "SUBSTANTIVE: $file" || echo "THIN: $file ($lines lines, $has_pattern matches)"
}
```

Run these checks against each must-have artifact. Aggregate results into VERIFICATION.md.

</automated_verification_script>

<human_verification_triggers>

## When to Require Human Verification

Some things can't be verified programmatically. Flag these for human testing:

**Always human:**
- Visual appearance (does it look right?)
- User flow completion (can you actually do the thing?)
- Real-time behavior (WebSocket, SSE)
- External service integration (Stripe, email sending)
- Error message clarity (is the message helpful?)
- Performance feel (does it feel fast?)

**Human if uncertain:**
- Complex wiring that grep can't trace
- Dynamic behavior depending on state
- Edge cases and error states
- Mobile responsiveness
- Accessibility

**Format for human verification request:**
```markdown
## Human Verification Required

### 1. Chat message sending
**Test:** Type a message and click Send
**Expected:** Message appears in list, input clears
**Check:** Does message persist after refresh?

### 2. Error handling
**Test:** Disconnect network, try to send
**Expected:** Error message appears, message not lost
**Check:** Can retry after reconnect?
```

</human_verification_triggers>

<checkpoint_automation_reference>

## Pre-Checkpoint Automation

For automation-first checkpoint patterns, server lifecycle management, CLI installation handling, and error recovery protocols, see:

**topstepx/references/checkpoints.md** -> `<automation_reference>` section

Key principles:
- Claude sets up verification environment BEFORE presenting checkpoints
- Users never run CLI commands (visit URLs only)
- Server lifecycle: start before checkpoint, handle port conflicts, keep running for duration
- CLI installation: auto-install where safe, checkpoint for user choice otherwise
- Error handling: fix broken environment before checkpoint, never present checkpoint with failed setup

</checkpoint_automation_reference>

<trading_specific_verification>

## Trading-Specific Verification Patterns

These verification patterns are specific to TopStepX trading bot development. They complement the universal patterns above with domain-specific checks that the tsx-verifier and tsx-executor agents use when building and validating trading integrations.

### 1. Order Placement Verification

**What to check:** All order objects use named enum constants and include proper bracket orders.

**How to check:**
```bash
# Verify NO bare integers for order side (OrderSide.Bid = 0, OrderSide.Ask = 1)
grep -rn "side:\s*[0-9]" src/ | wc -l  # Should be 0

# Verify NO bare integers for order type (OrderType.Market = 2, etc.)
grep -rn "type:\s*[0-9]" src/ | wc -l  # Should be 0

# Verify bracket orders are attached by default (take-profit + stop-loss)
grep -rn "takeProfit\|stopLoss\|bracket" src/ | wc -l  # Should be >= 1

# Verify position sizing respects max limits
grep -rn "maxPosition\|MAX_POSITION\|positionLimit" src/ | wc -l  # Should be >= 1
```

**Why it matters:** Bare integers for enum values (e.g., `side: 0` instead of `side: OrderSide.Bid`) are the most common source of silent order errors. If the API changes enum assignments or if a developer misremembers the mapping, orders go to the wrong side. Similarly, orders without bracket protection (take-profit + stop-loss) expose the account to unlimited loss on a single trade. See safety-patterns.md SAF-01 for complete enum definitions.

### 2. WebSocket Connection Verification

**What to check:** SignalR connection uses automatic reconnection and re-establishes subscriptions.

**How to check:**
```bash
# Verify .withAutomaticReconnect() is used on HubConnectionBuilder
grep -rn "withAutomaticReconnect" src/ | wc -l  # Should be >= 1

# Verify all hub subscriptions are re-established after reconnection
grep -rn "onreconnected\|onReconnected\|on.*reconnect" src/ -i | wc -l  # Should be >= 1

# Verify the connection handles auth token injection
grep -rn "accessTokenFactory\|accessToken" src/ | wc -l  # Should be >= 1

# Verify connection URL points to rtc.topstepx.com
grep -rn "rtc\.topstepx\.com" src/ | wc -l  # Should be >= 1
```

**Why it matters:** Without `.withAutomaticReconnect()`, a dropped WebSocket connection leaves the bot blind to market data. Without re-subscribing to hubs after reconnect, the connection is live but no data flows. Without token injection, the connection is rejected immediately. These are the three most common WebSocket failure modes in TopStepX bots.

### 3. JWT Token Management Verification

**What to check:** Proactive token refresh timer exists, not reactive-only on 401.

**How to check:**
```bash
# Verify proactive refresh timer exists
grep -rn "refreshInterval\|refresh_interval\|REFRESH\|refreshToken\|refreshTimer" src/ | wc -l  # Should be >= 1

# Verify refresh interval is set (should be < 24 hours, the token TTL)
grep -rn "23.*60.*60\|82800\|refreshInterval" src/ | wc -l  # Should be >= 1

# Verify fallback to re-authentication if refresh fails
grep -rn "re.auth\|loginKey\|reauthenticate\|login.*fail\|refresh.*fail" src/ -i | wc -l  # Should be >= 1

# Verify validate endpoint is used
grep -rn "Auth/validate\|auth/validate" src/ | wc -l  # Should be >= 1
```

**Why it matters:** TopStepX JWT tokens expire after 24 hours. A bot that only handles 401 errors reactively will have a window where trades fail because the token expired between the check and the API call. Proactive refresh (e.g., refreshing 1 hour before expiry) prevents this gap. If the refresh itself fails, the bot must fall back to full re-authentication using `POST /api/Auth/loginKey`. See safety-patterns.md SAF-02.

### 4. Rate Limit Compliance Verification

**What to check:** Rate limiter wraps history endpoint calls with correct limits.

**How to check:**
```bash
# Verify rate limiter or throttle exists
grep -rn "rateLimiter\|RateLimiter\|rate_limit\|RATE_LIMIT\|throttle" src/ | wc -l  # Should be >= 1

# Verify rate limit constants match documented values
# History: 50 requests per 30 seconds
# General: 200 requests per 60 seconds
grep -rn "50.*30\|RATE_LIMIT\|30000\|30_000" src/ | wc -l  # Should be >= 1

# Verify history endpoint calls go through rate limiter
grep -rn "retrieveBars\|History" src/ | wc -l  # Should be >= 1
```

**Why it matters:** The TopStepX API enforces hard rate limits: 50 requests per 30 seconds for history (`/api/History/retrieveBars`) and 200 requests per 60 seconds for general endpoints. Exceeding these returns 429 errors and may flag the account. A rate limiter that uses incorrect constants (e.g., 100/60s instead of 50/30s for history) will still hit limits. See safety-patterns.md SAF-03.

### 5. Enum Usage Verification

**What to check:** All 6 enum types are defined as named constants with zero bare integer usage.

**How to check:**
```bash
# Verify all 6 enum types are defined
for enum_name in OrderSide OrderType OrderStatus PositionType TimeInForce ContractType; do
  grep -rn "$enum_name" src/ | wc -l
done
# Each should return >= 1

# Automated check: zero bare integers for side
grep -rn "side:\s*[0-9]" src/ | wc -l  # Must be 0

# Automated check: zero bare integers for order type
grep -rn "type:\s*[0-9]" src/ | wc -l  # Must be 0 (for order type context)

# Verify enum definitions match API spec
# OrderSide: Bid=0, Ask=1
# OrderType: Unknown=0, Limit=1, Market=2, StopLimit=3, Stop=4, TrailingStop=5, JoinBid=6, JoinAsk=7
# OrderStatus: None=0, Open=1, Filled=2, Cancelled=3, Expired=4, Rejected=5, Pending=6
grep -rn "Bid.*0\|Ask.*1" src/ | wc -l  # Should be >= 1
```

**Why it matters:** TopStepX uses 6 enum types across its API. Using bare integers (`side: 0`) instead of named constants (`side: OrderSide.Bid`) makes code fragile, unreadable, and error-prone. A single misremembered mapping (e.g., confusing Bid=0 with Buy=1) can cause the bot to trade in the opposite direction. The tsx-verifier agent should reject any code that uses bare integers for enum values. Reference: safety-patterns.md SAF-01 for complete enum definitions.

### 6. PineScript Conversion Verification (when applicable)

**What to check:** Converted PineScript strategy has been audited for repainting patterns.

**How to check:**
```bash
# Verify repainting audit was performed (SAF-04 checklist)
# Check for barstate.isconfirmed equivalent in signal logic
grep -rn "isconfirmed\|barstate\|confirmed.*bar\|bar.*confirmed" src/ -i | wc -l  # Should be >= 1 if converting PineScript

# Verify request.security() references use [1] offset + lookahead_on
# In converted code, this manifests as using previous-bar data for HTF signals
grep -rn "previousBar\|prevBar\|\[1\]\|offset.*1\|higher.*timeframe" src/ -i | wc -l  # Should be >= 1 if using multi-timeframe

# Verify no repainting patterns survive conversion
# Check that entry/exit signals use confirmed data, not intra-bar values
grep -rn "close\b" src/ | grep -v "\.close\[" | grep -v "confirmed" | wc -l  # Review any hits manually

# Verify the conversion documents which PineScript functions map to which JS implementations
grep -rn "ta\.crossover\|ta\.crossunder\|ta\.sma\|ta\.ema\|ta\.rsi" src/ -i | wc -l  # Should match expected TA function count
```

**Why it matters:** PineScript strategies that use `request.security()` without the `[1]` offset and `lookahead_on` combination will repaint -- meaning the backtest shows signals that would not have existed in real-time. Similarly, strategies that use `close` on unconfirmed bars make decisions on data that changes within the bar. A bot converted from a repainting strategy will appear to work in backtesting but produce different (usually worse) results in live trading. The tsx-executor agent must run the SAF-04 repainting audit checklist before declaring a PineScript conversion complete. Reference: safety-patterns.md SAF-04 for the complete repainting audit checklist.

### Trading Verification Summary

| Pattern | Key Check | Grep Command | Expected |
|---------|-----------|--------------|----------|
| Order Placement | No bare enum integers | `grep -rn "side:\s*[0-9]" src/` | 0 results |
| Order Placement | Bracket orders present | `grep -rn "takeProfit\|stopLoss" src/` | >= 1 |
| WebSocket | Auto-reconnect enabled | `grep -rn "withAutomaticReconnect" src/` | >= 1 |
| WebSocket | Token injection | `grep -rn "accessTokenFactory" src/` | >= 1 |
| JWT | Proactive refresh | `grep -rn "refreshInterval\|refreshTimer" src/` | >= 1 |
| JWT | Validate endpoint used | `grep -rn "Auth/validate" src/` | >= 1 |
| Rate Limits | Limiter exists | `grep -rn "rateLimiter\|RATE_LIMIT" src/` | >= 1 |
| Rate Limits | History limit correct | `grep -rn "50.*30\|30_000" src/` | >= 1 |
| Enums | All 6 types defined | `grep -rn "OrderSide\|OrderType\|OrderStatus" src/` | >= 1 each |
| PineScript | Repainting audit done | `grep -rn "isconfirmed\|confirmed.*bar" src/` | >= 1 |
| PineScript | HTF offset used | `grep -rn "previousBar\|\[1\]" src/` | >= 1 |

The tsx-verifier agent should run these checks as part of every trading bot plan verification. Failed checks should block plan completion and be reported as verification failures.

</trading_specific_verification>
