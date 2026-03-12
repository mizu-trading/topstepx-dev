# Phase 4: Core Execution Workflows - Research

**Researched:** 2026-03-12
**Domain:** GSD workflow adaptation for trading domain orchestration, wave-based execution, agent spawning, state management
**Confidence:** HIGH

## Summary

Phase 4 adapts all 34 GSD workflow files (11,452 lines total in `$HOME/.claude/get-shit-done/workflows/*.md`) into TSX equivalents that will be installed to `topstepx/workflows/` in the distribution package. Each GSD workflow is a Markdown file using XML-tagged sections (`<purpose>`, `<process>`, `<step>`, `<success_criteria>`) that orchestrate agent spawning, state transitions, user interaction, and git operations. The adaptation is the same textual transformation pattern proven in Phases 1-3: replacing `gsd-` agent prefixes with `tsx-`, swapping `get-shit-done` path segments to `topstepx`, replacing `/gsd:` command references with `/tsx:`, updating `gsd-tools.cjs` calls to `tsx-tools.cjs`, and injecting trading domain awareness into the 4 core workflows (discuss-phase, plan-phase, execute-phase, verify-work) that directly interact with trading domain content.

The critical structural insight is that the 34 workflows fall into two categories for adaptation effort: **4 core orchestration workflows** (discuss-phase, plan-phase, execute-phase, verify-work) which spawn agents by name and need both naming changes AND trading domain injection (reference loading directives, safety pattern awareness in prompts, trading-specific gray area examples), and **30 supporting/utility workflows** which primarily need naming-only changes (replacing `gsd-` with `tsx-`, path swaps, command prefix swaps). The core 4 are the largest files (discuss-phase: 676 lines, plan-phase: 560, verify-work: 583, execute-phase: 459) and contain the agent spawning prompts where trading context must be injected. The remaining 30 range from 74 lines (research-phase.md) to 1,111 lines (new-project.md, but that is Phase 5/WKF-01, not Phase 4).

A key dependency to understand: execute-phase.md (the orchestrator) delegates to execute-plan.md (the per-plan execution logic). Both must be adapted. Similarly, verify-work.md delegates to diagnose-issues.md for gap diagnosis. The transition.md workflow is called inline by execute-phase when auto-advancing. All these delegation chains must have consistent tsx-* references.

**Primary recommendation:** Split into 4 plans across 2 waves. Wave 1: (A) discuss-phase + plan-phase workflows (deep trading injection into research/planning orchestration), (B) execute-phase + execute-plan + transition workflows (deep trading injection into execution engine). Wave 2: (C) verify-work + verify-phase + diagnose-issues workflows (trading-specific UAT and verification), (D) all remaining 25 utility/supporting workflows (naming-only adaptation). Plans A and B are independent within Wave 1; Plans C and D are independent within Wave 2. C depends on A/B because verification workflows reference execute-phase patterns.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WKF-02 | `discuss-phase` workflow -- Trading implementation context gathering | GSD source: discuss-phase.md (676 lines). Needs: tsx naming, topstepx paths, trading-specific gray area examples (strategy parameters, risk limits, execution model, data subscriptions), tsx-researcher/tsx-phase-researcher agent spawning references |
| WKF-03 | `plan-phase` workflow -- Research + plan + verify for trading phases | GSD source: plan-phase.md (560 lines). Needs: tsx naming, topstepx paths, tsx-phase-researcher/tsx-planner/tsx-plan-checker agent spawning, trading template references in planner prompts, safety pattern awareness in plan verification |
| WKF-04 | `execute-phase` workflow -- Wave-based parallel execution with trading awareness | GSD source: execute-phase.md (459 lines) + execute-plan.md (449 lines) + transition.md (544 lines). Needs: tsx naming, topstepx paths, tsx-executor agent spawning with trading reference loading, tsx-verifier spawning with trading-specific checks |
| WKF-05 | `verify-work` workflow -- UAT with trading-specific validation checks | GSD source: verify-work.md (583 lines) + verify-phase.md (243 lines) + diagnose-issues.md (219 lines). Needs: tsx naming, topstepx paths, tsx-verifier/tsx-debugger agent spawning, trading-specific test extraction from SUMMARYs |
| WKF-06 | All remaining GSD workflows adapted (pause, resume, progress, quick, debug, etc.) | 25 remaining GSD workflows (6,488 lines total). Needs: tsx naming, topstepx paths, `/tsx:` command refs, `tsx-tools.cjs` calls. Minimal trading injection -- primarily naming adaptation |
</phase_requirements>

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Markdown | N/A | Workflow definition file format | GSD pattern: XML-tagged sections in Markdown = workflow orchestration instructions |
| XML-style tags | N/A | Workflow structure (`<purpose>`, `<process>`, `<step>`, etc.) | Every workflow uses XML tags to organize orchestration steps |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Bash code blocks | N/A | CLI commands inside workflow steps | Workflows embed tsx-tools.cjs commands in their process steps |
| YAML frontmatter | N/A | Plan file metadata referenced by workflows | execute-phase/execute-plan parse PLAN.md frontmatter for wave/dependency/autonomous metadata |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static Markdown workflows | Programmatic workflow engine | GSD's proven pattern is static Markdown consumed as system prompts -- no runtime needed |
| tsx-tools.cjs CLI calls | Direct file manipulation | tsx-tools.cjs provides atomic state operations, progress tracking, git integration -- never hand-roll |

