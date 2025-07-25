# Preventing Vitest CPU Overload

## Problem
Vitest can spawn multiple worker processes that consume 100% CPU, making your laptop unresponsive. This often happens when:
- Tests run in watch mode by default
- Multiple test instances are spawned in parallel
- Tests hang or timeout without proper cleanup
- Too many concurrent threads are allowed

## Prevention Measures Implemented

### 1. Vitest Configuration Updates
Updated `packages/frontend/vitest.config.ts` with:
```typescript
{
  test: {
    // Use thread pool with limited workers
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 2,  // Limit to 2 threads max
        minThreads: 1,
      }
    },
    // Prevent hanging tests
    testTimeout: 30000,  // 30 seconds timeout
    hookTimeout: 30000,
    // Disable watch mode by default
    watch: false,
    // Run tests sequentially
    maxConcurrency: 1,
  }
}
```

### 2. Package.json Script Updates
Updated test scripts to explicitly use `--run` flag:
```json
{
  "scripts": {
    "test": "vitest --run",           // Run once and exit
    "test:watch": "vitest",            // Watch mode (explicit)
    "test:coverage": "vitest --coverage --run"
  }
}
```

## Best Practices

### Running Tests
1. **Always use `pnpm test` for one-time runs** - This runs tests once and exits
2. **Use `pnpm test:watch` only when actively developing** - And remember to stop it when done
3. **Set resource limits** - The configuration now limits concurrent threads

### If CPU Overload Happens Again

1. **Find Vitest processes:**
   ```bash
   ps aux | grep -i vitest | grep -v grep
   ```

2. **Kill all Vitest processes:**
   ```bash
   # Option 1: Kill by name
   pkill -9 vitest
   
   # Option 2: Kill specific PIDs
   kill -9 [PID1] [PID2] ...
   ```

3. **Check for orphaned Node processes:**
   ```bash
   ps aux | grep -E 'node.*test' | grep -v grep
   ```

### Additional Safeguards

1. **Use test timeouts** - All tests now have a 30-second timeout
2. **Run tests in CI/CD** - Offload heavy test runs to CI pipelines
3. **Monitor resource usage** - Use Activity Monitor (macOS) to watch CPU usage
4. **Clean up properly** - Always use Ctrl+C to stop watch mode properly

## Environment Variables

You can further control test behavior with environment variables:

```bash
# Run with even stricter limits
VITEST_MAX_THREADS=1 pnpm test

# Run specific test files only
pnpm test src/components/Auth/__tests__/LoginForm.test.tsx
```

## Troubleshooting

If tests are still causing issues:

1. **Check for infinite loops in tests**
2. **Look for missing `await` on async operations**
3. **Ensure proper cleanup in `afterEach` hooks**
4. **Check for memory leaks in test setup**

## References
- [Vitest Configuration](https://vitest.dev/config/)
- [Vitest Performance Tips](https://vitest.dev/guide/performance.html)