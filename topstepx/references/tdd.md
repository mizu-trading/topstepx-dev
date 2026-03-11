<overview>
TDD reference for the TSX framework. TDD is about design quality, not coverage metrics. The red-green-refactor cycle forces you to think about behavior before implementation, producing cleaner interfaces and more testable code.

**Principle:** If you can describe the behavior as `expect(fn(input)).toBe(output)` before writing `fn`, TDD improves the result.

**Key insight:** TDD work is fundamentally heavier than standard tasks--it requires 2-3 execution cycles (RED -> GREEN -> REFACTOR), each with file reads, test runs, and potential debugging. TDD features get dedicated plans to ensure full context is available throughout the cycle. The tsx-planner creates TDD plans; the tsx-executor runs the red-green-refactor cycle.
</overview>

<when_to_use_tdd>
## When TDD Improves Quality

**TDD candidates (create a TDD plan):**
- Business logic with defined inputs/outputs
- API endpoints with request/response contracts
- Data transformations, parsing, formatting
- Validation rules and constraints
- Algorithms with testable behavior
- State machines and workflows
- Utility functions with clear specifications

**Skip TDD (use standard plan with `type="auto"` tasks):**
- UI layout, styling, visual components
- Configuration changes
- Glue code connecting existing components
- One-off scripts and migrations
- Simple CRUD with no business logic
- Exploratory prototyping

**Heuristic:** Can you write `expect(fn(input)).toBe(output)` before writing `fn`?
-> Yes: Create a TDD plan
-> No: Use standard plan, add tests after if needed
</when_to_use_tdd>

<tdd_plan_structure>
## TDD Plan Structure

Each TDD plan implements **one feature** through the full RED-GREEN-REFACTOR cycle.

```markdown
---
phase: XX-name
plan: NN
type: tdd
---

<objective>
[What feature and why]
Purpose: [Design benefit of TDD for this feature]
Output: [Working, tested feature]
</objective>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@relevant/source/files.ts
</context>

<feature>
  <name>[Feature name]</name>
  <files>[source file, test file]</files>
  <behavior>
    [Expected behavior in testable terms]
    Cases: input -> expected output
  </behavior>
  <implementation>[How to implement once tests pass]</implementation>
</feature>

<verification>
[Test command that proves feature works]
</verification>

<success_criteria>
- Failing test written and committed
- Implementation passes test
- Refactor complete (if needed)
- All 2-3 commits present
</success_criteria>

<output>
After completion, create SUMMARY.md with:
- RED: What test was written, why it failed
- GREEN: What implementation made it pass
- REFACTOR: What cleanup was done (if any)
- Commits: List of commits produced
</output>
```

**One feature per TDD plan.** If features are trivial enough to batch, they're trivial enough to skip TDD--use a standard plan and add tests after.
</tdd_plan_structure>

<execution_flow>
## Red-Green-Refactor Cycle

**RED - Write failing test:**
1. Create test file following project conventions
2. Write test describing expected behavior (from `<behavior>` element)
3. Run test - it MUST fail
4. If test passes: feature exists or test is wrong. Investigate.
5. Commit: `test({phase}-{plan}): add failing test for [feature]`

**GREEN - Implement to pass:**
1. Write minimal code to make test pass
2. No cleverness, no optimization - just make it work
3. Run test - it MUST pass
4. Commit: `feat({phase}-{plan}): implement [feature]`

**REFACTOR (if needed):**
1. Clean up implementation if obvious improvements exist
2. Run tests - MUST still pass
3. Only commit if changes made: `refactor({phase}-{plan}): clean up [feature]`

**Result:** Each TDD plan produces 2-3 atomic commits. The tsx-executor handles the full cycle automatically.
</execution_flow>

<test_quality>
## Good Tests vs Bad Tests

**Test behavior, not implementation:**
- Good: "returns formatted date string"
- Bad: "calls formatDate helper with correct params"
- Tests should survive refactors

