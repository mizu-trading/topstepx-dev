# Architecture

**Analysis Date:** 2026-03-10

## Pattern Overview

**Overall:** Content Distribution Package (npm-installable AI skill with CLI installer)

**Key Characteristics:**
- No runtime application -- this is a static content package distributed via npm
- Single CLI entry point (`bin/install.js`) copies skill files to platform-specific directories
- Skill content is structured Markdown documentation consumed by AI coding assistants
- Supports four AI platforms: Claude Code, OpenCode, Codex CLI, Gemini CLI

## Layers

**Installer Layer (CLI):**
- Purpose: Provides interactive and non-interactive CLI to copy skill files to target directories
- Location: `bin/install.js`
- Contains: Argument parsing, interactive prompts, file copy logic, platform definitions
- Depends on: Node.js built-ins (`fs`, `path`, `readline`, `os`), `package.json` for version
- Used by: End users via `npx topstepx-dev`

**Skill Content Layer:**
- Purpose: Structured API documentation that AI assistants load as context
- Location: `skills/topstepx-api/`
- Contains: SKILL.md (core reference, auto-loaded), and `references/` subdirectory with detailed docs
- Depends on: Nothing (static content)
- Used by: AI coding assistants after installation

**Documentation Layer:**
- Purpose: Human-facing project documentation and design decisions
- Location: `README.md`, `CHANGELOG.md`, `docs/`
- Contains: Installation instructions, changelog, design plans
- Depends on: Nothing
- Used by: Developers and contributors

## Data Flow

**Installation Flow:**

1. User runs `npx topstepx-dev` (or with flags like `--claude --global`)
2. `bin/install.js` parses CLI args via `parseArgs()` (lines 66-104)
3. If args incomplete, interactive prompts collect platform(s) and scope via `promptPlatform()` / `promptScope()`
4. `install()` function resolves target directory using `PLATFORMS` map (lines 13-34)
5. `copyDirSync()` recursively copies `skills/topstepx-api/` to each target directory
6. Success message printed with installed paths

**Skill Activation Flow (post-install):**

1. User mentions "TopStepX" or related keywords in AI assistant conversation
2. AI platform loads `SKILL.md` based on frontmatter `description` field matching
3. `SKILL.md` provides core API reference inline
4. AI assistant reads `references/*.md` files on demand for detailed specs

**State Management:**
- No runtime state. The installer is a one-shot copy operation.
- No database, no config files written, no hooks installed.

## Key Abstractions

**PLATFORMS Map:**
- Purpose: Defines per-platform install paths (local and global)
- Location: `bin/install.js` lines 13-34
- Pattern: Object keyed by platform slug (`claude`, `opencode`, `codex`, `gemini`) with `name`, `local(cwd)`, and `global()` path functions

**Skill Definition (SKILL.md Frontmatter):**
- Purpose: Metadata for AI platform skill discovery and activation
- Location: `skills/topstepx-api/SKILL.md` lines 1-13
- Pattern: YAML frontmatter following agentskills.io open standard with `name`, `description`, `license`, `compatibility`, `metadata` fields

## Entry Points

**CLI Entry Point:**
- Location: `bin/install.js`
- Triggers: `npx topstepx-dev` (declared in `package.json` `bin` field)
- Responsibilities: Parse args, prompt if needed, copy skill files to target directories

**Skill Entry Point:**
- Location: `skills/topstepx-api/SKILL.md`
- Triggers: AI assistant keyword matching on TopStepX/ProjectX mentions
- Responsibilities: Provide complete API overview; link to reference files for detailed specs

## Error Handling

**Strategy:** Minimal -- errors are caught and logged, non-fatal per platform

**Patterns:**
- `copyDirSync` failures are caught per-platform in the install loop (`bin/install.js` lines 163-168), allowing other platforms to succeed
- Top-level `main().catch()` handles unexpected errors with message and exit code 1 (`bin/install.js` lines 221-224)
- No retry logic, no error codes beyond process exit

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` directly. No logging framework.
**Validation:** CLI args validated by switch statements; invalid interactive input triggers re-prompt via recursion.
**Authentication:** Not applicable (no runtime, no network calls).
**Versioning:** Single version source in `package.json`, read by installer for banner display (`bin/install.js` line 8).

---

*Architecture analysis: 2026-03-10*
