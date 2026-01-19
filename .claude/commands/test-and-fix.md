# /test-and-fix

Run tests, fix any failures, repeat until all pass.

## Task

1. Run the test suite: `npm test`
2. If all tests pass, report success and exit
3. If tests fail:
   a. Analyze the failure output carefully
   b. Identify the root cause
   c. Fix the failing code (not the test, unless the test is wrong)
   d. Run tests again
4. Repeat until all tests pass
5. Run type-check: `npm run type-check`
6. If type errors, fix them
7. Report final summary:
   - Number of iterations needed
   - Tests fixed
   - Any remaining concerns

## Rules

- **Never skip or delete tests** to make them pass
- **Fix the implementation**, not the test (unless test is clearly wrong)
- **Run full suite** each time, not just the failing test
- **Check for regressions** - fixing one test shouldn't break others

## Example Output

```
Iteration 1: 3 tests failing
- Fixed: calculateBreakEven missing decimal conversion
- Fixed: formatEUR locale issue

Iteration 2: 1 test failing
- Fixed: edge case for zero revenue

Iteration 3: All tests passing ✓

Type-check: No errors ✓

Summary: 3 iterations, 3 fixes applied
```
