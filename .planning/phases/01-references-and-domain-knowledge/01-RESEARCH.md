# Phase 1: References and Domain Knowledge - Research

**Researched:** 2026-03-11
**Domain:** Trading domain reference documentation, GSD framework adaptation, safety patterns
**Confidence:** HIGH

## Summary

Phase 1 is a content-creation phase, not a software engineering phase. The deliverables are Markdown reference files that AI agents will load as context when building TopStepX trading bots. There are three domains of work: (1) consolidating and relocating existing API and PineScript documentation into the framework's reference directory, (2) adapting GSD's framework-level references with tsx-* naming and trading domain context, and (3) embedding safety patterns (risk guardrails, JWT refresh, rate limits, repainting audits, error handling) directly into the reference materials so they're available from day one.

The existing content is strong. TOPSTEPX_API.md (24KB) is a complete API reference covering REST, WebSocket, and enums. PINESCRIPT.md (14KB) covers v6 syntax, execution model, strategy functions, TA functions, and conversion mappings. The split references (rest-api.md, realtime.md, enums.md) in `skills/topstepx-api/references/` provide detailed endpoint-level docs. The GSD references at `~/.claude/get-shit-done/references/` contain 9 files covering checkpoints, git integration, verification patterns, model profiles, questioning, TDD, UI brand, continuation format, and planning config.

**Primary recommendation:** Treat this as structured content migration and authoring -- no library installation, no code compilation. The planner should create plans around content domains (API reference, PineScript reference, trading questioning guide, GSD adaptation, safety patterns) with clear verification that each document exists, is substantive, and contains required sections.

## Standard Stack

This phase has no traditional software stack. All deliverables are Markdown files.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Markdown | N/A | Documentation format | Universal AI agent consumption format |
| YAML frontmatter | N/A | Skill metadata | agentskills.io open standard, all 4 platforms parse it |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Node.js | >= 18 | Installer reads files array | Only for package.json `files` field validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Markdown | JSON schema | Markdown is readable by both humans and AI; JSON is machine-only |
| Single consolidated docs | Many small files | Consolidated docs reduce context-loading overhead for agents |

**Installation:** No installation needed for this phase. Content authoring only.

## Architecture Patterns

### Recommended Project Structure

The framework output structure (what the installer will eventually distribute) needs to be established in this phase, even though only the `references/` and partial `templates/` portions are populated now.

```
skills/
  topstepx-api/              # Existing v1.0 skill (preserved)
    SKILL.md
    references/
      rest-api.md
      realtime.md
      enums.md
topstepx/                    # NEW: Full framework content root
  references/                # Phase 1 output goes here
    TOPSTEPX_API.md          # REF-01: Consolidated API reference
    PINESCRIPT.md             # REF-02: PineScript + conversion mappings
    questioning.md            # REF-03: Trading-specific questioning guide
    checkpoints.md            # REF-04: Adapted from GSD
    git-integration.md        # REF-04: Adapted from GSD
    verification-patterns.md  # REF-04: Adapted from GSD
    model-profiles.md         # REF-04: Adapted from GSD
    continuation-format.md    # REF-04: Adapted from GSD
    planning-config.md        # REF-04: Adapted from GSD
    tdd.md                    # REF-04: Adapted from GSD
    ui-brand.md               # REF-04: Adapted from GSD
    safety-patterns.md        # SAF-01 through SAF-05: Consolidated safety reference
  templates/                 # Placeholder for Phase 2
  agents/                    # Placeholder for Phase 3
  workflows/                 # Placeholder for Phase 4
```

### Pattern 1: Content Consolidation with Layering

**What:** Maintain both the v1.0 `skills/topstepx-api/` skill (for backward compatibility) and the new `topstepx/` framework directory. The consolidated reference docs (TOPSTEPX_API.md, PINESCRIPT.md) go into `topstepx/references/`, while the split reference files remain in `skills/topstepx-api/references/` for existing users.

**When to use:** This phase and all subsequent phases. The `topstepx/` directory becomes the canonical framework root.

