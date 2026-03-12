# Phase 5: From-Scratch Workflow - Research

**Researched:** 2026-03-12
**Domain:** Trading-specific project initialization workflow (new-project.md deep adaptation)
**Confidence:** HIGH

## Summary

Phase 5 transforms the existing `new-project.md` workflow from a naming-only GSD adaptation into a trading-specific project initialization experience. The current file (1,100+ lines) is a mechanical copy of GSD's new-project workflow with `/gsd:` replaced by `/tsx:` -- it contains zero trading domain content. The goal is to inject deep trading-specific questioning, risk parameter capture, trading-aware requirements generation, and trading-aware roadmapping into this workflow.

The key insight is that this is NOT a from-scratch creation. The workflow structure (setup, brownfield detection, questioning, PROJECT.md, config, research, requirements, roadmap, completion) already exists and works. The work is injecting trading domain knowledge into specific sections of an existing 1,100-line file while preserving the overall orchestration structure. The trading content already exists in other framework files (questioning.md, strategy-spec.md, risk-parameters.md, safety-patterns.md) -- the workflow just needs to reference and apply them.

**Primary recommendation:** Modify the existing new-project.md workflow in-place, injecting trading-specific content into Steps 3 (questioning), 4 (PROJECT.md), 6 (research), 7 (requirements), and 9 (completion). Preserve the overall GSD orchestration structure, auto-mode behavior, and config handling unchanged.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WKF-01 | `new-project` workflow -- Trading-specific questioning, risk parameter gathering | All findings below directly enable this: questioning.md integration, trading question injection, risk parameter embedding, trading-aware requirements categories, and seamless plan-phase routing |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| questioning.md | Phase 1 | Trading-specific questioning guide | Already built in Phase 1 (REF-03), provides 5 question categories and anti-patterns |
| strategy-spec.md | Phase 2 | Strategy specification template | Already built in Phase 2 (TPL-02), structures user's trading idea |
| risk-parameters.md | Phase 2 | Risk parameter capture template | Already built in Phase 2 (TPL-04), mandatory risk guardrails |
| api-integration-plan.md | Phase 2 | API integration planning template | Already built in Phase 2 (TPL-03), maps strategy to API usage |
| safety-patterns.md | Phase 1 | Safety pattern reference | Already built in Phase 1 (SAF-01 through SAF-05), non-negotiable defaults |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| bot-scaffold-js.md | Phase 2 | JS/TS bot scaffold template | Referenced during requirements to inform what the bot will look like |
| bot-scaffold-python.md | Phase 2 | Python bot scaffold template | Referenced during requirements for Python projects |
| project.md template | Phase 2 | PROJECT.md template | Adapted output format for trading projects |
| requirements.md template | Phase 2 | Requirements template | Adapted output format with trading categories |
| roadmap.md template | Phase 2 | Roadmap template | Used by tsx-roadmapper for phase structure |

### No New Libraries Needed
All content referenced by this phase already exists in the framework. No new templates, references, or agents need to be created. This phase is purely about modifying the workflow orchestration file.

## Architecture Patterns

### What Already Exists vs What Needs to Change

The current `new-project.md` is a 1,100+ line GSD workflow with naming-only adaptation (Phase 4). Here is the modification map:

```
new-project.md (current structure)
|
|-- Step 1: Setup                    -- NO CHANGE (init, git)
|-- Step 2: Brownfield Offer         -- NO CHANGE (codebase detection)
|-- Step 2a: Auto Mode Config        -- MINOR (trading-aware defaults)
|-- Step 3: Deep Questioning         -- MAJOR CHANGE (trading domain injection)
|-- Step 4: Write PROJECT.md         -- MODERATE CHANGE (trading content structure)
|-- Step 5: Workflow Preferences     -- NO CHANGE (config collection)
|-- Step 5.5: Resolve Model Profile  -- NO CHANGE
|-- Step 6: Research Decision        -- MODERATE CHANGE (trading domain research)
|-- Step 7: Define Requirements      -- MAJOR CHANGE (trading requirement categories)
|-- Step 8: Create Roadmap           -- MINOR CHANGE (trading build order context)
|-- Step 9: Done                     -- MODERATE CHANGE (trading-specific output)
```

### Pattern 1: Trading Question Injection (Step 3)
**What:** Replace the generic "follow the thread" questioning with trading-domain questioning that references `questioning.md` categories
**When to use:** Always -- this is the core value of Phase 5

