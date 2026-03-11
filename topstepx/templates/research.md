# Research Template

Template for `.planning/phases/XX-name/{phase_num}-RESEARCH.md` - comprehensive ecosystem research before planning.

**Purpose:** Document what Claude needs to know to implement a phase well - not just "which library" but "how do experts build this."

---

## File Template

```markdown
# Phase [X]: [Name] - Research

**Researched:** [date]
**Domain:** [primary technology/problem domain]
**Confidence:** [HIGH/MEDIUM/LOW]

<user_constraints>
## User Constraints (from CONTEXT.md)

**CRITICAL:** If CONTEXT.md exists from /tsx:discuss-phase, copy locked decisions here verbatim. These MUST be honored by the planner.

### Locked Decisions
[Copy from CONTEXT.md `## Decisions` section - these are NON-NEGOTIABLE]
- [Decision 1]
- [Decision 2]

### Claude's Discretion
[Copy from CONTEXT.md - areas where researcher/planner can choose]
- [Area 1]
- [Area 2]

### Deferred Ideas (OUT OF SCOPE)
[Copy from CONTEXT.md - do NOT research or plan these]
- [Deferred 1]
- [Deferred 2]

**If no CONTEXT.md exists:** Write "No user constraints - all decisions at Claude's discretion"
</user_constraints>

<research_summary>
## Summary

[2-3 paragraph executive summary]
- What was researched
- What the standard approach is
- Key recommendations

**Primary recommendation:** [one-liner actionable guidance]
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| [name] | [ver] | [what it does] | [why experts use it] |
| [name] | [ver] | [what it does] | [why experts use it] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| [name] | [ver] | [what it does] | [use case] |
| [name] | [ver] | [what it does] | [use case] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| [standard] | [alternative] | [when alternative makes sense] |

**Installation:**
```bash
npm install [packages]
# or
yarn add [packages]
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
+-- [folder]/        # [purpose]
+-- [folder]/        # [purpose]
+-- [folder]/        # [purpose]
```

### Pattern 1: [Pattern Name]
**What:** [description]
**When to use:** [conditions]
**Example:**
```typescript
// [code example from Context7/official docs]
```

### Pattern 2: [Pattern Name]
**What:** [description]
**When to use:** [conditions]
**Example:**
```typescript
// [code example]
```