**Why:** The existing npm-published v1.0 skill works. Users who installed it have `skills/topstepx-api/` in their platform directories. We don't break them. The new framework content goes into `topstepx/` which the expanded installer (Phase 10) will distribute.

### Pattern 2: GSD Reference Adaptation (Not Fork)

**What:** Copy each GSD reference file, then adapt it for the trading domain. Preserve GSD's structure and patterns exactly. Only change: (a) naming from `gsd-*` to `tsx-*` in agent/workflow references, (b) add trading-specific examples where generic examples exist, (c) add trading-specific sections where needed (e.g., trading checkpoints).

**When to use:** Every GSD reference in REF-04.

**Why:** GSD's references are battle-tested patterns. The goal is domain specialization, not architectural divergence. If GSD's git-integration.md has a commit format section, the tsx version has the same section with the same format, just tsx-* prefixes. This keeps future GSD updates easy to merge forward.

### Pattern 3: Safety as Reference Content (Not Runtime Code)

**What:** Safety patterns (SAF-01 through SAF-05) are documented as reference content that agents and templates load, not as runtime code. A `safety-patterns.md` reference file contains all five safety domains with copy-pasteable code patterns.

**When to use:** All SAF-* requirements in this phase.

**Why:** TSX is a content framework, not a runtime application. Safety patterns need to be in agent-loadable form so that Phase 2 templates and Phase 3 agents can reference them. Documenting safety patterns as code blocks in a reference file means any template or agent can `@-reference` the file and get the patterns.

### Anti-Patterns to Avoid

- **Splitting safety patterns across many files:** Keep all five SAF-* items in one `safety-patterns.md`. Agents load one file, get all safety context. Splitting creates load overhead and risks partial loading.
- **Rewriting GSD references from scratch:** Adapt, don't rewrite. The GSD content is the proven base. Changes should be additive (trading context) and substitutive (naming), not structural.
- **Putting framework content in `skills/topstepx-api/`:** That directory is the v1.0 skill. Framework content goes in `topstepx/`. The installer will handle distribution.
- **Making PINESCRIPT.md and TOPSTEPX_API.md comprehensive textbooks:** These are agent reference materials, not tutorials. They need to be complete enough for code generation but concise enough to fit in context windows. Current sizes (24KB API, 14KB PineScript) are appropriate.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PineScript v6 documentation | Writing PineScript docs from scratch | Adapt the existing PINESCRIPT.md which already has v6 syntax, execution model, strategy/TA functions, and conversion mappings | Existing doc is comprehensive and verified |
| TopStepX API documentation | Re-documenting the API | Move existing TOPSTEPX_API.md (which consolidates rest-api.md, realtime.md, enums.md) | Already covers all endpoints, payloads, enums |
| GSD framework patterns | Inventing new framework patterns | Adapt GSD's 9 reference files directly | GSD patterns are production-proven |
| Safety pattern documentation | Custom safety framework | Document patterns as code blocks in safety-patterns.md following industry standards for trading bot safety | The patterns are well-known (bracket orders, token refresh, rate limiting) |

**Key insight:** Phase 1 is 90% content curation and 10% content authoring. Most of the source material already exists -- the work is relocating it, adapting naming, adding trading-specific safety content, and creating the trading questioning guide (the only truly new document).

## Common Pitfalls

### Pitfall 1: Inconsistent Enum Representation
**What goes wrong:** API documentation uses bare integers (0, 1, 2) for enums without named constants, leading to generated code with magic numbers.
**Why it happens:** The raw API uses integer enum values. If reference docs don't emphasize named constants, agents generate `side: 0` instead of `side: OrderSide.Bid`.
**How to avoid:** TOPSTEPX_API.md must include an explicit section stating "ALWAYS use named enum constants, NEVER bare integers" with a mapping table. The safety-patterns.md must reinforce this under SAF-01.
**Warning signs:** Any code example in reference docs using bare enum integers without accompanying constant names.