The current Step 3 says:
```
Ask inline (freeform, NOT AskUserQuestion):
"What do you want to build?"
```

It needs to become trading-aware:
```
Ask inline (freeform, NOT AskUserQuestion):
"Tell me about your trading idea -- what do you want to trade and how?"
```

And the follow-up questioning must use the 5 categories from `questioning.md`:
1. Instrument and Market
2. Strategy Type
3. Execution Model
4. Risk Tolerance
5. Account and Environment

**Key constraint:** The questioning.md reference already exists and is loaded via `<required_reading>`. The workflow just needs to explicitly reference it and use its categories as the questioning framework instead of generic "follow the thread" guidance.

### Pattern 2: Strategy Spec Generation (Step 4)
**What:** After questioning, produce a strategy-spec.md alongside PROJECT.md
**When to use:** For all trading projects (this is the "meaningfully differentiate bot architectures" success criterion)

The workflow should generate:
1. `.planning/PROJECT.md` (using project.md template with trading context)
2. `.planning/strategy-spec.md` (using strategy-spec.md template from user answers)
3. `.planning/risk-parameters.md` (using risk-parameters.md template from user answers)

These three files capture the complete trading project definition before any code generation.

### Pattern 3: Trading Requirement Categories (Step 7)
**What:** Replace generic feature categories with trading-specific ones
**When to use:** Always for trading projects

Instead of generic categories (Authentication, Content, Social), use trading categories:
- **API Integration (API-*):** Authentication, account search, contract lookup, order placement, position management
- **Strategy Logic (STR-*):** Indicator calculation, signal generation, entry/exit rules, bar management
- **Risk Management (RSK-*):** Position sizing, daily loss limits, kill switch, bracket orders
- **Real-time Data (RTD-*):** WebSocket connection, quote streaming, order events, position events
- **Safety Infrastructure (SAF-*):** Enum constants, JWT refresh, rate limiting, error handling
- **Bot Lifecycle (BOT-*):** Startup sequence, shutdown sequence, logging, deployment

### Pattern 4: Risk Parameters as Non-Optional (Steps 3+4)
**What:** Risk parameters must be captured during questioning and embedded in requirements BEFORE any code generation
**When to use:** Always -- this is success criterion #3

If the user doesn't specify risk parameters, the workflow applies conservative defaults from safety-patterns.md and states them explicitly:
- Max position size: 1 contract
- Max daily loss: platform limit minus 20% buffer
- Bracket orders: always required
- Kill switch: max daily loss hit, consecutive losses, connection drop

### Pattern 5: Seamless Routing to plan-phase (Step 9)
**What:** After project initialization, route directly into `/tsx:plan-phase 1`
**When to use:** Always -- this is success criterion #4

The current Step 9 already suggests `/tsx:discuss-phase 1` or `/tsx:plan-phase 1` as next steps. The auto-mode already chains to `/tsx:discuss-phase 1 --auto`. This just needs to be verified and potentially enhanced with trading-specific phase 1 context.

### Anti-Patterns to Avoid
- **Rewriting the entire workflow:** The GSD orchestration structure works. Only inject trading content into the sections that need it. Do NOT restructure Steps 1-9.
- **Duplicating questioning.md content:** Reference it, don't copy it. The workflow should say "Consult questioning.md" not reproduce its full content inline.
- **Making risk parameters optional:** They are non-negotiable. Apply defaults if user doesn't specify.
- **Adding new Steps:** Keep the same 9-step structure. Add trading content within existing steps, not as new steps.
- **Removing auto-mode support:** Auto-mode with `--auto @prd.md` must still work for trading project documents.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Strategy specification | Custom format in PROJECT.md | strategy-spec.md template (TPL-02) | Already structured for downstream agents |
| Risk parameter capture | Inline risk questions | risk-parameters.md template (TPL-04) | Covers all TopStepX account types, has defaults |
| Safety defaults | Hardcoded values | safety-patterns.md reference (SAF-01--05) | Single source of truth for safety constants |
| Trading questioning | New question list | questioning.md reference (REF-03) | Already built with 5 categories, anti-patterns, AskUserQuestion examples |
| Roadmap generation | Custom phase structure | tsx-roadmapper agent (AGT-08) | Already trading-aware with build order patterns |
| Project research | Custom trading research | tsx-project-researcher agents | Already spawned in parallel by Step 6 |

