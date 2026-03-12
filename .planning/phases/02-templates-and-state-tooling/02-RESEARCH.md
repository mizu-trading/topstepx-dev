# Phase 2: Templates and State Tooling - Research

**Researched:** 2026-03-11
**Domain:** GSD template adaptation, trading-specific template authoring, CLI state management tooling (Node.js/CommonJS)
**Confidence:** HIGH

## Summary

Phase 2 has two distinct workstreams: (1) template adaptation/creation and (2) tsx-tools.cjs development. The template workstream is content authoring -- adapting GSD's 36 template files (7,432 lines across `templates/`, `templates/codebase/`, and `templates/research-project/`) with tsx-* naming and trading domain context, plus creating 6 new trading-specific templates (strategy spec, API integration plan, risk parameters, bot scaffolds for JS/TS and Python, PineScript conversion report, language adaptation report). The tools workstream is JavaScript engineering -- adapting GSD's gsd-tools.cjs (593 lines) and its 11 lib modules (5,421 lines total) into tsx-tools.cjs with identical CLI interface but tsx-* naming, tsx-specific model profiles, and topstepx path constants.

The critical constraint is that risk guardrails from Phase 1's safety-patterns.md must be embedded as non-optional defaults in the bot scaffold templates and any order placement template code. This means bracket orders (stop-loss + take-profit), position sizing limits, enum constants (never bare integers), JWT token refresh, and rate limit compliance are baked into template code -- not optional additions. The safety-patterns.md reference file from Phase 1 provides the exact code patterns to embed.

The GSD template system has two mechanisms: (a) static Markdown template files that agents load as output format references, and (b) a programmatic template fill system in `template.cjs` (222 lines) that generates pre-filled PLAN.md, SUMMARY.md, and VERIFICATION.md files via CLI. Both must be adapted. The static templates define what "good output looks like" for agents. The programmatic fill system provides scaffolding when workflows create new planning artifacts.

**Primary recommendation:** Split into 3 plans: (A) GSD template adaptation (36 files, mechanical tsx naming + trading context), (B) TSX-specific template creation (6 new trading templates with embedded safety guardrails), and (C) tsx-tools.cjs with full lib module adaptation. Plans A and B are content work; Plan C is JavaScript engineering. Plans A and B can be Wave 1 (parallel-eligible since they touch different files); Plan C is Wave 2 (depends on understanding template paths established in A/B).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TPL-01 | All GSD templates adapted (project, requirements, roadmap, state, config, context, plans, summaries, verification reports, UAT) | 36 GSD template files inventoried with line counts and adaptation needs; tsx naming pattern established in Phase 1 |
| TPL-02 | Strategy specification template (indicators, entry/exit conditions, risk params) | New template; structure derived from questioning.md question categories and safety-patterns.md risk guardrail patterns |
| TPL-03 | API integration plan template (auth, endpoints, WebSocket subs) | New template; structure derived from TOPSTEPX_API.md endpoint categories and SKILL.md connection URLs |
| TPL-04 | Risk parameters template (position sizing, max loss, daily limits) | New template; SAF-01 risk guardrail patterns provide the exact parameters to capture |
| TPL-05 | Bot scaffold templates (JS/TS and Python) | New templates; safety-patterns.md provides TokenManager, RateLimiter, enum constants, bracket order patterns to embed |
| TPL-06 | PineScript conversion report template | New template; PINESCRIPT.md repainting audit and conversion mapping tables define the report structure |
| TPL-07 | Language adaptation report template | New template; structure covers source analysis, library mapping, and test plan |
| INF-01 | tsx-tools.cjs CLI utilities | gsd-tools.cjs (593 lines) + 11 lib modules (5,421 lines) fully inventoried; adaptation is naming + paths + model profiles |
</phase_requirements>

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Node.js | >= 18 | tsx-tools.cjs runtime | Project constraint from PROJECT.md; matches existing pattern |
| CommonJS | N/A | Module format for tsx-tools.cjs | Matches gsd-tools.cjs format; zero-dependency constraint |
| Markdown | N/A | Template file format | All templates are Markdown with optional YAML frontmatter |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| YAML frontmatter | N/A | Structured metadata in templates | Plan, summary, verification, UAT templates use YAML frontmatter |
| JSON | N/A | Config template format | config.json template defines planning configuration schema |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CommonJS | ESM | CommonJS matches existing gsd-tools.cjs; ESM would break installer compatibility |
| Inline templates in code | Separate .md template files | GSD uses both -- static .md files for agent reference, inline for programmatic fill; preserve both |