**Installation:** No dependencies. Workflow files are static Markdown content distributed via npm package.

## Architecture Patterns

### Recommended Project Structure

```
topstepx/
  workflows/                               # NEW directory (34 workflow files)
    discuss-phase.md                       # WKF-02 (676+ lines)
    plan-phase.md                          # WKF-03 (560+ lines)
    execute-phase.md                       # WKF-04 (459+ lines)
    execute-plan.md                        # WKF-04 supporting (449+ lines)
    verify-work.md                         # WKF-05 (583+ lines)
    verify-phase.md                        # WKF-05 supporting (243+ lines)
    diagnose-issues.md                     # WKF-05 supporting (219+ lines)
    transition.md                          # WKF-04 supporting (544+ lines)
    # --- WKF-06: remaining 26 workflows ---
    add-phase.md                           # (112 lines)
    add-tests.md                           # (351 lines)
    add-todo.md                            # (158 lines)
    audit-milestone.md                     # (332 lines)
    check-todos.md                         # (177 lines)
    cleanup.md                             # (152 lines)
    complete-milestone.md                  # (764 lines)
    discovery-phase.md                     # (289 lines)
    health.md                              # (159 lines)
    help.md                                # (489 lines)
    insert-phase.md                        # (130 lines)
    list-phase-assumptions.md              # (178 lines)
    map-codebase.md                        # (316 lines)
    new-milestone.md                       # (384 lines)
    new-project.md                         # (1,111 lines -- Phase 5/WKF-01, adapt naming only here)
    pause-work.md                          # (122 lines)
    plan-milestone-gaps.md                 # (274 lines)
    progress.md                            # (382 lines)
    quick.md                               # (601 lines)
    remove-phase.md                        # (155 lines)
    research-phase.md                      # (74 lines)
    resume-project.md                      # (307 lines)
    set-profile.md                         # (81 lines)
    settings.md                            # (214 lines)
    update.md                              # (240 lines)
    validate-phase.md                      # (167 lines)
  agents/                                  # Existing (Phase 3)
  references/                              # Existing (Phase 1)
  templates/                               # Existing (Phase 2)
  bin/                                     # Existing (Phase 2)
```

### Pattern 1: Naming-Only Adaptation (30 workflows)
**What:** Replace all GSD-specific identifiers with TSX equivalents while preserving structural integrity
**When to use:** For all workflows that don't directly interact with trading domain content
**Transformations required:**

