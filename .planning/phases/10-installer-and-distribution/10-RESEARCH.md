# Phase 10: Installer and Distribution - Research

**Researched:** 2026-03-12
**Domain:** npm package distribution, multi-platform CLI installer, path rewriting
**Confidence:** HIGH

## Summary

Phase 10 transforms the existing minimal skill-only installer (`bin/install.js`) into a full framework installer that distributes commands, agents, workflows, templates, references, and CLI tooling to all 4 target platforms. The existing installer already handles the core mechanics (platform detection, interactive/non-interactive modes, recursive directory copying, global/local scope) and needs to be expanded rather than rewritten.

The GSD installer (`get-shit-done-cc@1.22.4`) serves as the authoritative reference implementation. It solves every problem TSX faces: per-platform command format conversion (nested MD for Claude, flattened MD for OpenCode, TOML for Gemini, skill adapters for Codex), agent frontmatter transformation, path prefix rewriting, uninstall support, and manifest tracking for clean updates. TSX can follow the same patterns with simpler scope -- TSX has fewer platform-specific concerns because its commands already use `$HOME/.claude/topstepx/` portable path references rather than absolute paths.

**Primary recommendation:** Expand the existing `bin/install.js` to copy all 5 asset categories (commands, agents, topstepx/, skills/) with per-platform transformations modeled on the GSD installer, add `--uninstall` flag support, update `package.json` files array and metadata, rewrite `README.md` for full framework branding, and add GSD attribution to LICENSE/README/package.json.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INF-02 | Installer -- Full framework install (commands, agents, workflows, templates, references) | Platform directory mapping, asset copying strategy, path rewriting mechanism (see Architecture Patterns) |
| INF-03 | Installer -- All 4 platforms (Claude Code, OpenCode, Codex CLI, Gemini CLI) | Per-platform transformation rules (see Standard Stack > Platform Directory Mapping and Architecture Patterns > Per-Platform Transformations) |
| INF-04 | Installer -- GSD coexistence (tsx:* alongside gsd:* with zero conflicts) | Namespace isolation analysis (see Architecture Patterns > Pattern 3: GSD Coexistence) |
| INF-05 | Installer -- Uninstall support (clean removal from target platform) | Uninstall file enumeration strategy (see Architecture Patterns > Pattern 4: Uninstall Support) |
| INF-06 | package.json -- Updated for full framework distribution | Files array expansion, metadata updates (see Architecture Patterns > Pattern 5: Package.json Updates) |
| INF-07 | README.md -- Complete documentation with GSD credits | Full framework README structure (see Architecture Patterns > Pattern 6: README Rewrite) |
| INF-08 | GSD attribution -- Credits in README, package.json, LICENSE | Attribution requirements and placement (see Architecture Patterns > Pattern 7: GSD Attribution) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | >=16.7.0 | Runtime for installer | Already in package.json engines, zero-dependency approach matches GSD |
| `fs` (built-in) | N/A | File operations | Recursive directory copy, file reading/writing for transformations |
| `path` (built-in) | N/A | Cross-platform paths | Path joining, dirname resolution |
| `readline` (built-in) | N/A | Interactive prompts | Already used in current installer |
| `os` (built-in) | N/A | Home directory detection | Already used in current installer |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `crypto` (built-in) | N/A | SHA256 manifest hashes | Optional: for file manifest tracking (GSD uses this, but TSX may skip for v1) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zero-dependency Node.js | Commander.js + Chalk | Would add deps to a package that currently has zero; GSD also uses zero deps |
| Inline TOML generation | `@iarna/toml` | Gemini TOML is simple enough (2 fields: prompt, description) that string interpolation suffices |

**Installation:**
```bash
npx topstepx-dev          # Interactive mode
npx topstepx-dev --claude --global   # Non-interactive
npx topstepx-dev --uninstall --claude --global  # Uninstall
```

## Architecture Patterns

### Current vs Target File Distribution

