# Codebase Structure

**Analysis Date:** 2026-03-10

## Directory Layout

```
topstepx-dev/
├── bin/                        # CLI installer scripts
│   └── install.js              # Main entry point (npx topstepx-dev)
├── skills/                     # Skill content (copied to target platforms)
│   └── topstepx-api/           # The TopStepX API skill
│       ├── SKILL.md            # Core skill definition (auto-loaded by AI)
│       └── references/         # Detailed reference docs (loaded on demand)
│           ├── rest-api.md     # Full REST endpoint specs (597 lines)
│           ├── realtime.md     # SignalR WebSocket reference (391 lines)
│           └── enums.md        # Enum definitions (123 lines)
├── docs/                       # Project documentation and design records
│   └── plans/                  # Design decision documents
│       └── 2026-03-10-npm-multi-platform-design.md
├── .planning/                  # GSD planning directory
│   └── codebase/               # Codebase analysis documents
├── package.json                # npm package config (name, bin, files, engines)
├── README.md                   # User-facing installation and usage docs
├── CHANGELOG.md                # Version history
└── LICENSE                     # MIT license
```

## Directory Purposes

**`bin/`:**
- Purpose: CLI installer scripts distributed with the npm package
- Contains: Single JavaScript file (`install.js`, 224 lines)
- Key files: `bin/install.js` -- the only executable code in the project

**`skills/topstepx-api/`:**
- Purpose: The actual skill content that gets copied to AI platform directories
- Contains: Markdown documentation files
- Key files: `skills/topstepx-api/SKILL.md` -- core skill entry point with YAML frontmatter

**`skills/topstepx-api/references/`:**
- Purpose: Detailed API reference documents loaded by AI assistants on demand
- Contains: Three Markdown files covering REST API, real-time streaming, and enums
- Key files: `skills/topstepx-api/references/rest-api.md` (largest file, full endpoint specs)

**`docs/plans/`:**
- Purpose: Design decision records for project changes
- Contains: Dated Markdown design documents
- Key files: `docs/plans/2026-03-10-npm-multi-platform-design.md`

## Key File Locations

**Entry Points:**
- `bin/install.js`: CLI entry point, declared in `package.json` `bin` field
- `skills/topstepx-api/SKILL.md`: Skill activation entry point for AI assistants

**Configuration:**
- `package.json`: npm package metadata, `bin` mapping, `files` whitelist, engine requirements

**Core Logic:**
- `bin/install.js`: All installer logic (arg parsing, prompts, file copy, platform paths)

**Skill Content:**
- `skills/topstepx-api/SKILL.md`: Core API reference (196 lines)
- `skills/topstepx-api/references/rest-api.md`: Complete REST endpoint documentation (597 lines)
- `skills/topstepx-api/references/realtime.md`: SignalR WebSocket reference (391 lines)
- `skills/topstepx-api/references/enums.md`: Enum type definitions (123 lines)

## Naming Conventions

**Files:**
- Skill entry points: `SKILL.md` (UPPERCASE, agentskills.io convention)
- Reference docs: `kebab-case.md` (e.g., `rest-api.md`, `realtime.md`)
- Scripts: `camelCase.js` or simple lowercase (e.g., `install.js`)
- Project docs: `UPPERCASE.md` (e.g., `README.md`, `CHANGELOG.md`, `LICENSE`)
- Design docs: `YYYY-MM-DD-kebab-description.md` (e.g., `2026-03-10-npm-multi-platform-design.md`)

**Directories:**
- `kebab-case` for content directories (e.g., `topstepx-api`)
- `lowercase` for standard directories (e.g., `bin`, `skills`, `docs`, `references`)

## Where to Add New Code

**New Skill:**
- Create directory: `skills/<skill-name>/`
- Add entry point: `skills/<skill-name>/SKILL.md` with YAML frontmatter
- Add references: `skills/<skill-name>/references/*.md`
- Update `bin/install.js` `SKILL_NAME` constant or add multi-skill support

**New Platform Support:**
- Add entry to `PLATFORMS` object in `bin/install.js` (lines 13-34)
- Add platform flag parsing in `parseArgs()` (lines 66-104)
- Add interactive prompt option in `promptPlatform()` (lines 108-131)

**New CLI Feature:**
- Add to `bin/install.js` -- all CLI logic lives in this single file

**New Reference Document:**
- Add to `skills/topstepx-api/references/` as a Markdown file
- Reference it from `skills/topstepx-api/SKILL.md` under "Additional Resources"

**Design Decisions:**
- Add to `docs/plans/` with naming pattern `YYYY-MM-DD-kebab-description.md`

## Special Directories

**`skills/`:**
- Purpose: Contains skill content distributed via npm
- Generated: No (manually authored)
- Committed: Yes
- Note: Listed in `package.json` `files` array -- included in npm package

**`bin/`:**
- Purpose: CLI scripts distributed via npm
- Generated: No
- Committed: Yes
- Note: Listed in `package.json` `files` array -- included in npm package

**`.planning/`:**
- Purpose: GSD planning and codebase analysis
- Generated: Yes (by GSD tooling)
- Committed: Check `.gitignore` (currently tracked)

**`docs/plans/`:**
- Purpose: Design decision records
- Generated: No (manually authored)
- Committed: Yes
- Note: NOT included in npm package (not in `files` array)

## npm Package Contents

Only these directories are published to npm (per `package.json` `files` field):
- `bin/`
- `skills/`

Everything else (`docs/`, `.planning/`, `README.md`, `CHANGELOG.md`, `LICENSE`) is repo-only or auto-included by npm.

---

*Structure analysis: 2026-03-10*
