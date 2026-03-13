# Phase 8: Core Commands - Research

**Researched:** 2026-03-12
**Domain:** Claude Code slash command authoring (Markdown files with YAML frontmatter)
**Confidence:** HIGH

## Summary

Phase 8 creates 12 thin command entry points (`commands/tsx/`) that users invoke as `/tsx:*` slash commands. Each command is a Markdown file with YAML frontmatter that declares metadata and tool permissions, then delegates entirely to a corresponding workflow in `topstepx/workflows/`. The commands contain zero orchestration logic -- that lives in the workflows, which are already complete from Phases 4-7.

The pattern is mechanical: every GSD command in `~/.claude/commands/gsd/` has a 1:1 structural equivalent already analyzed. For each of the 12 TSX commands, the task is: (1) copy the GSD command's structure, (2) replace `gsd:` with `tsx:` in the name, (3) replace `get-shit-done` with `topstepx` in all `@` reference paths, (4) replace `gsd-tools.cjs` with `tsx-tools.cjs` in any inline bash, (5) replace `gsd-*` agent names with `tsx-*`, and (6) update the description to reference trading/TopStepX where appropriate. The GSD commands range from 5 lines (help.md) to 43 lines (execute-phase.md) of actual content after frontmatter -- all well within the 20-40 line target.

**Primary recommendation:** Batch all 12 commands into 2 plans -- one for the 8 core workflow commands (CMD-01 through CMD-08), one for the 4 navigation commands (CMD-09 through CMD-12). Each plan is purely mechanical naming adaptation with zero creative decisions.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CMD-01 | `/tsx:new-project` -- Initialize trading project with domain-specific questioning | Direct GSD equivalent exists (`gsd:new-project`). Delegates to `topstepx/workflows/new-project.md` (completed Phase 5). |
| CMD-02 | `/tsx:discuss-phase` -- Gather phase implementation context | Direct GSD equivalent exists (`gsd:discuss-phase`). Delegates to `topstepx/workflows/discuss-phase.md` (completed Phase 4). |
| CMD-03 | `/tsx:plan-phase` -- Create detailed execution plans for a phase | Direct GSD equivalent exists (`gsd:plan-phase`). Delegates to `topstepx/workflows/plan-phase.md` (completed Phase 4). Has `agent: tsx-planner` frontmatter field. |
| CMD-04 | `/tsx:execute-phase` -- Execute plans with wave-based parallelization | Direct GSD equivalent exists (`gsd:execute-phase`). Delegates to `topstepx/workflows/execute-phase.md` (completed Phase 4). |
| CMD-05 | `/tsx:verify-work` -- Validate built features through conversational UAT | Direct GSD equivalent exists (`gsd:verify-work`). Delegates to `topstepx/workflows/verify-work.md` (completed Phase 4). |
| CMD-06 | `/tsx:audit-milestone` -- Audit milestone completion against goals | Direct GSD equivalent exists (`gsd:audit-milestone`). Delegates to `topstepx/workflows/audit-milestone.md` (completed Phase 4). |
| CMD-07 | `/tsx:complete-milestone` -- Archive milestone, tag release | Direct GSD equivalent exists (`gsd:complete-milestone`). Delegates to `topstepx/workflows/complete-milestone.md` (completed Phase 4). Note: GSD version has `type: prompt` in frontmatter. |
| CMD-08 | `/tsx:new-milestone` -- Start next version cycle | Direct GSD equivalent exists (`gsd:new-milestone`). Delegates to `topstepx/workflows/new-milestone.md` (completed Phase 4). |
| CMD-09 | `/tsx:progress` -- Show status and route to next action | Direct GSD equivalent exists (`gsd:progress`). Delegates to `topstepx/workflows/progress.md` (completed Phase 4). Uses `SlashCommand` tool. |
| CMD-10 | `/tsx:resume-work` -- Restore context from last session | Direct GSD equivalent exists (`gsd:resume-work`). Delegates to `topstepx/workflows/resume-project.md` (completed Phase 4). Uses `SlashCommand` tool. |
| CMD-11 | `/tsx:pause-work` -- Save handoff when stopping mid-phase | Direct GSD equivalent exists (`gsd:pause-work`). Delegates to `topstepx/workflows/pause-work.md` (completed Phase 4). |
| CMD-12 | `/tsx:help` -- Show all TSX commands | Direct GSD equivalent exists (`gsd:help`). Delegates to `topstepx/workflows/help.md` (completed Phase 4). No allowed-tools needed. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code Slash Commands | Current | Markdown files with YAML frontmatter in `commands/tsx/` directory | Native Claude Code command system -- `.md` files in `commands/{namespace}/` become `/namespace:command-name` |
| YAML Frontmatter | N/A | Declares command metadata (name, description, argument-hint, allowed-tools, agent) | GSD's proven cross-platform portability schema |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx-tools.cjs | N/A (already built) | State management CLI for `.planning/` operations | Referenced in inline bash snippets within commands that have process logic (only `research-phase` and `debug` among Phase 8 scope -- neither is in scope) |

