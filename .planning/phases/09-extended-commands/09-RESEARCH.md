# Phase 9: Extended Commands - Research

**Researched:** 2026-03-12
**Domain:** Claude Code slash command authoring (Markdown files with YAML frontmatter) -- extending established Phase 8 pattern
**Confidence:** HIGH

## Summary

Phase 9 creates 20 additional slash commands in `commands/tsx/` to complete the TSX command surface. These commands follow the identical thin-delegation pattern established in Phase 8: each is a Markdown file with YAML frontmatter that declares metadata and tool permissions, then delegates to a corresponding workflow in `topstepx/workflows/`. All 20 target workflows already exist from Phases 4-7.

The 20 commands break into three categories: (1) 5 phase management commands that modify ROADMAP.md, (2) 13 utility commands for debugging, todos, settings, testing, and tooling operations, and (3) 2 TSX-specific commands for language and PineScript adaptation. Complexity varies significantly: 12 commands are simple thin wrappers (18-47 lines), while `debug.md` (168 lines) and `research-phase.md` (190 lines) are substantially longer because they contain inline orchestration logic (symptom gathering, agent spawning, checkpoint handling). These two "rich" commands require careful adaptation because they have inline bash snippets referencing `gsd-tools.cjs` and `gsd-*` agent names that must be systematically replaced.

**Primary recommendation:** Batch into 3 plans by category: (Plan 1) 5 phase management commands + 2 TSX-specific commands (all simple), (Plan 2) 11 simple utility commands, (Plan 3) 2 rich utility commands (debug, research-phase) that need careful inline logic adaptation. This groups by complexity and allows the simple commands to proceed in parallel while the complex ones get focused attention.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CMD-13 | `/tsx:add-phase` -- Append phase to roadmap | GSD source: 43 lines, simple delegation to add-phase.md workflow. Mechanical adaptation. |
| CMD-14 | `/tsx:insert-phase` -- Insert urgent work as decimal phase | GSD source: 32 lines, simple delegation to insert-phase.md workflow. Mechanical adaptation. |
| CMD-15 | `/tsx:remove-phase` -- Remove future phase | GSD source: 31 lines, simple delegation to remove-phase.md workflow. Uses Glob in allowed-tools. |
| CMD-16 | `/tsx:list-phase-assumptions` -- Surface approach assumptions | GSD source: 46 lines, includes success_criteria section. Delegates to list-phase-assumptions.md workflow. |
| CMD-17 | `/tsx:plan-milestone-gaps` -- Create phases to close audit gaps | GSD source: 34 lines, references `/gsd:audit-milestone` in body text (must become `/tsx:audit-milestone`). Delegates to plan-milestone-gaps.md workflow. |
| CMD-18 | `/tsx:map-codebase` -- Analyze existing trading codebase | GSD source: 71 lines, has when_to_use and success_criteria sections. References `gsd-codebase-mapper` agents (must become `tsx-codebase-mapper`). References `/gsd:new-project` and `/gsd:plan-phase` routing. |
| CMD-19 | `/tsx:quick` -- Execute ad-hoc tasks with GSD guarantees | GSD source: 45 lines, references `gsd-planner` and `gsd-executor` in objective text. Delegates to quick.md workflow. |
| CMD-20 | `/tsx:debug` -- Systematic debugging for trading integrations | GSD source: **168 lines**, rich command with inline bash (gsd-tools.cjs state load, resolve-model gsd-debugger), multi-step process, agent spawning templates, checkpoint handling. Requires deep adaptation. |
| CMD-21 | `/tsx:add-todo` -- Capture idea for later | GSD source: 47 lines, simple delegation to add-todo.md workflow. Mechanical adaptation. |
| CMD-22 | `/tsx:check-todos` -- List pending todos | GSD source: 45 lines, simple delegation to check-todos.md workflow. Mechanical adaptation. |
| CMD-23 | `/tsx:settings` -- Configure workflow toggles | GSD source: 36 lines, description says "GSD workflow toggles" (must become "TSX workflow toggles"). Delegates to settings.md workflow. |
| CMD-24 | `/tsx:set-profile` -- Switch model profile | GSD source: 34 lines, description says "GSD agents" (must become "TSX agents"). Delegates to set-profile.md workflow. |
| CMD-25 | `/tsx:update` -- Update TSX to latest version | GSD source: 37 lines, description says "GSD" (must become "TSX"). Delegates to update.md workflow. |
| CMD-26 | `/tsx:research-phase` -- Deep domain research for a phase | GSD source: **190 lines**, rich command with inline bash (gsd-tools.cjs init phase-op, resolve-model gsd-phase-researcher), multi-step process, agent spawning templates with `gsd-phase-researcher`, checkpoint handling. Requires deep adaptation. |
| CMD-27 | `/tsx:validate-phase` -- Retroactive validation | GSD source: 35 lines, simple delegation to validate-phase.md workflow. Mechanical adaptation. |
| CMD-28 | `/tsx:health` -- Check .planning/ integrity | GSD source: 22 lines, very simple delegation to health.md workflow. Mechanical adaptation. |
| CMD-29 | `/tsx:cleanup` -- Clean up temporary files | GSD source: 18 lines, simplest command (no allowed-tools in frontmatter, no argument-hint). Mechanical adaptation. |
| CMD-30 | `/tsx:add-tests` -- Add tests to existing phase | GSD source: 41 lines, has argument-instructions field in frontmatter (unique among commands). Delegates to add-tests.md workflow. |
| CMD-31 | `/tsx:adapt-language` -- Convert TopStepX code between languages | No GSD equivalent -- TSX-specific command. Must be authored fresh following established Phase 8 patterns. Delegates to topstepx/workflows/adapt-language.md (completed Phase 6). |
| CMD-32 | `/tsx:adapt-pinescript` -- Convert PineScript strategy to TopStepX trading bot | No GSD equivalent -- TSX-specific command. Must be authored fresh following established Phase 8 patterns. Delegates to topstepx/workflows/adapt-pinescript.md (completed Phase 7). |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code Slash Commands | Current | Markdown files with YAML frontmatter in `commands/tsx/` directory | Native Claude Code command system -- `.md` files in `commands/{namespace}/` become `/namespace:command-name` |
| YAML Frontmatter | N/A | Declares command metadata (name, description, argument-hint, allowed-tools, agent) | GSD's proven cross-platform portability schema, already established in Phase 8 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx-tools.cjs | N/A (already built) | State management CLI for `.planning/` operations | Referenced in inline bash snippets within `debug.md` and `research-phase.md` commands |

