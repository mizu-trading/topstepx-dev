# Phase 3: Trading-Aware Agents - Research

**Researched:** 2026-03-12
**Domain:** GSD agent adaptation for trading domain, cross-platform agent frontmatter portability, trading-specific system prompt engineering
**Confidence:** HIGH

## Summary

Phase 3 adapts all 12 GSD agent definition files (7,826 lines total across `$HOME/.claude/agents/gsd-*.md`) into TSX equivalents (`tsx-*.md`) that will be installed to `topstepx/agents/` in the distribution package. Each GSD agent is a Markdown file with YAML frontmatter (name, description, tools, color, skills) followed by an extensive system prompt using XML-tagged sections (`<role>`, `<execution_flow>`, `<philosophy>`, etc.). The adaptation is primarily textual: replacing `gsd-` prefixes with `tsx-`, swapping `get-shit-done` path segments to `topstepx`, replacing `/gsd:` command references with `/tsx:`, and injecting trading domain awareness into each agent's role definition, execution flow, and verification criteria. The architectural structure of each agent must be preserved exactly -- only content specialization, never structural divergence.

The critical insight from studying all 12 GSD agents is that they range dramatically in size: gsd-planner (1,309 lines) and gsd-debugger (1,257 lines) are massive, while gsd-nyquist-auditor (178 lines) and gsd-research-synthesizer (249 lines) are compact. The adaptation work varies per agent too: the 5 primary agents (executor, planner, researcher, verifier, debugger) need both naming changes AND trading domain injection (reference loading, safety pattern awareness, trading-specific examples). The 7 supporting agents (codebase-mapper, plan-checker, roadmapper, phase-researcher, research-synthesizer, integration-checker, nyquist-auditor) need naming changes and lighter trading context additions (validation criteria that check for trading patterns, safety compliance awareness).

Cross-platform portability (Success Criterion 4) is achievable because all 4 target platforms use the same core pattern: Markdown files with YAML frontmatter where the body becomes the system prompt. The frontmatter fields overlap significantly: `name` and `description` are universal. Claude Code uses `tools`, `model`, `skills`, `color`; OpenCode uses `description`, `mode`, `color`, `permission`, `steps`; Gemini CLI uses `name`, `description`, `tools`, `model`, `max_turns`; Codex CLI reads AGENTS.md as plain markdown. The GSD agents already target Claude Code's schema. For portability, agents should use only the common subset of frontmatter fields (name, description, tools) and keep platform-specific fields (skills, hooks) commented out with annotations explaining per-platform usage. This is exactly what GSD already does with hooks (commented out in frontmatter).