| Find | Replace | Context |
|------|---------|---------|
| `gsd-executor` | `tsx-executor` | Agent subagent_type references |
| `gsd-planner` | `tsx-planner` | Agent subagent_type references |
| `gsd-phase-researcher` | `tsx-phase-researcher` | Agent subagent_type references |
| `gsd-plan-checker` | `tsx-plan-checker` | Agent subagent_type references |
| `gsd-verifier` | `tsx-verifier` | Agent subagent_type references |
| `gsd-debugger` | `tsx-debugger` | Agent subagent_type references |
| `gsd-codebase-mapper` | `tsx-codebase-mapper` | Agent subagent_type references |
| `gsd-roadmapper` | `tsx-roadmapper` | Agent subagent_type references |
| `gsd-nyquist-auditor` | `tsx-nyquist-auditor` | Agent subagent_type references |
| `gsd-research-synthesizer` | `tsx-research-synthesizer` | Agent subagent_type references |
| `gsd-integration-checker` | `tsx-integration-checker` | Agent subagent_type references |
| `get-shit-done` | `topstepx` | All path references |
| `gsd-tools.cjs` | `tsx-tools.cjs` | CLI tool invocations |
| `/gsd:` | `/tsx:` | Command references (in prompts, help text, next-step suggestions) |
| `GSD` | `TSX` | Brand references (in banners, display text) |
| `~/.gsd/` | `~/.tsx/` | User config path references |
| `gsd/` | `tsx/` | Branch prefix references (in config, git operations) |
| `Skill(skill="gsd:` | `Skill(skill="tsx:` | Auto-advance Skill invocations |

### Pattern 2: Trading Domain Injection (4 core workflows)
**What:** In addition to naming changes, inject trading-specific context into agent spawning prompts, gray area examples, and verification criteria
**When to use:** For discuss-phase, plan-phase, execute-phase, verify-work

**Injection points per workflow:**

**discuss-phase.md:**
- Gray area examples should include trading-specific domains:
  - Strategy parameters (indicator periods, entry/exit conditions, signal confirmation)
  - Risk management (position sizing, max loss per trade, daily limits, max contracts)
  - Execution model (bar-close vs tick-based, market vs limit orders, bracket configuration)
  - Data subscriptions (which SignalR hubs, quote frequency, depth of market)
- Scout codebase step should know about trading code patterns (order placement, position management, API integration)
- Domain boundary analysis should understand trading project phases (API integration, strategy logic, risk management, backtesting)

**plan-phase.md:**
- Researcher spawning prompt should include directive to load trading domain references (TOPSTEPX_API.md, PINESCRIPT.md, safety-patterns.md)
- Planner spawning prompt should reference trading templates at `$HOME/.claude/topstepx/templates/`
- Plan verification context should mention safety pattern compliance

**execute-phase.md + execute-plan.md:**
- Executor spawning prompt should include trading reference loading directives:
  ```
  @$HOME/.claude/topstepx/workflows/execute-plan.md
  @$HOME/.claude/topstepx/templates/summary.md
  @$HOME/.claude/topstepx/references/checkpoints.md
  @$HOME/.claude/topstepx/references/tdd.md
  ```
- Verifier spawning prompt should mention trading-specific verification checks

**verify-work.md:**
- Test extraction should consider trading-specific deliverables (order placement working, WebSocket subscriptions active, strategy signals correct)
- Diagnosis agents should use tsx-debugger with trading debug patterns
- Gap closure planning should reference trading safety patterns

### Pattern 3: Path Reference Consistency
**What:** All `@` file references and `$HOME/.claude/` paths must consistently use the topstepx directory
**When to use:** Every workflow that references external files

