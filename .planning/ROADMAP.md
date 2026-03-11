# Roadmap: TSX — TopStepX AI Skill Framework

## Overview

TSX transforms a working npm skill package into a full GSD-style AI framework for building TopStepX trading bots. The build order is bottom-up: passive content (references, templates) first, then agents that load that content, then workflows that orchestrate those agents, then thin command entry points that delegate to workflows, and finally the expanded installer that distributes everything. Each phase delivers a coherent, independently verifiable layer of the framework.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: References and Domain Knowledge** - Complete trading domain reference materials with safety patterns (completed 2026-03-11)
- [ ] **Phase 2: Templates and State Tooling** - Output format standards and state management infrastructure
- [ ] **Phase 3: Trading-Aware Agents** - All 12 agents adapted from GSD with trading domain context
- [ ] **Phase 4: Core Execution Workflows** - GSD-adapted orchestration engine (plan, execute, verify, discuss)
- [ ] **Phase 5: From-Scratch Workflow** - Trading-specific new-project questioning and generation flow
- [ ] **Phase 6: Language Adaptation Workflow** - Cross-language TopStepX code conversion
- [ ] **Phase 7: PineScript Conversion Workflow** - TradingView PineScript to live TopStepX bot conversion
- [ ] **Phase 8: Core Commands** - Primary command entry points for all main workflows
- [ ] **Phase 9: Extended Commands** - Phase management, utility, and TSX-specific commands
- [ ] **Phase 10: Installer and Distribution** - Expanded installer, packaging, and documentation

## Phase Details

### Phase 1: References and Domain Knowledge
**Goal**: AI agents have complete, accurate TopStepX and PineScript domain knowledge available as loadable references, with safety patterns embedded from day one
**Depends on**: Nothing (first phase)
**Requirements**: REF-01, REF-02, REF-03, REF-04, SAF-01, SAF-02, SAF-03, SAF-04, SAF-05
**Success Criteria** (what must be TRUE):
  1. TOPSTEPX_API.md exists as a consolidated reference in topstepx/references/ and covers REST, WebSocket, and enum documentation
  2. PINESCRIPT.md exists in topstepx/references/ and covers v6 syntax, repainting detection, barstate.isconfirmed, request.security() lookahead, and strategy/ta function mappings
  3. A trading-specific questioning guide exists that covers instruments, strategy type, risk tolerance, and account type
  4. All GSD reference materials (git integration, checkpoints, verification patterns, model profiles) are adapted with tsx-* naming
  5. Safety content is embedded in references: risk guardrail patterns, JWT refresh patterns, rate limit constants, repainting audit steps, and error handling patterns are documented and ready for agents/templates to consume
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Core domain references (TOPSTEPX_API.md, PINESCRIPT.md, safety-patterns.md)
- [x] 01-02-PLAN.md — Trading questioning guide + 7 light GSD reference adaptations + package.json
- [x] 01-03-PLAN.md — 2 heavy GSD reference adaptations (checkpoints.md, verification-patterns.md)

### Phase 2: Templates and State Tooling
**Goal**: The framework has all output format templates for trading artifacts and the CLI state management utility that workflows depend on
**Depends on**: Phase 1
**Requirements**: TPL-01, TPL-02, TPL-03, TPL-04, TPL-05, TPL-06, TPL-07, INF-01
**Success Criteria** (what must be TRUE):
  1. All GSD templates (project, requirements, roadmap, state, config, context, plans, summaries, verification reports, UAT) are adapted with TSX naming and trading domain context
  2. Trading-specific templates exist: strategy specification (indicators, entries/exits, risk params), API integration plan (auth, endpoints, WebSocket subs), risk parameters (sizing, max loss, daily limits), bot scaffolds (JS/TS and Python), PineScript conversion report, and language adaptation report
  3. tsx-tools.cjs exists and provides state management CLI operations (read/write .planning/ state, config access, phase indexing) matching gsd-tools.cjs functionality
  4. Risk guardrails from Phase 1 safety content are baked into bot scaffold and order placement templates as non-optional defaults (bracket orders, position limits, enum constants)
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Adapt 24 top-level GSD templates with tsx naming and trading examples
- [ ] 02-02-PLAN.md — Adapt 12 subdirectory GSD templates + create 7 new trading-specific templates
- [ ] 02-03-PLAN.md — Adapt tsx-tools.cjs CLI utility with 11 lib modules