**One concept per test:**
- Good: Separate tests for valid input, empty input, malformed input
- Bad: Single test checking all edge cases with multiple assertions

**Descriptive names:**
- Good: "should reject empty email", "returns null for invalid ID"
- Bad: "test1", "handles error", "works correctly"

**No implementation details:**
- Good: Test public API, observable behavior
- Bad: Mock internals, test private methods, assert on internal state
</test_quality>

<framework_setup>
## Test Framework Setup (If None Exists)

When executing a TDD plan but no test framework is configured, set it up as part of the RED phase:

**1. Detect project type:**
```bash
# JavaScript/TypeScript
if [ -f package.json ]; then echo "node"; fi

# Python
if [ -f requirements.txt ] || [ -f pyproject.toml ]; then echo "python"; fi

# Go
if [ -f go.mod ]; then echo "go"; fi

# Rust
if [ -f Cargo.toml ]; then echo "rust"; fi
```

**2. Install minimal framework:**
| Project | Framework | Install |
|---------|-----------|---------|
| Node.js | Jest | `npm install -D jest @types/jest ts-jest` |
| Node.js (Vite) | Vitest | `npm install -D vitest` |
| Python | pytest | `pip install pytest` |
| Go | testing | Built-in |
| Rust | cargo test | Built-in |

**3. Create config if needed:**
- Jest: `jest.config.js` with ts-jest preset
- Vitest: `vitest.config.ts` with test globals
- pytest: `pytest.ini` or `pyproject.toml` section

**4. Verify setup:**
```bash
# Run empty test suite - should pass with 0 tests
npm test  # Node
pytest    # Python
go test ./...  # Go
cargo test    # Rust
```

**5. Create first test file:**
Follow project conventions for test location:
- `*.test.ts` / `*.spec.ts` next to source
- `__tests__/` directory
- `tests/` directory at root

Framework setup is a one-time cost included in the first TDD plan's RED phase.
</framework_setup>

<error_handling>
## Error Handling

**Test doesn't fail in RED phase:**
- Feature may already exist - investigate
- Test may be wrong (not testing what you think)
- Fix before proceeding

**Test doesn't pass in GREEN phase:**
- Debug implementation
- Don't skip to refactor
- Keep iterating until green

**Tests fail in REFACTOR phase:**
- Undo refactor
- Commit was premature
- Refactor in smaller steps

**Unrelated tests break:**
- Stop and investigate
- May indicate coupling issue
- Fix before proceeding
</error_handling>

<commit_pattern>
## Commit Pattern for TDD Plans

TDD plans produce 2-3 atomic commits (one per phase):

```
test(08-02): add failing test for email validation

- Tests valid email formats accepted
- Tests invalid formats rejected
- Tests empty input handling

feat(08-02): implement email validation

- Regex pattern matches RFC 5322
- Returns boolean for validity
- Handles edge cases (empty, null)

refactor(08-02): extract regex to constant (optional)

- Moved pattern to EMAIL_REGEX constant
- No behavior changes
- Tests still pass
```

**Comparison with standard plans:**
- Standard plans: 1 commit per task, 2-4 commits per plan
- TDD plans: 2-3 commits for single feature

Both follow same format: `{type}({phase}-{plan}): {description}`

**Benefits:**
- Each commit independently revertable
- Git bisect works at commit level
- Clear history showing TDD discipline
- Consistent with overall commit strategy
</commit_pattern>

<context_budget>
## Context Budget