### Pitfall 2: Missing JWT Token Refresh Pattern
**What goes wrong:** Generated bots authenticate once and never refresh, causing silent failures after 24 hours.
**Why it happens:** The API docs mention 24-hour expiry but don't emphasize proactive refresh. The `POST /api/Auth/validate` endpoint is easy to overlook.
**How to avoid:** SAF-02 in safety-patterns.md must include a complete token refresh pattern with timer-based proactive refresh (not reactive on 401). TOPSTEPX_API.md must prominently note the 24-hour expiry window.
**Warning signs:** Authentication section that doesn't mention refresh frequency or proactive validation.

### Pitfall 3: PineScript Repainting Not Flagged During Conversion
**What goes wrong:** PineScript strategy that looks profitable in backtesting uses repainting indicators, producing a bot that trades on signals that wouldn't have existed in real-time.
**Why it happens:** PineScript's `request.security()` repaints by default. Many strategies use `close` on unconfirmed bars. The backtest looks good because it uses future data.
**How to avoid:** SAF-04 must include a concrete repainting audit checklist: (1) check for `request.security()` without `[1]` offset + `lookahead_on`, (2) check for conditions using `close`/`high`/`low` without `barstate.isconfirmed`, (3) check for `barstate.isrealtime` conditional logic. PINESCRIPT.md must have a dedicated "Repainting Detection" section.
**Warning signs:** Conversion mapping that doesn't mention `barstate.isconfirmed` or the `[1]` offset pattern for `request.security()`.

### Pitfall 4: Rate Limit Constants Buried in Prose
**What goes wrong:** Agents generate code that hammers the history endpoint because the rate limit (50/30s) is mentioned in passing but not emphasized.
**Why it happens:** Rate limits documented as one line in a large API reference get lost in context.
**How to avoid:** SAF-03 must present rate limits as a prominent, structured table with explicit sleep/backoff patterns. TOPSTEPX_API.md already has a good rate limit table at the top -- verify it stays prominent.
**Warning signs:** Rate limits mentioned only in endpoint descriptions, not in a standalone section.

### Pitfall 5: GSD Adaptation That Changes Architecture
**What goes wrong:** Adapted GSD references diverge from GSD's patterns, making future merges impossible and confusing agents that use both frameworks.
**Why it happens:** Author decides to "improve" GSD's patterns during adaptation instead of just specializing them for trading.
**How to avoid:** REF-04 adaptation rule: preserve structure, substitute naming (`gsd-*` to `tsx-*`), add trading examples, never remove or reorganize GSD sections. If GSD's verification-patterns.md has 6 sections, the tsx version has the same 6 sections (possibly with 1-2 trading-specific additions appended).
**Warning signs:** Adapted reference that has a different section structure than the GSD original.

### Pitfall 6: Questioning Guide Too Generic
**What goes wrong:** The trading questioning guide (REF-03) is just GSD's questioning.md with "trading" sprinkled in, failing to capture the domain-specific information that differentiates bot architectures.
**Why it happens:** GSD's questioning guide is generic by design. Simple find-and-replace adaptation misses trading-specific question categories.
**How to avoid:** REF-03 must have trading-specific question categories: instrument class (futures, specific contracts like ES/NQ/CL), strategy type (trend-following, mean-reversion, breakout, scalping), execution model (bar-close vs tick-based), risk tolerance (max position size, max daily loss, max drawdown), account type (evaluation vs funded vs live sim), data requirements (what timeframes, how much history).
**Warning signs:** Questioning guide that could work for any domain without modification.

## Code Examples

Since this is a content phase, "code examples" are example patterns that should appear IN the reference documents.

### Safety Pattern: JWT Token Refresh (for safety-patterns.md)
```javascript
// SAF-02: Proactive JWT Token Refresh
// Source: TOPSTEPX_API.md — POST /api/Auth/validate

class TokenManager {
  constructor(initialToken) {
    this.token = initialToken;
    this.refreshInterval = 23 * 60 * 60 * 1000; // Refresh 1 hour before 24hr expiry
    this.startRefreshTimer();
  }

  async refreshToken() {
    const response = await fetch('https://api.topstepx.com/api/Auth/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data.success && data.newToken) {
      this.token = data.newToken;
      this.startRefreshTimer();
    } else {
      // Re-authenticate from scratch
      throw new Error('Token refresh failed, re-authentication required');
    }
  }

  startRefreshTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.refreshToken(), this.refreshInterval);
  }
}
```

