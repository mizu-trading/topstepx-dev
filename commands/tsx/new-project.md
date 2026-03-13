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