### Alternatives Considered

None. This is direct continuation of Phase 8's established pattern. There are no alternatives to consider.

## Architecture Patterns

### Recommended Project Structure

After Phase 9 completion, `commands/tsx/` will contain 32 command files (12 from Phase 8 + 20 from Phase 9):

```
commands/
  tsx/
    # Phase 8 (existing)
    new-project.md        # CMD-01
    discuss-phase.md       # CMD-02
    plan-phase.md          # CMD-03
    execute-phase.md       # CMD-04
    verify-work.md         # CMD-05
    audit-milestone.md     # CMD-06
    complete-milestone.md  # CMD-07
    new-milestone.md       # CMD-08
    progress.md            # CMD-09
    resume-work.md         # CMD-10
    pause-work.md          # CMD-11
    help.md                # CMD-12

    # Phase 9: Phase Management
    add-phase.md           # CMD-13
    insert-phase.md        # CMD-14
    remove-phase.md        # CMD-15
    list-phase-assumptions.md  # CMD-16
    plan-milestone-gaps.md # CMD-17

    # Phase 9: Utilities
    map-codebase.md        # CMD-18
    quick.md               # CMD-19
    debug.md               # CMD-20
    add-todo.md            # CMD-21
    check-todos.md         # CMD-22
    settings.md            # CMD-23
    set-profile.md         # CMD-24
    update.md              # CMD-25
    research-phase.md      # CMD-26
    validate-phase.md      # CMD-27
    health.md              # CMD-28
    cleanup.md             # CMD-29
    add-tests.md           # CMD-30

    # Phase 9: TSX-Specific
    adapt-language.md      # CMD-31
    adapt-pinescript.md    # CMD-32
```

### Pattern 1: Thin Command Delegation (18 of 20 commands)

**What:** Same pattern as Phase 8. Each command file is 18-71 lines of Markdown with YAML frontmatter. The file declares metadata, loads workflow via `<execution_context>` @ references, and contains a `<process>` section that says "Execute the workflow end-to-end."

**When to use:** All simple commands (everything except debug.md and research-phase.md).

**Example (add-phase.md -- typical simple command):**

```markdown
---
name: tsx:add-phase
description: Add phase to end of current milestone in roadmap
argument-hint: <description>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Add a new integer phase to the end of the current milestone in the roadmap.

Routes to the add-phase workflow which handles:
- Phase number calculation (next sequential integer)
- Directory creation with slug generation
- Roadmap structure updates
- STATE.md roadmap evolution tracking
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/add-phase.md
</execution_context>

<context>
Arguments: $ARGUMENTS (phase description)

Roadmap and state are resolved in-workflow via `init phase-op` and targeted tool calls.
</context>

<process>
**Follow the add-phase workflow** from `@$HOME/.claude/topstepx/workflows/add-phase.md`.

The workflow handles all logic including:
1. Argument parsing and validation
2. Roadmap existence checking
3. Current milestone identification
4. Next phase number calculation (ignoring decimals)
5. Slug generation from description
6. Phase directory creation
7. Roadmap entry insertion
8. STATE.md updates
</process>
```

Source: Adapted from `~/.claude/commands/gsd/add-phase.md` (HIGH confidence)

### Pattern 2: Rich Command with Inline Orchestration (2 of 20 commands)

**What:** `debug.md` (168 lines) and `research-phase.md` (190 lines) contain significant inline orchestration logic: bash initialization snippets, multi-step processes with conditionals, agent spawning templates, checkpoint handling, and continuation agent patterns. These are NOT simple delegation commands.

**When to use:** Only debug.md and research-phase.md.

**Key adaptation points in these rich commands:**
- `gsd-tools.cjs` bash calls become `tsx-tools.cjs`
- `get-shit-done` in paths becomes `topstepx`
- `gsd-debugger` / `gsd-phase-researcher` agent references become `tsx-debugger` / `tsx-phase-researcher`
- `/gsd:plan-phase` routing becomes `/tsx:plan-phase`
- `GSD` descriptive text becomes `TSX`