### Safety Pattern: Rate Limiter (for safety-patterns.md)
```javascript
// SAF-03: Rate Limit Compliance
// Source: TOPSTEPX_API.md — Rate Limits section

const RATE_LIMITS = {
  HISTORY: { requests: 50, windowMs: 30_000 },  // /api/History/retrieveBars
  GENERAL: { requests: 200, windowMs: 60_000 },  // All other endpoints
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
      const waitMs = this.limit.windowMs - (now - this.timestamps[0]);
      await new Promise(resolve => setTimeout(resolve, waitMs + 100));
    }
    this.timestamps.push(Date.now());
  }
}
```

### Safety Pattern: Enum Constants (for safety-patterns.md)
```javascript
// SAF-01: NEVER use bare integers for API enums
// Source: TOPSTEPX_API.md — Enum Definitions

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

// CORRECT:
const order = { side: OrderSide.Bid, type: OrderType.Market, size: 1 };

// WRONG - never do this:
// const order = { side: 0, type: 2, size: 1 };
```

### Safety Pattern: Repainting Audit Checklist (for safety-patterns.md)
```markdown
## SAF-04: PineScript Repainting Audit

Before converting any PineScript strategy, audit for these repainting patterns:

### Check 1: request.security() Without Offset
REPAINTS: `request.security(syminfo.tickerid, "D", close)`
SAFE:     `request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)`

The `[1]` offset and `lookahead_on` are INTERDEPENDENT. Neither can be removed.

### Check 2: Conditions on Unconfirmed Bars
REPAINTS: `if ta.crossover(close, ma)`
SAFE:     `if ta.crossover(close, ma) and barstate.isconfirmed`

### Check 3: Realtime-Only Logic
REPAINTS: `if barstate.isrealtime and <condition>`
SAFE:     Avoid barstate-conditional trading logic entirely

### Check 4: Fluid Values in Conditions
REPAINTS: `if high > threshold` (high changes intra-bar in realtime)
SAFE:     `if high[1] > threshold` (use confirmed bar's high)

### Default Policy
When in doubt, require `barstate.isconfirmed` for all entry/exit conditions.
Converted bots should use bar-close signals unless the user explicitly requests tick-based execution.
```

