# Requirements — TSX v1

## v1 Requirements

### Commands (CMD)

Every GSD command gets a TSX equivalent (`/tsx:*` prefix).

**Core Workflow:**
- [x] **CMD-01**: `/tsx:new-project` — Initialize trading project with domain-specific questioning
- [x] **CMD-02**: `/tsx:discuss-phase` — Gather phase implementation context
- [x] **CMD-03**: `/tsx:plan-phase` — Create detailed execution plans for a phase
- [x] **CMD-04**: `/tsx:execute-phase` — Execute plans with wave-based parallelization
- [x] **CMD-05**: `/tsx:verify-work` — Validate built features through conversational UAT
- [x] **CMD-06**: `/tsx:audit-milestone` — Audit milestone completion against goals
- [x] **CMD-07**: `/tsx:complete-milestone` — Archive milestone, tag release
- [x] **CMD-08**: `/tsx:new-milestone` — Start next version cycle

**Navigation:**
- [x] **CMD-09**: `/tsx:progress` — Show status and route to next action
- [x] **CMD-10**: `/tsx:resume-work` — Restore context from last session
- [x] **CMD-11**: `/tsx:pause-work` — Save handoff when stopping mid-phase
- [x] **CMD-12**: `/tsx:help` — Show all TSX commands

**Phase Management:**
- [ ] **CMD-13**: `/tsx:add-phase` — Append phase to roadmap
- [ ] **CMD-14**: `/tsx:insert-phase` — Insert urgent work as decimal phase
- [ ] **CMD-15**: `/tsx:remove-phase` — Remove future phase
- [ ] **CMD-16**: `/tsx:list-phase-assumptions` — Surface approach assumptions
- [ ] **CMD-17**: `/tsx:plan-milestone-gaps` — Create phases to close audit gaps

**Utilities:**
- [ ] **CMD-18**: `/tsx:map-codebase` — Analyze existing trading codebase
- [ ] **CMD-19**: `/tsx:quick` — Execute ad-hoc tasks with GSD guarantees
- [ ] **CMD-20**: `/tsx:debug` — Systematic debugging for trading integrations
- [ ] **CMD-21**: `/tsx:add-todo` — Capture idea for later
- [ ] **CMD-22**: `/tsx:check-todos` — List pending todos
- [ ] **CMD-23**: `/tsx:settings` — Configure workflow toggles
- [ ] **CMD-24**: `/tsx:set-profile` — Switch model profile
- [ ] **CMD-25**: `/tsx:update` — Update TSX to latest version
- [ ] **CMD-26**: `/tsx:research-phase` — Deep domain research for a phase
- [ ] **CMD-27**: `/tsx:validate-phase` — Retroactive validation
- [ ] **CMD-28**: `/tsx:health` — Check .planning/ integrity
- [ ] **CMD-29**: `/tsx:cleanup` — Clean up temporary files
- [ ] **CMD-30**: `/tsx:add-tests` — Add tests to existing phase

**TSX-Specific:**
- [ ] **CMD-31**: `/tsx:adapt-language` — Convert TopStepX code between languages
- [ ] **CMD-32**: `/tsx:adapt-pinescript` — Convert PineScript strategy to TopStepX trading bot

### Agents (AGT)

Every GSD agent gets a TSX equivalent (`tsx-*` prefix) with trading domain context.

- [x] **AGT-01**: `tsx-executor` — Execute plans with trading domain awareness, loads API/PineScript refs
- [x] **AGT-02**: `tsx-planner` — Create phase plans specialized for trading integrations
- [x] **AGT-03**: `tsx-researcher` — Research trading patterns, API capabilities, library options
- [x] **AGT-04**: `tsx-verifier` — Verify trading bot implementations against requirements
- [x] **AGT-05**: `tsx-debugger` — Debug trading-specific issues (API errors, WebSocket drops, order failures)
- [x] **AGT-06**: `tsx-codebase-mapper` — Analyze existing trading codebases
- [x] **AGT-07**: `tsx-plan-checker` — Validate plans achieve trading phase goals
- [x] **AGT-08**: `tsx-roadmapper` — Create roadmaps from trading requirements
- [x] **AGT-09**: `tsx-phase-researcher` — Research how to implement a trading phase
- [x] **AGT-10**: `tsx-research-synthesizer` — Synthesize trading domain research
- [x] **AGT-11**: `tsx-integration-checker` — Verify cross-phase integration for trading systems
- [x] **AGT-12**: `tsx-nyquist-auditor` — Validate test coverage for trading phases

