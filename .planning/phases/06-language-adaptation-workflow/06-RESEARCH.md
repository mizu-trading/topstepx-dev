# Phase 6: Language Adaptation Workflow - Research

**Researched:** 2026-03-12
**Domain:** Workflow authoring for cross-language TopStepX trading bot conversion
**Confidence:** HIGH

## Summary

Phase 6 creates a single new workflow file (`topstepx/workflows/adapt-language.md`) that enables AI agents to convert TopStepX trading bots between supported languages (currently JavaScript/TypeScript and Python). This is NOT a code library or runtime tool -- it is a markdown-based workflow document that orchestrates agent behavior through step-based instructions, following the exact patterns established in Phases 4-5.

The workflow's core challenge is maintaining trading safety invariants (SAF-01 through SAF-05) across language boundaries. The language-adaptation.md template (TPL-07, created in Phase 2) already defines the complete report structure -- the workflow produces this report as its primary output artifact. The bot-scaffold-js.md and bot-scaffold-python.md templates (TPL-05, created in Phase 2) provide the structural bases for target code. All safety verification patterns are documented in safety-patterns.md (Phase 1).

**Primary recommendation:** Build a single workflow file (~600-900 lines) that follows the new-project.md gold standard pattern: `<purpose>`, `<auto_mode>`, `<process>` with numbered `<step>` elements, `<output>`, `<success_criteria>`. Language profiles should be inline sections within the workflow (not separate files), and the safety verification step should use grep-able patterns from safety-patterns.md to gate completion.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Language profiles are defined INLINE within the workflow as structured sections (not separate reference files), matching the single-file workflow pattern used across TSX
- Each profile specifies: language name, runtime version, package manager, library mappings (SignalR client, HTTP client, indicator library, async model), naming conventions (camelCase vs snake_case), and bot scaffold template reference
- Initial profiles: JavaScript/TypeScript (Node.js) and Python -- the two languages with existing bot scaffolds (bot-scaffold-js.md, bot-scaffold-python.md)
- Adding a new language requires only adding a new profile section to the workflow -- no branching logic changes
- The workflow performs inline source analysis (not agent delegation) in its analysis step -- reads source files, identifies TopStepX API patterns, catalogs libraries, maps file structure
- Analysis output populates the language-adaptation.md template (already created in Phase 2) which becomes the adaptation plan
- Source analysis should detect: REST API calls (auth, orders, positions, contracts), WebSocket connections (SignalR hubs, event handlers, subscriptions), safety patterns (enums, brackets, rate limiting, JWT refresh, error handling), and strategy logic (indicators, entry/exit conditions)
- File-by-file conversion: each source file maps to a target file, with the adaptation report as the guide
- The workflow generates target code using the target language's bot scaffold template as the structural base, injecting source strategy logic translated to target idioms
- Order of conversion: safety infrastructure first (enums, auth, rate limiter), then API integration (REST, WebSocket), then strategy logic last -- mirrors the trading build order pattern established in prior phases
- Mandatory safety verification BEFORE the workflow marks conversion complete -- uses the Safety Preservation table from the language-adaptation.md template
- Every SAF-01 through SAF-05 pattern must be verified present in target code with grep-able patterns (enum constants, bracket order defaults, position sizing, JWT refresh timer, rate limiter, error handling, graceful shutdown)
- Safety confidence MUST be HIGH -- if any safety pattern is missing, the conversion is incomplete and the workflow blocks
- Follow the established TSX workflow pattern: step-based with numbered steps, auto-mode support, AskUserQuestion for interactive decisions, agent spawning for research
- Approximate step flow: (1) Setup/init, (2) Source analysis, (3) Language profile selection, (4) Library mapping confirmation, (5) Adaptation report generation, (6) Code generation, (7) Safety verification, (8) Completion summary
- Auto-mode: skip interactive confirmations, auto-select target language from arguments, auto-generate adaptation report and code
- The workflow references but does NOT duplicate content from: safety-patterns.md, bot-scaffold-js.md, bot-scaffold-python.md, language-adaptation.md template

### Claude's Discretion
- Exact step numbering and substep organization within the workflow
- Whether to use tsx-researcher agent for library lookup or inline Context7 queries
- How to handle partial conversions (some files converted, others pending)
- Error recovery strategy when source code uses patterns not in the language profile

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WKF-07 | `adapt-language` workflow -- Any-to-any language conversion for TopStepX code | Full workflow structure pattern from new-project.md gold standard; language-adaptation.md template for report output; bot-scaffold-js.md and bot-scaffold-python.md for target code bases; safety-patterns.md for verification grep patterns; inline language profiles for extensible mapping |
</phase_requirements>