### Safety Pattern: Error Handling (for safety-patterns.md)
```javascript
// SAF-05: Error Handling for Common API Failures
// Source: TOPSTEPX_API.md

async function placeOrderSafe(orderParams) {
  try {
    const response = await fetch('https://api.topstepx.com/api/Order/place', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderParams)
    });

    if (response.status === 429) {
      // Rate limited — back off and retry
      console.warn('Rate limited, waiting 5 seconds...');
      await new Promise(r => setTimeout(r, 5000));
      return placeOrderSafe(orderParams); // Retry once
    }

    const data = await response.json();

    if (!data.success) {
      // Order rejected by system
      console.error(`Order rejected: ${data.errorMessage} (code: ${data.errorCode})`);
      // DO NOT retry rejected orders — investigate the cause
      return { success: false, error: data.errorMessage };
    }

    return { success: true, orderId: data.orderId };
  } catch (err) {
    // Connection failure
    console.error(`Connection error: ${err.message}`);
    return { success: false, error: err.message };
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PineScript v5 | PineScript v6 | 2024 | New `method` syntax, improved type system; v6 is current |
| `security()` function | `request.security()` | PineScript v5 | Old name deprecated, new name is standard |
| Manual reconnect for SignalR | `.withAutomaticReconnect()` | SignalR 2.x+ | Built-in reconnection with re-subscribe pattern |
| TopStepX at gateway.topstepx.com | TopStepX at api.topstepx.com | 2024-2025 | URL changed; existing TOPSTEPX_API.md uses the current URL |
| GSD single-platform | GSD multi-platform | 2025-2026 | GSD now installs to Claude Code, OpenCode, Codex CLI, Gemini CLI |

**Deprecated/outdated:**
- `security()` in PineScript: replaced by `request.security()` in v5+
- `gateway.topstepx.com`: Some third-party docs reference this; the canonical API URL is `api.topstepx.com` and WebSocket URL is `rtc.topstepx.com`
- GSD `skills/` structure for Codex: Codex uses `.agents/` not `.codex/` -- GSD's installer handles this

## Existing Content Inventory

Critical for planning: what already exists and what needs to be created.

### Exists and is Complete (move/integrate)
| File | Location | Size | Status |
|------|----------|------|--------|
| TOPSTEPX_API.md | Repo root | 24KB | Complete: REST, WebSocket, enums, payloads, rate limits |
| PINESCRIPT.md | Repo root | 14KB | Complete: v6 syntax, execution model, strategy/TA, conversion mappings |
| rest-api.md | skills/topstepx-api/references/ | 14KB | Complete: All REST endpoints with request/response |
| realtime.md | skills/topstepx-api/references/ | 14KB | Complete: SignalR connection, events, payloads |
| enums.md | skills/topstepx-api/references/ | 5KB | Complete: All enum types with descriptions |
| SKILL.md | skills/topstepx-api/ | 9KB | Complete: Skill frontmatter and API overview |

### Exists and Needs Adaptation (GSD references)
| GSD File | Size | Adaptation Needed |
|----------|------|-------------------|
| questioning.md | 5KB | Heavy: Add trading-specific question categories (instruments, strategy type, risk, account type) |
| checkpoints.md | 39KB | Light: Rename gsd-* to tsx-*, add trading checkpoint examples |
| git-integration.md | 7KB | Light: Rename gsd-* to tsx-*, trading commit examples |
| verification-patterns.md | 17KB | Medium: Add trading-specific verification patterns (order placement, WebSocket connection, enum usage) |
| model-profiles.md | 3KB | Light: Rename gsd-* to tsx-*, same model allocations |
| continuation-format.md | 4KB | Light: Rename gsd-* to tsx-*, trading command examples |
| tdd.md | 8KB | Light: Add trading-specific TDD examples (order logic, TA calculations) |
| ui-brand.md | 4KB | Light: Rename GSD to TSX branding |
| planning-config.md | 3KB | Light: Rename references, same config schema |

### Needs to be Created from Scratch
| File | Purpose | Estimated Size |
|------|---------|----------------|
| safety-patterns.md | SAF-01 through SAF-05 consolidated | 8-12KB |
| questioning.md (trading version) | REF-03: Trading-specific questioning guide | 6-8KB |
| Repainting detection section in PINESCRIPT.md | SAF-04 content integration | +2KB to existing |

## Verification Approach

For each deliverable, verify:

1. **File exists** at the correct path under `topstepx/references/`
2. **File is substantive** (not a stub): check minimum line count, required section headers present
3. **Required content present**: each requirement has specific content markers
   - REF-01: Has REST endpoints table, WebSocket events table, enum definitions table
   - REF-02: Has `barstate.isconfirmed` section, `request.security()` lookahead section, conversion mapping tables
   - REF-03: Has instrument, strategy-type, risk-tolerance, and account-type question categories
   - REF-04: Each adapted file has tsx-* naming throughout (grep for `gsd-` should return 0 results)
   - SAF-01: Has enum constant definitions for all 6 enums, "never bare integers" rule stated
   - SAF-02: Has JWT refresh code pattern with proactive timer
   - SAF-03: Has rate limit constants table (50/30s history, 200/60s general)
   - SAF-04: Has 4-point repainting checklist (request.security, barstate, realtime logic, fluid values)
   - SAF-05: Has error handling patterns for 429, rejected orders, connection drops

## Open Questions

1. **PINESCRIPT.md repainting section depth**
   - What we know: The existing PINESCRIPT.md has basic repainting awareness in the conversion checklist but no dedicated detection section
   - What's unclear: Should the repainting audit (SAF-04) live in safety-patterns.md only, or also be embedded in PINESCRIPT.md?
   - Recommendation: Put the full audit in safety-patterns.md and add a cross-reference section in PINESCRIPT.md that covers the key patterns. Avoid duplicating content.

2. **GSD reference adaptation granularity**
   - What we know: 9 GSD reference files need adaptation. Some are light (rename only), some need trading content.
   - What's unclear: Should all 9 be one plan, or split across multiple plans?
   - Recommendation: Split into 2 plans: (A) domain-specific references (API, PineScript, questioning, safety) and (B) GSD framework adaptation (the 9 reference files). This parallelizes well and separates trading-domain authoring from mechanical adaptation.

3. **Package.json `files` array for new `topstepx/` directory**
   - What we know: Current `files` field is `["bin/", "skills/"]`. New content goes in `topstepx/`.
   - What's unclear: Should `topstepx/` be added to `files` now or in Phase 10 (Installer)?
   - Recommendation: Add `topstepx/` to the `files` array in this phase to avoid forgetting. The installer (Phase 10) will add the copy logic, but npm needs to know to include the files.

4. **TopStepX API URL discrepancy**
   - What we know: Existing TOPSTEPX_API.md uses `api.topstepx.com`. Some external docs reference `gateway.topstepx.com`. Official ProjectX docs show platform-specific URLs (e.g., `api.thefuturesdesk.projectx.com`).
   - What's unclear: Whether the API URL varies by platform or if `api.topstepx.com` is the universal TopStepX endpoint.
   - Recommendation: Keep `api.topstepx.com` and `rtc.topstepx.com` as documented in TOPSTEPX_API.md. These are the TopStepX-specific endpoints that work. The ProjectX docs show other platform URLs but those are for other firms. Flag this as a note in the reference.

## Sources

### Primary (HIGH confidence)
- Existing TOPSTEPX_API.md in repo root - verified against official ProjectX Gateway API docs
- Existing PINESCRIPT.md in repo root - verified against TradingView Pine Script v6 docs
- GSD references at `~/.claude/get-shit-done/references/` - 9 files examined directly
- Existing skills/topstepx-api/references/ - 3 files examined directly
- [ProjectX Gateway Rate Limits](http://gateway.docs.projectx.com/docs/getting-started/rate-limits/) - confirmed 50/30s history, 200/60s general
- [TradingView Pine Script Repainting docs](https://www.tradingview.com/pine-script-docs/concepts/repainting/) - confirmed `[1]` offset + `lookahead_on` pattern, `barstate.isconfirmed` usage

### Secondary (MEDIUM confidence)
- [ProjectX Python SDK](https://project-x-py.readthedocs.io/en/latest/) - JWT refresh handled automatically, 24hr expiry implied but not explicitly documented with a number
- [TopStepX Help Center](https://help.topstep.com/en/articles/11187768-topstepx-api-access) - $29/month API access, no sandbox
- [GSD GitHub repo](https://github.com/gsd-build/get-shit-done) - framework structure confirmed

### Tertiary (LOW confidence)
- JWT 24-hour expiry: stated in existing TOPSTEPX_API.md ("Session tokens are valid for 24 hours") but not verified against an official ProjectX source that states this number explicitly. The Python SDK handles refresh automatically without documenting the TTL. Treat 24 hours as the working assumption but note it may need re-verification.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - This is a content phase, no stack decisions needed
- Architecture: HIGH - File structure and adaptation patterns directly observable from GSD source and existing repo
- Pitfalls: HIGH - Trading domain pitfalls (repainting, rate limits, JWT expiry, enum safety) verified against official docs
- Content inventory: HIGH - All source files read directly, sizes and contents verified
- GSD adaptation scope: HIGH - All 9 GSD reference files read and adaptation needs assessed

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable content, no rapidly changing dependencies)