### Anti-Patterns to Avoid
- **[Anti-pattern]:** [why it's bad, what to do instead]
- **[Anti-pattern]:** [why it's bad, what to do instead]
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| [problem] | [what you'd build] | [library] | [edge cases, complexity] |
| [problem] | [what you'd build] | [library] | [edge cases, complexity] |
| [problem] | [what you'd build] | [library] | [edge cases, complexity] |

**Key insight:** [why custom solutions are worse in this domain]
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: [Name]
**What goes wrong:** [description]
**Why it happens:** [root cause]
**How to avoid:** [prevention strategy]
**Warning signs:** [how to detect early]

### Pitfall 2: [Name]
**What goes wrong:** [description]
**Why it happens:** [root cause]
**How to avoid:** [prevention strategy]
**Warning signs:** [how to detect early]

### Pitfall 3: [Name]
**What goes wrong:** [description]
**Why it happens:** [root cause]
**How to avoid:** [prevention strategy]
**Warning signs:** [how to detect early]
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### [Common Operation 1]
```typescript
// Source: [Context7/official docs URL]
[code]
```

### [Common Operation 2]
```typescript
// Source: [Context7/official docs URL]
[code]
```

### [Common Operation 3]
```typescript
// Source: [Context7/official docs URL]
[code]
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| [old] | [new] | [date/version] | [what it means for implementation] |

**New tools/patterns to consider:**
- [Tool/Pattern]: [what it enables, when to use]
- [Tool/Pattern]: [what it enables, when to use]

**Deprecated/outdated:**
- [Thing]: [why it's outdated, what replaced it]
</sota_updates>

<open_questions>
## Open Questions

Things that couldn't be fully resolved:

1. **[Question]**
   - What we know: [partial info]
   - What's unclear: [the gap]
   - Recommendation: [how to handle during planning/execution]

2. **[Question]**
   - What we know: [partial info]
   - What's unclear: [the gap]
   - Recommendation: [how to handle]
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Context7 library ID] - [topics fetched]
- [Official docs URL] - [what was checked]

### Secondary (MEDIUM confidence)
- [WebSearch verified with official source] - [finding + verification]

### Tertiary (LOW confidence - needs validation)
- [WebSearch only] - [finding, marked for validation during implementation]
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: [what]
- Ecosystem: [libraries explored]
- Patterns: [patterns researched]
- Pitfalls: [areas checked]

**Confidence breakdown:**
- Standard stack: [HIGH/MEDIUM/LOW] - [reason]
- Architecture: [HIGH/MEDIUM/LOW] - [reason]
- Pitfalls: [HIGH/MEDIUM/LOW] - [reason]
- Code examples: [HIGH/MEDIUM/LOW] - [reason]

**Research date:** [date]
**Valid until:** [estimate - 30 days for stable tech, 7 days for fast-moving]
</metadata>

---

*Phase: XX-name*
*Research completed: [date]*
*Ready for planning: [yes/no]*
```

---

## Good Examples

**Example 1: 3D City Driving (generic)**

```markdown
# Phase 3: 3D City Driving - Research

**Researched:** 2025-01-20
**Domain:** Three.js 3D web game with driving mechanics
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Three.js ecosystem for building a 3D city driving game. The standard approach uses Three.js with React Three Fiber for component architecture, Rapier for physics, and drei for common helpers.

Key finding: Don't hand-roll physics or collision detection. Rapier (via @react-three/rapier) handles vehicle physics, terrain collision, and city object interactions efficiently. Custom physics code leads to bugs and performance issues.

**Primary recommendation:** Use R3F + Rapier + drei stack. Start with vehicle controller from drei, add Rapier vehicle physics, build city with instanced meshes for performance.
</research_summary>

...
```

**Example 2: TopStepX API Integration (trading)**

```markdown
# Phase 2: WebSocket Integration - Research

**Researched:** 2025-02-15
**Domain:** TopStepX WebSocket API integration for real-time market data
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use @microsoft/signalr for WebSocket connections (TopStepX uses SignalR protocol)
- Bar-close execution model only -- no tick-based signals
- 5-minute bar aggregation for strategy signals

### Claude's Discretion
- Reconnection backoff strategy
- Internal event bus implementation
- Logging library choice

### Deferred Ideas (OUT OF SCOPE)
- Multi-instrument support -- Phase 4
- Historical data backfill -- Phase 3
</user_constraints>

<research_summary>
## Summary

Researched TopStepX WebSocket integration patterns for real-time market data. The API uses SignalR protocol (not raw WebSocket) with JWT authentication. Key finding: the connection requires proactive token refresh before the 24hr JWT expiry -- waiting for a 401 error causes missed market data during reconnection.

Three subscription types are needed: subscribeBars (OHLCV data), subscribeDOM (depth of market), and orderStatus (fill notifications). Each subscription requires an active accountId and contractId obtained from REST API first.

Critical pitfall: the WebSocket connection silently drops after network interruptions without error events. Must implement heartbeat monitoring with automatic reconnection. The @microsoft/signalr library handles reconnection natively but needs configuration for trading-appropriate intervals (1s, 2s, 5s backoff, max 30s).

**Primary recommendation:** Use @microsoft/signalr with automatic reconnection enabled, proactive 23hr JWT refresh via TokenManager (SAF-02 pattern), and heartbeat monitoring. Subscribe to bars and orderStatus at minimum; DOM subscription only if strategy requires it.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @microsoft/signalr | 8.x | SignalR client for WebSocket | TopStepX API uses SignalR protocol; required |
| trading-signals | 4.x | Technical indicators | EMA, SMA, RSI -- well-tested, TypeScript-native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pino | 9.x | Structured logging | Trade event logging with timestamps |
| ws | 8.x | Raw WebSocket (fallback) | Only if SignalR transport needs override |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @microsoft/signalr | Raw WebSocket | Raw WS won't negotiate SignalR protocol -- will fail |
| trading-signals | technicalindicators | technicalindicators is larger, less maintained |
| pino | winston | winston heavier; pino faster for high-frequency trade logging |

**Installation:**
```bash
npm install @microsoft/signalr trading-signals pino
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
+-- api/
|   +-- auth.ts           # JWT auth + TokenManager
|   +-- rest.ts            # REST API client
|   +-- websocket.ts       # SignalR connection manager
+-- strategy/
|   +-- indicators.ts      # EMA/SMA calculations
|   +-- signals.ts         # Entry/exit signal logic
+-- orders/
|   +-- orderManager.ts    # Order placement with brackets
+-- utils/
    +-- rateLimiter.ts     # Rate limit enforcement
    +-- enums.ts           # OrderSide, OrderType constants
```

### Pattern 1: SignalR Connection with Proactive Token Refresh
**What:** Connect to TopStepX WebSocket with JWT auth, refresh token before expiry
**When to use:** Any TopStepX WebSocket integration
**Example:**
```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('wss://gateway.topstepx.com/hubs/market', {
    accessTokenFactory: () => tokenManager.getToken()
  })
  .withAutomaticReconnect([1000, 2000, 5000, 10000, 30000])
  .build();

// Subscribe to bars after connection starts
await connection.start();
await connection.invoke('subscribeBars', contractId, barUnit, barPeriod);
```

### Pattern 2: Rate-Limited REST Client
**What:** Wrap fetch with rate limit tracking per TopStepX limits
**When to use:** All REST API calls
**Example:**
```typescript
// SAF-03: 200 req/60s general, 50 req/30s history
const rateLimiter = new RateLimiter({
  general: { requests: 200, windowMs: 60_000 },
  history: { requests: 50, windowMs: 30_000 }
});

async function apiCall(endpoint, options) {
  const bucket = endpoint.includes('history') ? 'history' : 'general';
  await rateLimiter.waitForSlot(bucket);
  return fetch(`https://gateway.topstepx.com${endpoint}`, options);
}
```

### Anti-Patterns to Avoid
- **Waiting for 401 to refresh JWT:** Token expires after 24hr; proactive 23hr refresh avoids data gaps
- **Using raw WebSocket instead of SignalR:** TopStepX uses SignalR protocol negotiation; raw WS connections will fail
- **Bare integer enum values:** Always use named constants (OrderSide.Bid, not 0) per SAF-01
</architecture_patterns>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Silent WebSocket Disconnection
**What goes wrong:** WebSocket drops after network blip, bot continues without market data, misses signals
**Why it happens:** SignalR reconnection events don't always fire on network-level drops
**How to avoid:** Implement heartbeat monitoring -- if no bar data received in 2x expected interval, force reconnect
**Warning signs:** Long gaps in bar data timestamps, strategy goes quiet during active market hours

### Pitfall 2: JWT Expiry During Active Trading
**What goes wrong:** Token expires, all API calls fail with 401, orders rejected, WebSocket disconnects
**Why it happens:** JWT is valid 24hr but developers don't implement proactive refresh
**How to avoid:** TokenManager with 23hr refresh timer (SAF-02 pattern), refresh on startup
**Warning signs:** 401 errors appearing in logs, orders rejected near 24hr mark

### Pitfall 3: Rate Limit Exceeded on Startup
**What goes wrong:** Bot starts up, rapidly calls multiple endpoints (accounts, contracts, positions, history), hits 200/60s limit
**Why it happens:** Sequential initialization makes many API calls in burst
**How to avoid:** Use RateLimiter class, batch initialization calls, cache contract lookups
**Warning signs:** 429 responses during bot startup sequence
</common_pitfalls>

<sources>
## Sources

### Primary (HIGH confidence)
- TopStepX API documentation (TOPSTEPX_API.md reference) -- REST and WebSocket endpoints
- @microsoft/signalr npm package docs -- connection builder, reconnection, hub invocation
- safety-patterns.md (Phase 1 reference) -- TokenManager, RateLimiter, bracket order patterns

### Secondary (MEDIUM confidence)
- SignalR protocol specification -- transport negotiation, keep-alive behavior

### Tertiary (LOW confidence - needs validation)
- None -- all findings verified against API docs and library documentation
</sources>

---

*Phase: 02-websocket-integration*
*Research completed: 2025-02-15*
*Ready for planning: yes*
```

---

## Guidelines

**When to create:**
- Before planning phases in niche/complex domains
- When Claude's training data is likely stale or sparse
- When "how do experts do this" matters more than "which library"

**Structure:**
- Use XML tags for section markers (matches TSX templates)
- Seven core sections: summary, standard_stack, architecture_patterns, dont_hand_roll, common_pitfalls, code_examples, sources
- All sections required (drives comprehensive research)

**Content quality:**
- Standard stack: Specific versions, not just names
- Architecture: Include actual code examples from authoritative sources
- Don't hand-roll: Be explicit about what problems to NOT solve yourself
- Pitfalls: Include warning signs, not just "don't do this"
- Sources: Mark confidence levels honestly

**Integration with planning:**
- RESEARCH.md loaded as @context reference in PLAN.md
- Standard stack informs library choices
- Don't hand-roll prevents custom solutions
- Pitfalls inform verification criteria
- Code examples can be referenced in task actions

**After creation:**
- File lives in phase directory: `.planning/phases/XX-name/{phase_num}-RESEARCH.md`
- Referenced during planning workflow
- plan-phase loads it automatically when present