## Standard Stack

### Core
| Asset | Location | Purpose | Why Standard |
|-------|----------|---------|--------------|
| new-project.md | topstepx/workflows/new-project.md | Gold standard workflow pattern (1,307 lines) | Defines canonical TSX workflow structure: `<purpose>`, `<auto_mode>`, `<process>`, `<step>`, `<output>`, `<success_criteria>` |
| language-adaptation.md | topstepx/templates/language-adaptation.md | Report template the workflow populates | Already created in Phase 2 (TPL-07); defines source analysis, library mapping, API pattern mapping, safety preservation, test plan |
| bot-scaffold-js.md | topstepx/templates/bot-scaffold-js.md | JavaScript/TypeScript bot structural base | Complete 540-line scaffold with SAF-01 through SAF-05 built in |
| bot-scaffold-python.md | topstepx/templates/bot-scaffold-python.md | Python bot structural base | Complete 522-line scaffold with SAF-01 through SAF-05 built in |
| safety-patterns.md | topstepx/references/safety-patterns.md | Safety verification reference with grep patterns | Defines all 5 SAF patterns with code examples in both JS and Python |
| tsx-tools.cjs | topstepx/bin/tsx-tools.cjs | CLI for init, commit, state management | Used by all workflows for setup/teardown; provides `init` JSON for phase context |

### Supporting
| Asset | Location | Purpose | When to Use |
|-------|----------|---------|-------------|
| TOPSTEPX_API.md | topstepx/references/TOPSTEPX_API.md | API endpoint reference | During source analysis to identify API patterns (REST endpoints, WebSocket hubs) |
| PINESCRIPT.md | topstepx/references/PINESCRIPT.md | PineScript conversion mappings | NOT used in this workflow -- PineScript conversion is Phase 7 (WKF-08) |
| verify-work.md | topstepx/workflows/verify-work.md | UAT workflow pattern | Reference for how safety verification pre-check step works (added in Phase 4) |

### Not Needed
| Asset | Why Not |
|-------|---------|
| PINESCRIPT.md | PineScript is Phase 7's adapt-pinescript workflow -- explicitly out of scope |
| Any GSD source files | Phase 6 creates a net-new TSX-specific workflow, not a GSD adaptation |
| External npm packages | This is a static markdown workflow file, not executable code |

## Architecture Patterns

### Workflow File Structure (from gold standard)
```
topstepx/workflows/adapt-language.md
```

Single file containing all workflow logic, following this established XML tag structure:

```markdown
<purpose>
[What this workflow does]
</purpose>

<auto_mode>
[Auto-mode detection and behavior]
</auto_mode>

<process>

## 1. Setup
[tsx-tools.cjs init, parse JSON, guard checks]

## 2. Source Analysis
[Read source files, identify patterns]

## 3. Language Profile Selection
[Detect source language, select target]

## 4. Library Mapping Confirmation
[Show mapping table, let user confirm/adjust]

## 5. Adaptation Report Generation
[Populate language-adaptation.md template]

## 6. Code Generation
[File-by-file conversion: safety first, then API, then strategy]

## 7. Safety Verification
[Grep-based SAF-01 through SAF-05 check -- MUST pass]

## 8. Completion Summary
[Display results, route to next action]

</process>

<output>
[List of generated files]
</output>

<success_criteria>
[Checkbox list of verification items]
</success_criteria>
```

### Pattern 1: Language Profiles (Inline)
**What:** Structured data sections within the workflow that define language-specific mappings
**When to use:** In Steps 3, 4, and 6 when the workflow needs language-specific information
**Example:**

```markdown
<language_profiles>

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
| Signal Handler | `process.on('SIGINT', handler)` |
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
| Signal Handler | `loop.add_signal_handler(sig, handler)` |
| Bot Scaffold | `@topstepx/templates/bot-scaffold-python.md` |

</language_profiles>
```

### Pattern 2: Source Analysis Checklist (Inline)
**What:** The categories the workflow scans for during source code analysis
**When to use:** Step 2, when reading source files
**Example:**

