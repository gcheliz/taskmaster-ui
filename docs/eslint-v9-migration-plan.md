# ESLint v9 Migration Plan

## Current State Assessment

### Frontend Package

- **ESLint Version**: v9.31.0 ✅ (Already upgraded)
- **TypeScript ESLint**: v8.37.0 ✅ (Already upgraded)
- **Configuration**: Using flat config format (eslint.config.js) ✅
- **Status**: Already migrated to ESLint v9

### Backend Package

- **ESLint Version**: v8.57.1 ⚠️ (Needs upgrade)
- **TypeScript ESLint**: v6.15.0 ⚠️ (Needs upgrade)
- **Configuration**: Using legacy .eslintrc.js format ⚠️
- **Status**: Requires migration

## Migration Strategy

### Phase 1: Backend Package Migration

#### 1.1 Dependencies Update

```bash
# Update ESLint and TypeScript ESLint
pnpm add -D eslint@^9.31.0 typescript-eslint@^8.37.0 --filter=backend
pnpm remove @typescript-eslint/eslint-plugin @typescript-eslint/parser --filter=backend
```

#### 1.2 Convert .eslintrc.js to eslint.config.js

Current backend configuration needs to be converted from:

```javascript
// .eslintrc.js (legacy format)
module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  // ...
};
```

To flat config format:

```javascript
// eslint.config.js (flat config)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
// ...
```

### Phase 2: Plugin Compatibility

#### Current Plugins Status:

- **eslint-plugin-react**: v7.37.5 ✅ (Compatible)
- **eslint-plugin-react-hooks**: v5.2.0 ✅ (Compatible)
- **eslint-plugin-react-refresh**: v0.4.20 ✅ (Compatible)
- **eslint-plugin-storybook**: v9.0.18 ✅ (Compatible)

### Phase 3: Configuration Updates

#### Key Changes in ESLint v9:

1. **Flat Config Format**: All configurations must use the new flat config format
2. **No More .eslintrc files**: Must migrate to eslint.config.js
3. **Plugin Loading**: Plugins are now imported as ES modules
4. **Global Definitions**: Use `globals` package instead of `env` property
5. **Parser Options**: Now under `languageOptions` property

### Phase 4: Testing Strategy

1. Run linting on backend after migration
2. Verify all existing rules work correctly
3. Check IDE integration (VS Code)
4. Ensure CI/CD pipeline works with new configuration

## Breaking Changes to Address

### For Backend Migration:

1. **Config File Format**: Convert .eslintrc.js to eslint.config.js
2. **Environment Variables**: Replace `env` with `globals` from globals package
3. **Extends Property**: Replace with spread operator and config arrays
4. **Parser Options**: Move under `languageOptions`
5. **Override Structure**: Convert to separate config objects in array

### TypeScript ESLint v8 Changes:

1. **Single Package**: Use `typescript-eslint` instead of separate parser/plugin
2. **Config Helper**: Use `tseslint.config()` for type-safe configuration
3. **Preset Configs**: Use new preset configurations (recommended, strict, etc.)

## Implementation Timeline

1. **Subtask 6.1**: Audit and prepare migration plan ✅ (Current)
2. **Subtask 6.2**: Upgrade ESLint and TypeScript ESLint packages
3. **Subtask 6.3**: Convert configurations and verify functionality

## Risk Mitigation

1. **Backup**: Keep copies of original .eslintrc.js files
2. **Gradual Migration**: Test backend migration before updating CI/CD
3. **Rollback Plan**: Document current working versions for quick rollback
4. **Testing**: Comprehensive testing after each migration step