### Alternatives Considered

None. This is direct adaptation of GSD's established command pattern. There are no alternatives to consider.

## Architecture Patterns

### Recommended Project Structure

```
topstepx-dev/
  commands/
    tsx/
      new-project.md      # CMD-01
      discuss-phase.md     # CMD-02
      plan-phase.md        # CMD-03
      execute-phase.md     # CMD-04
      verify-work.md       # CMD-05
      audit-milestone.md   # CMD-06
      complete-milestone.md # CMD-07
      new-milestone.md     # CMD-08
      progress.md          # CMD-09
      resume-work.md       # CMD-10
      pause-work.md        # CMD-11
      help.md              # CMD-12
```

### Pattern 1: Thin Command Delegation (PRIMARY PATTERN)

**What:** Each command file is 20-40 lines of Markdown with YAML frontmatter. The file declares metadata, loads workflow + supporting context files via `<execution_context>` @ references, and contains a `<process>` section that says "Execute the workflow end-to-end."

**When to use:** Every command in this phase.

**Example (representative -- new-project):**

```markdown
---
name: tsx:new-project
description: Initialize a new TopStepX trading bot project with domain-specific questioning
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<context>
**Flags:**
- `--auto` -- Automatic mode. After config questions, runs research -> requirements -> roadmap without further interaction. Expects idea document via @ reference.
</context>

<objective>
Initialize a new trading bot project through unified flow: questioning -> research (optional) -> requirements -> roadmap.

**Creates:**
- `.planning/PROJECT.md` -- project context
- `.planning/config.json` -- workflow preferences
- `.planning/research/` -- domain research (optional)
- `.planning/REQUIREMENTS.md` -- scoped requirements
- `.planning/ROADMAP.md` -- phase structure
- `.planning/STATE.md` -- project memory

**After this command:** Run `/tsx:plan-phase 1` to start execution.
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/new-project.md
@$HOME/.claude/topstepx/references/questioning.md
@$HOME/.claude/topstepx/references/ui-brand.md
@$HOME/.claude/topstepx/templates/project.md
@$HOME/.claude/topstepx/templates/requirements.md
</execution_context>

<process>
Execute the new-project workflow from @$HOME/.claude/topstepx/workflows/new-project.md end-to-end.
Preserve all workflow gates (validation, approvals, commits, routing).
</process>
```

**Source:** Direct analysis of GSD commands at `~/.claude/commands/gsd/` (HIGH confidence)

### Pattern 2: YAML Frontmatter Schema

**What:** The exact YAML frontmatter fields and their valid values, as used across all 32 GSD commands.

**Fields:**

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| `name` | Yes | `tsx:{command-name}` | Determines slash command invocation name |
| `description` | Yes | Short string (< 80 chars) | Shows in command palette / help |
| `argument-hint` | No | String like `"<phase>"` or `"[--auto]"` | Shows expected arguments |
| `allowed-tools` | No | YAML list of tool names | Restricts which tools the command can use. Omit for commands needing no tools (e.g., help). |
| `agent` | No | Agent name string | Only used by `plan-phase` (sets `agent: tsx-planner`) |
| `type` | No | `prompt` | Only used by `complete-milestone` in GSD. Unclear cross-platform effect. |

**Tool names observed in GSD commands:** `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`, `Task`, `AskUserQuestion`, `SlashCommand`, `TodoWrite`, `WebFetch`, `mcp__context7__resolve-library-id`, `mcp__context7__query-docs`, `mcp__context7__*`

### Pattern 3: Path References in Commands

**What:** Commands use `@` references to load workflow and supporting files. These paths must use the canonical `$HOME/.claude/topstepx/` prefix because the installer rewrites paths at install time.

**GSD pattern:** `@C:/Users/bkevi/.claude/get-shit-done/workflows/new-project.md`
**TSX pattern:** `@$HOME/.claude/topstepx/workflows/new-project.md`

