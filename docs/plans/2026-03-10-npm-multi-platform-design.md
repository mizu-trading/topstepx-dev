# Design: topstepx-skill npm package (multi-platform)

**Date:** 2026-03-10
**Status:** Approved

## Goal

Transform the Claude Code-only plugin into a universal npm-installable skill package supporting Claude Code, OpenCode, Codex CLI, and Gemini CLI.

## Package Structure

```
topstepx-skill/
├── bin/
│   └── install.js              # CLI entry point (npx topstepx-skill)
├── skills/
│   └── topstepx-api/
│       ├── SKILL.md            # Shared skill definition (agentskills.io spec)
│       └── references/
│           ├── rest-api.md
│           ├── realtime.md
│           └── enums.md
├── package.json                # npm package with bin entry
├── CHANGELOG.md
├── README.md                   # Multi-platform installation docs
└── LICENSE
```

## Installer Flow

1. Print banner with version
2. Ask platform (Claude Code / OpenCode / Codex CLI / Gemini CLI / All)
3. Ask scope (Global / Local)
4. Copy `skills/topstepx-api/` directory to target location
5. Print success message

### Target Directories

| Platform    | Local                              | Global                                      |
|-------------|------------------------------------|----------------------------------------------|
| Claude Code | `.claude/skills/topstepx-api/`     | `~/.claude/skills/topstepx-api/`             |
| OpenCode    | `.opencode/skills/topstepx-api/`   | `~/.config/opencode/skills/topstepx-api/`    |
| Codex CLI   | `.agents/skills/topstepx-api/`     | `~/.agents/skills/topstepx-api/`             |
| Gemini CLI  | `.gemini/skills/topstepx-api/`     | `~/.gemini/skills/topstepx-api/`             |

### CLI Flags

```bash
npx topstepx-skill                    # Interactive
npx topstepx-skill --claude --global  # Non-interactive
npx topstepx-skill --all --local      # All platforms, local project
```

## Changes from Current Repo

- Remove `.claude-plugin/` directory (installer handles placement)
- Remove `TOPSTEPX_API.md` (duplicate content)
- Add `bin/install.js` CLI installer
- Add `package.json` with npm config
- Add `CHANGELOG.md`
- Update `README.md` for multi-platform
- Update SKILL.md frontmatter to agentskills.io spec (add license, compatibility)

## Out of Scope

- No hooks or settings.json modifications
- No manifest/SHA tracking
- No postinstall hooks