### Workflows (WKF)

**GSD-Adapted Core:**
- [x] **WKF-01**: `new-project` workflow — Trading-specific questioning, risk parameter gathering
- [x] **WKF-02**: `discuss-phase` workflow — Trading implementation context gathering
- [x] **WKF-03**: `plan-phase` workflow — Research + plan + verify for trading phases
- [x] **WKF-04**: `execute-phase` workflow — Wave-based parallel execution with trading awareness
- [x] **WKF-05**: `verify-work` workflow — UAT with trading-specific validation checks
- [x] **WKF-06**: All remaining GSD workflows adapted (pause, resume, progress, quick, debug, etc.)

**TSX-Specific:**
- [x] **WKF-07**: `adapt-language` workflow — Any-to-any language conversion for TopStepX code
- [x] **WKF-08**: `adapt-pinescript` workflow — PineScript → TopStepX live trading bot conversion

### Templates (TPL)

**GSD-Adapted:**
- [x] **TPL-01**: All GSD templates adapted (project, requirements, roadmap, state, config, context, plans, summaries, verification reports, UAT)

**TSX-Specific:**
- [x] **TPL-02**: Strategy specification template — Trading strategy definition (indicators, entry/exit conditions, risk params)
- [x] **TPL-03**: API integration plan template — Authentication, endpoints used, WebSocket subscriptions
- [x] **TPL-04**: Risk parameters template — Position sizing, max loss, max contracts, daily limits
- [x] **TPL-05**: Bot scaffold templates — Starter code for JS/TS and Python trading bots
- [x] **TPL-06**: PineScript conversion report template — Mapping from PineScript to TopStepX API calls
- [x] **TPL-07**: Language adaptation report template — Source analysis, target mapping, test plan

### References (REF)

- [ ] **REF-01**: `TOPSTEPX_API.md` — Complete TopStepX API documentation (exists, needs integration as reference)
- [ ] **REF-02**: `PINESCRIPT.md` — PineScript language + conversion mapping reference (created)
- [ ] **REF-03**: Trading-specific questioning guide — Domain-adapted questioning.md for trading projects
- [ ] **REF-04**: All GSD references adapted (git integration, checkpoints, verification patterns, UI brand, model profiles, etc.)

### Infrastructure (INF)

- [x] **INF-01**: `tsx-tools.cjs` — CLI utilities adapted from gsd-tools.cjs for trading state management
- [ ] **INF-02**: Installer — Full framework install (commands, agents, workflows, templates, references)
- [ ] **INF-03**: Installer — All 4 platforms (Claude Code, OpenCode, Codex CLI, Gemini CLI)
- [ ] **INF-04**: Installer — GSD coexistence (tsx:* alongside gsd:* with zero conflicts)
- [ ] **INF-05**: Installer — Uninstall support (clean removal from target platform)
- [ ] **INF-06**: `package.json` — Updated for full framework distribution
- [ ] **INF-07**: `README.md` — Complete documentation with GSD credits
- [ ] **INF-08**: GSD attribution — Credits in README, package.json, LICENSE

### Safety (SAF)

- [ ] **SAF-01**: Risk guardrails in templates — Position sizing limits, max loss checks, enum constants (never bare integers)
- [ ] **SAF-02**: JWT token refresh patterns — 24hr expiry handling in all bot templates
- [ ] **SAF-03**: Rate limit awareness — Agents know TopStepX limits (50/30s history, 200/60s general)
- [ ] **SAF-04**: PineScript repainting audit — Conversion workflow includes signal confirmation step
- [ ] **SAF-05**: Error handling patterns — Rejected orders, connection drops, API errors in templates

---

## v2 Requirements (Deferred)

- [ ] Test suite for installer and tsx-tools.cjs
- [ ] Input validation on installer flags
- [ ] Backtesting integration (using TopStepX historical data)
- [ ] Strategy performance reporting templates
- [ ] Multi-account support in bot scaffolds
- [ ] Community strategy library (shared PineScript conversions)

## Out of Scope