**Primary recommendation:** Split into 3 plans: (A) 5 primary agents (executor, planner, researcher/phase-researcher, verifier, debugger) which are the largest files and need the deepest trading domain injection; (B) 7 supporting agents (codebase-mapper, plan-checker, roadmapper, project-researcher, research-synthesizer, integration-checker, nyquist-auditor) which are smaller and need lighter adaptation; and optionally a Wave 1/Wave 2 split if desired. All agents can be adapted independently since they reference each other by name string only.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AGT-01 | `tsx-executor` -- Execute plans with trading domain awareness, loads API/PineScript refs | GSD source: gsd-executor.md (489 lines). Needs: tsx naming, topstepx paths, trading reference loading (TOPSTEPX_API.md, PINESCRIPT.md, safety-patterns.md), trading-aware deviation rules |
| AGT-02 | `tsx-planner` -- Create phase plans specialized for trading integrations | GSD source: gsd-planner.md (1,309 lines). Needs: tsx naming, topstepx paths, trading template references, safety guardrail awareness in plan verification |
| AGT-03 | `tsx-researcher` -- Research trading patterns, API capabilities, library options | GSD source: gsd-project-researcher.md (631 lines). Needs: tsx naming, trading ecosystem awareness, TopStepX API domain knowledge |
| AGT-04 | `tsx-verifier` -- Verify trading bot implementations against requirements | GSD source: gsd-verifier.md (581 lines). Needs: tsx naming, topstepx paths, trading-specific verification checks (safety patterns, enum usage, bracket orders) |
| AGT-05 | `tsx-debugger` -- Debug trading-specific issues (API errors, WebSocket drops, order failures) | GSD source: gsd-debugger.md (1,257 lines). Needs: tsx naming, topstepx paths, trading-specific debugging patterns (JWT expiry, rate limits, order rejection, SignalR drops) |
| AGT-06 | `tsx-codebase-mapper` -- Analyze existing trading codebases | GSD source: gsd-codebase-mapper.md (772 lines). Needs: tsx naming, trading-specific codebase analysis categories (API integration patterns, risk management, order flow) |
| AGT-07 | `tsx-plan-checker` -- Validate plans achieve trading phase goals | GSD source: gsd-plan-checker.md (708 lines). Needs: tsx naming, topstepx paths, safety pattern compliance checks in plan validation |
| AGT-08 | `tsx-roadmapper` -- Create roadmaps from trading requirements | GSD source: gsd-roadmapper.md (652 lines). Needs: tsx naming, topstepx paths, trading phase structure awareness |
| AGT-09 | `tsx-phase-researcher` -- Research how to implement a trading phase | GSD source: gsd-phase-researcher.md (555 lines). Needs: tsx naming, topstepx paths, trading domain research context |
| AGT-10 | `tsx-research-synthesizer` -- Synthesize trading domain research | GSD source: gsd-research-synthesizer.md (249 lines). Needs: tsx naming, topstepx paths, trading research synthesis context |
| AGT-11 | `tsx-integration-checker` -- Verify cross-phase integration for trading systems | GSD source: gsd-integration-checker.md (445 lines). Needs: tsx naming, trading integration awareness (API wiring, WebSocket subscriptions, order flow chains) |
| AGT-12 | `tsx-nyquist-auditor` -- Validate test coverage for trading phases | GSD source: gsd-nyquist-auditor.md (178 lines). Needs: tsx naming, topstepx paths, trading test pattern awareness |
</phase_requirements>

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Markdown | N/A | Agent definition file format | GSD pattern: YAML frontmatter + Markdown body = agent system prompt |
| YAML frontmatter | N/A | Agent metadata (name, description, tools, skills) | Cross-platform standard for all 4 target platforms |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| XML-style tags | N/A | System prompt structure (`<role>`, `<execution_flow>`, etc.) | Every agent uses XML tags to organize system prompt sections |
| Bash code blocks | N/A | CLI commands inside agent prompts | Agents embed tsx-tools.cjs commands in their execution flows |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Markdown + YAML frontmatter | JSON agent definitions | Markdown is the universal cross-platform format; JSON is not supported by any target platform |
| XML-style prompt tags | Markdown headings | XML tags are the established GSD pattern and provide better prompt engineering structure |

**Installation:** No dependencies. Agent files are static Markdown content distributed via npm package.

## Architecture Patterns

### Recommended Project Structure

```
topstepx/
  agents/                              # NEW directory (12 agent files)
    tsx-executor.md                    # AGT-01 (489+ lines)
    tsx-planner.md                     # AGT-02 (1,309+ lines)
    tsx-researcher.md                  # AGT-03 (631+ lines)
    tsx-verifier.md                    # AGT-04 (581+ lines)
    tsx-debugger.md                    # AGT-05 (1,257+ lines)
    tsx-codebase-mapper.md             # AGT-06 (772+ lines)
    tsx-plan-checker.md                # AGT-07 (708+ lines)
    tsx-roadmapper.md                  # AGT-08 (652+ lines)
    tsx-phase-researcher.md            # AGT-09 (555+ lines)
    tsx-research-synthesizer.md        # AGT-10 (249+ lines)
    tsx-integration-checker.md         # AGT-11 (445+ lines)
    tsx-nyquist-auditor.md             # AGT-12 (178+ lines)
  references/                          # Existing (Phase 1)
  templates/                           # Existing (Phase 2)
  bin/                                 # Existing (Phase 2)
```

### Pattern 1: GSD Agent Frontmatter Schema (Preserved Exactly)

**What:** Every agent file uses YAML frontmatter with specific fields, followed by Markdown system prompt content.

**When to use:** Every agent file.

**Example:**
```yaml
---
name: tsx-executor
description: Executes TSX plans with atomic commits, deviation handling, checkpoint protocols, and state management. Spawned by execute-phase orchestrator or execute-plan command.
tools: Read, Write, Edit, Bash, Grep, Glob
color: yellow
skills:
  - tsx-executor-workflow
# hooks:
#   PostToolUse:
#     - matcher: "Write|Edit"
#       hooks:
#         - type: command
#           command: "npx eslint --fix $FILE 2>/dev/null || true"
---
```