Critical path patterns in GSD workflows:
```
@C:/Users/bkevi/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/bkevi/.claude/get-shit-done/templates/summary.md
@C:/Users/bkevi/.claude/get-shit-done/references/checkpoints.md
@C:/Users/bkevi/.claude/get-shit-done/references/tdd.md
@C:/Users/bkevi/.claude/get-shit-done/references/ui-brand.md
@C:/Users/bkevi/.claude/get-shit-done/references/verification-patterns.md
@C:/Users/bkevi/.claude/get-shit-done/references/continuation-format.md
@C:/Users/bkevi/.claude/get-shit-done/templates/verification-report.md
@C:/Users/bkevi/.claude/get-shit-done/templates/UAT.md
@C:/Users/bkevi/.claude/get-shit-done/templates/summary.md
```

All become:
```
@$HOME/.claude/topstepx/workflows/execute-plan.md
@$HOME/.claude/topstepx/templates/summary.md
@$HOME/.claude/topstepx/references/checkpoints.md
...etc
```

**IMPORTANT:** The GSD source uses hardcoded Windows paths (`C:/Users/bkevi/.claude/get-shit-done/...`). TSX workflows MUST use `$HOME/.claude/topstepx/...` for portability across platforms. This was established in Phase 1 (decision [01-02]: GSD path references replaced with topstepx paths).

### Anti-Patterns to Avoid
- **Structural divergence from GSD:** Do NOT reorganize workflow logic, add new steps, or change the orchestration flow. Only content specialization.
- **Hardcoded Windows paths:** Never use `C:/Users/bkevi/` -- always `$HOME/.claude/topstepx/`
- **Mixing adaptation with refactoring:** Phases 1-3 established that naming-only adaptation preserves GSD's production-proven patterns. Continue this.
- **Forgetting delegation chains:** execute-phase -> execute-plan -> transition is a chain. All three must have consistent tsx-* references. Similarly verify-work -> diagnose-issues.
- **Skipping new-project.md:** Even though WKF-01 is Phase 5, the new-project.md workflow file must still exist in Phase 4 with naming-only adaptation so other workflows can reference it (e.g., health.md, resume-project.md suggest `/tsx:new-project`).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State management | Custom state parsing | `tsx-tools.cjs` CLI commands | 592-line tool already adapted in Phase 2 with all state operations |
| Git operations | Inline git commands | `tsx-tools.cjs commit` | Handles commit_docs config, staging, messaging |
| Phase lookups | grep/sed on ROADMAP.md | `tsx-tools.cjs roadmap get-phase` | Handles decimal phases, parsing, JSON output |
| Progress tracking | Manual counting | `tsx-tools.cjs progress bar` | Correct visual rendering across platforms |
| Model resolution | Hardcoded model names | `tsx-tools.cjs resolve-model` | Respects model_profile from config |
| Plan indexing | Manual PLAN.md parsing | `tsx-tools.cjs phase-plan-index` | Returns JSON with waves, status, objectives |
| Config access | Direct JSON file reads | `tsx-tools.cjs config-get/config-set` | Atomic read/write with defaults |

**Key insight:** Every CLI command that GSD workflows use via `gsd-tools.cjs` has an equivalent in `tsx-tools.cjs` (Phase 2, INF-01). The workflow adaptation is purely replacing the tool name in bash invocations.

## Common Pitfalls

### Pitfall 1: Incomplete Agent Reference Replacement
**What goes wrong:** A workflow spawns `gsd-executor` instead of `tsx-executor` because one `subagent_type` reference was missed
**Why it happens:** Large workflows (676 lines for discuss-phase) have multiple agent spawning points, some in conditional branches or auto-advance paths
**How to avoid:** After adaptation, grep each file for remaining `gsd-` references: `grep -n "gsd-" topstepx/workflows/*.md`
**Warning signs:** Agent not found errors at runtime, workflows silently falling back to GSD agents

### Pitfall 2: Broken Cross-Workflow References
**What goes wrong:** execute-phase.md references `@...get-shit-done/workflows/execute-plan.md` instead of the topstepx path
**Why it happens:** `@` file references are embedded in inline strings and easy to miss during find-replace
**How to avoid:** Grep for `get-shit-done` across all adapted files: `grep -rn "get-shit-done" topstepx/workflows/`
**Warning signs:** File-not-found when workflow tries to load execution context

