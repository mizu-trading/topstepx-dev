# Technology Stack

**Analysis Date:** 2026-03-10

## Languages

**Primary:**
- JavaScript (CommonJS) - CLI installer and sole runtime code (`bin/install.js`)
- Markdown - Skill content and API reference documentation (`skills/topstepx-api/`)

**Secondary:**
- None

## Runtime

**Environment:**
- Node.js >= 16.7.0 (specified in `package.json` `engines` field)

**Package Manager:**
- npm
- Lockfile: Not present (no dependencies to lock)

## Frameworks

**Core:**
- None - Zero external dependencies. The project is a pure Node.js CLI tool using only built-in modules (`fs`, `path`, `readline`, `os`).

**Testing:**
- None detected. No test framework configured.

**Build/Dev:**
- None - No build step, transpilation, or bundling. Raw JavaScript ships directly.

## Key Dependencies

**Critical:**
- None. The `package.json` has zero `dependencies` or `devDependencies`. The project is entirely self-contained using Node.js built-in modules.

**Infrastructure:**
- None

## Configuration

**Environment:**
- No environment variables required for the skill installer itself
- The skill content documents reference TopStepX API credentials (userName, apiKey) that consumers of the skill will need, but these are not consumed by this package

**Build:**
- No build configuration. No transpilation or bundling.
- `package.json` - npm package manifest, defines `bin` entry point and `files` whitelist

## Package Distribution

**npm Package:**
- Name: `topstepx-dev`
- Version: 1.0.0
- Entry: `bin/install.js` (exposed as `topstepx-dev` CLI command via `package.json` `bin` field)
- Published files: `bin/` and `skills/` directories (controlled by `files` field in `package.json`)
- Invocation: `npx topstepx-dev`

## Platform Requirements

**Development:**
- Node.js >= 16.7.0
- No additional tooling required

**Production:**
- This is an npm package consumed via `npx`. It runs on the user's local machine.
- No server deployment. No hosting infrastructure.

## Project Nature

This is NOT a typical application. It is an **AI coding skill installer** -- a CLI tool that copies Markdown documentation files into platform-specific directories for AI coding assistants (Claude Code, OpenCode, Codex CLI, Gemini CLI). The "application logic" is entirely in `bin/install.js`. The "content" is the Markdown skill files in `skills/topstepx-api/`.

---

*Stack analysis: 2026-03-10*