**Key insight:** Every piece of trading domain content this workflow needs already exists in the framework. Phase 5's job is wiring existing content into the workflow orchestration, not creating new content.

## Common Pitfalls

### Pitfall 1: Over-Engineering the Questioning
**What goes wrong:** Adding 20+ mandatory questions that make the workflow feel like a bureaucratic form
**Why it happens:** Trying to capture every possible trading parameter upfront
**How to avoid:** Follow questioning.md's philosophy: "You are a thinking partner, not an interviewer." Use the 5 categories as a background checklist, not a sequential form. Let the user's initial description drive which threads to follow.
**Warning signs:** Step 3 becomes a numbered list of 15+ AskUserQuestion calls

### Pitfall 2: Missing the Auto-Mode Path
**What goes wrong:** Trading injection only works in interactive mode; auto-mode with `--auto @prd.md` produces generic output
**Why it happens:** Forgetting that auto-mode skips Steps 3 and 5, extracting context from a provided document instead
**How to avoid:** Auto-mode document parsing must extract trading-specific fields (instrument, strategy type, risk params) from the provided document. If the document mentions trading concepts, produce strategy-spec.md and risk-parameters.md from it.
**Warning signs:** Auto-mode produces a PROJECT.md with no trading content

### Pitfall 3: Risk Parameters as Afterthought
**What goes wrong:** Risk parameters are asked about in Step 7 (requirements) instead of Step 3 (questioning)
**Why it happens:** Treating risk as a "requirement" rather than a fundamental project constraint
**How to avoid:** Risk parameters must be captured during questioning (Step 3) and embedded in both the strategy-spec.md and PROJECT.md (Step 4). By the time requirements are generated (Step 7), risk params are already decided.
**Warning signs:** risk-parameters.md is generated in Step 7 instead of Step 4

### Pitfall 4: Generic Research Prompts
**What goes wrong:** Step 6 research agents get generic prompts that produce non-trading research
**Why it happens:** Not customizing the 4 parallel researcher prompts for trading domain
**How to avoid:** The research prompts already accept `[domain]` placeholders. For trading projects, these should be filled with specific trading context: "What's the standard 2025 stack for [ES futures trading bot with EMA crossover strategy]?" not "What's the standard 2025 stack for [trading bot]?"
**Warning signs:** Research STACK.md recommends React and PostgreSQL for a trading bot

### Pitfall 5: Forgetting PineScript Conversion Entry Point
**What goes wrong:** User mentions "I have a PineScript strategy" during questioning, but the workflow doesn't route to `/tsx:adapt-pinescript` or capture PineScript-specific context
**Why it happens:** Treating all projects as "from scratch" when some are conversions
**How to avoid:** During questioning (Step 3), if user mentions PineScript, the workflow should either (a) capture the PineScript code and include it in the strategy spec with repainting audit notes, or (b) suggest routing to `/tsx:adapt-pinescript` instead. This is a routing decision, not a full implementation -- Phase 7 handles PineScript conversion.
**Warning signs:** User pastes PineScript code and the workflow ignores it

## Code Examples

### Example: Trading-Specific Opening Question (Step 3)
```markdown
**Open the conversation:**

Ask inline (freeform, NOT AskUserQuestion):

"Tell me about your trading idea. What do you want to trade and what's your approach?"

Wait for their response. This gives you the context needed to ask intelligent follow-up questions using trading-specific probes from questioning.md.

**Follow the thread with trading awareness:**

Based on what they said, probe the 5 trading domains from questioning.md:
1. **Instrument and Market** -- What they're trading, which contract, market hours
2. **Strategy Type** -- The logic: trend-following, mean-reversion, breakout, scalping
3. **Execution Model** -- Bar-close vs tick, order types, bracket config
4. **Risk Tolerance** -- Position sizing, max loss, kill switch (NON-OPTIONAL)
5. **Account and Environment** -- TopStepX eval/funded, Node.js/Python, deployment

Consult `questioning.md` for specific AskUserQuestion examples, anti-patterns, and the freeform rule.
```