### Pitfall 3: new-project.md Adaptation Scope
**What goes wrong:** new-project.md gets deep trading domain injection in Phase 4, then Phase 5 (WKF-01) duplicates or conflicts with that work
**Why it happens:** new-project.md is the largest workflow (1,111 lines) and has significant trading-specific questioning that is WKF-01's territory
**How to avoid:** In Phase 4, adapt new-project.md with NAMING-ONLY changes. Phase 5 handles the deep trading questioning injection. Other workflows (help.md, resume-project.md, health.md) reference `/tsx:new-project` and need the file to exist.
**Warning signs:** Plan for Phase 4 includes trading questioning in new-project.md

### Pitfall 4: help.md Content Mismatch
**What goes wrong:** help.md still describes GSD commands, or references features that don't exist yet in TSX
**Why it happens:** help.md (489 lines) is a complete command reference that lists every command with descriptions
**How to avoid:** Rename all commands from `/gsd:*` to `/tsx:*`, update the branding from "GSD (Get Shit Done)" to "TSX (TopStepX)", but keep the command descriptions accurate. Commands that don't have workflows yet (Phase 5-9) should still appear with accurate descriptions since help.md is documentation.
**Warning signs:** help.md references `/gsd:execute-phase` or describes GSD's purpose instead of TSX's

### Pitfall 5: Auto-Advance Chain Inconsistency
**What goes wrong:** discuss-phase auto-advances using `Skill(skill="gsd:plan-phase")` instead of `Skill(skill="tsx:plan-phase")`
**Why it happens:** Auto-advance code paths are at the bottom of workflow files and use `Skill()` invocations with string-embedded command names
**How to avoid:** Search for all `Skill(` invocations and ensure they reference `tsx:` commands
**Warning signs:** Auto-advance chain breaks or invokes GSD workflows instead of TSX

### Pitfall 6: Config Path Confusion
**What goes wrong:** Workflows reference `~/.gsd/defaults.json` instead of `~/.tsx/defaults.json`
**Why it happens:** Settings.md and other config-aware workflows have user config paths embedded in multiple places
**How to avoid:** Grep for `~/.gsd/` and replace with `~/.tsx/`
**Warning signs:** User defaults saved to wrong location, GSD and TSX config interfering

## Code Examples

### Example 1: Agent Spawning Adaptation (plan-phase.md)

**GSD original (plan-phase.md, step 8):**
```markdown
Task(
  prompt=filled_prompt,
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Plan Phase {phase}"
)
```

**TSX adapted:**
```markdown
Task(
  prompt=filled_prompt,
  subagent_type="tsx-planner",
  model="{planner_model}",
  description="Plan Phase {phase}"
)
```

### Example 2: Path Reference Adaptation (execute-phase.md)

**GSD original (execute-phase.md, execute_waves step):**
```markdown
<execution_context>
@C:/Users/bkevi/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/bkevi/.claude/get-shit-done/templates/summary.md
@C:/Users/bkevi/.claude/get-shit-done/references/checkpoints.md
@C:/Users/bkevi/.claude/get-shit-done/references/tdd.md
</execution_context>
```

**TSX adapted:**
```markdown
<execution_context>
@$HOME/.claude/topstepx/workflows/execute-plan.md
@$HOME/.claude/topstepx/templates/summary.md
@$HOME/.claude/topstepx/references/checkpoints.md
@$HOME/.claude/topstepx/references/tdd.md
</execution_context>
```

### Example 3: CLI Tool Adaptation (execute-plan.md)

**GSD original:**
```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "${PHASE}")
```

**TSX adapted:**
```bash
INIT=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" init execute-phase "${PHASE}")
```

### Example 4: Command Reference Adaptation (progress.md)