**Key points:**
- `name:` MUST use tsx- prefix (not gsd-)
- `description:` MUST reference TSX/trading context (not GSD)
- `tools:` Preserved from GSD source (platform-portable as comma-separated list)
- `color:` Preserved from GSD source
- `skills:` Changed from gsd-*-workflow to tsx-*-workflow
- `hooks:` Kept commented out (same pattern as GSD -- future use)

### Pattern 2: Agent Name Mapping (1:1 GSD to TSX)

**What:** Every GSD agent maps to exactly one TSX agent.

| GSD Agent | TSX Agent | REQUIREMENTS ID |
|-----------|-----------|-----------------|
| gsd-executor | tsx-executor | AGT-01 |
| gsd-planner | tsx-planner | AGT-02 |
| gsd-project-researcher | tsx-researcher | AGT-03 |
| gsd-verifier | tsx-verifier | AGT-04 |
| gsd-debugger | tsx-debugger | AGT-05 |
| gsd-codebase-mapper | tsx-codebase-mapper | AGT-06 |
| gsd-plan-checker | tsx-plan-checker | AGT-07 |
| gsd-roadmapper | tsx-roadmapper | AGT-08 |
| gsd-phase-researcher | tsx-phase-researcher | AGT-09 |
| gsd-research-synthesizer | tsx-research-synthesizer | AGT-10 |
| gsd-integration-checker | tsx-integration-checker | AGT-11 |
| gsd-nyquist-auditor | tsx-nyquist-auditor | AGT-12 |

**Note:** AGT-03 maps gsd-project-researcher to tsx-researcher (shorter name per REQUIREMENTS.md definition).

### Pattern 3: Path Replacement Rules (Mechanical)

**What:** Every path reference inside agent bodies must be rewritten.

| GSD Path Pattern | TSX Replacement |
|-----------------|-----------------|
| `$HOME/.claude/get-shit-done/bin/gsd-tools.cjs` | `$HOME/.claude/topstepx/bin/tsx-tools.cjs` |
| `$HOME/.claude/get-shit-done/references/` | `$HOME/.claude/topstepx/references/` |
| `$HOME/.claude/get-shit-done/templates/` | `$HOME/.claude/topstepx/templates/` |
| `$HOME/.claude/get-shit-done/workflows/` | `$HOME/.claude/topstepx/workflows/` |
| `C:/Users/bkevi/.claude/get-shit-done/` | Generic `$HOME/.claude/topstepx/` |
| `gsd-tools.cjs` (in CLI commands) | `tsx-tools.cjs` |
| `/gsd:` (command references) | `/tsx:` |
| `gsd-` (agent name references in prose) | `tsx-` |
| `gsd/phase-` (branch template refs) | `tsx/phase-` |
| `gsd_` (variable prefixes) | `tsx_` |

**Hardcoded absolute paths** (like `C:/Users/bkevi/.claude/get-shit-done/`) must be replaced with the portable `$HOME/.claude/topstepx/` form. The GSD source agents contain Windows-specific absolute paths that should NOT be carried over.

### Pattern 4: Trading Domain Injection (Content Specialization)

**What:** Trading-specific content added to agents beyond mechanical naming changes.

**For Primary Agents (executor, planner, researcher, verifier, debugger):**

1. **Reference Loading:** Add explicit files_to_read or context references to:
   - `$HOME/.claude/topstepx/references/TOPSTEPX_API.md`
   - `$HOME/.claude/topstepx/references/PINESCRIPT.md`
   - `$HOME/.claude/topstepx/references/safety-patterns.md`

2. **Role Enhancement:** Expand `<role>` section to mention trading domain awareness.

3. **Trading-Specific Patterns:**
   - Executor: deviation rules aware of trading safety (never remove bracket orders, never use bare enum integers)
   - Planner: plan validation checks for safety pattern inclusion
   - Researcher: trading ecosystem research context (TopStepX API, SignalR, PineScript conversion)
   - Verifier: trading-specific must-haves (enum constants, JWT refresh, rate limiting, bracket orders)
   - Debugger: trading debug patterns (JWT expiry, rate limit 429s, order rejection codes, WebSocket reconnection)