**Installation:** No new dependencies. Zero-dependency constraint applies. All code is pure Node.js with built-in modules only (`fs`, `path`, `readline`, `os`, `child_process`).

## Architecture Patterns

### Recommended Project Structure

```
topstepx/
  templates/                    # Adapted GSD templates + new trading templates
    project.md                  # TPL-01: Adapted from GSD
    requirements.md             # TPL-01: Adapted
    roadmap.md                  # TPL-01: Adapted
    state.md                    # TPL-01: Adapted
    config.json                 # TPL-01: Adapted
    context.md                  # TPL-01: Adapted
    phase-prompt.md             # TPL-01: Adapted (PLAN.md format)
    summary.md                  # TPL-01: Adapted
    summary-standard.md         # TPL-01: Adapted
    summary-minimal.md          # TPL-01: Adapted
    summary-complex.md          # TPL-01: Adapted
    verification-report.md      # TPL-01: Adapted
    UAT.md                      # TPL-01: Adapted
    VALIDATION.md               # TPL-01: Adapted
    DEBUG.md                    # TPL-01: Adapted
    research.md                 # TPL-01: Adapted
    continue-here.md            # TPL-01: Adapted
    discovery.md                # TPL-01: Adapted
    milestone.md                # TPL-01: Adapted
    milestone-archive.md        # TPL-01: Adapted
    retrospective.md            # TPL-01: Adapted
    user-setup.md               # TPL-01: Adapted
    planner-subagent-prompt.md  # TPL-01: Adapted
    debug-subagent-prompt.md    # TPL-01: Adapted
    codebase/                   # TPL-01: 7 adapted codebase map templates
      architecture.md
      concerns.md
      conventions.md
      integrations.md
      stack.md
      structure.md
      testing.md
    research-project/           # TPL-01: 5 adapted research templates
      ARCHITECTURE.md
      FEATURES.md
      PITFALLS.md
      STACK.md
      SUMMARY.md
    strategy-spec.md            # TPL-02: NEW - Trading strategy specification
    api-integration-plan.md     # TPL-03: NEW - API integration plan
    risk-parameters.md          # TPL-04: NEW - Risk parameters
    bot-scaffold-js.md          # TPL-05: NEW - JS/TS bot scaffold
    bot-scaffold-python.md      # TPL-05: NEW - Python bot scaffold
    pinescript-conversion.md    # TPL-06: NEW - PineScript conversion report
    language-adaptation.md      # TPL-07: NEW - Language adaptation report
  bin/
    tsx-tools.cjs               # INF-01: CLI entry point
    lib/
      core.cjs                  # Shared utilities, MODEL_PROFILES, path helpers
      state.cjs                 # STATE.md operations
      phase.cjs                 # Phase directory operations
      roadmap.cjs               # ROADMAP.md operations
      verify.cjs                # Verification suite
      config.cjs                # Config CRUD
      template.cjs              # Template fill operations
      milestone.cjs             # Milestone operations
      commands.cjs              # Misc commands (slug, timestamp, todos, etc.)
      init.cjs                  # Compound init commands
      frontmatter.cjs           # Frontmatter CRUD
  references/                   # Phase 1 output (already exists)
    TOPSTEPX_API.md
    PINESCRIPT.md
    safety-patterns.md
    [9 adapted GSD references]
```

### Pattern 1: GSD Template Adaptation (Naming + Context)

**What:** Copy each GSD template, apply tsx-* naming substitutions, add trading-domain context where appropriate. Preserve GSD's structure exactly.

**When to use:** All 36 files in TPL-01.