**Critical detail from GSD architecture research:** GSD commands use absolute paths with the user's home directory baked in (e.g., `@C:/Users/bkevi/.claude/get-shit-done/...`). This happens because the GSD installer rewrites canonical paths at install time. For TSX source files in the repository, use `$HOME/.claude/topstepx/` as the canonical path prefix. The Phase 10 installer will rewrite these to absolute paths for each platform.

### Pattern 4: Command-to-Workflow Mapping

Each command maps to exactly one workflow file. The mapping is 1:1 except `resume-work.md` which maps to `resume-project.md`:

| Command File | Workflow File | Notes |
|-------------|--------------|-------|
| `new-project.md` | `topstepx/workflows/new-project.md` | Also loads questioning.md, ui-brand.md, project.md, requirements.md |
| `discuss-phase.md` | `topstepx/workflows/discuss-phase.md` | Also loads context.md template |
| `plan-phase.md` | `topstepx/workflows/plan-phase.md` | Also loads ui-brand.md. Has `agent: tsx-planner` |
| `execute-phase.md` | `topstepx/workflows/execute-phase.md` | Also loads ui-brand.md |
| `verify-work.md` | `topstepx/workflows/verify-work.md` | Also loads UAT.md template |
| `audit-milestone.md` | `topstepx/workflows/audit-milestone.md` | Standalone |
| `complete-milestone.md` | `topstepx/workflows/complete-milestone.md` | Also loads milestone-archive.md template. Has `type: prompt` |
| `new-milestone.md` | `topstepx/workflows/new-milestone.md` | Also loads questioning.md, ui-brand.md, project.md, requirements.md |
| `progress.md` | `topstepx/workflows/progress.md` | Standalone |
| `resume-work.md` | `topstepx/workflows/resume-project.md` | Note: filename mismatch is intentional (GSD convention) |
| `pause-work.md` | `topstepx/workflows/pause-work.md` | Standalone |
| `help.md` | `topstepx/workflows/help.md` | Standalone, no allowed-tools |

### Pattern 5: Content Sections After Frontmatter

GSD commands use these XML-like sections in the body (after `---`). Not all commands use all sections:

| Section | Purpose | Used By |
|---------|---------|---------|
| `<context>` | Declares how `$ARGUMENTS` is parsed, flags, prerequisites | Most commands with arguments |
| `<objective>` | What the command does, what it produces, what comes next | All commands |
| `<execution_context>` | `@` references to load workflow + supporting files | All commands |
| `<process>` | "Execute the workflow end-to-end" + any special instructions | All commands |
| `<success_criteria>` | Checklist of what must be true when done | Complex commands (complete-milestone, discuss-phase, verify-work) |
| `<critical_rules>` | Hard constraints | Only complete-milestone |

**Slim commands** (help, cleanup, pause-work, progress): Only have `<objective>`, `<execution_context>`, `<process>`.

**Medium commands** (execute-phase, verify-work, audit-milestone): Have `<objective>`, `<execution_context>`, `<context>`, `<process>`.

**Rich commands** (new-project, discuss-phase, plan-phase, complete-milestone, new-milestone): Have most or all sections.

### Anti-Patterns to Avoid

- **Logic in commands:** Commands must NOT contain step-by-step process logic, conditionals, bash code blocks, or agent spawning. That all lives in workflows. The `<process>` section says "execute the workflow" -- it does not describe HOW to execute it.
- **Hardcoded user-specific paths:** Do not bake in paths like `C:/Users/bkevi/`. Use `$HOME/.claude/topstepx/` as canonical prefix.
- **Duplicating workflow content:** Commands should not repeat the workflow's step descriptions. The command says "Execute the X workflow end-to-end" and the workflow contains the details.
- **GSD references in TSX commands:** All `/gsd:` routing must be replaced with `/tsx:`. All `gsd-tools.cjs` must be replaced with `tsx-tools.cjs`. All `gsd-*` agent names must be replaced with `tsx-*`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Command structure | Custom format | GSD's exact YAML frontmatter + XML sections format | Cross-platform portability already proven across Claude Code, OpenCode, Codex CLI, Gemini CLI |
| Workflow logic | Inline in commands | Existing workflows in `topstepx/workflows/` | Workflows already built in Phases 4-7. Commands just delegate. |
| Tool permissions | Per-command custom lists | Copy GSD command's `allowed-tools` list exactly | GSD has battle-tested which tools each command needs |
| Path resolution | Custom path logic | `$HOME/.claude/topstepx/` canonical prefix + installer rewrite | GSD's proven approach for multi-platform |

