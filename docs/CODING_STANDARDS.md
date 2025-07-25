# Task Master UI - Coding Standards

This document outlines the coding standards and best practices for the Task Master UI project. All contributors should follow these guidelines to maintain code quality and consistency.

## Table of Contents

1. [TypeScript Standards](#typescript-standards)
2. [React Component Patterns](#react-component-patterns)
3. [Code Style Guidelines](#code-style-guidelines)
4. [File Organization](#file-organization)
5. [Testing Standards](#testing-standards)
6. [Git Workflow](#git-workflow)

## TypeScript Standards

### Strict Mode Configuration

All TypeScript code must be written with strict mode enabled. Our `tsconfig.json` enforces the following flags:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Type Annotations

#### ✅ DO: Use explicit types for function parameters and return values

```typescript
// Good
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Good - arrow function with explicit typing
const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};
```

#### ❌ DON'T: Rely on implicit any types

```typescript
// Bad - implicit any
function processData(data) {
  return data.map(item => item.value);
}

// Bad - missing return type
const getValue = (obj: Record<string, unknown>) => {
  return obj.value;
};
```

### Null and Undefined Handling

#### ✅ DO: Use optional chaining and nullish coalescing

```typescript
// Good
const userName = user?.profile?.name ?? 'Anonymous';
const isActive = settings?.features?.darkMode ?? false;

// Good - type guards
function isValidUser(user: User | null): user is User {
  return user !== null && typeof user.id === 'string';
}
```

#### ❌ DON'T: Use loose equality checks or ignore null checks

```typescript
// Bad
if (user.profile.name) { // Could throw if user or profile is null
  console.log(user.profile.name);
}

// Bad - loose equality
if (value == null) { // Use === instead
  return default;
}
```

## React Component Patterns

### Component Definitions

#### ✅ DO: Use arrow functions with explicit prop types

```typescript
// Good - Simple component
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// Good - Component with children
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card = ({ title, children, className }: CardProps) => {
  return (
    <div className={className}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

#### ❌ DON'T: Use React.FC or React.FunctionComponent

```typescript
// Bad - deprecated pattern
const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

// Bad - React.FunctionComponent
const Card: React.FunctionComponent<CardProps> = (props) => {
  return <div>{props.children}</div>;
};
```

### Hooks Usage

#### ✅ DO: Type hooks properly

```typescript
// Good - useState with explicit type
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// Good - custom hook with return type
function useAuth(): {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
} {
  // Implementation
}

// Good - useEffect with cleanup
useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 1000);

  return () => clearTimeout(timer);
}, []);
```

#### ❌ DON'T: Use untyped state or ignore hook dependencies

```typescript
// Bad - untyped state
const [data, setData] = useState();

// Bad - missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// Bad - any type in hooks
const [items, setItems] = useState<any[]>([]);
```

## Code Style Guidelines

### Import Organization

Imports should be organized in the following order:

1. React imports
2. Third-party library imports
3. Internal imports (components, hooks, utils, etc.)
4. Type imports

```typescript
// Good
import { useState, useEffect } from 'react';

import { motion } from 'framer-motion';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/date';

import type { User, Task } from '@/types';
```

### Variable and Function Naming

- Use camelCase for variables and functions
- Use PascalCase for components and types
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that explain purpose

```typescript
// Good
const userProfile = await fetchUserProfile(userId);
const MAX_RETRY_ATTEMPTS = 3;
const isValidEmail = (email: string): boolean => { /* ... */ };

interface UserProfile {
  id: string;
  name: string;
  email: string;
}
```

### Error Handling

#### ✅ DO: Handle errors explicitly

```typescript
// Good
try {
  const data = await api.fetchTasks();
  setTasks(data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    setError(error.message);
  } else {
    console.error('Unexpected error:', error);
    setError('An unexpected error occurred');
  }
}

// Good - type-safe error handling
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}
```

## File Organization

### Directory Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── features/       # Feature-specific components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── contexts/           # React contexts
├── pages/              # Page components
└── config/             # Configuration files
```

### Component File Structure

Each component should have:
- Component file (`.tsx`)
- Test file (`.test.tsx`)
- Storybook file (`.stories.tsx`) for UI components
- Style module (`.module.css`) if needed

```
Button/
├── Button.tsx
├── Button.test.tsx
├── Button.stories.tsx
└── Button.module.css
```

## Testing Standards

### Unit Tests

```typescript
// Good - comprehensive test
describe('Button', () => {
  it('should render with label', () => {
    render(<Button label="Click me" onClick={jest.fn()} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button label="Click me" onClick={jest.fn()} disabled />);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Integration Tests

```typescript
// Good - test user interactions
describe('TaskForm', () => {
  it('should create a new task', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={jest.fn()} />);

    await user.type(screen.getByLabelText('Title'), 'New Task');
    await user.type(screen.getByLabelText('Description'), 'Task description');
    await user.click(screen.getByText('Create Task'));

    expect(screen.getByText('Task created successfully')).toBeInTheDocument();
  });
});
```

## Git Workflow

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or corrections
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes

Examples:
```bash
feat(auth): add social login support
fix(tasks): resolve sorting issue in task list
docs: update installation instructions
refactor(components): migrate Button to new pattern
```

### Pre-commit Hooks

Our Husky pre-commit hooks will:
1. Run ESLint to check code style
2. Run Prettier to format code
3. Run TypeScript compiler to check types
4. Validate commit message format

### Pull Request Guidelines

1. Create feature branches from `main`
2. Name branches as `feature/description` or `fix/description`
3. Keep PRs focused on a single concern
4. Include tests for new functionality
5. Update documentation as needed
6. Ensure all checks pass before requesting review

## ESLint Configuration

Key ESLint rules enforced:

```javascript
{
  // TypeScript rules
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/explicit-function-return-type': 'warn',
  '@typescript-eslint/no-unused-vars': 'warn',
  
  // React rules
  'no-restricted-syntax': [
    'error',
    {
      selector: 'TSTypeReference[typeName.name="FC"]',
      message: 'Avoid using React.FC. Use explicit typing for props instead.'
    }
  ],
  'react/function-component-definition': ['error', {
    namedComponents: 'arrow-function',
    unnamedComponents: 'arrow-function'
  }],
  
  // General rules
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'prefer-const': 'error',
  'no-unused-expressions': 'error'
}
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Last updated: July 2025