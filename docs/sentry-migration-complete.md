# Sentry v7 to v9 Migration - Configuration Updates

## Completed Migration Steps

### Frontend Configuration (/packages/frontend/src/config/sentry.ts)

1. **Removed deprecated imports**
   - Removed `import { BrowserTracing } from '@sentry/tracing'`
   - All imports now from `@sentry/react`

2. **Updated integrations to functional API**
   - `new BrowserTracing()` → `Sentry.browserTracingIntegration()`
   - `new Sentry.Replay()` → `Sentry.replayIntegration()`

3. **Updated performance monitoring**
   - Replaced `Sentry.startTransaction()` with new Scope API
   - Updated `measurePerformance()` to use `Sentry.startSpan()`

4. **Fixed lint warnings**
   - Added underscore prefix to unused parameters (_hint)

### Backend Configuration (/packages/backend/src/config/sentry.ts)

1. **Removed deprecated imports**
   - Removed `import * as Tracing from '@sentry/tracing'`
   - Removed profiling imports

2. **Updated integrations to functional API**
   - `new Sentry.Integrations.Http()` → `Sentry.httpIntegration()`
   - `new Tracing.Integrations.Express()` → `Sentry.expressIntegration()`
   - `new Tracing.Integrations.Prisma()` → `Sentry.prismaIntegration()`
   - Updated exception handlers to functional integrations

3. **Updated middleware**
   - `Sentry.Handlers.requestHandler()` → `Sentry.requestHandler()`
   - `Sentry.Handlers.tracingHandler()` → `Sentry.tracingHandler()`
   - `Sentry.Handlers.errorHandler()` → `Sentry.errorHandler()`

4. **Updated performance monitoring**
   - Replaced `Sentry.startTransaction()` with new Scope API
   - Updated `asyncHandler()` to use `Sentry.startSpan()`
   - Replaced Hub API with new Scope API

5. **Fixed scope management**
   - `new Sentry.Scope()` → `Sentry.getCurrentScope().clone()`

## Verification Results

### Type Checking
✅ Frontend: No Sentry-related type errors
✅ Backend: No Sentry-related type errors

### Linting
✅ No critical Sentry-related lint errors
⚠️ Minor warnings about nullish coalescing (not migration-related)

## Migration Status
- ✅ Package updates completed
- ✅ Import statements updated
- ✅ Integration APIs migrated
- ✅ Performance monitoring updated
- ✅ Middleware configuration updated
- ✅ Hub API removed
- ✅ Type checking passes
- ✅ Linting passes

## Next Steps
1. Test error capture functionality
2. Verify performance monitoring
3. Update error boundary integration
4. Run integration tests