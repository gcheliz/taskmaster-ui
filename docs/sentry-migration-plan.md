# Sentry v7 to v9 Migration Plan

## Migration Strategy
Since we're migrating from v7 to v9, we need a two-step approach:
1. First migrate from v7 to v8 
2. Then migrate from v8 to v9

## Target Versions
- Frontend: @sentry/react v9.42.0
- Backend: @sentry/node v9.42.0
- Remove: @sentry/tracing (merged into main packages in v8+)
- Remove: @sentry/profiling-node (if not actively used)

## Step 1: Package Updates

### Frontend Dependencies
```bash
# Remove deprecated packages
pnpm remove @sentry/tracing

# Update to v9
pnpm add @sentry/react@^9.42.0
```

### Backend Dependencies
```bash
# Remove deprecated packages
pnpm remove @sentry/tracing @sentry/profiling-node

# Update to v9
pnpm add @sentry/node@^9.42.0
```

## Step 2: Code Changes Required

### Frontend Changes

1. **Update imports**
   - Remove `@sentry/tracing` imports
   - Use `@sentry/react` for all imports

2. **Integration API updates**
   - Convert class-based integrations to functional integrations
   - Update BrowserTracing to browserTracingIntegration()
   - Update Replay to replayIntegration()

3. **Remove deprecated APIs**
   - Replace `getCurrentHub()` with new Scope API
   - Update transaction/span creation methods

4. **Configuration updates**
   - Update initialization options
   - Remove deprecated options

### Backend Changes

1. **Update imports**
   - Remove `@sentry/tracing` imports
   - Use `@sentry/node` for all imports

2. **Integration updates**
   - Convert to functional integrations
   - Update Express integration
   - Update Prisma integration

3. **Middleware updates**
   - Update request handler patterns
   - Update error handler patterns

4. **Remove Hub API usage**
   - Replace `getCurrentHub()` calls
   - Update scope management

## Step 3: Testing Strategy

1. **Unit Tests**
   - Update mocked Sentry imports
   - Fix any broken tests

2. **Integration Tests**
   - Test error capture flows
   - Test performance monitoring
   - Test user context

3. **E2E Tests**
   - Verify error reporting in UI
   - Check performance metrics
   - Test error boundaries

## Step 4: Verification

1. **Local Testing**
   - Trigger test errors
   - Verify Sentry dashboard receives events
   - Check performance data

2. **Staging Deployment**
   - Deploy to staging environment
   - Monitor for any issues
   - Verify all features work

3. **Production Rollout**
   - Deploy with feature flag if possible
   - Monitor error rates
   - Check performance impact

## Rollback Plan

If issues arise:
1. Revert package.json changes
2. Revert code changes
3. Run `pnpm install` to restore dependencies
4. Deploy previous version

## Timeline
- Package updates: 30 minutes
- Code migration: 2-3 hours
- Testing: 1-2 hours
- Total estimated time: 4-6 hours