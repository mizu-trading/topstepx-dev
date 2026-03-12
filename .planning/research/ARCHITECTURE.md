# Architecture Patterns

**Domain:** GSD-style AI trading skill framework (TSX)
**Researched:** 2026-03-11
**Confidence:** HIGH (derived from direct analysis of GSD source code at `/tmp/get-shit-done`)

## GSD Architecture Model (Source of Truth)

TSX adapts GSD's architecture. GSD has four component layers, each with a distinct role:

```
User types "/gsd:new-project"
    |
    v
COMMAND (commands/gsd/new-project.md)
    - YAML frontmatter: name, description, allowed-tools
    - <execution_context>: @ references to workflow + references
    - <process>: "Execute the workflow end-to-end"
    |
    v
WORKFLOW (get-shit-done/workflows/new-project.md)
    - Step-by-step orchestration logic
    - Uses gsd-tools.cjs CLI for state/config
    - Spawns AGENTS via Task() for parallel work
    - Gates: validation, approval, commits, routing
    |
    v
AGENT (agents/gsd-executor.md)
    - YAML frontmatter: name, description, tools, color
    - <role>: what it does, when spawned
    - <execution_flow>: detailed step-by-step behavior
    - Reads TEMPLATES + REFERENCES for context
    |
    v
TEMPLATES + REFERENCES (get-shit-done/templates/, references/)
    - Templates: output format standards (Markdown/JSON)
    - References: domain knowledge (non-executable docs)
    - Loaded by agents/workflows via @ references
```

**Key insight from GSD source:** Commands are thin entry points (20-40 lines). Workflows contain the orchestration logic (100-300 lines). Agents contain the execution intelligence (200-800 lines). Templates/references are passive content loaded on demand.

## Recommended TSX Architecture

### Directory Structure

```
topstepx-skill/
├── bin/
│   └── install.js              # Adapted installer (copies all components)
├── commands/
│   └── tsx/                    # /tsx:* command entry points
│       ├── new-project.md      # Initialize trading bot project
│       ├── adapt-language.md   # Convert code between languages
│       ├── adapt-pinescript.md # Convert PineScript to TopStepX
│       ├── execute-phase.md    # Execute phase plans (from GSD)
│       ├── plan-phase.md       # Plan a phase (from GSD)
│       ├── verify-work.md      # Verify completed work (from GSD)
│       ├── progress.md         # Check project progress (from GSD)
│       └── help.md             # List TSX commands
├── agents/
│   ├── tsx-executor.md         # Executes plans (adapted from gsd-executor)
│   ├── tsx-planner.md          # Creates plans (adapted from gsd-planner)
│   ├── tsx-researcher.md       # Researches domain (adapted from gsd-project-researcher)
│   ├── tsx-verifier.md         # Verifies work (adapted from gsd-verifier)
│   └── tsx-debugger.md         # Debugs issues (adapted from gsd-debugger)
├── topstepx/                   # Equivalent of GSD's get-shit-done/ directory
│   ├── workflows/
│   │   ├── new-project.md      # Full scratch workflow
│   │   ├── adapt-language.md   # Language adaptation workflow
│   │   ├── adapt-pinescript.md # PineScript conversion workflow
│   │   ├── execute-phase.md    # Phase execution (from GSD)
│   │   ├── execute-plan.md     # Plan execution (from GSD)
│   │   ├── plan-phase.md       # Phase planning (from GSD)
│   │   └── verify-work.md      # Verification (from GSD)
│   ├── templates/
│   │   ├── project.md          # TSX project template
│   │   ├── strategy-spec.md    # Trading strategy specification
│   │   ├── risk-params.md      # Risk parameter template
│   │   ├── integration-plan.md # API integration plan template
│   │   ├── backtest-report.md  # Backtest results template
│   │   ├── roadmap.md          # Roadmap template (from GSD)
│   │   ├── state.md            # State tracking (from GSD)
│   │   └── summary.md          # Execution summary (from GSD)
│   ├── references/
│   │   ├── TOPSTEPX_API.md     # Full API reference (existing)
│   │   ├── rest-api.md         # REST endpoint details (existing)
│   │   ├── realtime.md         # SignalR reference (existing)
│   │   ├── enums.md            # Enum definitions (existing)
│   │   └── PINESCRIPT.md       # PineScript v6 reference (new)
│   └── bin/
│       └── tsx-tools.cjs       # CLI utilities (adapted from gsd-tools.cjs)
├── skills/
│   └── topstepx-api/           # PRESERVED — existing skill (backward compat)
│       ├── SKILL.md
│       └── references/
├── package.json
├── README.md
└── LICENSE
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Commands** (`commands/tsx/`) | Thin entry points. Parse args, reference workflow + context files, delegate to workflow. | Workflows (via `<execution_context>` @ refs) |
| **Workflows** (`topstepx/workflows/`) | Orchestration logic. Step sequencing, gating, agent spawning, state transitions. | Agents (via `Task()`), tsx-tools.cjs (via `Bash`), Templates (via @ refs) |
| **Agents** (`agents/`) | Execution intelligence. Read context, do work, produce output, commit. | References (via `Read`), Templates (via `Read`), filesystem (via `Write/Edit`) |
| **Templates** (`topstepx/templates/`) | Output format standards. Define what artifacts look like. | Passive — loaded by agents and workflows |
| **References** (`topstepx/references/`) | Domain knowledge. API docs, PineScript reference. | Passive — loaded by agents |
| **tsx-tools.cjs** (`topstepx/bin/`) | CLI utility. State management, config, phase/plan indexing. | Filesystem (reads/writes `.planning/`) |
| **Installer** (`bin/install.js`) | Copies commands, agents, topstepx/, skills/ to target platform dirs. | Filesystem only |
| **Skills** (`skills/topstepx-api/`) | Backward-compatible simple skill for non-framework usage. | Passive — loaded by AI platforms directly |

### Data Flow: `/tsx:new-project` (From Scratch)

```
1. User: "/tsx:new-project"
2. Command: commands/tsx/new-project.md
   - Loads: topstepx/workflows/new-project.md
   - Loads: topstepx/references/questioning.md (if created)
