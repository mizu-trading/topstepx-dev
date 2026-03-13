# TSX -- TopStepX AI Framework

An AI framework that teaches coding assistants how to build, convert, and deploy TopStepX trading bots. Built on the [GSD](https://github.com/gsd-build/get-shit-done) framework.

## What It Does

TSX gives AI coding assistants everything they need to build TopStepX trading bots: domain knowledge, guided workflows, safety guardrails, and cross-language conversion. Instead of manually writing API integration code, you describe your trading idea and TSX handles research, planning, implementation, and verification.

TSX works with **Claude Code**, **OpenCode**, **Codex CLI**, and **Gemini CLI**. It extends the GSD (Get Shit Done) framework with trading-specific agents, workflows, and templates -- giving your AI assistant deep expertise in the TopStepX API, order management, real-time data streaming, and risk controls.

Key capabilities:

- **New project from scratch** -- describe a trading idea and TSX builds a complete bot with safety guardrails
- **PineScript conversion** -- convert TradingView strategies to live-tradeable TopStepX bots with repainting and MTF audits
- **Language adaptation** -- port existing bot code between Python, JavaScript, C#, Go, Rust, and more
- **Full project lifecycle** -- plan phases, execute with atomic commits, verify through conversational UAT, audit milestones

## Installation

```bash
npx topstepx-dev                              # Interactive
npx topstepx-dev --claude --global             # Claude Code, global
npx topstepx-dev --all --global                # All platforms
npx topstepx-dev --uninstall --claude --global  # Uninstall
```

The installer will ask which platform(s) and whether to install globally or locally.

### Flags

| Flag | Description |
|------|-------------|
| `--claude` | Install for Claude Code |
| `--opencode` | Install for OpenCode |
| `--codex` | Install for Codex CLI |
| `--gemini` | Install for Gemini CLI |
| `--all` | Install for all platforms |
| `--global` | Install to user home directory |
| `--local` | Install to current project |
| `--uninstall` | Remove TSX files for the specified platform(s) |
| `--dry-run` | Preview install/uninstall operations without writing files |

## Quick Start

1. Install: `npx topstepx-dev --claude --global`
2. Open a project in Claude Code
3. Run: `/tsx:new-project`
4. Follow the guided conversation to define your trading bot
5. TSX handles research, planning, implementation, and verification

## Command Reference

### Core Workflow (8)

| Command | Description |
|---------|-------------|
| `/tsx:new-project` | Initialize a new TopStepX trading bot project with domain-specific questioning |
| `/tsx:discuss-phase` | Gather phase context through adaptive questioning before planning |
| `/tsx:plan-phase` | Create detailed phase plan (PLAN.md) with verification loop |
| `/tsx:execute-phase` | Execute all plans in a phase with wave-based parallelization |
| `/tsx:verify-work` | Validate built features through conversational UAT |
| `/tsx:audit-milestone` | Audit milestone completion against original intent before archiving |
| `/tsx:complete-milestone` | Archive completed milestone and prepare for next version |
| `/tsx:new-milestone` | Start a new milestone cycle -- update PROJECT.md and route to requirements |

### Navigation (4)

| Command | Description |
|---------|-------------|
| `/tsx:progress` | Check project progress, show context, and route to next action |
| `/tsx:resume-work` | Resume work from previous session with full context restoration |
| `/tsx:pause-work` | Create context handoff when pausing work mid-phase |
| `/tsx:help` | Show available TSX commands and usage guide |

### Phase Management (5)

| Command | Description |
|---------|-------------|
| `/tsx:add-phase` | Add phase to end of current milestone in roadmap |
| `/tsx:insert-phase` | Insert urgent work as decimal phase (e.g., 72.1) between existing phases |
| `/tsx:remove-phase` | Remove a future phase from roadmap and renumber subsequent phases |
| `/tsx:list-phase-assumptions` | Surface Claude's assumptions about a phase approach before planning |
| `/tsx:plan-milestone-gaps` | Create phases to close all gaps identified by milestone audit |

### TSX-Specific (2)

| Command | Description |
|---------|-------------|
| `/tsx:adapt-language` | Convert TopStepX trading bot code between supported languages |
| `/tsx:adapt-pinescript` | Convert TradingView PineScript strategy to a live-tradeable TopStepX trading bot |

### Utilities (13)

| Command | Description |
|---------|-------------|
| `/tsx:map-codebase` | Analyze codebase with parallel mapper agents to produce .planning/codebase/ documents |
| `/tsx:quick` | Execute a quick task with TSX guarantees (atomic commits, state tracking) but skip optional agents |
| `/tsx:debug` | Systematic debugging with persistent state across context resets |
| `/tsx:add-todo` | Capture idea or task as todo from current conversation context |
| `/tsx:check-todos` | List pending todos and select one to work on |
| `/tsx:settings` | Configure TSX workflow toggles and model profile |
| `/tsx:set-profile` | Switch model profile for TSX agents (quality/balanced/budget) |
| `/tsx:update` | Update TSX to latest version with changelog display |
| `/tsx:research-phase` | Research how to implement a phase (standalone - usually use /tsx:plan-phase instead) |
| `/tsx:validate-phase` | Retroactively audit and fill Nyquist validation gaps for a completed phase |
| `/tsx:health` | Diagnose planning directory health and optionally repair issues |
| `/tsx:cleanup` | Archive accumulated phase directories from completed milestones |
| `/tsx:add-tests` | Generate tests for a completed phase based on UAT criteria and implementation |

## Architecture Overview

TSX is structured as a layered framework that installs into your AI coding assistant's configuration:

```
commands/tsx/     -- 32 thin entry points (/tsx:* slash commands)
topstepx/
  agents/        -- 12 trading-aware AI agents (tsx-*)
  workflows/     -- Orchestration workflows (plan, execute, verify, convert)
  templates/     -- Output format templates (project docs, bot scaffolds, reports)
  references/    -- Domain knowledge (TopStepX API, PineScript, safety patterns)
  bin/           -- CLI utilities (tsx-tools.cjs)
skills/          -- API skill (auto-activates on TopStepX mention)
```

Commands are thin entry points that delegate to workflows. Workflows orchestrate agents. Agents use references and templates to produce correct, safe trading code. The API skill provides always-available domain knowledge that activates whenever TopStepX is mentioned.

## Platform Support

| Platform | Commands | Agents | Core | Skills |
|----------|----------|--------|------|--------|
| Claude Code | commands/tsx/*.md | agents/tsx-*.md | topstepx/ | skills/topstepx-api/ |
| OpenCode | commands/tsx-*.md | agents/tsx-*.md | topstepx/ | skills/topstepx-api/ |
| Gemini CLI | commands/tsx/*.toml | agents/tsx-*.md | topstepx/ | skills/topstepx-api/ |
| Codex CLI | skills/tsx-*/SKILL.md | skills/tsx-*/SKILL.md | topstepx/ | skills/topstepx-api/ |

**Global install** places files in your home directory (e.g., `~/.claude/`, `~/.config/opencode/`) so TSX is available in every project. **Local install** places files in the current project directory (e.g., `.claude/`, `.opencode/`) for project-specific use.

## Safety Guardrails

TSX embeds trading safety patterns as non-optional defaults in all generated code:

- **Bracket orders** -- every order placement includes stop-loss and take-profit by default
- **JWT token refresh** -- automatic authentication token management before expiry
- **Rate limiting** -- request throttling to stay within API limits
- **Enum validation** -- strict enum constants for order types, sides, durations (no magic numbers)
- **Bar-close execution** -- PineScript conversions use confirmed bar data to prevent repainting

These safety patterns are enforced during verification. The `/tsx:verify-work` command checks for their presence before approving any trading bot implementation.

## Built on GSD

TSX extends the [GSD (Get Shit Done)](https://github.com/gsd-build/get-shit-done) framework by TACHES. GSD provides the execution engine -- wave-based parallel planning, atomic commits, deviation handling, verification protocols. TSX adds trading domain expertise on top: TopStepX API knowledge, PineScript conversion, safety guardrails, and trading-specific workflows.

## License

[MIT](LICENSE)