**GSD original:**
```markdown
`/gsd:execute-phase {phase}`
`/gsd:plan-phase {Z+1}`
`/gsd:discuss-phase {Z+1}`
`/gsd:verify-work {Z}`
```

**TSX adapted:**
```markdown
`/tsx:execute-phase {phase}`
`/tsx:plan-phase {Z+1}`
`/tsx:discuss-phase {Z+1}`
`/tsx:verify-work {Z}`
```

### Example 5: Banner Adaptation (plan-phase.md)

**GSD original:**
```
GSD > RESEARCHING PHASE {X}
GSD > PLANNING PHASE {X}
GSD > VERIFYING PLANS
```

**TSX adapted:**
```
TSX > RESEARCHING PHASE {X}
TSX > PLANNING PHASE {X}
TSX > VERIFYING PLANS
```

### Example 6: Trading Domain Injection in discuss-phase.md

**GSD original gray area examples:**
```markdown
Phase: "User authentication"
-> Session handling, Error responses, Multi-device policy, Recovery flow

Phase: "Post Feed"
-> Layout style, Loading behavior, Content ordering, Post metadata
```

**TSX trading domain additions:**
```markdown
Phase: "Order placement API integration"
-> Bracket configuration (stop-loss/take-profit defaults), Order types (market/limit/stop), Position sizing approach, Error recovery (rejected orders)

Phase: "Real-time data subscription"
-> SignalR hub selection (quotes/depth/user events), Reconnection strategy, Data buffering, Heartbeat handling

Phase: "PineScript strategy conversion"
-> Signal confirmation model (bar-close vs tick), Indicator library mapping, Timeframe handling, Repainting safeguards
```

### Example 7: Trading Reference Loading in execute-phase.md Agent Prompt

**TSX addition to executor spawning prompt:**
```markdown
Task(
  subagent_type="tsx-executor",
  model="{executor_model}",
  prompt="
    <objective>
    Execute plan {plan_number} of phase {phase_number}-{phase_name}.
    Commit each task atomically. Create SUMMARY.md. Update STATE.md and ROADMAP.md.
    </objective>

    <execution_context>
    @$HOME/.claude/topstepx/workflows/execute-plan.md
    @$HOME/.claude/topstepx/templates/summary.md
    @$HOME/.claude/topstepx/references/checkpoints.md
    @$HOME/.claude/topstepx/references/tdd.md
    </execution_context>

    <files_to_read>
    Read these files at execution start using the Read tool:
    - {phase_dir}/{plan_file} (Plan)
    - .planning/STATE.md (State)
    - .planning/config.json (Config, if exists)
    - ./CLAUDE.md (Project instructions, if exists)
    - .claude/skills/ or .agents/skills/ (Project skills, if either exists)
    </files_to_read>

    <success_criteria>
    - [ ] All tasks executed
    - [ ] Each task committed individually
    - [ ] SUMMARY.md created in plan directory
    - [ ] STATE.md updated with position and decisions
    - [ ] ROADMAP.md updated with plan progress (via roadmap update-plan-progress)
    </success_criteria>
  "
)
```

## Workflow Inventory and Adaptation Depth

### Core Workflows (Deep Adaptation -- WKF-02 through WKF-05)

| Workflow | Lines | WKF | Adaptation Depth | Key Changes |
|----------|-------|-----|------------------|-------------|
| discuss-phase.md | 676 | WKF-02 | Deep | Naming + trading gray area examples + trading domain boundary analysis |
| plan-phase.md | 560 | WKF-03 | Deep | Naming + trading reference loading in researcher/planner/checker prompts |
| execute-phase.md | 459 | WKF-04 | Deep | Naming + trading reference loading in executor/verifier prompts |
| execute-plan.md | 449 | WKF-04 | Deep | Naming + topstepx path references in execution context |
| transition.md | 544 | WKF-04 | Medium | Naming + tsx command references in next-step routing |
| verify-work.md | 583 | WKF-05 | Deep | Naming + tsx-verifier/tsx-debugger spawning + trading test awareness |
| verify-phase.md | 243 | WKF-05 | Medium | Naming + topstepx reference paths |
| diagnose-issues.md | 219 | WKF-05 | Medium | Naming + tsx-debugger spawning |