**Key insight:** These commands are pure boilerplate. The value was already delivered in Phases 4-7 (workflows). Commands are just the thin UI layer that makes workflows invocable.

## Common Pitfalls

### Pitfall 1: Missing Tool Permissions

**What goes wrong:** Command fails at runtime because a needed tool is not in `allowed-tools`.
**Why it happens:** Forgetting to include a tool the workflow needs (e.g., `Task` for agent spawning, `SlashCommand` for routing).
**How to avoid:** Copy the exact `allowed-tools` list from the corresponding GSD command. Do not add or remove tools.
**Warning signs:** Command works for simple cases but fails on specific workflow paths.

### Pitfall 2: Incorrect resume-work to resume-project Mapping

**What goes wrong:** The `resume-work.md` command references a non-existent `resume-work.md` workflow.
**Why it happens:** The command is named `resume-work` but the workflow is named `resume-project`. This is an intentional GSD naming mismatch.
**How to avoid:** Map `resume-work.md` command to `topstepx/workflows/resume-project.md` workflow. Verify the workflow file exists.
**Warning signs:** "File not found" when invoking `/tsx:resume-work`.

### Pitfall 3: Missing `type: prompt` on complete-milestone

**What goes wrong:** `complete-milestone` may behave differently without the `type: prompt` frontmatter field.
**Why it happens:** GSD's `complete-milestone.md` is the only command with `type: prompt` in its frontmatter. It's unclear exactly what this field does across platforms, but it must be preserved for compatibility.
**How to avoid:** Include `type: prompt` in `complete-milestone.md` frontmatter, matching GSD exactly.
**Warning signs:** Subtle behavioral differences in how the command is executed.

### Pitfall 4: Forgetting `agent` Field on plan-phase

**What goes wrong:** `plan-phase` doesn't route to the correct agent model.
**Why it happens:** GSD's `plan-phase.md` has `agent: gsd-planner` in frontmatter. TSX must have `agent: tsx-planner`.
**How to avoid:** Include `agent: tsx-planner` in `plan-phase.md` frontmatter.
**Warning signs:** Plan-phase uses wrong model profile.

### Pitfall 5: GSD Naming Leaks

**What goes wrong:** TSX commands reference GSD paths (`get-shit-done/`) or GSD commands (`/gsd:*`) or GSD agents (`gsd-*`).
**Why it happens:** Copy-paste from GSD source without complete find-and-replace.
**How to avoid:** After creating each command, grep for `gsd`, `get-shit-done`, `/gsd:` to catch any leaks. Every instance must be replaced with its TSX equivalent.
**Warning signs:** Commands load wrong framework's workflows or route to wrong framework's next steps.

### Pitfall 6: Path Separator Issues (Windows)

**What goes wrong:** `@` references use backslashes or mixed separators.
**Why it happens:** Developing on Windows where paths naturally use backslashes.
**How to avoid:** Always use forward slashes in `@` reference paths. Use `$HOME/.claude/topstepx/` not `$HOME\.claude\topstepx\`.
**Warning signs:** Commands fail to load workflow files on specific platforms.

## Code Examples

### Example 1: Minimal Command (help.md)

```markdown
---
name: tsx:help
description: Show available TSX commands and usage guide
---
<objective>
Display the complete TSX command reference.

Output ONLY the reference content below. Do NOT add:
- Project-specific analysis
- Git status or file context
- Next-step suggestions
- Any commentary beyond the reference
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/help.md
</execution_context>

<process>
Output the complete TSX command reference from @$HOME/.claude/topstepx/workflows/help.md.
Display the reference content directly -- no additions or modifications.
</process>
```

Source: Adapted from `~/.claude/commands/gsd/help.md` (HIGH confidence)

### Example 2: Standard Command with Arguments (execute-phase.md)

```markdown
---
name: tsx:execute-phase
description: Execute all plans in a phase with wave-based parallelization
argument-hint: "<phase-number> [--gaps-only]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - TodoWrite
  - AskUserQuestion
---
<objective>
Execute all plans in a phase using wave-based parallel execution.

Orchestrator stays lean: discover plans, analyze dependencies, group into waves, spawn subagents, collect results. Each subagent loads the full execute-plan context and handles its own plan.

Context budget: ~15% orchestrator, 100% fresh per subagent.
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/execute-phase.md
@$HOME/.claude/topstepx/references/ui-brand.md
</execution_context>

<context>
Phase: $ARGUMENTS