### Example: Trading PROJECT.md Content (Step 4)
```markdown
**For trading projects, PROJECT.md must include:**

## What This Is
[Trading bot description from questioning -- instrument, strategy type, execution model]

## Core Value
[The one thing -- e.g., "Bot correctly identifies and executes EMA crossover signals on ES futures with proper risk management"]

## Requirements
### Validated
(None yet -- ship to validate)

### Active
- [ ] Authenticate with TopStepX API and maintain JWT session
- [ ] Stream real-time quote data for [instrument] via SignalR
- [ ] Calculate [indicators] on [timeframe] bars
- [ ] Enter [long/short/both] positions on [signal conditions]
- [ ] Exit positions via [stop-loss/take-profit/signal reversal/time-based]
- [ ] Enforce risk guardrails (position limits, daily loss, kill switch)
- [ ] Log all trades and account state changes

### Out of Scope
- Backtesting -- TopStepX API is live-only
- Multi-broker support -- TopStepX specific
- UI/dashboard -- CLI bot only

## Context
**Strategy:** [Strategy name and type from strategy-spec.md]
**Instrument:** [Contract details]
**Account:** [TopStepX account type and constraints]
**Runtime:** [Node.js/Python, deployment target]

## Constraints
- **API**: TopStepX REST + SignalR WebSocket only
- **Safety**: All SAF-01 through SAF-05 patterns mandatory
- **Execution**: Bar-close default unless user opts for tick-based
- **Risk**: [Captured risk parameters from questioning]
```

### Example: Trading Requirement Categories (Step 7)
```markdown
**For trading projects, use these requirement categories:**

### API Integration (API)
- [ ] **API-01**: Bot authenticates with TopStepX via API key login
- [ ] **API-02**: Bot maintains JWT token with proactive 23-hour refresh
- [ ] **API-03**: Bot searches and selects correct trading account
- [ ] **API-04**: Bot looks up contract details for target instrument

### Strategy Logic (STR)
- [ ] **STR-01**: Bot calculates [indicator 1] on [timeframe] bars
- [ ] **STR-02**: Bot detects [entry signal] on confirmed bars
- [ ] **STR-03**: Bot places [order type] with bracket orders on signal

### Risk Management (RSK)
- [ ] **RSK-01**: Bot enforces max position size of [N] contracts
- [ ] **RSK-02**: Bot stops trading when daily loss exceeds [$amount]
- [ ] **RSK-03**: Bot includes stop-loss and take-profit brackets on every order

### Real-time Data (RTD)
- [ ] **RTD-01**: Bot streams live quotes via Market Hub WebSocket
- [ ] **RTD-02**: Bot receives order fill/reject events via User Hub

### Safety Infrastructure (SAF)
- [ ] **SAF-01**: All API enums use named constants (never bare integers)
- [ ] **SAF-02**: Rate limiting enforced per endpoint category
```