3. Workflow: topstepx/workflows/new-project.md
   a. Init: tsx-tools.cjs init new-project → JSON context
   b. Question user: What to trade? Strategy type? Risk tolerance? Languages?
   c. Spawn tsx-researcher (via Task) → research trading domain + libraries
   d. Write .planning/PROJECT.md (trading-specialized project doc)
   e. Write .planning/REQUIREMENTS.md (with trading-specific requirements)
   f. Spawn tsx-roadmapper (or use GSD's) → .planning/ROADMAP.md
   g. Write .planning/STATE.md
   h. Commit planning docs
   i. Route: "Run /tsx:plan-phase 1"
```

### Data Flow: `/tsx:adapt-pinescript`

```
1. User: "/tsx:adapt-pinescript @my-strategy.pine"
2. Command: commands/tsx/adapt-pinescript.md
   - Loads: topstepx/workflows/adapt-pinescript.md
   - Loads: topstepx/references/PINESCRIPT.md
   - Loads: topstepx/references/TOPSTEPX_API.md
3. Workflow: topstepx/workflows/adapt-pinescript.md
   a. Init: tsx-tools.cjs init adapt-pinescript → JSON context
   b. Parse PineScript: Extract strategy logic, indicators, entry/exit rules
   c. Question user: Target language? Risk params? Account type?
   d. Map PineScript concepts → TopStepX API calls:
      - strategy.entry() → POST /api/Order/place
      - strategy.exit() → POST /api/Position/closeContract
      - ta.sma() → local calculation or historical bars
      - alertcondition() → SignalR event-driven logic
   e. Write .planning/PROJECT.md (with PineScript analysis)
   f. Generate roadmap phases:
      Phase 1: Auth + account setup
      Phase 2: Market data + indicator calculation
      Phase 3: Signal generation (port PineScript logic)
      Phase 4: Order execution + position management
      Phase 5: Risk management + error handling
      Phase 6: Testing + validation
   g. Route: standard /tsx:plan-phase → /tsx:execute-phase cycle
```

### Data Flow: `/tsx:adapt-language`

```
1. User: "/tsx:adapt-language @python-bot/ --to rust"
2. Command: commands/tsx/adapt-language.md
   - Loads: topstepx/workflows/adapt-language.md
   - Loads: topstepx/references/TOPSTEPX_API.md
3. Workflow: topstepx/workflows/adapt-language.md
   a. Analyze source code: identify API calls, patterns, architecture
   b. Map source patterns to target language equivalents
   c. Question user: Target framework preferences? Async model?
   d. Generate roadmap (typically 3-4 phases):
      Phase 1: Project setup + auth
      Phase 2: Core API client (REST + WebSocket)
      Phase 3: Strategy logic port
      Phase 4: Testing + validation
   e. Route: standard plan/execute cycle
```

## Patterns to Follow

### Pattern 1: Command as Thin Delegation

**What:** Commands are 20-40 line Markdown files that declare metadata, load context, and delegate to a workflow. Zero logic in the command itself.

**Why:** GSD's proven pattern. Commands are the "API surface" — stable, discoverable. Workflows are the "implementation" — can change freely.

**Structure:**
```markdown
---
name: tsx:new-project
description: Initialize a new TopStepX trading bot project
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<execution_context>
@~/.claude/topstepx/workflows/new-project.md
@~/.claude/topstepx/references/TOPSTEPX_API.md
</execution_context>

<process>
Execute the new-project workflow end-to-end.
</process>
```

### Pattern 2: Workflow Orchestration with State

**What:** Workflows use tsx-tools.cjs for state management and spawn agents for parallel work. They control the sequence; agents do the work.

**Why:** Keeps orchestration separate from execution. Enables parallel agent spawning (GSD's wave-based execution model).

**Key elements from GSD:**
- `tsx-tools.cjs init <command>` returns JSON context (project state, config, paths)
- Workflows read STATE.md for continuity across sessions
- Workflows gate on user approval before proceeding
- Workflows commit planning docs as atomic units

### Pattern 3: Agent Context Loading via files_to_read

**What:** When workflows spawn agents via Task(), they pass a `<files_to_read>` block listing every file the agent needs. The agent reads all listed files before doing anything.

**Why:** Agents run in fresh context. Without explicit file loading, they'd miss critical project state.

### Pattern 4: Reference Layering

**What:** API reference is split into tiers: SKILL.md (summary, ~200 lines) loaded automatically, references/*.md (detailed, ~1100 lines total) loaded on demand by agents.

**Why:** Context budget management. Agents load only what they need. The full API reference is ~1300 lines; loading it all for every task wastes context.

**TSX layering:**
- Tier 1 (always loaded): TOPSTEPX_API.md summary in SKILL.md (~200 lines)
- Tier 2 (loaded by agents working on API integration): rest-api.md, realtime.md, enums.md
- Tier 3 (loaded for PineScript workflow only): PINESCRIPT.md

### Pattern 5: Path Replacement in Installer

**What:** GSD's installer replaces `~/.claude/` path prefixes in all Markdown content with the actual install path. This makes @ references work regardless of install location (global vs local, Claude vs OpenCode vs Codex).

**Why:** Content is authored with `~/.claude/` as canonical paths. Installer rewrites for the target platform. One source, many targets.

**TSX equivalent:** Replace `~/.claude/topstepx/` with actual install path. The `topstepx/` directory name (parallel to GSD's `get-shit-done/`) must be consistent.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Logic in Commands

**What:** Putting orchestration steps, conditionals, or agent spawning directly in command files.

**Why bad:** Commands become fragile, hard to maintain, and platform-specific. If a command needs different behavior on OpenCode vs Claude, you'd need to fork commands.

**Instead:** Commands reference workflows. Workflows contain all logic. Installer handles platform differences at install time.

### Anti-Pattern 2: Monolithic Agent

**What:** Creating one "tsx-agent" that handles all three workflows (scratch, language, PineScript).

**Why bad:** Context bloat. A PineScript conversion doesn't need language adaptation logic. Agent files would be enormous (2000+ lines), wasting context window.

**Instead:** Specialized agents per concern (executor, planner, researcher, verifier). Workflows compose agents; agents stay focused.

### Anti-Pattern 3: Hardcoded Paths

**What:** Using literal paths like `~/.claude/topstepx/references/TOPSTEPX_API.md` in workflow and agent files.

**Why bad:** Breaks on non-Claude platforms, breaks on local vs global installs.

**Instead:** Use `~/.claude/` as canonical in source. Installer rewrites all paths for the target platform and location. This is GSD's proven approach.

### Anti-Pattern 4: Duplicating GSD Core

**What:** Copying GSD's execute-phase, plan-phase, verify-work workflows and modifying them for TSX.

**Why bad:** Maintenance burden. When GSD updates its execution engine, TSX's copy diverges. These are generic orchestration patterns, not trading-specific.

**Instead:** TSX commands for execute-phase, plan-phase, and verify-work should be thin wrappers that reference GSD's actual workflows (or faithful copies with minimal modifications). The trading specialization lives in the three TSX-specific workflows (new-project, adapt-language, adapt-pinescript) and the templates/references, not in the execution engine.

### Anti-Pattern 5: Bundling API Keys or Credentials

**What:** Including example API keys, account IDs, or connection tokens in reference docs or templates.

**Why bad:** Security risk. Even example values can be confused for real credentials.

**Instead:** Templates use placeholder patterns (`YOUR_API_KEY`, `YOUR_USERNAME`) with clear instructions to obtain real values.

## Component Dependency Graph

```
INSTALLER (bin/install.js)
  depends on: ALL source content (commands/, agents/, topstepx/, skills/)
  produces:   installed files in target platform directories

COMMANDS (commands/tsx/)
  depends on: nothing at authoring time
  references: workflows, references (via @ refs resolved at runtime)

WORKFLOWS (topstepx/workflows/)
  depends on: tsx-tools.cjs (for state/config)
  references: templates, references (via @ refs)
  spawns:     agents (via Task())

AGENTS (agents/tsx-*)
  depends on: nothing at authoring time
  reads:      templates, references, project state (.planning/)
  writes:     source code, planning docs

TSX-TOOLS (topstepx/bin/tsx-tools.cjs)
  depends on: Node.js runtime
  reads:      .planning/ (state, config, roadmap, plans)
  writes:     .planning/ (state updates, config)

TEMPLATES (topstepx/templates/)
  depends on: nothing (passive content)

REFERENCES (topstepx/references/)
  depends on: nothing (passive content)
  includes:   existing skill content (TOPSTEPX_API.md, rest-api.md, realtime.md, enums.md)

SKILLS (skills/topstepx-api/)
  depends on: nothing (backward-compatible standalone skill)
```

## Build Order (Dependencies Between Components)

The following order respects dependencies -- each component only depends on things built before it:

### Phase 1: Foundation (no dependencies)

Build in any order:
1. **References** -- Consolidate existing API docs into `topstepx/references/`. Create PINESCRIPT.md. These are passive content with no dependencies.
2. **Templates** -- Create trading-specific output templates (strategy-spec.md, risk-params.md, etc.) plus adapt GSD templates (project.md, roadmap.md, state.md).
3. **tsx-tools.cjs** -- Adapt from gsd-tools.cjs. Handles state management, config, phase/plan indexing. Must exist before workflows can use it.

### Phase 2: Execution Layer (depends on Phase 1)

Build in any order within this phase:
4. **Agents** -- Adapt GSD agents (executor, planner, researcher, verifier, debugger) with `tsx-` prefix. They reference templates and references from Phase 1.
5. **GSD-adapted workflows** -- Copy and adapt execute-phase.md, execute-plan.md, plan-phase.md, verify-work.md. These use tsx-tools.cjs from Phase 1 and spawn agents.

### Phase 3: TSX-Specific Workflows (depends on Phases 1 + 2)

Build in order of complexity:
6. **new-project workflow** -- The "from scratch" workflow. Uses agents from Phase 2, templates from Phase 1, tsx-tools from Phase 1.
7. **adapt-language workflow** -- Language adaptation. Simpler than PineScript (no domain translation needed).
8. **adapt-pinescript workflow** -- PineScript conversion. Most complex (requires PINESCRIPT.md reference, concept mapping logic).

### Phase 4: Entry Points (depends on all above)

9. **Commands** -- Thin Markdown files referencing workflows. Trivial to write once workflows exist.
10. **Installer adaptation** -- Extend bin/install.js to copy commands/, agents/, topstepx/ in addition to skills/. Adapt GSD's path replacement logic.

### Phase 5: Validation

11. **End-to-end testing** -- Run each command flow manually. Verify install on each platform.

## Key Architecture Decision: `topstepx/` vs `get-shit-done/`

GSD uses `get-shit-done/` as its main content directory. TSX should use `topstepx/` (not `tsx/` -- too terse, not `topstepx-skill/` -- too long).

**Rationale:**
- Parallel naming convention to GSD: `~/.claude/get-shit-done/` and `~/.claude/topstepx/`
- Clear identity when installed alongside GSD
- The `skills/topstepx-api/` directory is preserved separately for backward compatibility (users who only want the simple skill without the framework)

## Key Architecture Decision: Relationship with GSD

TSX is a **peer framework**, not a plugin or extension of GSD. Both install to the same platform directories but maintain separate component trees:

```
~/.claude/
├── commands/
│   ├── gsd/           # GSD commands (/gsd:*)
│   └── tsx/           # TSX commands (/tsx:*)
├── agents/
│   ├── gsd-*.md       # GSD agents
│   └── tsx-*.md       # TSX agents
├── get-shit-done/     # GSD content
│   ├── workflows/
│   ├── templates/
│   ├── references/
│   └── bin/
├── topstepx/          # TSX content
│   ├── workflows/
│   ├── templates/
│   ├── references/
│   └── bin/
└── skills/
    └── topstepx-api/  # Simple skill (backward compat)
```

**No namespace collision.** GSD owns `gsd-*` prefixes; TSX owns `tsx-*` prefixes. They can coexist cleanly.

## Key Architecture Decision: Reuse vs Copy from GSD

| Component | Strategy | Rationale |
|-----------|----------|-----------|
| execute-phase workflow | Copy + minimal adapt | Core orchestration. Change `gsd-tools` to `tsx-tools`, `gsd-executor` to `tsx-executor`. Logic stays the same. |
| plan-phase workflow | Copy + minimal adapt | Same reasoning. Planning orchestration is generic. |
| verify-work workflow | Copy + minimal adapt | Verification is generic. |
| new-project workflow | Write new, use GSD as template | Trading-specific questioning, domain research, strategy templates. Structure follows GSD's pattern but content is entirely different. |
| adapt-language workflow | Write new | No GSD equivalent. |
| adapt-pinescript workflow | Write new | No GSD equivalent. |
| tsx-tools.cjs | Fork from gsd-tools.cjs | Needs same state/config/phase management, but with TSX-specific commands and config keys. |
| Agents | Copy + adapt | Same roles (executor, planner, researcher, verifier, debugger). Add trading context loading, reference loading. Remove GSD-specific behaviors. |
| Templates | Mix of copy + new | Roadmap, state, summary templates copy from GSD. Strategy-spec, risk-params, integration-plan, backtest-report are new. |
| Installer | Extend existing | Current installer copies skills/. Extend to also copy commands/, agents/, topstepx/. Adapt GSD's path replacement and platform-specific conversion logic. |

## Sources

- GSD source code at `/tmp/get-shit-done` (direct analysis, HIGH confidence)
- GSD `bin/install.js` (~2100 lines, analyzed install function structure)
- GSD `commands/gsd/new-project.md`, `execute-phase.md` (command patterns)
- GSD `agents/gsd-executor.md`, `gsd-planner.md` (agent patterns)
- GSD `get-shit-done/workflows/new-project.md`, `execute-phase.md` (workflow patterns)
- Existing TSX codebase at `C:\Users\bkevi\Documents\GitHub\mizu\topstepx-skill\` (current state analysis)
- `.planning/PROJECT.md` (project requirements and constraints)

---

*Architecture analysis: 2026-03-11*
