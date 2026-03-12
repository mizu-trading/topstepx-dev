# Phase 6: Language Adaptation Workflow - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the `adapt-language` workflow that converts an existing TopStepX trading bot from any supported language to any other supported language. The workflow must analyze source code, map libraries to idiomatic target equivalents, generate target code preserving all trading logic and safety guardrails, and use language profiles (not hardcoded pairs) for extensibility.

This is a NEW workflow file (`topstepx/workflows/adapt-language.md`), not a modification of an existing workflow. It follows the same orchestration patterns established in Phases 4-5 (step-based workflow with agent delegation, auto-mode support, safety verification).

</domain>

<decisions>
## Implementation Decisions

### Language profile design
- Language profiles are defined INLINE within the workflow as structured sections (not separate reference files), matching the single-file workflow pattern used across TSX
- Each profile specifies: language name, runtime version, package manager, library mappings (SignalR client, HTTP client, indicator library, async model), naming conventions (camelCase vs snake_case), and bot scaffold template reference
- Initial profiles: JavaScript/TypeScript (Node.js) and Python — the two languages with existing bot scaffolds (bot-scaffold-js.md, bot-scaffold-python.md)
- Adding a new language requires only adding a new profile section to the workflow — no branching logic changes

### Source code analysis approach
- The workflow performs inline source analysis (not agent delegation) in its analysis step — reads source files, identifies TopStepX API patterns, catalogs libraries, maps file structure
- Analysis output populates the language-adaptation.md template (already created in Phase 2) which becomes the adaptation plan
- Source analysis should detect: REST API calls (auth, orders, positions, contracts), WebSocket connections (SignalR hubs, event handlers, subscriptions), safety patterns (enums, brackets, rate limiting, JWT refresh, error handling), and strategy logic (indicators, entry/exit conditions)

### Conversion execution model
- File-by-file conversion: each source file maps to a target file, with the adaptation report as the guide
- The workflow generates target code using the target language's bot scaffold template as the structural base, injecting source strategy logic translated to target idioms
- Order of conversion: safety infrastructure first (enums, auth, rate limiter), then API integration (REST, WebSocket), then strategy logic last — mirrors the trading build order pattern established in prior phases

### Safety verification step
- Mandatory safety verification BEFORE the workflow marks conversion complete — uses the Safety Preservation table from the language-adaptation.md template
- Every SAF-01 through SAF-05 pattern must be verified present in target code with grep-able patterns (enum constants, bracket order defaults, position sizing, JWT refresh timer, rate limiter, error handling, graceful shutdown)
- Safety confidence MUST be HIGH — if any safety pattern is missing, the conversion is incomplete and the workflow blocks

### Workflow structure
- Follow the established TSX workflow pattern: step-based with numbered steps, auto-mode support, AskUserQuestion for interactive decisions, agent spawning for research
- Approximate step flow: (1) Setup/init, (2) Source analysis, (3) Language profile selection, (4) Library mapping confirmation, (5) Adaptation report generation, (6) Code generation, (7) Safety verification, (8) Completion summary
- Auto-mode: skip interactive confirmations, auto-select target language from arguments, auto-generate adaptation report and code
- The workflow references but does NOT duplicate content from: safety-patterns.md, bot-scaffold-js.md, bot-scaffold-python.md, language-adaptation.md template

### Claude's Discretion
- Exact step numbering and substep organization within the workflow
- Whether to use tsx-researcher agent for library lookup or inline Context7 queries
- How to handle partial conversions (some files converted, others pending)
- Error recovery strategy when source code uses patterns not in the language profile

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `topstepx/templates/language-adaptation.md`: Complete report template with source analysis, library mapping, API pattern mapping, safety preservation table, test plan, and confidence ratings — this is the primary output artifact
- `topstepx/templates/bot-scaffold-js.md`: JavaScript/TypeScript bot scaffold with all SAF-01 through SAF-05 patterns implemented — use as structural base for JS target
- `topstepx/templates/bot-scaffold-python.md`: Python bot scaffold with all SAF-01 through SAF-05 patterns implemented — use as structural base for Python target
- `topstepx/references/safety-patterns.md`: Complete safety pattern reference with grep-able verification commands

### Established Patterns
- Workflow file structure: `<purpose>`, `<auto_mode>`, `<process>` with numbered `<step>` elements, success criteria — see new-project.md (1,307 lines) as the gold standard
- Trading build order: references -> auth -> data -> strategy -> risk -> bot lifecycle
- Safety patterns are NON-OPTIONAL and verified with automated grep checks
- Agent spawning uses tsx-* agent references with `@topstepx/` path prefixes
- tsx-tools.cjs provides init, commit, state management CLI operations

### Integration Points
- Workflow will be referenced by `/tsx:adapt-language` command (Phase 9, CMD-31)
- Workflow should use `tsx-tools.cjs init` for setup, matching other workflow patterns
- Adaptation report lives in `.planning/` directory alongside other project artifacts
- Completion routes to `/tsx:verify-work` or `/tsx:progress`

</code_context>

<specifics>
## Specific Ideas

- The language-adaptation.md template (Phase 2) already defines the complete report structure — the workflow should produce this report as its primary output
- Library mapping table should include concrete library names: `@microsoft/signalr` -> `pysignalr`, `node-fetch`/built-in `fetch` -> `aiohttp`, `trading-signals` -> `pandas-ta`
- The workflow should support both directions: JS->Python and Python->JS, using the same profile-based approach
- PineScript source code is NOT in scope for this workflow — that's Phase 7's adapt-pinescript workflow

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-language-adaptation-workflow*
*Context gathered: 2026-03-12*