**For Supporting Agents (7 agents):**
- Lighter touch: naming changes + awareness of trading templates/references
- Plan-checker: validate plans include safety pattern compliance
- Integration-checker: verify trading API wiring (auth -> orders -> positions -> WebSocket events)
- Codebase-mapper: trading-specific analysis categories (strategy logic, risk management, API integration)
- Roadmapper, phase-researcher, research-synthesizer, nyquist-auditor: naming only + template path changes

### Pattern 5: Cross-Platform Frontmatter Portability

**What:** Agent frontmatter must work across Claude Code, OpenCode, Codex CLI, and Gemini CLI.

**Platform Field Support:**

| Field | Claude Code | OpenCode | Gemini CLI | Codex CLI |
|-------|------------|----------|------------|-----------|
| `name` | Required | Filename-based | Required | Filename-based |
| `description` | Required | Required | Required | N/A (body text) |
| `tools` | Optional (allowlist) | Via `permission` | Optional (allowlist) | N/A |
| `model` | Optional | Via `model` | Optional | N/A |
| `color` | Optional | Optional | N/A | N/A |
| `skills` | Optional | N/A | N/A | N/A |
| `hooks` | Optional | N/A | N/A | N/A |
| `max_turns` | `maxTurns` | `steps` | `max_turns` | N/A |