```markdown
### Source Analysis Categories

1. **API Authentication:** Login calls, token storage, bearer header usage, refresh timer
2. **REST Endpoints:** Order placement, account search, contract lookup, position queries, history bars
3. **WebSocket Connections:** Market Hub and User Hub creation, event handlers (GatewayQuote, GatewayOrder, GatewayPosition), subscriptions, reconnection handlers
4. **Safety Infrastructure:** Enum constant definitions, bracket order defaults in createOrder/create_order, position sizing via Math.min/min(), TokenManager/token refresh, RateLimiter/rate limiter, placeOrderSafe/place_order_safe error handling, graceful shutdown handlers
5. **Strategy Logic:** Indicator imports/calculations, signal evaluation functions, entry/exit conditions, bar processing
6. **Configuration:** Environment variables, risk parameters, contract/account IDs
```

### Pattern 3: Safety Verification Gate (Grep-based)
**What:** Automated verification that all SAF patterns survived conversion, using grep-able patterns
**When to use:** Step 7, mandatory before workflow completion
**Example:**

```markdown
### Safety Verification Commands

For JavaScript target:
- SAF-01 enums: `grep -n "OrderSide\|OrderType\|OrderStatus\|PositionType\|TimeInForce" [target_file]`
- SAF-01 brackets: `grep -n "stopLossBracket\|takeProfitBracket" [target_file]`
- SAF-01 position sizing: `grep -n "Math.min" [target_file]`
- SAF-02 JWT refresh: `grep -n "refreshToken\|refreshInterval\|23.*60.*60" [target_file]`
- SAF-03 rate limiter: `grep -n "RateLimiter\|RATE_LIMITS\|waitForSlot" [target_file]`
- SAF-05 error handling: `grep -n "placeOrderSafe\|status === 429\|\.catch\|try.*catch" [target_file]`
- SAF-05 graceful shutdown: `grep -n "SIGINT\|SIGTERM\|shutdown" [target_file]`

For Python target:
- SAF-01 enums: `grep -n "OrderSide\|OrderType\|OrderStatus\|PositionType\|TimeInForce\|IntEnum" [target_file]`
- SAF-01 brackets: `grep -n "stopLossBracket\|takeProfitBracket\|stop_loss\|take_profit" [target_file]`
- SAF-01 position sizing: `grep -n "min(" [target_file]`
- SAF-02 JWT refresh: `grep -n "refresh_token\|refresh_interval\|23.*60.*60" [target_file]`
- SAF-03 rate limiter: `grep -n "RateLimiter\|RATE_LIMITS\|wait_for_slot" [target_file]`
- SAF-05 error handling: `grep -n "place_order_safe\|status == 429\|except\|try:" [target_file]`
- SAF-05 graceful shutdown: `grep -n "SIGINT\|SIGTERM\|shutdown\|signal\." [target_file]`
```

### Pattern 4: Conversion Order (Trading Build Order)
**What:** File-by-file conversion follows the established trading build order
**When to use:** Step 6, when generating target code
**Sequence:**
1. Safety infrastructure first (enums, constants, config)
2. Authentication (TokenManager, login flow)
3. Rate limiting (RateLimiter, RATE_LIMITS constants)
4. REST API integration (order placement, account search, history)
5. WebSocket integration (Market Hub, User Hub, event handlers, reconnection)
6. Strategy logic last (indicators, signals, entry/exit conditions)

This mirrors the proven build order from Phase 1 references and Phase 5's new-project workflow.

### Anti-Patterns to Avoid
- **Hardcoded language pairs:** Never write "if source is JS and target is Python then..." -- always go through language profiles so adding a third language doesn't require branching
- **Duplicating safety pattern content:** The workflow should REFERENCE safety-patterns.md, not copy its code examples inline -- keeps the single source of truth
- **Duplicating template content:** The workflow produces the language-adaptation.md template report -- it should reference the template path, not embed its structure
- **Skipping safety verification:** The workflow MUST block on failed safety checks -- no "proceed anyway" option
- **Agent delegation for source analysis:** Per CONTEXT.md locked decision, source analysis is inline (workflow reads files directly), not delegated to an agent

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Report format | Custom report structure | `@topstepx/templates/language-adaptation.md` | Template already defines complete report with source analysis, library mapping, safety preservation table |
| Target code structure | Custom bot skeleton | `@topstepx/templates/bot-scaffold-js.md` or `bot-scaffold-python.md` | Scaffolds already have all SAF-01 through SAF-05 patterns implemented |
| Safety pattern definitions | Inline safety rules | `@topstepx/references/safety-patterns.md` | Single source of truth for all 5 safety patterns with grep commands |
| Library mapping research | Web searches for equivalents | Inline language profile tables | Locked decision: profiles contain the canonical mappings |
| Workflow orchestration | Custom step management | Established `<process>` + `<step>` + tsx-tools.cjs pattern | Every TSX workflow uses this exact structure |