**Example (research-phase.md inline bash that needs adaptation):**

```bash
# GSD version:
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "$ARGUMENTS")

# TSX version:
INIT=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" init phase-op "$ARGUMENTS")
```

```bash
# GSD version:
RESEARCHER_MODEL=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-phase-researcher --raw)

# TSX version:
RESEARCHER_MODEL=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" resolve-model tsx-phase-researcher --raw)
```

Source: Direct analysis of GSD source commands (HIGH confidence)

### Pattern 3: TSX-Specific Commands (No GSD Equivalent)

**What:** `adapt-language.md` (CMD-31) and `adapt-pinescript.md` (CMD-32) have no GSD counterparts. They must be authored fresh, following the thin-delegation pattern from Phase 8.

**When to use:** Only these 2 commands.

**Design guidance:**
- Follow the same YAML frontmatter schema as all other commands
- Use existing Phase 8 commands as structural templates (e.g., `execute-phase.md` for a command with argument-hint and workflow delegation)
- Reference the corresponding TSX-specific workflows: `topstepx/workflows/adapt-language.md` and `topstepx/workflows/adapt-pinescript.md`
- Descriptions should mention trading/TopStepX context
- allowed-tools should include Task (for agent spawning), Read, Write, Bash, Glob, Grep at minimum since these workflows spawn agents
- adapt-pinescript should reference safety-patterns.md in execution_context since the workflow enforces SAF-01 through SAF-05

**Example (adapt-language.md -- TSX-specific, fresh authoring):**

```markdown
---
name: tsx:adapt-language
description: Convert TopStepX trading bot code between supported languages
argument-hint: "<source-path> --to <target-language>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

<objective>
Convert an existing TopStepX trading bot from one supported language to another while preserving all trading logic, API integration patterns, and safety guardrails.

Routes to the adapt-language workflow which handles:
- Source code analysis and language detection
- Library mapping to target-language equivalents
- Code generation following trading build order (safety first)
- Safety verification gate (grep-based SAF pattern validation)
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/adapt-language.md
</execution_context>

<context>
Arguments: $ARGUMENTS (source path and target language)

Source analysis and language profiles are handled in-workflow.
</context>

<process>
Execute the adapt-language workflow from @$HOME/.claude/topstepx/workflows/adapt-language.md end-to-end.
Preserve all workflow gates (source analysis, library mapping, code generation, safety verification).
</process>
```

### Pattern 4: Unique Frontmatter Fields

Two commands have unique frontmatter fields not seen in typical commands:

| Command | Unique Field | Value | Notes |
|---------|-------------|-------|-------|
| `add-tests.md` | `argument-instructions` | Multi-line YAML string with parsing guidance | Only command with this field in all of GSD. Tells the model how to parse free-text arguments. |
| `cleanup.md` | (none) | No `allowed-tools`, no `argument-hint` | Simplest possible command. |

### Pattern 5: Command-to-Workflow Mapping (Phase 9)

| Command File | Workflow File | Complexity | Lines |
|-------------|--------------|------------|-------|
| `add-phase.md` | `topstepx/workflows/add-phase.md` | Simple | ~43 |
| `insert-phase.md` | `topstepx/workflows/insert-phase.md` | Simple | ~32 |
| `remove-phase.md` | `topstepx/workflows/remove-phase.md` | Simple | ~31 |
| `list-phase-assumptions.md` | `topstepx/workflows/list-phase-assumptions.md` | Simple | ~46 |
| `plan-milestone-gaps.md` | `topstepx/workflows/plan-milestone-gaps.md` | Simple | ~34 |
| `map-codebase.md` | `topstepx/workflows/map-codebase.md` | Medium | ~71 |
| `quick.md` | `topstepx/workflows/quick.md` | Simple | ~45 |
| `debug.md` | `topstepx/workflows/debug.md` (note: GSD has no separate debug workflow -- logic is inline) | **Rich** | ~168 |
| `add-todo.md` | `topstepx/workflows/add-todo.md` | Simple | ~47 |
| `check-todos.md` | `topstepx/workflows/check-todos.md` | Simple | ~45 |
| `settings.md` | `topstepx/workflows/settings.md` | Simple | ~36 |
| `set-profile.md` | `topstepx/workflows/set-profile.md` | Simple | ~34 |
| `update.md` | `topstepx/workflows/update.md` | Simple | ~37 |
| `research-phase.md` | `topstepx/workflows/research-phase.md` (note: GSD keeps logic inline in command, not workflow) | **Rich** | ~190 |
| `validate-phase.md` | `topstepx/workflows/validate-phase.md` | Simple | ~35 |
| `health.md` | `topstepx/workflows/health.md` | Simple | ~22 |
| `cleanup.md` | `topstepx/workflows/cleanup.md` | Simple | ~18 |
| `add-tests.md` | `topstepx/workflows/add-tests.md` | Simple | ~41 |
| `adapt-language.md` | `topstepx/workflows/adapt-language.md` | Simple (new) | ~30 est. |
| `adapt-pinescript.md` | `topstepx/workflows/adapt-pinescript.md` | Simple (new) | ~35 est. |

