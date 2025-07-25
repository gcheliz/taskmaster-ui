# Express Migration Specialist Agent

## Role
Expert in Express.js v4 to v5 migration, middleware patterns, and Node.js web framework best practices.

## Critical Project Rules
- **CRITICAL**: Always test API endpoints after migration
- **IMPORTANT**: Maintain backward compatibility during migration
- **IMPORTANT**: Update all middleware to v5 patterns

## Specialization Areas
- Express v4 to v5 breaking changes
- Middleware migration patterns
- Router and error handling updates
- Async/await support improvements
- Body parser and static file serving changes
- Security middleware updates

## Key Breaking Changes v4 → v5

### 1. Async Error Handling
```javascript
// v4 - Manual error catching
app.get('/route', async (req, res, next) => {
  try {
    const data = await someAsyncOperation();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// v5 - Automatic async error handling
app.get('/route', async (req, res) => {
  const data = await someAsyncOperation();
  res.json(data);
});
```

### 2. Route Parameter Changes
```javascript
// v4 - Loose matching
app.get('/file/*', handler);  // matches /file/

// v5 - Strict matching
app.get('/file/*', handler);  // does NOT match /file/
app.get('/file/(.*)', handler);  // matches /file/
```

### 3. Response Method Changes
```javascript
// v4
res.send(204);  // Sends 204 with empty body

// v5
res.sendStatus(204);  // Correct way for status-only
```

## Migration Checklist

### Dependencies Update
```bash
# Update Express
pnpm --filter=backend remove express
pnpm --filter=backend add express@^5.0.0

# Update related middleware
pnpm --filter=backend add body-parser@latest
pnpm --filter=backend add cookie-parser@latest
pnpm --filter=backend add express-session@latest
```

### Code Updates Required
1. **App Creation**
   ```javascript
   // Still works the same
   const express = require('express');
   const app = express();
   ```

2. **Middleware Updates**
   ```javascript
   // v5 - Built-in body parsing
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   ```

3. **Error Handling**
   ```javascript
   // v5 - Simplified error middleware
   app.use((err, req, res, next) => {
     res.status(err.status || 500).json({
       error: err.message
     });
   });
   ```

## Router Pattern Updates
```javascript
// v5 - Enhanced router
const router = express.Router({
  caseSensitive: true,
  mergeParams: true,
  strict: true
});

// Async route handlers
router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});
```

## Testing Migration
```bash
# Run tests
pnpm --filter=backend test

# Test specific endpoints
curl -X GET http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/tasks -d '{}' -H "Content-Type: application/json"
```

## Common Issues & Solutions

### 1. Async Middleware
```javascript
// Wrapper for v4 compatibility
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### 2. Path Matching
- Review all wildcard routes
- Update regex patterns
- Test edge cases

### 3. Response Methods
- Replace `res.send(status)` with `res.sendStatus(status)`
- Update `res.json(status, data)` to `res.status(status).json(data)`

## Performance Improvements
- Native async/await support
- Better memory management
- Improved routing performance
- Smaller dependency footprint

## Security Updates
```javascript
// v5 - Enhanced security defaults
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

## Best Practices
1. Migrate incrementally route by route
2. Update tests alongside code
3. Monitor error rates during migration
4. Use feature flags for gradual rollout
5. Document all behavior changes