### Example: Auto-Mode Trading Context Extraction
```markdown
**If auto mode with trading document:**

Parse the provided document for trading-specific fields:
- Instrument mentions (ES, NQ, CL, MES, etc.)
- Strategy indicators (EMA, RSI, MACD, Bollinger, etc.)
- Risk parameters (stop loss, position size, daily limit)
- Account type (evaluation, funded, simulation)
- Runtime preference (Node.js, Python, TypeScript)
- PineScript code blocks (if present)

If the document contains PineScript code, flag for repainting audit and apply bar-close defaults.

Generate strategy-spec.md and risk-parameters.md from extracted trading context. Use conservative defaults from safety-patterns.md for any unspecified risk parameters.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GSD new-project with naming only | Trading-injected new-project (this phase) | Phase 5 | Workflow produces trading-specific artifacts |
| Generic questioning | Trading 5-category questioning via questioning.md | Phase 1 (REF-03) | Already available, just needs wiring |
| Generic PROJECT.md | Trading PROJECT.md + strategy-spec.md + risk-parameters.md | Phase 2 (TPL-02, TPL-04) | Templates exist, workflow generates them |
| Generic requirements | Trading requirement categories (API, STR, RSK, RTD, SAF, BOT) | Phase 5 | New categorization in the workflow |

**Already completed and available for this phase:**
- questioning.md (Phase 1) -- trading-specific questioning guide
- strategy-spec.md (Phase 2) -- strategy specification template
- risk-parameters.md (Phase 2) -- risk parameter template
- api-integration-plan.md (Phase 2) -- API integration planning template
- safety-patterns.md (Phase 1) -- non-negotiable safety patterns
- bot-scaffold-js.md (Phase 2) -- JS bot scaffold
- bot-scaffold-python.md (Phase 2) -- Python bot scaffold
- tsx-roadmapper (Phase 3) -- trading-aware roadmapper agent

## Scope and Change Analysis

### Files Modified
| File | Lines | Change Type | Scope |
|------|-------|-------------|-------|
| `topstepx/workflows/new-project.md` | ~1,112 | In-place modification | Major -- trading injection into Steps 3, 4, 6, 7, 9 |

### Files NOT Modified (but referenced)
| File | Purpose | How Referenced |
|------|---------|---------------|
| `topstepx/references/questioning.md` | Trading questioning guide | Loaded via `<required_reading>`, explicitly referenced in Step 3 |
| `topstepx/templates/strategy-spec.md` | Strategy output format | Template for Step 4 output |
| `topstepx/templates/risk-parameters.md` | Risk output format | Template for Step 4 output |
| `topstepx/templates/project.md` | PROJECT.md format | Already referenced in Step 4 |
| `topstepx/references/safety-patterns.md` | Safety defaults | Referenced for risk default values |

### Estimated Changes by Section
| Section | Current Lines | Est. Change | Nature |
|---------|---------------|-------------|--------|
| Step 1 (Setup) | ~30 | 0 lines | No change |
| Step 2 (Brownfield) | ~20 | 0 lines | No change |
| Step 2a (Auto Config) | ~80 | ~5 lines | Minor: trading-aware defaults note |
| Step 3 (Questioning) | ~50 | +80 lines | Major: trading domain questioning injection |
| Step 4 (PROJECT.md) | ~80 | +60 lines | Moderate: trading content, strategy-spec, risk-params |
| Step 5 (Config) | ~130 | 0 lines | No change |
| Step 5.5 (Model) | ~5 | 0 lines | No change |
| Step 6 (Research) | ~200 | +30 lines | Moderate: trading-specific research prompts |
| Step 7 (Requirements) | ~170 | +50 lines | Major: trading requirement categories |
| Step 8 (Roadmap) | ~110 | +10 lines | Minor: trading build order hint |
| Step 9 (Done) | ~50 | +20 lines | Moderate: trading-specific summary, strategy reference |
| Success criteria | ~25 | +10 lines | Minor: trading-specific checks |

**Total estimated:** ~255 lines of additions/modifications to a 1,112-line file. The file grows to approximately 1,350-1,400 lines.

## Open Questions

1. **Should strategy-spec.md be a separate file or embedded in PROJECT.md?**
   - What we know: The strategy-spec.md template exists as a standalone template. PROJECT.md has a "Context" section where strategy info could go.
   - What's unclear: Whether downstream agents (tsx-planner, tsx-executor) read strategy-spec.md as a separate file or expect it in PROJECT.md
   - Recommendation: Generate as separate file at `.planning/strategy-spec.md`. The tsx-planner and tsx-executor already reference it by name in their file loading patterns. Keep PROJECT.md as the project overview, strategy-spec.md as the detailed spec.

2. **Should the workflow detect PineScript in auto-mode documents?**
   - What we know: Users might pass `--auto @my-strategy.pine` or include PineScript code in their idea document
   - What's unclear: Whether Phase 5 should handle PineScript routing or just capture it
   - Recommendation: If PineScript is detected in auto-mode, note it in strategy-spec.md with `Origin: PineScript conversion` and `Repainting Status: Needs audit`. Do NOT route to `/tsx:adapt-pinescript` -- that's Phase 7. Just capture the context.

3. **How does risk-parameters.md interact with the roadmapper?**
   - What we know: risk-parameters.md captures risk constraints. The roadmapper creates phases. Safety requirements need to be in early phases.
   - What's unclear: Whether the roadmapper reads risk-parameters.md directly
   - Recommendation: Include risk parameters in REQUIREMENTS.md (under RSK-* category). The roadmapper reads REQUIREMENTS.md and will map RSK-* requirements to appropriate phases. risk-parameters.md is a reference artifact for the executor.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual validation (Markdown content adaptation) |
| Config file | none |
| Quick run command | `grep -c "trading\|strategy\|PineScript\|risk\|instrument\|bracket" topstepx/workflows/new-project.md` |
| Full suite command | See verification commands below |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WKF-01a | Trading-specific questions in questioning section | smoke | `grep -c "instrument\|strategy type\|execution model\|risk tolerance\|account type" topstepx/workflows/new-project.md` | Wave 0 |
| WKF-01b | .planning/ directory generation with trading content | smoke | `grep -c "strategy-spec\|risk-parameters" topstepx/workflows/new-project.md` | Wave 0 |
| WKF-01c | Risk parameters captured during questioning | smoke | `grep -c "position sizing\|max loss\|max contracts\|daily limits\|kill switch\|bracket" topstepx/workflows/new-project.md` | Wave 0 |
| WKF-01d | Routes to plan-phase after initialization | smoke | `grep -c "plan-phase\|discuss-phase" topstepx/workflows/new-project.md` | Already exists |

### Sampling Rate
- **Per task commit:** `grep -c "trading\|strategy\|risk\|instrument" topstepx/workflows/new-project.md` (should return 30+)
- **Per wave merge:** Full grep verification suite (see below)
- **Phase gate:** All verification commands pass before `/tsx:verify-work`

### Full Verification Commands
```bash
# 1. Trading questioning content present
grep -c "instrument\|strategy type\|execution model\|risk tolerance\|account type" topstepx/workflows/new-project.md
# Expected: 10+