**Flags:**
- `--gaps-only` -- Execute only gap closure plans (plans with `gap_closure: true` in frontmatter). Use after verify-work creates fix plans.

Context files are resolved inside the workflow via `tsx-tools init execute-phase` and per-subagent `<files_to_read>` blocks.
</context>

<process>
Execute the execute-phase workflow from @$HOME/.claude/topstepx/workflows/execute-phase.md end-to-end.
Preserve all workflow gates (wave execution, checkpoint handling, verification, state updates, routing).
</process>
```

Source: Adapted from `~/.claude/commands/gsd/execute-phase.md` (HIGH confidence)

### Example 3: Command with `agent` Field (plan-phase.md)

```markdown
---
name: tsx:plan-phase
description: Create detailed phase plan (PLAN.md) with verification loop
argument-hint: "[phase] [--auto] [--research] [--skip-research] [--gaps] [--skip-verify] [--prd <file>]"
agent: tsx-planner
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
  - mcp__context7__*
---
```

Source: Adapted from `~/.claude/commands/gsd/plan-phase.md` frontmatter (HIGH confidence)

### Example 4: Command with `type: prompt` (complete-milestone.md)

```markdown
---
type: prompt
name: tsx:complete-milestone
description: Archive completed milestone and prepare for next version
argument-hint: <version>
allowed-tools:
  - Read
  - Write
  - Bash