**Current installer copies:**
```
skills/topstepx-api/    -> {platform}/skills/topstepx-api/
```

**Target installer must copy:**
```
commands/tsx/            -> {platform}/commands/tsx/          (32 command files)
topstepx/agents/        -> {platform}/agents/tsx-*.md        (12 agent files)
topstepx/               -> {platform}/topstepx/              (workflows, templates, references, bin -- 115 files)
skills/topstepx-api/    -> {platform}/skills/topstepx-api/   (4 skill files)
```

### Platform Directory Mapping

| Asset Category | Claude Code | OpenCode | Gemini CLI | Codex |
|---------------|-------------|----------|------------|-------|
| **Commands** | `~/.claude/commands/tsx/*.md` | `~/.config/opencode/commands/tsx-*.md` (flattened) | `~/.gemini/commands/tsx/*.toml` (TOML) | `~/.codex/skills/tsx-*/SKILL.md` (skill adapters) |
| **Agents** | `~/.claude/agents/tsx-*.md` | `~/.config/opencode/agents/tsx-*.md` | `~/.gemini/agents/tsx-*.md` | Config in `~/.codex/config.toml` [agents.tsx-*] sections |
| **Core (topstepx/)** | `~/.claude/topstepx/` | `~/.config/opencode/topstepx/` | `~/.gemini/topstepx/` | `~/.codex/topstepx/` |
| **Skills** | `~/.claude/skills/topstepx-api/` | `~/.config/opencode/skills/topstepx-api/` | `~/.gemini/skills/topstepx-api/` | `~/.codex/skills/topstepx-api/` (already skill format) |
| **Local prefix** | `.claude/` | `.opencode/` | `.gemini/` | `.codex/` or `.agents/` |

### Recommended Project Structure (Installer Code)

```
bin/
├── install.js           # Main installer entry point (expanded from current)
└── lib/
    ├── platforms.js      # Platform definitions (paths, transformations)
    ├── copy.js           # File copy with path rewriting
    ├── transform.js      # Per-platform content transformation
    └── uninstall.js      # Clean removal logic
```

