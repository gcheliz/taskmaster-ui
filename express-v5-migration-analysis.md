# Express v4 to v5 Migration Analysis

## Current State
- **Express Version**: 4.21.2
- **Related Middleware**:
  - cors: ^2.8.5
  - express-session: ^1.18.2
  - @types/express: ^4.17.21
  - @types/express-session: ^1.18.2

## Express Usage Patterns Found

### 1. Route Files (14 files)
All route files use `express.Router()`:
- exportRoutes.ts, taskMasterRoutes.ts, prdRoutes.ts, healthRoutes.ts
- repositoryRoutes.ts, terminalRoutes.ts, performanceRoutes.ts, projectRoutes.ts
- commandRoutes.ts, authRoutes.ts, dashboardRoutes.ts, settingsRoutes.ts
- realtimeRoutes.ts, taskMasterTerminalRoutes.ts

### 2. Controllers (13 files)
Controllers import Express types for Request/Response handling

### 3. Middleware (5 files)
- errorHandler.ts - Uses 4-parameter error handling signature
- auth.ts, validation.ts, rateLimiter.ts - Standard middleware patterns
- All middleware uses proper TypeScript types

### 4. Main App File
- app.ts - Core Express application setup with middleware chain

## Breaking Changes That Affect Our Code

### 1. ✅ No Impact - Methods We Don't Use
- Not using `app.del()` 
- Not using `req.param()`
- Not using `res.sendfile()` 
- Not using magic redirects like `res.redirect('back')`

### 2. ⚠️ Potential Impact - Need Verification
- **Route patterns**: Need to check if any routes use `*` or `?` characters
- **Query handling**: `req.query` becomes read-only (need to check if we modify it)
- **Body parsing**: `req.body` returns `undefined` instead of `{}`

### 3. ✅ Improvements - Beneficial Changes
- **Async error handling**: Promises rejected in middleware automatically forward to error handlers
- **Better TypeScript support**: Express v5 has improved type definitions
- **Performance**: Brotli encoding support

## Dependencies Compatibility Check Needed
1. **cors** - Check v5 compatibility
2. **express-session** - May need update
3. **@types/express** - Will need v5 types
4. **Sentry Express integration** - Already updated for v9

## Migration Strategy

### Phase 1: Analysis & Preparation
1. Search for route patterns using wildcards or optional characters
2. Check if any code modifies `req.query`
3. Review body parsing logic for empty body handling

### Phase 2: Dependencies Update
1. Update Express to v5.1.0
2. Update middleware packages for v5 compatibility
3. Update TypeScript types

### Phase 3: Code Migration
1. Run Express codemod tool
2. Fix any route pattern issues
3. Update error handling if needed
4. Test all endpoints

### Phase 4: Testing & Validation
1. Run existing test suite
2. Manual testing of all API endpoints
3. Load testing to ensure performance

## Risk Assessment
- **Low Risk**: Most breaking changes don't affect our usage patterns
- **Medium Risk**: Route pattern changes and query handling
- **Mitigation**: Express codemod tool should handle most changes automatically