TDD plans target **~40% context usage** (lower than standard plans' ~50%).

Why lower:
- RED phase: write test, run test, potentially debug why it didn't fail
- GREEN phase: implement, run test, potentially iterate on failures
- REFACTOR phase: modify code, run tests, verify no regressions

Each phase involves reading files, running commands, analyzing output. The back-and-forth is inherently heavier than linear task execution.

Single feature focus ensures full quality throughout the cycle.
</context_budget>

<trading_tdd_examples>
## Trading-Specific TDD Examples

### Example 1: Order Placement Logic

**Behavior:** Order placement must use enum constants, attach bracket orders, and enforce position size limits.

**RED:**
```typescript
// src/__tests__/order-placement.test.ts
describe('placeOrder', () => {
  it('should use OrderSide enum constant, not bare integer', () => {
    const order = buildOrder({ direction: 'long' });
    expect(order.side).toBe(OrderSide.Bid);  // 0, but via enum
    expect(order.side).not.toBe(0);           // Reject bare integer
  });

  it('should attach bracket orders to every entry', () => {
    const order = buildOrder({ direction: 'long', price: 5000 });
    expect(order.takeProfit).toBeDefined();
    expect(order.stopLoss).toBeDefined();
    expect(order.takeProfit).toBeGreaterThan(order.price);
    expect(order.stopLoss).toBeLessThan(order.price);
  });

  it('should reject orders exceeding max position size', () => {
    const config = { maxContracts: 2 };
    expect(() => buildOrder({ size: 5, config })).toThrow('exceeds max position size');
  });
});
```

**GREEN:** Implement `buildOrder()` that maps directions to `OrderSide` enum, attaches TP/SL from risk config, validates size against limits.

### Example 2: Technical Analysis Calculations

**Behavior:** SMA and EMA calculations produce known values for known input series.

**RED:**
```typescript
// src/__tests__/indicators.test.ts
describe('SMA', () => {
  it('should calculate 3-period SMA correctly', () => {
    const prices = [10, 20, 30, 40, 50];
    const sma = calculateSMA(prices, 3);
    // SMA(3) at index 2: (10+20+30)/3 = 20
    // SMA(3) at index 3: (20+30+40)/3 = 30
    // SMA(3) at index 4: (30+40+50)/3 = 40
    expect(sma).toEqual([null, null, 20, 30, 40]);
  });
});

describe('EMA', () => {
  it('should calculate 3-period EMA correctly', () => {
    const prices = [10, 20, 30, 40, 50];
    const ema = calculateEMA(prices, 3);
    // EMA multiplier: 2/(3+1) = 0.5
    // EMA[2] = SMA(3) = 20
    // EMA[3] = 40*0.5 + 20*0.5 = 30
    // EMA[4] = 50*0.5 + 30*0.5 = 40
    expect(ema[2]).toBeCloseTo(20);
    expect(ema[3]).toBeCloseTo(30);
    expect(ema[4]).toBeCloseTo(40);
  });
});
```

**GREEN:** Implement `calculateSMA()` and `calculateEMA()` with sliding window and exponential weighting.

### Example 3: Risk Guardrail Enforcement

**Behavior:** Risk guardrails reject dangerous operations and enforce daily loss limits.

**RED:**
```typescript
// src/__tests__/risk-guardrails.test.ts
describe('RiskGuardrails', () => {
  it('should reject position size exceeding max contracts', () => {
    const guard = new RiskGuard({ maxContracts: 3 });
    expect(guard.validateOrder({ size: 5 })).toEqual({
      allowed: false,
      reason: 'Position size 5 exceeds max 3 contracts'
    });
  });

  it('should block trading when daily loss limit reached', () => {
    const guard = new RiskGuard({ maxDailyLoss: 500 });
    guard.recordLoss(300);
    guard.recordLoss(250);  // Total: $550, exceeds $500 limit
    expect(guard.canTrade()).toBe(false);
    expect(guard.status()).toBe('DAILY_LOSS_LIMIT_REACHED');
  });

  it('should enforce bracket orders on every entry', () => {
    const guard = new RiskGuard({ requireBrackets: true });
    const orderWithout = { side: OrderSide.Bid, size: 1 };
    const orderWith = { side: OrderSide.Bid, size: 1, tp: 5010, sl: 4990 };
    expect(guard.validateOrder(orderWithout).allowed).toBe(false);
    expect(guard.validateOrder(orderWith).allowed).toBe(true);
  });
});
```

**GREEN:** Implement `RiskGuard` class with position tracking, P&L accumulation, and bracket validation.
</trading_tdd_examples>