- **Runtime trading execution** — TSX teaches AI agents to build, it doesn't trade itself
- **Backtesting engine** — agents build code that uses TopStepX's own capabilities
- **UI/dashboard components** — TSX is CLI-installed static content
- **Proprietary strategy logic** — TSX provides structure, not trading alpha
- **GSD core modification** — TSX extends GSD, doesn't fork or replace it
- **Multi-broker abstraction** — TSX is TopStepX-specific, not a generic trading framework
- **Strategy IP protection** — no encryption/obfuscation of user strategies

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| REF-01 | Phase 1 | Pending |
| REF-02 | Phase 1 | Pending |
| REF-03 | Phase 1 | Pending |
| REF-04 | Phase 1 | Pending |
| SAF-01 | Phase 1 | Pending |
| SAF-02 | Phase 1 | Pending |
| SAF-03 | Phase 1 | Pending |
| SAF-04 | Phase 1 | Pending |
| SAF-05 | Phase 1 | Pending |
| TPL-01 | Phase 2 | Complete |
| TPL-02 | Phase 2 | Complete |
| TPL-03 | Phase 2 | Complete |
| TPL-04 | Phase 2 | Complete |
| TPL-05 | Phase 2 | Complete |
| TPL-06 | Phase 2 | Complete |
| TPL-07 | Phase 2 | Complete |
| INF-01 | Phase 2 | Complete |
| AGT-01 | Phase 3 | Complete |
| AGT-02 | Phase 3 | Complete |
| AGT-03 | Phase 3 | Complete |
| AGT-04 | Phase 3 | Complete |
| AGT-05 | Phase 3 | Complete |
| AGT-06 | Phase 3 | Complete |
| AGT-07 | Phase 3 | Complete |
| AGT-08 | Phase 3 | Complete |
| AGT-09 | Phase 3 | Complete |
| AGT-10 | Phase 3 | Complete |
| AGT-11 | Phase 3 | Complete |
| AGT-12 | Phase 3 | Complete |
| WKF-02 | Phase 4 | Complete |
| WKF-03 | Phase 4 | Complete |
| WKF-04 | Phase 4 | Complete |
| WKF-05 | Phase 4 | Complete |
| WKF-06 | Phase 4 | Complete |
| WKF-01 | Phase 5 | Complete |
| WKF-07 | Phase 6 | Complete |
| WKF-08 | Phase 7 | Complete |
| CMD-01 | Phase 8 | Complete |
| CMD-02 | Phase 8 | Complete |
| CMD-03 | Phase 8 | Complete |
| CMD-04 | Phase 8 | Complete |
| CMD-05 | Phase 8 | Complete |
| CMD-06 | Phase 8 | Complete |
| CMD-07 | Phase 8 | Complete |
| CMD-08 | Phase 8 | Complete |
| CMD-09 | Phase 8 | Complete |
| CMD-10 | Phase 8 | Complete |
| CMD-11 | Phase 8 | Complete |
| CMD-12 | Phase 8 | Complete |
| CMD-13 | Phase 9 | Pending |
| CMD-14 | Phase 9 | Pending |
| CMD-15 | Phase 9 | Pending |
| CMD-16 | Phase 9 | Pending |
| CMD-17 | Phase 9 | Pending |
| CMD-18 | Phase 9 | Pending |
| CMD-19 | Phase 9 | Pending |
| CMD-20 | Phase 9 | Pending |
| CMD-21 | Phase 9 | Pending |
| CMD-22 | Phase 9 | Pending |
| CMD-23 | Phase 9 | Pending |
| CMD-24 | Phase 9 | Pending |
| CMD-25 | Phase 9 | Pending |
| CMD-26 | Phase 9 | Pending |
| CMD-27 | Phase 9 | Pending |
| CMD-28 | Phase 9 | Pending |
| CMD-29 | Phase 9 | Pending |
| CMD-30 | Phase 9 | Pending |
| CMD-31 | Phase 9 | Pending |
| CMD-32 | Phase 9 | Pending |
| INF-02 | Phase 10 | Pending |
| INF-03 | Phase 10 | Pending |
| INF-04 | Phase 10 | Pending |
| INF-05 | Phase 10 | Pending |
| INF-06 | Phase 10 | Pending |
| INF-07 | Phase 10 | Pending |
| INF-08 | Phase 10 | Pending |

---
*76 requirements across 7 categories*
*6 requirements deferred to v2*
*7 explicit exclusions*