**Key insight:** Phase 2 already created the template and scaffolds, Phase 1 already created the safety reference -- this workflow is the orchestration glue that CONNECTS those existing assets, not a place to recreate them.

## Common Pitfalls

### Pitfall 1: Safety Pattern Loss During Conversion
**What goes wrong:** A safety pattern exists in source but gets lost or weakened in target (e.g., bracket orders omitted, enum constants replaced with bare integers, rate limiter simplified)
**Why it happens:** Strategy logic is the "interesting" part; safety infrastructure feels boilerplate and gets copied carelessly
**How to avoid:** Conversion order puts safety FIRST, and the mandatory grep-based verification gate in Step 7 catches any missing patterns before completion
**Warning signs:** Safety verification grep returns fewer matches in target than source

### Pitfall 2: Language Profile Scope Creep
**What goes wrong:** Profiles try to capture too many language-specific nuances, becoming maintenance burdens
**Why it happens:** Temptation to handle every edge case (e.g., Windows signal handling differences, Python GIL implications)
**How to avoid:** Profiles capture only what's needed for the MAPPING -- runtime, package manager, library names, naming conventions, scaffold reference. Language-specific implementation details live in the bot scaffolds, not the profiles.
**Warning signs:** Profile tables exceeding ~15 rows, entries that describe "how" rather than "what"

### Pitfall 3: Trying to Support Arbitrary Source Languages
**What goes wrong:** Source analysis becomes fragile when encountering unexpected code patterns (e.g., TypeScript decorators, Python metaclasses, non-standard project structures)
**Why it happens:** Assuming source code will perfectly match bot scaffold patterns
**How to avoid:** Source analysis looks for TopStepX API PATTERNS (URL patterns, function names, SignalR hub names), not language-specific AST parsing. The workflow should handle unexpected patterns gracefully by flagging them for manual review.
**Warning signs:** Source analysis step trying to parse import statements syntactically rather than pattern-matching

### Pitfall 4: Auto-Mode Assumptions
**What goes wrong:** Auto-mode conversion proceeds without enough context (e.g., target language not specified, source directory ambiguous)
**Why it happens:** Auto-mode is designed to skip interactive questions, but some information is mandatory
**How to avoid:** Auto-mode REQUIRES: source path and target language as arguments. Error clearly if not provided. Auto-mode skips OPTIONAL confirmations (library mapping review, adaptation report review) but never skips MANDATORY inputs.
**Warning signs:** Auto-mode path has no argument validation

### Pitfall 5: Workflow File Becoming Too Long
**What goes wrong:** Workflow exceeds 1000+ lines and becomes hard to maintain, especially with inline language profiles and code examples
**Why it happens:** Tension between "single file" constraint and comprehensive coverage
**How to avoid:** Keep language profiles as structured tables (not prose), reference external assets instead of duplicating them, and use concise step descriptions. Target 600-900 lines (new-project.md is 1,307 but includes deep questioning logic; adapt-language has no questioning phase).
**Warning signs:** Copy-pasting code from bot scaffolds or safety-patterns.md into the workflow

## Code Examples

### Example 1: Workflow Init Step Pattern (from established workflows)
```markdown
## 1. Setup

**MANDATORY FIRST STEP -- Execute these checks before ANY user interaction:**

\```bash
INIT=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" init adapt-language "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
\```

Parse JSON for: `commit_docs`, `project_exists`, `has_git`.

**If `project_exists` is false:** Error -- no project initialized. Use `/tsx:new-project`.

**Parse arguments:**
- Source path (required): directory or file to convert
- Target language (required in auto-mode, prompted in interactive)
- `--auto` flag: skip interactive confirmations
```
Source: Derived from topstepx/workflows/new-project.md Step 1 pattern

### Example 2: AskUserQuestion Pattern (from established workflows)
```markdown
Use AskUserQuestion:
- header: "Target"
- question: "Which language should the bot be converted to?"
- options:
  - "JavaScript/TypeScript (Node.js)" -- Uses @microsoft/signalr, fetch, trading-signals
  - "Python" -- Uses pysignalr, aiohttp, pandas-ta
```
Source: Derived from topstepx/workflows/new-project.md and discuss-phase.md interaction patterns

