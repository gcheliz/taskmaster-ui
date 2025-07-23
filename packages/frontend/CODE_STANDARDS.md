# Frontend Code Standards

## TypeScript Guidelines

### General Rules
- **Always use TypeScript** for new files
- **Enable strict mode** in TypeScript configuration
- **Avoid `any` type** - use `unknown` or proper typing instead
- **Prefer interfaces over types** for object definitions
- **Use type inference** where possible, but be explicit for public APIs

### Naming Conventions
- **Interfaces**: PascalCase with descriptive names (e.g., `UserProfile`, `TaskListProps`)
- **Types**: PascalCase for type aliases (e.g., `TaskStatus`, `ApiResponse`)
- **Enums**: PascalCase for enum names, UPPER_CASE for values
- **Functions**: camelCase for functions and methods
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Files**: kebab-case for file names, except components (PascalCase)

### Type Definitions
```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

type UserRole = 'admin' | 'user' | 'guest'

// ❌ Bad
interface user {
  id: any
  Name: string
  email_address: string
}
```

## React Component Guidelines

### Component Structure
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'

// 2. Type definitions
interface ComponentProps {
  title: string
  onAction?: () => void
}

// 3. Component definition
export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction 
}) => {
  // 4. Hooks
  const [state, setState] = useState(false)
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // 6. Handlers
  const handleClick = () => {
    onAction?.()
  }
  
  // 7. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}

// 8. Display name (for debugging)
Component.displayName = 'Component'
```

### Component Best Practices
- **Use functional components** with hooks
- **Memoize expensive computations** with `useMemo`
- **Memoize callbacks** with `useCallback` when passed to child components
- **Use `React.FC` or explicit return types** for components
- **Destructure props** in function parameters
- **Keep components focused** - single responsibility principle

## State Management

### Local State
```typescript
// ✅ Good - Type your state
const [user, setUser] = useState<User | null>(null)
const [isLoading, setIsLoading] = useState(false) // Type inference

// ❌ Bad - Avoid any
const [data, setData] = useState<any>(null)
```

### Context Usage
```typescript
// ✅ Good - Typed context
interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

## Styling Guidelines

### Tailwind CSS
- **Use Tailwind utilities** as the primary styling method
- **Use `cn()` utility** for conditional classes
- **Group related utilities** for readability
- **Extract complex styles** to component variants

```typescript
// ✅ Good
<div className={cn(
  'flex items-center justify-between',
  'px-4 py-2',
  'bg-white border border-gray-200 rounded-lg',
  'hover:shadow-md transition-shadow',
  isActive && 'border-primary-500 shadow-lg'
)} />

// ❌ Bad
<div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow" />
```

## File Organization

### Directory Structure
```
src/
├── components/
│   ├── ui/           # Base UI components
│   ├── layouts/      # Layout components
│   ├── features/     # Feature-specific components
│   └── common/       # Shared components
├── hooks/            # Custom hooks
├── utils/            # Utility functions
├── services/         # API services
├── types/            # TypeScript type definitions
├── contexts/         # React contexts
├── routes/           # Routing configuration
└── pages/            # Page components
```

### Import Order
1. External dependencies
2. Internal aliases (@components, @utils, etc.)
3. Relative imports
4. Style imports

```typescript
// External
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Internal aliases
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

// Relative imports
import { localHelper } from './helpers'

// Styles
import styles from './Component.module.css'
```

## Testing Standards

### Test File Naming
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `FeatureName.integration.test.tsx`
- E2E tests: `scenario.e2e.test.ts`

### Test Structure
```typescript
describe('Component', () => {
  // Setup
  beforeEach(() => {
    // Setup code
  })

  // Group related tests
  describe('when condition', () => {
    it('should behavior', () => {
      // Arrange
      const props = { title: 'Test' }
      
      // Act
      const { getByText } = render(<Component {...props} />)
      
      // Assert
      expect(getByText('Test')).toBeInTheDocument()
    })
  })
})
```

## Performance Guidelines

### Code Splitting
- **Lazy load routes** with React.lazy()
- **Lazy load heavy components** that aren't immediately visible
- **Use Suspense** with appropriate loading states

### Optimization
- **Memoize expensive renders** with React.memo
- **Use virtual scrolling** for long lists
- **Optimize images** with appropriate formats and sizes
- **Debounce/throttle** event handlers when appropriate

## Accessibility Standards

### ARIA Guidelines
- **Use semantic HTML** elements
- **Add ARIA labels** for interactive elements
- **Ensure keyboard navigation** works properly
- **Test with screen readers**

```typescript
// ✅ Good
<button
  onClick={handleClick}
  aria-label="Close dialog"
  aria-pressed={isPressed}
>
  <CloseIcon />
</button>

// ❌ Bad
<div onClick={handleClick}>
  <CloseIcon />
</div>
```

## Error Handling

### Component Error Boundaries
```typescript
// Use error boundaries for component trees
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComponentTree />
</ErrorBoundary>
```

### Async Error Handling
```typescript
// ✅ Good
try {
  const data = await fetchData()
  setData(data)
} catch (error) {
  console.error('Failed to fetch data:', error)
  setError(error instanceof Error ? error.message : 'Unknown error')
}

// ❌ Bad
fetchData().then(setData) // No error handling
```

## Git Commit Standards

### Commit Message Format
```
[Task#] type(scope): description

- Additional details
- More context if needed
```

Types: feat, fix, docs, style, refactor, test, chore

### Examples
```
[65.5] feat(ui): add Button component with variants
[65.5] fix(routing): resolve navigation loop in protected routes
[65.5] docs(standards): add TypeScript coding guidelines
```