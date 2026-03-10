# Coding Conventions

**Analysis Date:** 2026-03-10

## Project Nature

This is a **documentation-and-installer** project, not a typical application. It consists of:
- One JavaScript CLI script (`bin/install.js`)
- Markdown reference documentation (`skills/topstepx-api/`)
- Package metadata (`package.json`)

Conventions are derived primarily from `bin/install.js` (the sole source file, 224 lines).

## Naming Patterns

**Files:**
- Lowercase with hyphens for directories and config: `topstepx-api`, `rest-api.md`, `install.js`
- UPPERCASE for documentation: `SKILL.md`, `CHANGELOG.md`, `README.md`, `LICENSE`

**Functions:**
- camelCase: `copyDirSync`, `parseArgs`, `promptPlatform`, `promptScope`, `printBanner`
- Descriptive verb-noun pattern: `copyDirSync()`, `parseArgs()`, `printBanner()`

**Variables:**
- camelCase for locals: `skillSrc`, `destPath`, `srcPath`
- UPPER_SNAKE_CASE for module-level constants: `VERSION`, `SKILL_NAME`, `PLATFORMS`, `PLATFORM_KEYS`

**Parameters:**
- camelCase: `rl`, `argv`, `platforms`, `scope`

## Code Style

**Formatting:**
- No formatter config detected (no `.prettierrc`, `.editorconfig`, or `biome.json`)
- 2-space indentation used throughout `bin/install.js`
- Single quotes for strings
- Semicolons at end of statements
- Trailing commas in multi-line objects and arrays

**Linting:**
- No linter config detected (no `.eslintrc`, `eslint.config.*`)
- Code is clean and consistent despite no automated enforcement

## Language and Runtime

**JavaScript (CommonJS):**
- Use `require()` for imports, not ES modules
- Use `const` for all declarations unless reassignment is needed (then `let`)
- No `var` usage
- Node.js >= 16.7.0 required (per `package.json` engines field)
- Zero external dependencies -- stdlib only (`fs`, `path`, `readline`, `os`)

## Import Organization

**Order (observed in `bin/install.js`):**
1. Node.js built-in modules (`fs`, `path`, `readline`, `os`)
2. Local requires (`../package.json`)

**Style:**
- One `const` per require
- No destructuring of requires (each module imported as whole)

## Code Organization

**Section comments** use decorative banner style:
```javascript
// -- Section Name -------------------------------------------------------
```

Sections in `bin/install.js` follow this order:
1. Imports and constants
2. Platform definitions (config object)
3. Helpers (pure utility functions)
4. CLI argument parsing
5. Interactive prompts
6. Install logic (core functionality)
7. Main entry point

**When adding new code, follow this pattern:** group related functionality under a banner comment, place pure helpers before the functions that use them.

## Error Handling

**Patterns:**
- `try/catch` around filesystem operations with `console.error` for user-facing messages:
  ```javascript
  try {
    copyDirSync(skillSrc, dest);
    installed.push({ name: platform.name, path: dest });
  } catch (err) {
    console.error(`  Error installing for ${platform.name}: ${err.message}`);
  }
  ```
- Top-level `main().catch()` to catch unhandled async errors and exit with code 1:
  ```javascript
  main().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
  ```
- `try/finally` for resource cleanup (closing readline interface):
  ```javascript
  try {
    // prompts...
  } finally {
    rl.close();
  }
  ```

**Guidelines:**
- Use `err.message` in user-facing output, not full stack traces
- Use `process.exit(1)` for fatal errors only
- Use `process.exit(0)` for successful early exit (e.g., `--help`)

## Console Output

**User-facing output style:**
- 2-space indent prefix on all output lines: `console.log('  message here');`
- Blank lines (`console.log('')`) used for visual spacing between sections
- No color libraries -- plain text only
- Template literals for dynamic values: `` `  ${item.name} -> ${item.path}` ``

## Function Design

**Size:** Functions are small and single-purpose (5-30 lines typical)

**Parameters:** Simple positional parameters; no options objects

**Return Values:**
- Sync functions return values directly
- Async functions return Promises (via `async/await`)
- Recursive calls for input validation (re-prompt on invalid input)

**Async pattern:** `async/await` with Promise wrappers for callback APIs:
```javascript
function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}
```

## Module Design

**Exports:** None. `bin/install.js` is a CLI entry point, not a library. It executes `main()` at module level.

**Barrel Files:** Not used.

**Config objects:** Use a single `PLATFORMS` object as a registry pattern, keyed by platform identifier, with each entry containing `name`, `local()`, and `global()` path functions.

## Markdown Documentation Conventions

**Skill files (`skills/topstepx-api/`):**
- YAML frontmatter with `name`, `description`, `license`, `compatibility`, `metadata` fields
- Markdown tables for structured data (endpoints, enums, parameters)
- Fenced code blocks with language annotations (`json`, `javascript`, `bash`)
- `##` for major sections, `###` for subsections
- Horizontal rules (`---`) between major sections in reference docs

**Project docs (`README.md`, `CHANGELOG.md`):**
- Keep a Changelog format for `CHANGELOG.md`
- Tables for structured information (flags, platform paths)
- Code blocks for CLI examples

---

*Convention analysis: 2026-03-10*
