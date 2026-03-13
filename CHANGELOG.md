# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-10

### Added

- Multi-platform installer supporting Claude Code, OpenCode, Codex CLI, and Gemini CLI
- Interactive CLI with platform and scope selection
- Non-interactive mode via `--claude`, `--opencode`, `--codex`, `--gemini`, `--all`, `--global`, `--local` flags
- npm package published as `topstepx-dev`
- SKILL.md updated to agentskills.io open standard
- Complete TopStepX API reference: REST endpoints, SignalR WebSocket streaming, enums
- `npx topstepx-dev` one-command installation

### Changed

- Migrated from Claude Code-only plugin to universal agent skill format
- Removed `.claude-plugin/` manifest (installer handles platform-specific placement)
- Removed `TOPSTEPX_API.md` (consolidated into SKILL.md + references)