### Example 3: Library Mapping Table (from language-adaptation.md template)
```markdown
| Source Library | Target Library | Purpose | Mapping Notes |
|----------------|----------------|---------|---------------|
| `@microsoft/signalr` | `pysignalr` | SignalR WebSocket client | HubConnectionBuilder vs SignalRClient |
| built-in `fetch` | `aiohttp` | HTTP REST client | Session management differs |
| `trading-signals` | `pandas-ta` | Technical indicators | API surface differs significantly |
| `setTimeout`/`setInterval` | `asyncio.sleep`/`asyncio.ensure_future` | Timers | Event loop model differs |
| `process.env` | `os.environ` | Env vars | Direct equivalent |
| `Math.min(size, max)` | `min(size, max)` | Position sizing | Direct equivalent |
```
Source: topstepx/templates/language-adaptation.md

### Example 4: Safety Verification Step Pattern
```markdown
## 7. Safety Verification

**MANDATORY -- conversion is BLOCKED until all checks pass.**

Run grep verification for each SAF pattern in the target language profile:

| Safety Pattern | Grep Command | Expected Matches | Result |
|----------------|-------------|------------------|--------|
| SAF-01: Enums | `grep -c "OrderSide\|OrderType" [target]` | >= 2 | [PASS/FAIL] |
| SAF-01: Brackets | `grep -c "stopLoss.*Bracket\|take_profit" [target]` | >= 1 | [PASS/FAIL] |
| SAF-02: JWT refresh | `grep -c "refresh.*token\|23.*60.*60" [target]` | >= 1 | [PASS/FAIL] |
| SAF-03: Rate limiter | `grep -c "RateLimiter\|RATE_LIMITS" [target]` | >= 1 | [PASS/FAIL] |
| SAF-05: Error handling | `grep -c "429\|place.*order.*safe\|try" [target]` | >= 2 | [PASS/FAIL] |
| SAF-05: Shutdown | `grep -c "SIGINT\|SIGTERM\|shutdown" [target]` | >= 1 | [PASS/FAIL] |

**If ANY check FAILS:**
- Display the missing pattern with its SAF-ID
- Show what the pattern looks like in the target language (from safety-patterns.md)
- DO NOT proceed to Step 8
- Loop back to Step 6 to fix the gap

**If ALL checks PASS:**
- Safety confidence: HIGH
- Proceed to Step 8
```
Source: Derived from topstepx/references/safety-patterns.md grep patterns and topstepx/workflows/verify-work.md pre-check pattern

### Example 5: Completion/Routing Pattern (from established workflows)
```markdown
## 8. Completion

Present completion summary:

\```
--------------------------------------------------
 TSX > LANGUAGE ADAPTATION COMPLETE
--------------------------------------------------

**Source:** [source language] -> **Target:** [target language]

| Artifact | Location |
|----------|----------|
| Adaptation Report | `.planning/language-adaptation.md` |
| Target Code | [target file paths] |

**Safety Verification:** ALL PASSED (SAF-01 through SAF-05)
**Files Converted:** [N] source files -> [N] target files

--------------------------------------------------

## Next Steps

/tsx:verify-work [phase] -- test the converted bot
/tsx:progress -- check project status

--------------------------------------------------
\```
```
Source: Derived from topstepx/workflows/new-project.md Step 9 pattern

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded language pairs (if/else chains) | Profile-based extensible mapping | This phase (design decision) | Adding C#, Rust, or Go support needs only a new profile section |
| Agent-delegated analysis | Inline source analysis | This phase (locked decision) | Simpler workflow, fewer agent spawns, faster execution |
| Post-conversion safety audit (manual) | Mandatory grep-based safety gate | This phase (locked decision) | Safety verification is automated and non-skippable |

**Existing assets this workflow connects:**
- language-adaptation.md template (Phase 2, TPL-07) -- already complete
- bot-scaffold-js.md (Phase 2, TPL-05) -- already complete, 540 lines
- bot-scaffold-python.md (Phase 2, TPL-05) -- already complete, 522 lines
- safety-patterns.md (Phase 1, SAF-01 through SAF-05) -- already complete, 481 lines

## Open Questions

1. **tsx-tools.cjs init support for adapt-language**
   - What we know: All existing workflows use `tsx-tools.cjs init [workflow-name]` for setup
   - What's unclear: Whether tsx-tools.cjs already handles the `adapt-language` workflow name or needs a code change
   - Recommendation: The workflow should call `tsx-tools.cjs init adapt-language` -- if tsx-tools doesn't recognize it, it will still return basic project context (commit_docs, project_exists, has_git). No code change needed for tsx-tools.cjs; the workflow can parse what it gets.

