# Sentry v7 Implementation Audit

## Overview
This document provides a comprehensive audit of the current Sentry v7 implementation in the TaskMaster UI project, preparing for migration to Sentry v9.

## Current Version Information

### Frontend Packages
- `@sentry/react`: ^7.99.0
- `@sentry/tracing`: ^7.99.0

### Backend Packages
- `@sentry/node`: ^7.99.0
- `@sentry/profiling-node`: ^7.99.0
- `@sentry/tracing`: ^7.99.0

## Frontend Implementation Details

### Configuration Location
- Main config: `/packages/frontend/src/config/sentry.ts`
- Initialization: `/packages/frontend/src/main.tsx`

### Key Features Implemented

1. **Browser Tracing Integration**
   - Using `BrowserTracing` from `@sentry/tracing`
   - React Router v6 instrumentation configured
   - Custom trace propagation targets defined

2. **Session Replay**
   - Replay integration configured with 10% session sample rate
   - 100% error sample rate for replays
   - Text masking enabled, media playback allowed

3. **Performance Monitoring**
   - Custom transaction helpers: `startTransaction()`, `measurePerformance()`
   - Environment-based sample rates (production: 0.1, development: 1.0)

4. **Error Filtering**
   - Browser extension errors filtered in production
   - Network errors filtered
   - Custom `beforeSend` hook for error processing

5. **User Context**
   - Automatic user context attachment from localStorage
   - User ID, email, and username captured

6. **Custom Error Classes**
   - ApplicationError (base class)
   - ValidationError
   - AuthenticationError
   - AuthorizationError
   - NotFoundError

### Integration Points
- ErrorBoundary components (not fully integrated with Sentry)
- Performance monitoring service
- Logger utility

## Backend Implementation Details

### Configuration Location
- Main config: `/packages/backend/src/config/sentry.ts`
- Initialization: `/packages/backend/src/index.ts`

### Key Features Implemented

1. **Node.js Integrations**
   - HTTP tracing enabled
   - Express.js middleware tracing
   - Prisma ORM integration
   - Uncaught exception handler
   - Unhandled rejection handler

2. **Performance Monitoring**
   - Custom transaction sampling logic
   - Health check and static asset exclusions
   - Transaction helpers similar to frontend

3. **Error Handling**
   - Express middleware setup (requestHandler, tracingHandler, errorHandler)
   - Custom error classes with status codes
   - Context capture helper function

4. **Security Measures**
   - Sensitive data removal (cookies, authorization headers)
   - Validation error filtering

5. **Advanced Features**
   - Async handler wrapper with Sentry integration
   - Profiling integration (commented out due to missing native module)
   - Detailed context capture for errors

## Deprecated APIs and Methods Used

1. **Frontend Deprecated Items**
   - `BrowserTracing` import from `@sentry/tracing` (moved to main package in v8+)
   - `Sentry.getCurrentHub()` usage (deprecated in favor of new client API)

2. **Backend Deprecated Items**
   - Separate `@sentry/tracing` package import
   - `getCurrentHub()` method in asyncHandler
   - Legacy integration initialization patterns

## Migration Considerations

### Breaking Changes to Address
1. Package consolidation - `@sentry/tracing` merged into main packages
2. Integration API changes
3. Configuration option updates
4. New initialization patterns
5. Updated performance monitoring APIs

### Features to Update
1. Replace deprecated hub-based APIs
2. Update integration configurations
3. Migrate to new error boundary patterns
4. Update transaction and span creation methods
5. Review and update sampling strategies

### Risk Areas
1. Custom error boundary integration needs review
2. Performance monitoring helpers may need refactoring
3. Middleware integration patterns have changed
4. User context handling may need updates

## Files Requiring Updates

### High Priority
1. `/packages/frontend/src/config/sentry.ts`
2. `/packages/backend/src/config/sentry.ts`
3. `/packages/frontend/package.json`
4. `/packages/backend/package.json`

### Medium Priority
1. `/packages/frontend/src/components/ErrorBoundary/AppErrorBoundary.tsx`
2. `/packages/backend/src/config/sentry.ts` (asyncHandler function)
3. `/packages/frontend/src/services/performanceMonitoring.ts`
4. `/packages/frontend/src/utils/logger.ts`

### Low Priority
1. Documentation files
2. Test files that mock Sentry
3. Build configuration files

## Recommendations

1. **Phased Migration**: Start with package updates and basic configuration changes
2. **Testing Strategy**: Comprehensive testing of error capture and performance monitoring
3. **Monitoring**: Set up parallel monitoring during migration to catch any issues
4. **Documentation**: Update all internal documentation with v9 patterns
5. **Training**: Ensure team is aware of new APIs and best practices

## Next Steps

1. Create a detailed migration plan based on this audit
2. Set up a test environment for v9 migration
3. Begin with package updates and dependency resolution
4. Migrate configuration and initialization code
5. Update all API usage throughout the codebase
6. Thoroughly test all error handling and monitoring features