**Adaptation rules:**
1. Replace `gsd-*` agent names with `tsx-*` (e.g., `gsd-planner` -> `tsx-planner`, `gsd-executor` -> `tsx-executor`)
2. Replace `/gsd:*` command names with `/tsx:*` (e.g., `/gsd:plan-phase` -> `/tsx:plan-phase`)
3. Replace `gsd-tools.cjs` path references with `tsx-tools.cjs` (e.g., `$HOME/.claude/get-shit-done/bin/gsd-tools.cjs` -> `$HOME/.claude/topstepx/bin/tsx-tools.cjs`)
4. Replace `get-shit-done` path segments with `topstepx`
5. Add trading-specific examples where generic examples exist (but don't remove generic structure)
6. Preserve template structure, section ordering, and guidelines sections

**Example transformations:**
```
# In context.md:
"gsd-phase-researcher" -> "tsx-phase-researcher"
"gsd-planner" -> "tsx-planner"
"/gsd:map-codebase" -> "/tsx:map-codebase"

# In phase-prompt.md:
"@C:/Users/bkevi/.claude/get-shit-done/workflows/execute-plan.md"
  -> "@$HOME/.claude/topstepx/workflows/execute-plan.md"
"@C:/Users/bkevi/.claude/get-shit-done/templates/summary.md"
  -> "@$HOME/.claude/topstepx/templates/summary.md"
```

### Pattern 2: Trading-Specific Template Creation

**What:** New templates that capture trading domain artifacts. Each template defines a structured output format that agents use when producing trading-specific documents.

**When to use:** TPL-02 through TPL-07.

**Template structure convention (from GSD):**
```markdown
# [Template Name]

Template for `[path]` -- [purpose description].

<template>
```markdown
[The actual template content with placeholders]
```
</template>

<guidelines>
[Instructions for how to fill in the template]
</guidelines>

<example>
[At least one filled-in example]
</example>
```

### Pattern 3: tsx-tools.cjs Adaptation (Copy + Rename + Specialize)

**What:** Copy gsd-tools.cjs and all 11 lib modules. Change internal references from `gsd-*` to `tsx-*`. Update path constants from `get-shit-done` to `topstepx`. Update MODEL_PROFILES to use `tsx-*` agent names.

**When to use:** INF-01.

**Key changes from gsd-tools.cjs:**
1. **MODEL_PROFILES in core.cjs**: Rename all keys from `gsd-*` to `tsx-*`
2. **Path constants**: `get-shit-done` -> `topstepx` everywhere
3. **Branch templates in config.cjs**: `gsd/phase-{phase}-{slug}` -> `tsx/phase-{phase}-{slug}`
4. **Brave search key path**: `~/.gsd/brave_api_key` -> `~/.tsx/brave_api_key` (or keep as is -- Claude's discretion)
5. **Global defaults path**: `~/.gsd/defaults.json` -> `~/.tsx/defaults.json` (or keep as is)
6. **Error messages**: `gsd-tools` -> `tsx-tools`
7. **Usage help text**: All `gsd-tools` -> `tsx-tools`, `gsd` -> `tsx`

### Anti-Patterns to Avoid

- **Restructuring GSD templates:** Adapt, don't redesign. The GSD template structure is what agents expect. Changing section ordering or removing sections breaks agent compatibility.
- **Making safety guardrails optional in bot scaffolds:** The success criteria explicitly states "non-optional defaults." Bracket orders, position limits, and enum constants must be in the scaffold code, not in comments saying "consider adding."
- **Splitting tsx-tools.cjs into separate files from GSD structure:** Keep the same 1 entry + 11 lib modules structure. The lib module boundaries match GSD's organization, making future GSD updates easy to merge.
- **Adding new features to tsx-tools.cjs beyond what gsd-tools.cjs has:** Phase 2 is adaptation, not innovation. New TSX-specific tool commands belong in later phases if needed.
- **Hardcoding absolute paths in templates:** Templates use `$HOME/.claude/topstepx/` pattern, not hardcoded absolute paths. The installer handles actual path resolution per platform.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CLI argument parsing | Custom arg parser | GSD's existing arg parsing pattern in gsd-tools.cjs | Works, handles flags, positional args, `--cwd` override |
| YAML frontmatter parsing | Custom YAML parser | GSD's frontmatter.cjs (299 lines, handles extract + reconstruct) | Edge cases in YAML parsing are numerous |
| State file operations | Custom STATE.md parser | GSD's state.cjs (721 lines, handles all update patterns) | STATE.md format has specific field extraction, patch, advance-plan |
| Phase directory operations | Custom phase finder | GSD's phase.cjs (901 lines, handles decimal phases, archived, etc.) | Phase numbering has complex rules (decimal, letter suffixes, archived milestones) |
| Git operations | Custom git wrappers | GSD's core.cjs execGit function | Handles shell escaping, error capture, cross-platform |
| Template fill system | Custom scaffolding | GSD's template.cjs cmdTemplateFill (generates PLAN, SUMMARY, VERIFICATION) | Pre-fills frontmatter, computes file names, avoids overwrites |

**Key insight:** tsx-tools.cjs is a copy-and-adapt of gsd-tools.cjs, not a rewrite. The 6,014 lines of GSD tooling code are production-proven. The adaptation is mechanical naming changes and path constant updates. Do not refactor, optimize, or restructure during adaptation.

## Common Pitfalls

### Pitfall 1: Missing Template Files Cause Agent Confusion
**What goes wrong:** Agents reference templates via `@` paths. If a template file is missing from `topstepx/templates/`, the agent silently operates without that format guidance, producing inconsistent output.
**Why it happens:** The 36 GSD templates are easy to partially copy. One missed file means one workflow produces unstructured output.
**How to avoid:** Create a manifest of all 36 GSD template files + 7 new trading templates (43 total). Verify every file exists with `find topstepx/templates/ -type f | wc -l` matching expected count.
**Warning signs:** Agents producing output that doesn't match template structure (missing frontmatter, wrong sections).

### Pitfall 2: Incomplete gsd->tsx Naming in Templates
**What goes wrong:** A template still references `gsd-planner` or `/gsd:plan-phase` or `get-shit-done` path. When an agent loads it, the agent gets confused about whether to use GSD or TSX tooling.
**How to avoid:** After all template adaptations, run `grep -r "gsd-" topstepx/templates/` and `grep -r "get-shit-done" topstepx/templates/` and `grep -r "/gsd:" topstepx/templates/`. All three should return zero results.
**Warning signs:** `grep -c "gsd" topstepx/templates/*.md` returning non-zero.

### Pitfall 3: Bot Scaffolds Without Safety Guardrails
**What goes wrong:** Bot scaffold templates (TPL-05) generate code that places orders without bracket orders, uses bare integer enums, has no token refresh, or ignores rate limits.
**Why it happens:** Developer focuses on making the scaffold "clean" and defers safety to user customization.
**How to avoid:** Success criteria #4 is explicit: "Risk guardrails from Phase 1 safety content are baked into bot scaffold and order placement templates as non-optional defaults." The scaffold MUST include: (1) enum constant definitions, (2) TokenManager with 23hr refresh, (3) RateLimiter class, (4) bracket orders as default in createOrder, (5) position sizing limit parameter.
**Warning signs:** Bot scaffold that compiles/runs but has no safety imports or bracket order defaults.

### Pitfall 4: tsx-tools.cjs Path Constant Mismatch
**What goes wrong:** tsx-tools.cjs uses `get-shit-done` paths internally, so state operations write to GSD directories instead of TSX directories.
**Why it happens:** The path constants are scattered across multiple lib modules, not centralized. Missing one means operations silently target wrong directories.
**How to avoid:** The key paths to change are:
- `core.cjs`: `phase_branch_template` default: `gsd/phase-{phase}-{slug}` -> `tsx/phase-{phase}-{slug}`
- `core.cjs`: `milestone_branch_template`: `gsd/{milestone}-{slug}` -> `tsx/{milestone}-{slug}`
- `config.cjs`: `~/.gsd/brave_api_key` -> consider `~/.tsx/brave_api_key`
- `config.cjs`: `~/.gsd/defaults.json` -> consider `~/.tsx/defaults.json`
- ALL error messages referencing `gsd-tools`
- ALL help text referencing `gsd-tools` or `GSD`
After adaptation: `grep -r "gsd" topstepx/bin/` should return zero results (excluding any intentional GSD attribution comments).

### Pitfall 5: Template Examples Still Generic
**What goes wrong:** Adapted templates have tsx-* naming but all examples are still about "CommunityApp" or "Photo Library" -- nothing trading-related.
**Why it happens:** Mechanical naming substitution catches agent/command names but doesn't add domain context.
**How to avoid:** Trading-specific templates (TPL-02 through TPL-07) are entirely new, so this doesn't apply there. For adapted GSD templates (TPL-01), add at least one trading example in the `<example>` or `<good_examples>` section if the template has one. Not every template needs a trading example (e.g., `summary-minimal.md` is structure-only), but templates with examples should include a trading variant.
**Warning signs:** All template examples are about generic web apps with no mention of trading, orders, WebSocket, or TopStepX.

### Pitfall 6: MODEL_PROFILES Not Updated in tsx-tools core.cjs
**What goes wrong:** tsx-tools.cjs model resolution returns incorrect model for `tsx-planner` because MODEL_PROFILES still has `gsd-planner` keys.
**Why it happens:** The MODEL_PROFILES object in core.cjs has 12 entries that all need key renaming.
**How to avoid:** The MODEL_PROFILES object must be updated from:
```javascript
'gsd-planner': { quality: 'opus', balanced: 'opus', budget: 'sonnet' },
// ... 11 more entries
```
to:
```javascript
'tsx-planner': { quality: 'opus', balanced: 'opus', budget: 'sonnet' },
// ... 11 more entries
```
All 12 entries must be renamed. The model allocations (opus/sonnet/haiku per profile) stay the same.

## Code Examples

### Trading Strategy Specification Template (TPL-02)

```markdown
# Strategy Specification Template

Template for strategy specification documents produced during `/tsx:new-project` questioning.

<template>
## Strategy: [Name]

### Overview
- **Type:** [Trend-following | Mean-reversion | Breakout | Scalping | Custom]
- **Instruments:** [Contract IDs, e.g., CON.F.US.ENQ.H26]
- **Timeframe:** [Bar unit and period, e.g., 5-minute bars]
- **Execution Model:** [Bar-close | Tick-based]

### Indicators
| Indicator | Parameters | Purpose |
|-----------|-----------|---------|
| [e.g., EMA] | [period: 20] | [Signal line for trend] |

### Entry Conditions
- **Long Entry:** [conditions]
- **Short Entry:** [conditions]

### Exit Conditions
- **Stop Loss:** [ticks or method]
- **Take Profit:** [ticks or method]
- **Trailing Stop:** [if applicable]
- **Time-based Exit:** [if applicable]

### Risk Parameters
- **Max Position Size:** [contracts]
- **Max Daily Loss:** [$amount]
- **Max Drawdown:** [$amount]
- **Risk per Trade:** [% of account or $ amount]

### Source
- **Origin:** [From scratch | PineScript conversion | Language adaptation]
- **Source Reference:** [PineScript code / existing bot path / N/A]
</template>
```

### Bot Scaffold Template with Embedded Safety (TPL-05 - JS/TS)

```javascript
// Source: safety-patterns.md SAF-01 through SAF-05

// ── Enum Constants (SAF-01: NEVER bare integers) ─────────────────
const OrderSide = { Bid: 0, Ask: 1 };
const OrderType = {
  Unknown: 0, Limit: 1, Market: 2, StopLimit: 3,
  Stop: 4, TrailingStop: 5, JoinBid: 6, JoinAsk: 7
};
const OrderStatus = {
  None: 0, Open: 1, Filled: 2, Cancelled: 3,
  Expired: 4, Rejected: 5, Pending: 6
};

// ── Token Manager (SAF-02: Proactive 23hr refresh) ───────────────
class TokenManager {
  constructor(initialToken) {
    this.token = initialToken;
    this.refreshInterval = 23 * 60 * 60 * 1000;
    this.startRefreshTimer();
  }
  // ... [from safety-patterns.md]
}

// ── Rate Limiter (SAF-03: 50/30s history, 200/60s general) ──────
const RATE_LIMITS = {
  HISTORY: { requests: 50, windowMs: 30_000 },
  GENERAL: { requests: 200, windowMs: 60_000 },
};

// ── Order Placement with Brackets (SAF-01 Risk Guardrails) ──────
function createOrder(side, size, contractId, accountId, options = {}) {
  return {
    accountId, contractId,
    side: side,
    type: OrderType.Market,
    size: Math.min(size, options.maxSize || 5),
    stopLossBracket: {
      ticks: options.stopLossTicks || 20,
      type: OrderType.Limit
    },
    takeProfitBracket: {
      ticks: options.takeProfitTicks || 40,
      type: OrderType.Limit
    }
  };
}
```

### tsx-tools.cjs MODEL_PROFILES Update (INF-01)

```javascript
// Source: gsd-tools.cjs core.cjs MODEL_PROFILES, adapted with tsx-* naming

const MODEL_PROFILES = {
  'tsx-planner':              { quality: 'opus', balanced: 'opus',   budget: 'sonnet' },
  'tsx-roadmapper':           { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'tsx-executor':             { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'tsx-phase-researcher':     { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
  'tsx-project-researcher':   { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
  'tsx-research-synthesizer': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'tsx-debugger':             { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'tsx-codebase-mapper':      { quality: 'sonnet', balanced: 'haiku', budget: 'haiku' },
  'tsx-verifier':             { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'tsx-plan-checker':         { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'tsx-integration-checker':  { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'tsx-nyquist-auditor':      { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
};
```

## GSD Template Inventory

Complete inventory of files requiring adaptation for TPL-01:

### Top-level Templates (24 files)
| File | Lines | Adaptation Level | Notes |
|------|-------|-----------------|-------|
| project.md | 184 | Light | Add trading project example |
| requirements.md | 231 | Light | Add trading requirement categories example |
| roadmap.md | 202 | Light | Add trading phase example |
| state.md | 176 | Light | tsx naming, /tsx: commands |
| config.json | 37 | Light | tsx branch templates |
| context.md | 297 | Medium | tsx agent names, trading example |
| phase-prompt.md | 569 | Medium | tsx paths, tsx agent names, trading context |
| summary.md | 248 | Light | tsx naming |
| summary-standard.md | 48 | Light | tsx naming |
| summary-minimal.md | 41 | Light | tsx naming |
| summary-complex.md | 59 | Light | tsx naming |
| verification-report.md | 322 | Light | tsx naming |
| UAT.md | 247 | Light | tsx naming |
| VALIDATION.md | 76 | Light | tsx naming |
| DEBUG.md | 164 | Light | tsx naming, trading debug example |
| research.md | 552 | Medium | tsx agent names, trading research example |
| continue-here.md | 78 | Light | tsx naming |
| discovery.md | 146 | Light | tsx naming, trading discovery example |
| milestone.md | 115 | Light | tsx naming |
| milestone-archive.md | 123 | Light | tsx naming |
| retrospective.md | 54 | Light | tsx naming |
| user-setup.md | 311 | Medium | Trading user setup examples (API keys, accounts) |
| planner-subagent-prompt.md | 117 | Light | tsx agent names |
| debug-subagent-prompt.md | 91 | Light | tsx agent names |

### Codebase Templates (7 files)
| File | Lines | Adaptation Level | Notes |
|------|-------|-----------------|-------|
| codebase/architecture.md | 255 | Light | tsx naming |
| codebase/concerns.md | 310 | Light | tsx naming |
| codebase/conventions.md | 307 | Light | tsx naming |
| codebase/integrations.md | 280 | Light | tsx naming, trading integration example |
| codebase/stack.md | 186 | Light | tsx naming |
| codebase/structure.md | 285 | Light | tsx naming |
| codebase/testing.md | 480 | Light | tsx naming |

### Research Project Templates (5 files)
| File | Lines | Adaptation Level | Notes |
|------|-------|-----------------|-------|
| research-project/ARCHITECTURE.md | 204 | Light | tsx naming |
| research-project/FEATURES.md | 147 | Light | tsx naming |
| research-project/PITFALLS.md | 200 | Light | tsx naming |
| research-project/STACK.md | 120 | Light | tsx naming |
| research-project/SUMMARY.md | 170 | Light | tsx naming |

**Totals:** 36 files, 7,432 lines, 28 Light + 5 Medium + 0 Heavy adaptations

## tsx-tools.cjs Module Inventory

Complete inventory of lib modules requiring adaptation for INF-01:

| Module | Lines | Key Changes |
|--------|-------|-------------|
| gsd-tools.cjs (entry) | 593 | Rename to tsx-tools.cjs; update usage text, require paths |
| lib/core.cjs | 492 | MODEL_PROFILES keys gsd->tsx; branch template defaults; path helpers |
| lib/state.cjs | 721 | Error messages gsd->tsx only; logic unchanged |
| lib/phase.cjs | 901 | Error messages gsd->tsx only; logic unchanged |
| lib/roadmap.cjs | 298 | Error messages gsd->tsx only; logic unchanged |
| lib/verify.cjs | 820 | Error messages gsd->tsx only; logic unchanged |
| lib/config.cjs | 169 | Branch template defaults; brave key path; global defaults path |
| lib/template.cjs | 222 | Template path references if any; logic unchanged |
| lib/milestone.cjs | 241 | Error messages gsd->tsx only; logic unchanged |
| lib/commands.cjs | 548 | Error messages, usage text gsd->tsx |
| lib/init.cjs | 710 | Model resolution keys gsd->tsx; error messages |
| lib/frontmatter.cjs | 299 | No changes expected (format-agnostic) |

**Total:** 6,014 lines across 12 files. Estimated ~95% mechanical naming substitution, ~5% trading-specific changes (MODEL_PROFILES, path defaults).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GSD templates at `~/.claude/get-shit-done/templates/` | TSX templates at `$HOME/.claude/topstepx/templates/` | This phase | Templates load from TSX path, not GSD |
| gsd-tools.cjs | tsx-tools.cjs | This phase | All workflows reference tsx-tools.cjs |
| Generic examples in templates | Trading-specific examples alongside generic | This phase | Agents see trading context when loading templates |
| Safety as reference-only | Safety embedded in scaffold templates | This phase | Bot code generated from scaffolds has safety built in |

**Deprecated/outdated:**
- No deprecation in this phase. TSX templates are new files that coexist with GSD templates.

## Open Questions

1. **Global defaults path: `~/.gsd/` vs `~/.tsx/`**
   - What we know: gsd-tools.cjs reads `~/.gsd/defaults.json` and `~/.gsd/brave_api_key` for user-level config
   - What's unclear: Should tsx-tools.cjs use `~/.tsx/` (clean separation) or `~/.gsd/` (share user preferences with GSD)?
   - Recommendation: Use `~/.tsx/` for clean separation. Users who want shared config can symlink. The PROJECT.md constraint says "Must coexist with GSD" which means no conflicts, and separate config dirs ensure that.

2. **Template examples: how many trading examples per template?**
   - What we know: GSD templates have 1-3 examples each. Some are structural (summary templates) where examples are format demonstrations, not domain-specific.
   - What's unclear: Should every template get a trading example, or only templates where domain context matters?
   - Recommendation: Add trading examples only where domain context is meaningful (project.md, context.md, user-setup.md, discovery.md, DEBUG.md, research.md, phase-prompt.md). Structural templates (summary variants, VALIDATION.md, frontmatter-only templates) don't need trading examples since their format is domain-agnostic.

3. **Bot scaffold template format: runnable code vs template with placeholders?**
   - What we know: TPL-05 says "starter code for JS/TS and Python trading bots." The safety patterns from Phase 1 provide complete, runnable code examples.
   - What's unclear: Should the bot scaffold be a template that agents fill in (with `[placeholder]` markers) or a near-runnable starter that users customize?
   - Recommendation: Near-runnable starter. The scaffold should define the bot class structure with all safety guardrails implemented (TokenManager, RateLimiter, enum constants, bracket order defaults). Strategy-specific logic (indicator calculations, entry/exit conditions) has placeholder sections clearly marked. An agent producing a bot fills in those sections, but safety code is already present and non-negotiable.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None -- this project has no test infrastructure (0% coverage noted in PROJECT.md) |
| Config file | None |
| Quick run command | `node topstepx/bin/tsx-tools.cjs --help 2>&1; echo $?` (smoke test) |
| Full suite command | N/A -- no test suite exists |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TPL-01 | 36 GSD templates adapted with tsx naming | smoke | `grep -r "gsd-" topstepx/templates/ \| wc -l` (expect 0) | N/A |
| TPL-02 | Strategy spec template exists | smoke | `test -f topstepx/templates/strategy-spec.md` | N/A - Wave 0 |
| TPL-03 | API integration plan template exists | smoke | `test -f topstepx/templates/api-integration-plan.md` | N/A - Wave 0 |
| TPL-04 | Risk parameters template exists | smoke | `test -f topstepx/templates/risk-parameters.md` | N/A - Wave 0 |
| TPL-05 | Bot scaffold templates exist (JS + Python) | smoke | `test -f topstepx/templates/bot-scaffold-js.md && test -f topstepx/templates/bot-scaffold-python.md` | N/A - Wave 0 |
| TPL-06 | PineScript conversion report template exists | smoke | `test -f topstepx/templates/pinescript-conversion.md` | N/A - Wave 0 |
| TPL-07 | Language adaptation report template exists | smoke | `test -f topstepx/templates/language-adaptation.md` | N/A - Wave 0 |
| INF-01 | tsx-tools.cjs runs without error | smoke | `node topstepx/bin/tsx-tools.cjs state load 2>&1` | N/A - Wave 0 |
| SAF-embed | Bot scaffolds include safety guardrails | smoke | `grep -c "OrderSide" topstepx/templates/bot-scaffold-js.md` (expect >0) | N/A |

### Sampling Rate
- **Per task commit:** Verify created files exist and pass naming check
- **Per wave merge:** Full grep verification for zero gsd-* naming leaks
- **Phase gate:** All 43 template files present + tsx-tools.cjs smoke test passes

### Wave 0 Gaps
- [ ] `topstepx/templates/` directory -- needs creation
- [ ] `topstepx/bin/` directory -- needs creation
- [ ] `topstepx/bin/lib/` directory -- needs creation
- [ ] No formal test framework -- use file existence checks and grep-based verification

*(Test infrastructure is out of scope for v1 per REQUIREMENTS.md v2 deferral: "Test suite for installer and tsx-tools.cjs")*

## Sources

### Primary (HIGH confidence)
- GSD templates at `~/.claude/get-shit-done/templates/` -- all 36 files examined directly, line counts verified
- GSD gsd-tools.cjs at `~/.claude/get-shit-done/bin/gsd-tools.cjs` -- 593 lines, full CLI router read
- GSD lib modules at `~/.claude/get-shit-done/bin/lib/` -- all 11 modules examined, line counts verified (5,421 total)
- Phase 1 outputs in `topstepx/references/` -- 12 files confirmed present, safety-patterns.md code patterns reviewed
- Phase 1 summaries in `.planning/phases/01-references-and-domain-knowledge/` -- 3 summaries read for decisions and patterns established
- PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md -- all read for requirements and constraints
- `.planning/config.json` -- read for workflow settings

### Secondary (MEDIUM confidence)
- GSD VERSION file: v1.22.4 -- current version of GSD being adapted

### Tertiary (LOW confidence)
- None -- all findings directly verified from source files

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; pure content + CommonJS adaptation
- Architecture: HIGH - File structure directly derived from GSD source, all files inventoried
- Pitfalls: HIGH - Based on Phase 1 experience and direct GSD source analysis
- Template inventory: HIGH - Every file counted with `wc -l`, adaptation level assessed from content review
- Tools inventory: HIGH - Every lib module read, key change points identified

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable content, no rapidly changing dependencies)
