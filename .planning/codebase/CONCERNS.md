# Codebase Concerns

**Analysis Date:** 2026-03-10

## Tech Debt

**No test suite exists:**
- Issue: The project has zero tests. The installer (`bin/install.js`) contains file system operations, CLI argument parsing, and interactive prompts with no automated verification.
- Files: `bin/install.js`
- Impact: Any change to the installer can silently break installation for one or more platforms. Regressions in argument parsing, directory resolution, or file copying would only be caught manually.
- Fix approach: Add a test framework (e.g., Jest or Node's built-in `node:test`). Write unit tests for `parseArgs()`, `copyDirSync()`, and `install()`. Use a temp directory for file system assertions. Mock `readline` for interactive prompt tests.

**No input validation in installer:**
- Issue: `parseArgs()` silently ignores unrecognized CLI flags. A user running `npx topstepx-skill --cladue --global` (typo) gets interactive mode instead of an error.
- Files: `bin/install.js`, lines 66-104
- Impact: Confusing UX when flags are misspelled. Users may think the tool is broken.
- Fix approach: Track unknown args in `parseArgs()` and print a warning like `Unknown flag: --cladue. Did you mean --claude?` before falling through to interactive mode.

**Deleted files still tracked in git staging:**
- Issue: `.claude-plugin/plugin.json` and `TOPSTEPX_API.md` show as deleted in git status but the deletions are not committed. The working tree is in an inconsistent state with uncommitted changes across multiple files.
- Files: `.claude-plugin/plugin.json`, `TOPSTEPX_API.md`, `README.md`, `skills/topstepx-api/SKILL.md`
- Impact: Confusing git history. Contributors cloning the repo see a dirty diff. The deleted `.claude-plugin/` directory may still appear in the initial commit.
- Fix approach: Stage and commit all pending changes in a single clean commit.

**No `.gitignore` file:**
- Issue: The repository has no `.gitignore`. Common generated artifacts (`node_modules/`, `.env`, `dist/`, OS files like `.DS_Store` and `Thumbs.db`) can be accidentally committed.
- Files: Project root (missing `.gitignore`)
- Impact: Risk of committing `node_modules/` or sensitive `.env` files. The `bin/` and `docs/` directories are currently untracked, suggesting they were added recently without a proper ignore file in place.
- Fix approach: Add a `.gitignore` with standard Node.js exclusions: `node_modules/`, `*.log`, `.env*`, `.DS_Store`, `Thumbs.db`, `.planning/`.

**No npm prepublish or CI validation:**
- Issue: No `prepublishOnly` script, no CI pipeline, no linting. The package can be published to npm with broken content or missing files.
- Files: `package.json`
- Impact: A bad `npm publish` could ship broken skill files to users with no automated safety net.
- Fix approach: Add a `prepublishOnly` script that validates the required files exist (e.g., `skills/topstepx-api/SKILL.md`). Consider adding a GitHub Actions workflow for CI.

## Known Bugs

**Recursive prompt has no exit condition:**
- Symptoms: If a user repeatedly enters invalid input in the interactive prompts, `promptPlatform()` and `promptScope()` recurse indefinitely. On very deep recursion this can cause a stack overflow.
- Files: `bin/install.js`, lines 108-131 (promptPlatform), lines 133-150 (promptScope)
- Trigger: Enter invalid choices repeatedly (e.g., pressing "9" over and over).
- Workaround: Users can Ctrl+C to exit. In practice, stack overflow requires thousands of invalid inputs, so this is low severity.

**`--all` flag can be overridden by subsequent platform flags:**
- Symptoms: `npx topstepx-skill --all --claude` results in `['claude', 'opencode', 'codex', 'gemini', 'claude']` before deduplication. This is handled by the `new Set()` dedup on line 102, so behavior is correct but the parsing logic is fragile.
- Files: `bin/install.js`, lines 70-76
- Trigger: Combine `--all` with individual platform flags.
- Workaround: Deduplication handles it, but the arg parser should short-circuit when `--all` is present.

## Security Considerations

**File overwrite without confirmation:**
- Risk: The installer silently overwrites existing skill files at the destination. If a user has customized their local skill files, running the installer again destroys those changes without warning.
- Files: `bin/install.js`, function `copyDirSync()` (lines 40-51) and `install()` (lines 154-172)
- Current mitigation: None. `fs.copyFileSync` overwrites unconditionally.
- Recommendations: Check if destination exists and prompt for confirmation before overwriting. Or print a warning that existing files will be replaced.

**No symlink or permission checks in copyDirSync:**
- Risk: `copyDirSync()` follows directory entries without checking for symlinks. A malicious symlink in the source directory could cause files to be read from or written to unexpected locations.
- Files: `bin/install.js`, lines 40-51
- Current mitigation: The source is bundled with the npm package, so the risk is low in normal usage.
- Recommendations: Add `entry.isSymbolicLink()` check and skip or resolve symlinks explicitly.

**No lockfile committed:**
- Risk: The package has no dependencies so this is low risk currently, but if dependencies are added later, missing `package-lock.json` means non-deterministic installs.
- Files: Project root (missing `package-lock.json`)
- Current mitigation: Zero runtime dependencies.
- Recommendations: Run `npm install` and commit `package-lock.json` if/when dependencies are added.

## Performance Bottlenecks

No performance concerns identified. The codebase is a small CLI installer with synchronous file copy operations. The skill content is static markdown. File sizes are well under 1KB-600 lines, so copy operations complete instantly.

## Fragile Areas

**Platform path resolution:**
- Files: `bin/install.js`, lines 13-34 (PLATFORMS object)
- Why fragile: Platform skill directory paths are hardcoded assumptions about where Claude Code, OpenCode, Codex CLI, and Gemini CLI look for skills. If any platform changes its skill directory convention, the installer breaks silently (files are copied to the wrong location).
- Safe modification: Update the path in the PLATFORMS object. Test by running the installer and verifying the target platform detects the skill.
- Test coverage: None. No tests verify that paths match actual platform expectations.

**SKILL.md frontmatter format:**
- Files: `skills/topstepx-api/SKILL.md`, lines 1-13
- Why fragile: The YAML frontmatter follows the "agentskills.io" spec. If any consuming platform parses this frontmatter strictly, field name changes or formatting errors break skill detection. There is no schema validation.
- Safe modification: Keep frontmatter fields exactly as documented in the agentskills.io spec. Test with each target platform after changes.
- Test coverage: None.

## Scaling Limits

Not applicable. This is a static content installer, not a runtime service.

## Dependencies at Risk

**Zero runtime dependencies:**
- The package uses only Node.js built-in modules (`fs`, `path`, `readline`, `os`). This is a strength, not a risk. No supply chain concerns.

**Node.js version floor:**
- Risk: `package.json` specifies `engines.node >= 16.7.0`. Node 16 reached end-of-life in September 2023. Users on Node 16 may have unpatched security issues in their runtime.
- Impact: Low direct impact since this is a simple file-copy tool, but the stated minimum should be bumped to a supported LTS version.
- Migration plan: Update `engines.node` to `>=18.0.0` (current oldest maintained LTS line).

## Missing Critical Features

**No uninstall command:**
- Problem: There is no way to remove installed skill files. Users must manually locate and delete the skill directory.
- Blocks: Clean removal workflow. If a user installs globally and wants to remove it, they need to know the exact path.

**No version check or update notification:**
- Problem: The installer does not check if a newer version of the skill content is available or if the installed version matches the current package version.
- Blocks: Users may run an outdated cached `npx` version and not realize their skill files are stale.

**No `--version` flag:**
- Problem: Running `npx topstepx-skill --version` does not print the version. The version is only shown in the banner during interactive mode.
- Blocks: Scriptable version checks.

## Test Coverage Gaps

**Entire codebase is untested:**
- What's not tested: All functionality - argument parsing, interactive prompts, file copying, platform path resolution, error handling during install.
- Files: `bin/install.js` (224 lines, 0% coverage)
- Risk: Any refactor or feature addition can introduce regressions with no safety net. The installer touches the user's file system, so bugs can create files in wrong locations or fail to install.
- Priority: High. This is the only executable code in the package and it writes to user file systems.

**Skill content has no validation:**
- What's not tested: The markdown files in `skills/topstepx-api/` have no automated checks for broken links, valid YAML frontmatter, or content correctness against the actual TopStepX API.
- Files: `skills/topstepx-api/SKILL.md`, `skills/topstepx-api/references/rest-api.md`, `skills/topstepx-api/references/realtime.md`, `skills/topstepx-api/references/enums.md`
- Risk: API documentation can drift from the actual TopStepX API without detection. Broken markdown formatting or invalid frontmatter could cause platforms to fail to load the skill.
- Priority: Medium. Content correctness affects the quality of AI-generated code for end users.

---

*Concerns audit: 2026-03-10*