**Critical note on debug.md and research-phase.md:** In GSD, these commands contain their orchestration logic INLINE (not delegated to a workflow). However, TSX has corresponding workflow files (`topstepx/workflows/debug.md` and `topstepx/workflows/research-phase.md`) that were created during Phase 4 naming adaptation. The TSX commands should follow the same inline pattern as GSD to maintain structural fidelity, with the `<execution_context>` referencing the workflow file for context while keeping the orchestration steps inline in the `<process>` section.

### Anti-Patterns to Avoid

- **Logic in simple commands:** Only `debug.md` and `research-phase.md` should have inline process logic. The other 18 commands must delegate everything to workflows.
- **Hardcoded user-specific paths:** Use `$HOME/.claude/topstepx/` not `C:/Users/bkevi/.claude/topstepx/`.
- **Duplicating workflow content:** Simple commands should NOT repeat the workflow's step descriptions.
- **GSD references in TSX commands:** All `/gsd:` routing, `get-shit-done` paths, `gsd-tools.cjs`, `gsd-*` agent names must be replaced.
- **Skipping `argument-instructions` on add-tests:** This unique frontmatter field from GSD must be preserved as it tells the model how to parse the phase number from free-text arguments.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Command structure | Custom format | GSD's exact YAML frontmatter + XML sections format | Cross-platform portability already proven |
| Workflow logic | Inline in commands | Existing workflows in `topstepx/workflows/` | Workflows already built in Phases 4-7 |
| Tool permissions | Per-command custom lists | Copy GSD command's `allowed-tools` list exactly | GSD has battle-tested which tools each command needs |
| Path resolution | Custom path logic | `$HOME/.claude/topstepx/` canonical prefix | GSD's proven approach, Phase 10 installer handles rewriting |
| TSX-specific command design | Novel patterns | Phase 8 command structure as template | Consistency matters more than optimization |

**Key insight:** 18 of 20 commands are pure mechanical adaptation (find-replace naming). Only `debug.md` and `research-phase.md` require careful attention due to their inline bash and agent spawning logic. The 2 TSX-specific commands are fresh authoring but follow the simple-delegation pattern which is well-established.

## Common Pitfalls

### Pitfall 1: Incomplete Adaptation of debug.md Inline Bash

**What goes wrong:** `debug.md` has 4 inline bash blocks referencing `gsd-tools.cjs` and `gsd-debugger`. Missing even one creates a runtime failure.
**Why it happens:** The command is 168 lines with interleaved markdown and code blocks. Easy to miss a reference buried in a template string.
**How to avoid:** After creating the file, run `grep -n "gsd\|get-shit-done" commands/tsx/debug.md` and fix every match. Known GSD references in debug.md: `gsd-tools.cjs` (2 occurrences), `gsd-debugger` (4 occurrences), `/gsd:plan-phase` (1 occurrence), `get-shit-done` (2 path references).
**Warning signs:** Debug command fails with "command not found" for gsd-tools.cjs or spawns wrong agent type.

### Pitfall 2: Incomplete Adaptation of research-phase.md Inline Bash

**What goes wrong:** `research-phase.md` has 5+ inline bash blocks referencing `gsd-tools.cjs` and `gsd-phase-researcher`. Missing any one breaks the command.
**Why it happens:** The command is 190 lines with complex agent spawning templates that embed tool paths and agent names in template strings.
**How to avoid:** After creating the file, run `grep -n "gsd\|get-shit-done" commands/tsx/research-phase.md`. Known GSD references: `gsd-tools.cjs` (3 occurrences), `gsd-phase-researcher` (4+ occurrences), `/gsd:plan-phase` (1 occurrence), `get-shit-done` (3+ path references), `GSD` descriptive text (multiple).
**Warning signs:** Research command fails to initialize or spawns wrong agent type.

### Pitfall 3: GSD Naming Leaks in Body Text

**What goes wrong:** Command frontmatter is correct but body text references GSD commands/tools/agents.
**Why it happens:** Commands like `map-codebase.md`, `plan-milestone-gaps.md`, and `quick.md` reference `/gsd:new-project`, `/gsd:plan-phase`, `/gsd:audit-milestone`, `gsd-planner`, `gsd-executor`, `gsd-codebase-mapper` in their body text.
**How to avoid:** Grep every file for `gsd` after creation. Body text naming leaks are the most commonly missed category.
**Warning signs:** Commands work but route users to `/gsd:*` commands instead of `/tsx:*`.

### Pitfall 4: Missing `argument-instructions` on add-tests.md

**What goes wrong:** `add-tests` doesn't parse its argument correctly (expects phase number + optional free text).
**Why it happens:** `argument-instructions` is a rare frontmatter field only used by `add-tests.md`. Easy to miss during mechanical adaptation.
**How to avoid:** Copy the `argument-instructions` field verbatim from GSD, only replacing `/gsd:add-tests` with `/tsx:add-tests` in examples.
**Warning signs:** add-tests command treats the entire argument string as a phase number instead of parsing it.

### Pitfall 5: Forgetting `cleanup.md` Has No allowed-tools