### Phase 3: Trading-Aware Agents
**Goal**: A complete roster of 12 trading-aware agents is available for workflow orchestration, each loading appropriate references and templates before executing
**Depends on**: Phase 2
**Requirements**: AGT-01, AGT-02, AGT-03, AGT-04, AGT-05, AGT-06, AGT-07, AGT-08, AGT-09, AGT-10, AGT-11, AGT-12
**Success Criteria** (what must be TRUE):
  1. All 5 primary agents exist (tsx-executor, tsx-planner, tsx-researcher, tsx-verifier, tsx-debugger) with trading domain awareness, explicit reference loading (TOPSTEPX_API.md, PINESCRIPT.md), and GSD-compatible frontmatter schema
  2. All 7 supporting agents exist (tsx-codebase-mapper, tsx-plan-checker, tsx-roadmapper, tsx-phase-researcher, tsx-research-synthesizer, tsx-integration-checker, tsx-nyquist-auditor) with trading-specific validation context
  3. Every agent follows GSD agent structure (role definition, execution flow, files_to_read, constraints) with only content specialization, not architectural divergence
  4. Agent frontmatter is portable across all 4 target platforms (Claude Code, OpenCode, Codex CLI, Gemini CLI)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Core Execution Workflows
**Goal**: The framework's execution engine can discuss, plan, execute, and verify any trading phase using the wave-based parallel execution model
**Depends on**: Phase 3
**Requirements**: WKF-02, WKF-03, WKF-04, WKF-05, WKF-06
**Success Criteria** (what must be TRUE):
  1. discuss-phase workflow gathers trading implementation context by spawning tsx-researcher and tsx-phase-researcher agents with domain references loaded
  2. plan-phase workflow creates detailed execution plans by spawning tsx-planner and tsx-plan-checker, producing plans that reference trading templates and safety patterns
  3. execute-phase workflow runs wave-based parallel execution with atomic commits per task, spawning tsx-executor with trading awareness
  4. verify-work workflow validates built features through conversational UAT by spawning tsx-verifier with trading-specific validation checks
  5. All remaining GSD workflows (pause, resume, progress, quick, debug, map-codebase, health, etc.) are adapted with tsx-* agent references and trading state awareness
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: From-Scratch Workflow
**Goal**: A user can start from zero and be guided through a complete trading bot project creation: requirements gathering, research, roadmap, and phase execution
**Depends on**: Phase 4
**Requirements**: WKF-01
**Success Criteria** (what must be TRUE):
  1. The new-project workflow asks trading-specific questions (instrument class, strategy type, execution model, risk tolerance, account type) that meaningfully differentiate bot architectures
  2. The workflow produces a complete .planning/ directory (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md) with trading-domain content populated from user answers
  3. Risk parameters (position sizing, max loss, max contracts, daily limits) are captured during questioning and embedded in project requirements before any code generation begins
  4. The workflow routes into plan-phase for the first phase after project initialization, creating a seamless start-to-execution flow
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Language Adaptation Workflow
**Goal**: A user can convert an existing TopStepX trading bot from any supported language to any other supported language
**Depends on**: Phase 4
**Requirements**: WKF-07
**Success Criteria** (what must be TRUE):
  1. The adapt-language workflow analyzes source code to identify TopStepX API usage patterns, library dependencies, and trading logic
  2. The workflow maps source libraries to idiomatic target-language equivalents (e.g., @microsoft/signalr to pysignalr, trading-signals to pandas-ta)
  3. The workflow generates target code that preserves all trading logic, API integration patterns, and risk guardrails from the source
  4. The workflow uses language profiles (not hardcoded language pairs) so adding new language support requires only a new profile, not branching logic
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: PineScript Conversion Workflow
**Goal**: A user can take a TradingView PineScript strategy and get a working, live-tradeable TopStepX bot with safety guardrails
**Depends on**: Phase 4
**Requirements**: WKF-08
**Success Criteria** (what must be TRUE):
  1. The adapt-pinescript workflow parses PineScript strategy to extract entry/exit conditions, position management, indicator logic, and risk parameters
  2. The workflow maps PineScript concepts to TopStepX API equivalents (strategy.entry to order placement, ta.* to trading-signals/pandas-ta, alertcondition to event handlers)
  3. The workflow includes a signal confirmation decision step that identifies and flags repainting indicators, defaulting to confirmed-bar-only signals
  4. The workflow audits multi-timeframe references (request.security) for lookahead bias and applies [1] offset defaults
  5. Generated bot code includes all safety guardrails (bracket orders, risk limits, JWT refresh, rate limiting, enum constants) as non-optional defaults
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Core Commands
**Goal**: Users can invoke all primary framework operations through /tsx:* commands that delegate to workflows
**Depends on**: Phase 5, Phase 6, Phase 7
**Requirements**: CMD-01, CMD-02, CMD-03, CMD-04, CMD-05, CMD-06, CMD-07, CMD-08, CMD-09, CMD-10, CMD-11, CMD-12
**Success Criteria** (what must be TRUE):
  1. All 8 core workflow commands exist (/tsx:new-project, discuss-phase, plan-phase, execute-phase, verify-work, audit-milestone, complete-milestone, new-milestone) with YAML frontmatter and workflow delegation
  2. All 4 navigation commands exist (/tsx:progress, resume-work, pause-work, help) and correctly read/write .planning/ state
  3. Every command is a thin entry point (20-40 lines, zero logic) that delegates to its corresponding workflow
  4. Commands follow GSD's exact YAML frontmatter schema for cross-platform portability
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: Extended Commands
**Goal**: The complete TSX command set is available, covering phase management, utilities, and TSX-specific operations
**Depends on**: Phase 8
**Requirements**: CMD-13, CMD-14, CMD-15, CMD-16, CMD-17, CMD-18, CMD-19, CMD-20, CMD-21, CMD-22, CMD-23, CMD-24, CMD-25, CMD-26, CMD-27, CMD-28, CMD-29, CMD-30, CMD-31, CMD-32
**Success Criteria** (what must be TRUE):
  1. All 5 phase management commands exist (/tsx:add-phase, insert-phase, remove-phase, list-phase-assumptions, plan-milestone-gaps) and correctly modify ROADMAP.md
  2. All 13 utility commands exist (/tsx:map-codebase, quick, debug, add-todo, check-todos, settings, set-profile, update, research-phase, validate-phase, health, cleanup, add-tests) with appropriate workflow delegation
  3. Both TSX-specific commands exist (/tsx:adapt-language, adapt-pinescript) and delegate to their respective workflows from Phases 6 and 7
  4. All commands are thin entry points following the same schema as Phase 8 core commands
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Installer and Distribution
**Goal**: TSX is a complete, installable npm package that distributes the full framework to all 4 target platforms alongside GSD
**Depends on**: Phase 9
**Requirements**: INF-02, INF-03, INF-04, INF-05, INF-06, INF-07, INF-08
**Success Criteria** (what must be TRUE):
  1. The installer copies commands/tsx/, agents/tsx-*.md, topstepx/ (workflows, templates, references, bin) to the target platform's directories
  2. The installer works on all 4 platforms (Claude Code, OpenCode, Codex CLI, Gemini CLI) with correct path prefix rewriting per platform
  3. TSX installs alongside GSD without conflicts (/tsx:* commands coexist with /gsd:*, tsx-* agents coexist with gsd-* agents)
  4. Uninstall support cleanly removes all TSX-installed files from the target platform
  5. package.json, README.md, and LICENSE are updated with full framework branding and visible GSD attribution
**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5/6/7 (parallel-eligible) -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. References and Domain Knowledge | 3/3 | Complete   | 2026-03-11 |
| 2. Templates and State Tooling | 0/3 | Not started | - |
| 3. Trading-Aware Agents | 0/TBD | Not started | - |
| 4. Core Execution Workflows | 0/TBD | Not started | - |
| 5. From-Scratch Workflow | 0/TBD | Not started | - |
| 6. Language Adaptation Workflow | 0/TBD | Not started | - |
| 7. PineScript Conversion Workflow | 0/TBD | Not started | - |
| 8. Core Commands | 0/TBD | Not started | - |
| 9. Extended Commands | 0/TBD | Not started | - |
| 10. Installer and Distribution | 0/TBD | Not started | - |
