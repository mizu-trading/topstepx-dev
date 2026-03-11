<ui_patterns>

Visual patterns for user-facing TSX output. Orchestrators @-reference this file.

## Framework Identity

**Name:** TSX (full: "TSX -- TopStepX AI Skill Framework")
**Prefix:** `TSX` in banners and stage indicators
**Commands:** `/tsx:*` command namespace
**Agents:** `tsx-*` agent namespace

## Stage Banners

Use for major workflow transitions.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TSX > {STAGE NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Stage names (uppercase):**
- `QUESTIONING`
- `RESEARCHING`
- `DEFINING REQUIREMENTS`
- `CREATING ROADMAP`
- `PLANNING PHASE {N}`
- `EXECUTING WAVE {N}`
- `VERIFYING`
- `PHASE {N} COMPLETE`
- `MILESTONE COMPLETE`

---

## Checkpoint Boxes

User action required. 62-character width.

```
+==============================================================+
|  CHECKPOINT: {Type}                                          |
+==============================================================+

{Content}

--------------------------------------------------------------
> {ACTION PROMPT}
--------------------------------------------------------------
```

**Types:**
- `CHECKPOINT: Verification Required` -> `> Type "approved" or describe issues`
- `CHECKPOINT: Decision Required` -> `> Select: option-a / option-b`
- `CHECKPOINT: Action Required` -> `> Type "done" when complete`

---

## Status Symbols

```
[ok]    Complete / Passed / Verified
[fail]  Failed / Missing / Blocked
[..]    In Progress
[ ]     Pending
[auto]  Auto-approved
[warn]  Warning
[done]  Milestone complete (only in banner)
```

---

## Progress Display

**Phase/milestone level:**
```
Progress: ========.. 80%
```

**Task level:**
```
Tasks: 2/4 complete
```

**Plan level:**
```
Plans: 3/5 complete
```

---

## Spawning Indicators

```
[..] Spawning researcher...

[..] Spawning 4 researchers in parallel...
  -> Stack research
  -> Features research
  -> Architecture research
  -> Pitfalls research

[ok] Researcher complete: STACK.md written
```

---

## Next Up Block

Always at end of major completions.

```
---------------------------------------------------------------

## > Next Up

**{Identifier}: {Name}** -- {one-line description}

`{copy-paste command}`

<sub>`/clear` first -> fresh context window</sub>

---------------------------------------------------------------

**Also available:**
- `/tsx:alternative-1` -- description
- `/tsx:alternative-2` -- description

---------------------------------------------------------------
```

---

## Error Box

```
+==============================================================+
|  ERROR                                                       |
+==============================================================+

{Error description}

**To fix:** {Resolution steps}
```

---

## Tables

```
| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 1     | [ok]   | 3/3   | 100%     |
| 2     | [..]   | 1/4   | 25%      |
| 3     | [ ]    | 0/2   | 0%       |
```

---

## Anti-Patterns

- Varying box/banner widths
- Mixing banner styles (`===`, `---`, `***`)
- Skipping `TSX >` prefix in banners
- Random emoji -- use text status symbols instead
- Missing Next Up block after completions

</ui_patterns>
