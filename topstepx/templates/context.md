# Phase Context Template

Template for `.planning/phases/XX-name/{phase_num}-CONTEXT.md` - captures implementation decisions for a phase.

**Purpose:** Document decisions that downstream agents need. Researcher uses this to know WHAT to investigate. Planner uses this to know WHAT choices are locked vs flexible.

**Key principle:** Categories are NOT predefined. They emerge from what was actually discussed for THIS phase. A CLI phase has CLI-relevant sections, a UI phase has UI-relevant sections.

**Downstream consumers:**
- `tsx-phase-researcher` -- Reads decisions to focus research (e.g., "card layout" -> research card component patterns)
- `tsx-planner` -- Reads decisions to create specific tasks (e.g., "infinite scroll" -> task includes virtualization)

---

## File Template

```markdown
# Phase [X]: [Name] - Context

**Gathered:** [date]
**Status:** Ready for planning

<domain>
## Phase Boundary

[Clear statement of what this phase delivers -- the scope anchor. This comes from ROADMAP.md and is fixed. Discussion clarifies implementation within this boundary.]

</domain>

<decisions>
## Implementation Decisions

### [Area 1 that was discussed]
- [Specific decision made]
- [Another decision if applicable]

### [Area 2 that was discussed]
- [Specific decision made]

### [Area 3 that was discussed]
- [Specific decision made]

### Claude's Discretion
[Areas where user explicitly said "you decide" -- Claude has flexibility here during planning/implementation]

</decisions>

<specifics>
## Specific Ideas

[Any particular references, examples, or "I want it like X" moments from discussion. Product references, specific behaviors, interaction patterns.]

[If none: "No specific requirements -- open to standard approaches"]

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- [Component/hook/utility]: [How it could be used in this phase]

### Established Patterns
- [Pattern]: [How it constrains/enables this phase]

### Integration Points
- [Where new code connects to existing system]

</code_context>

<deferred>
## Deferred Ideas

[Ideas that came up during discussion but belong in other phases. Captured here so they're not lost, but explicitly out of scope for this phase.]

[If none: "None -- discussion stayed within phase scope"]

</deferred>

---

*Phase: XX-name*
*Context gathered: [date]*
```

<good_examples>

**Example 1: Visual feature (Post Feed)**

```markdown
# Phase 3: Post Feed - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Display posts from followed users in a scrollable feed. Users can view posts and see engagement counts. Creating posts and interactions are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Layout style
- Card-based layout, not timeline or list
- Each card shows: author avatar, name, timestamp, full post content, reaction counts
- Cards have subtle shadows, rounded corners -- modern feel

### Loading behavior
- Infinite scroll, not pagination
- Pull-to-refresh on mobile
- New posts indicator at top ("3 new posts") rather than auto-inserting

### Empty state
- Friendly illustration + "Follow people to see posts here"
- Suggest 3-5 accounts to follow based on interests

### Claude's Discretion
- Loading skeleton design
- Exact spacing and typography
- Error state handling

</decisions>

<specifics>
## Specific Ideas

- "I like how Twitter shows the new posts indicator without disrupting your scroll position"
- Cards should feel like Linear's issue cards -- clean, not cluttered

</specifics>

<deferred>
## Deferred Ideas

- Commenting on posts -- Phase 5
- Bookmarking posts -- add to backlog

</deferred>

---

*Phase: 03-post-feed*
*Context gathered: 2025-01-20*
```

**Example 2: CLI tool (Database backup)**

```markdown
# Phase 2: Backup Command - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

CLI command to backup database to local file or S3. Supports full and incremental backups. Restore command is a separate phase.

</domain>

<decisions>
## Implementation Decisions

### Output format
- JSON for programmatic use, table format for humans
- Default to table, --json flag for JSON
- Verbose mode (-v) shows progress, silent by default

### Flag design
- Short flags for common options: -o (output), -v (verbose), -f (force)
- Long flags for clarity: --incremental, --compress, --encrypt
- Required: database connection string (positional or --db)

### Error recovery
- Retry 3 times on network failure, then fail with clear message
- --no-retry flag to fail fast
- Partial backups are deleted on failure (no corrupt files)

### Claude's Discretion
- Exact progress bar implementation
- Compression algorithm choice
- Temp file handling

</decisions>

<specifics>
## Specific Ideas

- "I want it to feel like pg_dump -- familiar to database people"
- Should work in CI pipelines (exit codes, no interactive prompts)

</specifics>

<deferred>
## Deferred Ideas

- Scheduled backups -- separate phase
- Backup rotation/retention -- add to backlog

</deferred>

---

*Phase: 02-backup-command*
*Context gathered: 2025-01-20*
```

**Example 3: Trading bot project (TopStepX EMA crossover bot)**

```markdown
# Phase 2: Strategy Implementation - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the EMA crossover strategy with bracket orders for the E-mini NASDAQ futures contract. This phase covers indicator calculation, signal generation, and order placement. Backtesting and performance reporting are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Instrument selection
- Trading E-mini NASDAQ (NQ) futures via TopStepX
- Contract ID resolved dynamically via searchContracts API
- Single instrument only for initial implementation

### Strategy type
- EMA crossover: fast EMA (9) crosses above/below slow EMA (21)
- Bar-close execution model (barstate.isconfirmed equivalent)
- 5-minute bar aggregation via WebSocket subscription

### Risk parameters
- Max position size: 2 contracts
- Stop loss: 20 ticks from entry
- Take profit: 40 ticks from entry (2:1 reward/risk)
- Max daily loss: $500 -- bot shuts down for the day
- Bracket orders mandatory on every entry (SAF-01 pattern)

### API integration
- REST for authentication and order placement
- WebSocket for real-time bar data (subscribeBars action)
- JWT token refresh using TokenManager (23hr proactive, SAF-02)
- Rate limiter: 200 req/60s general, 50 req/30s history (SAF-03)

### Claude's Discretion
- EMA calculation library choice (trading-signals vs custom)
- Logging framework
- Config file format (JSON vs YAML)

</decisions>

<specifics>
## Specific Ideas

- "I want the bot to log every signal and order decision with timestamps"
- All enum values must use named constants, never bare integers (SAF-01)
- Order rejection handling should retry once with backoff, then alert

</specifics>

<deferred>
## Deferred Ideas

- Multi-instrument support -- Phase 4
- Web dashboard for monitoring -- Phase 5
- Backtesting engine -- Phase 3

</deferred>

---

*Phase: 02-strategy-implementation*
*Context gathered: 2025-01-20*
```

</good_examples>

<guidelines>
**This template captures DECISIONS for downstream agents.**

The output should answer: "What does the researcher need to investigate? What choices are locked for the planner?"

**Good content (concrete decisions):**
- "Card-based layout, not timeline"
- "Retry 3 times on network failure, then fail"
- "Group by year, then by month"
- "JSON for programmatic use, table for humans"
- "Bracket orders mandatory on every entry"
- "Bar-close execution model, 5-minute bars"

**Bad content (too vague):**
- "Should feel modern and clean"
- "Good user experience"
- "Fast and responsive"
- "Easy to use"
- "Good risk management"

**After creation:**
- File lives in phase directory: `.planning/phases/XX-name/{phase_num}-CONTEXT.md`
- `tsx-phase-researcher` uses decisions to focus investigation
- `tsx-planner` uses decisions + research to create executable tasks
- Downstream agents should NOT need to ask the user again about captured decisions
</guidelines>