2. **Partial conversion recovery**
   - What we know: Source analysis and report generation are idempotent; code generation is file-by-file
   - What's unclear: If conversion fails mid-file-set, how does the user resume?
   - Recommendation: (Claude's discretion per CONTEXT.md) Write each target file atomically and commit after each. If conversion fails, the adaptation report shows which files are done. User re-runs the workflow -- it detects existing target files and offers to resume or restart.

3. **Unknown library patterns in source**
   - What we know: Language profiles cover the "standard" TSX libraries (signalr, fetch/aiohttp, trading-signals/pandas-ta)
   - What's unclear: What if the source uses a non-standard library (e.g., axios instead of fetch, ccxt for orders)?
   - Recommendation: (Claude's discretion per CONTEXT.md) Source analysis flags unrecognized libraries. The workflow presents them to the user with a suggestion to map manually or spawn tsx-researcher for lookup. Auto-mode logs a warning and attempts best-effort mapping.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (markdown workflow, no executable code) |
| Config file | none |
| Quick run command | `grep -c "SAF-01\|SAF-02\|SAF-03\|SAF-04\|SAF-05" topstepx/workflows/adapt-language.md` |
| Full suite command | Manual review of workflow structure against gold standard pattern |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WKF-07-a | Workflow analyzes source code to identify API patterns, dependencies, trading logic | manual-only | Verify Step 2 contains source analysis categories: REST, WebSocket, safety, strategy, config | N/A (new file) |
| WKF-07-b | Workflow maps libraries to idiomatic target equivalents | manual-only | Verify language profiles contain library mapping rows and Step 4 shows mapping table | N/A (new file) |
| WKF-07-c | Workflow generates target code preserving trading logic and safety | manual-only | Verify Step 6 references bot scaffold templates and Step 7 has grep-based safety gate | N/A (new file) |
| WKF-07-d | Workflow uses language profiles (not hardcoded pairs) for extensibility | manual-only | `grep -c "language_profiles\|<language_profiles>" topstepx/workflows/adapt-language.md` should return >= 1 | N/A (new file) |

**Justification for manual-only:** This phase creates a markdown workflow document, not executable code. The "tests" are structural verification that the document contains the required sections, patterns, and safety gates. There is no runtime to execute.

### Sampling Rate
- **Per task commit:** Visual inspection that workflow follows XML tag structure pattern
- **Per wave merge:** Verify safety verification step includes all 5 SAF patterns
- **Phase gate:** Full review against success criteria checklist

### Wave 0 Gaps
None -- no test infrastructure needed for a markdown workflow document. Verification is structural review.

## Sources

### Primary (HIGH confidence)
- `topstepx/workflows/new-project.md` (1,307 lines) -- Gold standard workflow pattern with `<purpose>`, `<auto_mode>`, `<process>`, numbered steps, `<output>`, `<success_criteria>`
- `topstepx/templates/language-adaptation.md` (244 lines) -- Complete report template defining source analysis, library mapping, API pattern mapping, safety preservation, test plan
- `topstepx/templates/bot-scaffold-js.md` (578 lines) -- Complete JavaScript bot scaffold with SAF-01 through SAF-05
- `topstepx/templates/bot-scaffold-python.md` (559 lines) -- Complete Python bot scaffold with SAF-01 through SAF-05
- `topstepx/references/safety-patterns.md` (481 lines) -- All 5 SAF patterns with grep-able verification commands
- `.planning/phases/06-language-adaptation-workflow/06-CONTEXT.md` -- Locked decisions from user discussion

### Secondary (MEDIUM confidence)
- `topstepx/workflows/verify-work.md` -- Reference for pre-check verification step pattern
- `topstepx/workflows/discuss-phase.md` -- Reference for AskUserQuestion interaction patterns
- `topstepx/references/PINESCRIPT.md` -- Confirmed library mapping table (trading-signals vs pandas-ta)

### Tertiary (LOW confidence)
- None -- all findings are based on existing project assets (PRIMARY sources)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All referenced assets exist and have been read; patterns are established in Phases 1-5
- Architecture: HIGH -- Workflow XML structure is proven across 34 existing workflow files; language profile design is a locked user decision
- Pitfalls: HIGH -- Safety pattern preservation is well-documented in existing references; workflow length concerns are grounded in actual file sizes

**Research date:** 2026-03-12
**Valid until:** Indefinite (all sources are project-internal assets, not external libraries with version drift)