Note: GSD puts all installer logic in a single `bin/install.js` file (~1200 lines). TSX could follow the same single-file pattern since total complexity is lower (TSX doesn't need hooks, settings.json manipulation, or config.toml merging). A single expanded `bin/install.js` is the pragmatic choice.

### Pattern 1: Path Prefix Rewriting

**What:** All content files reference `$HOME/.claude/topstepx/` paths that must be rewritten per platform during installation.

**When to use:** Every file copy for non-Claude platforms.

**Three path patterns to handle:**
```
$HOME/.claude/topstepx/   -> $HOME/{platform-config-dir}/topstepx/
$HOME/.claude/topstepx/   (in bash commands like: node "$HOME/.claude/topstepx/bin/tsx-tools.cjs")
@$HOME/.claude/topstepx/  (in Claude Code @ file references)
```

**Platform prefix mapping:**
| Platform | Global Prefix | Local Prefix |
|----------|--------------|-------------|
| Claude Code | `$HOME/.claude/topstepx/` (no change) | `./.claude/topstepx/` |
| OpenCode | `$HOME/.config/opencode/topstepx/` | `./.opencode/topstepx/` |
| Gemini CLI | `$HOME/.gemini/topstepx/` | `./.gemini/topstepx/` |
| Codex | `$HOME/.codex/topstepx/` | `./.codex/topstepx/` |

**Example transformation (OpenCode):**
```javascript
// Source (all content files):
node "$HOME/.claude/topstepx/bin/tsx-tools.cjs" init phase-op "${PHASE}"

// Installed for OpenCode:
node "$HOME/.config/opencode/topstepx/bin/tsx-tools.cjs" init phase-op "${PHASE}"
```

**Additional @ reference rewriting for OpenCode/Gemini/Codex:**
```javascript
// Source (commands):
@$HOME/.claude/topstepx/workflows/execute-phase.md

// Installed for OpenCode:
@$HOME/.config/opencode/topstepx/workflows/execute-phase.md
```

**Total occurrences:** ~506 path references across 117 files need rewriting for non-Claude platforms.

### Pattern 2: Per-Platform Command Transformations

**What:** Each platform expects different command file formats.

**Claude Code (32 files, direct copy + path rewrite):**
- Format: Markdown with YAML frontmatter
- Directory: `commands/tsx/*.md` (nested under `tsx/` subdirectory)
- Produces `/tsx:command-name` slash commands
- Only needs path prefix rewriting

**OpenCode (32 files, flatten + frontmatter transform):**
- Format: Markdown, but FLAT naming: `tsx-command-name.md` (no subdirectory)
- Directory: `commands/` (directly in commands root, not nested)
- Frontmatter: `allowed-tools` array converts to `tools: {toolname: true}` object
- Tool name mapping: `Read` -> `read`, `Write` -> `write`, `Bash` -> `bash`, `Task` -> `task`, etc.
- Color names to hex if any color fields present

**Gemini CLI (32 files, convert to TOML):**
- Format: TOML (`.toml` extension)
- Directory: `commands/tsx/*.toml` (nested under `tsx/` subdirectory)
- Must extract `description` and `prompt` (body content) into TOML fields
- Shell variables need escaping (`${VAR}` -> `\${VAR}`) to prevent template engine conflicts
- Tool names to snake_case: `Read` -> `read_file`, `Edit` -> `replace`, `Bash` -> `execute_command`

**Codex (32 files, convert to skill format):**
- Format: Skill directories with `SKILL.md`
- Directory: `skills/tsx-{command-name}/SKILL.md`
- Slash commands (`/tsx:execute-phase`) convert to skill mentions (`$tsx-execute-phase`)
- `$ARGUMENTS` becomes `{{TSX_ARGS}}`
- Adapter header prepended explaining tool translations

### Pattern 3: GSD Coexistence (INF-04)

**What:** TSX must install alongside GSD with zero namespace conflicts.

**Why this works by design:**
- Commands: GSD uses `commands/gsd/`, TSX uses `commands/tsx/` -- completely separate namespace
- Agents: GSD uses `gsd-*.md`, TSX uses `tsx-*.md` -- completely separate files
- Core data: GSD uses `get-shit-done/`, TSX uses `topstepx/` -- completely separate directories
- Skills: GSD uses `skills/gsd-*/`, TSX uses `skills/topstepx-api/` -- completely separate directories
- User config: GSD uses `~/.gsd/`, TSX uses `~/.tsx/` -- completely separate paths
- Branch prefix: GSD uses `gsd/`, TSX uses `tsx/` -- completely separate branches

**No conflicts possible.** The namespace separation is baked into the entire framework from Phase 1.

**Verification:** After install, both `/gsd:help` and `/tsx:help` should work independently.

### Pattern 4: Uninstall Support (INF-05)

**What:** `--uninstall` flag removes all TSX-installed files from a target platform.

**Files to remove per platform:**
1. `commands/tsx/` directory (or `commands/tsx-*.md` for OpenCode, or `commands/tsx/*.toml` for Gemini, or `skills/tsx-*/` for Codex)
2. `agents/tsx-*.md` files (or Codex config.toml [agents.tsx-*] sections)
3. `topstepx/` directory (workflows, templates, references, bin)
4. `skills/topstepx-api/` directory

**Uninstall must NOT remove:**
- Any GSD files (`gsd-*`, `get-shit-done/`)
- Any user-created files outside the TSX namespace
- Platform configuration files (settings.json, config.toml) -- TSX does not modify these

**CLI:**
```bash
npx topstepx-dev --uninstall --claude --global
npx topstepx-dev --uninstall --all --local
```

### Pattern 5: Package.json Updates (INF-06)

**What:** Expand `files` array and metadata for full framework distribution.

**Current `files` array:**
```json
"files": ["bin/", "skills/", "topstepx/"]
```

**Target `files` array:**
```json
"files": ["bin/", "commands/", "skills/", "topstepx/"]
```

**Additional metadata updates:**
- `description`: Expand from API skill to full framework description
- `keywords`: Add framework-related keywords (`workflow`, `pinescript`, `trading-bot`, `gsd`, `get-shit-done`)
- Add GSD attribution fields (see Pattern 7)

### Pattern 6: README Rewrite (INF-07)

**What:** Transform from API skill documentation to full framework documentation.

**Sections needed:**
1. Title/banner -- TSX (TopStepX AI Framework)
2. What it does -- full framework capabilities (commands, workflows, agents, templates)
3. Installation -- same interactive/non-interactive patterns
4. Quick start -- `/tsx:new-project` flow
5. Command reference -- all 32 `/tsx:*` commands grouped by category
6. Architecture overview -- how commands/agents/workflows/templates relate
7. Platform support table -- updated with all asset categories
8. GSD attribution section -- credits and relationship explanation
9. License

### Pattern 7: GSD Attribution (INF-08)

**What:** Visible credits for the GSD framework that TSX extends.

**Placement:**
1. **README.md**: Dedicated "Built on GSD" or "Credits" section explaining TSX extends the GSD (Get Shit Done) framework by TACHES, with link to `https://github.com/gsd-build/get-shit-done`
2. **package.json**: Add to description or add a `credits` field referencing GSD
3. **LICENSE**: Keep MIT license. Optionally add a note that the framework architecture is derived from GSD. The MIT license already permits this -- just ensure copyright notices are respected.

### Pattern 8: Agent Frontmatter Transformation

**What:** Agent markdown files need per-platform frontmatter conversion.

**Claude Code (direct copy):**
```yaml
---
description: Execute plans with trading domain awareness
tools:
  - Read
  - Write
  - Bash
  - Task
---
```

**OpenCode (tools become object with boolean flags):**
```yaml
---
description: Execute plans with trading domain awareness
tools:
  read: true
  write: true
  bash: true
  task: true
---
```

**Gemini CLI (snake_case tools, no color field):**
```yaml
---
name: tsx-executor
description: Execute plans with trading domain awareness
tools:
  - read_file
  - replace
  - execute_command
---
```

**Codex (agent sections in config.toml):**
```toml
[agents.tsx-executor]
description = "Execute plans with trading domain awareness"
sandbox_mode = "workspace-write"
```

### Anti-Patterns to Avoid

- **Hardcoding absolute paths in content:** All content uses `$HOME/.claude/topstepx/` which is portable. The installer must rewrite this, not install absolute paths like `C:/Users/bkevi/.claude/topstepx/`.
- **Modifying platform config files:** TSX should NOT touch `settings.json` (Claude), `opencode.json` (OpenCode), or `config.toml` (Codex) for hooks/permissions. This is a v2 concern. Only Codex agent config sections are needed.
- **Postinstall hooks:** The original design doc explicitly states "No postinstall hooks" -- installer runs only via explicit `npx` invocation.
- **Running platform-detection at runtime:** The installer transforms files at install-time. Content files should not contain runtime platform detection.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TOML generation for Gemini | Full TOML parser/serializer | String template interpolation | Gemini commands need only `prompt` and `description` fields -- trivial string formatting |
| Path rewriting engine | Regex-based multi-pass transformer | Simple string `.replace()` on known patterns | Only 2 path patterns exist: `$HOME/.claude/topstepx/` and `@$HOME/.claude/topstepx/` |
| Interactive prompts | Custom prompt library | Node.js `readline` (already used) | Current installer already has working interactive mode |
| Cross-platform path handling | Manual OS detection | `path.join()` + `os.homedir()` (already used) | Node.js built-ins handle Windows/Mac/Linux correctly |

**Key insight:** The installer is a build-time tool that runs once per install. Simplicity and correctness matter more than performance or extensibility.

## Common Pitfalls

### Pitfall 1: Windows Path Separators in Content
**What goes wrong:** `path.join()` produces backslashes on Windows (`C:\Users\...`) but content files expect forward slashes (`$HOME/.claude/topstepx/`).
**Why it happens:** Node.js `path` module uses OS-native separators.
**How to avoid:** Use `path.posix.join()` for content paths or normalize with `.replace(/\\/g, '/')` after joining.
**Warning signs:** Tests pass on Mac/Linux but fail on Windows.

### Pitfall 2: Gemini TOML Shell Variable Escaping
**What goes wrong:** Gemini's template engine interprets `${PHASE}` as a template variable, breaking bash command references.
**Why it happens:** Gemini CLI processes TOML prompt content through a template engine before execution.
**How to avoid:** Escape `${VAR}` to `\${VAR}` in all Gemini TOML prompt content during conversion.
**Warning signs:** Commands work on Claude Code but produce template errors on Gemini.

### Pitfall 3: OpenCode Flat Command Naming
**What goes wrong:** Commands don't appear as `/tsx:command-name` in OpenCode.
**Why it happens:** OpenCode doesn't support nested command directories -- subdirectory structure (`tsx/help.md`) doesn't produce namespaced commands.
**How to avoid:** Flatten `commands/tsx/help.md` to `commands/tsx-help.md` for OpenCode. The filename becomes the command name.
**Warning signs:** Commands show as `/tsx` directory listing instead of individual slash commands.

### Pitfall 4: Codex Skill Mention Syntax
**What goes wrong:** Internal cross-references between commands break on Codex.
**Why it happens:** Codex uses `$skill-name` mention syntax, not `/prefix:command` slash syntax.
**How to avoid:** Convert all `/tsx:command-name` references to `$tsx-command-name` in Codex skill content.
**Warning signs:** Skill loads but references to other commands are dead text.

### Pitfall 5: Missing `files` Array Entry
**What goes wrong:** `npx topstepx-dev` works from git clone but fails from npm install.
**Why it happens:** npm only packages files listed in `package.json` `files` array. If `commands/` is missing, npm won't include it.
**How to avoid:** Verify `files` array includes all 4 directories: `["bin/", "commands/", "skills/", "topstepx/"]`.
**Warning signs:** `npm pack --dry-run` shows missing directories.

### Pitfall 6: Uninstall Deleting Wrong Files
**What goes wrong:** Uninstall removes GSD files or user files.
**Why it happens:** Overly broad glob patterns or directory traversal.
**How to avoid:** Uninstall only deletes known TSX namespaced paths: `commands/tsx/`, `agents/tsx-*.md`, `topstepx/`, `skills/topstepx-api/`. Never use wildcard deletion.
**Warning signs:** After uninstall, GSD commands stop working.

## Code Examples

Verified patterns from the existing installer and GSD reference:

### Path Rewriting (core transformation)
```javascript
// Source: existing install.js pattern + GSD copyWithPathReplacement
function rewritePaths(content, platform, scope) {
  const sourcePrefix = '$HOME/.claude/topstepx/';
  const targetPrefix = getTargetPrefix(platform, scope);

  // Handle both $HOME and @$HOME patterns
  return content
    .replace(/\$HOME\/\.claude\/topstepx\//g, targetPrefix)
    .replace(/@\$HOME\/\.claude\/topstepx\//g, '@' + targetPrefix);
}

function getTargetPrefix(platform, scope) {
  const prefixes = {
    claude:   '$HOME/.claude/topstepx/',
    opencode: '$HOME/.config/opencode/topstepx/',
    gemini:   '$HOME/.gemini/topstepx/',
    codex:    '$HOME/.codex/topstepx/',
  };
  return prefixes[platform];
}
```

### OpenCode Command Flattening
```javascript
// Source: GSD copyFlattenedCommands pattern
function flattenCommand(filename, content) {
  // tsx/help.md -> tsx-help.md
  const flatName = 'tsx-' + filename;

  // Convert frontmatter tools
  const transformed = convertOpenCodeFrontmatter(content);
  return { name: flatName, content: transformed };
}
```

### Gemini TOML Command Conversion
```javascript
// Source: GSD convertClaudeCommandToGeminiToml pattern
function commandToToml(content) {
  const { frontmatter, body } = parseFrontmatter(content);
  const escapedBody = body.replace(/\$\{/g, '\\${');

  return `description = "${frontmatter.description}"\n` +
         `prompt = """\n${escapedBody}\n"""\n`;
}
```

### Uninstall Logic
```javascript
// Source: GSD uninstall pattern
function uninstall(platform, scope) {
  const baseDir = getBaseDir(platform, scope);
  const removals = [
    path.join(baseDir, 'commands', 'tsx'),      // Claude/Gemini
    path.join(baseDir, 'topstepx'),
    path.join(baseDir, 'skills', 'topstepx-api'),
  ];

  // Remove tsx-*.md agent files
  const agentsDir = path.join(baseDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const file of fs.readdirSync(agentsDir)) {
      if (file.startsWith('tsx-') && file.endsWith('.md')) {
        fs.unlinkSync(path.join(agentsDir, file));
      }
    }
  }

  // Remove directories
  for (const dir of removals) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Claude Code-only `.claude-plugin/` | Multi-platform npm installer | 2026-03-10 (design doc) | Already implemented in current `bin/install.js` |
| Skills-only distribution | Full framework distribution (commands, agents, workflows, templates, references) | Phase 10 (this phase) | Installer scope expands from 4 files to 163 files |
| Gemini CLI Markdown commands | Gemini CLI TOML commands only | 2025-12 (Gemini stable release) | Commands MUST be `.toml` format; Markdown is not supported |
| Codex `~/.agents/skills/` | Codex `~/.codex/skills/` with config.toml | 2025 (Codex v2) | Skills go in `.codex/` not `.agents/`; agents configured via `.codex/config.toml` |

**Deprecated/outdated:**
- `.claude-plugin/` manifest format -- replaced by `.claude/skills/` agentskills.io spec
- Codex `.agents/` root path -- current Codex uses `~/.codex/` for user-level config

## Open Questions

1. **Codex config.toml merging complexity**
   - What we know: GSD implements full idempotent config.toml merging with marker sections
   - What's unclear: Whether TSX needs this in v1, or can defer to v2
   - Recommendation: For v1, install agents as skills (SKILL.md format) in `~/.codex/skills/tsx-*/` rather than config.toml sections. This avoids the config merging complexity and still makes agents available.

2. **File manifest tracking for updates**
   - What we know: GSD uses SHA256 manifest to detect user modifications before overwriting
   - What's unclear: Whether TSX needs this in v1 (no `/tsx:reapply-patches` command exists)
   - Recommendation: Skip manifest tracking for v1. TSX is a fresh install; users won't have modified files yet. Can add in v2 alongside `tsx:update` improvements.

3. **OpenCode tool permission mapping completeness**
   - What we know: OpenCode uses different tool names and permission format
   - What's unclear: Exact mapping for all TSX tools (Task, TodoWrite, AskUserQuestion)
   - Recommendation: Use GSD's `claudeToOpencodeTools` mapping table as reference. Map: `Read->read`, `Write->write`, `Edit->edit`, `Bash->bash`, `Glob->glob`, `Grep->grep`, `Task->task`, `TodoWrite->todo_write`, `AskUserQuestion->question`.

4. **Gemini CLI agent tools mapping**
   - What we know: Gemini uses snake_case built-in tool names
   - What's unclear: Whether Gemini auto-discovers tools or needs explicit listing
   - Recommendation: Use GSD's `claudeToGeminiTools` mapping: `Read->read_file`, `Write->write_file`, `Edit->replace`, `Bash->execute_command`, `Glob->glob`, `Grep->grep`. `Task` and `TodoWrite` may not have Gemini equivalents -- omit them (Gemini subagents work differently).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in `assert` (no external test framework) |
| Config file | none -- see Wave 0 |
| Quick run command | `node test/install.test.js` |
| Full suite command | `node test/install.test.js` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INF-02 | Full framework install copies all asset categories | smoke | Manual: `npx . --claude --global` then verify dirs | Wave 0 |
| INF-03 | All 4 platforms produce correct output | smoke | Manual: install each platform, verify structure | Wave 0 |
| INF-04 | GSD coexistence -- tsx files don't overlap gsd files | unit | `node test/install.test.js::coexistence` | Wave 0 |
| INF-05 | Uninstall removes all tsx files, preserves gsd | smoke | Manual: `npx . --uninstall --claude --global` | Wave 0 |
| INF-06 | package.json files array includes all directories | unit | `npm pack --dry-run` and verify output | Wave 0 |
| INF-07 | README contains framework documentation | manual-only | Visual review of README.md content | N/A |
| INF-08 | GSD attribution visible in README/package.json/LICENSE | manual-only | Visual review of attribution presence | N/A |

### Sampling Rate
- **Per task commit:** Manual smoke test (install to temp dir, verify file count)
- **Per wave merge:** `npm pack --dry-run` to verify distribution contents
- **Phase gate:** Full install/uninstall cycle on at least Claude Code platform

### Wave 0 Gaps
- [ ] No test framework exists -- acceptable for an installer; smoke testing via manual `npx .` invocation is the standard for npm CLI packages
- [ ] `npm pack --dry-run` serves as the primary automated validation that all files are included

## Sources

### Primary (HIGH confidence)
- **Existing `bin/install.js`** -- current installer code, directly examined, 224 lines
- **Existing `package.json`** -- current package metadata, directly examined
- **GSD `get-shit-done-cc@1.22.4`** -- reference installer, examined via DeepWiki + installed files
- **GSD installed file layout** (`~/.claude/commands/gsd/`, `~/.claude/agents/gsd-*.md`, `~/.claude/get-shit-done/`) -- directly examined on local machine

### Secondary (MEDIUM confidence)
- [OpenCode Commands docs](https://opencode.ai/docs/commands/) -- flat command format, global/local paths
- [OpenCode Agents docs](https://opencode.ai/docs/agents/) -- agent markdown format, frontmatter fields
- [Codex Skills docs](https://developers.openai.com/codex/skills/) -- SKILL.md format, config.toml references
- [Codex Multi-agent docs](https://developers.openai.com/codex/multi-agent/) -- config.toml agent sections
- [Gemini CLI Custom Commands docs](https://geminicli.com/docs/cli/custom-commands/) -- TOML-only format, namespacing
- [Gemini CLI Subagents docs](https://geminicli.com/docs/core/subagents/) -- agent markdown format, frontmatter fields
- [GSD Multi-Runtime Support](https://deepwiki.com/gsd-build/get-shit-done/2.2-multi-runtime-support) -- per-platform transformation details
- [GSD Installation](https://deepwiki.com/gsd-build/get-shit-done/2.1-installation) -- uninstall, manifest, path rewriting

### Tertiary (LOW confidence)
- Codex `~/.codex/` vs `~/.agents/` directory preference -- multiple sources mention both; the GSD installer uses `~/.codex/` for global, `.agents/skills/` for local

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - zero-dependency Node.js approach verified against both existing installer and GSD
- Architecture: HIGH - per-platform transformations verified against GSD source and official platform docs
- Pitfalls: HIGH - common issues documented from GSD installer bug fixes and official platform documentation
- Coexistence: HIGH - namespace separation verified by direct comparison of GSD and TSX file naming

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable -- platform conventions unlikely to change within 30 days)
