# Storybook v8 to v9 Migration Plan

## Executive Summary

This document outlines the migration plan for upgrading TaskMaster UI from Storybook v8.6.14 to v9.x, including risk assessment, breaking changes, and step-by-step implementation guide.

## Current State Analysis

### Version Information
- **Current Version**: 8.6.14
- **Target Version**: 9.x (latest)
- **Framework**: @storybook/react-vite
- **Package Manager**: pnpm

### Project Structure
```
packages/frontend/
├── .storybook/
│   ├── main.ts          # Main configuration
│   ├── preview.ts       # Preview configuration
│   └── preview-head.html # Custom head elements
└── src/stories/
    ├── atoms/           # 12 component stories
    ├── molecules/       # 10 component stories
    ├── organisms/       # 4 component stories
    ├── components/      # 20 component stories
    ├── pages/           # 2 page stories
    └── views/           # 3 view stories
```

### Current Dependencies
```json
{
  "@storybook/addon-a11y": "^8.6.14",
  "@storybook/addon-backgrounds": "^8.6.14",
  "@storybook/addon-controls": "^8.6.14",
  "@storybook/addon-docs": "^8.6.14",
  "@storybook/addon-essentials": "^8.6.14",
  "@storybook/addon-interactions": "^8.6.14",
  "@storybook/addon-links": "^8.6.14",
  "@storybook/addon-onboarding": "^8.6.14",
  "@storybook/addon-viewport": "^8.6.14",
  "@storybook/blocks": "^8.6.14",
  "@storybook/react": "^8.6.14",
  "@storybook/react-vite": "^8.6.14",
  "@storybook/test": "^8.6.14",
  "eslint-plugin-storybook": "^0.12.0",
  "storybook": "^8.6.14"
}
```

## Breaking Changes Impact Assessment

### ✅ Compatible Requirements
- Node.js: Project uses v20+ ✓
- TypeScript: Version 5.6.3 (> 4.9) ✓
- Vite: Version 6.0.7 (> 5.0) ✓
- npm/pnpm: Compatible ✓

### ⚠️ Changes Required
1. **Package Consolidation**: Some addons may be moved to core
2. **Test Addon**: May need to migrate from test-runner to addon-vitest
3. **Story Format**: Already using CSF 3.0 format ✓

### 🔍 Areas to Review
1. Custom webpack/vite configurations
2. Addon compatibility
3. Story parameters and decorators
4. Build process integration

## Migration Steps

### Phase 1: Pre-Migration Preparation

#### 1.1 Backup Current State
```bash
# Create backup branch
git checkout -b backup/storybook-v8-config

# Document current working state
pnpm storybook:build
# Verify build success and document any warnings
```

#### 1.2 Audit Story Files
- Total stories to migrate: **51 story files**
- Story format: CSF 3.0 (no migration needed)
- Custom decorators: Review preview.ts for compatibility

#### 1.3 Document Current Functionality
- [ ] Screenshot current Storybook UI
- [ ] Document addon configurations
- [ ] Note custom viewport sizes
- [ ] Record accessibility test configurations

### Phase 2: Migration Execution

#### 2.1 Update Dependencies
```bash
# Run automatic upgrade
cd packages/frontend
npx storybook@latest upgrade

# Expected changes:
# - Update all @storybook/* packages to v9
# - Update storybook CLI to v9
# - Possible addon consolidation
```

#### 2.2 Configuration Migration

**main.ts updates:**
```typescript
// Review and update if needed:
// - stories patterns (should remain compatible)
// - addon configurations
// - viteFinal configuration
// - typescript options
```

**preview.ts updates:**
```typescript
// Review and update:
// - parameters structure
// - decorator syntax
// - global types
// - viewport configurations
```

#### 2.3 Addon Compatibility Check
- [ ] Verify @storybook/addon-a11y compatibility
- [ ] Check if addon-essentials includes all needed features
- [ ] Update eslint-plugin-storybook to v9 compatible version
- [ ] Test custom background presets

### Phase 3: Testing and Validation

#### 3.1 Functionality Testing
```bash
# Start development server
pnpm storybook

# Test each category:
# - atoms (12 stories)
# - molecules (10 stories)
# - organisms (4 stories)
# - components (20 stories)
# - pages (2 stories)
# - views (3 stories)
```

#### 3.2 Build Verification
```bash
# Production build
pnpm storybook:build

# Verify output size and structure
# Test served static build
```

#### 3.3 Regression Testing Checklist
- [ ] Controls addon working for all stories
- [ ] Viewport switching functional
- [ ] Accessibility tests running
- [ ] Background switcher operational
- [ ] Documentation auto-generated
- [ ] Dark theme stories rendering correctly
- [ ] No console errors or warnings

### Phase 4: Post-Migration Cleanup

#### 4.1 Update Documentation
- Update README with new Storybook version
- Document any configuration changes
- Update developer onboarding docs

#### 4.2 CI/CD Updates
- Verify GitHub Actions compatibility
- Update Docker configurations if needed
- Test deployment pipeline

## Risk Mitigation

### Potential Issues and Solutions

1. **Addon Incompatibility**
   - Solution: Find v9 compatible alternatives or update custom implementations

2. **Build Performance Regression**
   - Solution: Profile build times and optimize Vite configuration

3. **Story Rendering Issues**
   - Solution: Debug with React DevTools and Storybook's debug mode

4. **TypeScript Errors**
   - Solution: Update type definitions and story types

## Rollback Plan

If critical issues arise:
```bash
# Revert to backup branch
git checkout backup/storybook-v8-config

# Restore dependencies
pnpm install --frozen-lockfile

# Verify functionality
pnpm storybook
```

## Success Criteria

- [ ] All 51 stories load without errors
- [ ] Build completes successfully
- [ ] No regression in development experience
- [ ] All addons functional
- [ ] Performance metrics equal or better
- [ ] Zero console errors in production build

## Timeline Estimate

- **Phase 1**: 1-2 hours (preparation and backup)
- **Phase 2**: 2-3 hours (migration execution)
- **Phase 3**: 2-3 hours (testing and validation)
- **Phase 4**: 1 hour (cleanup and documentation)

**Total**: 6-9 hours

## Recommendations

1. **Schedule**: Perform migration during low-activity period
2. **Team Communication**: Notify team before starting
3. **Incremental Approach**: Test each phase before proceeding
4. **Documentation**: Keep detailed notes of any issues encountered

## Next Steps

After completing this migration plan:
1. Execute subtask 5.2: Upgrade dependencies
2. Execute subtask 5.3: Update story files and rebuild documentation

---

*Document prepared on: November 27, 2024*
*Prepared for: Task 5.1 - Storybook v8 to v9 Migration Planning*