---
```

Source: Adapted from `~/.claude/commands/gsd/complete-milestone.md` frontmatter (HIGH confidence)

## Naming Replacement Reference

Complete substitution table for adapting GSD commands to TSX:

| GSD Pattern | TSX Replacement | Where Found |
|-------------|----------------|-------------|
| `gsd:` (in `name:` field) | `tsx:` | YAML frontmatter |
| `gsd:` (in routing text like "Run /gsd:plan-phase") | `tsx:` | Body text, `<objective>`, `<process>` |
| `get-shit-done` (in `@` reference paths) | `topstepx` | `<execution_context>`, `<process>` |
| `gsd-tools.cjs` (in bash snippets) | `tsx-tools.cjs` | `<process>`, `<context>` |
| `gsd-planner` (in `agent:` field) | `tsx-planner` | YAML frontmatter (plan-phase only) |
| `gsd-executor` | `tsx-executor` | Body text references |
| `gsd-verifier` | `tsx-verifier` | Body text references |
| `gsd-debugger` | `tsx-debugger` | Body text references |
| `gsd-phase-researcher` | `tsx-phase-researcher` | Body text references |
| `GSD` (in descriptive text) | `TSX` | Description text |
| `~/.gsd/` (user config path) | `~/.tsx/` | Config path references |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Commands with inline logic | Commands as thin delegation to workflows | GSD architecture (current) | Commands are stable API surface; workflows are mutable implementation |
| Hardcoded absolute paths | Canonical `$HOME/.claude/` prefix with installer rewrite | GSD installer pattern (current) | Cross-platform portability |

**Deprecated/outdated:**
- None. The GSD command pattern is the current standard and TSX follows it exactly.

## Open Questions

1. **`type: prompt` Semantics**
   - What we know: GSD's `complete-milestone.md` uses `type: prompt` while no other command does. TSX should preserve this.
   - What's unclear: What exactly `type: prompt` does differently across platforms (Claude Code, OpenCode, Codex CLI, Gemini CLI).
   - Recommendation: Preserve it exactly as GSD does. Do not add it to other commands.

2. **Path Prefix for Source Files**
   - What we know: GSD installed commands use absolute paths like `@C:/Users/bkevi/.claude/get-shit-done/...`. TSX source files should use `$HOME/.claude/topstepx/...` as canonical prefix.
   - What's unclear: Whether `$HOME` is expanded at command parse time or if it needs to be a literal absolute path. GSD's installed files use literal absolute paths.
   - Recommendation: Use `$HOME/.claude/topstepx/` in source. The Phase 10 installer will rewrite to absolute paths per platform. This matches how GSD workflows already reference tsx-tools.cjs (`$HOME/.claude/topstepx/bin/tsx-tools.cjs`).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual verification (static Markdown content, no executable code) |
| Config file | None -- commands are Markdown files, not executable code |
| Quick run command | `ls commands/tsx/*.md | wc -l` (should equal 12) |
| Full suite command | `grep -r "gsd\|get-shit-done" commands/tsx/ --include="*.md"` (should return 0 matches) |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CMD-01 | `/tsx:new-project` command exists with correct frontmatter | smoke | `head -5 commands/tsx/new-project.md` | Wave 0 |
| CMD-02 | `/tsx:discuss-phase` command exists with correct frontmatter | smoke | `head -5 commands/tsx/discuss-phase.md` | Wave 0 |
| CMD-03 | `/tsx:plan-phase` command exists with `agent: tsx-planner` | smoke | `grep "agent: tsx-planner" commands/tsx/plan-phase.md` | Wave 0 |
| CMD-04 | `/tsx:execute-phase` command exists with correct frontmatter | smoke | `head -5 commands/tsx/execute-phase.md` | Wave 0 |
| CMD-05 | `/tsx:verify-work` command exists with correct frontmatter | smoke | `head -5 commands/tsx/verify-work.md` | Wave 0 |
| CMD-06 | `/tsx:audit-milestone` command exists with correct frontmatter | smoke | `head -5 commands/tsx/audit-milestone.md` | Wave 0 |
| CMD-07 | `/tsx:complete-milestone` with `type: prompt` | smoke | `grep "type: prompt" commands/tsx/complete-milestone.md` | Wave 0 |
| CMD-08 | `/tsx:new-milestone` command exists with correct frontmatter | smoke | `head -5 commands/tsx/new-milestone.md` | Wave 0 |
| CMD-09 | `/tsx:progress` delegates to progress workflow | smoke | `grep "topstepx/workflows/progress.md" commands/tsx/progress.md` | Wave 0 |
| CMD-10 | `/tsx:resume-work` delegates to resume-project workflow | smoke | `grep "topstepx/workflows/resume-project.md" commands/tsx/resume-work.md` | Wave 0 |
| CMD-11 | `/tsx:pause-work` delegates to pause-work workflow | smoke | `grep "topstepx/workflows/pause-work.md" commands/tsx/pause-work.md` | Wave 0 |
| CMD-12 | `/tsx:help` delegates to help workflow, no allowed-tools | smoke | `grep -c "allowed-tools" commands/tsx/help.md` (should be 0) | Wave 0 |
| ALL | No GSD naming leaks in any command | integration | `grep -r "gsd\|get-shit-done" commands/tsx/ --include="*.md"` | Wave 0 |
| ALL | Every command is 20-40 lines (zero logic) | integration | `wc -l commands/tsx/*.md` (each under 50 lines) | Wave 0 |
| ALL | All workflow files referenced by commands exist | integration | Parse `@` references, verify each file in `topstepx/workflows/` | Wave 0 |

### Sampling Rate

- **Per task commit:** `ls commands/tsx/*.md | wc -l` + `grep -r "gsd\|get-shit-done" commands/tsx/`
- **Per wave merge:** Full suite -- verify all 12 files exist, zero GSD leaks, all workflow references valid
- **Phase gate:** All 12 commands exist, zero GSD naming leaks, all referenced workflow files exist in `topstepx/workflows/`

### Wave 0 Gaps

- [ ] `commands/tsx/` directory -- does not exist yet, must be created
- [ ] All 12 command `.md` files -- none exist yet

*(No test framework needed -- these are static Markdown files verified by grep/wc commands)*

## Sources

### Primary (HIGH confidence)

- Direct analysis of all 32 GSD command files at `~/.claude/commands/gsd/` -- exact frontmatter schemas, section patterns, tool lists, path conventions
- Direct analysis of all TSX workflow files at `topstepx/workflows/` -- verified all 12 target workflows exist
- `.planning/research/ARCHITECTURE.md` -- confirmed `commands/tsx/` directory structure and component boundaries
- `.planning/ROADMAP.md` Phase 8 definition -- confirmed 12 requirements (CMD-01 through CMD-12)
- `.planning/REQUIREMENTS.md` -- confirmed exact command names and descriptions

### Secondary (MEDIUM confidence)

- `.planning/research/STACK.md` and `.planning/research/SUMMARY.md` -- confirmed path conventions and installer expectations

### Tertiary (LOW confidence)

- `type: prompt` semantics -- observed in GSD's `complete-milestone.md` but exact cross-platform behavior undocumented. Preserving as-is.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- direct analysis of GSD source, no ambiguity
- Architecture: HIGH -- GSD pattern is 1:1 template, all 12 GSD source commands analyzed
- Pitfalls: HIGH -- identified from direct comparison of GSD naming conventions and known gotchas
- Validation: HIGH -- static Markdown files verifiable with grep/wc

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable -- Markdown file format does not change)