### Utility Workflows (Naming-Only -- WKF-06)

| Workflow | Lines | Adaptation Depth | Notes |
|----------|-------|------------------|-------|
| new-project.md | 1,111 | Naming only | Deep trading injection is WKF-01 (Phase 5). Phase 4 does naming only. |
| complete-milestone.md | 764 | Naming only | Large but pure orchestration, no domain content |
| quick.md | 601 | Naming only | Spawns tsx-planner/tsx-executor/tsx-plan-checker/tsx-verifier |
| help.md | 489 | Naming only | Complete command reference -- rename all /gsd: to /tsx:, rebrand |
| new-milestone.md | 384 | Naming only | |
| progress.md | 382 | Naming only | |
| add-tests.md | 351 | Naming only | |
| audit-milestone.md | 332 | Naming only | |
| map-codebase.md | 316 | Naming only | Spawns tsx-codebase-mapper |
| resume-project.md | 307 | Naming only | |
| discovery-phase.md | 289 | Naming only | |
| plan-milestone-gaps.md | 274 | Naming only | |
| update.md | 240 | Naming only | Must update npm package name from get-shit-done to topstepx-skill |
| settings.md | 214 | Naming only | ~/.gsd/ -> ~/.tsx/, brand changes |
| list-phase-assumptions.md | 178 | Naming only | |
| check-todos.md | 177 | Naming only | |
| validate-phase.md | 167 | Naming only | Spawns tsx-nyquist-auditor |
| add-todo.md | 158 | Naming only | |
| remove-phase.md | 155 | Naming only | |
| cleanup.md | 152 | Naming only | |
| insert-phase.md | 130 | Naming only | |
| pause-work.md | 122 | Naming only | |
| add-phase.md | 112 | Naming only | |
| set-profile.md | 81 | Naming only | |
| research-phase.md | 74 | Naming only | |
| health.md | 159 | Naming only | |

**Total lines:** 11,452 across 34 files

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual workflow execution | Wave-based parallel execution | GSD current | Plans execute in parallel within waves, sequential across waves |
| Resume-based checkpoints | Fresh continuation agents | GSD current | More reliable than internal serialization for parallel tool calls |
| Single verification pass | Goal-backward with gap closure loop | GSD current | Verifier checks must-haves, planner creates gap plans, executor fixes |
| Sequential agent spawning | run_in_background parallel spawning | GSD current | Agents within a wave spawn simultaneously |
| Hardcoded model selection | Profile-based model resolution | GSD current | tsx-tools.cjs resolve-model reads config profile |

**Deprecated/outdated:**
- None -- GSD workflows are current and actively maintained

## Open Questions

1. **update.md npm package name**
   - What we know: GSD's update.md references `get-shit-done-cc@latest`. TSX should reference `topstepx-skill@latest`.
   - What's unclear: Whether the npm package name should change from `topstepx-skill` to something else
   - Recommendation: Use `topstepx-skill@latest` as that's the current package name in package.json

2. **help.md TSX description**
   - What we know: GSD's help.md describes "GSD (Get Shit Done) creates hierarchical project plans optimized for solo agentic development"
   - What's unclear: Exact TSX tagline phrasing
   - Recommendation: "TSX (TopStepX) creates hierarchical project plans optimized for solo agentic development of TopStepX trading bots" -- simple, accurate, follows the pattern

3. **new-project.md adaptation boundary**
   - What we know: Phase 4 must adapt it for naming, Phase 5 adds deep trading questioning
   - What's unclear: Whether Phase 4 should skip new-project.md entirely or do naming-only
   - Recommendation: Do naming-only in Phase 4. Other workflows reference `/tsx:new-project` and the workflow file must exist for help.md reference integrity. Phase 5 then layers trading domain injection on top.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (static Markdown content, no runtime) |