**Strategy:** Use Claude Code schema as primary (it's the most expressive). Keep `skills` and `hooks` in frontmatter (commented hooks, active skills) since these are ignored by other platforms. The Markdown body (system prompt) works identically on all platforms. Codex CLI reads the full file as markdown/AGENTS.md context -- frontmatter is harmlessly included.

### Anti-Patterns to Avoid

- **Architectural divergence:** Do NOT restructure agent sections, rename XML tags, reorder steps, or add new structural patterns that GSD doesn't use. TSX agents must be recognizably GSD agents with trading content.
- **Hardcoded absolute paths:** Do NOT carry over `C:/Users/bkevi/.claude/get-shit-done/` paths from GSD source. Use `$HOME/.claude/topstepx/` everywhere.
- **Over-specialization:** Do NOT add trading-specific sections that would bloat agents beyond their original scope. Trading context should enhance existing sections, not add dozens of new ones.
- **Bare enum integers in examples:** Any code example in agent prompts MUST use named enum constants (per SAF-01).
- **Platform-specific frontmatter:** Do NOT add fields that break parsing on any of the 4 target platforms. Stick to the GSD schema.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Agent file format | Custom JSON/TOML format | YAML frontmatter + Markdown (GSD pattern) | All 4 platforms expect this format |
| Path portability | Per-platform path logic in agent files | `$HOME/.claude/topstepx/` uniform prefix | `$HOME` resolves correctly on all platforms |
| Trading awareness | Separate trading overlay files | Inline trading context in agent body | GSD agents are self-contained; overlays would break the single-file pattern |
| Cross-platform compat | Platform detection in agents | Commented platform-specific fields | Agents are static content; runtime detection doesn't apply |

**Key insight:** These agents are static Markdown content files, not executable code. The "build" is authoring, not engineering. The complexity is in getting the content right (correct paths, correct trading context, correct naming), not in solving technical problems.

## Common Pitfalls

### Pitfall 1: Incomplete Path Replacement
**What goes wrong:** An agent file has 50 path references and 2 get missed, causing tsx-tools.cjs to be called as gsd-tools.cjs at runtime.
**Why it happens:** Large agent files (planner: 1,309 lines, debugger: 1,257 lines) have many scattered CLI command references.
**How to avoid:** After each agent adaptation, grep the output file for `gsd-`, `get-shit-done`, and `gsd_`. Zero matches = correct.
**Warning signs:** Any grep hit for gsd patterns in tsx-* agent files.

### Pitfall 2: Skill Reference Mismatch
**What goes wrong:** Frontmatter `skills:` references a GSD skill name that doesn't exist in TSX context.
**Why it happens:** GSD uses `gsd-executor-workflow`, `gsd-planner-workflow`, etc. These must become `tsx-executor-workflow`, `tsx-planner-workflow`.
**How to avoid:** Map all 12 skill references. Note: gsd-project-researcher and gsd-phase-researcher both reference `gsd-researcher-workflow` -- TSX should differentiate as `tsx-researcher-workflow` and `tsx-phase-researcher-workflow`.
**Warning signs:** Frontmatter `skills:` containing `gsd-` prefix.

### Pitfall 3: Windows Absolute Paths Carried Over
**What goes wrong:** Agent files contain `C:/Users/bkevi/.claude/get-shit-done/workflows/execute-plan.md` style paths from the GSD source machine.
**Why it happens:** GSD source was cloned/installed on a Windows machine with absolute paths baked into agent @ references.
**How to avoid:** Replace ALL absolute Windows paths with `$HOME/.claude/topstepx/` form. Grep for `C:/Users` and `C:\\Users` patterns.
**Warning signs:** Any `C:/Users` or `/c/Users` pattern in output files.

### Pitfall 4: Missing Trading Context in Primary Agents
**What goes wrong:** Agent is renamed tsx-executor but its system prompt has zero trading awareness -- it's just gsd-executor with find-and-replace naming.
**Why it happens:** Treating this as purely mechanical replacement without content enhancement.
**How to avoid:** Each primary agent needs explicit trading domain additions beyond naming: reference file loading, safety pattern awareness, and trading-specific examples or validation criteria.
**Warning signs:** An agent's `<role>` section mentions nothing about trading, TopStepX, or PineScript.

### Pitfall 5: Breaking Agent Self-References
**What goes wrong:** Agent references itself by old name in prose (e.g., "the gsd-executor will..." inside tsx-executor.md).
**Why it happens:** Agents frequently reference themselves and other agents by name in documentation/flow text.
**How to avoid:** Global replacement of all `gsd-` prefixed agent names with `tsx-` equivalents. Check inter-agent references too (e.g., planner mentions executor, executor mentions verifier).
**Warning signs:** grep for `gsd-executor|gsd-planner|gsd-verifier|gsd-debugger|gsd-researcher` in tsx-* output files.

### Pitfall 6: Over-Bloating Agents with Trading Content
**What goes wrong:** Adding 200+ lines of trading-specific content to an agent doubles its size and pushes it beyond effective system prompt length.
**Why it happens:** Enthusiasm for thoroughness in trading domain injection.
**How to avoid:** Trading additions should be concise insertions into existing sections, not new mega-sections. Primary agents: ~20-50 lines of trading additions. Supporting agents: ~10-20 lines.
**Warning signs:** Output file is >30% larger than GSD source.

## Code Examples

### Example 1: Frontmatter Adaptation (tsx-executor)

**Source (GSD):**
```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits, deviation handling, checkpoint protocols, and state management. Spawned by execute-phase orchestrator or execute-plan command.
tools: Read, Write, Edit, Bash, Grep, Glob
color: yellow
skills:
  - gsd-executor-workflow
# hooks:
#   PostToolUse:
#     - matcher: "Write|Edit"
#       hooks:
#         - type: command
#           command: "npx eslint --fix $FILE 2>/dev/null || true"
---
```

**Target (TSX):**
```yaml
---
name: tsx-executor
description: Executes TSX plans with atomic commits, deviation handling, checkpoint protocols, and state management. Trading domain aware -- loads TopStepX API, PineScript, and safety pattern references. Spawned by execute-phase orchestrator or execute-plan command.
tools: Read, Write, Edit, Bash, Grep, Glob
color: yellow
skills:
  - tsx-executor-workflow
# hooks:
#   PostToolUse:
#     - matcher: "Write|Edit"
#       hooks:
#         - type: command
#           command: "npx eslint --fix $FILE 2>/dev/null || true"
---
```

### Example 2: Path Replacement in CLI Commands

**Source (GSD):**
```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "${PHASE}")
```

**Target (TSX):**
```bash
INIT=$(node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" init execute-phase "${PHASE}")
```

### Example 3: Trading Domain Injection in Role Section

**Source (GSD executor `<role>`):**
```markdown
<role>
You are a GSD plan executor. You execute PLAN.md files atomically...
</role>
```

**Target (TSX executor `<role>`):**
```markdown
<role>
You are a TSX plan executor. You execute PLAN.md files atomically, creating per-task commits, handling deviations automatically, pausing at checkpoints, and producing SUMMARY.md files.

Spawned by `/tsx:execute-phase` orchestrator.

Your job: Execute the plan completely, commit each task, create SUMMARY.md, update STATE.md.

**Trading Domain Awareness:**
When executing plans that involve trading code, you MUST:
- Load `$HOME/.claude/topstepx/references/safety-patterns.md` for any task creating order placement, position management, or API integration code
- Verify all enum values use named constants (SAF-01), never bare integers
- Ensure bracket orders (stop-loss + take-profit) are included in any order placement code (SAF-01)
- Verify JWT token refresh patterns are implemented in any authentication code (SAF-02)
- Check rate limit compliance in any API call patterns (SAF-03)

**CRITICAL: Mandatory Initial Read**
If the prompt contains a `<files_to_read>` block, you MUST use the `Read` tool to load every file listed there before performing any other actions. This is your primary context.
</role>
```

### Example 4: Absolute Path Replacement (@ references)

**Source (GSD planner `<execution_context>`):**
```markdown
<execution_context>
@C:/Users/bkevi/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/bkevi/.claude/get-shit-done/templates/summary.md
</execution_context>
```

**Target (TSX planner):**
```markdown
<execution_context>
@$HOME/.claude/topstepx/workflows/execute-plan.md
@$HOME/.claude/topstepx/templates/summary.md
</execution_context>
```

### Example 5: Trading-Specific Verification (tsx-verifier)

**Addition to verifier's verification checklist:**
```markdown
**Trading-Specific Verification (when phase involves trading code):**
- [ ] All OrderSide, OrderType, OrderStatus values use named enum constants (grep for bare integers 0-7 in order code)
- [ ] Order placement includes stopLossBracket and takeProfitBracket (grep for `place` + `bracket`)
- [ ] JWT token storage includes expiry tracking and refresh via /api/Auth/validate
- [ ] API calls respect rate limits (50/30s for history, 200/60s general)
- [ ] SignalR connections use WebSocket transport with skipNegotiation:true and auto-reconnect
- [ ] PineScript conversions use barstate.isconfirmed (bar-close default)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AGENTS.md (single file) | Individual agent .md files with YAML frontmatter | 2025 (Claude Code, Gemini CLI, OpenCode) | Each agent is a separate file, enabling modular installation |
| JSON agent configs | Markdown + YAML frontmatter | 2025 | Universal cross-platform format |
| Hardcoded model in agent | `model: inherit` default with profile overrides | GSD pattern (current) | tsx-tools.cjs resolves model at spawn time via MODEL_PROFILES |
| Manual skill loading | `skills:` frontmatter field | Claude Code 2025 | Skills injected into agent context at startup |

**Deprecated/outdated:**
- Codex CLI's Task tool: Renamed to Agent tool in v2.1.63. TSX should reference "Agent" not "Task".
- OpenCode `maxSteps`: Deprecated in favor of `steps` field. Not relevant since GSD agents don't use this field.
- OpenCode `tools` field: Deprecated in favor of `permission` field. TSX agents use `tools` which is the Claude Code standard.

## Open Questions

1. **Workflow files don't exist yet**
   - What we know: Agent @ references point to `$HOME/.claude/topstepx/workflows/execute-plan.md` and similar files. These workflows are Phase 4 deliverables.
   - What's unclear: Should agent @ references point to workflow files that don't exist yet?
   - Recommendation: YES -- include the correct paths now. Agents will be installed alongside workflows. The planner/executor @ references serve as documentation of what the agent expects, not runtime includes. When Phase 4 delivers workflows, the references will resolve.

2. **Skill definitions don't exist yet**
   - What we know: Frontmatter `skills:` references like `tsx-executor-workflow` point to skill definitions that haven't been created.
   - What's unclear: Will skills be separate files or part of the agent itself?
   - Recommendation: Keep `skills:` references in frontmatter. GSD uses them and TSX should mirror the pattern. Skills will be created as part of workflow/installer phases. For now, they serve as forward references.

3. **tsx-researcher vs tsx-project-researcher naming**
   - What we know: REQUIREMENTS.md calls AGT-03 "tsx-researcher" but the GSD source is "gsd-project-researcher" (631 lines). There's also AGT-09 "tsx-phase-researcher" from "gsd-phase-researcher" (555 lines).
   - What's unclear: Should AGT-03 be `tsx-researcher` or `tsx-project-researcher`?
   - Recommendation: Use `tsx-researcher` as specified in REQUIREMENTS.md. The GSD naming distinction (project-researcher vs phase-researcher) is preserved functionally in TSX via tsx-researcher (project-level) vs tsx-phase-researcher (phase-level). MODEL_PROFILES in core.cjs already uses `tsx-project-researcher` so plan must update that mapping OR keep the file named tsx-researcher.md but have the model profile key match.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (grep-based) |
| Config file | None -- agent files are static Markdown content |
| Quick run command | `grep -rl "gsd-\|get-shit-done\|gsd_" topstepx/agents/ \| wc -l` (must be 0) |
| Full suite command | `for f in topstepx/agents/tsx-*.md; do echo "=== $f ==="; grep -c "gsd-\|get-shit-done\|gsd_\|C:/Users" "$f"; done` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AGT-01 | tsx-executor exists with trading awareness | smoke | `grep -l "trading\|TopStepX\|safety" topstepx/agents/tsx-executor.md` | Wave 0 |
| AGT-02 | tsx-planner exists with trading awareness | smoke | `grep -l "trading\|TopStepX\|safety" topstepx/agents/tsx-planner.md` | Wave 0 |
| AGT-03 | tsx-researcher exists with trading awareness | smoke | `grep -l "trading\|TopStepX" topstepx/agents/tsx-researcher.md` | Wave 0 |
| AGT-04 | tsx-verifier exists with trading verification | smoke | `grep -l "trading\|TopStepX\|safety\|enum\|bracket" topstepx/agents/tsx-verifier.md` | Wave 0 |
| AGT-05 | tsx-debugger exists with trading debug patterns | smoke | `grep -l "trading\|TopStepX\|JWT\|rate.limit\|WebSocket\|SignalR" topstepx/agents/tsx-debugger.md` | Wave 0 |
| AGT-06 | tsx-codebase-mapper exists | smoke | `test -f topstepx/agents/tsx-codebase-mapper.md && echo PASS` | Wave 0 |
| AGT-07 | tsx-plan-checker exists | smoke | `test -f topstepx/agents/tsx-plan-checker.md && echo PASS` | Wave 0 |
| AGT-08 | tsx-roadmapper exists | smoke | `test -f topstepx/agents/tsx-roadmapper.md && echo PASS` | Wave 0 |
| AGT-09 | tsx-phase-researcher exists | smoke | `test -f topstepx/agents/tsx-phase-researcher.md && echo PASS` | Wave 0 |
| AGT-10 | tsx-research-synthesizer exists | smoke | `test -f topstepx/agents/tsx-research-synthesizer.md && echo PASS` | Wave 0 |
| AGT-11 | tsx-integration-checker exists | smoke | `test -f topstepx/agents/tsx-integration-checker.md && echo PASS` | Wave 0 |
| AGT-12 | tsx-nyquist-auditor exists | smoke | `test -f topstepx/agents/tsx-nyquist-auditor.md && echo PASS` | Wave 0 |
| SC-3 | No architectural divergence from GSD | smoke | `diff <(grep -c '<' topstepx/agents/tsx-executor.md) <(grep -c '<' ~/.claude/agents/gsd-executor.md)` (XML tag count roughly matches) | Wave 0 |
| SC-4 | Frontmatter portable across 4 platforms | manual | Visual inspection: name, description, tools fields present; no platform-breaking fields | manual-only |

### Sampling Rate
- **Per task commit:** `grep -rl "gsd-\|get-shit-done" topstepx/agents/ | wc -l` (must be 0)
- **Per wave merge:** Full suite (all 12 files checked for naming, paths, trading content)
- **Phase gate:** All 12 agents exist, zero GSD naming remnants, trading content in primary agents

### Wave 0 Gaps
None -- no test infrastructure needed. Agent files are static Markdown content verified by grep commands. The verification commands listed above serve as the test suite.

## Agent Size Inventory (for Plan Sizing)

| GSD Source | Lines | Size | Category | Adaptation Effort |
|-----------|-------|------|----------|-------------------|
| gsd-planner.md | 1,309 | 43KB | Primary | HIGH -- largest file, many path refs, deep trading injection |
| gsd-debugger.md | 1,257 | 38KB | Primary | HIGH -- second largest, trading debug patterns needed |
| gsd-codebase-mapper.md | 772 | 17KB | Supporting | MEDIUM -- trading analysis categories |
| gsd-plan-checker.md | 708 | 13KB | Supporting | MEDIUM -- safety compliance checks |
| gsd-roadmapper.md | 652 | 17KB | Supporting | LOW-MEDIUM -- mostly naming |
| gsd-project-researcher.md | 631 | 16KB | Primary | MEDIUM -- trading research context |
| gsd-verifier.md | 581 | 19KB | Primary | MEDIUM -- trading verification checks |
| gsd-phase-researcher.md | 555 | 18KB | Supporting | LOW-MEDIUM -- mostly naming |
| gsd-executor.md | 489 | 19KB | Primary | MEDIUM -- trading safety deviation rules |
| gsd-integration-checker.md | 445 | 13KB | Supporting | MEDIUM -- trading integration wiring |
| gsd-research-synthesizer.md | 249 | 7KB | Supporting | LOW -- mostly naming |
| gsd-nyquist-auditor.md | 178 | 5KB | Supporting | LOW -- mostly naming |
| **TOTAL** | **7,826** | **245KB** | | |

### Recommended Plan Split

**Plan A (Wave 1): 5 Primary Agents** -- ~4,267 lines input, HIGH adaptation effort
- tsx-executor (489 lines source)
- tsx-planner (1,309 lines source)
- tsx-researcher (631 lines source, from gsd-project-researcher)
- tsx-verifier (581 lines source)
- tsx-debugger (1,257 lines source)
- These need deep trading domain injection + full naming/path replacement

**Plan B (Wave 1, parallel with A): 7 Supporting Agents** -- ~3,559 lines input, LOW-MEDIUM effort
- tsx-codebase-mapper (772 lines source)
- tsx-plan-checker (708 lines source)
- tsx-roadmapper (652 lines source)
- tsx-phase-researcher (555 lines source)
- tsx-research-synthesizer (249 lines source)
- tsx-integration-checker (445 lines source)
- tsx-nyquist-auditor (178 lines source)
- These need naming/path replacement + lighter trading context

Both plans are Wave 1 (parallel-eligible) since agents don't depend on each other at authoring time.

## Sources

### Primary (HIGH confidence)
- GSD agent source files at `$HOME/.claude/agents/gsd-*.md` -- all 12 files read and analyzed for structure, size, content patterns, path references, and inter-agent references
- Existing TSX adapted content at `topstepx/references/`, `topstepx/templates/`, `topstepx/bin/` -- confirmed naming conventions, path patterns, and model profile keys from Phases 1-2
- `topstepx/bin/lib/core.cjs` -- confirmed MODEL_PROFILES uses tsx-* agent keys (12 entries)
- `topstepx/references/model-profiles.md` -- confirmed model profile documentation uses tsx-* names

### Secondary (MEDIUM confidence)
- Claude Code subagent docs (https://code.claude.com/docs/en/sub-agents) -- confirmed YAML frontmatter schema: name, description, tools, model, skills, hooks, color, maxTurns, permissionMode, mcpServers, memory, background, isolation
- Gemini CLI subagent docs (https://geminicli.com/docs/core/subagents/) -- confirmed YAML frontmatter: name, description, tools, model, temperature, max_turns, timeout_mins
- OpenCode agent docs (https://opencode.ai/docs/agents/) -- confirmed frontmatter: description, mode, model, temperature, steps, permission, color, hidden, disable
- Codex CLI AGENTS.md docs (https://developers.openai.com/codex/guides/agents-md/) -- confirmed: reads standard Markdown, no strict frontmatter schema required

### Tertiary (LOW confidence)
- None. All findings verified against primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- agent format is well-documented for all 4 platforms and established by GSD
- Architecture: HIGH -- direct 1:1 mapping from GSD source files with known structure
- Pitfalls: HIGH -- identified from analysis of actual GSD source content and established Phase 1-2 adaptation patterns
- Cross-platform: MEDIUM -- Claude Code and Gemini CLI schemas verified against official docs; OpenCode and Codex CLI verified but those platforms have less strict requirements

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable -- agent file formats are mature across all platforms)
