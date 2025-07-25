# Task Master UI - Quick Reference Guide

## 🚀 Common Commands

```bash
# Development
pnpm dev                    # Start both frontend and backend
pnpm dev:frontend          # Start frontend only
pnpm dev:backend           # Start backend only

# Testing
pnpm test                  # Run all tests
pnpm run type-check        # Check TypeScript types
pnpm lint                  # Run ESLint
pnpm lint:fix             # Fix ESLint issues

# Building
pnpm build                 # Build for production
pnpm storybook            # Start Storybook

# Git Hooks (automatic)
# Pre-commit: Runs lint-staged and type-check
# Commit-msg: Validates conventional commit format
```

## 📝 Component Template

```typescript
// MyComponent.tsx
interface MyComponentProps {
  title: string;
  onAction: () => void;
  isActive?: boolean;
}

const MyComponent = ({ title, onAction, isActive = false }: MyComponentProps) => {
  return (
    <div className={`component ${isActive ? 'active' : ''}`}>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default MyComponent;
```

## ⚠️ Common Gotchas

### ❌ Don't use React.FC
```typescript
// Bad
const Component: React.FC<Props> = ({ prop }) => { /* ... */ };

// Good
const Component = ({ prop }: Props) => { /* ... */ };
```

### ❌ Don't ignore TypeScript errors
```typescript
// Bad
// @ts-ignore
const value = someObject.undefinedProperty;

// Good
const value = someObject?.undefinedProperty ?? defaultValue;
```

### ❌ Don't use any type
```typescript
// Bad
const processData = (data: any) => { /* ... */ };

// Good
const processData = (data: ProcessedData) => { /* ... */ };
```

## 🔧 Troubleshooting

### TypeScript Errors
```bash
# Check all TypeScript errors
pnpm run type-check

# Check specific package
cd packages/frontend && pnpm exec tsc --noEmit
```

### ESLint Issues
```bash
# See all ESLint warnings/errors
pnpm lint

# Auto-fix what's possible
pnpm lint:fix

# Check React.FC usage
pnpm lint | grep "React.FC"
```

### Pre-commit Hook Failures
```bash
# Skip hooks temporarily (emergency only!)
git commit --no-verify -m "fix: emergency fix"

# Debug hook issues
pnpm exec lint-staged --debug
```

## 📋 Commit Message Examples

```bash
# Features
git commit -m "feat(auth): add password reset functionality"
git commit -m "feat(ui): implement dark mode toggle"

# Fixes
git commit -m "fix(api): resolve timeout issue in task fetching"
git commit -m "fix(types): correct User interface definition"

# Refactoring
git commit -m "refactor(components): migrate Button away from React.FC"
git commit -m "refactor(hooks): simplify useAuth implementation"

# Documentation
git commit -m "docs: update API endpoint documentation"
git commit -m "docs: add troubleshooting section to README"
```

## 🎯 Quick Checks Before Committing

1. ✅ No TypeScript errors: `pnpm run type-check`
2. ✅ No ESLint errors: `pnpm lint`
3. ✅ Tests pass: `pnpm test`
4. ✅ Commit message follows convention: `type(scope): description`

## 🔗 Useful Links

- [Full Coding Standards](./CODING_STANDARDS.md)
- [TypeScript Config](../tsconfig.json)
- [ESLint Config](../packages/frontend/eslint.config.js)
- [Project README](../README.md)