**What goes wrong:** Adding `allowed-tools` to cleanup.md when GSD's version intentionally omits it.
**Why it happens:** Pattern assumption that every command needs allowed-tools.
**How to avoid:** Check GSD source for each command. `cleanup.md` and `help.md` (Phase 8) both omit allowed-tools intentionally.
**Warning signs:** No functional impact, but diverges from GSD pattern without reason.

### Pitfall 6: TSX-Specific Commands Missing Agent Spawning Tools

**What goes wrong:** `adapt-language.md` or `adapt-pinescript.md` can't spawn subagents because `Task` is missing from allowed-tools.
**Why it happens:** Fresh-authored commands without GSD source to copy from. Developer forgets that workflows spawn agents.
**How to avoid:** Check the workflow file to see if it uses `Task()` calls. Both adapt-language and adapt-pinescript workflows spawn agents, so `Task` must be in allowed-tools.
**Warning signs:** Command fails when workflow tries to spawn tsx-executor or tsx-verifier subagent.

## Code Examples

### Example 1: Simple Phase Management Command (insert-phase.md)

```markdown
---
name: tsx:insert-phase
description: Insert urgent work as decimal phase (e.g., 72.1) between existing phases
argument-hint: <after> <description>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Insert a decimal phase for urgent work discovered mid-milestone that must be completed between existing integer phases.

Uses decimal numbering (72.1, 72.2, etc.) to preserve the logical sequence of planned phases while accommodating urgent insertions.

Purpose: Handle urgent work discovered during execution without renumbering entire roadmap.
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/insert-phase.md
</execution_context>

<context>
Arguments: $ARGUMENTS (format: <after-phase-number> <description>)

Roadmap and state are resolved in-workflow via `init phase-op` and targeted tool calls.
</context>

<process>
Execute the insert-phase workflow from @$HOME/.claude/topstepx/workflows/insert-phase.md end-to-end.
Preserve all validation gates (argument parsing, phase verification, decimal calculation, roadmap updates).
</process>
```

Source: Adapted from `~/.claude/commands/gsd/insert-phase.md` (HIGH confidence)

### Example 2: Medium Command with Extra Sections (map-codebase.md)

```markdown
---
name: tsx:map-codebase
description: Analyze codebase with parallel mapper agents to produce .planning/codebase/ documents
argument-hint: "[optional: specific area to map, e.g., 'api' or 'auth']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

<objective>
Analyze existing codebase using parallel tsx-codebase-mapper agents to produce structured codebase documents.

Each mapper agent explores a focus area and **writes documents directly** to `.planning/codebase/`. The orchestrator only receives confirmations, keeping context usage minimal.

Output: .planning/codebase/ folder with 7 structured documents about the codebase state.
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/map-codebase.md
</execution_context>

<context>
Focus area: $ARGUMENTS (optional - if provided, tells agents to focus on specific subsystem)

**Load project state if exists:**
Check for .planning/STATE.md - loads context if project already initialized

**This command can run:**
- Before /tsx:new-project (brownfield codebases) - creates codebase map first
- After /tsx:new-project (greenfield codebases) - updates codebase map as code evolves
- Anytime to refresh codebase understanding
</context>

<when_to_use>
**Use map-codebase for:**
- Brownfield projects before initialization (understand existing code first)
- Refreshing codebase map after significant changes
- Onboarding to an unfamiliar codebase
- Before major refactoring (understand current state)
- When STATE.md references outdated codebase info

**Skip map-codebase for:**
- Greenfield projects with no code yet (nothing to map)
- Trivial codebases (<5 files)
</when_to_use>

<process>
1. Check if .planning/codebase/ already exists (offer to refresh or skip)
2. Create .planning/codebase/ directory structure
3. Spawn 4 parallel tsx-codebase-mapper agents:
   - Agent 1: tech focus -> writes STACK.md, INTEGRATIONS.md
   - Agent 2: arch focus -> writes ARCHITECTURE.md, STRUCTURE.md
   - Agent 3: quality focus -> writes CONVENTIONS.md, TESTING.md
   - Agent 4: concerns focus -> writes CONCERNS.md
4. Wait for agents to complete, collect confirmations (NOT document contents)
5. Verify all 7 documents exist with line counts
6. Commit codebase map
7. Offer next steps (typically: /tsx:new-project or /tsx:plan-phase)
</process>

<success_criteria>
- [ ] .planning/codebase/ directory created
- [ ] All 7 codebase documents written by mapper agents
- [ ] Documents follow template structure
- [ ] Parallel agents completed without errors
- [ ] User knows next steps
</success_criteria>
```

Source: Adapted from `~/.claude/commands/gsd/map-codebase.md` (HIGH confidence)

### Example 3: Rich Command Inline Bash Adaptation (debug.md excerpt)

The key adaptation points in debug.md's `<process>` section:

```markdown
## 0. Initialize Context

```bash
INIT=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extract `commit_docs` from init JSON. Resolve debugger model:
```bash
debugger_model=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" resolve-model tsx-debugger --raw)
```

## 3. Spawn tsx-debugger Agent