# 2. Strategy-spec and risk-parameters generation
grep -c "strategy-spec\|risk-parameters" topstepx/workflows/new-project.md
# Expected: 5+

# 3. Risk parameters mentioned as non-optional
grep -c "position sizing\|max loss\|max contracts\|daily limit\|kill switch\|bracket order" topstepx/workflows/new-project.md
# Expected: 5+

# 4. Trading requirement categories
grep -c "API-\|STR-\|RSK-\|RTD-\|SAF-\|BOT-" topstepx/workflows/new-project.md
# Expected: 5+

# 5. questioning.md reference
grep -c "questioning.md" topstepx/workflows/new-project.md
# Expected: 2+

# 6. safety-patterns.md reference
grep -c "safety-patterns" topstepx/workflows/new-project.md
# Expected: 1+

# 7. Plan-phase routing still works
grep -c "/tsx:discuss-phase\|/tsx:plan-phase" topstepx/workflows/new-project.md
# Expected: 3+

# 8. Zero GSD references remain
grep -c "gsd-\|get-shit-done\|/gsd:" topstepx/workflows/new-project.md
# Expected: 0

# 9. Auto-mode still supported
grep -c "\-\-auto" topstepx/workflows/new-project.md
# Expected: 5+
```

### Wave 0 Gaps
None -- existing file is the modification target. No test infrastructure needed beyond grep verification.

## Sources

### Primary (HIGH confidence)
- `topstepx/workflows/new-project.md` -- Current file to be modified (1,112 lines, read in full)
- `topstepx/references/questioning.md` -- Trading questioning guide (read in full, 204 lines)
- `topstepx/templates/strategy-spec.md` -- Strategy spec template (read in full, 270 lines)
- `topstepx/templates/risk-parameters.md` -- Risk parameters template (read in full, 214 lines)
- `topstepx/templates/api-integration-plan.md` -- API integration template (read in full, 213 lines)
- `topstepx/references/safety-patterns.md` -- Safety patterns (read in full, 481 lines)
- `topstepx/templates/project.md` -- PROJECT.md template (read in full, 182 lines)
- `topstepx/templates/requirements.md` -- Requirements template (read in full, 231 lines)
- `topstepx/templates/bot-scaffold-js.md` -- JS scaffold (read in full, 577 lines)
- `.planning/REQUIREMENTS.md` -- Project requirements (WKF-01 definition)
- `.planning/ROADMAP.md` -- Phase 5 success criteria
- `.planning/STATE.md` -- Current project state
- `.planning/phases/04-core-execution-workflows/04-04-PLAN.md` -- Phase 4 plan confirming naming-only adaptation

### Secondary (MEDIUM confidence)
- `topstepx/agents/tsx-roadmapper.md` -- Roadmapper agent (confirms trading build order awareness)
- `topstepx/templates/roadmap.md` -- Roadmap template structure
- `topstepx/templates/state.md` -- State template structure

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All referenced files read in full, all templates and references verified to exist
- Architecture: HIGH -- Modification target (new-project.md) read completely, change scope well-defined
- Pitfalls: HIGH -- Derived from actual file content and questioning.md anti-patterns
- Scope estimate: MEDIUM -- Line counts estimated, actual changes may vary based on planner decisions

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable -- all dependencies are internal static content)
