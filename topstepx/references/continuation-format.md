# Continuation Format

Standard format for presenting next steps after completing a command or workflow.

## Core Structure

```
---

## > Next Up

**{identifier}: {name}** -- {one-line description}

`{command to copy-paste}`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- `{alternative option 1}` -- description
- `{alternative option 2}` -- description

---
```

## Format Rules

1. **Always show what it is** -- name + description, never just a command path
2. **Pull context from source** -- ROADMAP.md for phases, PLAN.md `<objective>` for plans
3. **Command in inline code** -- backticks, easy to copy-paste, renders as clickable link
4. **`/clear` explanation** -- always include, keeps it concise but explains why
5. **"Also available" not "Other options"** -- sounds more app-like
6. **Visual separators** -- `---` above and below to make it stand out

## Variants

### Execute Next Plan

```
---

## > Next Up

**02-03: Bracket Order Logic** -- Add TP/SL bracket attachment to all entry orders

`/tsx:execute-phase 2`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- Review plan before executing
- `/tsx:list-phase-assumptions 2` -- check assumptions

---
```

### Execute Final Plan in Phase

Add note that this is the last plan and what comes after:

```
---

## > Next Up

**02-03: Risk Guardrails** -- Implement daily loss limit and position size enforcement
<sub>Final plan in Phase 2</sub>

`/tsx:execute-phase 2`

<sub>`/clear` first -> fresh context window</sub>

---

**After this completes:**
- Phase 2 -> Phase 3 transition
- Next: **Phase 3: Strategy Engine** -- Signal generation and order execution

---
```

### Plan a Phase

```
---

## > Next Up

**Phase 2: API Integration** -- TopStepX REST client with JWT auth and rate limiting

`/tsx:plan-phase 2`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- `/tsx:discuss-phase 2` -- gather context first
- `/tsx:research-phase 2` -- investigate unknowns
- Review roadmap

---
```

### Phase Complete, Ready for Next

Show completion status before next action:

```
---

## Phase 2 Complete

3/3 plans executed

## > Next Up

**Phase 3: Strategy Engine** -- Signal generation, indicator calculations, and order execution

`/tsx:plan-phase 3`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- `/tsx:discuss-phase 3` -- gather context first
- `/tsx:research-phase 3` -- investigate unknowns
- Review what Phase 2 built

---
```

### Multiple Equal Options

When there's no clear primary action:

```
---

## > Next Up

**Phase 3: Strategy Engine** -- Signal generation, indicator calculations, and order execution

**To plan directly:** `/tsx:plan-phase 3`

**To discuss context first:** `/tsx:discuss-phase 3`

**To research unknowns:** `/tsx:research-phase 3`

<sub>`/clear` first -> fresh context window</sub>

---
```

### Milestone Complete

```
---

## Milestone v1.0 Complete

All 5 phases shipped

## > Next Up

**Start v1.1** -- questioning -> research -> requirements -> roadmap

`/tsx:new-milestone`

<sub>`/clear` first -> fresh context window</sub>

---
```

### Trading-Specific Continuations

After completing API integration, resuming with strategy work:

```
---

## > Next Up

**Phase 4: Strategy Implementation** -- EMA crossover signal generation with confirmed-bar execution

`/tsx:plan-phase 4`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- `/tsx:discuss-phase 4` -- review strategy spec before planning
- `/tsx:adapt-pinescript` -- convert a PineScript strategy instead

---
```

After completing bot scaffold, resuming with live testing:

```
---

## > Next Up

**05-02: Paper Trading Validation** -- Run bot against TopStepX evaluation account

`/tsx:execute-phase 5`

<sub>`/clear` first -> fresh context window</sub>

---

**Prerequisites:**
- TopStepX API key configured in .env
- Evaluation account active ($29/month API access)

---
```

## Pulling Context

### For phases (from ROADMAP.md):

```markdown
### Phase 2: API Integration
**Goal**: TopStepX REST client with JWT auth and rate limiting
```

Extract: `**Phase 2: API Integration** -- TopStepX REST client with JWT auth and rate limiting`

### For plans (from ROADMAP.md):

```markdown
Plans:
- [ ] 02-03: Add bracket order logic
```

Or from PLAN.md `<objective>`:

```xml
<objective>
Add bracket order attachment to every entry order.

Purpose: Safety requirement - no naked entries without stop-loss.
</objective>
```

Extract: `**02-03: Bracket Order Logic** -- Add TP/SL bracket attachment to all entry orders`

## Anti-Patterns

### Don't: Command-only (no context)

```
## To Continue

Run `/clear`, then paste:
/tsx:execute-phase 2
```

User has no idea what 02-03 is about.

### Don't: Missing /clear explanation

```
`/tsx:plan-phase 3`

Run /clear first.
```

Doesn't explain why. User might skip it.

### Don't: "Other options" language

```
Other options:
- Review roadmap
```

Sounds like an afterthought. Use "Also available:" instead.

### Don't: Fenced code blocks for commands

````
```
/tsx:plan-phase 3
```
````

Fenced blocks inside templates create nesting ambiguity. Use inline backticks instead.