| Config file | none |
| Quick run command | `grep -rn "gsd-" topstepx/workflows/ \| wc -l` (should be 0) |
| Full suite command | `grep -rn "gsd-\|get-shit-done\|/gsd:" topstepx/workflows/ \| wc -l` (should be 0) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WKF-02 | discuss-phase spawns tsx-researcher/tsx-phase-researcher | grep | `grep -c "tsx-researcher\|tsx-phase-researcher" topstepx/workflows/discuss-phase.md` | Wave 0 |
| WKF-02 | discuss-phase has trading gray area examples | grep | `grep -c "bracket\|SignalR\|position sizing\|risk" topstepx/workflows/discuss-phase.md` | Wave 0 |
| WKF-03 | plan-phase spawns tsx-planner/tsx-plan-checker/tsx-phase-researcher | grep | `grep -c "tsx-planner\|tsx-plan-checker\|tsx-phase-researcher" topstepx/workflows/plan-phase.md` | Wave 0 |
| WKF-03 | plan-phase references trading templates | grep | `grep -c "topstepx/templates" topstepx/workflows/plan-phase.md` | Wave 0 |
| WKF-04 | execute-phase spawns tsx-executor | grep | `grep -c "tsx-executor" topstepx/workflows/execute-phase.md` | Wave 0 |
| WKF-04 | execute-plan references topstepx paths | grep | `grep -c "topstepx" topstepx/workflows/execute-plan.md` | Wave 0 |
| WKF-05 | verify-work spawns tsx-verifier/tsx-debugger | grep | `grep -c "tsx-verifier\|tsx-debugger" topstepx/workflows/verify-work.md` | Wave 0 |
| WKF-06 | Zero remaining GSD references | grep | `grep -rn "gsd-\|get-shit-done\|/gsd:" topstepx/workflows/ \| wc -l` | Wave 0 |
| WKF-06 | All 34 workflow files exist | ls | `ls topstepx/workflows/*.md \| wc -l` (should be 34) | Wave 0 |

### Sampling Rate
- **Per task commit:** `grep -c "gsd-\|get-shit-done" topstepx/workflows/{modified-file}.md` (should be 0)
- **Per wave merge:** `grep -rn "gsd-\|get-shit-done\|/gsd:" topstepx/workflows/ | wc -l` (should be 0)
- **Phase gate:** All 34 files exist + zero GSD references remaining + trading injection verified in core 4

### Wave 0 Gaps
None -- verification is grep-based against static Markdown files. No test framework or fixtures needed.

## Sources

### Primary (HIGH confidence)
- GSD workflow source files at `$HOME/.claude/get-shit-done/workflows/*.md` -- all 34 files read and analyzed
- TSX agent files at `topstepx/agents/tsx-*.md` -- Phase 3 outputs confirming naming patterns
- TSX tools at `topstepx/bin/tsx-tools.cjs` -- Phase 2 output confirming CLI adaptation
- `.planning/ROADMAP.md` -- Phase 4 requirements and success criteria
- `.planning/REQUIREMENTS.md` -- WKF-02 through WKF-06 definitions
- `.planning/STATE.md` -- Project decisions establishing adaptation patterns

### Secondary (MEDIUM confidence)
- Phase 3 RESEARCH.md -- Confirms adaptation pattern (naming + domain injection), line count methodology

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- identical to Phases 1-3 (static Markdown content, no dependencies)
- Architecture: HIGH -- follows exact same adaptation pattern proven across 3 prior phases
- Pitfalls: HIGH -- based on direct analysis of all 34 GSD workflow source files
- Workflow inventory: HIGH -- complete file listing with line counts from `wc -l`

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable -- GSD workflows don't change frequently)