```
Task(
  prompt=filled_prompt,
  subagent_type="tsx-debugger",
  model="{debugger_model}",
  description="Debug {slug}"
)
```
```

Source: Adapted from `~/.claude/commands/gsd/debug.md` (HIGH confidence)

### Example 4: Command with argument-instructions (add-tests.md)

```markdown
---
name: tsx:add-tests
description: Generate tests for a completed phase based on UAT criteria and implementation
argument-hint: "<phase> [additional instructions]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
argument-instructions: |
  Parse the argument as a phase number (integer, decimal, or letter-suffix), plus optional free-text instructions.
  Example: /tsx:add-tests 12
  Example: /tsx:add-tests 12 focus on edge cases in the pricing module
---
```

Source: Adapted from `~/.claude/commands/gsd/add-tests.md` frontmatter (HIGH confidence)

## Naming Replacement Reference

Complete substitution table (extends Phase 8 research, adding Phase 9-specific patterns):

| GSD Pattern | TSX Replacement | Where Found |
|-------------|----------------|-------------|
| `gsd:` (in `name:` field) | `tsx:` | YAML frontmatter |
| `gsd:` (in routing text like "Run /gsd:plan-phase") | `tsx:` | Body text, `<objective>`, `<process>` |
| `get-shit-done` (in `@` reference paths) | `topstepx` | `<execution_context>`, `<process>` |
| `gsd-tools.cjs` (in bash snippets) | `tsx-tools.cjs` | `<process>` (debug, research-phase) |
| `gsd-debugger` (agent reference) | `tsx-debugger` | debug.md `<process>` (4 occurrences) |
| `gsd-phase-researcher` (agent reference) | `tsx-phase-researcher` | research-phase.md `<process>` (4+ occurrences) |
| `gsd-planner` (agent reference) | `tsx-planner` | quick.md `<objective>` text |
| `gsd-executor` (agent reference) | `tsx-executor` | quick.md `<objective>` text |
| `gsd-codebase-mapper` (agent reference) | `tsx-codebase-mapper` | map-codebase.md `<process>` text |
| `/gsd:audit-milestone` (routing) | `/tsx:audit-milestone` | plan-milestone-gaps.md body |
| `/gsd:new-project` (routing) | `/tsx:new-project` | map-codebase.md process |
| `/gsd:plan-phase` (routing) | `/tsx:plan-phase` | map-codebase, research-phase, debug body |
| `/gsd:add-phase` (routing) | `/tsx:add-phase` | plan-milestone-gaps.md body |
| `GSD` (descriptive text) | `TSX` | settings, set-profile, update, quick descriptions |
| `~/.gsd/` (user config path) | `~/.tsx/` | settings.md config path references |

## Complexity Classification

Commands are classified into three tiers based on adaptation complexity:

### Tier 1: Simple Thin Delegation (16 commands)

Lines: 18-47. Pure mechanical naming adaptation. Zero creative decisions.

| Command | Lines | Special Notes |
|---------|-------|---------------|
| `add-phase.md` | 43 | - |
| `insert-phase.md` | 32 | - |
| `remove-phase.md` | 31 | Has Glob in allowed-tools |
| `list-phase-assumptions.md` | 46 | Has success_criteria section |
| `plan-milestone-gaps.md` | 34 | References /gsd:audit-milestone, /gsd:add-phase |
| `quick.md` | 45 | References gsd-planner, gsd-executor in text |
| `add-todo.md` | 47 | - |
| `check-todos.md` | 45 | - |
| `settings.md` | 36 | Description says "GSD workflow toggles" |
| `set-profile.md` | 34 | Description says "GSD agents" |
| `update.md` | 37 | Description says "GSD" |
| `validate-phase.md` | 35 | - |
| `health.md` | 22 | - |
| `cleanup.md` | 18 | No allowed-tools, no argument-hint |
| `add-tests.md` | 41 | Has argument-instructions field |
| `adapt-pinescript.md` | ~35 est. | TSX-specific, fresh authoring |

### Tier 2: Medium (2 commands)

Lines: 30-71. Has extra sections (when_to_use, success_criteria) or requires fresh authoring with workflow analysis.

| Command | Lines | Special Notes |
|---------|-------|---------------|
| `map-codebase.md` | 71 | Has when_to_use section, success_criteria, references gsd-codebase-mapper |
| `adapt-language.md` | ~30 est. | TSX-specific, fresh authoring, needs workflow analysis for tools |

### Tier 3: Rich / Complex (2 commands)

Lines: 168-190. Contains inline bash, agent spawning templates, checkpoint handling. Requires careful line-by-line adaptation.

| Command | Lines | Special Notes |
|---------|-------|---------------|
| `debug.md` | 168 | Inline bash (gsd-tools.cjs state load, resolve-model), agent spawning templates, checkpoint handling |
| `research-phase.md` | 190 | Inline bash (gsd-tools.cjs init phase-op, resolve-model), agent spawning templates, continuation agents |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Commands with inline logic | Commands as thin delegation to workflows | GSD architecture (current) | Commands are stable API surface; workflows are mutable implementation |
| Hardcoded absolute paths | Canonical `$HOME/.claude/` prefix with installer rewrite | GSD installer pattern (current) | Cross-platform portability |

**Deprecated/outdated:**
- None. The GSD command pattern is the current standard and TSX follows it exactly.

## Open Questions

1. **debug.md Workflow vs Inline Pattern**
   - What we know: GSD's `debug.md` has ALL orchestration logic inline (168 lines) rather than delegating to a workflow. TSX has `topstepx/workflows/debug.md` from Phase 4 adaptation, but the GSD command doesn't reference a separate debug workflow -- it IS the workflow.
   - What's unclear: Should TSX's `debug.md` command keep inline logic (matching GSD exactly) or delegate to the workflow file? The workflow file exists but may just be the naming-adapted content of GSD's inline logic.
   - Recommendation: Keep inline logic in the command (matching GSD's pattern) and reference the workflow in `<execution_context>` for context loading only. This preserves structural fidelity with GSD.

2. **research-phase.md Same Question**
   - What we know: Same situation as debug.md. GSD keeps all logic inline. TSX has the workflow file.
   - Recommendation: Same as debug.md -- keep inline logic, reference workflow for context.

3. **adapt-pinescript.md Additional References**
   - What we know: The adapt-pinescript workflow enforces SAF-01 through SAF-05 and references PINESCRIPT.md.
   - What's unclear: Whether the command's `<execution_context>` should load safety-patterns.md and PINESCRIPT.md in addition to the workflow, or whether the workflow handles its own reference loading.
   - Recommendation: Keep the command simple (just reference the workflow). The workflow handles its own reference loading. This matches how Phase 8 commands like `new-project.md` selectively load additional references, but most commands just load the workflow.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual verification (static Markdown content, no executable code) |
| Config file | None -- commands are Markdown files, not executable code |
| Quick run command | `ls commands/tsx/*.md \| wc -l` (should equal 32 after Phase 9) |
| Full suite command | `grep -r "gsd\|get-shit-done" commands/tsx/ --include="*.md"` (should return 0 matches) |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CMD-13 | `/tsx:add-phase` exists with correct frontmatter | smoke | `grep "name: tsx:add-phase" commands/tsx/add-phase.md` | Wave 0 |
| CMD-14 | `/tsx:insert-phase` exists with correct frontmatter | smoke | `grep "name: tsx:insert-phase" commands/tsx/insert-phase.md` | Wave 0 |
| CMD-15 | `/tsx:remove-phase` exists with correct frontmatter | smoke | `grep "name: tsx:remove-phase" commands/tsx/remove-phase.md` | Wave 0 |
| CMD-16 | `/tsx:list-phase-assumptions` exists | smoke | `grep "name: tsx:list-phase-assumptions" commands/tsx/list-phase-assumptions.md` | Wave 0 |
| CMD-17 | `/tsx:plan-milestone-gaps` exists | smoke | `grep "name: tsx:plan-milestone-gaps" commands/tsx/plan-milestone-gaps.md` | Wave 0 |
| CMD-18 | `/tsx:map-codebase` references tsx-codebase-mapper | smoke | `grep "tsx-codebase-mapper" commands/tsx/map-codebase.md` | Wave 0 |
| CMD-19 | `/tsx:quick` references tsx-planner | smoke | `grep "tsx-planner" commands/tsx/quick.md` | Wave 0 |
| CMD-20 | `/tsx:debug` uses tsx-tools.cjs and tsx-debugger | smoke | `grep "tsx-tools.cjs" commands/tsx/debug.md && grep "tsx-debugger" commands/tsx/debug.md` | Wave 0 |
| CMD-21 | `/tsx:add-todo` exists | smoke | `grep "name: tsx:add-todo" commands/tsx/add-todo.md` | Wave 0 |
| CMD-22 | `/tsx:check-todos` exists | smoke | `grep "name: tsx:check-todos" commands/tsx/check-todos.md` | Wave 0 |
| CMD-23 | `/tsx:settings` description says TSX not GSD | smoke | `grep -i "TSX" commands/tsx/settings.md` | Wave 0 |
| CMD-24 | `/tsx:set-profile` description says TSX not GSD | smoke | `grep -i "TSX" commands/tsx/set-profile.md` | Wave 0 |
| CMD-25 | `/tsx:update` description says TSX not GSD | smoke | `grep -i "TSX" commands/tsx/update.md` | Wave 0 |
| CMD-26 | `/tsx:research-phase` uses tsx-tools.cjs and tsx-phase-researcher | smoke | `grep "tsx-tools.cjs" commands/tsx/research-phase.md && grep "tsx-phase-researcher" commands/tsx/research-phase.md` | Wave 0 |
| CMD-27 | `/tsx:validate-phase` exists | smoke | `grep "name: tsx:validate-phase" commands/tsx/validate-phase.md` | Wave 0 |
| CMD-28 | `/tsx:health` exists | smoke | `grep "name: tsx:health" commands/tsx/health.md` | Wave 0 |
| CMD-29 | `/tsx:cleanup` exists, no allowed-tools | smoke | `grep "name: tsx:cleanup" commands/tsx/cleanup.md && grep -c "allowed-tools" commands/tsx/cleanup.md` (count=0) | Wave 0 |
| CMD-30 | `/tsx:add-tests` has argument-instructions | smoke | `grep "argument-instructions" commands/tsx/add-tests.md` | Wave 0 |
| CMD-31 | `/tsx:adapt-language` delegates to adapt-language workflow | smoke | `grep "topstepx/workflows/adapt-language.md" commands/tsx/adapt-language.md` | Wave 0 |
| CMD-32 | `/tsx:adapt-pinescript` delegates to adapt-pinescript workflow | smoke | `grep "topstepx/workflows/adapt-pinescript.md" commands/tsx/adapt-pinescript.md` | Wave 0 |
| ALL | No GSD naming leaks in any Phase 9 command | integration | `grep -rn "gsd\|get-shit-done" commands/tsx/add-phase.md commands/tsx/insert-phase.md commands/tsx/remove-phase.md commands/tsx/list-phase-assumptions.md commands/tsx/plan-milestone-gaps.md commands/tsx/map-codebase.md commands/tsx/quick.md commands/tsx/debug.md commands/tsx/add-todo.md commands/tsx/check-todos.md commands/tsx/settings.md commands/tsx/set-profile.md commands/tsx/update.md commands/tsx/research-phase.md commands/tsx/validate-phase.md commands/tsx/health.md commands/tsx/cleanup.md commands/tsx/add-tests.md commands/tsx/adapt-language.md commands/tsx/adapt-pinescript.md` | Wave 0 |
| ALL | Total command count is 32 | integration | `ls commands/tsx/*.md \| wc -l` (should equal 32) | Wave 0 |
| ALL | All workflow files referenced by commands exist | integration | Parse `@` references, verify each file in `topstepx/workflows/` | Wave 0 |

### Sampling Rate

- **Per task commit:** `grep -rn "gsd\|get-shit-done" commands/tsx/{files-in-task}` (zero matches required)
- **Per wave merge:** Full suite -- verify total file count, zero GSD leaks, all workflow references valid
- **Phase gate:** All 32 commands exist (12 Phase 8 + 20 Phase 9), zero GSD naming leaks across entire `commands/tsx/` directory, all referenced workflow files exist

### Wave 0 Gaps

- [ ] 20 command `.md` files in `commands/tsx/` -- none exist yet for Phase 9

*(No test framework needed -- these are static Markdown files verified by grep/wc commands)*

## Recommended Plan Structure

Based on complexity analysis, recommend 3 plans:

### Plan 1: Phase Management + TSX-Specific Commands (7 commands)
- 5 phase management: add-phase, insert-phase, remove-phase, list-phase-assumptions, plan-milestone-gaps (all Tier 1)
- 2 TSX-specific: adapt-language, adapt-pinescript (Tier 1-2, fresh authoring)
- Rationale: Phase management commands are the simplest group. TSX-specific commands are small but need fresh authoring -- pairing with the simplest adaptations keeps the plan balanced.
- Estimated output: ~250 lines across 7 files

### Plan 2: Simple Utility Commands (11 commands)
- 11 utilities: map-codebase, quick, add-todo, check-todos, settings, set-profile, update, validate-phase, health, cleanup, add-tests
- Rationale: All are Tier 1-2 simple adaptations. Grouping all simple utilities together allows batch processing.
- Estimated output: ~450 lines across 11 files (map-codebase is the largest at 71 lines)

### Plan 3: Rich Utility Commands (2 commands) + Full Validation
- 2 rich commands: debug, research-phase (Tier 3)
- Cross-plan validation of all 32 commands (12 Phase 8 + 20 Phase 9)
- Rationale: These 2 commands need line-by-line adaptation with careful attention to inline bash, agent spawning templates, and checkpoint handling. Isolating them ensures they get focused quality attention. Final validation confirms entire command surface.
- Estimated output: ~360 lines across 2 files

## Sources

### Primary (HIGH confidence)

- Direct analysis of all 20 GSD source command files at `~/.claude/commands/gsd/` -- exact frontmatter schemas, section patterns, tool lists, line counts, inline bash patterns
- Direct analysis of all TSX workflow files at `topstepx/workflows/` -- verified all 20 target workflows exist
- Phase 8 RESEARCH.md -- established patterns, naming replacement table, anti-patterns
- Phase 8 PLAN and SUMMARY files -- confirmed established execution approach (2 plans, 3min + 5min, zero deviations)
- `.planning/REQUIREMENTS.md` -- confirmed exact 20 command names and descriptions (CMD-13 through CMD-32)

### Secondary (MEDIUM confidence)

- Phase 8 established conventions -- inline process preservation for discuss-phase and complete-milestone (both retained full process content for self-contained execution)
- STATE.md accumulated decisions -- confirmed all prior phases' naming and path conventions

### Tertiary (LOW confidence)

- Workflow file existence for debug.md and research-phase.md -- these workflow files exist in `topstepx/workflows/` but may contain the same inline logic as the GSD commands (Phase 4 naming adaptation). Need to verify whether commands should keep inline logic or truly delegate.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- identical to Phase 8, no new technology
- Architecture: HIGH -- 18/20 commands are direct GSD adaptations with source files fully analyzed, 2/20 are fresh authoring following established patterns
- Pitfalls: HIGH -- identified from direct comparison of GSD source with known adaptation gotchas from Phase 8 experience
- Complexity classification: HIGH -- every GSD source command line-counted and categorized
- Validation: HIGH -- static Markdown files verifiable with grep/wc

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable -- Markdown file format does not change)
