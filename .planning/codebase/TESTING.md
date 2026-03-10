# Testing Patterns

**Analysis Date:** 2026-03-10

## Test Framework

**Runner:** None detected

No test framework is configured. There are no test files, no test configuration files, and no test-related dependencies in `package.json`. The `package.json` has no `scripts` section at all.

## Current State

**Test files:** None exist in the repository.

**Test configuration:** No `jest.config.*`, `vitest.config.*`, `mocha.*`, or any other test runner config.

**Test dependencies:** Zero dependencies (dev or otherwise) in `package.json`.

**CI pipeline:** None detected. No `.github/workflows/`, no `.gitlab-ci.yml`, no other CI config.

## What Should Be Tested

The codebase has one executable file: `bin/install.js` (224 lines). Testable units include:

**Pure functions (easy to test):**
- `copyDirSync(src, dest)` in `bin/install.js` -- recursive directory copy
- `parseArgs(argv)` in `bin/install.js` -- CLI argument parsing, returns `{ platforms: [], scope: null }`
- `install(platforms, scope)` in `bin/install.js` -- copies skill files to platform-specific paths

**Interactive functions (require mocking readline):**
- `promptPlatform(rl)` in `bin/install.js` -- platform selection prompt
- `promptScope(rl)` in `bin/install.js` -- scope selection prompt

**Integration-level:**
- Full installer flow: `main()` in `bin/install.js`

## Recommended Setup

If tests are added, follow these conventions based on the project's Node.js/CommonJS style:

**Framework:** Node.js built-in test runner (`node:test`) since the project uses zero dependencies. Alternatively, `vitest` or `jest` if a test runner is preferred.

**File location:** Co-locate tests as `bin/install.test.js` or create `test/install.test.js`.

**Naming:** `*.test.js` suffix.

**Run command:**
```bash
node --test                    # Node.js built-in runner
# or add to package.json scripts:
# "test": "node --test"
```

**Example test structure (using node:test):**
```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('parseArgs', () => {
  it('parses --claude --global flags', () => {
    const result = parseArgs(['node', 'install.js', '--claude', '--global']);
    assert.deepStrictEqual(result.platforms, ['claude']);
    assert.strictEqual(result.scope, 'global');
  });

  it('deduplicates platform flags', () => {
    const result = parseArgs(['node', 'install.js', '--claude', '--claude']);
    assert.deepStrictEqual(result.platforms, ['claude']);
  });

  it('--all selects all platforms', () => {
    const result = parseArgs(['node', 'install.js', '--all']);
    assert.strictEqual(result.platforms.length, 4);
  });
});
```

**Mocking approach (filesystem):**
```javascript
const { mock } = require('node:test');
const fs = require('fs');

// Mock fs.mkdirSync and fs.copyFileSync for install() tests
mock.method(fs, 'mkdirSync', () => {});
mock.method(fs, 'copyFileSync', () => {});
```

## Coverage

**Requirements:** None enforced. No coverage thresholds configured.

**Current coverage:** 0% -- no tests exist.

## Test Types

**Unit Tests:** Not present. Would cover `parseArgs()`, `copyDirSync()`, `install()`.

**Integration Tests:** Not present. Would cover full `main()` flow with mocked filesystem and stdin.

**E2E Tests:** Not present. Would run `npx topstepx-skill --claude --local` and verify files are copied to expected paths.

## Test Coverage Gaps

**All code is untested:**
- `bin/install.js` -- argument parsing, filesystem operations, interactive prompts, install logic
- No validation that skill files are correctly copied
- No validation that platform paths resolve correctly across operating systems
- No validation of `--help` output or exit codes

**Priority areas if adding tests:**
1. **High:** `parseArgs()` -- pure function, easy to test, critical for non-interactive mode
2. **High:** `install()` -- core logic, verify correct paths for each platform/scope combo
3. **Medium:** `copyDirSync()` -- filesystem operation, verify recursive copy behavior
4. **Low:** Interactive prompts -- harder to test, less critical than CLI flags

---

*Testing analysis: 2026-03-10*
